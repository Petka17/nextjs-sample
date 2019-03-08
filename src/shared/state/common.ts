export interface BaseAction {
  type: string;
}

type DeepReadOnlyObject<T> = { readonly [K in keyof T]: DeepReadOnly<T[K]> };

export type DeepReadOnly<T> = T extends (infer E)[][]
  ? ReadonlyArray<ReadonlyArray<DeepReadOnlyObject<E>>>
  : T extends (infer E)[]
  ? ReadonlyArray<DeepReadOnlyObject<E>>
  : T extends object
  ? DeepReadOnlyObject<T>
  : T;

export class UnreachableError extends Error {
  /* istanbul ignore next */ constructor(val: never, message: string) {
    super(`TypeScript thought we could never end up here\n${message}`);
    console.error(val);
  }
}
