import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('topic_tag')
export class TopicTag {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;
}
