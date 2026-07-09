import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { RolesGuard } from 'src/common/decorators/roles';
import { Roles } from '@prisma/client';

@ApiBearerAuth()
@Controller('user')
export class UserController {
	constructor(private readonly userService: UserService) {}

	@ApiOperation({summary: `${Roles.ADMIN}, ${Roles.SUPERADMIN}`})
	@UseGuards(AuthGuard, RoleGuard)
	@RolesGuard(Roles.ADMIN, Roles.SUPERADMIN)
	@Get("all")
	findAll() {
		return this.userService.findAll();
	}

	@ApiOperation({summary: `${Roles.USER}`})
	@Get("me")
	@UseGuards(AuthGuard, RoleGuard)
	@RolesGuard(Roles.USER)
	findMe(@Req() req: Request) {
		return this.userService.findMe(req["user"]);
	}

	@ApiOperation({summary: `${Roles.ADMIN}, ${Roles.SUPERADMIN}`})
	@UseGuards(AuthGuard, RoleGuard)
	@RolesGuard(Roles.ADMIN, Roles.SUPERADMIN)
	@Get(':userId')
	findOne(@Param('userId', ParseIntPipe) userId: number) {
		return this.userService.findOne(userId);
	}


	@ApiOperation({summary: `${Roles.ADMIN}, ${Roles.SUPERADMIN}`})
	@UseGuards(AuthGuard, RoleGuard)
	@RolesGuard(Roles.ADMIN, Roles.SUPERADMIN)
	@Patch(':userId')
	update(@Param('userId', ParseIntPipe) userId: number, @Body() payload: UpdateUserDto) {
		return this.userService.update(userId, payload);
	}

	@ApiOperation({summary: `${Roles.USER}`})
	@UseGuards(AuthGuard, RoleGuard)
	@RolesGuard(Roles.USER)
	@Patch("me")
	updateMe(@Req() req: Request, @Body() payload: UpdateUserDto) {
		return this.userService.updateMe(payload, req["user"]);
	}

	@ApiOperation({summary: `${Roles.ADMIN}, ${Roles.SUPERADMIN}`})
	@UseGuards(AuthGuard, RoleGuard)
	@RolesGuard(Roles.ADMIN, Roles.SUPERADMIN)
	@Delete(':userId')
	remove(@Param('userId', ParseIntPipe) userId: number) {
		return this.userService.remove(userId);
	}
}
