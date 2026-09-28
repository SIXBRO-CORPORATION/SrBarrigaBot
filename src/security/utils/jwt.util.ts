import {Injectable} from '@nestjs/common';
import jwt from 'jsonwebtoken';
import {CustomUserDetails} from '../model/custom-user-details.js';

export type TokenType = 'access' | 'refresh';

@Injectable()
export class JwtUtil {
    private readonly jwtSecret: string;

    constructor() {
        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET não configurado no .env');
        }
        this.jwtSecret = process.env.JWT_SECRET;
    }

    generateAccessToken(userDetails: CustomUserDetails): string {
        return this.sign(userDetails, 'access', '24h');
    }

    generateRefreshToken(userDetails: CustomUserDetails): string {
        return this.sign(userDetails, 'refresh', '7d');
    }

    verify(token: string, type: TokenType): {sub: string; userId: string} {
        const decoded = jwt.verify(token, this.jwtSecret) as any;
        if (decoded.typ !== type) {
            throw new Error('Tipo de token inválido');
        }
        return decoded;
    }

    private sign(userDetails: CustomUserDetails, typ: TokenType, expiresIn: '24h' | '7d'): string {
        return jwt.sign(
            {sub: userDetails.username, userId: userDetails.userId, typ},
            this.jwtSecret,
            {expiresIn},
        );
    }
}
