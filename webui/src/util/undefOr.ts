export type UndefOr<T> = T | undefined;

export const isDefined = <T>(t: UndefOr<T>): t is T => t !== undefined;
export const isUndefined = <T>(t: UndefOr<T>): t is undefined => t === undefined;
export const map = <T, R>(t: UndefOr<T>, f: (t: T) => R): UndefOr<R> => (isDefined(t) ? f(t) : undefined);
export const fold = <T, R>(t: UndefOr<T>, ifUndef: () => R, ifDefined: (t: T) => R): R =>
  isDefined(t) ? ifDefined(t) : ifUndef();
export const foreach = <T>(t: UndefOr<T>, f: (t: T) => void): void => {
  if (isDefined(t)) f(t);
};
