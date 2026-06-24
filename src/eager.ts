/**
 * Eager iterable utilities — consume the iterable and return a result.
 */

/** Collect iterable to array (alias for Array.from, typed). */
export function collect<T>(it: Iterable<T>): T[] {
  return Array.from(it);
}

/** Return the first element, or undefined. */
export function first<T>(it: Iterable<T>): T | undefined {
  for (const v of it) return v;
  return undefined;
}

/** Return the last element, or undefined. */
export function last<T>(it: Iterable<T>): T | undefined {
  let result: T | undefined;
  for (const v of it) result = v;
  return result;
}

/** Return the nth element (0-indexed), or undefined. */
export function nth<T>(it: Iterable<T>, n: number): T | undefined {
  let i = 0;
  for (const v of it) { if (i++ === n) return v; }
  return undefined;
}

/** Return true if the iterable has no elements. */
export function isEmpty(it: Iterable<unknown>): boolean {
  for (const _ of it) return false;
  return true;
}

/** Consume all elements (useful for side-effectful generators). */
export function consume(it: Iterable<unknown>): void {
  for (const _ of it) {}
}

/** Count elements. */
export function count(it: Iterable<unknown>): number {
  let n = 0;
  for (const _ of it) n++;
  return n;
}

/** Sum a numeric iterable. */
export function sum(it: Iterable<number>): number {
  let total = 0;
  for (const v of it) total += v;
  return total;
}

/** Return the minimum value, or undefined for empty. */
export function min(it: Iterable<number>): number | undefined {
  let result: number | undefined;
  for (const v of it) result = result === undefined ? v : Math.min(result, v);
  return result;
}

/** Return the maximum value, or undefined for empty. */
export function max(it: Iterable<number>): number | undefined {
  let result: number | undefined;
  for (const v of it) result = result === undefined ? v : Math.max(result, v);
  return result;
}

/** Return the element with minimum key, or undefined for empty. */
export function minBy<T>(it: Iterable<T>, keyFn: (v: T) => number): T | undefined {
  let result: T | undefined;
  let minKey = Infinity;
  for (const v of it) {
    const k = keyFn(v);
    if (k < minKey) { minKey = k; result = v; }
  }
  return result;
}

/** Return the element with maximum key, or undefined for empty. */
export function maxBy<T>(it: Iterable<T>, keyFn: (v: T) => number): T | undefined {
  let result: T | undefined;
  let maxKey = -Infinity;
  for (const v of it) {
    const k = keyFn(v);
    if (k > maxKey) { maxKey = k; result = v; }
  }
  return result;
}

/** Reduce to a single value. */
export function reduce<T, U>(it: Iterable<T>, fn: (acc: U, v: T, i: number) => U, initial: U): U {
  let acc = initial;
  let i = 0;
  for (const v of it) acc = fn(acc, v, i++);
  return acc;
}

/** Partition into [truthy, falsy] arrays. */
export function partition<T>(it: Iterable<T>, pred: (v: T) => boolean): [T[], T[]] {
  const yes: T[] = [], no: T[] = [];
  for (const v of it) (pred(v) ? yes : no).push(v);
  return [yes, no];
}

/** Group by key function into a Map. */
export function groupBy<T, K>(it: Iterable<T>, keyFn: (v: T) => K): Map<K, T[]> {
  const map = new Map<K, T[]>();
  for (const v of it) {
    const k = keyFn(v);
    const bucket = map.get(k);
    if (bucket) bucket.push(v);
    else map.set(k, [v]);
  }
  return map;
}

/** Sort by key function (returns new array). */
export function sortedBy<T>(
  it: Iterable<T>,
  keyFn: (v: T) => number | string,
  reverse = false
): T[] {
  const arr = [...it];
  arr.sort((a, b) => {
    const ka = keyFn(a), kb = keyFn(b);
    const cmp = ka < kb ? -1 : ka > kb ? 1 : 0;
    return reverse ? -cmp : cmp;
  });
  return arr;
}

/** Return true if every element satisfies the predicate. */
export function every<T>(it: Iterable<T>, pred: (v: T) => boolean): boolean {
  for (const v of it) { if (!pred(v)) return false; }
  return true;
}

/** Return true if any element satisfies the predicate. */
export function some<T>(it: Iterable<T>, pred: (v: T) => boolean): boolean {
  for (const v of it) { if (pred(v)) return true; }
  return false;
}

/** Find first element satisfying predicate, or undefined. */
export function find<T>(it: Iterable<T>, pred: (v: T) => boolean): T | undefined {
  for (const v of it) { if (pred(v)) return v; }
  return undefined;
}

/** Find index of first element satisfying predicate, or -1. */
export function findIndex<T>(it: Iterable<T>, pred: (v: T) => boolean): number {
  let i = 0;
  for (const v of it) { if (pred(v)) return i; i++; }
  return -1;
}

/** Execute callback for each element. */
export function forEach<T>(it: Iterable<T>, fn: (v: T, i: number) => void): void {
  let i = 0;
  for (const v of it) fn(v, i++);
}

/** Return frequency map (element → count). */
export function frequencies<T>(it: Iterable<T>): Map<T, number> {
  const map = new Map<T, number>();
  for (const v of it) map.set(v, (map.get(v) ?? 0) + 1);
  return map;
}

/** Return frequency map by key function. */
export function frequenciesBy<T, K>(it: Iterable<T>, keyFn: (v: T) => K): Map<K, number> {
  const map = new Map<K, number>();
  for (const v of it) {
    const k = keyFn(v);
    map.set(k, (map.get(k) ?? 0) + 1);
  }
  return map;
}
