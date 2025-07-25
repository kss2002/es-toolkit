import { isDeepKey } from '../_internal/isDeepKey.ts';
import { isIndex } from '../_internal/isIndex.ts';
import { PropertyPath } from '../_internal/PropertyPath.ts';
import { isArguments } from '../predicate/isArguments.ts';
import { toPath } from '../util/toPath.ts';

/**
 * Checks if a given path exists within an object.
 *
 * @template T
 * @template K
 * @param {T} object - The object to query.
 * @param {K} path - The path to check.
 * @returns {object is T & { [P in K]: P extends keyof T ? T[P] : Record<string, unknown> extends T ? T[keyof T] : unknown } & { [key: symbol]: unknown }} Returns a type guard indicating if the path exists in the object.
 *
 * @example
 * const obj = { a: 1, b: { c: 2 } };
 *
 * if (has(obj, 'a')) {
 *   console.log(obj.a); // TypeScript knows obj.a exists
 * }
 *
 * if (has(obj, 'b')) {
 *   console.log(obj.b.c); // TypeScript knows obj.b exists
 * }
 */
export function has<T, K extends PropertyKey>(
  object: T,
  path: K
): object is T & { [P in K]: P extends keyof T ? T[P] : Record<string, unknown> extends T ? T[keyof T] : unknown } & {
  [key: symbol]: unknown;
};

/**
 * Checks if a given path exists within an object.
 *
 * @template T
 * @param {T} object - The object to query.
 * @param {PropertyPath} path - The path to check. This can be a single property key,
 *        an array of property keys, or a string representing a deep path.
 * @returns {boolean} Returns `true` if the path exists in the object, `false` otherwise.
 *
 * @example
 * const obj = { a: { b: { c: 3 } } };
 *
 * has(obj, 'a'); // true
 * has(obj, ['a', 'b']); // true
 * has(obj, ['a', 'b', 'c']); // true
 * has(obj, 'a.b.c'); // true
 * has(obj, 'a.b.d'); // false
 * has(obj, ['a', 'b', 'c', 'd']); // false
 * has([], 0); // false
 * has([1, 2, 3], 2); // true
 * has([1, 2, 3], 5); // false
 */
export function has<T>(object: T, path: PropertyPath): boolean;

/**
 * Checks if a given path exists within an object.
 *
 * You can provide the path as a single property key, an array of property keys,
 * or a string representing a deep path.
 *
 * If the path is an index and the object is an array or an arguments object, the function will verify
 * if the index is valid and within the bounds of the array or arguments object, even if the array or
 * arguments object is sparse (i.e., not all indexes are defined).
 *
 * @param {any} object - The object to query.
 * @param {PropertyKey | readonly PropertyKey[]} path - The path to check. This can be a single property key,
 *        an array of property keys, or a string representing a deep path.
 * @returns {boolean} Returns `true` if the path exists in the object, `false` otherwise.
 *
 * @example
 *
 * const obj = { a: { b: { c: 3 } } };
 *
 * has(obj, 'a'); // true
 * has(obj, ['a', 'b']); // true
 * has(obj, ['a', 'b', 'c']); // true
 * has(obj, 'a.b.c'); // true
 * has(obj, 'a.b.d'); // false
 * has(obj, ['a', 'b', 'c', 'd']); // false
 * has([], 0); // false
 * has([1, 2, 3], 2); // true
 * has([1, 2, 3], 5); // false
 */
export function has(object: any, path: PropertyKey | readonly PropertyKey[]): boolean {
  let resolvedPath;

  if (Array.isArray(path)) {
    resolvedPath = path;
  } else if (typeof path === 'string' && isDeepKey(path) && object?.[path] == null) {
    resolvedPath = toPath(path);
  } else {
    resolvedPath = [path];
  }

  if (resolvedPath.length === 0) {
    return false;
  }

  let current = object;

  for (let i = 0; i < resolvedPath.length; i++) {
    const key = resolvedPath[i];

    // Check if the current key is a direct property of the current object
    if (current == null || !Object.hasOwn(current, key)) {
      const isSparseIndex = (Array.isArray(current) || isArguments(current)) && isIndex(key) && key < current.length;

      if (!isSparseIndex) {
        return false;
      }
    }

    current = current[key];
  }

  return true;
}
