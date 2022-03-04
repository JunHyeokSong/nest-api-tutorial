import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import * as argon from 'argon2';
import { ModelService } from 'src/model/model.service';
import { AuthDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private model: ModelService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  // create user
  async signup(dto: AuthDto) {
    // 1. Generate the password hash
    const hash = await argon.hash(dto.password);

    // 2. Save new user in the DB
    try {
      const user = await this.model.user.create({
        data: {
          email: dto.email,
          hash,
        },
      });
      delete user.hash;

      // 3. return the saved user
      return this.signToken(user.id, user.email);
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError) {
        if (err.code === 'P2002') {
          throw new ForbiddenException('Credential already taken');
        }
      }
      throw err;
    }
  }

  async signin(dto: AuthDto) {
    const user = await this.model.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (!user) throw new ForbiddenException('credential incorrect');

    const pwMatch = await argon.verify(user.hash, dto.password);

    if (!pwMatch) throw new ForbiddenException('credential incorrect');

    delete user.hash;
    return this.signToken(user.id, user.email);
  }

  async signToken(
    userId: number,
    email: string,
  ): Promise<{ access_token: string }> {
    const payload = {
      sub: userId,
      email,
    };
    const secret = this.config.get('JWT_SECRET');
    const token = await this.jwt.signAsync(payload, {
      expiresIn: '15m',
      secret: secret,
    });
    return {
      access_token: token,
    };
  }
}
