import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('topic_tag')
export class TopicTag {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;
}
