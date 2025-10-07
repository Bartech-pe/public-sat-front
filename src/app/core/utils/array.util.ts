export const splitBlocks = <T>(array: T[], size: number): T[][] => {
  const blocks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    blocks.push(array.slice(i, i + size));
  }
  return blocks;
};
export function groupBy<T, K extends keyof any>(
  array: T[],
  keyGetter: (item: T) => K
): Record<K, T[]> {
  return array.reduce((result, currentItem) => {
    const key = keyGetter(currentItem);
    if (!result[key]) {
      result[key] = [];
    }
    result[key].push(currentItem);
    return result;
  }, {} as Record<K, T[]>);
}
