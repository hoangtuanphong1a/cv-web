import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionPlansController } from './subscription-plans.controller';
import { SubscriptionPlansService } from './subscription-plans.service';
import { SubscriptionPlan } from '../common/entities/subscription-plan.entity';
import { Subscription } from '../common/entities/subscription.entity';
import { Payment } from '../common/entities/payment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([SubscriptionPlan, Subscription, Payment]),
  ],
  controllers: [SubscriptionPlansController],
  providers: [SubscriptionPlansService],
  exports: [SubscriptionPlansService],
})
export class SubscriptionsModule {}
