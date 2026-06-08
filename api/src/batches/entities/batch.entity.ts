import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { User } from "../../users/entities/user.entity";
import { Lead } from "../../leads/entities/lead.entity";

export enum BatchStatus {
    PENDING = 'pending',
    PROCESSING = 'processing', 
    COMPLETED = 'completed',
    FAILED = 'failed',
}


@Entity('batches')
export class Batch {
    @PrimaryGeneratedColumn('uuid')
    id!: string; 

    @Column()
    name!:string; 

    @Column()
    segment!:string; 

    @Column()
    ownerEmail!:string; 

    @Column()
    webhookUrl!:string; 

    @Column({
        type: 'enum',
        enum: BatchStatus,
        default: BatchStatus.PENDING
    })
    status!: BatchStatus;
    
    @OneToMany(() => Lead, (lead) => lead.batch)
    leads!: Lead[]

    @Column({
        default: 0
    })
    totalLeads!:number;

    @Column({ default: 0 })
    totalReady!:number; 

    @Column({ default: 0 })
    totalFailed!:number;

    @Column({ type: 'timestamp', nullable: true })
    processingStartedAt!: Date | null; 

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'userId' })
    user!: User | null; 

    @Column({ nullable: true })
    userId!:string | null; 

    @CreateDateColumn()
    createdAt!: Date; 

    @UpdateDateColumn()
    updatedAt!: Date; 

}
