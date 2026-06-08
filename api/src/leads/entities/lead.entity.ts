import { Column, Entity, ManyToOne, JoinColumn, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Batch } from "../../batches/entities/batch.entity";


export enum LeadStatus {
    PENDING = 'pending',
    PROCESSING ='processing', 
    READY = 'ready',
    FAILED = 'failed', 
    AI_ENRICHING = 'ai_enriching',
    AI_READY = 'ai_ready',
    AI_FAILED = 'ai_failed'
};

@Entity('leads')
export class Lead {
    @PrimaryGeneratedColumn('uuid')
    id!: string

    @Column()
    legalId!: string; 

    @Column()
    legalName!: string; 

    @Column()
    website!: string; 

    @ManyToOne(() => Batch)
    @JoinColumn({ name: 'batchId' })
    batch!: Batch;

    @Column()
    batchId!: string; 

    @Column({ type: 'enum', enum: LeadStatus, default: LeadStatus.PENDING })
    status!: LeadStatus

    @Column({ type: 'varchar', nullable: true })
    errorReason!: string | null;

    @Column({ type: 'varchar', nullable: true })
    normalizedLegalName!: string | null; 

    @Column({type: 'varchar', nullable: true })
    mainDomain!: string | null; 

    @Column({ type: 'boolean', nullable: true })
    isWebsiteAlive!: boolean | null; 

    @Column({ type: 'int', nullable: true })
    prospectFitScore!: number | null; 

    @Column({type: 'varchar', nullable: true })
    iceBreaker!: string | null; 

    @Column({type: 'varchar', nullable: true })
    painHypothesis!: string | null; 

    @Column({type: 'varchar', nullable: true })
    aiErrorReason!: string | null; 

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;



}