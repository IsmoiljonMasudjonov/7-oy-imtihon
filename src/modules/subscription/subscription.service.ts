import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSubscriptionPlanDto } from './dto/create-subscriptionPlan.dto';
import { UpdateSubscriptionPlanDto } from './dto/update-subscriptionPlan.dto';
import { PrismaService } from 'src/core/database/prisma.service';
import { PaymentStatus, Roles } from '@prisma/client';
import { CreateSubscriptionPaymetDto } from './dto/create-subscriptionPaymet.dto';

@Injectable()
export class SubscriptionService {
	constructor(private prisma: PrismaService){}

	async createPlan(payload: CreateSubscriptionPlanDto) {
		await this.prisma.subscriptionPlan.create({
			data: payload
		})

		return {
			success: true,
			message: "Subscription plan created successfully!"
		}
	}

	async findAllPlan() {
		const plans = await this.prisma.subscriptionPlan.findMany({
			where: {
				is_active: true 
			},
			select: {
				name: true,
				price: true,
				duration_days: true,
				features: true,
				created_at: true
			}
		})

		return {
			success: true,
			data: plans
		}
	}

	async findOnePlan(planId: number) {
		const plan = await this.prisma.subscriptionPlan.findUnique({
			where: {
				id: planId,
				is_active: true
			},
			select: {
				name: true,
				price: true,
				duration_days: true,
				features: true,
				created_at: true
			}
		})

		if (!plan){
			throw new NotFoundException(`Subscription plan not found with this planId = ${planId}!`)
		}

		return {
			success: true,
			data: plan
		}
	}

	async updatePlan(planId: number, payload: UpdateSubscriptionPlanDto) {
		const plan = await this.prisma.subscriptionPlan.findUnique({
			where: {
				id: planId
			}
		})

		if (!plan){
			throw new NotFoundException(`Subscription plan not found with this planId = ${planId}!`)
		}

		await this.prisma.subscriptionPlan.update({
			where: {
				id: planId
			},
			data: payload
		})

		return {
			success: true,
			message: "Subscription plan updated successfully!"
		}
	}

	async removePlan(planId: number) {
		const plan = await this.prisma.subscriptionPlan.findUnique({
			where: {
				id: planId
			}
		})

		if (!plan){
			throw new NotFoundException(`Subscription plan not found with this planId = ${planId}!`)
		}

		await this.prisma.subscriptionPlan.delete({
			where: {
				id: planId
			}
		})

		return {
			success: true,
			message: "Subscription plan deleted successfully!"
		}
	}

	async getAllUserSubscription(){
		const userSubscriptions = await this.prisma.userSubscription.findMany({
			select: {
				id: true,
				user_id: true,
				plan_id: true,
				status: true,
				start_date: true,
				end_date: true
			}
		})

		return {
			success: true,
			data: userSubscriptions
		}
	}

	async userGetAllUserSubscription(currentUser: {id: number, role: Roles}){
		const userSubscriptions = await this.prisma.userSubscription.findMany({
			where: {
				user_id: currentUser.id
			},
			select: {
				id: true,
				user_id: true,
				plan_id: true,
				status: true,
				start_date: true,
				end_date: true
			}
		})

		return {
			success: true,
			data: userSubscriptions
		}
	}

	async getOneUserSubscription(subId: number){
		const existSub = await this.prisma.userSubscription.findUnique({
			where: {
				id: subId
			},
			select: {
				id: true,
				user_id: true,
				plan_id: true,
				status: true,
				start_date: true,
				end_date: true
			}
		})

		if (!existSub){
			throw new NotFoundException(`User subscription not found with this subId = ${subId}`)
		}

		return {
			success: true,
			data: existSub
		}
	}

	async userGetOneUserSubscription(subId: number, currentUser: {id: number, role: Roles}){
		const existSub = await this.prisma.userSubscription.findUnique({
			where: {
				id: subId,
				user_id: currentUser.id
			},
			select: {
				id: true,
				user_id: true,
				plan_id: true,
				status: true,
				start_date: true,
				end_date: true
			}
		})

		if (!existSub){
			throw new NotFoundException(`Your subscription not found with this subId = ${subId}`)
		}

		return {
			success: true,
			data: existSub
		}
	}

	async subscriptionPaymet(subId: number, currentUser: {id: number, role: Roles}, payload: CreateSubscriptionPaymetDto){
		const plan = await this.prisma.subscriptionPlan.findUnique({
			where: {
				id: payload.plan_id
			}
		});


		if (!plan) {
			throw new NotFoundException("Subscription plan not found!");
		}


		const start_date = new Date();

		const end_date = new Date(start_date);

		end_date.setDate(
			start_date.getDate() + plan.duration_days
		);


		const subscription =
		await this.prisma.userSubscription.create({

			data: {
				user_id: currentUser.id,
				plan_id: plan.id,
				start_date,
				end_date,
				status: 'ACTIVE',
				auto_renew: payload.auto_renew
			},

			include: {
				plan: {
					select: {
						id: true,
						name: true
					}
				}
			}
		});



		const payment =
		await this.prisma.payment.create({

			data: {
				user_subscription_id: subscription.id,
				amount: plan.price,
				payment_method: payload.payment_method,
				payment_details: payload.payment_details,
				status: 'COMPLETED',

				external_transaction_id:
					`txn_${Date.now()}`
			}
		});



		return {
			success: true,
			message: "Subscription created successfully",
			data: {
				subscription: {
					id: subscription.id,
					plan: subscription.plan,
					start_date: subscription.start_date,
					end_date: subscription.end_date,
					status: subscription.status,
					auto_renew: subscription.auto_renew
				},
				payment: {
					id: payment.id,
					amount: payment.amount,
					status: payment.status,
					external_transaction_id: payment.external_transaction_id,
					payment_method: payment.payment_method
				}
			}
		};
	}
}
