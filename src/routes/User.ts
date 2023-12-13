import { Request, Response } from 'express';

import { Types } from 'mongoose';
import UserModel, { User } from '../models/User';
import TokenModel from '../models/Token';
import ErrorResponse from '../responses/ErrorResponse';

class UserRoutes {
  static register = async (req: Request, res: Response) => {
    const { id, password, name } = req.body;

    if (!id) {
      res.status(400).send(new ErrorResponse(-301, 'Id required'));
      return;
    } else {
      const user: { _id: Types.ObjectId } | null = await UserModel.exists({ id });

      if (user) {
        res.status(400).send(new ErrorResponse(-409, 'Id duplicated'));
        return;
      }
    }

    if (!password) {
      res.status(400).send(new ErrorResponse(-302, 'Password required'));
      return;
    }

    if (!name) {
      res.status(400).send(new ErrorResponse(-304, 'Name required'));
      return;
    }

    const mongoSession = await UserModel.startSession();
    mongoSession.startTransaction();

    try {
      const user: User | null = await new UserModel({
        id,
        password,
        name,
      }).save();
      if (!user) {
        await mongoSession.abortTransaction();
        res.status(500).send(new ErrorResponse(-1, 'Internal server error'));
      } else {
        await mongoSession.commitTransaction();

        res.status(200).json({
          msg: '회원가입이 완료되었습니다.',
          id: user.id,
          name: user.name,
        });
      }
    } catch (err: unknown) {
      await mongoSession.abortTransaction();

      res.status(500).send(new ErrorResponse(-1, 'Internal server error'));
    } finally {
      await mongoSession.endSession();
    }
  };

  static findUser = async (req: Request, res: Response) => {
    const mongoSession = await UserModel.startSession();

    try {
      const { id } = req.params;

      mongoSession.startTransaction();

      const user = await UserModel.findOne({ id });

      if (user) {
        res.json({ name: user.name });
      } else {
        res.status(404).send(new ErrorResponse(404, 'User not found'));
      }
    } catch (error: unknown) {
      await mongoSession.abortTransaction();
      res.status(500).send(new ErrorResponse(-1, 'Internal server error'));
    } finally {
      await mongoSession.endSession();
    }
  };

  static updateUser = async (req: Request, res: Response) => {
    const { id, name } = req.body;

    if (!id && !name) {
      res.status(400).send(new ErrorResponse(-341, 'id and name required'));
      return;
    }
    try {
      const mongoSession = await UserModel.startSession();
      mongoSession.startTransaction();

      try {
        const Userupdate: User | null = await UserModel.findOneAndUpdate(
          { id },
          { name },
          { runValidators: true, new: true },
        );

        if (!Userupdate) {
          await mongoSession.abortTransaction();
          res.status(404).send(new ErrorResponse(404, 'User not found'));
        } else {
          await mongoSession.commitTransaction();
          res.status(200).json({
            msg: 'name changed',
            name: Userupdate.name,
          });
        }
      } catch (error: unknown) {
        await mongoSession.abortTransaction();
        res.status(500).send(new ErrorResponse(-1, 'Internal server error'));
      } finally {
        mongoSession.endSession();
      }
    } catch (error: unknown) {
      res.status(500).send(new ErrorResponse(-1, 'Internal server error'));
    }
  };

  static deleteUser = async (req: Request, res: Response) => {
    const { id } = req.body;
    try {
      const mongoSession = await UserModel.startSession();
      mongoSession.startTransaction();

      const user: User | null = await UserModel.findOne({ id });

      if (!user) {
        res.status(404).send(new ErrorResponse(-341, 'User not found'));
        return;
      }
      try {
        const deleteUser = await UserModel.findOneAndDelete({ id });
        const deleteToken = await TokenModel.findOneAndDelete({ id });
        if (!deleteUser) {
          await mongoSession.abortTransaction();
          res.status(404).send(new ErrorResponse(404, 'User not found'));
        }
        await mongoSession.commitTransaction();
        res.status(200).send({ msg: 'user deleted' });
      } catch (error: unknown) {
        res.status(500).send(new ErrorResponse(-1, 'Internal server error'));
      } finally {
        mongoSession.endSession();
      }
    } catch (error: unknown) {
      res.status(500).send(new ErrorResponse(-1, 'Internal server error'));
    }
  };
}

export default UserRoutes;
