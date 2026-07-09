import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards, Req } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { CreateSubscriptionPlanDto } from './dto/create-subscriptionPlan.dto';
import { UpdateSubscriptionPlanDto } from './dto/update-subscriptionPlan.dto';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Roles } from '@prisma/client';
import { RolesGuard } from 'src/common/decorators/roles';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { CreateSubscriptionPaymetDto } from './dto/create-subscriptionPaymet.dto';

@ApiBearerAuth()
@Controller('subscription')
export class SubscriptionController {
	constructor(private readonly subscriptionService: SubscriptionService) {}

	@ApiOperation({summary: `${Roles.ADMIN}, ${Roles.SUPERADMIN}`})
	@UseGuards(AuthGuard, RoleGuard)
	@RolesGuard(Roles.ADMIN, Roles.SUPERADMIN)
	@Post("admin/plan")
	createPlan(@Body() payload: CreateSubscriptionPlanDto) {
		return this.subscriptionService.createPlan(payload);
	}

	@ApiOperation({summary: `${Roles.USER}, ${Roles.ADMIN}, ${Roles.SUPERADMIN}`})
	@UseGuards(AuthGuard, RoleGuard)
	@RolesGuard(Roles.USER ,Roles.ADMIN, Roles.SUPERADMIN)
	@Get("all/plans")
	findAll() {
		return this.subscriptionService.findAllPlan();
	}

	@ApiOperation({summary: `${Roles.USER}, ${Roles.ADMIN}, ${Roles.SUPERADMIN}`})
	@UseGuards(AuthGuard, RoleGuard)
	@RolesGuard(Roles.USER ,Roles.ADMIN, Roles.SUPERADMIN)
	@Get('all/plan/:planId')
	findOne(@Param('planId', ParseIntPipe) planId: number) {
		return this.subscriptionService.findOnePlan(planId);
	}

	@ApiOperation({summary: `${Roles.ADMIN}, ${Roles.SUPERADMIN}`})
	@UseGuards(AuthGuard, RoleGuard)
	@RolesGuard(Roles.ADMIN, Roles.SUPERADMIN)
	@Patch('admin/plan/:planId')
	update(@Param('planId', ParseIntPipe) planId: number, @Body() payload: UpdateSubscriptionPlanDto) {
		return this.subscriptionService.updatePlan(planId, payload);
	}

	@ApiOperation({summary: `${Roles.ADMIN}, ${Roles.SUPERADMIN}`})
	@UseGuards(AuthGuard, RoleGuard)
	@RolesGuard(Roles.ADMIN, Roles.SUPERADMIN)
	@Delete('admin/plan/:planId')
	remove(@Param('planId', ParseIntPipe) planId: number) {
		return this.subscriptionService.removePlan(planId);
	}	

	@ApiOperation({summary: `${Roles.ADMIN} ${Roles.SUPERADMIN}`})
	@UseGuards(AuthGuard, RoleGuard)
	@RolesGuard(Roles.ADMIN, Roles.SUPERADMIN)
	@Get("all/user-subscriptions")
	getAllUserSubscription() {
		return this.subscriptionService.getAllUserSubscription();
	}	

	@ApiOperation({summary: `${Roles.USER}`})
	@UseGuards(AuthGuard, RoleGuard)
	@RolesGuard(Roles.USER)
	@Get("user/user-subscriptions")
	userGetAllUserSubscription(@Req() req: Request) {
		return this.subscriptionService.userGetAllUserSubscription(req["user"]);
	}

	@ApiOperation({summary: `${Roles.ADMIN} ${Roles.SUPERADMIN}`})
	@UseGuards(AuthGuard, RoleGuard)
	@RolesGuard(Roles.ADMIN, Roles.SUPERADMIN)
	@Get("all/user-subscriptions/:subId")
	getOneUserSubscription(@Param("subId", ParseIntPipe) subId: number) {
		return this.subscriptionService.getOneUserSubscription(subId);
	}

	@ApiOperation({summary: `${Roles.USER}`})
	@UseGuards(AuthGuard, RoleGuard)
	@RolesGuard(Roles.USER)
	@Get("user/user-subscriptions/:subId")
	userGetOneUserSubscription(
		@Req() req: Request, 
		@Param("subId", ParseIntPipe) subId: number
	) {
		return this.subscriptionService.userGetOneUserSubscription(subId, req["user"]);
	}

	@ApiOperation({summary: `${Roles.USER}`})
	@UseGuards(AuthGuard, RoleGuard)
	@RolesGuard(Roles.USER)
	@Post("paymet/user-subscription")
	pubscriptionPaymet(@Req() req: Request, @Body() payload: CreateSubscriptionPaymetDto) {
		return this.subscriptionService.subscriptionPaymet(req["user"], payload);
	}
}
