import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BatchEvent, WebhookPayLoad } from '../batch-events/entities/batch-events.entity';
import { Repository } from 'typeorm';
import { Batch } from '../batches/entities/batch.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WebhookService {
    constructor(
        @InjectRepository(BatchEvent)
        private batchEvent: Repository<BatchEvent>,

        private configService: ConfigService,
    ) {}

    async fireWebhook(batch: Batch): Promise<void> {
        const payload: WebhookPayLoad = {
            batchId: batch.id,
            name: batch.name, 
            summary: {
                total: batch.totalLeads,
                ready: batch.totalReady,
                failed: batch.totalFailed
            },
            link_to_detail: `${this.configService.get<string>('FRONTEND_URL')}/batches/${batch.id}`, 

        }

        let statusCode = 0; 
        let attemptNumber = 1; 

        try {
            const response = await fetch(batch.webhookUrl, {
                method: 'POST',
                headers: { 'Content-type': 'application/json' },
                body: JSON.stringify(payload),
                signal: AbortSignal.timeout(10000)
            });
            
            statusCode = response.status; 

        } catch {
            statusCode = 0; 
        }

        const batchEvent = this.batchEvent.create({
            batchId: batch.id, 
            payload, 
            statusCode, 
            attemptNumber,
        });

        await this.batchEvent.save(batchEvent);
    }
}
