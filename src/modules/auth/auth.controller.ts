import { Body, Controller, Post } from '@nestjs/common';
import { IAuthResponse } from 'src/common/interfaces/auth.interface';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('register')
    async register(@Body() registerDto: RegisterDto): Promise<IAuthResponse> {
        return this.authService.register(registerDto);
    }

    @Post('login')
    async login(@Body() loginDto: LoginDto): Promise<IAuthResponse> {
        return this.authService.login(loginDto);
    }

    @Post('refresh')
    async refreshToken(@Body() refreshTokenDto: RefreshTokenDto): Promise<IAuthResponse> {
        return this.authService.refreshToken(refreshTokenDto.refreshToken);
    }
}
