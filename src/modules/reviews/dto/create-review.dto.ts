import { ApiProperty } from "@nestjs/swagger"
import { IsNumber, IsString, Max, Min } from "class-validator"

export class CreateReviewDto {
    @ApiProperty()
    @IsNumber()
    @Min(1)
    @Max(5)
    rating!: number

    @ApiProperty()
    @IsString()
    comment!: string
}
