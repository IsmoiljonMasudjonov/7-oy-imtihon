import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, UnsupportedMediaTypeException, UploadedFile, ParseIntPipe, Req, BadRequestException } from '@nestjs/common';
import { MovieService } from './movie.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { RolesGuard } from 'src/common/decorators/roles';
import { Roles, SubscriptionType } from '@prisma/client';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@ApiBearerAuth()
@Controller('movie')
export class MovieController {
  constructor(private readonly movieService: MovieService) {}

	@ApiOperation({summary: `${Roles.ADMIN}, ${Roles.SUPERADMIN}`})
	@UseGuards(AuthGuard, RoleGuard)
	@RolesGuard(Roles.ADMIN, Roles.SUPERADMIN)
	@ApiConsumes("multipart/form-data")
	@ApiBody({
		schema: {
			type: "object",
			properties: {
				title: {type: "string"},
				slug: {type: "string"},
				description: {type: "string"},
				release_year: {type: "number"},
				duration_minutes: {type: "number"},
				rating: {type: "number"},
				subscription_type: {type: "string", example: [SubscriptionType.FREE, SubscriptionType.PREMIUM]},
				category_ids:{type:"json", example:[1,2]},
				poster: {type: "string", format: "binary"}
			}
		}
	})
	@Post("admin/movie")
	@UseInterceptors(FileInterceptor("poster", {
		storage: diskStorage({
			destination: "./src/uploads",
			filename: (req, file, cb) => {
				const filename = Date.now() + "." + file.mimetype.split("/")[1];

				cb(null, filename);
			}
		}),
		fileFilter: (req, file, cb) => {
			const existsFileType = ["jpg", "png", "jpeg", "svg"]

			if(!existsFileType.includes(file.mimetype.split("/")[1])){
				return cb(new UnsupportedMediaTypeException(), false);
			};

			cb(null, true);
		}
	}))
	create(
		@Body() payload: CreateMovieDto,
		@Req() req: Request,
		@UploadedFile() file: Express.Multer.File
	) {
		console.log(payload);
		return this.movieService.create(payload,req["user"], file?.filename);
	}

	@ApiOperation({summary: `${Roles.ADMIN}, ${Roles.SUPERADMIN}`})
	@UseGuards(AuthGuard, RoleGuard)
	@RolesGuard(Roles.ADMIN, Roles.SUPERADMIN)
	@Get("admin/movie/all")
	findAll() {
		return this.movieService.findAll();
	}

	@ApiOperation({summary: `${Roles.ADMIN}, ${Roles.SUPERADMIN}`})
	@UseGuards(AuthGuard, RoleGuard)
	@RolesGuard(Roles.ADMIN, Roles.SUPERADMIN)
	@Get('admin/movie/:movieId')
	findOne(@Param('movieId', ParseIntPipe) movieId: number) {
		return this.movieService.findOne(movieId);
	}

	@ApiOperation({summary: `${Roles.USER}`})
	@UseGuards(AuthGuard, RoleGuard)
	@RolesGuard(Roles.USER)
	@Get("user/movie/all")
	userFindAll(@Req() req: Request) {
		return this.movieService.userFindAll(req["user"]);
	}

	@ApiOperation({summary: `${Roles.USER}`})
	@UseGuards(AuthGuard, RoleGuard)
	@RolesGuard(Roles.USER)
	@Get('user/movie/:movieId')
	userFindOne(@Req() req: Request, @Param('movieId', ParseIntPipe) movieId: number) {
		return this.movieService.userFindOne(movieId, req["user"]);
	}

	@ApiOperation({summary: `${Roles.ADMIN}, ${Roles.SUPERADMIN}`})
	@UseGuards(AuthGuard, RoleGuard)
	@RolesGuard(Roles.ADMIN, Roles.SUPERADMIN)
	@Patch('admin/movie/:movieId')
	update(@Param('movieId', ParseIntPipe) movieId: number, @Body() payload: UpdateMovieDto) {
		return this.movieService.update(movieId, payload);
	}

	@ApiOperation({summary: `${Roles.ADMIN}, ${Roles.SUPERADMIN}`})
	@UseGuards(AuthGuard, RoleGuard)
	@RolesGuard(Roles.ADMIN, Roles.SUPERADMIN)
	@Delete('admin/movie/:movieId')
	remove(@Param('movieId', ParseIntPipe) movieId: number) {
		return this.movieService.remove(movieId);
	}
}
