import { Injectable } from "@nestjs/common";
import { ModelService } from "src/model/model.service";

@Injectable()
export class AuthService {

    constructor(private model: ModelService) {

    }

    // create user
    signup() {
        return { msg: 'I have signed up!' };
    }
    
    signin() {
        return { msg: 'I have signed in!' };
    }

}