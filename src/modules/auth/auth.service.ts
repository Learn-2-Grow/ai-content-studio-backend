import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ExceptionHelper } from 'src/common/helpers/exceptions.helper';
import { IAuthResponse } from 'src/interfaces/auth.interface';
import { IUser } from 'src/interfaces/user.interface';
import { UserService } from '../user/user.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        private userService: UserService,
        private jwtService: JwtService,
        private configService: ConfigService,
    ) { }

    async register(registerDto: RegisterDto): Promise<IAuthResponse> {

        const { name, email, password } = registerDto;
        // Create user using UserService
        const user: IUser = await this.userService.create({
            name,
            email,
            password,
        });

        this.logger.log(`New user registered: ${email}`);

        const authResponse: IAuthResponse = {
            user: user,
        }

        // Generate auth tokens
        if (user) {
            const { accessToken, refreshToken } = await this.generateAuthTokens(user);
            authResponse.tokens = { accessToken, refreshToken };
        }

        return authResponse;
    }

    async login(loginDto: LoginDto): Promise<IAuthResponse> {

        const { email, password } = loginDto;

        // Validate user
        const user: IUser | null = await this.userService.isActiveByEmail(email);
        if (!user) {
            ExceptionHelper.getInstance().defaultError('Invalid email', 'INVALID_EMAIL', HttpStatus.UNAUTHORIZED);
        }

        // Verify password
        const isPasswordValid = await this.userService.comparePassword(password, user.password);
        if (!isPasswordValid) {
            ExceptionHelper.getInstance().defaultError('Invalid password', 'INVALID_PASSWORD', HttpStatus.UNAUTHORIZED);
        }

        // Generate auth tokens
        const { accessToken, refreshToken } = await this.generateAuthTokens(user);

        this.logger.log(`User logged in: ${email}`);
        return { user, tokens: { accessToken, refreshToken } };
    }

    async generateAuthTokens(user: IUser): Promise<{ accessToken: string; refreshToken: string }> {

        const metadata = { sub: user._id.toString(), email: user.email, userType: user.userType };
        const expiresIn = this.configService.get<string>('JWT_EXPIRES_IN') || '7d';

        const { token: accessToken } = await this.generateTokens(metadata, expiresIn);
        const { token: refreshToken } = await this.generateTokens(metadata, '30d');

        return { accessToken, refreshToken };
    }

    async generateTokens(metadata: Object, expiresIn: string): Promise<{ token: string }> {

        const secret = this.configService.get<string>('JWT_SECRET');
        const token: string = await this.jwtService.signAsync(metadata as any, { secret, expiresIn: expiresIn as any });
        return { token };
    }

    async validateUser(userId: string) {
        return this.userService.findById(userId);
    }

}
