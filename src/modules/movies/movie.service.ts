import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { PrismaService } from 'src/core/database/prisma.service';
import { Roles, SubscriptionType, UserSubscriptionStatus } from '@prisma/client';

@Injectable()
export class MovieService {
	constructor(private prisma: PrismaService){}

	async create(payload: CreateMovieDto, currentUser: {id: number, role: Roles}, file: string) {
		const existSlug = await this.prisma.movie.findUnique({
			where: {
				slug: payload.slug
			}
		});

		if (existSlug){
			throw new ConflictException(`Movie already exists with this slug = ${payload.slug}!`);
		}

		if (!file){
			throw new BadRequestException(`Poster required!`)
		}

		const categories = await this.prisma.category.findMany({
			where:{
				id:{
					in: payload.category_ids
				}
			}
		})

		if(categories.length !== payload.category_ids.length){
			throw new NotFoundException("Some categories not found!")
		}

		const newMovie = await this.prisma.movie.create({
			data: {
				title: payload.title,
				slug: payload.slug,
				description: payload.description,
				release_year: payload.release_year,
				duration_minutes: payload.duration_minutes,
				rating: payload.rating,
				subscription_type: payload.subscription_type,
				created_by: currentUser.id,
				poster_url: file
			}
		})

		await this.prisma.movieCategory.createMany({
			data: payload.category_ids.map((categoryId) => ({
				category_id: categoryId,
				movie_id: newMovie.id
			}))
		})

		return {
			success: true,
			message: "Movie created successfully!",
			data: {
				id: newMovie.id,
				title: newMovie.title,
				slug: newMovie.slug,
				created_at: newMovie.created_at
			}
		}
	}

	async findAll() {
		const movies = await this.prisma.movie.findMany({
			select: {
				id: true,
				title: true,
				slug: true,
				release_year: true,
				subscription_type: true,
				view_count: true,
				poster_url: true,
				created_at: true,
				created_by: true,
				movieCategories:{
					select:{
						category:{
							select:{
								name:true
							}
						}
					}
				}
			}	
		})

		return {
			success: true,
			data: movies
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

		let movies: any;

		const activeSubscription = user?.userSubscriptions.find(
			sub => sub.status === UserSubscriptionStatus.ACTIVE
		);

		if(activeSubscription){
			movies = await this.prisma.movie.findMany({
				select: {
					id: true,
					title: true,
					slug: true,
					release_year: true,
					subscription_type: true,
					view_count: true,
					poster_url:true,
					created_at: true,
					created_by: true,
					movieCategories:{
						select:{
							category:{
								select:{
									name:true
								}
							}
						}
					}
				}
			})
		}else {
			movies = await this.prisma.movie.findMany({
				where: {
					subscription_type: SubscriptionType.FREE
				},
				select: {
					id: true,
					title: true,
					slug: true,
					release_year: true,
					subscription_type: true,
					view_count: true,
					poster_url:true,
					created_at: true,
					created_by: true,
					movieCategories:{
						select:{
							category:{
								select:{
									name:true
								}
							}
						}
					}
				}
			})
		}

		return {
			success: true,
			data: movies
		}
	}

	async findOne(movieId: number) {
		const existMovie = await this.prisma.movie.findUnique({
			where: {
				id: movieId
			},
			select: {
				id: true,
				title: true,
				slug: true,
				release_year: true,
				subscription_type: true,
				view_count: true,
				poster_url:true,
				created_at: true,
				created_by: true,
				movieCategories:{
					select:{
						category:{
							select:{
								name:true
							}
						}
					}
				}
			}
		})

		if (!existMovie){
			throw new NotFoundException(`Movie not found with this movieId = ${movieId}`)
		}

		return {
			success: true,
			data: existMovie
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

		let movie: any;

		const activeSubscription = user?.userSubscriptions.find(
			sub => sub.status === UserSubscriptionStatus.ACTIVE
		);

		if(activeSubscription){
			movie = await this.prisma.movie.findUnique({
				where: {
					id: movieId
				},
				select: {
					id: true,
					title: true,
					slug: true,
					release_year: true,
					subscription_type: true,
					view_count: true,
					poster_url:true,
					created_at: true,
					created_by: true,
					movieCategories:{
						select:{
							category:{
								select:{
									name:true
								}
							}
						}
					}
				}
			})
		}else {
			movie = await this.prisma.movie.findUnique({
				where: {
					id: movieId,
					subscription_type: SubscriptionType.FREE
				},
				select: {
					id: true,
					title: true,
					slug: true,
					release_year: true,
					subscription_type: true,
					view_count: true,
					poster_url:true,
					created_at: true,
					created_by: true,
					movieCategories:{
						select:{
							category:{
								select:{
									name:true
								}
							}
						}
					}
				}
			})

			if (!movie){
				throw new ForbiddenException()
			}
		}

		return {
			success: true,
			data: movie
		}
	}

	async update(movieId: number, payload: UpdateMovieDto) {
		const existMovie = await this.prisma.movie.findUnique({
			where: {
				id: movieId
			}
		})

		if (!existMovie){
			throw new NotFoundException(`Movie not found with this movieId = ${movieId}`)
		}

		const { category_ids, ...other } = payload

		if (category_ids){
			const movieCategory = await this.prisma.movieCategory.findMany({
				where: {
					movie_id: movieId
				},
				select: {
					id: true
				}
			})
			
			if (movieCategory.length > 0){
				await this.prisma.movieCategory.deleteMany({
					where: {
						id: {
							in: movieCategory.map(movie => movie.id)
						}
					}
				})
			}

			const categories = await this.prisma.category.findMany({
				where:{
					id:{
						in: category_ids
					}
				}
			})

			if(categories.length !== category_ids.length){
				throw new NotFoundException("Some categories not found!")
			}

			await this.prisma.movieCategory.createMany({
				data: category_ids.map((categoryId) => ({
					category_id: categoryId,
					movie_id: movieId
				}))
			})
		}

		const updatedMovie = await this.prisma.movie.update({
			where: {
				id: movieId
			},
			data: other
		})
		
		return {
			success: true,
			message: "Movie updated successfully!",
			data: {
				id: updatedMovie.id,
				title: updatedMovie.title,
				updated_at: updatedMovie.updated_at
			}
		}

	}

	async remove(movieId: number) {
		const existMovie = await this.prisma.movie.findUnique({
			where: {
				id: movieId
			}
		})

		if (!existMovie){
			throw new NotFoundException(`Movie not found with this movieId = ${movieId}`)
		}

		const movieCategory = await this.prisma.movieCategory.findMany({
			where: {
				movie_id: movieId
			},
			select: {
				id: true
			}
		})
		
		if (movieCategory.length > 0){
			await this.prisma.movieCategory.deleteMany({
				where: {
					id: {
						in: movieCategory.map(movie => movie.id)
					}
				}
			})
		}

		await this.prisma.movie.delete({
			where: {
				id: movieId
			}
		})

		return {
			success: true,
			data: existMovie
		}
	}
}
