import { Module } from '@nestjs/common';
import { BatchesController } from './batches.controller';
import { BatchesService } from './batches.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Batch } from './entities/batch.entity';
import { Lead } from '../leads/entities/lead.entity';
import { BATCH_QUEUE } from './batches.constants';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [TypeOrmModule.forFeature([Batch, Lead]),
            BullModule.registerQueue({ name: BATCH_QUEUE })],
  controllers: [BatchesController],
  providers: [BatchesService]
})
export class BatchesModule {}
