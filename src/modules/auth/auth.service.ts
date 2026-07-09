import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/login';
import { PrismaService } from 'src/core/database/prisma.service';
import * as argon2 from "argon2";
import { GenerateToken } from 'src/core/utils/jwt';
import { RegisterDto } from './dto/register';

@Injectable()
export class AuthService {
	constructor(
		private prisma: PrismaService,
		private generateToken : GenerateToken
	){}

	async register(payload: RegisterDto) {
		const existUser = await this.prisma.user.findUnique({
			where: {
				email: payload.email
			}
		})

		if (existUser){
			throw new ConflictException("User already exists with this email!")
		}

		const hash = await argon2.hash(payload.password);

		const newUser = await this.prisma.user.create({
			data: {
				username: payload.username,
				email: payload.email,
				password_hash: hash,
			}
		})

		await this.prisma.profile.create({
			data: {
				userId: newUser.id,
				fullname: payload.username,
				phone: undefined,
				country: undefined
			}
		})

		return {
			success: true,
			message: "You register successfully!",
			data: {
				user_id: newUser.id,
				username: newUser.username,
				role: newUser.role,
				created_at: newUser.created_at
			},
			tokens: {
				accessToken: await this.generateToken.accessToken(newUser.id, newUser.role),
				refreshToken: await this.generateToken.refreshToken(newUser.id, newUser.role)
			}
		}
	}

	async login(payload: LoginDto) {
		const existUser = await this.prisma.user.findFirst({
			where: {
				email: payload.email
			},
			select: {
				id: true,
				username: true,
				role: true,
				password_hash: true,
				userSubscriptions: {
					select: {
						end_date: true,
						plan: {
							select: {
								name: true
							}
						}
					}
				}

			}
		})

		if (!existUser){
			throw new UnauthorizedException("Invalid credentials")
		}

		if (!await argon2.verify(existUser.password_hash, payload.password)){
			throw new UnauthorizedException("Invalid credentials")
		}

		return {
			success: true,
			message: "You login successfully!",
			data: {
				user_id: existUser.id,
				username: existUser.username,
				role: existUser.role,
				subscribtion: {
					plan_name: existUser.userSubscriptions[0]?.plan?.name ?? 'Free',
					expires_at: existUser.userSubscriptions[0]?.end_date ?? null
				}
			},
			tokens: {
				accessToken: await this.generateToken.accessToken(existUser.id, existUser.role),
				refreshToken: await this.generateToken.refreshToken(existUser.id, existUser.role)
			}
		}
	}

	async logout(req: Request){
		return {
			success: true,
			message: "You logout successfully!"
		}
	}
}
