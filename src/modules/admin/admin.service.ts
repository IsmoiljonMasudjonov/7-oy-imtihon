import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import * as argon2 from "argon2";
import { PrismaService } from 'src/core/database/prisma.service';
import { Roles } from '@prisma/client';

@Injectable()
export class AdminService {
	constructor(private prisma: PrismaService){}

	async create(payload: CreateAdminDto) {
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
				role: Roles.ADMIN
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

		return {
			success: true,
			message: "User added successfully!"
		}
	}

	async findAll() {
		const users = await this.prisma.user.findMany({
			where: {
				role: {
					in: [Roles.ADMIN, Roles.SUPERADMIN]
				}
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
				role: {
					in: [Roles.ADMIN, Roles.SUPERADMIN]
				}
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

	async update(userId: number, payload: UpdateAdminDto) {
		const existUser = await this.prisma.user.findFirst({
			where: {
				id: userId,
				role: {
					in: [Roles.ADMIN, Roles.SUPERADMIN]
				}
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

	async updateMe(payload: UpdateAdminDto, currentUser: {id: number, role: Roles}){
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
				role: {
					in: [Roles.ADMIN, Roles.SUPERADMIN]
				}
			}
		})

		if (!existUser){
			throw new NotFoundException(`User not found with this id = ${userId}!`)
		}

		await this.prisma.profile.delete({
			where: {
				userId
			}
		})
		
		await this.prisma.user.delete({
			where: {
				id: userId
			}
		})


		return {
			success: true,
			message: "User deleted successfully!"
		}
	}
}
