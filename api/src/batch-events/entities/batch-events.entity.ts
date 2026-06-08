import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Batch } from "../../batches/entities/batch.entity";

export interface WebhookPayLoad {
    batchId: string; 
    name: string; 
    summary: {
        total: number; 
        ready: number; 
        failed: number;
    };
    link_to_detail: string; 
}


@Entity('batch_events')
export class BatchEvent {

    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => Batch)
    @JoinColumn({ name: 'batchId'})
    batch!: Batch

    @Column()
    batchId!: string;

    @Column({ type: 'jsonb'})
    payload!: WebhookPayLoad;

    @Column({type: 'int' })
    statusCode!: number;

    @Column({type: 'int'})
    attemptNumber!: number; 

    @CreateDateColumn()
    createdAt!: Date; 
}