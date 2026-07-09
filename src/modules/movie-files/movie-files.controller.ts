import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe, UseInterceptors, UnsupportedMediaTypeException, Req, UploadedFile } from '@nestjs/common';
import { MovieFilesService } from './movie-files.service';
import { CreateMovieFileDto } from './dto/create-movie-file.dto';
import { UpdateMovieFileDto } from './dto/update-movie-file.dto';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { Quality, Roles } from '@prisma/client';
import { RoleGuard } from 'src/common/guards/role.guard';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RolesGuard } from 'src/common/decorators/roles';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@ApiBearerAuth()
@Controller('movie-files')
export class MovieFilesController {
	constructor(private readonly movieFilesService: MovieFilesService) {}

	@ApiOperation({summary: `${Roles.ADMIN}, ${Roles.SUPERADMIN}`})
	@UseGuards(AuthGuard, RoleGuard)
	@RolesGuard(Roles.ADMIN, Roles.SUPERADMIN)
	@ApiConsumes("multipart/form-data")
	@ApiBody({
		schema: {
			type: "object",
			properties: {
				file: {type: "string", format: "binary"},
				quality: {type: "string", example: Quality.Q720P},
				language: {type: "string", example: "uz"},
			}
		}
	})
	@Post('admin/movies/:movieId/files')
	@UseInterceptors(FileInterceptor("file", {
		storage: diskStorage({
			destination: "./src/uploads",
			filename: (req, file, cb) => {
				const filename = Date.now() + "." + file.mimetype.split("/")[1];

				cb(null, filename);
			}
		}),
		fileFilter: (req, file, cb) => {
			const existsFileType = ["mp4","mkv","avi","mov"]

			if(!existsFileType.includes(file.mimetype.split("/")[1])){
				return cb(new UnsupportedMediaTypeException(), false);
			};

			cb(null, true);
		}
	}))
	create(
		@Param("movieId", ParseIntPipe) movieId: number,
		@Body() payload: CreateMovieFileDto,
		@UploadedFile() file: Express.Multer.File
	) {
		return this.movieFilesService.create(movieId, payload, file?.filename);
	}

	@ApiOperation({summary: `${Roles.ADMIN}, ${Roles.SUPERADMIN}`})
	@UseGuards(AuthGuard, RoleGuard)
	@RolesGuard(Roles.ADMIN, Roles.SUPERADMIN)
	@Get('admin/all/movies/files')
	findAll() {
		return this.movieFilesService.findAll();
	}

	@ApiOperation({summary: `${Roles.USER}`})
	@UseGuards(AuthGuard, RoleGuard)
	@RolesGuard(Roles.USER)
	@Get('user/all/movies/files')
	userFindAll(@Req() req: Request) {
		return this.movieFilesService.userFindAll(req["user"]);
	}

	@ApiOperation({summary: `${Roles.ADMIN}, ${Roles.SUPERADMIN}`})
	@UseGuards(AuthGuard, RoleGuard)
	@RolesGuard(Roles.ADMIN, Roles.SUPERADMIN)
	@Get('admin/one/movie/:movieId/file')
	findOne(@Param('movieId', ParseIntPipe) movieId: number) {
		return this.movieFilesService.findOne(movieId);
	}

	@ApiOperation({summary: `${Roles.USER}`})
	@UseGuards(AuthGuard, RoleGuard)
	@RolesGuard(Roles.USER)
	@Get('user/one/movie/:movieId/file')
	userFindOne(@Param('movieId', ParseIntPipe) movieId: number, @Req() req: Request) {
		return this.movieFilesService.userFindOne(movieId, req["user"]);
	}

	@ApiOperation({summary: `${Roles.ADMIN}, ${Roles.SUPERADMIN}`})
	@UseGuards(AuthGuard, RoleGuard)
	@RolesGuard(Roles.ADMIN, Roles.SUPERADMIN)
	@Patch('admin/movie/:movieFileId/file')
	update(@Param('movieFileId', ParseIntPipe) movieFileId: number, @Body() payload: UpdateMovieFileDto) {
		return this.movieFilesService.update(movieFileId, payload);
	}

	@ApiOperation({summary: `${Roles.ADMIN}, ${Roles.SUPERADMIN}`})
	@UseGuards(AuthGuard, RoleGuard)
	@RolesGuard(Roles.ADMIN, Roles.SUPERADMIN)
	@Delete('admin/movie/:movieFileId/file')
	remove(@Param('movieFileId', ParseIntPipe) movieFileId: number) {
		return this.movieFilesService.remove(movieFileId);
	}
}
