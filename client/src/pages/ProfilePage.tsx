import React, { useState, useEffect } from 'react';
import { 
  User, Mail, Phone, Briefcase, FileText, Sparkles, Save, 
  Loader2, CheckCircle, UploadCloud, Bookmark, Send, Mic, Map, Shield 
} from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { userApi, aiApi } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export function ProfilePage() {
  const { isAuthenticated, user, updateUser } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isExtractingFile, setIsExtractingFile] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);

  // Multi-CV states
  const [userCVs, setUserCVs] = useState<any[]>([]);
  const [showAddCvModal, setShowAddCvModal] = useState(false);
  const [newCvTitle, setNewCvTitle] = useState('');
  const [newCvText, setNewCvText] = useState('');
  const [isCreatingCv, setIsCreatingCv] = useState(false);
  const [previewCv, setPreviewCv] = useState<any>(null);

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [bio, setBio] = useState('');
  const [resumeText, setResumeText] = useState('');

  const fetchProfile = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setLoading(true);
    try {
      const [profileRes, cvsRes] = await Promise.all([
        userApi.getProfile(),
        userApi.getUserCVs().catch(() => ({ data: { data: [] } })),
      ]);
      const data = profileRes.data.data;
      setProfileData(data);
      setName(data.name || '');
      setPhone(data.phone || '');
      setTargetRole(data.targetRole || '');
      setBio(data.bio || '');
      setResumeText(data.resumeText || '');
      setUserCVs(cvsRes.data?.data || []);
    } catch (error) {
      console.error('Error fetching profile:', error);
      addToast('error', 'Không thể tải thông tin hồ sơ.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [isAuthenticated]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await userApi.updateProfile({
        name,
        phone,
        targetRole,
        bio,
        resumeText,
      });
      if (updateUser) {
        updateUser(res.data.data);
      }
      addToast('success', 'Cập nhật hồ sơ thành công!');
    } catch (error) {
      console.error('Error updating profile:', error);
      addToast('error', 'Không thể cập nhật hồ sơ.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCvFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, isForNewCvModal: boolean = false) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    setIsExtractingFile(true);
    const formData = new FormData();
    formData.append('cvFile', file);

    try {
      const res = await aiApi.extractCvFile(formData);
      const data = res.data.data;
      if (data?.text) {
        if (isForNewCvModal) {
          setNewCvText(data.text);
          if (!newCvTitle) setNewCvTitle(file.name.replace(/\.[^/.]+$/, ''));
        } else {
          setResumeText(data.text);
        }
        addToast('success', `Đã trích xuất ${data.wordCount || 0} từ từ tệp "${file.name}"!`);
      }
    } catch (error: any) {
      console.error('File extract error:', error);
      const msg = error.response?.data?.message || 'Không thể đọc tệp CV này.';
      addToast('error', msg);
    } finally {
      setIsExtractingFile(false);
    }
  };

  const handleCreateNewCV = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCvTitle.trim() || !newCvText.trim()) {
      addToast('error', 'Vui lòng nhập tiêu đề và nội dung CV!');
      return;
    }

    setIsCreatingCv(true);
    try {
      const res = await userApi.createUserCV({
        title: newCvTitle.trim(),
        extractedText: newCvText.trim(),
        isDefault: userCVs.length === 0,
      });
      addToast('success', 'Đã thêm phiên bản CV mới thành công!');
      setShowAddCvModal(false);
      setNewCvTitle('');
      setNewCvText('');
      // Refresh list
      const cvsRes = await userApi.getUserCVs();
      setUserCVs(cvsRes.data.data || []);
    } catch (error: any) {
      console.error('Error creating CV:', error);
      const msg = error.response?.data?.message || 'Không thể tạo CV mới.';
      addToast('error', msg);
    } finally {
      setIsCreatingCv(false);
    }
  };

  const handleSetDefaultCV = async (cvId: string) => {
    try {
      await userApi.setDefaultCV(cvId);
      addToast('success', 'Đã cập nhật CV mặc định!');
      const cvsRes = await userApi.getUserCVs();
      setUserCVs(cvsRes.data.data || []);
      const defaultCV = cvsRes.data.data?.find((c: any) => c.id === cvId);
      if (defaultCV?.extractedText) {
        setResumeText(defaultCV.extractedText);
      }
    } catch (error) {
      console.error('Error setting default CV:', error);
      addToast('error', 'Không thể đổi CV mặc định.');
    }
  };

  const handleDeleteCV = async (cvId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa bản CV này?')) return;
    try {
      await userApi.deleteUserCV(cvId);
      addToast('success', 'Đã xóa CV!');
      const cvsRes = await userApi.getUserCVs();
      setUserCVs(cvsRes.data.data || []);
    } catch (error) {
      console.error('Error deleting CV:', error);
      addToast('error', 'Không thể xóa CV.');
    }
  };

  if (loading) {
    return (
      <div className="flex-1 bg-[#0a0a0a] min-h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          <p className="text-gray-400 text-sm">Đang tải hồ sơ cá nhân...</p>
        </div>
      </div>
    );
  }

  const stats = profileData?._count || {
    savedJobs: 0,
    applications: 0,
    cvAnalyses: 0,
    interviews: 0,
    roadmaps: 0,
  };

  return (
    <div className="flex-1 bg-[#0a0a0a] min-h-[calc(100vh-64px)] overflow-y-auto py-10 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header Profile Summary */}
        <div className="bg-gradient-to-r from-purple-950/40 via-blue-950/20 to-black border border-white/10 p-6 md:p-8 rounded-3xl backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-tr from-purple-600 to-cyan-500 p-0.5 shrink-0 shadow-[0_0_20px_rgba(168,85,247,0.3)]">
              <img 
                src={profileData?.avatarUrl || `https://api.dicebear.com/9.x/notionists/svg?seed=${name || 'User'}&backgroundColor=6D28D9`} 
                alt={name} 
                className="w-full h-full object-cover rounded-full bg-black"
              />
            </div>
            <div>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                <h1 className="text-2xl font-bold text-white">{name || 'Ứng viên'}</h1>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                  <Shield className="w-3 h-3" /> Thành viên
                </span>
              </div>
              <p className="text-sm text-cyan-400 font-medium mb-2">{targetRole || 'Chưa thiết lập vị trí mục tiêu'}</p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-gray-400">
                <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> {profileData?.email}</span>
                {phone && <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> {phone}</span>}
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Link to="/cv-analysis">
              <Button className="bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Phân Tích ATS
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Link to="/saved-jobs" className="block">
            <Card className="p-4 border-white/10 hover:border-purple-500/40 transition-colors group text-center bg-white/[0.02]">
              <Bookmark className="w-5 h-5 text-purple-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-2xl font-bold text-white mb-0.5">{stats.savedJobs}</p>
              <p className="text-xs text-gray-400">Việc làm đã lưu</p>
            </Card>
          </Link>

          <Link to="/applied-jobs" className="block">
            <Card className="p-4 border-white/10 hover:border-cyan-500/40 transition-colors group text-center bg-white/[0.02]">
              <Send className="w-5 h-5 text-cyan-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-2xl font-bold text-white mb-0.5">{stats.applications}</p>
              <p className="text-xs text-gray-400">Đơn đã nộp</p>
            </Card>
          </Link>

          <Link to="/mock-interview" className="block">
            <Card className="p-4 border-white/10 hover:border-green-500/40 transition-colors group text-center bg-white/[0.02]">
              <Mic className="w-5 h-5 text-green-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-2xl font-bold text-white mb-0.5">{stats.interviews}</p>
              <p className="text-xs text-gray-400">Bài phỏng vấn AI</p>
            </Card>
          </Link>

          <Link to="/roadmap" className="block">
            <Card className="p-4 border-white/10 hover:border-yellow-500/40 transition-colors group text-center bg-white/[0.02]">
              <Map className="w-5 h-5 text-yellow-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-2xl font-bold text-white mb-0.5">{stats.roadmaps}</p>
              <p className="text-xs text-gray-400">Lộ trình sự nghiệp</p>
            </Card>
          </Link>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSaveProfile} className="space-y-8">
          
          {/* Thông tin cá nhân */}
          <Card className="p-6 md:p-8 border-white/10 space-y-5">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <User className="w-5 h-5 text-purple-400" />
              Thông Tin Cá Nhân
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                  Họ và tên *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                  Số điện thoại
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0987654321"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                  Vị trí mục tiêu (Chuyên môn / Định hướng)
                </label>
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="Ví dụ: Senior Java Backend Developer / AI Engineer"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                  Giới thiệu bản thân (Bio)
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Mô tả ngắn gọn về kinh nghiệm, thế mạnh và đam mê của bạn..."
                  rows={3}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors resize-none"
                />
              </div>
            </div>
          </Card>

          {/* Quản Lý Đa CV (Multi-CV Portfolio) */}
          <Card className="p-6 md:p-8 border-white/10 space-y-6 bg-white/[0.02]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-400" />
                  Kho Hồ Sơ Đa CV (Multi-CV Portfolio)
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  Lưu trữ nhiều phiên bản CV theo từng chuyên ngành (VD: Backend, Frontend, Fullstack) để nộp đơn ứng tuyển nhanh chóng.
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={() => setShowAddCvModal(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  + Thêm CV Mới
                </Button>
              </div>
            </div>

            {userCVs.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-white/10 rounded-2xl p-6 bg-black/20 space-y-2">
                <p className="text-sm text-gray-300 font-medium">Bạn chưa lưu bản CV riêng biệt nào</p>
                <p className="text-xs text-gray-500">
                  Hãy nhấn "+ Thêm CV Mới" hoặc tải tệp PDF/Word lên để tạo phiên bản CV đầu tiên.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userCVs.map((cv) => (
                  <div
                    key={cv.id}
                    className={`p-4 rounded-2xl border transition-all space-y-3 ${
                      cv.isDefault
                        ? 'bg-gradient-to-br from-purple-950/30 to-black border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.15)]'
                        : 'bg-black/30 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-bold text-white">{cv.title}</h4>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          Tạo ngày {new Date(cv.createdAt).toLocaleDateString('vi-VN')} • {cv.extractedText?.split(/\s+/).filter(Boolean).length || 0} từ
                        </p>
                      </div>
                      {cv.isDefault ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Mặc định
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSetDefaultCV(cv.id)}
                          className="text-[10px] font-medium text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 px-2 py-0.5 rounded-full border border-white/10 transition-colors cursor-pointer"
                        >
                          Đặt mặc định
                        </button>
                      )}
                    </div>

                    <p className="text-xs text-gray-400 line-clamp-2 italic font-mono bg-black/30 p-2 rounded-lg border border-white/5">
                      "{cv.extractedText}"
                    </p>

                    <div className="flex items-center justify-between pt-1 border-t border-white/5 text-xs">
                      <button
                        type="button"
                        onClick={() => setPreviewCv(cv)}
                        className="text-cyan-400 hover:text-cyan-300 font-medium cursor-pointer"
                      >
                        Xem chi tiết
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteCV(cv.id)}
                        className="text-red-400 hover:text-red-300 font-medium cursor-pointer"
                      >
                        Xóa CV
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Hồ sơ CV Master */}
          <Card className="p-6 md:p-8 border-white/10 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-cyan-400" />
                  Nội Dung CV Của Bạn (Master Resume)
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  Được dùng để tự động tính điểm phù hợp (% Match), hỏi đáp AI về Job, và soạn câu hỏi Mock Interview.
                </p>
              </div>

              <label className="text-xs text-purple-400 hover:text-purple-300 cursor-pointer flex items-center gap-1.5 self-start sm:self-auto font-medium bg-purple-500/10 px-3 py-1.5 rounded-lg border border-purple-500/20 transition-all hover:bg-purple-500/20">
                {isExtractingFile ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Đang trích xuất...
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-4 h-4" /> Nạp từ PDF / Word / TXT
                  </>
                )}
                <input 
                  type="file" 
                  accept=".pdf,.docx,.doc,.txt" 
                  onChange={(e) => handleCvFileUpload(e, false)} 
                  disabled={isExtractingFile}
                  className="hidden" 
                />
              </label>
            </div>

            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Dán toàn bộ nội dung CV của bạn vào đây (Kinh nghiệm, kỹ năng, các dự án, học vấn...)"
              rows={12}
              className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors font-mono leading-relaxed resize-y"
            />
            <div className="flex justify-between text-[11px] text-gray-500">
              <span>Nội dung được mã hóa và lưu trữ an toàn trong tài khoản của bạn.</span>
              <span>{resumeText.length} ký tự</span>
            </div>
          </Card>

          <div className="flex justify-end pt-2">

            <Button
              type="submit"
              disabled={isSaving}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-8 h-12 flex items-center gap-2 shadow-[0_0_20px_rgba(168,85,247,0.3)]"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Lưu Thay Đổi Hồ Sơ
            </Button>
          </div>

        </form>

        {/* Modal Thêm CV Mới */}
        {showAddCvModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-[#121212] border border-white/15 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-400" />
                  Thêm Phiên Bản CV Mới
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAddCvModal(false)}
                  className="text-gray-400 hover:text-white text-lg font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateNewCV} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                    Tiêu đề phiên bản CV *
                  </label>
                  <input
                    type="text"
                    value={newCvTitle}
                    onChange={(e) => setNewCvTitle(e.target.value)}
                    placeholder="VD: CV Kỹ Sư Backend Go / CV Frontend React..."
                    required
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                      Nội dung CV *
                    </label>
                    <label className="text-xs text-purple-400 hover:text-purple-300 cursor-pointer flex items-center gap-1 font-medium">
                      {isExtractingFile ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Đang trích xuất...
                        </>
                      ) : (
                        <>
                          <UploadCloud className="w-3.5 h-3.5" /> Nạp từ PDF / Word / TXT
                        </>
                      )}
                      <input
                        type="file"
                        accept=".pdf,.docx,.doc,.txt"
                        onChange={(e) => handleCvFileUpload(e, true)}
                        disabled={isExtractingFile}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <textarea
                    value={newCvText}
                    onChange={(e) => setNewCvText(e.target.value)}
                    placeholder="Dán nội dung CV hoặc tải tệp PDF/Word lên để AI tự động trích xuất..."
                    rows={8}
                    required
                    className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500 transition-colors font-mono leading-relaxed resize-y"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddCvModal(false)}
                    className="border-white/10 text-gray-300 hover:bg-white/10"
                  >
                    Hủy
                  </Button>
                  <Button
                    type="submit"
                    disabled={isCreatingCv || isExtractingFile}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-6"
                  >
                    {isCreatingCv ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Lưu Bản CV Này'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Xem Nhanh CV */}
        {previewCv && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-[#121212] border border-white/15 rounded-3xl p-6 md:p-8 space-y-5 shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-cyan-400" />
                    {previewCv.title}
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {previewCv.isDefault ? 'Bản CV mặc định hiện tại' : 'Bản CV chuyên ngành'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewCv(null)}
                  className="text-gray-400 hover:text-white text-lg font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-black/50 border border-white/10 font-mono text-xs text-gray-200 whitespace-pre-wrap leading-relaxed max-h-[420px] overflow-y-auto">
                {previewCv.extractedText}
              </div>

              <div className="flex justify-between items-center pt-2">
                {!previewCv.isDefault && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      handleSetDefaultCV(previewCv.id);
                      setPreviewCv(null);
                    }}
                    className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10 text-xs"
                  >
                    Đặt làm CV mặc định
                  </Button>
                )}
                <Button
                  type="button"
                  onClick={() => setPreviewCv(null)}
                  className="bg-white/10 hover:bg-white/20 text-white text-xs ml-auto"
                >
                  Đóng
                </Button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

