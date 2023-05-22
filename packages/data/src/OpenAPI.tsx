import React from "react";
import { BaseBatiqCore, DataSourceDefinitionSchema } from "@batiq/core";
import { Type, Static } from "@sinclair/typebox";
import OpenAPIClientAxios from "openapi-client-axios";
import { OpenAPIV3 } from "openapi-types";
import { useData } from "@batiq/expo-runtime";
import { URL as URLNative } from "react-native-url-polyfill";
import { Platform } from "react-native";

const queryDefinition = Type.Required(
  Type.Object({
    operationId: Type.String(),
    parameters: Type.Optional(
      Type.Union([
        Type.Record(Type.String(), Type.Any()),
        Type.Array(
          Type.Object({
            name: Type.String(),
            value: Type.Any(),
            in: Type.Union([
              Type.Literal("query"),
              Type.Literal("header"),
              Type.Literal("path"),
              Type.Literal("cookie"),
            ]),
          })
        ),
      ])
    ),
    data: Type.Optional(Type.Any()),
  })
);

export const OpenAPI = async (data: DataSourceDefinitionSchema) => {
  const { definition, auth } = data.config;
  if (!definition) {
    throw new Error("No definition provided");
  }
  const api = new OpenAPIClientAxios({ definition });
  const client = await api.init();

  const { origin } =
    Platform.OS === "web" ? new URL(definition) : new URLNative(definition);

  // eslint-disable-next-line prefer-const
  let { http, apiKey, oauth2, openIdConnect } = auth;

  const [securityName, securityScheme] =
    Object.entries(api.document.components?.securitySchemes || {})
      .filter(
        (entry): entry is [string, OpenAPIV3.SecuritySchemeObject] =>
          !("$ref" in entry[1])
      )
      .find(([, scheme]) =>
        Object.entries({ http, apiKey, oauth2, openIdConnect }).some(
          ([key, value]) => value && scheme.type === key
        )
      ) || [];
  const operationMap: Record<string, OpenAPIV3.OperationObject> =
    Object.fromEntries(
      Object.values(api.document.paths || {}).flatMap((path) =>
        path
          ? Object.values(path).map((operation) =>
              !Array.isArray(operation) && typeof operation === "object"
                ? operation.operationId
                  ? [operation.operationId, operation]
                  : []
                : []
            )
          : []
      )
    );

  return {
    isAuthenticated: async <T extends BaseBatiqCore>(batiq: T) => {
      switch (securityScheme?.type) {
        case "apiKey":
          return apiKey !== undefined
            ? true
            : window?.localStorage.getItem("apiKey");

        case "oauth2":
          return window?.localStorage?.getItem("token") !== null;

        case "openIdConnect":
          return window?.localStorage?.getItem("token") !== null;

        default:
          return true;
      }
    },
    authenticate: async <T extends BaseBatiqCore>(batiq: T, data: any) => {
      switch (securityScheme?.type) {
        case "apiKey": {
          if (apiKey) {
            apiKey = data.apiKey;
            return;
          }
          window?.localStorage.setItem("apiKey", data.apiKey);
          return;
        }

        case "oauth2": {
          const { clientId } = oauth2;
          const { scopes, authorizationUrl = oauth2.authorizationUrl } =
            securityScheme.flows.authorizationCode || {};
          const redirectUri = window.location.origin;
          const url = new URL(authorizationUrl);
          url.searchParams.set("client_id", clientId);
          url.searchParams.set("redirect_uri", redirectUri);
          url.searchParams.set("response_type", "code");
          if (scopes) {
            url.searchParams.set("scope", Object.keys(scopes).join(" "));
          }
          return;
        }

        case "openIdConnect": {
          // Not Implemented
          return;
        }

        default:
          return;
      }
    },
    logout: () => {
      switch (securityScheme?.type) {
        case "apiKey":
          return apiKey !== undefined
            ? true
            : window?.localStorage.removeItem("apiKey");

        case "oauth2":
          return window?.localStorage?.removeItem("token");

        case "openIdConnect":
          return window?.localStorage?.removeItem("token");
      }
    },
    definition: queryDefinition,
    component: (
      props: React.PropsWithChildren<{
        query: Static<typeof queryDefinition>;
        name: string;
      }>
    ) => {
      const operation = operationMap[props.query.operationId];
      if (!operation) {
        throw new Error(`Operation ${props.query.operationId} not found`);
      }

      const config = {
        baseURL: origin + (api.document.servers?.[0]?.url ?? ""),
        headers:
          securityScheme?.type === "apiKey"
            ? { "x-api-key": apiKey }
            : securityScheme?.type === "http"
            ? {
                Authorization: `Bearer ${window?.localStorage?.getItem(
                  "token"
                )}`,
              }
            : {
                Authorization: `Bearer ${window?.localStorage?.getItem(
                  "token"
                )}`,
              },
      };

      const data = useData(
        props.name,
        () =>
          client[props.query.operationId](
            props.query.parameters,
            undefined,
            config
          ).then((response) => response.data),
        [client, props.query, config]
      );
      return props.children;
    },
  };
};
