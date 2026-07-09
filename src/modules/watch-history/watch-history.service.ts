import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateWatchHistoryDto } from './dto/create-watch-history.dto';
import { PrismaService } from 'src/core/database/prisma.service';
import { Roles } from '@prisma/client';

@Injectable()
export class WatchHistoryService {
	constructor(private prisma: PrismaService){}

	async create(payload: CreateWatchHistoryDto, movieId: number, currentUser: {id: number, role: Roles}) {
		const existMovie = await this.prisma.movie.findUnique({
			where: {
				id: movieId
			},
			select: {
				duration_minutes: true
			}
		})

		if (!existMovie){
			throw new NotFoundException(`Movie not found with this movieId = ${movieId}!`)
		}

		if (existMovie.duration_minutes == 0){
			throw new BadRequestException("Movie duration can not be 0!")
		}

		const existWatchHistory = await this.prisma.watchHistory.findFirst({
			where: {
				movie_id: movieId,
				user_id: currentUser.id
			}
		}) 

		let newWatchHistory: any;

		if (existWatchHistory){
			const newMinutes = existWatchHistory.watched_duration + payload.watched_duration
			const newPercent = Number(((newMinutes * 100) / existMovie.duration_minutes).toFixed(2))

			if (newMinutes > existMovie.duration_minutes){
				throw new BadRequestException("Watched duration cannot exceed movie duration!")
			}

			newWatchHistory = await this.prisma.watchHistory.update({
				where: {
					id: existWatchHistory.id
				},
				data: {
					watched_duration: newMinutes,
					watched_percentage: newPercent,
					last_watched: new Date()
				}
			})
		}else {
			if(payload.watched_duration > existMovie.duration_minutes){
				throw new BadRequestException("Watched duration cannot exceed movie duration!")
			}

			const watched_percentage = Number(((payload.watched_duration * 100) / existMovie.duration_minutes).toFixed(2))
	
			newWatchHistory = await this.prisma.watchHistory.create({
				data: {
					...payload,
					movie_id: movieId,
					user_id: currentUser.id,
					watched_percentage
				}
			})
		}

		return {
			success: true,
			message: "Watch history created successfully.",
			data: {
				id: newWatchHistory.id,
				user_id: newWatchHistory.user_id,
				movie_id: newWatchHistory.movie_id,
				watched_duration: newWatchHistory.watched_duration,
				watched_percentage: newWatchHistory.watched_percentage,
				last_watched: newWatchHistory.last_watched
			}
		}
	}

	async findAll(currentUser: {id: number, role: Roles}) {
		const watchHistory = await this.prisma.watchHistory.findMany({
			where: {
				user_id: currentUser.id
			},
			select: {
				id: true,
				watched_duration: true,
				watched_percentage: true,
				last_watched: true,
				movie: {
					select: {
						title: true
					}
				},
				user: {
					select: {
						username: true
					}
				}
			}
		})

		return {
			success: true,
			data: watchHistory.map(movie => ({
				id: movie.id,
				user_username: movie.user.username,
				movie_title: movie.movie.title,
				watched_duration: movie.watched_duration,
				watched_percentage: movie.watched_percentage,
				last_watched: movie.last_watched
			}))
		}
	}

	async remove(movieId: number, currentUser: {id: number, role: Roles}) {
		const existMovie = await this.prisma.movie.findUnique({
			where: {
				id: movieId
			}
		})

		if (!existMovie){
			throw new NotFoundException(`Movie not found with this movieId = ${movieId}!`)
		}

		const watched = await this.prisma.watchHistory.findFirst({
			where: {
				movie_id: movieId,
				user_id: currentUser.id
			},
			select: {
				id: true
			}
		})

		if (!watched){
			throw new NotFoundException("Movie not found from watch-history!")
		}

		await this.prisma.watchHistory.delete({
			where: {
				id: watched.id
			}
		})

		return {
			success: true,
			message: "Movie deleted from watch-history!"
		}
	}
}
