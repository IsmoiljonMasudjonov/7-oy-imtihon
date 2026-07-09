import { ApiProperty } from "@nestjs/swagger"
import { IsString, MaxLength } from "class-validator"

export class CreateCategoryDto {
    @ApiProperty()
    @IsString()
    @MaxLength(50)
    name!: string

    @ApiProperty()
    @IsString()
    @MaxLength(50)
	slug!: string

    @ApiProperty()
    @IsString()
	description!: string
}
