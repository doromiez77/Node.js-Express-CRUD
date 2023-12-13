import { Request, Response } from 'express';

import UserModel, { User } from '../models/User';
import TokenModel, { Token } from '../models/Token';
import { generateAuthToken } from '../utils/Auth';
import { ClientSession } from 'mongoose';
import ErrorResponse from '../responses/ErrorResponse';

class AuthRoutes {
  static login = async (req: Request, res: Response) => {
    const { id, password } = req.body;

    if (!id) {
      res.status(400).send(new ErrorResponse(-301, 'Id required'));

      return;
    }

    if (!password) {
      res.status(400).send(new ErrorResponse(-302, 'Password required'));

      return;
    } else {
      // TODO: 패스워드 규칙 확인
    }

    const user: User | null = await UserModel.findOne({ id, password });
    if (!user) {
      res.status(404).send(new ErrorResponse(404, 'User not found'));
      return;
    }

    const token: Token | null = await TokenModel.findOne({ id });

    if (!token) {
      // Create auth token & refresh token
      const newToken: Token | null = generateAuthToken(id);

      if (!newToken) {
        //console.log('Token generate error');
        res.status(500).send(new ErrorResponse(-1, 'Internal server error'));

        return;
      } else {
        const mongoSession: ClientSession = await UserModel.startSession();
        const mongoTokenSession: ClientSession = await TokenModel.startSession();
        mongoSession.startTransaction();
        mongoTokenSession.startTransaction();
        try {
          const savedToken: Token = await new TokenModel(newToken).save();

          await mongoSession.commitTransaction();
          // json 형식으로 반환
          res.status(200).json({
            id: savedToken.id,
            authToken: savedToken.authToken,
            expireDate: savedToken.expireDate,
          });
        } catch (err: unknown) {
          await mongoSession.abortTransaction();
          //console.log(JSON.stringify(err));
          res.status(500).send(new ErrorResponse(-1, 'Internal server error'));
        } finally {
          await mongoSession.endSession();
        }
      }
    } else {
      // Create auth token & refresh token and replace old token

      if (token && token.expireDate > new Date()) {
        res.status(200).json({
          message: 'User Login Success',
          id: token.id,
          authToken: token.authToken,
          expireDate: token.expireDate,
        });
      } else {
        const newToken: Token | null = await generateAuthToken(id);

        if (!newToken) {
          res.status(500).json(new ErrorResponse(-410, 'generateAuthToken faild'));

          return;
        } else {
          const mongoSession: ClientSession = await UserModel.startSession();
          mongoSession.startTransaction();

          try {
            const updatedToken: Token | null = await TokenModel.findOneAndUpdate(
              { id },
              { authToken: newToken.authToken, expireDate: newToken.expireDate },
              { runValidators: true, new: true },
            );

            if (!updatedToken) {
              await mongoSession.abortTransaction();
              res.status(405).json(new ErrorResponse(-411, 'AuthToken not found'));
            } else {
              await mongoSession.commitTransaction();

              res.status(200).json({
                id: updatedToken.id,
                authToken: updatedToken.authToken,
                expireDate: updatedToken.expireDate,
              });
            }
          } catch (err: unknown) {
            await mongoSession.abortTransaction();
            res.status(500).send(new ErrorResponse(-1, 'Internal server error'));
          } finally {
            await mongoSession.endSession();
          }
        }
      }
    }
  };
}
export default AuthRoutes;
