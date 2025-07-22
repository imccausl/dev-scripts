type DeepMerge<T, U> = {
  [K in keyof (T & U)]: K extends keyof T
    ? K extends keyof U
      ? T[K] extends object
        ? U[K] extends object
          ? DeepMerge<T[K], U[K]>
          : U[K]
        : U[K]
      : T[K]
    : K extends keyof U
      ? U[K]
      : never
}

type DeepMergeAll<T extends readonly unknown[]> = T extends readonly [
  infer First,
  ...infer Rest,
]
  ? Rest extends readonly []
    ? First
    : DeepMerge<First, DeepMergeAll<Rest>>
  : unknown

export const deepMerge = <T extends Record<string, unknown>[]>(
  ...objects: T
): DeepMergeAll<T> => {
  return objects.reduce<Record<string, unknown>>((prev, obj) => {
    Object.keys(obj as Record<string, unknown>).forEach((key) => {
      const pVal = (prev as Record<string, unknown>)[key]
      const oVal = (obj as Record<string, unknown>)[key]

      if (Array.isArray(pVal) && Array.isArray(oVal)) {
        ;(prev as Record<string, unknown>)[key] = pVal.concat(...oVal)
      } else if (
        pVal &&
        oVal &&
        typeof pVal === 'object' &&
        typeof oVal === 'object'
      ) {
        ;(prev as Record<string, unknown>)[key] = deepMerge(
          pVal as Record<string, unknown>,
          oVal as Record<string, unknown>,
        )
      } else {
        ;(prev as Record<string, unknown>)[key] = oVal
      }
    })
    return prev
  }, {}) as DeepMergeAll<T>
}
