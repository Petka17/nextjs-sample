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
