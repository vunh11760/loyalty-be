import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { LoyaltyLevelController } from './loyalty-level.controller';
import { LoyaltyLevelService } from './loyalty-level.service';

@Module({
  imports: [AuthModule],
  controllers: [LoyaltyLevelController],
  providers: [LoyaltyLevelService],
})
export class LoyaltyLevelModule {}
