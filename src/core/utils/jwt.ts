import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Roles } from "@prisma/client";

@Injectable()
export class GenerateToken {
    constructor(private jwtService: JwtService){}

    async accessToken(id: number, role: Roles){
        return this.jwtService.sign({id, role}, { expiresIn: "30m"})
    }

    async refreshToken(id: number, role: Roles){
        return this.jwtService.sign({id, role}, { expiresIn: "7d"})
    }

    async verifyToken(token: string){
        return this.jwtService.verify(token, {secret: process.env.JWT_SECRET})
    }
}