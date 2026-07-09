import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, Min } from "class-validator";

export class CreateWatchHistoryDto {
    @ApiProperty()
    @IsNumber()
    @Min(0)
    watched_duration!: number
}
