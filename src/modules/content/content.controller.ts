import { Body, Controller, Delete, Get, Param, Post, Put, UseFilters, UseGuards } from '@nestjs/common';
import { HttpExceptionFilter } from 'src/common/filters/http-exception.filter';
import { IUser } from 'src/interfaces/user.interface';
import { GetUser } from '../../common/decorators/getUser.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ContentService } from './content.service';
import { GenerateContentDto } from './dto/generate-content.dto';
import { UpdateContentDto } from './dto/update-content.dto';



@Controller('content')
@UseGuards(JwtAuthGuard)
@UseFilters(HttpExceptionFilter)
export class ContentController {
    constructor(private readonly contentService: ContentService) { }

    @Post('generate-content')
    async generateContent(
        @GetUser() user: IUser,
        @Body() generateContentDto: GenerateContentDto
    ) {
        return await this.contentService.generateContent(user, generateContentDto);

    }

    @Get(':id')
    async findOne(@GetUser() user: any, @Param('id') id: string) {
        return this.contentService.findOne(id, user.userId);
    }

    @Put(':id')
    async update(
        @GetUser() user: any,
        @Param('id') id: string,
        @Body() updateContentDto: UpdateContentDto,
    ) {
        return this.contentService.update(id, user.userId, updateContentDto);
    }

    @Delete(':id')
    async remove(@GetUser() user: any, @Param('id') id: string) {
        await this.contentService.remove(id, user.userId);
        return { message: 'Content deleted successfully' };
    }
}
