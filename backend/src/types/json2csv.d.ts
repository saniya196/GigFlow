declare module 'json2csv' {
  export class Parser<T = Record<string, unknown>> {
    constructor(options?: { fields?: readonly string[] });
    parse(data: T[] | Record<string, unknown>[]): string;
  }
}