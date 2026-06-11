import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq'; 
import { BATCH_QUEUE, BatchJobData } from '../batches.constants';
import { InjectRepository } from '@nestjs/typeorm';
import { Batch, BatchStatus } from '../entities/batch.entity';
import { Repository, Not } from 'typeorm';
import { Lead, LeadStatus } from '../../leads/entities/lead.entity';
import { NotFoundException } from '@nestjs/common';
import { WebhookService } from '../../webhook/webhook.service';
import { AiEnrichmentService } from './ai-enrichment-service';


@Processor(BATCH_QUEUE)
export class BatchProcessor extends WorkerHost {
    constructor(
        @InjectRepository(Batch)
        private batchRepository:Repository<Batch>, 

        @InjectRepository(Lead)
        private leadRepository:Repository<Lead>,

        private webhookService: WebhookService,
        private aiEnrichmentService: AiEnrichmentService,
    ) {
        super()
    }

    async process(job: Job<BatchJobData>): Promise<void> {
        console.log('Processing job', job.data);
        const { batchId } = job.data;
        const batch = await this.batchRepository.findOne({
            where: { id: batchId },
            relations: { leads: true }
        })

        if (!batch) {
            throw new NotFoundException(`Batch ${batchId} not found`);
        }

        batch.status = BatchStatus.PROCESSING;
        batch.processingStartedAt = new Date(); 

        await this.batchRepository.save(batch);

        for (const lead of batch.leads) {
            await this.processLead(lead, batch.leads);
        }

        const updatedLeads = await this.leadRepository.find({
            where: { batchId }
        });

        batch.totalReady = updatedLeads.filter(l => l.status === LeadStatus.AI_READY).length;
        batch.totalFailed = updatedLeads.filter(l => l.status === LeadStatus.FAILED || l.status === LeadStatus.AI_FAILED).length;
        batch.status = BatchStatus.COMPLETED;

        await this.batchRepository.save(batch);

        await this.webhookService.fireWebhook(batch);
        
    }

    async processLead(lead: Lead, allLeads: Lead[]): Promise<void> {
        lead.status = LeadStatus.PROCESSING;
        await this.leadRepository.save(lead);

        try {
            if (!lead.legalId || lead.legalId.trim() === '') {
                throw new Error('legal_id is empty');
            }

            if (!lead.website || lead.website.trim() === '') {
                throw new Error('website is empty');
            }
            
            let parsedUrl:URL;
            try {
                parsedUrl = new URL(lead.website)
            } catch {
                throw new Error('website is not a valid URL')
            }

            const existingLead = await this.leadRepository.findOne({
            where: {
                batchId: lead.batchId,
                legalId: lead.legalId,
                id: Not(lead.id)
            }
            });

            const isDuplicate = existingLead !== null && 
            existingLead.status !== LeadStatus.FAILED && 
            existingLead.status !== LeadStatus.AI_FAILED;

            if (isDuplicate) {
            throw new Error('duplicate');
}

            lead.mainDomain = parsedUrl.hostname;
            lead.normalizedLegalName = lead.legalName.trim().toUpperCase();

            try {
                const response = await fetch(lead.website, {
                    method: 'HEAD',
                    signal: AbortSignal.timeout(5000)
                });
                lead.isWebsiteAlive = response.ok; 

            } catch {
                lead.isWebsiteAlive = false; 
            }

            lead.status = LeadStatus.READY; 
            await this.leadRepository.save(lead);

            lead.status = LeadStatus.AI_ENRICHING;
            await this.leadRepository.save(lead);

            try {
                const aiResult = await this.aiEnrichmentService.enrichLead(lead);

                lead.prospectFitScore = aiResult.prospectFitScore;
                lead.prospectFitJustification = aiResult.prospectFitJustification;
                lead.iceBreaker = aiResult.iceBreaker;
                lead.painHypothesis = aiResult.painHypothesis; 
                lead.status = LeadStatus.AI_READY
                await this.leadRepository.save(lead);
            } catch(error) {
                lead.status = LeadStatus.AI_FAILED; 
                lead.aiErrorReason = error instanceof Error ? error.message: "Unknown error";
                await this.leadRepository.save(lead);
                
            }

        } catch (error) {
            lead.status = LeadStatus.FAILED;
            lead.errorReason = error instanceof Error ? error.message : 'Unknown error';
            await this.leadRepository.save(lead);

        }

    }
}
