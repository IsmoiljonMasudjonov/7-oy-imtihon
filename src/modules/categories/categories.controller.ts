import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Roles } from '@prisma/client';
import { RolesGuard } from 'src/common/decorators/roles';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';

@ApiBearerAuth()
@Controller('categories')
export class CategoriesController {
	constructor(private readonly categoriesService: CategoriesService) {}

	@ApiOperation({summary: `${Roles.ADMIN} ${Roles.SUPERADMIN}`})
	@UseGuards(AuthGuard, RoleGuard)
	@RolesGuard(Roles.ADMIN, Roles.SUPERADMIN)
	@Post()
	create(@Body() payload: CreateCategoryDto) {
		return this.categoriesService.create(payload);
	}

	@ApiOperation({summary: `${Roles.ADMIN} ${Roles.SUPERADMIN}`})
	@UseGuards(AuthGuard, RoleGuard)
	@RolesGuard(Roles.ADMIN, Roles.SUPERADMIN)
	@Get("all")
	findAll() {
		return this.categoriesService.findAll();
	}

	@ApiOperation({summary: `${Roles.ADMIN} ${Roles.SUPERADMIN}`})
	@UseGuards(AuthGuard, RoleGuard)
	@RolesGuard(Roles.ADMIN, Roles.SUPERADMIN)
	@Get(':categoryId')
	findOne(@Param('categoryId', ParseIntPipe) categoryId: number) {
		return this.categoriesService.findOne(categoryId);
	}

	@ApiOperation({summary: `${Roles.ADMIN} ${Roles.SUPERADMIN}`})
	@UseGuards(AuthGuard, RoleGuard)
	@RolesGuard(Roles.ADMIN, Roles.SUPERADMIN)
	@Patch(':categoryId')
	update(@Param('categoryId', ParseIntPipe) categoryId: number, @Body() payload: UpdateCategoryDto) {
		return this.categoriesService.update(categoryId, payload);
	}

	@ApiOperation({summary: `${Roles.ADMIN} ${Roles.SUPERADMIN}`})
	@UseGuards(AuthGuard, RoleGuard)
	@RolesGuard(Roles.ADMIN, Roles.SUPERADMIN)
	@Delete(':categoryId')
	remove(@Param('categoryId', ParseIntPipe) categoryId: number) {
		return this.categoriesService.remove(categoryId);
	}
}
