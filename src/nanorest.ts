import { Request, Response, RequestHandler } from "express";
import { validationResult } from "express-validator";
import { Result } from "./typephoon";

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
    handler: (req: Request, res: Response) => Result<T, ApiError>,
  ): RequestHandler;
}

export const nanorest = (config: NanorestConfig): Nanorest => {
  const sendResult = <T>(
    result: Result<T, ApiError>,
    resourceType: string,
    req: Request,
    res: Response,
  ): void => result.match({
    success(value) {
      res.status(200).send({
        status: 'success',
        type: resourceType,
        url: `${config.serverUrl}${req.originalUrl}`,
        result: value,
      });
    },
    fail(error) {
      res.status(error.httpStatus).send({
        status: 'error',
        errors: error.errors,
      });
    },
  });
    
  return {
    resource<T>(
      type: string,
      handler: (req: Request, res: Response) => Result<T, ApiError>,
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
    
        sendResult(handler(req, res), type, req, res);
      }
    }    
  };
};
