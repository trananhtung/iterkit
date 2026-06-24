# iterkit

[![All Contributors](https://img.shields.io/badge/all_contributors-1-orange.svg?style=flat-square)](#contributors-)

Extended iterable utilities for TypeScript/JavaScript. Works with **any** `Iterable<T>` — arrays, generators, Sets, Maps, strings. Lazy generators for zero-copy pipelines. Python's `more-itertools` for the JS ecosystem.

[![npm](https://img.shields.io/npm/v/iterkit)](https://www.npmjs.com/package/iterkit)
[![npm downloads](https://img.shields.io/npm/dw/iterkit)](https://www.npmjs.com/package/iterkit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Why iterkit?

| Library | Problem |
|---------|---------|
| Lodash | Arrays only; materialized; 70kb |
| Ramda | Arrays only; complex API |
| `itertools` npm | Incomplete; outdated |
| `ix` | RxJS-style; heavyweight dependency |
| **iterkit** | Any iterable; lazy generators; zero deps; TypeScript |

## Install

```bash
npm install iterkit
```

## Quick start

```ts
import { range, chunked, zip, groupBy, sum } from "iterkit";

// range + map + sum (lazy pipeline, zero intermediate arrays)
const total = sum(range(1, 101));              // 5050

// chunk array into pages
const pages = [...chunked([1,2,3,4,5], 2)];   // [[1,2],[3,4],[5]]

// zip two iterables
const pairs = [...zip(['a','b','c'], [1,2,3])]; // [['a',1],['b',2],['c',3]]

// group by key
const byLen = groupBy(['cat','dog','elephant','ox'], w => w.length);
// Map { 3 → ['cat','dog'], 8 → ['elephant'], 2 → ['ox'] }
```

## API

### Lazy (generators)

All lazy functions return `Iterable<T>` and evaluate on demand — no intermediate arrays.

#### `range(stop)` / `range(start, stop, step?)`

```ts
[...range(5)]              // [0, 1, 2, 3, 4]
[...range(2, 10, 2)]       // [2, 4, 6, 8]
[...range(5, 0, -1)]       // [5, 4, 3, 2, 1]
```

#### `chain(...iterables)`

```ts
[...chain([1,2], [3,4], [5])]   // [1, 2, 3, 4, 5]
```

#### `zip(...iterables)` — stops at shortest

```ts
[...zip([1,2,3], ['a','b'])]    // [[1,'a'], [2,'b']]
```

#### `zipLongest(fill, ...iterables)` — pads shorter

```ts
[...zipLongest(null, [1,2,3], ['a'])]  // [[1,'a'], [2,null], [3,null]]
```

#### `enumerate(it, start?)`

```ts
[...enumerate(['a','b','c'])]   // [[0,'a'], [1,'b'], [2,'c']]
[...enumerate(['a','b'], 1)]    // [[1,'a'], [2,'b']]
```

#### `take(it, n)` / `drop(it, n)` / `takeWhile(it, pred)` / `dropWhile(it, pred)`

```ts
[...take(range(100), 5)]                   // [0, 1, 2, 3, 4]
[...drop([1,2,3,4,5], 3)]                  // [4, 5]
[...takeWhile([1,2,3,4,5], v => v < 4)]   // [1, 2, 3]
[...dropWhile([1,2,3,4,5], v => v < 3)]   // [3, 4, 5]
```

#### `chunked(it, n)` — non-overlapping chunks

```ts
[...chunked([1,2,3,4,5], 2)]    // [[1,2], [3,4], [5]]
```

#### `sliding(it, n, step?)` — overlapping windows

```ts
[...sliding([1,2,3,4,5], 3)]        // [[1,2,3], [2,3,4], [3,4,5]]
[...sliding([1,2,3,4,5,6], 2, 2)]   // [[1,2], [3,4], [5,6]]
```

#### `pairwise(it)` — consecutive pairs

```ts
[...pairwise([1,2,3,4])]    // [[1,2], [2,3], [3,4]]
```

#### `flatten(it)` / `flatMap(it, fn)`

```ts
[...flatten([[1,2], [3,4], [5]])]         // [1, 2, 3, 4, 5]
[...flatMap([1,2,3], v => [v, v*2])]      // [1, 2, 2, 4, 3, 6]
```

#### `map(it, fn)` / `filter(it, pred)` — iterable versions

```ts
[...map(range(5), v => v ** 2)]            // [0, 1, 4, 9, 16]
[...filter(range(10), v => v % 2 === 0)]  // [0, 2, 4, 6, 8]
```

#### `cycle(it, times?)` / `repeat(value, times?)`

```ts
[...cycle([1,2,3], 2)]    // [1, 2, 3, 1, 2, 3]
[...repeat('x', 3)]       // ['x', 'x', 'x']
// Infinite:
take(cycle([1,2,3]), 7)   // [1,2,3,1,2,3,1]
take(repeat(0), 5)        // [0,0,0,0,0]
```

#### `roundRobin(...iterables)` — interleave

```ts
[...roundRobin([1,2,3], ['a','b'])]   // [1,'a',2,'b',3]
```

#### `product(a, b)` — cartesian product

```ts
[...product([1,2], ['a','b'])]   // [[1,'a'],[1,'b'],[2,'a'],[2,'b']]
```

#### `uniq(it)` / `uniqBy(it, keyFn)`

```ts
[...uniq([1,2,1,3,2])]                          // [1, 2, 3]
[...uniqBy(['foo','bar','baz'], s => s[0])]     // ['foo', 'bar']
```

### Eager (reducers)

Consume the iterable and return a result.

#### `collect(it)` → `T[]`

```ts
collect(range(5))   // [0, 1, 2, 3, 4]  (same as Array.from, typed)
```

#### `first(it)` / `last(it)` / `nth(it, n)`

```ts
first([10, 20, 30])     // 10
last([10, 20, 30])      // 30
nth([10, 20, 30], 1)    // 20
```

#### `count(it)` / `isEmpty(it)` / `consume(it)`

```ts
count(range(100))       // 100
isEmpty([])             // true
consume(sideEffects())  // runs generator, discards values
```

#### `sum(it)` / `min(it)` / `max(it)`

```ts
sum(range(1, 6))   // 15
min([3,1,4,1,5])   // 1
max([3,1,4,1,5])   // 5
```

#### `minBy(it, keyFn)` / `maxBy(it, keyFn)`

```ts
const users = [{name:'alice', age:30},{name:'bob', age:25}];
minBy(users, u => u.age)   // { name: 'bob', age: 25 }
maxBy(users, u => u.age)   // { name: 'alice', age: 30 }
```

#### `reduce(it, fn, initial)`

```ts
reduce([1,2,3,4], (acc, v) => acc + v, 0)   // 10
```

#### `partition(it, pred)` → `[T[], T[]]`

```ts
const [evens, odds] = partition([1,2,3,4,5,6], v => v % 2 === 0);
// evens: [2, 4, 6]  odds: [1, 3, 5]
```

#### `groupBy(it, keyFn)` → `Map<K, T[]>`

```ts
const byLen = groupBy(['a','bb','cc','ddd'], s => s.length);
// Map { 1→['a'], 2→['bb','cc'], 3→['ddd'] }
```

#### `sortedBy(it, keyFn, reverse?)` → `T[]`

```ts
sortedBy(['banana','apple','cherry'], s => s)
// ['apple', 'banana', 'cherry']

sortedBy([{n:'b',v:3},{n:'a',v:1}], v => v.v)
// [{n:'a',v:1}, {n:'b',v:3}]
```

#### `every(it, pred)` / `some(it, pred)` / `find(it, pred)` / `findIndex(it, pred)`

```ts
every([2,4,6], v => v % 2 === 0)    // true
some([1,3,5,6], v => v % 2 === 0)   // true
find([1,3,4,5], v => v % 2 === 0)   // 4
findIndex([1,3,4,5], v => v % 2 === 0)  // 2
```

#### `forEach(it, fn)`

```ts
forEach(['a','b','c'], (v, i) => console.log(i, v));
// 0 a   1 b   2 c
```

#### `frequencies(it)` / `frequenciesBy(it, keyFn)` → `Map<K, number>`

```ts
frequencies(['a','b','a','c','a'])
// Map { 'a'→3, 'b'→1, 'c'→1 }

frequenciesBy(['cat','dog','elephant','ox'], w => w.length)
// Map { 3→2, 8→1, 2→1 }
```

## Composing pipelines

```ts
import { range, filter, map, chunked, sum, collect } from "iterkit";

// Sum of squares of odd numbers in [0, 100), in chunks of 5
const result = collect(
  map(
    filter(range(100), v => v % 2 !== 0),
    v => v * v
  )
);
// No intermediate arrays until collect()

// Word frequency from a large text file (streaming)
import { frequencies, map } from "iterkit";
const words = text.split(/\s+/);
const freq = frequencies(words);
const topWords = sortedBy([...freq.entries()], ([, c]) => c, true).slice(0, 10);
```

## Contributors ✨

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind are welcome — code, docs, bug reports, ideas, reviews! See the [emoji key](https://allcontributors.org/docs/en/emoji-key) for how each contribution is recognized, and open a PR or issue to get involved.

Thanks goes to these wonderful people:

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/trananhtung"><img src="https://avatars.githubusercontent.com/u/30992229?v=4?s=100" width="100px;" alt="Tung Tran"/><br /><sub><b>Tung Tran</b></sub></a><br /><a href="https://github.com/trananhtung/iterkit/commits?author=trananhtung" title="Code">💻</a> <a href="#maintenance-trananhtung" title="Maintenance">🚧</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

## License

MIT
