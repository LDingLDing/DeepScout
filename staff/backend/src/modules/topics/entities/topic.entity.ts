import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('topic')
export class Topic {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  desc: string;

  @Column({ name: 'tagids', nullable: true })
  tagIds: string;
}
