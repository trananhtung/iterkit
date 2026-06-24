/**
 * Lazy iterable utilities — all return generators (no materialization).
 */

/** Yield integers from start to stop (exclusive) with optional step. */
export function* range(startOrStop: number, stop?: number, step = 1): Iterable<number> {
  const [lo, hi] = stop === undefined ? [0, startOrStop] : [startOrStop, stop];
  if (step === 0) throw new RangeError("range() step cannot be zero");
  if (step > 0) { for (let i = lo; i < hi; i += step) yield i; }
  else           { for (let i = lo; i > hi; i += step) yield i; }
}

/** Concatenate multiple iterables in sequence. */
export function* chain<T>(...iterables: Iterable<T>[]): Iterable<T> {
  for (const it of iterables) yield* it;
}

/** Zip iterables together, stopping at the shortest. */
export function* zip<T extends unknown[]>(
  ...iterables: { [K in keyof T]: Iterable<T[K]> }
): Iterable<T> {
  const iters = iterables.map(it => it[Symbol.iterator]());
  while (true) {
    const results = iters.map(it => it.next());
    if (results.some(r => r.done)) return;
    yield results.map(r => r.value) as unknown as T;
  }
}

/** Zip iterables, padding shorter ones with `fill` (default undefined). */
export function* zipLongest<T>(
  fill: T | undefined,
  ...iterables: Iterable<T>[]
): Iterable<(T | undefined)[]> {
  const iters = iterables.map(it => it[Symbol.iterator]());
  while (true) {
    const results = iters.map(it => it.next());
    if (results.every(r => r.done)) return;
    yield results.map(r => r.done ? fill : r.value);
  }
}

/** Yield [index, value] pairs, starting at `start` (default 0). */
export function* enumerate<T>(it: Iterable<T>, start = 0): Iterable<[number, T]> {
  let i = start;
  for (const v of it) yield [i++, v];
}

/** Yield the first `n` items. */
export function* take<T>(it: Iterable<T>, n: number): Iterable<T> {
  let i = 0;
  for (const v of it) { if (i++ >= n) return; yield v; }
}

/** Skip the first `n` items. */
export function* drop<T>(it: Iterable<T>, n: number): Iterable<T> {
  let i = 0;
  for (const v of it) { if (i++ < n) continue; yield v; }
}

/** Yield items while predicate is true. */
export function* takeWhile<T>(it: Iterable<T>, pred: (v: T) => boolean): Iterable<T> {
  for (const v of it) { if (!pred(v)) return; yield v; }
}

/** Skip items while predicate is true. */
export function* dropWhile<T>(it: Iterable<T>, pred: (v: T) => boolean): Iterable<T> {
  let dropping = true;
  for (const v of it) {
    if (dropping && pred(v)) continue;
    dropping = false;
    yield v;
  }
}

/** Split into non-overlapping chunks of size `n`. Last chunk may be smaller. */
export function* chunked<T>(it: Iterable<T>, n: number): Iterable<T[]> {
  if (n <= 0) throw new RangeError("chunked() size must be > 0");
  let chunk: T[] = [];
  for (const v of it) {
    chunk.push(v);
    if (chunk.length === n) { yield chunk; chunk = []; }
  }
  if (chunk.length) yield chunk;
}

/** Yield overlapping windows of size `n`, advancing by `step` (default 1). */
export function* sliding<T>(it: Iterable<T>, n: number, step = 1): Iterable<T[]> {
  if (n <= 0) throw new RangeError("sliding() size must be > 0");
  if (step <= 0) throw new RangeError("sliding() step must be > 0");
  const buf: T[] = [];
  let i = 0;
  for (const v of it) {
    buf.push(v);
    if (buf.length === n) {
      yield [...buf];
      for (let s = 0; s < step; s++) buf.shift();
      i++;
    }
  }
}

/** Yield consecutive pairs: [a,b], [b,c], [c,d], … */
export function* pairwise<T>(it: Iterable<T>): Iterable<[T, T]> {
  let prev: T | typeof UNSET = UNSET;
  for (const v of it) {
    if (prev !== UNSET) yield [prev, v];
    prev = v;
  }
}
const UNSET = Symbol("UNSET");

/** Flatten one level of nested iterables. */
export function* flatten<T>(it: Iterable<Iterable<T>>): Iterable<T> {
  for (const inner of it) yield* inner;
}

/** Map then flatten one level. */
export function* flatMap<T, U>(it: Iterable<T>, fn: (v: T, i: number) => Iterable<U>): Iterable<U> {
  let i = 0;
  for (const v of it) yield* fn(v, i++);
}

/** Map with index. */
export function* map<T, U>(it: Iterable<T>, fn: (v: T, i: number) => U): Iterable<U> {
  let i = 0;
  for (const v of it) yield fn(v, i++);
}

/** Filter with predicate. */
export function* filter<T>(it: Iterable<T>, pred: (v: T, i: number) => boolean): Iterable<T> {
  let i = 0;
  for (const v of it) { if (pred(v, i++)) yield v; }
}

/** Cycle through the iterable indefinitely (or `times` repetitions). */
export function* cycle<T>(it: Iterable<T>, times?: number): Iterable<T> {
  const buf: T[] = [];
  for (const v of it) { buf.push(v); yield v; }
  if (!buf.length) return;
  let t = 1;
  while (times === undefined || t++ < times) yield* buf;
}

/** Repeat a value `n` times (or indefinitely). */
export function* repeat<T>(value: T, times?: number): Iterable<T> {
  if (times === undefined) { while (true) yield value; }
  else { for (let i = 0; i < times; i++) yield value; }
}

/** Interleave iterables round-robin until all are exhausted. */
export function* roundRobin<T>(...iterables: Iterable<T>[]): Iterable<T> {
  const iters = iterables.map(it => it[Symbol.iterator]());
  const active = new Array(iters.length).fill(true);
  let any = true;
  while (any) {
    any = false;
    for (let i = 0; i < iters.length; i++) {
      if (!active[i]) continue;
      const r = iters[i].next();
      if (r.done) { active[i] = false; continue; }
      any = true;
      yield r.value;
    }
  }
}

/** Cartesian product of two iterables. */
export function* product<A, B>(a: Iterable<A>, b: Iterable<B>): Iterable<[A, B]> {
  const bArr = [...b];
  for (const av of a) for (const bv of bArr) yield [av, bv];
}

/** Yield unique values (by value equality, via Set). */
export function* uniq<T>(it: Iterable<T>): Iterable<T> {
  const seen = new Set<T>();
  for (const v of it) { if (!seen.has(v)) { seen.add(v); yield v; } }
}

/** Yield unique values by key function. */
export function* uniqBy<T, K>(it: Iterable<T>, keyFn: (v: T) => K): Iterable<T> {
  const seen = new Set<K>();
  for (const v of it) {
    const k = keyFn(v);
    if (!seen.has(k)) { seen.add(k); yield v; }
  }
}
