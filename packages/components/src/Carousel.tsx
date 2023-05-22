import React from "react";
import {
  StyleSheet,
  useWindowDimensions,
  ScrollView as ScrollViewType,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from "react-native";

import { ScrollView, View } from "native-base";
import { Carousel as CarouselDefinition } from ".";
import { Static } from "@sinclair/typebox";

type T = Static<typeof CarouselDefinition.inputs>;

export const Carousel: React.FC<React.PropsWithChildren<T>> = ({
  children,
  ...rest
}) => {
  const { width } = useWindowDimensions();
  const [currentIndex, setCurrentIndex] = React.useState<number>(0);

  const {
    isLoop,
    isAutoPlay,
    containerStyle,
    contentContainerStyle,
    dotContainerStyle,
    dotStyle,
  } = rest;

  const childrens = React.Children.map(children, (child) => child) || [];
  const [dataState, setDataState] = React.useState(childrens);

  const ref = React.useRef<ScrollViewType | null>(null);

  React.useEffect(() => {
    if (childrens.length > 1 && isLoop) {
      setDataState([
        childrens[childrens.length - 1],
        ...childrens,
        childrens[0],
      ]);
    }
  }, []);

  const scrollToIndex = (x: number, y: number, animated = true) => {
    ref.current?.scrollTo({ x, y, animated });
  };

  const onScrollHandler = React.useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { x } = event.nativeEvent.contentOffset;
      const index = x / width;
      const indexRound = Math.round(index);
      if (indexRound % 1 === 0) {
        if (isLoop) {
          if (indexRound === childrens.length + 1) {
            setCurrentIndex(0);
          } else if (indexRound === 0) {
            setCurrentIndex(childrens.length - 1);
          } else {
            setCurrentIndex(indexRound - 1);
          }
          if (index >= childrens.length + 1) {
            scrollToIndex(width, 0, false);
          } else if (index <= 0) {
            scrollToIndex(width * childrens.length, 0, false);
          }
        } else {
          setCurrentIndex(indexRound);
        }
      }
    },
    [width, ref.current?.scrollTo, childrens, scrollToIndex, isLoop]
  );

  React.useEffect(() => {
    if (isAutoPlay) {
      const interval = setInterval(() => {
        scrollToIndex(width * (currentIndex + 2), 0, true);
      }, 1000);

      return () => {
        clearInterval(interval);
      };
    } else {
      return;
    }
  }, [width, currentIndex, scrollToIndex]);

  return (
    <View style={{ ...styles.container, ...containerStyle }}>
      <View style={{ height: 300, ...contentContainerStyle }}>
        <ScrollView
          ref={ref}
          horizontal={true}
          pagingEnabled
          scrollEventThrottle={8}
          showsHorizontalScrollIndicator={false}
          onScroll={onScrollHandler}
          decelerationRate="fast"
          snapToInterval={width}
          contentOffset={{ x: isLoop ? width : 0, y: 0 }}
        >
          {dataState.map((data, index) => {
            return (
              <View style={{ width }} key={index}>
                {data}
              </View>
            );
          })}
        </ScrollView>
      </View>
      <View style={{ ...styles.dotsContainer, ...dotContainerStyle }}>
        {childrens.map((_data, index) => {
          return (
            <View
              style={{
                ...styles.dots,
                opacity: index === currentIndex ? 1 : 0.5,
                ...dotStyle,
              }}
              key={index}
            />
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  dots: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
    backgroundColor: "#065FF0",
  },
});
