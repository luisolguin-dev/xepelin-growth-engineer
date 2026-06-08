import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Batch, BatchStatus } from './entities/batch.entity';
import { Lead, LeadStatus } from '../leads/entities/lead.entity';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { BATCH_QUEUE, BatchJobData } from './batches.constants';
import { Queue } from 'bullmq';
import { CreateBatchDto } from './dto/create-batch.dto';


@Injectable()
export class BatchesService {
    constructor(
        @InjectRepository(Batch)
        private batchRepository: Repository<Batch>,

        @InjectRepository(Lead)
        private leadRepository: Repository<Lead>,

        @InjectQueue(BATCH_QUEUE)
        private batchQueue: Queue<BatchJobData>
    ) {}

    async createBatch(createBatchDto: CreateBatchDto): Promise<Batch> {

        const batch = this.batchRepository.create({
            name: createBatchDto.name,
            segment: createBatchDto.segment, 
            ownerEmail: createBatchDto.ownerEmail,
            webhookUrl: createBatchDto.webhookUrl,
            totalLeads: createBatchDto.leads.length,
        })

        const savedBatch = await this.batchRepository.save(batch);

        const leads = createBatchDto.leads.map(leadDto => {
            return this.leadRepository.create({
                batchId: savedBatch.id,
                legalId: leadDto.legalId,
                legalName: leadDto.legalName,
                website: leadDto.website
            })
        })

        await this.leadRepository.save(leads);

        await this.batchQueue.add('process-batch', {batchId: savedBatch.id });

        return savedBatch;
    }

    async findAll(): Promise<Batch[]> {
        return await this.batchRepository.find({
            order: {createdAt: 'DESC'}
        });
    }

    async findOne(id: string): Promise<Batch> {
        const batch = await this.batchRepository.findOne({
            where: { id },
            relations: { leads: true }
        });

        if (!batch) {
            throw new NotFoundException(`Batch ${id} not found`);
        }

        return batch;
    }

    async retryFailed(id: string) {
        const batch = await this.batchRepository.findOne({
            where: { id },
            relations: { leads: true }
        });

        if (!batch) {
            throw new NotFoundException(`Batch ${id} not found`)
        }

        const failedLeads = batch.leads.filter(lead => lead.status === LeadStatus.FAILED || lead.status === LeadStatus.AI_FAILED);

        if (failedLeads.length === 0) {
            throw new BadRequestException('No failed leads to retry');
        }
        
        failedLeads.forEach(lead => {
            lead.status = LeadStatus.PENDING; 
            lead.errorReason = null; 
            lead.aiErrorReason = null;
        });

        batch.totalFailed = batch.totalFailed - failedLeads.length;
        batch.status = BatchStatus.PROCESSING;

        await this.batchRepository.save(batch);

        await this.leadRepository.save(failedLeads);

        await this.batchQueue.add('process-batch', { batchId: id });

        return batch;

    }
}