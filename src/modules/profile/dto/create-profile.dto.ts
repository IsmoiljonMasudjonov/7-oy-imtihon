import { ApiProperty } from "@nestjs/swagger"
import { IsString, MaxLength } from "class-validator"

export class CreateProfileDto {
    @ApiProperty()
    @IsString()
    @MaxLength(100)
    fullname!: string

    @ApiProperty()
    @IsString()
    @MaxLength(20)
    phone?: string

    @ApiProperty()
    @IsString()
    @MaxLength(50)
    country?: string
}