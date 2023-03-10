export interface Result<T, E> {
  map<U>(fn: (value: T) => U): Result<U, E>;
  mapErr<F>(fn: (err: E) => F): Result<T, F>;
  chain<U, F>(fn: (value: T) => Result<U, F>): Result<U, E | F>;
  match<U>(m: { success: (succ: T) => U; fail: (err: E) => U }): U;
  isSuccess(): this is Success<T>;
  isFail(): this is Fail<E>;
  getOrElse(value: T): T;
  getOrThrow(): T;
}

export class Success<T> implements Result<T, never> {
  private readonly value: T;

  public constructor(value: T) {
    this.value = value;
  }

  public map<U>(fn: (value: T) => U): Success<U> {
    return new Success(fn(this.value));
  }

  public mapErr(): this {
    return this;
  }

  public chain<U, E>(fn: (value: T) => Result<U, E>): Result<U, E> {
    return fn(this.value);
  }
  
  public match<U>({ success }: { success: (succ: T) => U, fail: unknown }): U {
    return success(this.value);
  }

  public isSuccess(): true {
    return true;
  }
  
  public isFail(): false {
    return false;
  }
  
  public getOrElse(): T {
    return this.value;
  }

  public getOrThrow(): T {
    return this.value;
  }

  public get(): T {
    return this.value;
  }
};

export class Fail<E> implements Result<never, E> {
  private readonly error: E;

  public constructor(error: E) {
    this.error = error;
  }

  public map(): this {
    return this;
  }

  public mapErr<F>(fn: (err: E) => F): Fail<F> {
    return new Fail(fn(this.error));
  }

  public chain(): this {
    return this;
  }
  
  public match<U>({ fail }: { success: unknown; fail: (err: E) => U }): U {
    return fail(this.error);
  }

  public isSuccess(): false {
    return false;
  }
  
  public isFail(): true {
    return true;
  }
  
  public getOrElse<T>(value: T): T {
    return value;
  }

  public getOrThrow<T>(): T {
    throw this.error;
  }

  public err(): E {
    return this.error;
  }
};

export const success = <T>(value: T): Success<T> => new Success(value);
export const fail = <E>(error: E): Fail<E> => new Fail(error);
