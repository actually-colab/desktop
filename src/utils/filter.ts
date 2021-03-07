/**
 * Remove all undefined keys from a given object
 */
export const filterUndefined = <T extends { [key: string]: any }, OutputType>(obj: Partial<T>): OutputType =>
  Object.keys(obj).reduce((result: any, key) => {
    if (obj[key] !== undefined) {
      result[key] = obj[key];
    }

    return result;
  }, {}) as OutputType;
