import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Course } from './entities/course.entity';
import { CourseSection } from './entities/course-section.entity';
import { Lesson } from './entities/lesson.entity';
import { Enrollment } from './entities/enrollment.entity';
import { CourseReview } from './entities/course-review.entity';
import { CreateCourseDto, UpdateCourseDto, PaginatedCoursesDto } from './dtos/course.dto';
import { CreateCourseSectionDto, UpdateCourseSectionDto } from './dtos/course-section.dto';
import { CreateLessonDto, UpdateLessonDto } from './dtos/lesson.dto';
import { CreateReviewDto, UpdateReviewDto } from './dtos/review.dto';
import { CourseStatus } from './course-status.enum';
import { RedisService } from '../redis/redis.service';

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private coursesRepository: Repository<Course>,
    @InjectRepository(CourseSection)
    private sectionsRepository: Repository<CourseSection>,
    @InjectRepository(Lesson)
    private lessonsRepository: Repository<Lesson>,
    @InjectRepository(Enrollment)
    private enrollmentsRepository: Repository<Enrollment>,
    @InjectRepository(CourseReview)
    private reviewsRepository: Repository<CourseReview>,
    private redisService: RedisService,
  ) {}

  // Course Management
  async createCourse(createCourseDto: CreateCourseDto, teacherId: string): Promise<Course> {
    const slug = slugify(createCourseDto.title);

    const existingCourse = await this.coursesRepository.findOne({ where: { slug } });
    if (existingCourse) {
      throw new BadRequestException('A course with this title already exists');
    }

    const course = this.coursesRepository.create({
      ...createCourseDto,
      slug,
      teacher_id: teacherId,
      status: CourseStatus.DRAFT,
    });

    return await this.coursesRepository.save(course);
  }

  async updateCourse(courseId: string, updateCourseDto: UpdateCourseDto, userId: string): Promise<Course> {
    const course = await this.coursesRepository.findOne({ where: { id: courseId } });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    if (course.teacher_id !== userId) {
      throw new ForbiddenException('You can only edit your own courses');
    }

    Object.assign(course, updateCourseDto);

    if (updateCourseDto.title) {
      course.slug = slugify(updateCourseDto.title);
    }

    await this.invalidateCourseCache(courseId);

    return await this.coursesRepository.save(course);
  }

  async getCourseBySlug(slug: string): Promise<Course> {
    const cacheKey = `course:${slug}`;
    const cached = await this.redisService.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    const course = await this.coursesRepository.findOne({
      where: { slug, status: CourseStatus.PUBLISHED },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    await this.redisService.set(cacheKey, JSON.stringify(course), 30 * 60);

    return course;
  }

  async listCourses(page: number = 1, limit: number = 10, sort: string = 'created_at'): Promise<PaginatedCoursesDto> {
    const cacheKey = `courses:list:page:${page}:limit:${limit}:sort:${sort}`;
    const cached = await this.redisService.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    const [courses, total] = await this.coursesRepository.findAndCount({
      where: { status: CourseStatus.PUBLISHED },
      order: { [sort]: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const result: PaginatedCoursesDto = {
      data: courses,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };

    await this.redisService.set(cacheKey, JSON.stringify(result), 10 * 60);

    return result;
  }

  async getMyEnrolledCourses(userId: string): Promise<Course[]> {
    const enrollments = await this.enrollmentsRepository.find({
      where: { user_id: userId },
    });

    const courseIds = enrollments.map(e => e.course_id);
    if (courseIds.length === 0) {
      return [];
    }

    return await this.coursesRepository.find({
      where: { id: In(courseIds) },
    });
  }

  // Course Sections
  async createSection(courseId: string, createSectionDto: CreateCourseSectionDto, userId: string): Promise<CourseSection> {
    const course = await this.coursesRepository.findOne({ where: { id: courseId } });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    if (course.teacher_id !== userId) {
      throw new ForbiddenException('You can only add sections to your own courses');
    }

    const section = this.sectionsRepository.create({
      course_id: courseId,
      ...createSectionDto,
    });

    await this.invalidateCourseCache(courseId);

    return await this.sectionsRepository.save(section);
  }

  async updateSection(sectionId: string, updateSectionDto: UpdateCourseSectionDto, userId: string): Promise<CourseSection> {
    const section = await this.sectionsRepository.findOne({ where: { id: sectionId } });

    if (!section) {
      throw new NotFoundException('Section not found');
    }

    const course = await this.coursesRepository.findOne({ where: { id: section.course_id } });
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    if (course.teacher_id !== userId) {
      throw new ForbiddenException('You can only edit sections in your own courses');
    }

    Object.assign(section, updateSectionDto);

    await this.invalidateCourseCache(section.course_id);

    return await this.sectionsRepository.save(section);
  }

  // Lessons
  async createLesson(sectionId: string, createLessonDto: CreateLessonDto, userId: string): Promise<Lesson> {
    const section = await this.sectionsRepository.findOne({ where: { id: sectionId } });

    if (!section) {
      throw new NotFoundException('Section not found');
    }

    const course = await this.coursesRepository.findOne({ where: { id: section.course_id } });
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    if (course.teacher_id !== userId) {
      throw new ForbiddenException('You can only add lessons to sections in your own courses');
    }

    const lesson = this.lessonsRepository.create({
      section_id: sectionId,
      ...createLessonDto,
    });

    await this.invalidateCourseCache(section.course_id);

    return await this.lessonsRepository.save(lesson);
  }

  async updateLesson(lessonId: string, updateLessonDto: UpdateLessonDto, userId: string): Promise<Lesson> {
    const lesson = await this.lessonsRepository.findOne({ where: { id: lessonId } });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    const section = await this.sectionsRepository.findOne({ where: { id: lesson.section_id } });
    if (!section) {
      throw new NotFoundException('Section not found');
    }

    const course = await this.coursesRepository.findOne({ where: { id: section.course_id } });
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    if (course.teacher_id !== userId) {
      throw new ForbiddenException('You can only edit lessons in your own courses');
    }

    Object.assign(lesson, updateLessonDto);

    await this.invalidateCourseCache(course.id);

    return await this.lessonsRepository.save(lesson);
  }

  async deleteLesson(lessonId: string, userId: string): Promise<void> {
    const lesson = await this.lessonsRepository.findOne({ where: { id: lessonId } });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    const section = await this.sectionsRepository.findOne({ where: { id: lesson.section_id } });
    if (!section) {
      throw new NotFoundException('Section not found');
    }

    const course = await this.coursesRepository.findOne({ where: { id: section.course_id } });
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    if (course.teacher_id !== userId) {
      throw new ForbiddenException('You can only delete lessons from your own courses');
    }

    await this.invalidateCourseCache(course.id);
    await this.lessonsRepository.remove(lesson);
  }

  async getLessonContent(courseId: string, lessonId: string, userId: string): Promise<Lesson> {
    const lesson = await this.lessonsRepository.findOne({ where: { id: lessonId } });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    const section = await this.sectionsRepository.findOne({ where: { id: lesson.section_id } });
    if (!section) {
      throw new NotFoundException('Section not found');
    }

    if (section.course_id !== courseId) {
      throw new NotFoundException('Lesson not found');
    }

    const course = await this.coursesRepository.findOne({ where: { id: courseId } });
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    const enrollment = await this.enrollmentsRepository.findOne({
      where: { course_id: courseId, user_id: userId },
    });

    if (!enrollment && course.teacher_id !== userId) {
      throw new ForbiddenException('You must be enrolled in this course to access this lesson');
    }

    return lesson;
  }

  // Reviews
  async addReview(courseId: string, createReviewDto: CreateReviewDto, userId: string): Promise<CourseReview> {
    const enrollment = await this.enrollmentsRepository.findOne({
      where: { course_id: courseId, user_id: userId },
    });

    if (!enrollment) {
      throw new ForbiddenException('You must be enrolled in this course to add a review');
    }

    const existingReview = await this.reviewsRepository.findOne({
      where: { course_id: courseId, user_id: userId },
    });

    if (existingReview) {
      throw new BadRequestException('You have already reviewed this course');
    }

    const review = this.reviewsRepository.create({
      course_id: courseId,
      user_id: userId,
      ...createReviewDto,
    });

    await this.invalidateCourseCache(courseId);

    return await this.reviewsRepository.save(review);
  }

  async updateReview(reviewId: string, updateReviewDto: UpdateReviewDto, userId: string): Promise<CourseReview> {
    const review = await this.reviewsRepository.findOne({ where: { id: reviewId } });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (review.user_id !== userId) {
      throw new ForbiddenException('You can only edit your own reviews');
    }

    Object.assign(review, updateReviewDto);

    await this.invalidateCourseCache(review.course_id);

    return await this.reviewsRepository.save(review);
  }

  async getCourseReviews(courseId: string): Promise<CourseReview[]> {
    return await this.reviewsRepository.find({
      where: { course_id: courseId },
      order: { created_at: 'DESC' },
    });
  }

  // Enrollment Management
  async enrollInCourse(courseId: string, userId: string): Promise<Enrollment> {
    const course = await this.coursesRepository.findOne({ where: { id: courseId } });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    const existingEnrollment = await this.enrollmentsRepository.findOne({
      where: { course_id: courseId, user_id: userId },
    });

    if (existingEnrollment) {
      throw new BadRequestException('You are already enrolled in this course');
    }

    const enrollment = this.enrollmentsRepository.create({
      course_id: courseId,
      user_id: userId,
    });

    return await this.enrollmentsRepository.save(enrollment);
  }

  // Cache Invalidation
  private async invalidateCourseCache(courseId: string): Promise<void> {
    const course = await this.coursesRepository.findOne({ where: { id: courseId } });
    if (course) {
      await this.redisService.delete(`course:${course.slug}`);
    }
    await this.redisService.deletePattern('courses:list:*');
  }
}
