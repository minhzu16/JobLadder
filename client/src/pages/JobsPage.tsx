import React from 'react';
import { 
  Search, MapPin, Zap, ChevronDown, SlidersHorizontal, Sparkles, 
  Loader2, ChevronLeft, ChevronRight, RotateCcw, Briefcase 
} from 'lucide-react';
import { Link } from 'react-router';
import { jobsApi } from '@/services/api';

function formatSalary(min?: number | null, max?: number | null): string {
  if (!min && !max) return 'Thỏa thuận';
  const normMin = min ? (min < 1000 ? min : Math.round(min / 1000000)) : null;
  const normMax = max ? (max < 1000 ? max : Math.round(max / 1000000)) : null;
  if (normMin && normMax) return `${normMin} - ${normMax} triệu`;
  if (normMin) return `Từ ${normMin} triệu`;
  return `Tới ${normMax} triệu`;
}

export function JobsPage() {
  const [jobs, setJobs] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [keyword, setKeyword] = React.useState('');
  const [location, setLocation] = React.useState('all');
  const [industry, setIndustry] = React.useState('all');
  const [experience, setExperience] = React.useState('all');
  const [workType, setWorkType] = React.useState('all');
  const [salaryRange, setSalaryRange] = React.useState('all');
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [totalJobs, setTotalJobs] = React.useState(0);

  const fetchJobs = React.useCallback(async (opts?: {
    kw?: string;
    loc?: string;
    ind?: string;
    exp?: string;
    wt?: string;
    sal?: string;
    pg?: number;
  }) => {
    setLoading(true);
    try {
      const params: any = {};
      const searchKw = opts?.kw !== undefined ? opts.kw : keyword;
      const searchLoc = opts?.loc !== undefined ? opts.loc : location;
      const searchInd = opts?.ind !== undefined ? opts.ind : industry;
      const searchExp = opts?.exp !== undefined ? opts.exp : experience;
      const searchWt = opts?.wt !== undefined ? opts.wt : workType;
      const searchSal = opts?.sal !== undefined ? opts.sal : salaryRange;
      const searchPg = opts?.pg !== undefined ? opts.pg : page;
      
      if (searchKw.trim()) params.keyword = searchKw.trim();
      if (searchLoc && searchLoc !== 'all') params.location = searchLoc;
      if (searchInd && searchInd !== 'all') params.industry = searchInd;
      if (searchExp && searchExp !== 'all') params.experience = searchExp;
      if (searchWt && searchWt !== 'all') params.workType = searchWt;
      if (searchSal && searchSal !== 'all') params.salaryRange = searchSal;
      params.page = searchPg;
      params.limit = 10;

      const res = await jobsApi.getJobs(params);
      const data = res.data.data || [];
      setJobs(data);
      setTotalPages(res.data.totalPages || 1);
      setTotalJobs(res.data.total !== undefined ? res.data.total : data.length);
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, [keyword, location, industry, experience, workType, salaryRange, page]);

  React.useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchJobs({ kw: keyword, loc: location, pg: 1 });
  };

  const handleFilterChange = (type: 'ind' | 'exp' | 'wt' | 'sal', val: string) => {
    setPage(1);
    if (type === 'ind') {
      setIndustry(val);
      fetchJobs({ ind: val, pg: 1 });
    } else if (type === 'exp') {
      setExperience(val);
      fetchJobs({ exp: val, pg: 1 });
    } else if (type === 'wt') {
      setWorkType(val);
      fetchJobs({ wt: val, pg: 1 });
    } else if (type === 'sal') {
      setSalaryRange(val);
      fetchJobs({ sal: val, pg: 1 });
    }
  };

  const handleResetFilters = () => {
    setKeyword('');
    setLocation('all');
    setIndustry('all');
    setExperience('all');
    setWorkType('all');
    setSalaryRange('all');
    setPage(1);
    fetchJobs({
      kw: '',
      loc: 'all',
      ind: 'all',
      exp: 'all',
      wt: 'all',
      sal: 'all',
      pg: 1,
    });
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages || newPage === page) return;
    setPage(newPage);
    fetchJobs({ pg: newPage });
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const hasActiveFilters = 
    keyword.trim() !== '' || 
    location !== 'all' || 
    industry !== 'all' || 
    experience !== 'all' || 
    workType !== 'all' || 
    salaryRange !== 'all';

  return (
    <div className="min-h-screen bg-[#020905] text-white flex flex-col pb-20 w-full relative overflow-y-auto">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-cyan-900/10 rounded-full blur-[140px] pointer-events-none -z-10"></div>

      {/* Hero */}
      <div className="w-full border-b border-white/10 bg-[#041208]/60 backdrop-blur-xl py-10 relative">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full border border-purple-500/20 bg-purple-500/10 text-purple-400 text-xs font-semibold tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5" /> Khám phá Cơ hội Nghề nghiệp
          </div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-3 text-white">
            Tuyển dụng việc làm đa ngành cực <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">hấp dẫn!</span>
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto text-sm md:text-base">
            Tìm kiếm cơ hội thăng tiến của bạn giữa hàng ngàn tin tuyển dụng chất lượng cao đã được xác thực.
          </p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="container mx-auto px-4 py-8 max-w-6xl space-y-6">
        <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-5 md:p-6 backdrop-blur-xl shadow-2xl space-y-4">
          {/* Search Row */}
          <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 flex items-center px-4 py-3 bg-black/40 rounded-2xl border border-white/10 focus-within:border-purple-500/50 transition-colors shadow-inner">
              <Search className="w-5 h-5 text-gray-400 mr-3 shrink-0" />
              <input 
                type="text" 
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Vị trí tuyển dụng, tên công ty, kỹ năng (ví dụ: React, Golang)..." 
                className="w-full bg-transparent outline-none text-white placeholder-gray-500 text-sm" 
              />
            </div>
            <div className="w-full md:w-56 relative flex items-center px-4 py-3 bg-black/40 rounded-2xl border border-white/10 focus-within:border-purple-500/50 transition-colors shadow-inner">
              <MapPin className="w-5 h-5 text-cyan-400 mr-2 shrink-0" />
              <select 
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value);
                  setPage(1);
                  fetchJobs({ loc: e.target.value, pg: 1 });
                }}
                className="w-full bg-transparent outline-none text-gray-200 text-sm cursor-pointer appearance-none pr-6"
              >
                <option value="all" className="bg-[#0c0c0c] text-white">Tất cả địa điểm</option>
                <option value="Hà Nội" className="bg-[#0c0c0c] text-white">Hà Nội</option>
                <option value="Hồ Chí Minh" className="bg-[#0c0c0c] text-white">TP. Hồ Chí Minh</option>
                <option value="Đà Nẵng" className="bg-[#0c0c0c] text-white">Đà Nẵng</option>
                <option value="Remote" className="bg-[#0c0c0c] text-white">Từ xa (Remote)</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            <button 
              type="submit"
              className="h-12 px-7 rounded-2xl bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-700 hover:to-cyan-600 text-white font-semibold text-sm transition-transform hover:scale-[1.02] shadow-lg flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <Zap className="w-4 h-4 text-white fill-white" /> Tìm việc
            </button>
          </form>

          {/* Advanced Filters */}
          <div className="pt-3 border-t border-white/10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-gray-400 tracking-wider uppercase flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-purple-400" /> Bộ lọc chuyên sâu
              </span>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors font-medium cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" /> Đặt lại bộ lọc
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Ngành nghề */}
              <FilterSelect 
                value={industry}
                onChange={(val) => handleFilterChange('ind', val)}
                options={[
                  { label: 'Tất cả ngành nghề', value: 'all' },
                  { label: 'Công nghệ thông tin', value: 'Công nghệ thông tin' },
                  { label: 'Kinh doanh / Bán hàng', value: 'Kinh doanh' },
                  { label: 'Marketing / Truyền thông', value: 'Marketing' },
                  { label: 'Tài chính / Ngân hàng', value: 'Tài chính' },
                  { label: 'Nhân sự / Tuyển dụng', value: 'Nhân sự' },
                  { label: 'Thiết kế / Sáng tạo', value: 'Thiết kế' },
                ]} 
              />
              {/* Kinh nghiệm */}
              <FilterSelect 
                value={experience}
                onChange={(val) => handleFilterChange('exp', val)}
                options={[
                  { label: 'Tất cả kinh nghiệm', value: 'all' },
                  { label: 'Thực tập sinh (Intern)', value: 'Thực tập' },
                  { label: 'Mới ra trường / < 1 năm', value: 'Mới ra trường' },
                  { label: '1–2 năm kinh nghiệm', value: '1-2 năm' },
                  { label: '2–5 năm kinh nghiệm', value: '2-5 năm' },
                  { label: '5+ năm (Senior / Lead)', value: '5+ năm' },
                ]} 
              />
              {/* Hình thức */}
              <FilterSelect 
                value={workType}
                onChange={(val) => handleFilterChange('wt', val)}
                options={[
                  { label: 'Tất cả hình thức', value: 'all' },
                  { label: 'Toàn thời gian (Full-time)', value: 'Toàn thời gian' },
                  { label: 'Bán thời gian (Part-time)', value: 'Bán thời gian' },
                  { label: 'Thực tập (Internship)', value: 'Thực tập' },
                  { label: 'Làm việc tự do (Freelance)', value: 'Freelance' },
                ]} 
              />
              {/* Mức lương */}
              <FilterSelect 
                value={salaryRange}
                onChange={(val) => handleFilterChange('sal', val)}
                options={[
                  { label: 'Tất cả mức lương', value: 'all' },
                  { label: 'Dưới 10 triệu', value: '<10m' },
                  { label: '10 - 20 triệu', value: '10-20m' },
                  { label: '20 - 30 triệu', value: '20-30m' },
                  { label: 'Trên 30 triệu', value: '>30m' },
                ]} 
              />
            </div>
          </div>
        </div>

        {/* Job Count & Sorting Info */}
        <div className="flex items-center justify-between pt-2">
          <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
            Danh sách việc làm phù hợp
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300">
              {totalJobs} vị trí
            </span>
          </h2>
          {totalPages > 1 && (
            <span className="text-xs text-gray-400">
              Trang {page} / {totalPages}
            </span>
          )}
        </div>

        {/* Job List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 w-full bg-white/[0.01] border border-white/5 rounded-3xl">
            <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
            <p className="text-gray-400 text-sm">Đang tải danh sách việc làm...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-20 bg-white/[0.01] border border-white/5 rounded-3xl space-y-3">
            <p className="text-gray-300 font-semibold text-lg">Không tìm thấy việc làm phù hợp</p>
            <p className="text-gray-500 text-sm">Vui lòng thử thay đổi từ khóa tìm kiếm hoặc đặt lại các bộ lọc.</p>
            <button 
              onClick={handleResetFilters}
              className="mt-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-semibold text-white transition-colors cursor-pointer"
            >
              Đặt lại tất cả bộ lọc
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div 
                key={job.id} 
                className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 hover:border-purple-500/40 hover:bg-white/[0.06] transition-all duration-300 group"
              >
                <div className="flex flex-col md:flex-row gap-5">
                  <div className={`w-16 h-16 rounded-2xl ${job.logoColor || 'bg-purple-600'} flex items-center justify-center shrink-0 shadow-lg text-xl font-bold text-white overflow-hidden`}>
                    {job.company?.logoUrl ? (
                      <img src={job.company.logoUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      (job.company?.name || job.company || 'J').charAt(0)
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-2">
                      <div>
                        <h3 className="text-lg font-bold text-white group-hover:text-purple-400 transition-colors">
                          <Link to={`/jobs/${job.slug || job.id}`}>{job.title}</Link>
                        </h3>
                        <p className="text-gray-400 font-medium mb-2">{job.company?.name || job.company}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-cyan-400 font-bold">{formatSalary(job.salaryMin, job.salaryMax)}</p>
                        <p className="text-sm text-gray-500 flex items-center justify-end gap-1 mt-1">
                          <MapPin className="w-3.5 h-3.5" /> {job.location}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-400 mb-4 line-clamp-2">{job.description || job.desc}</p>
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex flex-wrap gap-2">
                        {(job.tags || [job.industry, job.experience, job.workMode, job.workType]).filter(Boolean).map((tag: string, i: number) => (
                          <span key={i} className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-gray-300 text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <Link 
                        to={`/jobs/${job.slug || job.id}`} 
                        className="text-purple-400 text-sm font-medium hover:text-purple-300 transition-colors whitespace-nowrap"
                      >
                        Xem chi tiết →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="pt-8 pb-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/10">
                <p className="text-xs text-gray-400">
                  Hiển thị trang <span className="text-white font-semibold">{page}</span> trên tổng số <span className="text-white font-semibold">{totalPages}</span> trang ({totalJobs} việc làm)
                </p>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page <= 1}
                    className="p-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    title="Trang trước"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                    .map((p, idx, arr) => {
                      const prev = arr[idx - 1];
                      const hasGap = prev && p - prev > 1;
                      return (
                        <React.Fragment key={p}>
                          {hasGap && <span className="px-1 text-gray-600 text-xs">...</span>}
                          <button
                            onClick={() => handlePageChange(p)}
                            className={`min-w-9 h-9 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                              page === p
                                ? 'bg-gradient-to-r from-purple-600 to-cyan-500 text-white shadow-lg'
                                : 'border border-white/10 bg-white/5 hover:bg-white/10 text-gray-300'
                            }`}
                          >
                            {p}
                          </button>
                        </React.Fragment>
                      );
                    })}

                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page >= totalPages}
                    className="p-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    title="Trang tiếp theo"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function FilterSelect({ 
  value, 
  onChange, 
  options 
}: { 
  value: string; 
  onChange: (val: string) => void; 
  options: { label: string; value: string }[] 
}) {
  return (
    <div className="relative">
      <select 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-black/40 border border-white/10 text-gray-300 rounded-xl px-3.5 py-2.5 text-xs font-medium outline-none hover:border-purple-500/40 focus:border-purple-500/50 appearance-none cursor-pointer pr-8 transition-colors shadow-inner"
      >
        {options.map((opt, i) => (
          <option key={i} value={opt.value} className="bg-[#0c0c0c] text-white">
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
    </div>
  );
}
