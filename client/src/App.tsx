import React from 'react';
import { Routes, Route } from 'react-router';
import { MainLayout } from '@/layouts/MainLayout';
import { HomePage } from '@/pages/HomePage';
import { AboutPage } from '@/pages/AboutPage';
import { JobsPage } from '@/pages/JobsPage';
import { JobDetailPage } from '@/pages/JobDetailPage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { PricingPage } from '@/pages/PricingPage';
import { VerifyEmailPage } from '@/pages/VerifyEmailPage';
import { CareerRoadmapPage } from '@/pages/CareerRoadmapPage';
import { CvAnalysisPage } from '@/pages/CvAnalysisPage';
import { MockInterviewPage } from '@/pages/MockInterviewPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { SavedJobsPage } from '@/pages/SavedJobsPage';
import { AppliedJobsPage } from '@/pages/AppliedJobsPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { EmployerDashboardPage } from '@/pages/EmployerDashboardPage';
import { EmployerJobCreatePage } from '@/pages/EmployerJobCreatePage';
import { EmployerJobApplicationsPage } from '@/pages/EmployerJobApplicationsPage';
import { AdminDashboardPage } from '@/pages/AdminDashboardPage';
import { CoverLetterPage } from '@/pages/CoverLetterPage';
import { CompanyListPage } from '@/pages/CompanyListPage';
import { CompanyDetailPage } from '@/pages/CompanyDetailPage';
import { InterviewHistoryPage } from '@/pages/InterviewHistoryPage';
import { CvOptimizerPage } from '@/pages/CvOptimizerPage';
import { ToastContainer } from '@/components/ui/Toast';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ScrollToTop } from '@/components/ScrollToTop';
import { ProtectedRoute } from '@/components/ProtectedRoute';

function App() {
  return (
    <ErrorBoundary>
      <ScrollToTop />
      <ToastContainer />
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="jobs" element={<JobsPage />} />
          <Route path="jobs/:slug" element={<JobDetailPage />} />
          <Route path="companies" element={<CompanyListPage />} />
          <Route path="companies/:slug" element={<CompanyDetailPage />} />
          <Route path="cover-letter" element={<CoverLetterPage />} />
          <Route path="pricing" element={<PricingPage />} />
          <Route path="roadmap" element={<CareerRoadmapPage />} />
          <Route path="cv-analysis" element={<CvAnalysisPage />} />
          <Route path="cv-optimizer" element={<CvOptimizerPage />} />
          <Route path="mock-interview" element={<MockInterviewPage />} />

          {/* Authenticated User Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="profile" element={<ProfilePage />} />
            <Route path="saved-jobs" element={<SavedJobsPage />} />
            <Route path="applied-jobs" element={<AppliedJobsPage />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="interview/history" element={<InterviewHistoryPage />} />
          </Route>

          {/* Employer & Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={['EMPLOYER', 'ADMIN']} />}>
            <Route path="employer/jobs" element={<EmployerDashboardPage />} />
            <Route path="employer/jobs/new" element={<EmployerJobCreatePage />} />
            <Route path="employer/jobs/:id/applications" element={<EmployerJobApplicationsPage />} />
          </Route>

          {/* Admin Exclusive Routes */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route path="admin" element={<AdminDashboardPage />} />
          </Route>
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="verify-email" element={<VerifyEmailPage />} />
        </Route>
      </Routes>
    </ErrorBoundary>
  );
}

export default App;
