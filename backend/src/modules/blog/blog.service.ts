import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Blog, BlogStatus } from '../common/entities/blog.entity';
import { User } from '../common/entities/user.entity';

@Injectable()
export class BlogService {
  constructor(
    @InjectRepository(Blog)
    private blogRepository: Repository<Blog>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createBlogDto: any, authorId: string): Promise<any> {
    const author = await this.userRepository.findOne({
      where: { id: authorId },
    });
    if (!author) {
      throw new NotFoundException('Author not found');
    }

    const slug = this.generateSlug(createBlogDto.title);
    const blog = this.blogRepository.create({
      ...createBlogDto,
      slug,
      authorId,
      status: BlogStatus.DRAFT,
    });

    const savedBlog = await this.blogRepository.save(blog);
    return savedBlog;
  }

  async findAll(query: any = {}): Promise<{
    data: any[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { page = 1, limit = 10, status = BlogStatus.PUBLISHED } = query;
    const skip = (page - 1) * limit;

    const [blogs, total] = await this.blogRepository.findAndCount({
      where: { status },
      relations: ['author'],
      order: { publishedAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      data: blogs,
      total,
      page: +page,
      limit: +limit,
    };
  }

  async findOne(id: string): Promise<Blog> {
    const blog = await this.blogRepository.findOne({
      where: { id },
      relations: ['author', 'comments'],
    });

    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    return blog;
  }

  async findBySlug(slug: string): Promise<Blog> {
    const blog = await this.blogRepository.findOne({
      where: { slug },
      relations: ['author', 'comments'],
    });

    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    return blog;
  }

  async update(
    id: string,
    updateBlogDto: any,
    authorId: string,
  ): Promise<Blog> {
    const blog = await this.blogRepository.findOne({
      where: { id, authorId },
    });

    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    if (updateBlogDto.title && updateBlogDto.title !== blog.title) {
      updateBlogDto.slug = this.generateSlug(updateBlogDto.title);
    }

    await this.blogRepository.update(id, updateBlogDto);
    return this.findOne(id);
  }

  async remove(id: string, authorId: string): Promise<void> {
    const blog = await this.blogRepository.findOne({
      where: { id, authorId },
    });

    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    await this.blogRepository.remove(blog);
  }

  async publish(id: string, authorId: string): Promise<Blog> {
    const blog = await this.blogRepository.findOne({
      where: { id, authorId },
    });

    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    blog.publish();
    return this.blogRepository.save(blog);
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
}
