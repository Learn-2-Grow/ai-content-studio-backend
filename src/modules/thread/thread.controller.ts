import { Body, Controller, Delete, Param, Post, Put, UseFilters, UseGuards } from '@nestjs/common';
import { HttpExceptionFilter } from 'src/common/filters/http-exception.filter';
import { GetUser } from '../../common/decorators/getUser.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateThreadDto } from './dto/create-thread.dto';
import { UpdateThreadDto } from './dto/update-thread.dto';
import { ThreadService } from './thread.service';

@Controller('content/threads')
@UseGuards(JwtAuthGuard)
@UseFilters(HttpExceptionFilter)
export class ThreadController {
    constructor(private readonly threadService: ThreadService) { }

    @Post()
    async create(@GetUser() user: any, @Body() createThreadDto: CreateThreadDto) {
        return this.threadService.create(user, createThreadDto);
    }

    // @Get()
    // async findAll(@GetUser() user: any) {
    //     return this.threadService.findAll(user.userId);
    // }

    // @Get(':id')
    // async findOne(@GetUser() user: any, @Param('id') id: string) {
    //     return this.threadService.findOne(id, user.userId);
    // }

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
