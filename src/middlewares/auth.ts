import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';

import { TokenPayload, verifyAuthToken } from '../utils/Auth';

import UserModel from '../models/User';

import ErrorResponse from '../responses/ErrorResponse';

export const MAuth = async (req: Request, res: Response, next: NextFunction) => {
  const authorization: string | undefined = req.headers.authorization;
  //console.log(authorization);

  if (!authorization) {
    res.status(400).send(new ErrorResponse(-2, 'Required header parameter not found'));
    return;
  } else {
    try {
      const tokenPayload: TokenPayload | undefined = verifyAuthToken(authorization);

      if (!tokenPayload) {
        res.status(500).send(new ErrorResponse(999, 'Authorization failed'));

        return;
      } else {
        const user: { _id: Types.ObjectId } | null = await UserModel.exists({
          id: tokenPayload.id,
        });

        if (!user) {
          console.log(user);
          res.status(404).send(new ErrorResponse(-15, 'User not found'));

          return;
        } else {
          res.locals.id = tokenPayload.userId;

          next();
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        switch (err.message) {
          case 'Auth token expired':
            res.status(401).send(new ErrorResponse(-12, err.message));
            break;
          case 'Invalid auth token':
            res.status(401).send(new ErrorResponse(-10, err.message));
            break;
          case 'JWT_SECRET is not defined':
          default:
            res.status(500).send(new ErrorResponse(-1, 'Internal server error', err.message));
            break;
        }
        return;
      } else {
        res.status(500).send(new ErrorResponse(-1, 'Internal server error'));
        return;
      }
    }
  }
};

export default MAuth;
