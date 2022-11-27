import { User } from "../users.js";

export {}

declare global {
  namespace Express {
    export interface Request {
      user?: User;
    }
  }
}