import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Application,
  ApplicationStatus,
} from '../common/entities/application.entity';
import { Job } from '../common/entities/job.entity';
import { User } from '../common/entities/user.entity';
import { JobSeekerProfile } from '../common/entities/job-seeker-profile.entity';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../common/entities/notification.entity';

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(Application)
    private applicationRepository: Repository<Application>,
    @InjectRepository(Job)
    private jobRepository: Repository<Job>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private notificationsService: NotificationsService,
  ) {}

  async create(
    createApplicationDto: CreateApplicationDto,
    userId: string,
  ): Promise<Application> {
    const { jobId, ...applicationData } = createApplicationDto;

    // Verify job exists and is published
    const job = await this.jobRepository.findOne({
      where: { id: jobId },
      relations: ['company'],
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    if (!job.isActive) {
      throw new BadRequestException('Job is not available for applications');
    }

    // Get job seeker profile for the user
    const jobSeekerProfile = await this.userRepository
      .findOne({
        where: { id: userId },
        relations: ['jobSeekerProfiles'],
      })
      .then((user) => user?.jobSeekerProfiles?.[0]);

    if (!jobSeekerProfile) {
      throw new NotFoundException(
        'Job seeker profile not found. Please complete your profile first.',
      );
    }

    // Check if user already applied for this job
    const existingApplication = await this.applicationRepository.findOne({
      where: { jobId, jobSeekerProfileId: jobSeekerProfile.id },
    });

    if (existingApplication) {
      throw new ConflictException('You have already applied for this job');
    }

    // Create application
    const application = this.applicationRepository.create({
      ...applicationData,
      jobId,
      job,
      jobSeekerProfileId: jobSeekerProfile.id,
      jobSeekerProfile,
    });

    const savedApplication = await this.applicationRepository.save(application);

    // Increment application count for the job
    await this.jobRepository.increment({ id: jobId }, 'applicationCount', 1);

    // Send notification to HR about new application
    try {
      await this.notificationsService.create(
        job.company.ownerId,
        NotificationType.APPLICATION_RECEIVED,
        'Đơn ứng tuyển mới',
        `${jobSeekerProfile.fullName || 'Ứng viên'} đã ứng tuyển vị trí ${job.title} tại công ty ${job.company.name}`,
        {
          relatedEntityId: savedApplication.id,
          relatedEntityType: 'application',
          priority: 3,
        },
      );
    } catch (error) {
      console.error('Failed to send notification for new application:', error);
      // Don't fail the application creation if notification fails
    }

    return savedApplication;
  }

  async findAll(query: any): Promise<{
    data: Application[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const {
      page = 1,
      limit = 10,
      status,
      jobId,
      jobSeekerProfileId,
      reviewedById,
    } = query;

    const skip = (page - 1) * limit;
    const where: any = {};

    // Add filters
    if (status) where.status = status;
    if (jobId) where.jobId = jobId;
    if (jobSeekerProfileId) where.jobSeekerProfileId = jobSeekerProfileId;
    if (reviewedById) where.reviewedById = reviewedById;

    const [applications, total] = await this.applicationRepository.findAndCount(
      {
        where,
        relations: ['job', 'jobSeekerProfile', 'reviewedBy', 'job.company'],
        skip,
        take: limit,
        order: { createdAt: 'DESC' },
      },
    );

    return {
      data: applications,
      total,
      page: +page,
      limit: +limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Application> {
    const application = await this.applicationRepository.findOne({
      where: { id },
      relations: ['job', 'jobSeekerProfile', 'reviewedBy', 'job.company'],
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    return application;
  }

  async update(
    id: string,
    updateApplicationDto: UpdateApplicationDto,
    userId: string,
  ): Promise<Application> {
    const application = await this.findOne(id);

    // Check if user owns this application or is an employer for the job
    if (
      application.jobSeekerProfile.userId !== userId &&
      application.job.company.ownerId !== userId
    ) {
      throw new ForbiddenException('You can only update your own applications');
    }

    await this.applicationRepository.update(id, updateApplicationDto);
    return this.findOne(id);
  }

  async remove(id: string, userId: string): Promise<void> {
    const application = await this.findOne(id);

    // Check if user owns this application
    if (application.jobSeekerProfile.userId !== userId) {
      throw new ForbiddenException('You can only delete your own applications');
    }

    // Check if application can be withdrawn (not accepted/rejected)
    if (
      application.status === ApplicationStatus.ACCEPTED ||
      application.status === ApplicationStatus.REJECTED
    ) {
      throw new BadRequestException(
        'Cannot withdraw accepted or rejected applications',
      );
    }

    await this.applicationRepository.remove(application);

    // Decrement application count for the job
    await this.jobRepository.decrement(
      { id: application.jobId },
      'applicationCount',
      1,
    );
  }

  async updateStatus(
    id: string,
    status: ApplicationStatus,
    userId: string,
    notes?: string,
  ): Promise<Application> {
    const application = await this.findOne(id);

    // Check if user is the employer for this job
    if (application.job.company.ownerId !== userId) {
      throw new ForbiddenException(
        'Only the job employer can update application status',
      );
    }

    // Validate status transitions
    if (
      status === ApplicationStatus.ACCEPTED &&
      application.status !== ApplicationStatus.SHORTLISTED
    ) {
      throw new BadRequestException('Can only accept shortlisted applications');
    }

    const updateData: any = {
      status,
      reviewedAt: new Date(),
      reviewedById: userId,
    };

    if (notes) {
      updateData.notes = notes;
    }

    await this.applicationRepository.update(id, updateData);
    return this.findOne(id);
  }

  async scheduleInterview(
    id: string,
    interviewDate: Date,
    notes: string,
    userId: string,
  ): Promise<Application> {
    const application = await this.findOne(id);

    // Check if user is the employer for this job
    if (application.job.company.ownerId !== userId) {
      throw new ForbiddenException(
        'Only the job employer can schedule interviews',
      );
    }

    // Check if application is in appropriate status
    if (application.status !== ApplicationStatus.SHORTLISTED) {
      throw new BadRequestException(
        'Can only schedule interviews for shortlisted applications',
      );
    }

    await this.applicationRepository.update(id, {
      status: ApplicationStatus.INTERVIEWED,
      interviewScheduledAt: interviewDate,
      interviewNotes: notes,
      reviewedAt: new Date(),
      reviewedById: userId,
    });

    return this.findOne(id);
  }

  async findByJob(jobId: string, userId?: string): Promise<Application[]> {
    const where: any = { jobId };

    // If userId provided, check if user is the employer
    if (userId) {
      const job = await this.jobRepository.findOne({ where: { id: jobId } });
      if (job?.company.ownerId === userId) {
        // Employer can see all applications
      } else {
        // Regular users can only see their own applications - need to find jobSeekerProfile for userId
        const jobSeekerProfile = await this.userRepository
          .findOne({
            where: { id: userId },
            relations: ['jobSeekerProfiles'],
          })
          .then((user) => user?.jobSeekerProfiles?.[0]);

        if (jobSeekerProfile) {
          where.jobSeekerProfileId = jobSeekerProfile.id;
        }
      }
    }

    return this.applicationRepository.find({
      where,
      relations: ['jobSeekerProfile', 'reviewedBy'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByApplicant(userId: string): Promise<Application[]> {
    // Find job seeker profile for the user
    const jobSeekerProfile = await this.userRepository
      .findOne({
        where: { id: userId },
        relations: ['jobSeekerProfiles'],
      })
      .then((user) => user?.jobSeekerProfiles?.[0]);

    if (!jobSeekerProfile) {
      return [];
    }

    return this.applicationRepository.find({
      where: { jobSeekerProfileId: jobSeekerProfile.id },
      relations: ['job', 'job.company', 'reviewedBy'],
      order: { createdAt: 'DESC' },
    });
  }

  async getApplicationStats(userId: string): Promise<{
    totalApplications: number;
    pendingApplications: number;
    reviewedApplications: number;
    acceptedApplications: number;
    rejectedApplications: number;
  }> {
    // Find job seeker profile for the user
    const jobSeekerProfile = await this.userRepository
      .findOne({
        where: { id: userId },
        relations: ['jobSeekerProfiles'],
      })
      .then((user) => user?.jobSeekerProfiles?.[0]);

    if (!jobSeekerProfile) {
      return {
        totalApplications: 0,
        pendingApplications: 0,
        reviewedApplications: 0,
        acceptedApplications: 0,
        rejectedApplications: 0,
      };
    }

    const applications = await this.applicationRepository.find({
      where: { jobSeekerProfileId: jobSeekerProfile.id },
    });

    return {
      totalApplications: applications.length,
      pendingApplications: applications.filter(
        (app) => app.status === ApplicationStatus.PENDING,
      ).length,
      reviewedApplications: applications.filter((app) =>
        [
          ApplicationStatus.REVIEWING,
          ApplicationStatus.SHORTLISTED,
          ApplicationStatus.INTERVIEWED,
        ].includes(app.status),
      ).length,
      acceptedApplications: applications.filter(
        (app) => app.status === ApplicationStatus.ACCEPTED,
      ).length,
      rejectedApplications: applications.filter(
        (app) => app.status === ApplicationStatus.REJECTED,
      ).length,
    };
  }

  async incrementViewCount(id: string, userId: string): Promise<void> {
    const application = await this.findOne(id);

    // Only employer can increment view count
    if (application.job.company.ownerId !== userId) {
      return;
    }

    await this.applicationRepository.increment({ id }, 'viewCount', 1);
  }
}
