import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
  CreateDateColumn,
} from 'typeorm';
import { CourseSection } from './course-section.entity';
import { ContentType } from '../content-type.enum';

@Entity('lessons')
@Index(['section_id'])
export class Lesson {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  section_id: string;

  @ManyToOne(() => CourseSection, (section) => section.lessons, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'section_id' })
  section: CourseSection;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'int' })
  order: number;

  @Column({
    type: 'enum',
    enum: ContentType,
    default: ContentType.VIDEO,
  })
  content_type: ContentType;

  @Column({ type: 'varchar' })
  quality_720_url: string;

  @Column({ type: 'varchar', nullable: true })
  quality_1080_url: string | null;

  @Column({ type: 'varchar', nullable: true })
  quality_480_url: string | null;

  @Column({ type: 'int', nullable: true })
  duration_seconds: number | null;

  @Column({ type: 'boolean', default: false })
  is_free_preview: boolean;

  @Column({ type: 'boolean', default: false })
  allow_download: boolean;

  @CreateDateColumn()
  created_at: Date;
}
