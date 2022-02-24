import { ForbiddenException, Injectable } from '@nestjs/common';
import { ModelService } from 'src/model/model.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';

@Injectable()
export class AuthService {
  constructor(private model: ModelService) {}

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
      return user;
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
    return user;
  }
}
