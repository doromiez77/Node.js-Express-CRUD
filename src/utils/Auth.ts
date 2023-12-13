import jwt, { JsonWebTokenError, JwtHeader, JwtPayload, NotBeforeError, TokenExpiredError } from 'jsonwebtoken';

import { Token } from '../models/Token';

// Payload
export interface TokenPayload extends JwtPayload {
  iss: string; // 발급자
  sub: string; // 목적
  exp: number; // 만료시간
  iat: number; // 발급시간
  id: string;
  isAuthToken?: boolean;
  isRefreshToken?: boolean;
}
// AuthToken 유효성검사
export const verifyAuthToken = (authToken: string): TokenPayload | undefined => {
  // eslint-disable-next-line no-constant-condition
  if (!'deepscentSecret') {
    throw new Error('JWT_SECRET is not defined');
  } else {
    try {
      const decodedToken: TokenPayload = jwt.verify(authToken, 'deepscentSecret', {
        issuer: 'deepscent',
        subject: 'b2b',
      }) as TokenPayload;

      if (decodedToken.exp < Date.now()) {
        throw new Error('Auth token expired');
      }

      if (decodedToken.isAuthToken) {
        return decodedToken;
      } else {
        throw new Error('Invalid auth token');
      }
    } catch (err: unknown) {
      if (err instanceof TokenExpiredError) {
        throw new Error('Auth token expired');
      } else if (err instanceof JsonWebTokenError) {
        throw new Error('Invalid auth token');
      } else if (err instanceof NotBeforeError) {
        throw new Error('Invalid auth token');
      } else {
        throw new Error('Invalid auth token');
      }
    }
  }
};

export const generateAuthToken = (id: string): Token | null => {
  const header: JwtHeader = {
    typ: 'JWT',
    alg: 'HS256',
  };

  // Expire date is 1 days from now
  const stdDate = new Date();
  const expireDate = new Date(stdDate);
  const refreshexpireDate = new Date(stdDate);
  expireDate.setMinutes(expireDate.getMinutes() + 10);
  refreshexpireDate.setDate(expireDate.getDate() + 14);
  //expireDate.setDate(expireDate.getDate() + 1);

  // payload 정의
  const payload: TokenPayload = {
    iss: 'deepscent',
    sub: 'b2b',
    exp: expireDate.getTime(),
    iat: Date.now(),
    id,
    isAuthToken: true,
  };

  const refreshpayload: TokenPayload = {
    iss: 'deepscent',
    sub: 'b2b',
    exp: refreshexpireDate.getTime(),
    iat: Date.now(),
    id,
    isRefreshoken: true,
  };

  // jwt.sign 사용하여서 페이로드 , 시크릿키 , 헤더 이용하여 토큰 생성
  const authToken: string = jwt.sign(payload, 'deepscentSecret', { header });
  const refreshToken: string = jwt.sign(refreshpayload, 'deepscentSecret', { header });
  const token: Token = {
    id,
    authToken,
    refreshToken,
    expireDate,
  };

  return token;
};
