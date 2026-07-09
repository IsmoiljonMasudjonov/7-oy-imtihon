import { ApiProperty } from "@nestjs/swagger"
import { IsString, MaxLength } from "class-validator"

export class LoginDto {
    @ApiProperty()
    @IsString()
    @MaxLength(100)
    email!: string

    @ApiProperty()
    @IsString()
    @MaxLength(255)
    password!: string
}
