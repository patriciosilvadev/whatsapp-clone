import { NextFunction, Request, Response } from "express";
import { NotAuthorizedError } from "../Errors/NotAuthorizedError";
import jwt from "jsonwebtoken";

export interface JWT {
  _id: string;
}

declare global {
  namespace Express {
    interface Request {
      currentUser?: JWT;
    }
  }
}

export const auth = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.session?.jwt) {
    throw new NotAuthorizedError();
  }
  try {
    const payload = jwt.verify(req.session.jwt!, process.env.JWT_KEY!) as JWT;
    req.currentUser = payload;
    next();
  } catch (error) {
    throw new NotAuthorizedError();
  }
};