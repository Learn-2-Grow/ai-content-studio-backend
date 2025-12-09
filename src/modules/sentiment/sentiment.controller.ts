import { Body, Controller, Post, UseFilters, UseGuards } from "@nestjs/common";
import { GetUser } from "src/common/decorators/getUser.decorator";
import { HttpExceptionFilter } from "src/common/filters/http-exception.filter";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import { IUser } from "src/common/interfaces/user.interface";
import { AnalysisDto } from "./dtos/analysis.dto";
import { SentimentService } from "./sentiment.service";

@Controller('sentiment')
@UseGuards(JwtAuthGuard)
@UseFilters(HttpExceptionFilter)

export class SentimentController {
    constructor(private readonly sentimentService: SentimentService) { }

    @Post('analyze')
    async analyzeSentiment(
        @GetUser() user: IUser,
        @Body() body: AnalysisDto
    ): Promise<{ sentiment: string }> {
        return await this.sentimentService.analyzeSentiment(user, body);
    }
}