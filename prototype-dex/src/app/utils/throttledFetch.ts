// utils/throttledFetch.ts
export async function throttledFetch<T>(
  items: string[],
  fetchFn: (item: string) => Promise<T | null>,
  delayMs = 400
): Promise<T[]> {
  const results: T[] = [];
  for (const item of items) {
    // eslint-disable-next-line no-await-in-loop
    const result = await fetchFn(item);
    if (result) results.push(result);
    // eslint-disable-next-line no-await-in-loop
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
  return results;
}
