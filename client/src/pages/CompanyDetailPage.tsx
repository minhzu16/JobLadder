import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { companiesApi } from '@/services/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Building2, Star, MapPin, Briefcase, ArrowLeft,
  Calendar, DollarSign, Clock, ArrowUpRight, Loader2, Globe
} from 'lucide-react';

export function CompanyDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      companiesApi.getCompanyBySlug(slug)
        .then(res => setCompany(res.data.data))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="flex-1 bg-[#0a0a0a] min-h-[calc(100vh-64px)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="flex-1 bg-[#0a0a0a] min-h-[calc(100vh-64px)] flex flex-col items-center justify-center p-4">
        <h2 className="text-xl font-bold text-white mb-2">Không tìm thấy công ty</h2>
        <p className="text-gray-400 text-sm mb-6">Công ty bạn đang tìm kiếm không tồn tại hoặc đã ngừng hoạt động.</p>
        <Link to="/companies">
          <Button variant="secondary" className="text-sm">
            <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại danh bạ
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#0a0a0a] min-h-[calc(100vh-64px)] py-8 px-4 md:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Back navigation */}
        <Link to="/companies" className="inline-flex items-center text-xs text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Quay lại danh bạ công ty
        </Link>

        {/* Company Header Card */}
        <Card className="p-6 md:p-8 border-cyan-500/20 bg-gradient-to-br from-cyan-950/20 via-black to-purple-950/10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 p-3 flex items-center justify-center shrink-0">
              {company.logoUrl ? (
                <img src={company.logoUrl} alt={company.name} className="w-full h-full object-contain rounded-xl" />
              ) : (
                <Building2 className="w-10 h-10 text-cyan-400" />
              )}
            </div>

            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl md:text-3xl font-black text-white">{company.name}</h1>
                <Badge variant="cyan" className="text-xs">
                  {company.industry || 'Công nghệ thông tin'}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400">
                <span className="flex items-center gap-1 text-yellow-400 font-semibold">
                  <Star className="w-4 h-4 fill-yellow-400" /> {company.rating > 0 ? company.rating.toFixed(1) : '4.8'} / 5.0
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-cyan-400" /> {company.workType || 'Việt Nam (Hybrid)'}
                </span>
                <span>•</span>
                <span className="text-purple-400 font-semibold">
                  {company.jobs?.length || 0} việc làm đang tuyển
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          {company.description && (
            <div className="mt-6 pt-6 border-t border-white/10 text-sm text-gray-300 leading-relaxed">
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Giới thiệu doanh nghiệp</h2>
              <p className="whitespace-pre-line">{company.description}</p>
            </div>
          )}
        </Card>

        {/* Jobs posted by company */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-cyan-400" /> Việc Làm Đang Tuyển Dụng ({company.jobs?.length || 0})
          </h2>

          {company.jobs && company.jobs.length > 0 ? (
            <div className="space-y-3">
              {company.jobs.map((job: any) => (
                <Card
                  key={job.id}
                  className="p-5 border-white/10 hover:border-cyan-500/40 transition-all bg-black/40 flex flex-col md:flex-row justify-between md:items-center gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <Link
                      to={`/jobs/${job.slug}`}
                      className="text-base font-bold text-white hover:text-cyan-400 transition-colors flex items-center gap-1.5"
                    >
                      {job.title} <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1 text-emerald-400 font-medium">
                        <DollarSign className="w-3.5 h-3.5" />
                        {(() => {
                          const min = job.salaryMin;
                          const max = job.salaryMax;
                          if (!min && !max) return 'Thương lượng';
                          const normMin = min ? (min < 1000 ? min : Math.round(min / 1000000)) : null;
                          const normMax = max ? (max < 1000 ? max : Math.round(max / 1000000)) : null;
                          if (normMin && normMax) return `${normMin} - ${normMax} Triệu`;
                          if (normMin) return `Từ ${normMin} Triệu`;
                          return `Tới ${normMax} Triệu`;
                        })()}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" /> {job.location}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {job.workType}
                      </span>
                      <span>•</span>
                      <span>{job.experience}</span>
                    </div>
                  </div>

                  <Link to={`/jobs/${job.slug}`} className="shrink-0 self-end md:self-center">
                    <Button size="sm" className="bg-cyan-600 hover:bg-cyan-700 text-white font-semibold text-xs px-4">
                      Ứng tuyển ngay
                    </Button>
                  </Link>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 border-white/10 text-center text-gray-400">
              Hiện tại công ty chưa có tin tuyển dụng nào đang mở.
            </Card>
          )}
        </div>

      </div>
    </div>
  );
}
