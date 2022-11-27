import { Request, Response, RequestHandler } from "express";
import { validationResult } from "express-validator";

export interface Success<T> {
  readonly value: T,
  isSuccess(): this is Success<T>,
  isFail(): false,
  ifSuccess<R>(fn: (value: T) => R): Success<R>,
  ifFail(): Success<T>,
}

export interface Fail<E> {
  readonly error: E,
  isSuccess(): false,
  isFail(): this is Fail<E>,
  ifSuccess(): Fail<E>,
  ifFail<S>(fn: (error: E) => S): Fail<S>,
}

export type Results<T, E> = Success<T> | Fail<E>;

export const success = <T>(value: T): Success<T> => {
  const results: Success<T> = {
    value,
    isSuccess: () => true,
    isFail: () => false,
    ifSuccess: <R>(fn: (value: T) => R): Success<R> => success(fn(value)),
    ifFail: (): Success<T> => results,
  };
  return results;
}

export const fail = <E>(error: E): Fail<E> => {
  const results: Fail<E> = {
    error,
    isSuccess: () => false,
    isFail: () => true,
    ifSuccess: (): Fail<E> => results,
    ifFail: <S>(fn: (error: E) => S): Fail<S> => fail(fn(error)),
  };
  return results;
}

export interface ApiResourceRef {
  type: string,
  id: string,
  url: string,
}

export interface ApiError {
  httpStatus: number,
  errors: string[],
}

export interface NanorestConfig {
  serverUrl: string;
}

export interface Nanorest {
  resource<T>(
    type: string,
    handler: (req: Request, res: Response) => Results<T, ApiError>,
  ): RequestHandler;
}

export const nanorest = (config: NanorestConfig): Nanorest => {
  const sendResults = <T>(
    results: Results<T, ApiError>,
    resourceType: string,
    req: Request,
    res: Response,
  ): void => {
    if (results.isSuccess()) {
      res.status(200).send({
        status: 'success',
        type: resourceType,
        url: `${config.serverUrl}${req.originalUrl}`,
        results: results.value,
      });
      return;
    }
  
    res.status(results.error.httpStatus).send({
      status: 'error',
      errors: results.error.errors,
    });
  };
    
  return {
    resource<T>(
      type: string,
      handler: (req: Request, res:Response) => Results<T, ApiError>,
    ): RequestHandler {
      return (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          res.status(400).send({
            status: 'error',
            errors: errors.array(),
          });
          return;
        }
    
        const results = handler(req, res);
        sendResults(results, type, req, res);
      }
    }    
  };
};
