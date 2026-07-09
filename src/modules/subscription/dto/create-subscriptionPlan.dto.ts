import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsBoolean, IsNumber, IsString, MaxLength, Min } from "class-validator";

export class CreateSubscriptionPlanDto {
	@ApiProperty()
    @IsString()
    @MaxLength(50)
    name!: string

    @ApiProperty()
    @IsNumber()
    @Min(0)
    price!: number

    @ApiProperty()
    @IsNumber()
    duration_days!: number

    @ApiProperty()
    @IsArray()
    @IsString({ each: true })
    features!: string[];

    @ApiProperty({type: "boolean", default: true})
    @IsBoolean()
    is_active?: boolean
}
