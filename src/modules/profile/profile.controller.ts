import { Controller, Get, Body, Param, Put, ParseIntPipe, UseGuards, Req } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { RolesGuard } from 'src/common/decorators/roles';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { Roles } from '@prisma/client';


@ApiBearerAuth()
@Controller('profile')
export class ProfileController {
  	constructor(private readonly profileService: ProfileService) {}

  	@ApiOperation({summary: `${Roles.USER} ${Roles.ADMIN} ${Roles.SUPERADMIN}`})
	@UseGuards(AuthGuard, RoleGuard)
	@RolesGuard(Roles.ADMIN, Roles.SUPERADMIN, Roles.USER)
	@Get()
	findMyProfile(@Req() req: Request) {
		return this.profileService.findMyProfile(req["user"]);
	}

	@ApiOperation({summary: `${Roles.ADMIN} ${Roles.SUPERADMIN}`})
	@UseGuards(AuthGuard, RoleGuard)
	@RolesGuard(Roles.ADMIN, Roles.SUPERADMIN)
	@Get("all")
	findAll(@Req() req: Request) {
		return this.profileService.findAll(req["user"]);
	}

	@ApiOperation({summary: `${Roles.ADMIN} ${Roles.SUPERADMIN}`})
	@UseGuards(AuthGuard, RoleGuard)
	@RolesGuard(Roles.ADMIN, Roles.SUPERADMIN)
	@Get(":userId")
	findOne(@Req() req: Request, @Param("userId", ParseIntPipe) userId: number) {
		return this.profileService.findOne(userId, req["user"]);
	}

	@ApiOperation({summary: `${Roles.USER} ${Roles.ADMIN} ${Roles.SUPERADMIN}`})
	@UseGuards(AuthGuard, RoleGuard)
	@RolesGuard(Roles.USER, Roles.ADMIN, Roles.SUPERADMIN)
	@Put()
	updateMyProfile(@Req() req: Request, @Body() payload: UpdateProfileDto) {
		return this.profileService.updateMyProfile(payload, req["user"]);
	}

	@ApiOperation({summary: `${Roles.SUPERADMIN}`})
	@UseGuards(AuthGuard, RoleGuard)
	@RolesGuard(Roles.SUPERADMIN)
	@Put("admin/:userId")
	updateUserProfile(@Param("userId", ParseIntPipe) userId: number, @Req() req: Request, @Body() payload: UpdateProfileDto) {
		return this.profileService.updateUserProfile(userId, payload, req["user"]);
	}

	@ApiOperation({summary: `${Roles.SUPERADMIN}`})
	@UseGuards(AuthGuard, RoleGuard)
	@RolesGuard(Roles.SUPERADMIN)
	@Put("admin/:userId")
	deleteUserProfile(@Param("userId", ParseIntPipe) userId: number, @Req() req: Request) {
		return this.profileService.deleteUserProfile(userId, req["user"]);
	}

}
