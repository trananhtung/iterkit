import {
  range, chain, zip, zipLongest, enumerate, take, drop, takeWhile, dropWhile,
  chunked, sliding, pairwise, flatten, flatMap, map, filter, cycle, repeat,
  roundRobin, product, uniq, uniqBy,
  collect, first, last, nth, isEmpty, consume, count, sum, min, max,
  minBy, maxBy, reduce, partition, groupBy, sortedBy, every, some,
  find, findIndex, forEach, frequencies, frequenciesBy,
} from "../src/index.js";

const $ = collect;

// ── range ─────────────────────────────────────────────────────────────────────

describe("range", () => {
  test("range(5) → 0..4", () => expect($(range(5))).toEqual([0, 1, 2, 3, 4]));
  test("range(2, 5) → 2..4", () => expect($(range(2, 5))).toEqual([2, 3, 4]));
  test("range(0, 10, 2) → even", () => expect($(range(0, 10, 2))).toEqual([0, 2, 4, 6, 8]));
  test("range(5, 0, -1) → 5..1", () => expect($(range(5, 0, -1))).toEqual([5, 4, 3, 2, 1]));
  test("range empty → []", () => expect($(range(0))).toEqual([]));
  test("range(0) step=0 throws", () => expect(() => $(range(0, 10, 0))).toThrow());
});

// ── chain ─────────────────────────────────────────────────────────────────────

describe("chain", () => {
  test("two arrays", () => expect($(chain([1,2], [3,4]))).toEqual([1,2,3,4]));
  test("three arrays", () => expect($(chain([1], [2], [3]))).toEqual([1,2,3]));
  test("empty inputs", () => expect($(chain([], []))).toEqual([]));
  test("with generators", () => expect($(chain(range(3), range(3, 6)))).toEqual([0,1,2,3,4,5]));
});

// ── zip / zipLongest ──────────────────────────────────────────────────────────

describe("zip", () => {
  test("two equal arrays", () => {
    expect($(zip([1,2,3], ['a','b','c']))).toEqual([[1,'a'],[2,'b'],[3,'c']]);
  });
  test("stops at shortest", () => {
    expect($(zip([1,2,3], ['a','b']))).toEqual([[1,'a'],[2,'b']]);
  });
  test("three iterables", () => {
    expect($(zip([1,2], ['a','b'], [true, false]))).toEqual([[1,'a',true],[2,'b',false]]);
  });
});

describe("zipLongest", () => {
  test("pads shorter", () => {
    expect($(zipLongest(null, [1,2,3], ['a','b']))).toEqual([[1,'a'],[2,'b'],[3,null]]);
  });
  test("undefined fill", () => {
    expect($(zipLongest(undefined, [1,2], ['a','b','c']))).toEqual([[1,'a'],[2,'b'],[undefined,'c']]);
  });
});

// ── enumerate ─────────────────────────────────────────────────────────────────

describe("enumerate", () => {
  test("basic", () => {
    expect($(enumerate(['a','b','c']))).toEqual([[0,'a'],[1,'b'],[2,'c']]);
  });
  test("start=1", () => {
    expect($(enumerate(['a','b'], 1))).toEqual([[1,'a'],[2,'b']]);
  });
});

// ── take / drop ───────────────────────────────────────────────────────────────

describe("take", () => {
  test("take 3 from array", () => expect($(take([1,2,3,4,5], 3))).toEqual([1,2,3]));
  test("take 0 → empty", () => expect($(take([1,2,3], 0))).toEqual([]));
  test("take more than length → all", () => expect($(take([1,2], 5))).toEqual([1,2]));
  test("take from infinite range", () => expect($(take(range(0, Infinity), 5))).toEqual([0,1,2,3,4]));
});

describe("drop", () => {
  test("drop first 2", () => expect($(drop([1,2,3,4,5], 2))).toEqual([3,4,5]));
  test("drop 0 → all", () => expect($(drop([1,2,3], 0))).toEqual([1,2,3]));
  test("drop all → empty", () => expect($(drop([1,2,3], 10))).toEqual([]));
});

// ── takeWhile / dropWhile ─────────────────────────────────────────────────────

describe("takeWhile", () => {
  test("while < 4", () => expect($(takeWhile([1,2,3,4,5], v => v < 4))).toEqual([1,2,3]));
  test("all pass → all", () => expect($(takeWhile([1,2,3], v => v > 0))).toEqual([1,2,3]));
  test("none pass → empty", () => expect($(takeWhile([1,2,3], v => v > 10))).toEqual([]));
});

describe("dropWhile", () => {
  test("while < 3", () => expect($(dropWhile([1,2,3,4,5], v => v < 3))).toEqual([3,4,5]));
  test("all pass → empty", () => expect($(dropWhile([1,2,3], () => true))).toEqual([]));
  test("none pass → all", () => expect($(dropWhile([1,2,3], () => false))).toEqual([1,2,3]));
});

// ── chunked ───────────────────────────────────────────────────────────────────

describe("chunked", () => {
  test("evenly divisible", () => {
    expect($(chunked([1,2,3,4,5,6], 2))).toEqual([[1,2],[3,4],[5,6]]);
  });
  test("remainder chunk", () => {
    expect($(chunked([1,2,3,4,5], 2))).toEqual([[1,2],[3,4],[5]]);
  });
  test("size > length → one chunk", () => {
    expect($(chunked([1,2,3], 10))).toEqual([[1,2,3]]);
  });
  test("size=0 throws", () => expect(() => $(chunked([1], 0))).toThrow());
  test("empty input → empty", () => expect($(chunked([], 3))).toEqual([]));
});

// ── sliding ───────────────────────────────────────────────────────────────────

describe("sliding", () => {
  test("window=3 step=1", () => {
    expect($(sliding([1,2,3,4,5], 3))).toEqual([[1,2,3],[2,3,4],[3,4,5]]);
  });
  test("window=2 step=2", () => {
    expect($(sliding([1,2,3,4,5,6], 2, 2))).toEqual([[1,2],[3,4],[5,6]]);
  });
  test("window > length → empty", () => {
    expect($(sliding([1,2], 3))).toEqual([]);
  });
  test("size=0 throws", () => expect(() => $(sliding([1,2], 0))).toThrow());
});

// ── pairwise ──────────────────────────────────────────────────────────────────

describe("pairwise", () => {
  test("basic pairs", () => {
    expect($(pairwise([1,2,3,4]))).toEqual([[1,2],[2,3],[3,4]]);
  });
  test("single item → empty", () => expect($(pairwise([1]))).toEqual([]));
  test("empty → empty", () => expect($(pairwise([]))).toEqual([]));
});

// ── flatten / flatMap ─────────────────────────────────────────────────────────

describe("flatten", () => {
  test("one level", () => {
    expect($(flatten([[1,2],[3,4],[5]]))).toEqual([1,2,3,4,5]);
  });
  test("empty inner arrays", () => {
    expect($(flatten([[], [1], [], [2,3]]))).toEqual([1,2,3]);
  });
});

describe("flatMap", () => {
  test("each to array", () => {
    expect($(flatMap([1,2,3], v => [v, v*2]))).toEqual([1,2,2,4,3,6]);
  });
  test("filter via empty", () => {
    expect($(flatMap([1,2,3,4], v => v % 2 === 0 ? [v] : []))).toEqual([2,4]);
  });
});

// ── map / filter ──────────────────────────────────────────────────────────────

describe("map", () => {
  test("double", () => expect($(map([1,2,3], v => v * 2))).toEqual([2,4,6]));
  test("with index", () => expect($(map(['a','b'], (v, i) => `${i}:${v}`))).toEqual(['0:a','1:b']));
  test("works on generators", () => expect($(map(range(3), v => v ** 2))).toEqual([0,1,4]));
});

describe("filter", () => {
  test("even numbers", () => expect($(filter([1,2,3,4,5,6], v => v % 2 === 0))).toEqual([2,4,6]));
  test("with index", () => expect($(filter(['a','b','c','d'], (_, i) => i % 2 === 0))).toEqual(['a','c']));
});

// ── cycle / repeat ────────────────────────────────────────────────────────────

describe("cycle", () => {
  test("cycle 2 times", () => expect($(cycle([1,2,3], 2))).toEqual([1,2,3,1,2,3]));
  test("take from indefinite cycle", () => expect($(take(cycle([1,2]), 5))).toEqual([1,2,1,2,1]));
  test("empty cycle → empty", () => expect($(cycle([], 3))).toEqual([]));
});

describe("repeat", () => {
  test("repeat 3 times", () => expect($(repeat('x', 3))).toEqual(['x','x','x']));
  test("repeat 0 times → empty", () => expect($(repeat('x', 0))).toEqual([]));
  test("take from infinite repeat", () => expect($(take(repeat(1), 4))).toEqual([1,1,1,1]));
});

// ── roundRobin ────────────────────────────────────────────────────────────────

describe("roundRobin", () => {
  test("equal length", () => {
    expect($(roundRobin([1,2,3], ['a','b','c']))).toEqual([1,'a',2,'b',3,'c']);
  });
  test("different lengths", () => {
    expect($(roundRobin([1,2], ['a','b','c'], [true]))).toEqual([1,'a',true,2,'b','c']);
  });
  test("single iterable → same as collect", () => {
    expect($(roundRobin([1,2,3]))).toEqual([1,2,3]);
  });
});

// ── product ───────────────────────────────────────────────────────────────────

describe("product", () => {
  test("2x2", () => {
    expect($(product([1,2], ['a','b']))).toEqual([[1,'a'],[1,'b'],[2,'a'],[2,'b']]);
  });
  test("empty → empty", () => expect($(product([], [1,2]))).toEqual([]));
  test("range product", () => {
    expect($(product(range(2), range(2)))).toEqual([[0,0],[0,1],[1,0],[1,1]]);
  });
});

// ── uniq / uniqBy ─────────────────────────────────────────────────────────────

describe("uniq", () => {
  test("removes duplicates preserving order", () => {
    expect($(uniq([1,2,1,3,2,4]))).toEqual([1,2,3,4]);
  });
  test("strings", () => expect($(uniq(['a','b','a','c']))).toEqual(['a','b','c']));
  test("no duplicates → same", () => expect($(uniq([1,2,3]))).toEqual([1,2,3]));
});

describe("uniqBy", () => {
  test("by key", () => {
    const result = $(uniqBy([{id:1,x:1},{id:2,x:2},{id:1,x:3}], v => v.id));
    expect(result).toEqual([{id:1,x:1},{id:2,x:2}]);
  });
  test("by string key", () => {
    expect($(uniqBy(['foo','bar','baz','qux'], s => s[0]))).toEqual(['foo','bar','qux']);
  });
});

// ── collect / first / last / nth ──────────────────────────────────────────────

describe("collect", () => {
  test("array passthrough", () => expect(collect([1,2,3])).toEqual([1,2,3]));
  test("from generator", () => expect(collect(range(3))).toEqual([0,1,2]));
});

describe("first / last / nth", () => {
  test("first of array", () => expect(first([1,2,3])).toBe(1));
  test("first of empty", () => expect(first([])).toBeUndefined());
  test("last of array", () => expect(last([1,2,3])).toBe(3));
  test("last of empty", () => expect(last([])).toBeUndefined());
  test("nth(0)", () => expect(nth([10,20,30], 0)).toBe(10));
  test("nth(2)", () => expect(nth([10,20,30], 2)).toBe(30));
  test("nth out of bounds", () => expect(nth([10,20,30], 5)).toBeUndefined());
});

// ── isEmpty / consume / count ─────────────────────────────────────────────────

describe("isEmpty", () => {
  test("empty array → true", () => expect(isEmpty([])).toBe(true));
  test("non-empty → false", () => expect(isEmpty([1])).toBe(false));
  test("empty range → true", () => expect(isEmpty(range(0))).toBe(true));
});

describe("consume", () => {
  test("side effects run", () => {
    const log: number[] = [];
    consume(map([1,2,3], v => { log.push(v); return v; }));
    expect(log).toEqual([1,2,3]);
  });
});

describe("count", () => {
  test("count array", () => expect(count([1,2,3,4,5])).toBe(5));
  test("count empty", () => expect(count([])).toBe(0));
  test("count generator", () => expect(count(range(10))).toBe(10));
});

// ── sum / min / max ───────────────────────────────────────────────────────────

describe("sum", () => {
  test("sum array", () => expect(sum([1,2,3,4,5])).toBe(15));
  test("sum empty", () => expect(sum([])).toBe(0));
  test("sum range", () => expect(sum(range(1, 6))).toBe(15));
});

describe("min/max", () => {
  test("min", () => expect(min([3,1,4,1,5,9,2,6])).toBe(1));
  test("max", () => expect(max([3,1,4,1,5,9,2,6])).toBe(9));
  test("min empty", () => expect(min([])).toBeUndefined());
  test("max empty", () => expect(max([])).toBeUndefined());
});

describe("minBy/maxBy", () => {
  const data = [{name:'alice', age:30},{name:'bob', age:25},{name:'carol', age:35}];
  test("minBy age", () => expect(minBy(data, v => v.age)).toEqual({name:'bob', age:25}));
  test("maxBy age", () => expect(maxBy(data, v => v.age)).toEqual({name:'carol', age:35}));
  test("minBy empty → undefined", () => expect(minBy([], v => (v as number))).toBeUndefined());
});

// ── reduce ────────────────────────────────────────────────────────────────────

describe("reduce", () => {
  test("sum via reduce", () => expect(reduce([1,2,3,4], (a, v) => a + v, 0)).toBe(10));
  test("string join", () => expect(reduce(['a','b','c'], (a, v) => a + v, '')).toBe('abc'));
  test("with index", () => {
    const result = reduce(['x','y','z'], (a, v, i) => a + `${i}:${v} `, '');
    expect(result).toBe('0:x 1:y 2:z ');
  });
});

// ── partition ─────────────────────────────────────────────────────────────────

describe("partition", () => {
  test("even/odd", () => {
    const [evens, odds] = partition([1,2,3,4,5,6], v => v % 2 === 0);
    expect(evens).toEqual([2,4,6]);
    expect(odds).toEqual([1,3,5]);
  });
  test("all pass → second empty", () => {
    const [y, n] = partition([1,2,3], () => true);
    expect(y).toEqual([1,2,3]);
    expect(n).toEqual([]);
  });
});

// ── groupBy ───────────────────────────────────────────────────────────────────

describe("groupBy", () => {
  test("group by first char", () => {
    const map = groupBy(['ant','bee','ape','bat'], s => s[0]);
    expect(map.get('a')).toEqual(['ant','ape']);
    expect(map.get('b')).toEqual(['bee','bat']);
  });
  test("group by number", () => {
    const map = groupBy([1,2,3,4,5,6], v => v % 3);
    expect(map.get(0)).toEqual([3,6]);
    expect(map.get(1)).toEqual([1,4]);
    expect(map.get(2)).toEqual([2,5]);
  });
});

// ── sortedBy ──────────────────────────────────────────────────────────────────

describe("sortedBy", () => {
  test("sort by age asc", () => {
    const data = [{n:'b',age:3},{n:'a',age:1},{n:'c',age:2}];
    expect(sortedBy(data, v => v.age).map(v => v.n)).toEqual(['a','c','b']);
  });
  test("sort reverse", () => {
    expect(sortedBy([3,1,4,1,5], v => v, true)).toEqual([5,4,3,1,1]);
  });
  test("stable order from generator", () => {
    expect(sortedBy(range(5, 0, -1), v => v)).toEqual([1,2,3,4,5]);
  });
});

// ── every / some / find / findIndex ──────────────────────────────────────────

describe("every/some", () => {
  test("every positive", () => expect(every([1,2,3], v => v > 0)).toBe(true));
  test("every with falsy", () => expect(every([1,2,-1], v => v > 0)).toBe(false));
  test("every empty → true", () => expect(every([], () => false)).toBe(true));
  test("some hits", () => expect(some([1,2,3,4], v => v > 3)).toBe(true));
  test("some misses", () => expect(some([1,2,3], v => v > 10)).toBe(false));
  test("some empty → false", () => expect(some([], () => true)).toBe(false));
});

describe("find/findIndex", () => {
  test("find first even", () => expect(find([1,3,4,5], v => v % 2 === 0)).toBe(4));
  test("find not found", () => expect(find([1,3,5], v => v % 2 === 0)).toBeUndefined());
  test("findIndex", () => expect(findIndex([1,3,4,5], v => v % 2 === 0)).toBe(2));
  test("findIndex not found", () => expect(findIndex([1,3,5], v => v % 2 === 0)).toBe(-1));
});

// ── forEach ───────────────────────────────────────────────────────────────────

describe("forEach", () => {
  test("iterates with index", () => {
    const log: [number, string][] = [];
    forEach(['a','b','c'], (v, i) => log.push([i, v]));
    expect(log).toEqual([[0,'a'],[1,'b'],[2,'c']]);
  });
});

// ── frequencies / frequenciesBy ───────────────────────────────────────────────

describe("frequencies", () => {
  test("character frequencies", () => {
    const m = frequencies(['a','b','a','c','b','a']);
    expect(m.get('a')).toBe(3);
    expect(m.get('b')).toBe(2);
    expect(m.get('c')).toBe(1);
  });
  test("number frequencies", () => {
    const m = frequencies([1,1,2,3,3,3]);
    expect(m.get(1)).toBe(2);
    expect(m.get(3)).toBe(3);
  });
});

describe("frequenciesBy", () => {
  test("by string length", () => {
    const m = frequenciesBy(['a','bb','cc','ddd'], s => s.length);
    expect(m.get(1)).toBe(1);
    expect(m.get(2)).toBe(2);
    expect(m.get(3)).toBe(1);
  });
});
