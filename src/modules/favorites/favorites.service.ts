import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { Roles } from '@prisma/client';
import { PrismaService } from 'src/core/database/prisma.service';

@Injectable()
export class FavoritesService {
	constructor(private prisma: PrismaService){}

	async create(payload: CreateFavoriteDto, currentUser: {id: number, role: Roles}) {
		const existMovie = await this.prisma.movie.findUnique({
			where: {
				id: payload.movieId
			},
			select: {
				id: true,
				title: true
			}
		})

		if (!existMovie){
			throw new NotFoundException(`Movie not found with this movieId = ${payload.movieId}`)
		}

		const favorite = await this.prisma.favorite.findFirst({
			where: {
				user_id: currentUser.id,
				movie_id: payload.movieId
			}
		})

		if (favorite){
			throw new ConflictException("This movie already your favorite movie!")
		}

		const newFavorite = await this.prisma.favorite.create({
			data: {
				movie_id: payload.movieId,
				user_id: currentUser.id
			}
		})

		return {
			success: true,
			message: "Movie added to favorites!",
			data: {
				id: newFavorite.id,
				movie_id: existMovie.id,
				movie_title: existMovie.title,
				created_at: newFavorite.created_at
			}
		}
	}

	async findAll(currentUser: {id: number, role: Roles}) {
		const favorites = await this.prisma.favorite.findMany({
			where: {
				user_id: currentUser.id
			}
		})

		return {
			success: true,
			data: favorites
		}
	}

	async remove(movieId: number, currentUser: {id: number, role: Roles}) {
		const existMovie = await this.prisma.movie.findUnique({
			where: {
				id: movieId
			}
		})

		if (!existMovie){
			throw new NotFoundException(`Movie not found with this movieId = ${movieId}`)
		}

		const favorite = await this.prisma.favorite.findFirst({
			where: {
				user_id: currentUser.id,
				movie_id: movieId
			},
			select: {
				id: true
			}
		})

		if (!favorite){
			throw new ForbiddenException()
		}

		await this.prisma.favorite.delete({
			where: {
				id: favorite.id
			}
		})
	
		return {
			success: true,
			message: "This movie deleted from your favorite movies!"
		}
	}
}
