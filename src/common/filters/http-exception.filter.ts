import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost): void {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const status = exception.getStatus();
        const exceptionResponse = exception.getResponse();

        let exceptionMessages = exceptionResponse['message'];
        let message = '';
        let errorCodes: string | string[] = '';

        if (Array.isArray(exceptionMessages)) {
            message = exceptionMessages.join(', ');
        } else {
            message = exceptionMessages || exception.message;
        }

        if (exceptionMessages) {
            if (Array.isArray(exceptionMessages) && exceptionMessages.length > 1) {
                errorCodes = [];
                for (let i = 0; i < exceptionMessages.length; i++) {
                    (errorCodes as string[]).push(String(exceptionMessages[i]).replace(/\s+/g, '_').toLowerCase());
                }
            } else if (Array.isArray(exceptionMessages) && exceptionMessages.length === 1) {
                errorCodes = String(exceptionMessages[0]).replace(/\s+/g, '_').toLowerCase();
            } else {
                errorCodes = String(exceptionMessages).replace(/\s+/g, '_').toLowerCase();
            }
        }

        response.status(status).json({
            status: status,
            errorCode: exceptionResponse['errorCode'] ?? errorCodes,
            message: message,
            data: exceptionResponse['data'] ?? {},
        });
    }
}
