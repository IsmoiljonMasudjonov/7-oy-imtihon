import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PrismaService } from 'src/core/database/prisma.service';

@Injectable()
export class CategoriesService {
	constructor(private prisma: PrismaService){}

	async create(payload: CreateCategoryDto) {
		const existSlug = await this.prisma.category.findUnique({
			where: {
				slug: payload.slug
			}
		});

		if (existSlug){
			throw new ConflictException(`Category already exists with this slug = ${payload.slug}!`);
		}

		await this.prisma.category.create({
			data: payload
		});

		return {
			success: true,
			message: "Category created successfully!"
		}
	}

	async findAll() {
		const categories = await this.prisma.category.findMany({
			select: {
				id: true,
				name: true,
				slug: true,
				description: true
			}
		})

		return {
			success: true,
			data: categories
		}

	}

	async findOne(categoryId: number) {
		const existCategory = await this.prisma.category.findUnique({
			where: {
				id: categoryId
			},
			select: {
				id: true,
				name: true,
				slug: true,
				description: true
			}
		});

		if (!existCategory){
			throw new NotFoundException(`Category not found with this categoryId = ${categoryId}!`);
		}

		return {
			success: true,
			data: existCategory
		}
	}

	async update(categoryId: number, payload: UpdateCategoryDto) {
		const existCategory = await this.prisma.category.findUnique({
			where: {
				id: categoryId
			}
		});

		if (!existCategory){
			throw new NotFoundException(`Category not found with this categoryId = ${categoryId}!`);
		}
		const { slug } = payload

		if (slug){
			const existSlug = await this.prisma.category.findUnique({
				where: {
					slug
				}
			});

			if (existSlug && existSlug.id !== categoryId){
				throw new ConflictException(`Category already exists with this slug = ${slug}!`)
			}

		}

		await this.prisma.category.update({
			where: {
				id: categoryId
			},
			data: payload
		})

		return {
			success: true,
			message: "Category updated successfully!"
		}

	}

	async remove(categoryId: number) {
		const existCategory = await this.prisma.category.findUnique({
			where: {
				id: categoryId
			}
		});

		if (!existCategory){
			throw new NotFoundException(`Category not found with this categoryId = ${categoryId}!`);
		}

		const existMovie = await this.prisma.movieCategory.findFirst({
			where: {
				category_id: categoryId
			}
		})

		if (existMovie){
			throw new BadRequestException(`Cannot delete this Category. Movies exists with this categoryId = ${categoryId}!`)
		}

		await this.prisma.category.delete({
			where: {
				id: categoryId
			}
		})

		return {
			success: true,
			message: "Category deleted successfully!"
		}
	}
}
