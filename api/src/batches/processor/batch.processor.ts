import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq'; 
import { BATCH_QUEUE, BatchJobData } from '../batches.constants';
import { InjectRepository } from '@nestjs/typeorm';
import { Batch, BatchStatus } from '../entities/batch.entity';
import { Repository } from 'typeorm';
import { Lead, LeadStatus } from '../../leads/entities/lead.entity';
import { NotFoundException } from '@nestjs/common';

@Processor(BATCH_QUEUE)
export class BatchProcessor extends WorkerHost {
    constructor(
        @InjectRepository(Batch)
        private batchRepository:Repository<Batch>, 

        @InjectRepository(Lead)
        private leadRepository:Repository<Lead>
    ) {
        super()
    }

    async process(job: Job<BatchJobData>): Promise<void> {
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

        batch.totalReady = updatedLeads.filter(l => l.status === LeadStatus.READY).length;
        batch.totalFailed = updatedLeads.filter(l => l.status === LeadStatus.FAILED).length;
        batch.status = BatchStatus.COMPLETED;

        await this.batchRepository.save(batch);
        
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

            const isDuplicate = allLeads
                                .filter(l => l.id !== lead.id)
                                .some(l => l.legalId === lead.legalId);

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

        } catch (error) {
            lead.status = LeadStatus.FAILED;
            lead.errorReason = error instanceof Error ? error.message : 'Unknown error';
            await this.leadRepository.save(lead);

        }

    }
}
