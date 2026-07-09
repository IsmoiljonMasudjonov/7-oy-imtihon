import { DocumentBuilder } from "@nestjs/swagger";

export const config = new DocumentBuilder()
    .setTitle('MovieTV')
    .setDescription('Movie platform')
    .setVersion('1.0')
    .addBearerAuth()
    .build();