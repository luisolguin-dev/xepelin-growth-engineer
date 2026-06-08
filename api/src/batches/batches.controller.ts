import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { BatchesService } from './batches.service';
import { CreateBatchDto } from './dto/create-batch.dto';

@Controller('batches')
export class BatchesController {
    constructor(private readonly batchesService: BatchesService){}

    @Post()
    @HttpCode(HttpStatus.ACCEPTED)
    create(@Body() createBatchDto: CreateBatchDto) {
        return this.batchesService.createBatch(createBatchDto)
    }

    @Get()
    findAll() {
        return this.batchesService.findAll()
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.batchesService.findOne(id);
    }

    @Post(':id/retry-failed')
    retryFailed(@Param('id') id:string) {
        return this.batchesService.retryFailed(id);
    }
    


}
