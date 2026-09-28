import {Injectable, UnauthorizedException} from '@nestjs/common';
import {RefreshTokenPort} from '../../core/security/refresh-token.port.js';
import {Context} from '../../core/context.js';
import {Jwt} from '../../domain/jwt.js';
import {CustomUserDetailsService} from '../services/custom-user-details.service.js';
import {JwtUtil} from '../utils/jwt.util.js';

@Injectable()
export class RefreshTokenAdapter implements RefreshTokenPort {
    constructor(
        private readonly jwtUtil: JwtUtil,
        private readonly userDetailsService: CustomUserDetailsService
    ) {}

    async execute(context: Context): Promise<Jwt> {
        const refreshToken = context.getProperty<string>('refreshToken', String);

        if (!refreshToken) {
            throw new UnauthorizedException('Refresh token is missing');
        }

        try {
            const {sub} = this.jwtUtil.verify(refreshToken, 'refresh');
            const userDetails = await this.userDetailsService.loadUserByUsername(sub);

            const newAccessToken = this.jwtUtil.generateAccessToken(userDetails);
            const newRefreshToken = this.jwtUtil.generateRefreshToken(userDetails);

            const jwt = new Jwt();
            jwt.access_token = newAccessToken;
            jwt.refresh_token = newRefreshToken;
            jwt.type = 'Bearer';

            return jwt;
        } catch (error) {
            throw new UnauthorizedException('Invalid refresh token format');
        }
    }
}