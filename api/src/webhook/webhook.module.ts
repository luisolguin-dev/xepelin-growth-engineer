import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BatchEvent } from '../batch-events/entities/batch-events.entity';
import { WebhookService } from './webhook.service';

@Module({
    imports: [TypeOrmModule.forFeature([BatchEvent])],
    providers: [WebhookService],
    exports: [WebhookService],
})
export class WebhookModule {}
