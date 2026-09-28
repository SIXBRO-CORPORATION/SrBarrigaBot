import {Module} from '@nestjs/common';
import {JwtUtil} from '../utils/jwt.util.js';
import {CustomUserDetailsService} from '../services/custom-user-details.service.js';
import {CreateTokenAdapter} from '../adapter/create-token.adapter.js';
import {RefreshTokenAdapter} from '../adapter/refresh-token.adapter.js';
import {JwtAuthGuard} from '../guards/jwt-auth.guard.js';
import {PersistenceModule} from '../../persistence/configuration/persistence.module.js';
import {AuthController} from "../controller/auth.controller.js";
import {CreateTokenPort} from "../../core/security/create-token.port.js";
import {RefreshTokenPort} from "../../core/security/refresh-token.port.js";

@Module({
    imports: [PersistenceModule],
    controllers: [AuthController],
    providers: [
        JwtUtil,
        CustomUserDetailsService,
        JwtAuthGuard,
        { provide: CreateTokenPort, useClass: CreateTokenAdapter },
        { provide: RefreshTokenPort, useClass: RefreshTokenAdapter },
    ],
    exports: [
        JwtUtil,
        CustomUserDetailsService,
        JwtAuthGuard,
        CreateTokenPort,
        RefreshTokenPort,
    ],
})
export class SecurityModule {}