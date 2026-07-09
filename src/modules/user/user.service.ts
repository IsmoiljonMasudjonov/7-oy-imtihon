import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/core/database/prisma.service';
import * as argon2 from "argon2";
import { Roles } from '@prisma/client';

@Injectable()
export class UserService {
	constructor(private prisma: PrismaService){}

	async findAll() {
		const users = await this.prisma.user.findMany({
			where: {
				role: Roles.USER
			},
			select: {
				id: true,
				username: true,
				email: true,
				role: true,
				avatar_url: true,
				created_at: true
			}
		});

		return {
			success: true,
			data: users
		}
	}

	async findOne(userId: number) {
		const user = await this.prisma.user.findFirst({
			where: {
				id: userId,
				role: Roles.USER
			},
			select: {
				id: true,
				username: true,
				email: true,
				role: true,
				avatar_url: true,
				created_at: true
			}
		});

		if (!user){
			throw new NotFoundException(`User not found with this id = ${userId}!`)
		}

		return {
			success: true,
			data: user
		}
	}

	async findMe(currentUser: {id: number, role: Roles}) {
		const me = await this.prisma.user.findFirst({
			where: {
				id: currentUser.id
			},
			select: {
				id: true,
				username: true,
				email: true,
				role: true,
				avatar_url: true,
				created_at: true
			}
		});

		if (!me){
			throw new NotFoundException(`Your account not found!`)
		}

		return {
			success: true,
			data: me
		}
	}

	async update(userId: number, payload: UpdateUserDto) {
		const existUser = await this.prisma.user.findFirst({
			where: {
				id: userId,
				role: Roles.USER
			}
		})

		if (!existUser){
			throw new NotFoundException(`User not found with this id = ${userId}!`)
		}

		const { password, email, ...rest } = payload
		
		if (email) {
			const existEmail = await this.prisma.user.findFirst({
				where: {
					email,
					NOT: {
						id: userId
					}
				}
			});

			if (existEmail) {
				throw new ConflictException("User already exists with this email!");
			}
		}
		
		await this.prisma.user.update({
			where: {
				id: userId
			},
			data: {
				...rest,
				...(email && {
					email
				}),
				...(password && {
					password_hash: await argon2.hash(password)
				})
			}
		});

		return {
			success: true,
			message: "User updated successfully!"
		}
	}

	async updateMe(payload: UpdateUserDto, currentUser: {id: number, role: Roles}){
		const existUser = await this.prisma.user.findFirst({
			where: {
				id: currentUser.id
			}
		})

		if (!existUser){
			throw new NotFoundException(`Your account not found!`)
		}

		const { password, email, ...rest } = payload

		if (email) {
			const existEmail = await this.prisma.user.findFirst({
				where: {
					email,
					NOT: {
						id: currentUser.id
					}
				}
			});

			if (existEmail) {
				throw new ConflictException("User already exists with this email!");
			}
		}
		
		await this.prisma.user.update({
			where: {
				id: currentUser.id
			},
			data: {
				...rest,
				...(email && {
					email
				}),
				...(password && {
					password_hash: await argon2.hash(password)
				})
			}
		});
		

		return {
			success: true,
			message: "Your account updated successfully!"
		}
	}

	async remove(userId: number) {
		const existUser = await this.prisma.user.findFirst({
			where: {
				id: userId,
				role: Roles.USER
			}
		})

		if (!existUser){
			throw new NotFoundException(`User not found with this id = ${userId}!`)
		}

		await this.prisma.user.delete({
			where: {
				id: userId
			}
		})

		await this.prisma.profile.delete({
			where: {
				userId
			}
		})

		return {
			success: true,
			message: "User deleted successfully!"
		}
	}

	async removeMe(currentUser: {id: number, role: Roles}) {
		const existUser = await this.prisma.user.findFirst({
			where: {
				id: currentUser.id,
				role: Roles.USER
			}
		})

		if (!existUser){
			throw new NotFoundException(`Your account not found!`)
		}

		await this.prisma.user.delete({
			where: {
				id: currentUser.id
			}
		})

		await this.prisma.profile.delete({
			where: {
				userId: currentUser.id
			}
		})

		return {
			success: true,
			message: "Your account deleted successfully!"
		}
	}
}
