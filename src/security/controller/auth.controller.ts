import {Body, Controller, HttpCode, HttpStatus, Post} from "@nestjs/common";
import {Throttle} from "@nestjs/throttler";
import {CreateTokenPort} from "../../core/security/create-token.port.js";
import {RefreshTokenPort} from "../../core/security/refresh-token.port.js";
import {AuthRequest} from "../model/auth.request.js";
import {Context} from "../../core/context.js";
import {JwtResponse} from "../model/jwt.response.js";
import {Jwt} from "../../domain/jwt.js";
import {ApiResponse} from "../../web/commons/api.response.js";
import {RefreshTokenRequest} from "../model/refresh-token.request.js";


@Controller('auth')
export class AuthController {
    constructor(
        private readonly createTokenPort: CreateTokenPort,
        private readonly refreshTokenPort: RefreshTokenPort,
    ) {}

    @Post('login')
    @Throttle({default: {limit: 5, ttl: 60_000}})
    @HttpCode(HttpStatus.OK)
    async login(@Body() authRequest: AuthRequest): Promise<ApiResponse<JwtResponse>> {
        const context = new Context();
        context.putProperty('username', authRequest.username);
        context.putProperty('password', authRequest.password);

        const jwt: Jwt = await this.createTokenPort.execute(context);

        const data = new JwtResponse({
            access_token: jwt.access_token,
            refresh_token: jwt.refresh_token,
            type: jwt.type,
            role: jwt.role
        });

        return ApiResponse.success(data);
    }

    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    async refresh(@Body() refreshTokenRequest: RefreshTokenRequest): Promise<ApiResponse<JwtResponse>> {
        const context = new Context();
        context.putProperty("refreshToken", refreshTokenRequest.refresh_token);

        const jwt: Jwt = await this.refreshTokenPort.execute(context);

        const data = new JwtResponse({
            access_token: jwt.access_token,
            refresh_token: jwt.refresh_token,
            type: jwt.type,
            role: jwt.role
        });

        return ApiResponse.success(data);
    }
}