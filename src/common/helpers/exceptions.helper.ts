import {
    BadRequestException,
    HttpException,
    HttpStatus,
    NotFoundException,
    UnauthorizedException
} from '@nestjs/common';

export interface IError {
    status: number;
    errorCode: string;
    message: string;
    data: object;
}

export class ExceptionHelper {
    private static instance: ExceptionHelper;

    static getInstance(): ExceptionHelper {
        ExceptionHelper.instance = ExceptionHelper.instance || new ExceptionHelper();
        return ExceptionHelper.instance;
    }

    notFoundException(message: string): void {
        throw new NotFoundException({
            statusCode: HttpStatus.NOT_FOUND,
            message: [message],
        });
    }
    unauthorizedException({ message }: { message: string }): void {
        throw new UnauthorizedException({
            statusCode: HttpStatus.UNAUTHORIZED,
            message: [message],
        });
    }

    badRequestException(message: string): void {
        throw new BadRequestException({
            statusCode: HttpStatus.FORBIDDEN,
            message: [message],
        });
    }


    defaultError(message: string, errorCode: string, statusCode: number, data?: any): void {
        const error: IError = {
            status: statusCode,
            errorCode: errorCode,
            message: message ? message : '',
            data: data ? data : {},
        };
        throw new HttpException(error, statusCode);
    }
}
