import { IsOptional, IsString } from "class-validator";

export class ThreadQueriesDto {
    @IsOptional()
    @IsString()
    threadIds?: string[];

    @IsOptional()
    @IsString()
    userId?: string;

    @IsOptional()
    @IsString()
    sortOrder?: string;
}   