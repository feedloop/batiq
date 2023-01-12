type Prev = [
  never,
  0,
  1,
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  10,
  11,
  12,
  13,
  14,
  15,
  16,
  17,
  18,
  19,
  20,
  ...0[]
];

type Cons<H, T> = T extends readonly any[]
  ? ((h: H, ...t: T) => void) extends (...r: infer R) => void
    ? R
    : never
  : never;

export type Path<T, D extends number = 10> = [D] extends [never]
  ? never
  : T extends object
  ? {
      [K in keyof T]-?:
        | [K]
        | (Path<T[K], Prev[D]> extends infer P
            ? P extends []
              ? never
              : Cons<K, P>
            : never);
    }[keyof T]
  : [];

export type PathValue<A, K> = K extends []
  ? A
  : K extends [infer P, ...infer R]
  ? P extends keyof A
    ? PathValue<A[P], R>
    : never
  : never;

export type Lens<A, B> = {
  get: (a: A) => B;
  set: (a: A, b: B) => A;
};

export const lens = <A, B>(
  get: (a: A) => B,
  set: (a: A, b: B) => A
): Lens<A, B> => ({ get, set });

export const id = lens(
  (a) => a,
  (a, b) => b
);

export const prop = <A, K extends keyof A>(key: K): Lens<A, A[K]> =>
  lens(
    (a) => a[key],
    (a, b) =>
      Array.isArray(a)
        ? (a.map((v, i) => (i === key ? b : v)) as A)
        : { ...a, [key]: b }
  );

export const compose = <A, B, C>(
  ab: Lens<A, B>,
  bc: Lens<B, C>
): Lens<A, C> => ({
  get: (a) => bc.get(ab.get(a)),
  set: (a, c) => ab.set(a, bc.set(ab.get(a), c)),
});

export const fromPath = <A, P extends Path<A>>(
  typeref: A,
  paths: P
): Lens<A, PathValue<A, P>> =>
  // @ts-ignore
  paths.reduce((lens, path) => compose(lens, prop(path)), id);

export const mod = <A, P extends Path<A>>(
  a: A,
  path: P,
  f: (b: PathValue<A, P>) => PathValue<A, P>
): A => {
  const lens = fromPath(a, path);
  return lens.set(a, f(lens.get(a)));
};
