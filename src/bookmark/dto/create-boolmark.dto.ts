import { IsNotEmpty, IsOptional, IsString, IsUrl, IsInt } from "class-validator";

export class CreateBookmarkDto {
    @IsString()
    title: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsNotEmpty()
    @IsUrl()
    link: string;

    @IsOptional()
    @IsInt()
    categoryId?: number;
}