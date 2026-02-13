type Awaitable<T> = Promise<T> | T

// https://github.com/antfu/eslint-config/blob/main/src/utils.ts
export async function interopDefault<T>(
  m: Awaitable<T>,
): Promise<T extends { default: infer U } ? U : T> {
  const resolved = await m

  // eslint-disable-next-line typescript/no-unsafe-member-access, typescript/no-unsafe-return, typescript/no-explicit-any
  return (resolved as any).default ?? resolved
}
