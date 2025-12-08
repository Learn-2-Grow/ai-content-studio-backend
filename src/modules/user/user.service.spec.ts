import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcryptjs';
import { IUser } from 'src/interfaces/user.interface';
import { mockCreateUserDto, mockUser } from '../../../test/mocks/user.mocks';
import { ExceptionHelper } from '../../common/helpers/exceptions.helper';
import { CreateUserDto } from './dtos/user.dto';
import { UserType } from './enums/user.enum';
import { UserRepository } from './user.repository';
import { UserService } from './user.service';

describe('UserService', () => {
    let service: UserService;
    let userRepository: jest.Mocked<UserRepository>;

    beforeEach(async () => {
        const mockUserRepository = {
            findById: jest.fn(),
            findByEmail: jest.fn(),
            create: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserService,
                {
                    provide: UserRepository,
                    useValue: mockUserRepository,
                },
            ],
        }).compile();

        service = module.get<UserService>(UserService);
        userRepository = module.get(UserRepository);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('findById', () => {
        it('should return a user when found', async () => {
            userRepository.findById.mockResolvedValue(mockUser);

            const result = await service.findById(mockUser._id.toString());

            expect(userRepository.findById).toHaveBeenCalledWith(mockUser._id.toString());
            expect(result).toEqual(mockUser.toObject());
        });

        it('should return null when user is not found', async () => {
            userRepository.findById.mockResolvedValue(null);

            const result = await service.findById(mockUser._id.toString());

            expect(userRepository.findById).toHaveBeenCalledWith(mockUser._id.toString());
            expect(result).toBeNull();
        });
    });

    describe('isActiveByEmail', () => {
        it('should return a user when found by email', async () => {
            userRepository.findByEmail.mockResolvedValue(mockUser);

            const result = await service.isActiveByEmail(mockUser.email);

            expect(userRepository.findByEmail).toHaveBeenCalledWith(mockUser.email);
            expect(result).toEqual(mockUser);
        });

        it('should return null when user is not found by email', async () => {
            userRepository.findByEmail.mockResolvedValue(null);

            const result = await service.isActiveByEmail('nonexistent@example.com');

            expect(userRepository.findByEmail).toHaveBeenCalledWith('nonexistent@example.com');
            expect(result).toBeNull();
        });
    });

    describe('create', () => {
        it('should create a new user successfully', async () => {
            const hashedPassword = 'hashedPassword123';
            const newUser: IUser = {
                ...mockUser,
                name: mockCreateUserDto.name,
                email: mockCreateUserDto.email,
                password: hashedPassword,
            } as any;

            userRepository.findByEmail.mockResolvedValue(null);
            userRepository.create.mockResolvedValue(newUser);
            jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashedPassword as never);

            const result = await service.create(mockCreateUserDto);

            expect(userRepository.findByEmail).toHaveBeenCalledWith(mockCreateUserDto.email);
            expect(bcrypt.hash).toHaveBeenCalledWith(mockCreateUserDto.password, 10);
            expect(userRepository.create).toHaveBeenCalledWith({
                name: mockCreateUserDto.name.trim(),
                email: mockCreateUserDto.email.trim(),
                password: hashedPassword,
                userType: UserType.USER,
            });
            expect(result).toEqual(newUser);
        });

        it('should throw error when user already exists', async () => {
            userRepository.findByEmail.mockResolvedValue(mockUser);
            const exceptionHelper = ExceptionHelper.getInstance();
            const defaultErrorSpy = jest.spyOn(exceptionHelper, 'defaultError').mockImplementation(() => {
                throw new Error('User already exists');
            });

            await expect(service.create(mockCreateUserDto)).rejects.toThrow('User already exists');

            expect(userRepository.findByEmail).toHaveBeenCalledWith(mockCreateUserDto.email);
            expect(defaultErrorSpy).toHaveBeenCalledWith(
                'User already exists',
                'USER_ALREADY_EXISTS',
                HttpStatus.CONFLICT
            );
            expect(userRepository.create).not.toHaveBeenCalled();

            defaultErrorSpy.mockRestore();
        });

        it('should trim name and email when creating user', async () => {
            const hashedPassword = 'hashedPassword123';
            const createDtoWithSpaces: CreateUserDto = {
                name: '  Trimmed Name  ',
                email: '  trimmed@example.com  ',
                password: 'password123',
            };
            const newUser: IUser = {
                ...mockUser,
                name: 'Trimmed Name',
                email: 'trimmed@example.com',
                password: hashedPassword,
            } as any;

            userRepository.findByEmail.mockResolvedValue(null);
            userRepository.create.mockResolvedValue(newUser);
            jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashedPassword as never);

            await service.create(createDtoWithSpaces);

            expect(userRepository.create).toHaveBeenCalledWith({
                name: 'Trimmed Name',
                email: 'trimmed@example.com',
                password: hashedPassword,
                userType: UserType.USER,
            });
        });

        it('should use empty string for name when name is not provided', async () => {
            const hashedPassword = 'hashedPassword123';
            const createDtoWithoutName: CreateUserDto = {
                name: undefined as any,
                email: 'test@example.com',
                password: 'password123',
            };
            const newUser: IUser = {
                ...mockUser,
                name: '',
                email: 'test@example.com',
                password: hashedPassword,
            } as any;

            userRepository.findByEmail.mockResolvedValue(null);
            userRepository.create.mockResolvedValue(newUser);
            jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashedPassword as never);

            await service.create(createDtoWithoutName);

            expect(userRepository.create).toHaveBeenCalledWith({
                name: '',
                email: 'test@example.com',
                password: hashedPassword,
                userType: UserType.USER,
            });
        });
    });

    describe('hashPassword', () => {
        it('should hash password correctly', async () => {
            const password = 'password123';
            const hashedPassword = 'hashedPassword123';

            jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashedPassword as never);

            const result = await service.hashPassword(password);

            expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
            expect(result).toBe(hashedPassword);
        });
    });

    describe('comparePassword', () => {
        it('should return true when passwords match', async () => {
            const password = 'password123';
            const hashedPassword = 'hashedPassword123';

            jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

            const result = await service.comparePassword(password, hashedPassword);

            expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
            expect(result).toBe(true);
        });

        it('should return false when passwords do not match', async () => {
            const password = 'password123';
            const hashedPassword = 'hashedPassword123';

            jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

            const result = await service.comparePassword(password, hashedPassword);

            expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
            expect(result).toBe(false);
        });
    });

    describe('me', () => {
        it('should return sanitized user data', async () => {
            userRepository.findById.mockResolvedValue(mockUser);

            const result = await service.me(mockUser);

            expect(userRepository.findById).toHaveBeenCalledWith(mockUser._id.toString());
            expect(result).toEqual({
                _id: mockUser._id,
                name: mockUser.name,
                email: mockUser.email,
                sentiment: mockUser.sentiment,
            });
        });

        it('should return sanitized user data without password', async () => {
            userRepository.findById.mockResolvedValue(mockUser);

            const result = await service.me(mockUser);

            expect(result).not.toHaveProperty('password');

        });

        it('should handle user not found scenario', async () => {
            userRepository.findById.mockResolvedValue(null);

            const result = await service.me(mockUser);

            expect(userRepository.findById).toHaveBeenCalledWith(mockUser._id.toString());
            expect(result).toBeNull();
        });

        it('should return sanitized user data with all expected fields', async () => {
            const userWithAllFields: IUser = {
                ...mockUser,
                sentiment: 'neutral',
            } as any;

            userRepository.findById.mockResolvedValue(userWithAllFields);

            const result = await service.me(userWithAllFields);

            expect(result).toHaveProperty('_id');

            expect(result._id).toBe(userWithAllFields._id);

        });
    });
});
