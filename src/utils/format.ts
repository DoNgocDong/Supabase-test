// 示例方法，没有实际意义
export function trim(str: string) {
  return str.trim();
}

export function getLastArray<T>(arr: T[]): T | undefined {
  return arr.length > 0 ? arr[arr.length - 1] : undefined;
}