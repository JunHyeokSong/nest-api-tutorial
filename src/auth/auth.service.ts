import { Injectable } from "@nestjs/common";
import { ModelService } from "src/model/model.service";
import { AuthDto } from "./dto";
import * as argon from 'argon2'

@Injectable()
export class AuthService {

    constructor(private model: ModelService) {

    }

    // create user
    async signup(dto: AuthDto) {
        // 1. Generate the password hash
        const hash = await argon.hash(dto.password);

        // 2. Save new user in the DB 
        const user = await this.model.user.create({
            data: {
                email: dto.email,
                hash,
            },
        })

        delete user.hash;
        // 3. return the saved user
        return user;
    }
    
    signin() {
        return { msg: 'I have signed in!' };
    }

}