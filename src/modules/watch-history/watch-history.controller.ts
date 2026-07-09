import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, ParseIntPipe } from '@nestjs/common';
import { WatchHistoryService } from './watch-history.service';
import { CreateWatchHistoryDto } from './dto/create-watch-history.dto';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { RolesGuard } from 'src/common/decorators/roles';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { Roles } from '@prisma/client';

@ApiBearerAuth()
@Controller('watch-history')
export class WatchHistoryController {
  	constructor(private readonly watchHistoryService: WatchHistoryService) {}

	@ApiOperation({summary: `${Roles.USER}`})
	@UseGuards(AuthGuard, RoleGuard)
	@RolesGuard(Roles.USER)
	@Patch("movie/:movieId")
	create(@Req() req: Request, @Param("movieId", ParseIntPipe) movieId: number, @Body() payload: CreateWatchHistoryDto) {
		return this.watchHistoryService.create(payload, movieId, req["user"]);
	}

	@ApiOperation({summary: `${Roles.USER}`})
	@UseGuards(AuthGuard, RoleGuard)
	@RolesGuard(Roles.USER)
	@Get("movies/all")
	findAll(@Req() req: Request) {
		return this.watchHistoryService.findAll(req["user"]);
	}

	@ApiOperation({summary: `${Roles.USER}`})
	@UseGuards(AuthGuard, RoleGuard)
	@RolesGuard(Roles.USER)
	@Delete("movie/:movieId")
	remove(@Req() req: Request, @Param("movieId", ParseIntPipe) movieId: number,) {
		return this.watchHistoryService.remove(movieId, req["user"]);
	}
}
