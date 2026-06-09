import { Module } from '@nestjs/common';
import { BatchesController } from './batches.controller';
import { BatchesService } from './batches.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Batch } from './entities/batch.entity';
import { Lead } from '../leads/entities/lead.entity';
import { BATCH_QUEUE } from './batches.constants';
import { BullModule } from '@nestjs/bullmq';
import { WebhookModule } from '../webhook/webhook.module';
import { BatchProcessor } from './processor/batch.processor';

@Module({
  imports: [
            TypeOrmModule.forFeature([Batch, Lead]),
            BullModule.registerQueue({ name: BATCH_QUEUE }),
            WebhookModule,
          ],
  controllers: [BatchesController],
  providers: [BatchesService, BatchProcessor],
})
export class BatchesModule {}
