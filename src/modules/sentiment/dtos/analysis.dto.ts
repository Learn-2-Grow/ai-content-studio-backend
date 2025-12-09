import { IsNotEmpty, IsString } from "class-validator";

export class AnalysisDto {
    @IsString()
    @IsNotEmpty()
    prompt: string;

    @IsString()
    @IsNotEmpty()
    contentId: string;
}