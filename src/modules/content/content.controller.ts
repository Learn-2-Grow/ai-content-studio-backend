import { Body, Controller, Get, Param, Patch, Post, UseFilters, UseGuards } from '@nestjs/common';
import { HttpExceptionFilter } from 'src/common/filters/http-exception.filter';
import { IUser } from 'src/common/interfaces/user.interface';
import { GetUser } from '../../common/decorators/getUser.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { SseService } from '../sse/sse.service';
import { ContentService } from './content.service';
import { GenerateContentDto } from './dto/generate-content.dto';
import { UpdateContentDto } from './dto/update-content.dto';



@Controller('content')
@UseGuards(JwtAuthGuard)
@UseFilters(HttpExceptionFilter)
export class ContentController {
    constructor(
        private readonly contentService: ContentService,
        private readonly sseService: SseService,
    ) { }

    @Post('generate')
    generateContent(
        @GetUser() user: IUser,
        @Body() generateContentDto: GenerateContentDto
    ) {
        return this.contentService.generateContent(user, generateContentDto);
    }

    @Get(':id')
    findOne(@GetUser() user: any, @Param('id') id: string) {
        return this.contentService.findOne(id, user.userId);
    }

    @Patch(':id')
    updateSentiment(
        @Param('id') id: string,
        @Body() updateContentDto: UpdateContentDto) {
        return this.contentService.update(id, updateContentDto);
    }
}
