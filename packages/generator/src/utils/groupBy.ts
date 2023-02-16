export const groupBy = <T, K extends string>(
  condition: (item: T) => K,
  list: T[]
): Record<string, T[]> =>
  list.reduce(
    (carry, item) => ({
      ...carry,
      [condition(item)]: [...(carry[condition(item)] || []), item],
    }),
    {} as Record<string, T[]>
  );
