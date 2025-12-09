import { Controller, Get, Param, Query, UseFilters, UseGuards } from '@nestjs/common';
import { HttpExceptionFilter } from 'src/common/filters/http-exception.filter';
import { IThreadPagination, IThreadSummary } from 'src/common/interfaces/thread.interface';
import { IUser } from 'src/common/interfaces/user.interface';
import { GetUser } from '../../common/decorators/getUser.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ThreadQueriesDto } from './dto/queries.dto';
import { ThreadService } from './thread.service';

@Controller('threads')
@UseGuards(JwtAuthGuard)
@UseFilters(HttpExceptionFilter)
export class ThreadController {
    constructor(private readonly threadService: ThreadService) { }


    @Get('summary')
    async getSummary(@GetUser() user: IUser): Promise<IThreadSummary> {
        return this.threadService.getSummary(user);
    }

    @Get()
    async findAll(
        @GetUser() user: IUser,
        @Query() threadQueriesDto: ThreadQueriesDto
    ): Promise<IThreadPagination> {
        return this.threadService.findAll(user, threadQueriesDto);
    }

    @Get(':id')
    async findOne(@GetUser() user: any, @Param('id') id: string) {
        return this.threadService.findOne(user, id);
    }



}
