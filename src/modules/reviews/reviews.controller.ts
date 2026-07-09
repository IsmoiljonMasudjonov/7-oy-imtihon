import { Controller, Get, Post, Body, Patch, Param, Delete, Req, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { RolesGuard } from 'src/common/decorators/roles';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { Roles } from '@prisma/client';

@ApiBearerAuth()
@Controller()
export class ReviewsController {
	constructor(private readonly reviewsService: ReviewsService) {}

	@ApiOperation({summary: `${Roles.USER}`})
	@UseGuards(AuthGuard, RoleGuard)
	@RolesGuard(Roles.USER)
	@Post("movies/:movieId/reviews")
	create(@Req() req: Request, @Param('movieId', ParseIntPipe) movieId: number, @Body() payload: CreateReviewDto) {
		return this.reviewsService.create(payload, movieId, req["user"]);
	}

	@ApiOperation({summary: `${Roles.ADMIN}, ${Roles.SUPERADMIN}`})
	@UseGuards(AuthGuard, RoleGuard)
	@RolesGuard(Roles.ADMIN, Roles.SUPERADMIN)
	@Get("movies/all/reviews")
	findAll() {
		return this.reviewsService.findAll();
	}

	@ApiOperation({summary: `${Roles.USER}`})
	@UseGuards(AuthGuard, RoleGuard)
	@RolesGuard(Roles.USER)
	@Get("movies/user/reviews")
	userFindAll(@Req() req: Request) {
		return this.reviewsService.userFindAll(req["user"]);
	}

	@ApiOperation({summary: `${Roles.ADMIN}, ${Roles.SUPERADMIN}`})
	@UseGuards(AuthGuard, RoleGuard)
	@RolesGuard(Roles.ADMIN, Roles.SUPERADMIN)
	@Get('movies/:movieId/reviews')
	findOne(@Param('movieId', ParseIntPipe) movieId: number) {
		return this.reviewsService.findOne(movieId);
	}

	@ApiOperation({summary: `${Roles.USER}`})
	@UseGuards(AuthGuard, RoleGuard)
	@RolesGuard(Roles.USER)
	@Get("movies/:movieId/user/reviews")
	userFindOne(@Param('movieId', ParseIntPipe) movieId: number, @Req() req: Request) {
		return this.reviewsService.userFindOne(movieId, req["user"]);
	}

	@ApiOperation({summary: `${Roles.USER}`})
	@UseGuards(AuthGuard, RoleGuard)
	@RolesGuard(Roles.USER)
	@Patch('movies/:movieId/review/:reviewId')
	update(@Req() req: Request, @Param('movieId', ParseIntPipe) movieId: number, @Param('reviewId', ParseIntPipe) reviewId: number, @Body() payload: UpdateReviewDto) {
		return this.reviewsService.update(movieId, reviewId, payload, req["user"]);
	}

	@ApiOperation({summary: `${Roles.USER}, ${Roles.ADMIN}, ${Roles.SUPERADMIN}`})
	@UseGuards(AuthGuard, RoleGuard)
	@RolesGuard(Roles.USER, Roles.ADMIN, Roles.SUPERADMIN)
	@Delete('movies/:movieId/reviews/:reviewId')
	remove(@Req() req: Request, @Param('movieId', ParseIntPipe) movieId: number, @Param('reviewId', ParseIntPipe) reviewId: number) {
		return this.reviewsService.remove(movieId, reviewId, req["user"]);
	}
}
