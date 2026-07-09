import { ApiProperty } from "@nestjs/swagger"
import { Quality } from "@prisma/client"
import { IsEnum, IsString, MaxLength } from "class-validator"

export class CreateMovieFileDto {
    @ApiProperty({enum: Quality})
    @IsEnum(Quality)
    quality!: Quality

    @ApiProperty()
    @IsString()
    @MaxLength(20)
	language!: string
}
