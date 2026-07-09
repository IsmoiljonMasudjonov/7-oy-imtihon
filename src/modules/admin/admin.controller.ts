import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe, Req } from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { RolesGuard } from 'src/common/decorators/roles';
import { Roles } from '@prisma/client';

@ApiBearerAuth()
@Controller('admin')
export class AdminController {
	constructor(private readonly adminService: AdminService) {}
	
	@ApiOperation({summary: `${Roles.SUPERADMIN}`})
	@UseGuards(AuthGuard, RoleGuard)
	@RolesGuard(Roles.SUPERADMIN)
	@Post()
	create(@Body() payload: CreateAdminDto) {
		return this.adminService.create(payload);
	}

	@ApiOperation({summary: `${Roles.SUPERADMIN}`})
	@UseGuards(AuthGuard, RoleGuard)
	@RolesGuard(Roles.SUPERADMIN)
	@Get("all")
	findAll() {
		return this.adminService.findAll();
	}

	@ApiOperation({summary: `${Roles.ADMIN}`})
	@Get("me")
	@UseGuards(AuthGuard, RoleGuard)
	@RolesGuard(Roles.ADMIN)
	findMe(@Req() req: Request) {
		return this.adminService.findMe(req["user"]);
	}

	@ApiOperation({summary: `${Roles.SUPERADMIN}`})
	@UseGuards(AuthGuard, RoleGuard)
	@RolesGuard(Roles.SUPERADMIN)
	@Get(':userId')
	findOne(@Param('userId', ParseIntPipe) userId: number) {
		return this.adminService.findOne(userId);
	}


	@ApiOperation({summary: `${Roles.SUPERADMIN}`})
	@UseGuards(AuthGuard, RoleGuard)
	@RolesGuard(Roles.SUPERADMIN)
	@Patch(':userId')
	update(@Param('userId', ParseIntPipe) userId: number, @Body() payload: UpdateAdminDto) {
		return this.adminService.update(userId, payload);
	}

	@ApiOperation({summary: `${Roles.ADMIN}`})
	@UseGuards(AuthGuard, RoleGuard)
	@RolesGuard(Roles.ADMIN)
	@Patch("me")
	updateMe(@Req() req: Request, @Body() payload: UpdateAdminDto) {
		return this.adminService.updateMe(payload, req["user"]);
	}

	@ApiOperation({summary: `${Roles.SUPERADMIN}`})
	@UseGuards(AuthGuard, RoleGuard)
	@RolesGuard(Roles.SUPERADMIN)
	@Delete(':userId')
	remove(@Param('userId', ParseIntPipe) userId: number) {
		return this.adminService.remove(userId);
	}
}
