import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ScriptFile } from './script-file.entity';

@Entity('script_task')
export class ScriptTask {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'script_id' })
  scriptId: number;

  @Column()
  status: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => ScriptFile)
  @JoinColumn({ name: 'script_id' })
  script: ScriptFile;
}
