import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsEnum, IsNumber, IsObject } from "class-validator";
import { PaymentMethod } from "@prisma/client";

export class CreateSubscriptionPaymetDto {

    @ApiProperty()
    @IsNumber()
    plan_id!: number;

    @ApiProperty({
        enum: PaymentMethod
    })
    @IsEnum(PaymentMethod)
    payment_method!: PaymentMethod;

    @ApiProperty()
    @IsBoolean()
    auto_renew!: boolean;

    @ApiProperty()
    @IsObject()
    payment_details!: Record<string, any>;
}
