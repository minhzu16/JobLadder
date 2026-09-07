import React, { useState, useEffect } from 'react';
import { Bookmark, MapPin, Loader2, ArrowRight, Trash2, Briefcase } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { jobsApi } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Button } from '@/components/ui/Button';

export function SavedJobsPage() {
  const [savedJobs, setSavedJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const { isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const fetchSavedJobs = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setLoading(true);
    try {
      const res = await jobsApi.getSavedJobs();
      setSavedJobs(res.data.data || []);
    } catch (error) {
      console.error('Error fetching saved jobs:', error);
      addToast('error', 'Không thể tải danh sách việc làm đã lưu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedJobs();
  }, [isAuthenticated]);

  const handleUnsave = async (jobId: string, title: string) => {
    try {
      await jobsApi.unsaveJob(jobId);
      setSavedJobs((prev) => prev.filter((j) => j.id !== jobId));
      addToast('info', `Đã bỏ lưu tin "${title}"`);
    } catch (error) {
      addToast('error', 'Không thể bỏ lưu công việc.');
    }
  };

  if (loading) {
    return (
      <div className="flex-1 bg-[#0a0a0a] min-h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          <p className="text-gray-400 text-sm">Đang tải việc làm đã lưu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#0a0a0a] min-h-[calc(100vh-64px)] overflow-y-auto py-10 px-4">
      <div className="max-w-5xl mx-auto space-y-6">
        
        <div className="flex items-center justify-between border-b border-white/10 pb-5">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
              <Bookmark className="w-7 h-7 text-purple-400 fill-purple-400" />
              Việc Làm Đã Lưu
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Danh sách các cơ hội nghề nghiệp bạn đã đánh dấu để xem lại hoặc ứng tuyển.
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 bg-purple-500/10 border border-purple-500/30 text-purple-300 rounded-full">
            {savedJobs.length} công việc
          </span>
        </div>

        {savedJobs.length === 0 ? (
          <div className="text-center py-24 bg-white/[0.02] border border-white/5 rounded-3xl space-y-4">
            <Bookmark className="w-12 h-12 text-gray-600 mx-auto" />
            <h3 className="text-lg font-bold text-white">Bạn chưa lưu công việc nào</h3>
            <p className="text-gray-400 text-sm max-w-md mx-auto">
              Khi tìm thấy công việc ưng ý trên JobLadder, hãy bấm vào biểu tượng Bookmark để lưu lại tại đây nhé!
            </p>
            <Link to="/jobs">
              <Button variant="primary" className="font-semibold">
                Khám phá việc làm ngay
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {savedJobs.map((job) => (
              <div
                key={job.id}
                className="bg-white/[0.03] border border-white/10 hover:border-purple-500/40 rounded-2xl p-5 md:p-6 transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-5 group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-cyan-500 flex items-center justify-center shrink-0 text-xl font-bold text-white overflow-hidden shadow-lg">
                    {job.company?.logoUrl ? (
                      <img src={job.company.logoUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      job.company?.name?.charAt(0) || 'J'
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-purple-400 transition-colors">
                      <Link to={`/jobs/${job.slug || job.id}`}>{job.title}</Link>
                    </h3>
                    <p className="text-gray-400 text-sm font-medium mb-2">{job.company?.name}</p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1 text-cyan-400">
                        <MapPin className="w-3.5 h-3.5" /> {job.location}
                      </span>
                      <span>•</span>
                      <span>{job.workType || 'Toàn thời gian'}</span>
                      {job.salaryMin && job.salaryMax && (
                        <>
                          <span>•</span>
                          <span className="text-green-400 font-medium">
                            {(job.salaryMin / 1000000).toLocaleString()} - {(job.salaryMax / 1000000).toLocaleString()} triệu
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end md:self-center">
                  <button
                    onClick={() => handleUnsave(job.id, job.title)}
                    title="Bỏ lưu"
                    className="p-2.5 rounded-xl border border-white/10 hover:bg-red-500/10 hover:border-red-500/30 text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <Link to={`/jobs/${job.slug || job.id}`}>
                    <Button variant="primary" size="sm" className="font-semibold text-xs flex items-center gap-1.5">
                      Xem chi tiết <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
