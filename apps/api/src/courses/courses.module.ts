import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from './entities/course.entity';
import { CourseSection } from './entities/course-section.entity';
import { Lesson } from './entities/lesson.entity';
import { Enrollment } from './entities/enrollment.entity';
import { CourseReview } from './entities/course-review.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Course,
      CourseSection,
      Lesson,
      Enrollment,
      CourseReview,
    ]),
  ],
  exports: [TypeOrmModule],
})
export class CoursesModule {}
