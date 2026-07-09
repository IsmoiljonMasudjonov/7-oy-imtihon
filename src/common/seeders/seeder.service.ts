import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { PrismaService } from "src/core/database/prisma.service";
import * as argon2 from "argon2";
import { Roles } from "@prisma/client";


@Injectable()
export class SeederService implements OnModuleInit {
    constructor(private prisma: PrismaService){}

    async onModuleInit() {
        const existUser = await this.prisma.user.findFirst({
            where: {
                email: process.env.SUPERADMIN_EMAIL
            }
        })

        if (existUser){
            Logger.log("Superadmin already exists!");
        }else {
            const newUser = await this.prisma.user.create({
                data: {
                    username: "Superadmin",
                    email: process.env.SUPERADMIN_EMAIL as string,
                    password_hash: await argon2.hash(process.env.SUPERADMIN_PASSWORD as string),
                    role: Roles.SUPERADMIN
                }
            })

            await this.prisma.profile.create({
                data: {
                    userId: newUser.id,
                    fullname: newUser.username,
                    phone: undefined,
                    country: undefined
                }
            })

            Logger.log("Superadmin created successfully!");
        }
    }
}