import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import {JwtUtil} from '../utils/jwt.util.js';
import {CustomUserDetailsService} from '../services/custom-user-details.service.js';

@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(
        private readonly jwtUtil: JwtUtil,
        private readonly userDetailsService: CustomUserDetailsService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);

        if (!token) {
            throw new UnauthorizedException('Token não fornecido');
        }

        try {
            const {sub} = this.jwtUtil.verify(token, 'access');
            const userDetails = await this.userDetailsService.loadUserByUsername(sub);

            request.user = {
                id: userDetails.userId,
                email: userDetails.username,
            };

            return true;
        } catch (error) {
            throw new UnauthorizedException('Token inválido ou expirado');
        }
    }

    private extractTokenFromHeader(request: any): string | undefined {
        const authHeader = request.headers.authorization;
        if (!authHeader) {
            return undefined;
        }

        const [type, token] = authHeader.split(' ');
        return type === 'Bearer' ? token : undefined;
    }
}
