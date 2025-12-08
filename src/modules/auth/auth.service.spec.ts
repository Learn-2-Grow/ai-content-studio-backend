import { HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { IAuthResponse } from 'src/interfaces/auth.interface';
import { IUser } from 'src/interfaces/user.interface';
import { mockAccessToken, mockLoginDto, mockRefreshToken, mockRegisterDto } from '../../../test/mocks/auth.mocks';
import { mockUser } from '../../../test/mocks/user.mocks';
import { ExceptionHelper } from '../../common/helpers/exceptions.helper';
import { UserService } from '../user/user.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
    let service: AuthService;
    let userService: jest.Mocked<UserService>;
    let jwtService: jest.Mocked<JwtService>;
    let configService: jest.Mocked<ConfigService>;

    beforeEach(async () => {
        const mockUserService = {
            create: jest.fn(),
            isActiveByEmail: jest.fn(),
            comparePassword: jest.fn(),
            findById: jest.fn(),
        };

        const mockJwtService = {
            signAsync: jest.fn(),
        };

        const mockConfigService = {
            get: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: UserService,
                    useValue: mockUserService,
                },
                {
                    provide: JwtService,
                    useValue: mockJwtService,
                },
                {
                    provide: ConfigService,
                    useValue: mockConfigService,
                },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
        userService = module.get(UserService);
        jwtService = module.get(JwtService);
        configService = module.get(ConfigService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('register', () => {
        it('should register a new user successfully', async () => {
            const createdUser: IUser = {
                ...mockUser,
                name: mockRegisterDto.name,
                email: mockRegisterDto.email,
            } as any;

            userService.create.mockResolvedValue(createdUser);
            configService.get.mockImplementation((key: string) => {
                if (key === 'JWT_SECRET') return 'test-secret';
                if (key === 'JWT_EXPIRES_IN') return '7d';
                return undefined;
            });
            jwtService.signAsync.mockResolvedValueOnce(mockAccessToken);
            jwtService.signAsync.mockResolvedValueOnce(mockRefreshToken);

            const result: IAuthResponse = await service.register(mockRegisterDto);

            expect(userService.create).toHaveBeenCalledWith({
                name: mockRegisterDto.name,
                email: mockRegisterDto.email,
                password: mockRegisterDto.password,
            });
            expect(result.user).toEqual({
                _id: createdUser._id,
                name: createdUser.name,
                email: createdUser.email,
            });
            expect(result.tokens).toEqual({
                access: mockAccessToken,
                refresh: mockRefreshToken,
            });
        });

        it('should throw error when user creation fails', async () => {
            const error = new Error('User already exists');
            userService.create.mockRejectedValue(error);

            await expect(service.register(mockRegisterDto)).rejects.toThrow('User already exists');

            expect(userService.create).toHaveBeenCalledWith({
                name: mockRegisterDto.name,
                email: mockRegisterDto.email,
                password: mockRegisterDto.password,
            });
        });
    });

    describe('login', () => {
        it('should login user successfully with valid credentials', async () => {
            userService.isActiveByEmail.mockResolvedValue(mockUser);
            userService.comparePassword.mockResolvedValue(true);
            configService.get.mockImplementation((key: string) => {
                if (key === 'JWT_SECRET') return 'test-secret';
                if (key === 'JWT_EXPIRES_IN') return '7d';
                return undefined;
            });
            jwtService.signAsync.mockResolvedValueOnce(mockAccessToken);
            jwtService.signAsync.mockResolvedValueOnce(mockRefreshToken);

            const result: IAuthResponse = await service.login(mockLoginDto);

            expect(userService.isActiveByEmail).toHaveBeenCalledWith(mockLoginDto.email);
            expect(userService.comparePassword).toHaveBeenCalledWith(mockLoginDto.password, mockUser.password);
            expect(result.user).toEqual({
                _id: mockUser._id,
                name: mockUser.name,
                email: mockUser.email,
            });
            expect(result.tokens).toEqual({
                access: mockAccessToken,
                refresh: mockRefreshToken,
            });
        });

        it('should throw error when user is not found', async () => {
            userService.isActiveByEmail.mockResolvedValue(null);
            const exceptionHelper = ExceptionHelper.getInstance();
            const defaultErrorSpy = jest.spyOn(exceptionHelper, 'defaultError').mockImplementation(() => {
                throw new Error('Invalid email');
            });

            await expect(service.login(mockLoginDto)).rejects.toThrow('Invalid email');

            expect(userService.isActiveByEmail).toHaveBeenCalledWith(mockLoginDto.email);
            expect(defaultErrorSpy).toHaveBeenCalledWith(
                'Invalid email',
                'INVALID_EMAIL',
                HttpStatus.UNAUTHORIZED
            );
            expect(userService.comparePassword).not.toHaveBeenCalled();

            defaultErrorSpy.mockRestore();
        });

        it('should throw error when password is invalid', async () => {
            userService.isActiveByEmail.mockResolvedValue(mockUser);
            userService.comparePassword.mockResolvedValue(false);
            const exceptionHelper = ExceptionHelper.getInstance();
            const defaultErrorSpy = jest.spyOn(exceptionHelper, 'defaultError').mockImplementation(() => {
                throw new Error('Invalid password');
            });

            await expect(service.login(mockLoginDto)).rejects.toThrow('Invalid password');

            expect(userService.isActiveByEmail).toHaveBeenCalledWith(mockLoginDto.email);
            expect(userService.comparePassword).toHaveBeenCalledWith(mockLoginDto.password, mockUser.password);
            expect(defaultErrorSpy).toHaveBeenCalledWith(
                'Invalid password',
                'INVALID_PASSWORD',
                HttpStatus.UNAUTHORIZED
            );

            defaultErrorSpy.mockRestore();
        });
    });

    describe('generateAuthTokens', () => {
        it('should generate access and refresh tokens', async () => {
            configService.get.mockImplementation((key: string) => {
                if (key === 'JWT_SECRET') return 'test-secret';
                if (key === 'JWT_EXPIRES_IN') return '7d';
                return undefined;
            });
            jwtService.signAsync.mockResolvedValueOnce(mockAccessToken);
            jwtService.signAsync.mockResolvedValueOnce(mockRefreshToken);

            const result = await service.generateAuthTokens(mockUser);

            expect(configService.get).toHaveBeenCalledWith('JWT_EXPIRES_IN');
            expect(jwtService.signAsync).toHaveBeenCalledTimes(2);
            expect(result).toEqual({
                accessToken: mockAccessToken,
                refreshToken: mockRefreshToken,
            });
        });

        it('should use default expiresIn when JWT_EXPIRES_IN is not set', async () => {
            configService.get.mockImplementation((key: string) => {
                if (key === 'JWT_SECRET') return 'test-secret';
                if (key === 'JWT_EXPIRES_IN') return undefined;
                return undefined;
            });
            jwtService.signAsync.mockResolvedValueOnce(mockAccessToken);
            jwtService.signAsync.mockResolvedValueOnce(mockRefreshToken);

            const result = await service.generateAuthTokens(mockUser);

            expect(configService.get).toHaveBeenCalledWith('JWT_EXPIRES_IN');
            expect(jwtService.signAsync).toHaveBeenCalledTimes(2);
            expect(result).toEqual({
                accessToken: mockAccessToken,
                refreshToken: mockRefreshToken,
            });
        });
    });

    describe('generateTokens', () => {
        it('should generate a token with metadata and expiresIn', async () => {
            const metadata = { sub: 'user-id', email: 'test@example.com' };
            const expiresIn = '7d';
            const secret = 'test-secret';

            configService.get.mockReturnValue(secret);
            jwtService.signAsync.mockResolvedValue(mockAccessToken);

            const result = await service.generateTokens(metadata, expiresIn);

            expect(configService.get).toHaveBeenCalledWith('JWT_SECRET');
            expect(jwtService.signAsync).toHaveBeenCalledWith(metadata, {
                secret,
                expiresIn,
            });
            expect(result).toEqual({ token: mockAccessToken });
        });
    });

    describe('validateUser', () => {
        it('should validate user by id', async () => {
            userService.findById.mockResolvedValue(mockUser);

            const result = await service.validateUser(mockUser._id.toString());

            expect(userService.findById).toHaveBeenCalledWith(mockUser._id.toString());
            expect(result).toEqual(mockUser);
        });

        it('should return null when user is not found', async () => {
            userService.findById.mockResolvedValue(null);

            const result = await service.validateUser('non-existent-id');

            expect(userService.findById).toHaveBeenCalledWith('non-existent-id');
            expect(result).toBeNull();
        });
    });
});
