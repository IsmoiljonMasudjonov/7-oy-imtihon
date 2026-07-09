import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { Roles } from '@prisma/client';
import { PrismaService } from 'src/core/database/prisma.service';

@Injectable()
export class ProfileService {
	constructor(private prisma: PrismaService){}

	async findMyProfile(currentUser: {id: number, role: Roles}) {
		const myProfile = await this.prisma.profile.findUnique({
			where: {
				userId: currentUser.id
			},
			select: {
				fullname: true,
				phone: true,
				country: true,
				created_at: true,
				user: {
					select: {
						id: true,
						avatar_url: true,
					}
				}
			}
		})

		if (!myProfile){
			throw new NotFoundException("Your profile not found!")
		}

		const formatted = {
			user_id: myProfile.user.id,
			fullname: myProfile.fullname,
			phone: myProfile.phone,
			country: myProfile.country,
			created_at: myProfile.created_at,
			avatar_url: myProfile.user.avatar_url
		}

		return {
			success: true,
			data: formatted
		}
	}

	async findAll(currentUser: {id: number, role: Roles}) {
		if (currentUser.role == Roles.USER){
			throw new ForbiddenException()
		}

		const profiles = await this.prisma.profile.findMany({
			select: {
				fullname: true,
				phone: true,
				country: true,
				created_at: true,
				user: {
					select: {
						id: true,
						avatar_url: true,
					}
				}
			}
		})

		const formatted = profiles.map(profile => ({
			user_id: profile.user.id,
			fullname: profile.fullname,
			phone: profile.phone,
			country: profile.country,
			created_at: profile.created_at,
			avatar_url: profile.user.avatar_url
		}))

		return {
			success: true,
			data: formatted
		}
	}

	async findOne(userId: number, currentUser: {id: number, role: Roles}) {
		if (currentUser.role == Roles.USER){
			throw new ForbiddenException()
		}

		const existProfile = await this.prisma.profile.findUnique({
			where: {
				userId: userId
			},
			select: {
				fullname: true,
				phone: true,
				country: true,
				created_at: true,
				user: {
					select: {
						id: true,
						avatar_url: true,
					}
				}
			}
		})

		if (!existProfile){
			throw new NotFoundException(`User not found with this id = ${userId}`)
		}

		const formatted = {
			user_id: existProfile.user.id,
			fullname: existProfile.fullname,
			phone: existProfile.phone,
			country: existProfile.country,
			created_at: existProfile.created_at,
			avatar_url: existProfile.user.avatar_url
		}

		return {
			success: true,
			data: formatted
		}
	}

	async updateMyProfile(payload: UpdateProfileDto, currentUser: {id: number, role: Roles}) {
		const myProfile = await this.prisma.profile.findUnique({
			where: {
				userId: currentUser.id
			}
		})

		if (!myProfile){
			throw new NotFoundException("Your profile not found!")
		}

		await this.prisma.profile.update({
			where: {
				userId: currentUser.id
			},
			data: payload
		})

		return {
			success: true,
			message: "Your profile updated successfully!"
		}
	}

	async updateUserProfile(userId:number, payload: UpdateProfileDto, currentUser: {id: number, role: Roles}) {
		if (currentUser.role != Roles.SUPERADMIN){
			throw new ForbiddenException()
		}

		const existProfile = await this.prisma.profile.findUnique({
			where: {
				userId
			}
		})

		if (!existProfile){
			throw new NotFoundException(`User profile not found with this id = ${userId}!`)
		}

		await this.prisma.profile.update({
			where: {
				userId
			},
			data: payload
		})

		return {
			success: true,
			message: "User profile updated successfully!"
		}
	}

	async deleteUserProfile(userId: number, currentUser: {id: number, role: Roles}){
		if (currentUser.role != Roles.SUPERADMIN){
			throw new ForbiddenException()
		}

		const existProfile = await this.prisma.profile.findUnique({
			where: {
				userId
			}
		})

		if (!existProfile){
			throw new NotFoundException(`User profile not found with this id = ${userId}!`)
		}

		await this.prisma.profile.delete({
			where: {
				userId
			}
		})

		return {
			success: true,
			message: "User profile deleted successfully!"
		}
	}
}
