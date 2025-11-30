# Hệ thống Phân quyền CVKing

## Tổng quan

Hệ thống phân quyền được triển khai để đảm bảo từng vai trò người dùng chỉ có thể truy cập và thực hiện các chức năng phù hợp với trách nhiệm của họ.

## Các Vai trò (Roles)

### 1. **ADMIN** (Quản trị hệ thống)
- **Mô tả**: Tài khoản cao nhất của chủ nền tảng tuyển dụng (chỉ có 1 tài khoản)
- **Quyền hạn**:
  - ✅ Quản lý toàn bộ người dùng hệ thống (`manage_users`)
  - ✅ Quản lý vai trò và phân quyền (`manage_roles`)
  - ✅ Quản lý các công ty (`manage_companies`)
  - ✅ Duyệt công ty mới đăng ký (`approve_companies`)
  - ✅ Quản lý tất cả tin tuyển dụng (`manage_jobs`)
  - ✅ Kiểm duyệt nội dung (`moderate_content`)
  - ✅ Quản lý gói dịch vụ (`manage_packages`)
  - ✅ Quản lý thanh toán (`manage_payments`)
  - ✅ Xem báo cáo phân tích (`view_analytics`)
  - ✅ Cấu hình hệ thống (`system_config`)
  - ✅ Giám sát hệ thống (`system_monitoring`)

### 2. **EMPLOYER** (Nhà tuyển dụng)
- **Mô tả**: Tài khoản của công ty hoặc người đại diện (CEO, Manager, Owner)
- **Quyền hạn**:
  - ✅ Tạo thông tin công ty (`create_company_profile`)
  - ✅ Quản lý hồ sơ công ty (`manage_company_profile`)
  - ✅ Đăng tin tuyển dụng (`post_jobs`)
  - ✅ Quản lý tin tuyển dụng (`manage_job_postings`)
  - ✅ Xem đơn ứng tuyển của công ty (`view_company_applications`)
  - ✅ Quản lý team HR (`manage_company_hr`)
  - ✅ Xem báo cáo tuyển dụng (`view_recruitment_reports`)
  - ✅ Nâng cấp gói dịch vụ (`upgrade_packages`)

### 3. **HR** (Human Resources - Nhân sự)
- **Mô tả**: Tài khoản do Employer tạo, quyền thấp hơn Employer, làm việc trong phạm vi công ty
- **Quyền hạn theo chức năng**:

#### 🏢 **Tuyển dụng trong công ty (Company Recruitment)**
- ✅ Xem tin tuyển dụng của công ty (`view_company_jobs`)
- ✅ Xử lý ứng viên (`process_candidates`)
- ✅ Đọc và đánh giá CV (`review_resumes`)
- ✅ Liên hệ ứng viên (`contact_candidates`)
- ✅ Chấm điểm ứng viên (`score_candidates`)
- ✅ Tạo lịch phỏng vấn (`create_interviews`)
- ✅ Quản lý phỏng vấn (`manage_interviews`)
- ✅ Chat với ứng viên (`chat_with_candidates`)
- ✅ Đăng tin nếu Employer cho phép (`post_jobs_if_allowed`)

### 4. **JOB_SEEKER** (Người tìm việc)
- **Mô tả**: Tài khoản của ứng viên (Developer, Designer, Tester, Sinh viên...)
- **Quyền hạn**:
  - ✅ Tạo hồ sơ cá nhân (`create_profile`)
  - ✅ Quản lý CV (`manage_resume`)
  - ✅ Upload CV PDF (`upload_cv`)
  - ✅ Chọn template CV (`choose_templates`)
  - ✅ Ứng tuyển công việc (`apply_to_jobs`)
  - ✅ Theo dõi trạng thái hồ sơ (`track_applications`)
  - ✅ Nhận thông báo (`receive_notifications`)
  - ✅ Nhận feedback (`receive_feedback`)
  - ✅ Lưu công việc yêu thích (`save_jobs`)

### 5. **Blog Permissions** (Quyền Blog Theo Vai Trò)

#### **ADMIN với Blog:**
- ✅ Viết blog chính thức hệ thống (`write_system_blogs`)
- ✅ Duyệt/từ chối blog từ Employer/HR (`approve_blog_posts`)
- ✅ Khoá/xóa bài viết vi phạm (`delete_any_blog_post`)
- ✅ Quản lý category, chủ đề (`manage_blog_categories`)
- ✅ Quản lý bình luận, báo cáo xấu
- ✅ Thống kê blog (views, likes, shares) (`view_blog_analytics`)
- **Mục đích**: Thông báo hệ thống, hướng dẫn, tin tức ngành, PR nền tảng

#### **EMPLOYER với Blog:**
- ✅ Viết blog quảng bá công ty (`write_company_blogs`)
- ✅ Sửa/xóa bài viết công ty (`edit_own_blogs`, `delete_own_blogs`)
- ✅ Quản lý bình luận bài công ty (`manage_company_blog_comments`)
- ✅ Đọc, bình luận, like, share (`comment_on_blogs`, `like_blog_posts`, `share_blog_posts`)
- ❌ **Không được** xóa blog công ty khác
- ❌ **Không được** viết blog thay HR (trừ khi HR đăng dưới quyền)
- **Mục đích**: Giới thiệu văn hóa, cơ hội nghề nghiệp, sự kiện, PR thương hiệu

#### **HR với Blog:**
- ✅ Viết blog tuyển dụng (`write_recruitment_blogs`)
- ✅ Sửa/xóa bài viết của mình (`edit_own_blogs`, `delete_own_blogs`)
- ✅ Quản lý bình luận của mình (`manage_own_comments`)
- ✅ Đọc, bình luận, like, share (`comment_on_blogs`, `like_blog_posts`, `share_blog_posts`)
- ❌ **Không được** xóa blog công ty
- ❌ **Không được** duyệt blog, xóa blog HR khác
- ❌ **Không được** quản lý blog toàn hệ thống
- **Mục đích**: Bài về nghề nghiệp, tuyển dụng, giới thiệu job, kinh nghiệm phỏng vấn

#### **JOB SEEKER với Blog:**
- **Tuỳ loại hệ thống:**
- **Nếu KHÔNG phải mạng xã hội:**
  - ❌ Không được viết blog
  - ✅ Chỉ đọc, chia sẻ, bình luận (nếu bật)
- **Nếu có tính năng chia sẻ cá nhân (như LinkedIn):**
  - ✅ Viết bài chia sẻ cá nhân (`write_personal_blogs` - optional)
  - ✅ Bình luận, like, bookmark (`comment_on_blogs`, `like_blog_posts`, `bookmark_blogs`)
  - ✅ Báo cáo nội dung xấu (`report_blog_content`)
  - ❌ Bài viết thường không được Admin duyệt

## Chi tiết Quyền hạn theo Chức năng

### Quản trị Hệ thống (System Administration)
| Quyền | ADMIN | EMPLOYER | HR | JOB_SEEKER |
|-------|-------|----------|----|------------|
| `manage_users` | ✅ | ❌ | ❌ | ❌ |
| `manage_roles` | ✅ | ❌ | ❌ | ❌ |
| `manage_companies` | ✅ | ❌ | ❌ | ❌ |
| `approve_companies` | ✅ | ❌ | ❌ | ❌ |
| `manage_jobs` | ✅ | ❌ | ❌ | ❌ |
| `moderate_content` | ✅ | ❌ | ❌ | ❌ |
| `manage_packages` | ✅ | ❌ | ❌ | ❌ |
| `manage_payments` | ✅ | ❌ | ❌ | ❌ |
| `view_analytics` | ✅ | ❌ | ❌ | ❌ |
| `system_config` | ✅ | ❌ | ❌ | ❌ |
| `system_monitoring` | ✅ | ❌ | ❌ | ❌ |

### Quản lý Công ty (Company Management)
| Quyền | ADMIN | EMPLOYER | HR | JOB_SEEKER |
|-------|-------|----------|----|------------|
| `create_company_profile` | ✅ | ✅ | ❌ | ❌ |
| `manage_company_profile` | ✅ | ✅ | ❌ | ❌ |
| `manage_company_hr` | ✅ | ✅ | ❌ | ❌ |
| `view_recruitment_reports` | ✅ | ✅ | ❌ | ❌ |
| `upgrade_packages` | ✅ | ✅ | ❌ | ❌ |

### Tuyển dụng (Recruitment)
| Quyền | ADMIN | EMPLOYER | HR | JOB_SEEKER |
|-------|-------|----------|----|------------|
| `post_jobs` | ✅ | ✅ | ❌ | ❌ |
| `manage_job_postings` | ✅ | ✅ | ❌ | ❌ |
| `view_company_applications` | ✅ | ✅ | ❌ | ❌ |
| `view_company_jobs` | ✅ | ✅ | ✅ | ❌ |
| `process_candidates` | ✅ | ✅ | ✅ | ❌ |
| `review_resumes` | ✅ | ✅ | ✅ | ❌ |
| `contact_candidates` | ✅ | ✅ | ✅ | ❌ |
| `score_candidates` | ✅ | ✅ | ✅ | ❌ |
| `create_interviews` | ✅ | ✅ | ✅ | ❌ |
| `manage_interviews` | ✅ | ✅ | ✅ | ❌ |
| `chat_with_candidates` | ✅ | ✅ | ✅ | ❌ |
| `post_jobs_if_allowed` | ✅ | ✅ | ✅ | ❌ |

### Blog Management (Quản lý Blog)
| Quyền | ADMIN | EMPLOYER | HR | JOB_SEEKER |
|-------|-------|----------|----|------------|
| `manage_blog_categories` | ✅ | ❌ | ❌ | ❌ |
| `approve_blog_posts` | ✅ | ❌ | ❌ | ❌ |
| `delete_any_blog_post` | ✅ | ❌ | ❌ | ❌ |
| `write_system_blogs` | ✅ | ❌ | ❌ | ❌ |
| `view_blog_analytics` | ✅ | ❌ | ❌ | ❌ |
| `write_company_blogs` | ✅ | ✅ | ❌ | ❌ |
| `write_recruitment_blogs` | ✅ | ✅ | ✅ | ❌ |
| `write_personal_blogs` | ✅ | ✅ | ✅ | ✅* |
| `edit_own_blogs` | ✅ | ✅ | ✅ | ✅* |
| `delete_own_blogs` | ✅ | ✅ | ✅ | ✅* |
| `manage_own_comments` | ✅ | ✅ | ✅ | ✅ |
| `manage_company_blog_comments` | ✅ | ✅ | ❌ | ❌ |
| `comment_on_blogs` | ✅ | ✅ | ✅ | ✅ |
| `like_blog_posts` | ✅ | ✅ | ✅ | ✅ |
| `share_blog_posts` | ✅ | ✅ | ✅ | ✅ |
| `bookmark_blogs` | ✅ | ✅ | ✅ | ✅ |
| `report_blog_content` | ✅ | ✅ | ✅ | ✅ |

_*Optional - depends on platform type (social network vs job board)_

### Ứng viên & Hồ sơ (Job Seekers & Profiles)
| Quyền | ADMIN | EMPLOYER | HR | JOB_SEEKER |
|-------|-------|----------|----|------------|
| `create_profile` | ✅ | ✅ | ✅ | ✅ |
| `manage_resume` | ✅ | ✅ | ✅ | ✅ |
| `upload_cv` | ✅ | ✅ | ✅ | ✅ |
| `choose_templates` | ✅ | ✅ | ✅ | ✅ |
| `apply_to_jobs` | ✅ | ✅ | ✅ | ✅ |
| `track_applications` | ✅ | ✅ | ✅ | ✅ |
| `receive_notifications` | ✅ | ✅ | ✅ | ✅ |
| `receive_feedback` | ✅ | ✅ | ✅ | ✅ |
| `save_jobs` | ✅ | ✅ | ✅ | ✅ |

## Cách sử dụng trong Code

### 1. Decorator cho Controller
```typescript
@Post()
@UseGuards(JwtGuard, RolesGuard)
@RequirePermissions(Permission.POST_JOBS)
async createJob(@Body() dto: CreateJobDto) {
  // Chỉ user có quyền POST_JOBS mới truy cập được
}
```

### 2. Decorator cho Role
```typescript
@Get('admin-only')
@UseGuards(JwtGuard, RolesGuard)
@Roles(RoleName.ADMIN)
async getAdminData() {
  // Chỉ ADMIN mới truy cập được
}
```

### 3. Multiple Permissions
```typescript
@Post('manage-employee')
@UseGuards(JwtGuard, RolesGuard)
@RequirePermissions(Permission.EMPLOYEE_MANAGEMENT, Permission.PAYROLL_MANAGEMENT)
async manageEmployee(@Body() dto: EmployeeDto) {
  // Cần cả 2 quyền EMPLOYEE_MANAGEMENT và PAYROLL_MANAGEMENT
}
```

## Kiểm tra Quyền trong Service

```typescript
@Injectable()
export class JobsService {
  async create(createJobDto: CreateJobDto, userId: string) {
    // Kiểm tra quyền trong service logic
    const userPermissions = await this.getUserPermissions(userId);
    if (!userPermissions.includes(Permission.POST_JOBS)) {
      throw new ForbiddenException('Insufficient permissions');
    }
    // ... tiếp tục logic
  }
}
```

## Ví dụ thực tế

### Admin (Chủ nền tảng) có thể làm gì?
- ✅ **Quản lý toàn bộ hệ thống**: Tất cả người dùng, công ty, tin tuyển dụng
- ✅ **Duyệt và kiểm duyệt**: Công ty mới, nội dung spam
- ✅ **Quản lý thanh toán**: Gói dịch vụ, hóa đơn
- ✅ **Giám sát hệ thống**: Logs, báo cáo phân tích
- ✅ **Cấu hình hệ thống**: Settings, maintenance

### Employer (CEO/Manager) có thể làm gì?
- ✅ **Quản lý công ty**: Tạo/sửa hồ sơ công ty
- ✅ **Đăng tin tuyển dụng**: Tạo job postings
- ✅ **Quản lý team HR**: Mời HR vào công ty
- ✅ **Xem báo cáo**: Thống kê tuyển dụng
- ✅ **Nâng cấp gói**: Upgrade service packages
- ✅ **Xem đơn ứng tuyển**: Chỉ của công ty mình
- ❌ **Không thể** can thiệp công ty khác
- ❌ **Không thể** quản lý toàn hệ thống

### HR (Nhân viên tuyển dụng) có thể làm gì?
- ✅ **Tuyển dụng trong công ty**: Xem job postings của công ty
- ✅ **Xử lý CV**: Đọc, đánh giá, chấm điểm ứng viên
- ✅ **Liên hệ ứng viên**: Gọi điện, email, chat
- ✅ **Quản lý phỏng vấn**: Tạo lịch, ghi chú, feedback
- ✅ **Chat với ứng viên**: Trò chuyện trực tiếp
- ✅ **Đăng tin nếu được phép**: Nếu Employer cho phép
- ❌ **Không thể** quản lý tài khoản công ty
- ❌ **Không thể** mời HR khác vào công ty
- ❌ **Không thể** xem dữ liệu công ty khác

### Job Seeker (Ứng viên) có thể làm gì?
- ✅ **Tạo hồ sơ**: Profile cá nhân, CV
- ✅ **Upload CV**: PDF, chọn template
- ✅ **Ứng tuyển**: Apply to jobs
- ✅ **Theo dõi**: Trạng thái hồ sơ, lịch phỏng vấn
- ✅ **Nhận thông báo**: Interview invites, feedback
- ✅ **Lưu jobs**: Favorite jobs
- ❌ **Không thể** đăng tin tuyển dụng
- ❌ **Không thể** xem CV của người khác

## Bảo mật & Kiểm soát

- **JWT Authentication**: Tất cả API protected đều yêu cầu JWT token
- **Role-based Access Control**: Kiểm tra vai trò người dùng
- **Permission-based Access**: Kiểm tra quyền cụ thể cho từng chức năng
- **Hierarchical Permissions**: Admin có tất cả quyền, HR có quyền mở rộng, Employer có quyền cơ bản
- **Database-level Security**: Quyền được lưu trữ và kiểm tra từ database

## Mở rộng Hệ thống

Để thêm quyền mới:
1. Thêm enum `Permission` trong `role.entity.ts`
2. Cập nhật `RolePermissions` mapping
3. Sử dụng `@RequirePermissions()` decorator
4. Test kỹ các trường hợp edge case

Hệ thống này đảm bảo tính bảo mật cao và linh hoạt để mở rộng theo nhu cầu kinh doanh.
