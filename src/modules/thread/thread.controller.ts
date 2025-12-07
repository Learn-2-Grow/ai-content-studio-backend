import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseFilters, UseGuards } from '@nestjs/common';
import { HttpExceptionFilter } from 'src/common/filters/http-exception.filter';
import { IThreadPagination, IThreadSummary } from 'src/interfaces/thread.interface';
import { IUser } from 'src/interfaces/user.interface';
import { GetUser } from '../../common/decorators/getUser.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateThreadDto } from './dto/create-thread.dto';
import { ThreadQueriesDto } from './dto/queries.dto';
import { UpdateThreadDto } from './dto/update-thread.dto';
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

    @Post()
    async create(@GetUser() user: any, @Body() createThreadDto: CreateThreadDto) {
        return this.threadService.create(user, createThreadDto);
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

    @Put(':id')
    async update(
        @GetUser() user: any,
        @Param('id') id: string,
        @Body() updateThreadDto: UpdateThreadDto,
    ) {
        return this.threadService.update(id, user.userId, updateThreadDto);
    }

    @Delete(':id')
    async remove(@GetUser() user: any, @Param('id') id: string) {
        await this.threadService.remove(id, user.userId);
        return { message: 'Thread deleted successfully' };
    }
}
