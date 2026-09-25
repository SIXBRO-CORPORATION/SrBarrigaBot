import {Injectable} from "@nestjs/common";

import {User} from "../../domain/user.js";
import {UserResponse} from "../model/response/user.response.js";

@Injectable()
export class UserMapper {

    public toResponse(user: User): UserResponse {
        return new UserResponse({
            id: user.id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt,
        });
    }

}