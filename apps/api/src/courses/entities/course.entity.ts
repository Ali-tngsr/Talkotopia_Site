import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { CourseStatus } from '../course-status.enum';

@Entity('courses')
@Index(['slug'], { unique: true })
@Index(['teacher_id'])
@Index(['status'])
export class Course {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  slug: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'uuid' })
  teacher_id: string;

  @ManyToOne(() => User, { lazy: true })
  @JoinColumn({ name: 'teacher_id' })
  teacher: Promise<User>;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  discount_price: number | null;

  @Column({ type: 'varchar', nullable: true })
  thumbnail: string | null;

  @Column({
    type: 'enum',
    enum: CourseStatus,
    default: CourseStatus.DRAFT,
  })
  status: CourseStatus;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => CourseSection, section => section.course, { lazy: true })
  sections: Promise<CourseSection[]>;

  @OneToMany(() => Enrollment, enrollment => enrollment.course, {
    lazy: true,
  })
  enrollments: Promise<Enrollment[]>;

  @OneToMany(() => CourseReview, review => review.course, { lazy: true })
  reviews: Promise<CourseReview[]>;
}

import { CourseSection } from './course-section.entity';
import { Enrollment } from './enrollment.entity';
import { CourseReview } from './course-review.entity';
