import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { CoursesService } from './courses.service';
import {
  CreateCourseDto,
  UpdateCourseDto,
  PaginatedCoursesDto,
} from './dtos/course.dto';
import { CreateCourseSectionDto } from './dtos/course-section.dto';
import { CreateLessonDto, UpdateLessonDto } from './dtos/lesson.dto';
import { CreateReviewDto, UpdateReviewDto } from './dtos/review.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequireRoles } from '../auth/decorators/require-roles.decorator';
import { Role } from '../users/role.enum';

@ApiTags('Courses')
@Controller('api/v1/courses')
export class CoursesController {
  constructor(private coursesService: CoursesService) {}

  // ========== PUBLIC ENDPOINTS ==========

  @Get()
  @ApiOperation({ summary: 'Get list of published courses with pagination' })
  @ApiQuery({ name: 'page', type: Number, required: false, example: 1 })
  @ApiQuery({ name: 'limit', type: Number, required: false, example: 10 })
  @ApiQuery({
    name: 'sort',
    type: String,
    required: false,
    example: 'created_at',
  })
  async listCourses(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('sort') sort: string = 'created_at',
  ): Promise<PaginatedCoursesDto> {
    return await this.coursesService.listCourses(page, limit, sort);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get course details by slug' })
  async getCourseBySlug(@Param('slug') slug: string) {
    return await this.coursesService.getCourseBySlug(slug);
  }

  @Get(':id/reviews')
  @ApiOperation({ summary: 'Get reviews for a course' })
  async getCourseReviews(@Param('id') courseId: string) {
    return await this.coursesService.getCourseReviews(courseId);
  }

  // ========== TEACHER ENDPOINTS ==========

  @Post()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @RequireRoles(Role.TEACHER, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new course (Teacher only)' })
  async createCourse(
    @Body() createCourseDto: CreateCourseDto,
    @CurrentUser() user: { userId: string; role: string },
  ) {
    return await this.coursesService.createCourse(createCourseDto, user.userId);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @RequireRoles(Role.TEACHER, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a course (Teacher only)' })
  async updateCourse(
    @Param('id') courseId: string,
    @Body() updateCourseDto: UpdateCourseDto,
    @CurrentUser() user: { userId: string; role: string },
  ) {
    return await this.coursesService.updateCourse(
      courseId,
      updateCourseDto,
      user.userId,
    );
  }

  @Post(':id/sections')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @RequireRoles(Role.TEACHER, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a section to a course (Teacher only)' })
  async createSection(
    @Param('id') courseId: string,
    @Body() createSectionDto: CreateCourseSectionDto,
    @CurrentUser() user: { userId: string; role: string },
  ) {
    return await this.coursesService.createSection(
      courseId,
      createSectionDto,
      user.userId,
    );
  }

  @Post('sections/:sectionId/lessons')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @RequireRoles(Role.TEACHER, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a lesson to a section (Teacher only)' })
  async createLesson(
    @Param('sectionId') sectionId: string,
    @Body() createLessonDto: CreateLessonDto,
    @CurrentUser() user: { userId: string; role: string },
  ) {
    return await this.coursesService.createLesson(
      sectionId,
      createLessonDto,
      user.userId,
    );
  }

  @Put('lessons/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @RequireRoles(Role.TEACHER, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update a lesson and its manual video URLs (Teacher only)',
  })
  async updateLesson(
    @Param('id') lessonId: string,
    @Body() updateLessonDto: UpdateLessonDto,
    @CurrentUser() user: { userId: string; role: string },
  ) {
    return await this.coursesService.updateLesson(
      lessonId,
      updateLessonDto,
      user.userId,
    );
  }

  @Delete('lessons/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @RequireRoles(Role.TEACHER, Role.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a lesson (Teacher only)' })
  async deleteLesson(
    @Param('id') lessonId: string,
    @CurrentUser() user: { userId: string; role: string },
  ): Promise<void> {
    return await this.coursesService.deleteLesson(lessonId, user.userId);
  }

  // ========== STUDENT ENDPOINTS ==========

  @Get('my/enrolled')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get user's enrolled courses" })
  async getMyEnrolledCourses(
    @CurrentUser() user: { userId: string; role: string },
  ) {
    return await this.coursesService.getMyEnrolledCourses(user.userId);
  }

  @Get(':courseId/lessons/:lessonId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get lesson content (enrolled students only)' })
  async getLessonContent(
    @Param('courseId') courseId: string,
    @Param('lessonId') lessonId: string,
    @CurrentUser() user: { userId: string; role: string },
  ) {
    return await this.coursesService.getLessonContent(
      courseId,
      lessonId,
      user.userId,
    );
  }

  @Get(':courseId/lessons/:lessonId/media')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get playable lesson media sources for the video player',
  })
  async getLessonMedia(
    @Param('courseId') courseId: string,
    @Param('lessonId') lessonId: string,
    @CurrentUser() user: { userId: string; role: string },
  ) {
    return await this.coursesService.getLessonMedia(
      courseId,
      lessonId,
      user.userId,
    );
  }

  @Get(':courseId/lessons/:lessonId/download/options')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get downloadable quality options for a lesson' })
  async getLessonDownloadOptions(
    @Param('courseId') courseId: string,
    @Param('lessonId') lessonId: string,
    @CurrentUser() user: { userId: string; role: string },
  ) {
    return await this.coursesService.getLessonDownloadOptions(
      courseId,
      lessonId,
      user.userId,
    );
  }

  @Post(':id/reviews')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a review to a course (Student only)' })
  async addReview(
    @Param('id') courseId: string,
    @Body() createReviewDto: CreateReviewDto,
    @CurrentUser() user: { userId: string; role: string },
  ) {
    return await this.coursesService.addReview(
      courseId,
      createReviewDto,
      user.userId,
    );
  }

  @Put('reviews/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a review' })
  async updateReview(
    @Param('id') reviewId: string,
    @Body() updateReviewDto: UpdateReviewDto,
    @CurrentUser() user: { userId: string; role: string },
  ) {
    return await this.coursesService.updateReview(
      reviewId,
      updateReviewDto,
      user.userId,
    );
  }

  @Post(':id/enroll')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Enroll in a course' })
  async enrollCourse(
    @Param('id') courseId: string,
    @CurrentUser() user: { userId: string; role: string },
  ) {
    return await this.coursesService.enrollInCourse(courseId, user.userId);
  }
}
