import React, { useState, useEffect } from 'react';
import { companiesApi } from '@/services/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Building2, Search, Star, MapPin, Briefcase, ArrowUpRight, Loader2, Users } from 'lucide-react';
import { Link } from 'react-router';

export function CompanyListPage() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [industryFilter, setIndustryFilter] = useState('');

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async (searchQuery?: string, searchIndustry?: string) => {
    setLoading(true);
    try {
      const q = searchQuery !== undefined ? searchQuery : query;
      const ind = searchIndustry !== undefined ? searchIndustry : industryFilter;
      const res = await companiesApi.getCompanies({
        q: q.trim() || undefined,
        industry: ind || undefined,
      });
      setCompanies(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 bg-[#0a0a0a] min-h-[calc(100vh-64px)] py-8 px-4 md:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Hero */}
        <div className="bg-gradient-to-r from-cyan-950/40 via-blue-950/30 to-black p-6 md:p-8 rounded-3xl border border-cyan-500/20 shadow-2xl backdrop-blur-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="cyan" className="text-xs uppercase tracking-wider font-bold">
                Employers Directory
              </Badge>
              <span className="text-gray-500 text-xs">•</span>
              <span className="text-gray-400 text-xs">Top Tech Companies in Vietnam</span>
            </div>
            <h1 className="text-2xl md:text-4xl font-black text-white flex items-center gap-3">
              <Building2 className="w-8 h-8 text-cyan-400" /> Danh Bạ Công Ty Công Nghệ
            </h1>
            <p className="text-sm text-gray-400 mt-2 max-w-2xl leading-relaxed">
              Khám phá môi trường làm việc, chế độ đãi ngộ và các vị trí tuyển dụng hấp dẫn từ những doanh nghiệp công nghệ hàng đầu tại Việt Nam.
            </p>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm kiếm công ty theo tên..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchCompanies(query, industryFilter)}
              className="w-full bg-black/60 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <select
            value={industryFilter}
            onChange={(e) => {
              const val = e.target.value;
              setIndustryFilter(val);
              fetchCompanies(query, val);
            }}
            className="bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            <option value="">Tất cả lĩnh vực</option>
            <option value="Công nghệ thông tin">Công nghệ thông tin</option>
            <option value="Fintech & Banking">Fintech & Banking</option>
            <option value="E-Commerce & Retail">E-Commerce & Retail</option>
            <option value="AI & Robotics">AI & Robotics</option>
          </select>

          <Button 
            onClick={() => fetchCompanies(query, industryFilter)} 
            className="bg-cyan-600 hover:bg-cyan-700 text-white font-semibold text-sm cursor-pointer"
          >
            Tìm kiếm
          </Button>
        </div>

        {/* Company Cards Grid */}
        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-400 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">Đang tải danh sách công ty...</p>
          </div>
        ) : companies.length === 0 ? (
          <div className="py-20 text-center text-gray-400">
            Không tìm thấy công ty nào phù hợp.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {companies.map((company) => (
              <Card
                key={company.id}
                className="p-6 border-white/10 hover:border-cyan-500/30 transition-all bg-black/40 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 p-2 flex items-center justify-center shrink-0">
                        {company.logoUrl ? (
                          <img src={company.logoUrl} alt={company.name} className="w-full h-full object-contain rounded-lg" />
                        ) : (
                          <Building2 className="w-6 h-6 text-cyan-400" />
                        )}
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">
                          {company.name}
                        </h2>
                        <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                          <span className="flex items-center gap-1 text-yellow-400 font-semibold">
                            <Star className="w-3.5 h-3.5 fill-yellow-400" /> {company.rating > 0 ? company.rating.toFixed(1) : '4.8'}
                          </span>
                          <span>•</span>
                          <span>{company.industry || 'Công nghệ thông tin'}</span>
                        </div>
                      </div>
                    </div>

                    <Badge variant="purple" className="text-xs shrink-0">
                      {company._count?.jobs || 0} việc làm
                    </Badge>
                  </div>

                  <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                    {company.description || 'Doanh nghiệp tiên phong trong chuyển đổi số và công nghệ tại Việt Nam.'}
                  </p>

                  {/* Active jobs sample */}
                  {company.jobs && company.jobs.length > 0 && (
                    <div className="pt-3 border-t border-white/5 space-y-1.5">
                      <div className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider">
                        Vị trí đang mở tuyển:
                      </div>
                      <div className="space-y-1">
                        {company.jobs.map((j: any) => (
                          <Link
                            key={j.id}
                            to={`/jobs/${j.slug}`}
                            className="text-xs text-cyan-400 hover:underline flex items-center justify-between py-1 px-2 rounded-lg hover:bg-white/5"
                          >
                            <span className="truncate">{j.title}</span>
                            <span className="text-gray-500 text-[11px] shrink-0 ml-2">{j.location}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" /> {company.workType || 'Việt Nam (Hybrid)'}
                  </span>
                  <Link to={`/companies/${company.slug}`}>
                    <Button size="sm" variant="ghost" className="text-xs text-cyan-400 hover:text-cyan-300">
                      Xem chi tiết <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
