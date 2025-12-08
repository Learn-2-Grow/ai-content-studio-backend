import { LoginDto } from 'src/modules/auth/dto/login.dto';
import { RegisterDto } from 'src/modules/auth/dto/register.dto';

export const mockRegisterDto: RegisterDto = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
};

export const mockLoginDto: LoginDto = {
    email: 'test@example.com',
    password: 'password123',
};

export const mockAccessToken = 'mock-access-token';
export const mockRefreshToken = 'mock-refresh-token';
