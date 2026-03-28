import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { QrController } from './qr.controller';
import { QrService } from './qr.service';

@Module({
  imports: [AuthModule],
  controllers: [QrController],
  providers: [QrService],
})
export class QrModule {}
