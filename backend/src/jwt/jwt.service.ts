import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';
import { randomUUID } from "crypto";
import { Injectable } from '@@/factory/SocketDecorators';

@Injectable()
export class JwtService {
  private secretKey = randomUUID();

  public sign (payload: string | object | Buffer, options?: SignOptions) {
    return new Promise<string>((resolve, reject) => {
      jwt.sign(
        payload,
        this.secretKey,
        { algorithm: 'HS256', ...options },
        (err, token) => {
          if (err) {
            reject(err);
          } else if (token) {
            resolve(token);
          }
        }
      );
    });
  }

  public verify (token: string) {
    return new Promise<string | JwtPayload>((resolve, reject) => {
      jwt.verify(token, this.secretKey, (err, decoded) => {
        if (err) {
          reject(err);
        } else if (decoded) {
          resolve(decoded);
        }
      });
    })
  }
}
