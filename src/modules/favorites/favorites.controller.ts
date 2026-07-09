import { Controller, Get, Post, Body, Patch, Param, Delete, Req, ParseIntPipe, UseGuards } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Roles } from '@prisma/client';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { RolesGuard } from 'src/common/decorators/roles';

@ApiBearerAuth()
@Controller('favorites')
export class FavoritesController {
	constructor(private readonly favoritesService: FavoritesService) {}

	@ApiOperation({summary: `${Roles.USER}`})
	@UseGuards(AuthGuard, RoleGuard)
	@RolesGuard(Roles.USER)
	@Post()
	create(
		@Req() req: Request, @Body() payload: CreateFavoriteDto
	) {
		return this.favoritesService.create(payload, req["user"]);
	}

	@ApiOperation({summary: `${Roles.USER}`})
	@UseGuards(AuthGuard, RoleGuard)
	@RolesGuard(Roles.USER)
	@Get()
	findAll(@Req() req: Request) {
		return this.favoritesService.findAll(req["user"]);
	}

	@ApiOperation({summary: `${Roles.USER}`})
	@UseGuards(AuthGuard, RoleGuard)
	@RolesGuard(Roles.USER)
	@Delete(':movieId')
	remove(@Req() req: Request, @Param('movieId', ParseIntPipe) movieId: number) {
		return this.favoritesService.remove(movieId, req["user"]);
	}
}
