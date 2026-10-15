export const importEsm: <T>(specifier: string) => Promise<T> = new Function(
  'specifier',
  'return import(specifier)',
) as <T>(specifier: string) => Promise<T>;
