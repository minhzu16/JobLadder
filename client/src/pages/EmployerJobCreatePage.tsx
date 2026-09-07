import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { employerApi } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import {
  Briefcase, Building2, MapPin, DollarSign, Clock, Layers,
  ChevronLeft, Sparkles, Loader2, CheckCircle2
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export function EmployerJobCreatePage() {
  const [formData, setFormData] = useState({
    title: '',
    companyName: '',
    companyLogoUrl: '',
    location: 'Hà Nội',
    workMode: 'Tại văn phòng (Onsite)',
    workType: 'Toàn thời gian',
    experience: '1-3 năm',
    industry: 'Công nghệ thông tin',
    salaryMin: '',
    salaryMax: '',
    description: '',
    requirements: '',
    benefits: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const { isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      addToast('error', 'Vui lòng đăng nhập để đăng tin tuyển dụng!');
      navigate('/login');
      return;
    }

    if (!formData.title || !formData.companyName || !formData.description || !formData.location) {
      addToast('error', 'Vui lòng điền đầy đủ các thông tin bắt buộc (*)');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title: formData.title.trim(),
        companyName: formData.companyName.trim(),
        companyLogoUrl: formData.companyLogoUrl.trim() || undefined,
        location: formData.location.trim(),
        workMode: formData.workMode,
        workType: formData.workType,
        experience: formData.experience,
        industry: formData.industry,
        salaryMin: formData.salaryMin ? parseInt(formData.salaryMin) * 1000000 : null,
        salaryMax: formData.salaryMax ? parseInt(formData.salaryMax) * 1000000 : null,
        salaryCurrency: 'VND',
        description: formData.description.trim(),
        requirements: formData.requirements.trim() || undefined,
        benefits: formData.benefits.trim() || undefined,
        isActive: true,
      };

      const res = await employerApi.createJob(payload);
      addToast('success', 'Đăng tin tuyển dụng thành công! Tin đã được kích hoạt.');
      navigate(`/employer/jobs/${res.data.data.id}/applications`);
    } catch (err: any) {
      console.error(err);
      const msg = err?.response?.data?.message || 'Lỗi khi tạo tin tuyển dụng. Vui lòng thử lại.';
      addToast('error', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 bg-[#0a0a0a] min-h-[calc(100vh-64px)] py-8 px-4 md:px-8">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Back Link */}
        <Link
          to="/employer/jobs"
          className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-cyan-400 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Quay lại danh sách tin tuyển dụng
        </Link>

        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-950/40 via-blue-950/20 to-black p-6 md:p-8 rounded-3xl border border-cyan-500/20 shadow-2xl backdrop-blur-md">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-cyan-400 font-bold text-xs uppercase tracking-wider">Đăng tin tuyển dụng</span>
            <span className="text-gray-500">•</span>
            <span className="text-emerald-400 text-xs font-semibold flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Tự động hỗ trợ AI ATS Screening
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white">Tạo Tin Tuyển Dụng Mới</h1>
          <p className="text-sm text-gray-400 mt-1">
            Điền các thông số tuyển dụng chi tiết. Hệ thống sẽ tự động đối sánh CV ứng viên với JD bằng AI.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <Card className="p-6 md:p-8 border-white/10 space-y-6">

            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3">
                <Briefcase className="w-5 h-5 text-cyan-400" /> Thông Tin Công Việc Cốt Lõi
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                    Tiêu đề công việc <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    placeholder="VD: Senior Java Cloud Architect, Frontend Lead..."
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                    Tên doanh nghiệp / Công ty <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    required
                    placeholder="VD: FPT Software, VNG Corporation..."
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                    URL Logo Công ty (Tùy chọn)
                  </label>
                  <input
                    type="url"
                    name="companyLogoUrl"
                    value={formData.companyLogoUrl}
                    onChange={handleChange}
                    placeholder="https://example.com/logo.png"
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Scope & Terms */}
            <div className="space-y-4 pt-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3">
                <Layers className="w-5 h-5 text-purple-400" /> Hình Thức & Chế Độ Làm Việc
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                    Địa điểm làm việc <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                    placeholder="VD: Hà Nội, TP. HCM, Toàn quốc..."
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                    Môi trường làm việc
                  </label>
                  <select
                    name="workMode"
                    value={formData.workMode}
                    onChange={handleChange}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                  >
                    <option value="Tại văn phòng (Onsite)">Tại văn phòng (Onsite)</option>
                    <option value="Remote (Từ xa 100%)">Remote (Từ xa 100%)</option>
                    <option value="Hybrid (Linh hoạt)">Hybrid (Linh hoạt)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                    Hình thức hợp đồng
                  </label>
                  <select
                    name="workType"
                    value={formData.workType}
                    onChange={handleChange}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                  >
                    <option value="Toàn thời gian">Toàn thời gian</option>
                    <option value="Bán thời gian">Bán thời gian</option>
                    <option value="Thực tập">Thực tập</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                    Kinh nghiệm yêu cầu
                  </label>
                  <select
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                  >
                    <option value="Dưới 1 Năm">Dưới 1 Năm</option>
                    <option value="1-3 năm">1-3 năm</option>
                    <option value="3-5 năm">3-5 năm</option>
                    <option value="Trên 5 năm">Trên 5 năm</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                    Lương tối thiểu (Triệu VNĐ)
                  </label>
                  <input
                    type="number"
                    name="salaryMin"
                    value={formData.salaryMin}
                    onChange={handleChange}
                    placeholder="VD: 25"
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                    Lương tối đa (Triệu VNĐ)
                  </label>
                  <input
                    type="number"
                    name="salaryMax"
                    value={formData.salaryMax}
                    onChange={handleChange}
                    placeholder="VD: 45"
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Detailed Description */}
            <div className="space-y-4 pt-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3">
                <Sparkles className="w-5 h-5 text-emerald-400" /> Nội Dung Chi Tiết (JD cho AI phân tích)
              </h3>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                  Mô tả công việc (Job Description) <span className="text-red-400">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={5}
                  placeholder="Mô tả các trách nhiệm chính, các dự án tham gia, mục tiêu công việc..."
                  className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white text-sm focus:outline-none focus:border-cyan-500 transition-colors leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                  Yêu cầu ứng viên (Requirements & Skills)
                </label>
                <textarea
                  name="requirements"
                  value={formData.requirements}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Các kỹ năng bắt buộc, kiến thức công nghệ (Java, Spring Boot, Microservices, Redis, Kafka...)"
                  className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white text-sm focus:outline-none focus:border-cyan-500 transition-colors leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                  Quyền lợi & Đãi ngộ (Benefits)
                </label>
                <textarea
                  name="benefits"
                  value={formData.benefits}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Lương tháng 13, thưởng hiệu suất, bảo hiểm sức khỏe cao cấp, máy tính làm việc xịn..."
                  className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white text-sm focus:outline-none focus:border-cyan-500 transition-colors leading-relaxed"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-6 border-t border-white/10">
              <Link to="/employer/jobs">
                <Button variant="ghost" type="button" className="text-gray-400 hover:text-white">
                  Hủy bỏ
                </Button>
              </Link>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold px-8 h-11 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.3)]"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Đang kích hoạt tin...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Đăng Tin Tuyển Dụng Ngay
                  </span>
                )}
              </Button>
            </div>

          </Card>
        </form>

      </div>
    </div>
  );
}
