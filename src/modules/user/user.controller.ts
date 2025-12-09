import { Controller, Get, UseFilters, UseGuards } from '@nestjs/common';
import { User } from 'src/common/decorators/user.decorator';
import { HttpExceptionFilter } from 'src/common/filters/http-exception.filter';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { IUser } from 'src/common/interfaces/user.interface';
import { UserService } from './user.service';

@Controller('users')
@UseGuards(JwtAuthGuard)
@UseFilters(HttpExceptionFilter)
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Get('me')
    async me(@User() user: IUser): Promise<IUser> {
        return this.userService.me(user);
    }


}