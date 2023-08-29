import { Inject, Injectable } from "@@/factory/SocketDecorators";
import { User } from "./user.entity";
import { SignInParams, SignUpParams } from "./user.dto";
import { sha256 } from "@/utils/sha256";
import { MysqlService } from "@@/library/Mysql/mysql.service";
import { JwtService } from "@/jwt/jwt.service";
import { ResponseError } from "@@/factory/Response";

@Injectable()
export class UserService {
  @Inject(JwtService)
  declare jwtService: JwtService;

  public async checkIsRegistered (id: number) {
    const res = await User.findOne({
      where: { id }
    })
  }

  public async signUp (data: SignUpParams) {
    try {
      return await MysqlService.repository.transaction(async t => {
        const { id, fingerprint } = await User.create({
          ...data
        }, {
          transaction: t
        });

        const udid = sha256(JSON.stringify({
          id,
          fingerprint
        }));

        await User.update({ udid }, {
          where: { id },
          transaction: t
        });

        return udid
      });
    } catch(err) {
      throw new ResponseError(1000, 'Registration failed. Please contact the administrator.')
    }
  }

  public async signIn (data: SignInParams) {
    const { udid, fingerprint } = data;
    const user = await User.findOne({
      where: { udid }
    });
    if(!user || user.fingerprint !== fingerprint) {
      throw new ResponseError(1001, 'Device does not signed up');
    }

    try {
      const token = await this.jwtService.sign({ id: user.id });
      return token;
    } catch(e) {
      throw new ResponseError(1002, 'Fail to sign jwt');
    }
  }
}
