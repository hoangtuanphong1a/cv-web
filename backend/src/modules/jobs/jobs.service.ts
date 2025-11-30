import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Repository, ILike, In, Brackets } from 'typeorm';
import { Job, JobStatus } from '../common/entities/job.entity';
import { Company } from '../common/entities/company.entity';
import { User } from '../common/entities/user.entity';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { Skill } from '../common/entities/skill.entity';
import { JobTag } from '../common/entities/job-tag.entity';
import { JobCategory } from '../common/entities/job-category.entity';

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(Job)
    private jobRepository: Repository<Job>,
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Skill)
    private skillRepository: Repository<Skill>,
    @InjectRepository(JobTag)
    private jobTagRepository: Repository<JobTag>,
    @InjectRepository(JobCategory)
    private jobCategoryRepository: Repository<JobCategory>,
  ) {}

  async create(createJobDto: CreateJobDto, userId: string): Promise<Job> {
    const { companyId, skillIds, tagIds, expiresAt, categoryId, ...jobData } =
      createJobDto;

    // Verify company exists and user has access
    const company = await this.companyRepository.findOne({
      where: { id: companyId },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    // Check if user owns the company or is an employer of the company
    if (company.ownerId !== userId) {
      throw new ForbiddenException(
        'You can only create jobs for your own companies',
      );
    }

    // Verify category exists if provided
    let category: JobCategory | undefined = undefined;
    if (categoryId) {
      const foundCategory = await this.jobCategoryRepository.findOne({
        where: { id: categoryId },
      });
      if (!foundCategory) {
        throw new NotFoundException('Job category not found');
      }
      category = foundCategory;
    }

    // Create job
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const job = this.jobRepository.create({
      ...jobData,
      companyId,
      company,
      postedById: userId,
      postedBy: user,
      categoryId,
      category,
      status: JobStatus.PUBLISHED, // Set status to PUBLISHED by default
      publishedAt: new Date(), // Set published date
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
    });

    // Save job first to get the ID
    const savedJob = await this.jobRepository.save(job);

    // Handle skills relationships
    if (skillIds && skillIds.length > 0) {
      const skills = await this.skillRepository.find({
        where: { id: In(skillIds) },
      });
      savedJob.skills = skills;
      await this.jobRepository.save(savedJob);
    }

    // Handle tags relationships
    if (tagIds && tagIds.length > 0) {
      const tags = await this.jobTagRepository.find({
        where: { id: In(tagIds) },
      });
      savedJob.tags = tags;
      await this.jobRepository.save(savedJob);
    }

    // Return the job without incrementing view count for newly created jobs
    const createdJob = await this.jobRepository.findOne({
      where: { id: savedJob.id },
      relations: ['company', 'postedBy', 'category', 'skills', 'tags'],
    });

    if (!createdJob) {
      throw new NotFoundException('Job not found after creation');
    }

    return createdJob;
  }

  async findAll(
    query: Record<string, any>,
    userId?: string,
  ): Promise<{
    data: Job[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const {
      page = 1,
      limit = 10,
      search,
      jobType,
      experienceLevel,
      city,
      country,
      remoteWork,
      skills,
      tags,
      minSalary,
      maxSalary,
      companyId,
      status = JobStatus.PUBLISHED,
    } = query;

    const skip = (page - 1) * limit;

    // Create query builder first
    const queryBuilder = this.jobRepository
      .createQueryBuilder('job')
      .leftJoinAndSelect('job.company', 'company')
      .leftJoinAndSelect('job.postedBy', 'postedBy')
      .leftJoinAndSelect('job.category', 'category')
      .leftJoinAndSelect('job.skills', 'skill')
      .leftJoinAndSelect('job.tags', 'tag');

    // Apply where conditions based on authentication status
    if (userId) {
      // Get user's companies
      const userCompanies = await this.companyRepository.find({
        where: { ownerId: userId },
      });
      const companyIds = userCompanies.map((company) => company.id);

      if (companyIds.length > 0) {
        // For authenticated users, show published jobs OR draft jobs from their companies
        queryBuilder.where(
          new Brackets((qb) => {
            qb.where('job.status = :publishedStatus', {
              publishedStatus: JobStatus.PUBLISHED,
            }).orWhere(
              'job.status = :draftStatus AND job.company_id IN (:...companyIds)',
              {
                draftStatus: JobStatus.DRAFT,
                companyIds: companyIds,
              },
            );
          }),
        );
      } else {
        // No companies, show only published jobs
        queryBuilder.where('job.status = :publishedStatus', {
          publishedStatus: JobStatus.PUBLISHED,
        });
      }
    } else {
      // Anonymous user, show only published jobs
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      queryBuilder.where('job.status = :status', { status });
    }

    // Add search filter
    if (search) {
      queryBuilder.andWhere('job.title ILIKE :search', {
        search: `%${search}%`,
      });
    }

    // Add filters
    if (jobType) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      queryBuilder.andWhere('job.jobType = :jobType', { jobType });
    }
    if (experienceLevel) {
      queryBuilder.andWhere('job.experienceLevel = :experienceLevel', {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        experienceLevel,
      });
    }
    if (city) {
      queryBuilder.andWhere('job.city ILIKE :city', { city: `%${city}%` });
    }
    if (country) {
      queryBuilder.andWhere('job.country ILIKE :country', {
        country: `%${country}%`,
      });
    }
    if (remoteWork !== undefined) {
      queryBuilder.andWhere('job.remoteWork = :remoteWork', {
        remoteWork: remoteWork === 'true',
      });
    }
    if (companyId) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      queryBuilder.andWhere('job.companyId = :companyId', { companyId });
    }

    // Salary filters
    if (minSalary) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      queryBuilder.andWhere('job.minSalary >= :minSalary', { minSalary });
    }
    if (maxSalary) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      queryBuilder.andWhere('job.maxSalary <= :maxSalary', { maxSalary });
    }

    // Skills filter
    if (skills) {
      const skillsArray = Array.isArray(skills) ? skills : [skills];
      queryBuilder.andWhere('skill.name IN (:...skillNames)', {
        skillNames: skillsArray,
      });
    }

    // Tags filter
    if (tags) {
      const tagsArray = Array.isArray(tags) ? tags : [tags];
      queryBuilder.andWhere('tag.name IN (:...tagNames)', {
        tagNames: tagsArray,
      });
    }

    const [jobs, total] = await queryBuilder
      .skip(skip)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      .take(limit)
      .orderBy('job.createdAt', 'DESC')
      .getManyAndCount();

    return {
      data: jobs,
      total,
      page: +page,
      limit: +limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Job> {
    const job = await this.jobRepository.findOne({
      where: { id },
      relations: ['company', 'postedBy', 'category', 'skills', 'tags'],
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    // Increment view count
    await this.incrementViewCount(id);

    return job;
  }

  async update(
    id: string,
    updateJobDto: UpdateJobDto,
    userId: string,
  ): Promise<Job> {
    const job = await this.findOne(id);

    // Check if user owns the company that posted this job
    if (job.company.ownerId !== userId) {
      throw new ForbiddenException(
        'You can only update jobs from your own companies',
      );
    }

    const { expiresAt, ...updateData } = updateJobDto;

    // Update job
    await this.jobRepository.update(id, {
      ...updateData,
      expiresAt: expiresAt ? new Date(expiresAt) : job.expiresAt,
    });

    return this.findOne(id);
  }

  async remove(id: string, userId: string): Promise<void> {
    const job = await this.findOne(id);

    // Check if user owns the company that posted this job
    if (job.company.ownerId !== userId) {
      throw new ForbiddenException(
        'You can only delete jobs from your own companies',
      );
    }

    await this.jobRepository.remove(job);
  }

  async publishJob(id: string, userId: string): Promise<Job> {
    const job = await this.findOne(id);

    if (job.company.ownerId !== userId) {
      throw new ForbiddenException(
        'You can only publish jobs from your own companies',
      );
    }

    if (job.status !== JobStatus.DRAFT) {
      throw new BadRequestException('Only draft jobs can be published');
    }

    await this.jobRepository.update(id, {
      status: JobStatus.PUBLISHED,
      publishedAt: new Date(),
    });

    return this.findOne(id);
  }

  async closeJob(id: string, userId: string): Promise<Job> {
    const job = await this.findOne(id);

    if (job.company.ownerId !== userId) {
      throw new ForbiddenException(
        'You can only close jobs from your own companies',
      );
    }

    await this.jobRepository.update(id, {
      status: JobStatus.CLOSED,
    });

    return this.findOne(id);
  }

  async findByCompany(companyId: string): Promise<Job[]> {
    return this.jobRepository.find({
      where: { companyId },
      relations: ['company', 'postedBy', 'category'],
      order: { createdAt: 'DESC' },
    });
  }

  async incrementViewCount(id: string): Promise<void> {
    await this.jobRepository.increment({ id }, 'viewCount', 1);
  }

  async getJobStats(userId: string): Promise<{
    totalJobs: number;
    publishedJobs: number;
    draftJobs: number;
    totalViews: number;
    totalApplications: number;
  }> {
    const userCompanies = await this.companyRepository.find({
      where: { ownerId: userId },
    });

    const companyIds = userCompanies.map((company) => company.id);

    if (companyIds.length === 0) {
      return {
        totalJobs: 0,
        publishedJobs: 0,
        draftJobs: 0,
        totalViews: 0,
        totalApplications: 0,
      };
    }

    const jobs = await this.jobRepository.find({
      where: { companyId: In(companyIds) },
    });

    const totalJobs = jobs.length;
    const publishedJobs = jobs.filter(
      (job) => job.status === JobStatus.PUBLISHED,
    ).length;
    const draftJobs = jobs.filter(
      (job) => job.status === JobStatus.DRAFT,
    ).length;
    const totalViews = jobs.reduce((sum, job) => sum + job.viewCount, 0);
    const totalApplications = jobs.reduce(
      (sum, job) => sum + job.applicationCount,
      0,
    );

    return {
      totalJobs,
      publishedJobs,
      draftJobs,
      totalViews,
      totalApplications,
    };
  }
}
