import { Schema, model } from 'mongoose';

export interface User {
  id: string;
  password: string;
  name?: string;
  regDate?: Date;
}

const userSchema = new Schema<User>(
  {
    id: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String },
    regDate: { type: Date, default: Date.now },
  },
  { versionKey: false },
);

// versionkey : mongoDB 자동 업데이트 방지 일과성 유지
// Document : mongoDB 컬렉션 내 단일 레코드
// model : mongoose 에서 Schema 기반으로 생성되며 MongoDB 컬렉션과 상호 작용하는 인터페이스

const UserModel = model<User>('users', userSchema);

export default UserModel;
