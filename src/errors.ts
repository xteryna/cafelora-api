import { ResultError } from 'jsonder';

export namespace Errors {
  export const drinkNotFound = (id: string): ResultError => ({
    status: 404,
    code: 'not_found',
    detail: `Cannot find drink with id '${id}'`,
  });
}
