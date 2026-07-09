import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateMovieFileDto } from './dto/create-movie-file.dto';
import { UpdateMovieFileDto } from './dto/update-movie-file.dto';
import { PrismaService } from 'src/core/database/prisma.service';
import { Roles, SubscriptionType, UserSubscriptionStatus } from '@prisma/client';

@Injectable()
export class MovieFilesService {
	constructor(private prisma: PrismaService){}

	async create(movieId: number, payload: CreateMovieFileDto, file: string) {
		const existMovie = await this.prisma.movie.findUnique({
			where: {
				id: movieId
			}
		})

		if (!existMovie){
			throw new NotFoundException(`Movie not found with this movieId = ${movieId}!`);
		}

		if (!file){
			throw new BadRequestException("File required!")
		}

		const newMovieFile = await this.prisma.movieFile.create({
			data: {
				...payload,
				movie_id: movieId,
				file_url: file
			}
		})

		return {
			success: true,
			message: "File added to this movie!",
			data: {
				id: newMovieFile.id,
				movie_id: newMovieFile.movie_id,
				quality: newMovieFile.quality,
				language: newMovieFile.language,
				file_url: newMovieFile.file_url
			}
		}
	}

	async findAll() {
		const movieFiles = await this.prisma.movieFile.findMany({
			select: {
				id: true,
				movie_id: true,
				quality: true,
				language: true,
				file_url: true
			}
		})

		return {
			success: true,
			data: movieFiles
		}
	}

	async userFindAll(currentUser: {id: number, role: Roles}) {
		const user = await this.prisma.user.findUnique({
			where: {
				id: currentUser.id
			},
			select: {
				userSubscriptions: {
					select: {
						status: true
					}
				}
			}
		})

		let movieFiles: any;
		
		const activeSubscription = user?.userSubscriptions.find(
			sub => sub.status === UserSubscriptionStatus.ACTIVE
		);

		if(activeSubscription){
			movieFiles = await this.prisma.movieFile.findMany({
				select: {
					id: true,
					movie_id: true,
					quality: true,
					language: true,
					file_url: true
				}
			})
		}else {
			movieFiles = await this.prisma.movieFile.findMany({
				where: {
					movie: {
						subscription_type: SubscriptionType.FREE
					}
				},
				select: {
					id: true,
					movie_id: true,
					quality: true,
					language: true,
					file_url: true
				}
			})
		}

		return {
			success: true,
			data: movieFiles
		}
	}

	async findOne(movieId: number) {
		const existMovie = await this.prisma.movie.findUnique({
			where: {
				id: movieId
			}
		})

		if (!existMovie){
			throw new NotFoundException(`Movie not found with this movieId = ${movieId}`)
		}

		const movieFile = await this.prisma.movieFile.findMany({
			where: {
				movie_id: movieId
			},
			select: {
				id: true,
				movie_id: true,
				quality: true,
				language: true,
				file_url: true
			}
		})

		return {
			success: true,
			data: movieFile
		}
	}

	async userFindOne(movieId: number, currentUser: {id: number, role: Roles}) {
		const existMovie = await this.prisma.movie.findUnique({
			where: {
				id: movieId
			}
		})

		if (!existMovie){
			throw new NotFoundException(`Movie not found with this movieId = ${movieId}`)
		}

		const user = await this.prisma.user.findUnique({
			where: {
				id: currentUser.id
			},
			select: {
				userSubscriptions: {
					select: {
						status: true
					}
				}
			}
		})

		let movieFiles: any;
		
		const activeSubscription = user?.userSubscriptions.find(
			sub => sub.status === UserSubscriptionStatus.ACTIVE
		);

		if(activeSubscription){
			movieFiles = await this.prisma.movieFile.findMany({
				where: {
					movie_id: movieId
				},
				select: {
					id: true,
					movie_id: true,
					quality: true,
					language: true,
					file_url: true
				}
			})
		}else {
			movieFiles = await this.prisma.movieFile.findMany({
				where: {
					movie_id: movieId,
					movie: {
						subscription_type: SubscriptionType.FREE
					}
				},
				select: {
					id: true,
					movie_id: true,
					quality: true,
					language: true,
					file_url: true
				}
			})

			if (movieFiles.length === 0){
				throw new ForbiddenException()
			}
		}

		return {
			success: true,
			data: movieFiles
		}
	}

	async update(movieFileId: number, payload: UpdateMovieFileDto) {
		const existMovieFile = await this.prisma.movieFile.findUnique({
			where: {
				id: movieFileId
			}
		})

		if (!existMovieFile){
			throw new NotFoundException(`Movie file not found with this movieId = ${movieFileId}`)
		}

		await this.prisma.movieFile.update({
			where: {
				id: movieFileId
			},
			data: payload
		})

		return {
			success: true,
			message: "Movie file updated successfully!"
		}
	}

	async remove(movieFileId: number) {
		const existMovieFile = await this.prisma.movieFile.findUnique({
			where: {
				id: movieFileId
			}
		})

		if (!existMovieFile){
			throw new NotFoundException(`Movie file not found with this movieId = ${movieFileId}`)
		}

		await this.prisma.movieFile.delete({
			where: {
				id: movieFileId
			}
		})

		return {
			success: true,
			message: "Movie file deleted successfully!"
		}
	}
}
