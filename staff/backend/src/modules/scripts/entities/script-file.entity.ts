import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('script_file')
export class ScriptFile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'file_name' })
  fileName: string;

  @Column({ type: 'text' })
  content: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
