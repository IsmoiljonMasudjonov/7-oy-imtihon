import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { PrismaService } from 'src/core/database/prisma.service';
import { Roles } from '@prisma/client';

@Injectable()
export class ReviewsService {
	constructor(private prisma: PrismaService){}

	async create(payload: CreateReviewDto, movieId: number, currentUser: {id: number, role: Roles}) {
		const existMovie = await this.prisma.movie.findUnique({
			where: {
				id: movieId
			}
		})

		if (!existMovie){
			throw new NotFoundException(`Movie not found with this movieId = ${movieId}!`)
		}

		const userReview = await this.prisma.review.findFirst({
			where: {
				user_id: currentUser.id,
				movie_id: movieId
			}
		})

		if (userReview){
			throw new ConflictException("Review already exists for this movie!")
		}

		const newReview = await this.prisma.review.create({
			data: {
				user_id: currentUser.id,
				movie_id: movieId,
				...payload
			},
			select: {
				id: true,
				movie_id: true,
				rating: true,
				comment: true,
				created_at: true,
				user: {
					select: {
						id: true,
						username: true
					}
				}
			}
		})

		return {
			success: true,
			message: "Review created successfully!",
			data: {
				id: newReview.id,
				movieId: newReview.movie_id,
				rating: newReview.rating,
				comment: newReview.comment,
				created_at: newReview.created_at,
				user: {
					id: newReview.user.id,
					username: newReview.user.username
				}
			}
		}
	}

	async findAll() {
		const reviews = await this.prisma.review.findMany({
			select: {
				id: true,
				movie_id: true,
				rating: true,
				comment: true,
				created_at: true,
				user: {
					select: {
						id: true,
						username: true
					}
				}
			}
		});

		return {
			success: true,
			data: reviews.map(review => ({
				id: review.id,
				movieId: review.movie_id,
				rating: review.rating,
				comment: review.comment,
				created_at: review.created_at,
				user: {
					id: review.user.id,
					username: review.user.username
				}
			}))
		}
	}

	async userFindAll(currentUser: {id: number, role: Roles}) {
		const reviews = await this.prisma.review.findMany({
			where: {
				user_id: currentUser.id
			},
			select: {
				id: true,
				movie_id: true,
				rating: true,
				comment: true,
				created_at: true,
				user: {
					select: {
						id: true,
						username: true
					}
				}
			}
		});

		return {
			success: true,
			data: reviews.map(review => ({
				id: review.id,
				movieId: review.movie_id,
				rating: review.rating,
				comment: review.comment,
				created_at: review.created_at,
				user: {
					id: review.user.id,
					username: review.user.username
				}
			}))
		}
	}

	async findOne(movieId: number) {
		const existMovie = await this.prisma.movie.findUnique({
			where: {
				id: movieId
			}
		})

		if (!existMovie){
			throw new NotFoundException(`Movie not found with this movieId = ${movieId}!`)
		}

		const reviews = await this.prisma.review.findMany({
			where: {
				movie_id: movieId
			},
			select: {
				id: true,
				movie_id: true,
				rating: true,
				comment: true,
				created_at: true,
				user: {
					select: {
						id: true,
						username: true
					}
				}
			}
		});

		return {
			success: true,
			data: reviews.map(review => ({
				id: review.id,
				movieId: review.movie_id,
				rating: review.rating,
				comment: review.comment,
				created_at: review.created_at,
				user: {
					id: review.user.id,
					username: review.user.username
				}
			}))
		}
	}

	async userFindOne(movieId: number, currentUser: {id: number, role: Roles}) {
		const existMovie = await this.prisma.movie.findUnique({
			where: {
				id: movieId
			}
		})

		if (!existMovie){
			throw new NotFoundException(`Movie not found with this movieId = ${movieId}!`)
		}

		const reviews = await this.prisma.review.findMany({
			where: {
				movie_id: movieId,
				user_id: currentUser.id
			},
			select: {
				id: true,
				movie_id: true,
				rating: true,
				comment: true,
				created_at: true,
				user: {
					select: {
						id: true,
						username: true
					}
				}
			}
		});

		return {
			success: true,
			data: reviews.map(review => ({
				id: review.id,
				movieId: review.movie_id,
				rating: review.rating,
				comment: review.comment,
				created_at: review.created_at,
				user: {
					id: review.user.id,
					username: review.user.username
				}
			}))
		}
	}

	async update(movieId: number, reviewId: number, payload: UpdateReviewDto, currentUser: {id: number, role: Roles}) {
		const existMovie = await this.prisma.movie.findUnique({
			where: {
				id: movieId
			}
		})

		if (!existMovie){
			throw new NotFoundException(`Movie not found with this movieId = ${movieId}!`)
		}
		
		const existReview = await this.prisma.review.findUnique({
			where: {
				id: reviewId
			}
		})

		if (!existReview){
			throw new NotFoundException(`Review not found with this reviewId = ${reviewId}!`)
		}

		if(existReview.movie_id !== movieId){
			throw new NotFoundException("Review not found for this movie!")
		}

		const userReview = await this.prisma.review.findFirst({
			where: {
				id: reviewId,
				user_id: currentUser.id,
				movie_id: movieId
			}
		})

		if (!userReview){
			throw new ForbiddenException()
		}

		await this.prisma.review.update({
			where: {
				id: reviewId
			},
			data: payload
		})

		return {
			success: true,
			message: "Review updated successfully!"
		}
	}

	async remove(movieId: number, reviewId: number, currentUser: {id: number, role: Roles}) {
		const existMovie = await this.prisma.movie.findUnique({
			where: {
				id: movieId
			}
		})

		if (!existMovie){
			throw new NotFoundException(`Movie not found with this movieId = ${movieId}!`)
		}

		const existReview = await this.prisma.review.findUnique({
			where: {
				id: reviewId
			}
		})

		if (!existReview){
			throw new NotFoundException(`Review not found with this reviewId = ${reviewId}!`)
		}

		if(existReview.movie_id !== movieId){
			throw new NotFoundException("Review not found for this movie!")
		}

		if (currentUser.role == Roles.USER){
			const userReview = await this.prisma.review.findFirst({
				where: {
					id: reviewId,
					user_id: currentUser.id,
					movie_id: movieId
				}
			})
	
			if (!userReview){
				throw new ForbiddenException()
			}
		}

		await this.prisma.review.delete({
			where: {
				id: reviewId
			}
		})

		return {
			success: true,
			message: "Review deleted successfully!"
		}
	}
}
