import { ApiProperty } from "@nestjs/swagger"
import { SubscriptionType } from "@prisma/client"
import { Transform, Type } from "class-transformer"
import { IsArray, IsEnum, IsNumber, IsString, MaxLength } from "class-validator"

export class CreateMovieDto {
    @ApiProperty()
    @IsString()
    @MaxLength(100)
    title!: string

    @ApiProperty()
    @IsString()
    @MaxLength(100)
	slug!: string

    @ApiProperty()
    @IsString()
	description!: string

    @ApiProperty()
    @Type(()=>Number)
    @IsNumber()
	release_year!: number

    @ApiProperty()
    @Type(()=>Number)
    @IsNumber()
	duration_minutes!: number

    @ApiProperty()
    @Type(()=>Number)
    @IsNumber()
    rating!: number;

    @ApiProperty({ type: Array, example: [1, 2]})
    @Transform(({ value }) => {
        if (typeof value === "string") {
            return JSON.parse(value);
        }
        return value;
    })
    @IsArray()
    @IsNumber({}, { each: true })
    category_ids!: number[]

    @ApiProperty({ enum: SubscriptionType,enumName: "SubscriptionType", default: SubscriptionType.FREE, example: [SubscriptionType.FREE, SubscriptionType.PREMIUM] })
    @IsEnum(SubscriptionType)
	subscription_type?: SubscriptionType
}
