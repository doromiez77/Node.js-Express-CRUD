import { Schema, model } from 'mongoose';

export interface Token {
  id: string;
  authToken: string;
  refreshToken: string;
  expireDate: Date;
}

const tokenSchema = new Schema<Token>(
  {
    id: { type: String, required: true, unique: true },
    authToken: { type: String, required: true, unique: true },
    refreshToken: { type: String, required: true, unique: true },
    expireDate: { type: Date, required: true, unique: true },
  },
  { versionKey: false },
);

const TokenModel = model<Token>('tokens', tokenSchema);
export default TokenModel;
