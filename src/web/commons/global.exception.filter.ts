import {
    ArgumentsHost,
    BadRequestException,
    Catch,
    ExceptionFilter,
    ForbiddenException,
    HttpException,
    HttpStatus,
    Logger,
    UnauthorizedException,
} from '@nestjs/common';
import {Request, Response} from 'express';
import {MulterError} from 'multer';
import {ApiResponse} from './api.response.js';
import {BusinessException} from '../../domain/exceptions/business.exception.js';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger('GlobalExceptionHandler');

    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Ocorreu um erro inesperado';
        let code = 'INTERNAL_ERROR';
        let data = null;

        if (exception instanceof BusinessException) {
            status = HttpStatus.BAD_REQUEST;
            message = exception.message;
            code = 'BUSINESS_ERROR';
            this.logger.warn(`Business exception: ${message} - Path: ${request.url}`);
        }

        else if (exception instanceof MulterError) {
            status = HttpStatus.BAD_REQUEST;
            code = 'VALIDATION_ERROR';
            message = exception.code === 'LIMIT_FILE_SIZE'
                ? 'O comprovante deve ter no máximo 10MB.'
                : 'Falha ao processar o arquivo enviado.';
            this.logger.warn(`Multer error: ${exception.code} - Path: ${request.url}`);
        }

        else if (exception instanceof BadRequestException) {
            status = HttpStatus.BAD_REQUEST;
            const res = exception.getResponse() as any;
            message = 'Falha na validação dos dados';
            code = 'VALIDATION_ERROR';
            data = res.message;
            this.logger.warn(`Validation failed - Path: ${request.url}`);
        }

        else if (exception instanceof UnauthorizedException) {
            status = HttpStatus.UNAUTHORIZED;
            message = 'Credenciais inválidas';
            code = 'AUTHENTICATION_FAILED';
            this.logger.warn(`Authentication failed - Path: ${request.url}`);
        }

        else if (exception instanceof ForbiddenException) {
            status = HttpStatus.FORBIDDEN;
            message = 'Acesso negado';
            code = 'ACCESS_DENIED';
            this.logger.warn(`Access denied - Path: ${request.url}`);
        }

        else if (exception instanceof HttpException) {
            status = exception.getStatus();
            const res = exception.getResponse() as any;
            message = res.message || exception.message;
            this.logger.error(`HTTP Error: ${message} - Path: ${request.url}`);
        }

        else {
            this.logger.error(`Unexpected error: ${exception.message}`, exception.stack);
            if (process.env.NODE_ENV === 'development') {
                message = exception.message;
            }
        }

        const apiResponse = ApiResponse.error(message, code);
        if (data) apiResponse['data'] = data;

        response.status(status).json(apiResponse);
    }
}