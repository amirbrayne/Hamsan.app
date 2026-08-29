import React, { useState } from 'react';
import { Sidebar, NavTab } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { ApplicantListView } from './components/ApplicantListView';
import { UniversalSearch } from './components/UniversalSearch';
import { IntakeForm } from './components/IntakeForm';
import { ApplicantProfileView } from './components/ApplicantProfileView';
import { SmartMatchingView } from './components/SmartMatchingView';
import { IntroductionsView } from './components/IntroductionsView';
import { CounselingView } from './components/CounselingView';
import { TasksView } from './components/TasksView';
import { ReportsView } from './components/ReportsView';
import { RbacView } from './components/RbacView';
import { NewApplicantModal } from './components/NewApplicantModal';
import { AiAssistantModal } from './components/AiAssistantModal';
import { AuthModal } from './components/AuthModal';
import { Applicant } from './types';
import { useCRMStore } from './services/store';
import { ShieldAlert, UserCheck, Sparkles, HeartHandshake, LogIn } from 'lucide-react';

export default function App() {
  const { currentUser, isGlobalUnmasked } = useCRMStore();
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [selectedApplicantId, setSelectedApplicantId] = useState<string | null>(null);
  const [matchingInitialApplicantId, setMatchingInitialApplicantId] = useState<string | undefined>(undefined);
  const [isNewApplicantModalOpen, setIsNewApplicantModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const userRole = (currentUser?.role || '').toUpperCase();
  const isAdmin = userRole === 'ADMIN' || userRole === 'MAIN_ADMIN';
  const isManager = userRole === 'INTERNAL_MANAGER';
  const isCounselor = userRole === 'COUNSELOR';
  const isEmployee = userRole === 'EMPLOYEE';
  const isApplicantUser = userRole === 'APPLICANT';

  const handleSelectApplicant = (id: string) => {
    setSelectedApplicantId(id);
  };

  const handleBackFromProfile = () => {
    setSelectedApplicantId(null);
  };

  const handleNavigateToMatching = (applicantId?: string) => {
    setMatchingInitialApplicantId(applicantId);
    setSelectedApplicantId(null);
    setActiveTab('matching');
  };

  const handleNavigateToIntroductions = () => {
    setSelectedApplicantId(null);
    setActiveTab('introductions');
  };

  const handleNavigateToCounseling = () => {
    setSelectedApplicantId(null);
    setActiveTab('counseling');
  };

  const handleScheduleSession = (applicant: Applicant) => {
    setActiveTab('counseling');
  };

  const handleNewApplicantSuccess = (newApplicantId: string) => {
    setIsNewApplicantModalOpen(false);
    setSelectedApplicantId(newApplicantId);
  };

  // If active user is an external applicant, render the Public Client Portal & Registration Shield
  if (isApplicantUser) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-amber-50/40 text-slate-800 font-sans flex flex-col antialiased selection:bg-amber-100 selection:text-amber-900 text-right" dir="rtl">
        {/* Public Client Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between shadow-xs sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-amber-50 rounded-xl text-amber-700 font-bold">
              <HeartHandshake className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-sm font-bold text-slate-900">مرکز مشاوره و همسان‌گزینی هوشمند الزهرا (س)</h1>
              <p className="text-[11px] text-slate-500">پورتال اختصاصی ثبت‌نام و پیگیری مراجعین</p>
            </div>
          </div>
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <LogIn className="w-3.5 h-3.5 text-amber-400" />
            <span>ورود پرسنل / تغییر نقش</span>
          </button>
        </header>

        {/* Public Client Intake Form */}
        <main className="flex-1 p-4 md:p-8 max-w-4xl w-full mx-auto">
          <div className="mb-6 bg-amber-500/10 border border-amber-200 p-4 rounded-xl text-xs text-amber-900 flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-amber-700 shrink-0" />
            <div>
              <p className="font-bold">خوش آمدید به سامانه پذیرش و تشکیل پرونده الزهرا (س)</p>
              <p className="text-[11px] text-amber-800/90 mt-0.5">
                کلیه مشخصات و تصاویر در بستر امن Firestore و Storage رمزنگاری شده و صرفاً توسط مشاورین رسمی بررسی می‌گردد.
              </p>
            </div>
          </div>

          <IntakeForm
            onSuccess={(id) => {
              alert('پرونده شما با موفقیت ثبت شد و به مشاور ارشد ارجاع داده شد.');
            }}
          />
        </main>

        <footer className="h-10 bg-slate-800 text-slate-400 flex items-center justify-between px-6 text-[11px] mt-auto">
          <div>سامانه همسان‌گزینی الزهرا (س) - حریم خصوصی سطح ۱</div>
          <div>پشتیبانی: ۰۲۱-۸۸۸۸۰۰۰۰</div>
        </footer>

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={() => setIsAuthModalOpen(false)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F4F6] text-slate-800 font-sans flex antialiased selection:bg-amber-100 selection:text-amber-900 text-right" dir="rtl">
      {/* Fixed Right Sidebar on Desktop */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setSelectedApplicantId(null);
          setActiveTab(tab);
        }}
        onOpenNewApplicant={() => setIsNewApplicantModalOpen(true)}
        onOpenAiAssistant={() => setIsAiModalOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 md:mr-64 min-h-screen">
        {/* Top Header */}
        <Header
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setSelectedApplicantId(null);
            setActiveTab(tab);
          }}
          onOpenNewApplicant={() => setIsNewApplicantModalOpen(true)}
          onOpenAiAssistant={() => setIsAiModalOpen(true)}
          onOpenAuth={() => setIsAuthModalOpen(true)}
          searchQuery={searchQuery}
          setSearchQuery={(q) => {
            setSearchQuery(q);
            if (q.trim() && activeTab !== 'universal_search' && activeTab !== 'applicants') {
              setActiveTab('universal_search');
            }
          }}
        />

        {/* View Router with Role Protection & Route Guards */}
        <main className="flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto">
          {selectedApplicantId ? (
            <ApplicantProfileView
              applicantId={selectedApplicantId}
              onBack={handleBackFromProfile}
              onNavigateToMatching={handleNavigateToMatching}
              onScheduleSession={handleScheduleSession}
            />
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <DashboardView
                  onSelectApplicant={handleSelectApplicant}
                  onOpenNewApplicant={() => setIsNewApplicantModalOpen(true)}
                  onNavigateToMatching={handleNavigateToMatching}
                  onNavigateToIntroductions={handleNavigateToIntroductions}
                  onNavigateToCounseling={handleNavigateToCounseling}
                />
              )}

              {activeTab === 'universal_search' && (
                <UniversalSearch
                  onSelectApplicant={handleSelectApplicant}
                  onNavigateToMatching={handleNavigateToMatching}
                  onOpenNewApplicant={() => setIsNewApplicantModalOpen(true)}
                />
              )}

              {activeTab === 'applicants' && (
                <ApplicantListView
                  onSelectApplicant={handleSelectApplicant}
                  onOpenNewApplicant={() => setIsNewApplicantModalOpen(true)}
                  onNavigateToMatching={handleNavigateToMatching}
                  initialSearch={searchQuery}
                />
              )}

              {activeTab === 'intake' && (
                <IntakeForm
                  onSuccess={handleNewApplicantSuccess}
                  onCancel={() => setActiveTab('dashboard')}
                />
              )}

              {activeTab === 'matching' && (
                <SmartMatchingView
                  initialApplicantId={matchingInitialApplicantId}
                  onNavigateToIntroductions={handleNavigateToIntroductions}
                  onSelectApplicant={handleSelectApplicant}
                />
              )}

              {activeTab === 'introductions' && (
                <IntroductionsView
                  onNavigateToMatching={() => setActiveTab('matching')}
                  onSelectApplicant={handleSelectApplicant}
                />
              )}

              {activeTab === 'counseling' && (
                <CounselingView
                  onSelectApplicant={handleSelectApplicant}
                  onOpenAiAssistant={() => setIsAiModalOpen(true)}
                />
              )}

              {activeTab === 'tasks' && <TasksView />}

              {activeTab === 'reports' && (
                !isEmployee ? (
                  <ReportsView />
                ) : (
                  <div className="bg-white p-8 rounded-xl border border-slate-200 text-center space-y-3">
                    <ShieldAlert className="w-12 h-12 text-amber-600 mx-auto" />
                    <h3 className="text-sm font-bold text-slate-800">عدم دسترسی به بخش گزارشات تحلیلی</h3>
                    <p className="text-xs text-slate-500">
                      مشاهده گزارشات مالی و آماری نیازمند نقش مدیر ارشد، مدیر داخلی یا مشاور است.
                    </p>
                  </div>
                )
              )}

              {activeTab === 'rbac' && (
                isAdmin ? (
                  <RbacView />
                ) : (
                  <div className="bg-white p-8 rounded-xl border border-slate-200 text-center space-y-3">
                    <ShieldAlert className="w-12 h-12 text-rose-600 mx-auto" />
                    <h3 className="text-sm font-bold text-slate-800">عدم دسترسی به مدیریت دسترسی‌ها (RBAC)</h3>
                    <p className="text-xs text-slate-500">
                      این بخش منحصراً در اختیار مدیر ارشد سامانه (ADMIN) قرار دارد.
                    </p>
                  </div>
                )
              )}
            </>
          )}
        </main>

        {/* High Density System Status Footer */}
        <footer className="h-8 bg-gray-200 border-t border-gray-300/80 flex items-center justify-between px-6 text-[10px] text-gray-500 mt-auto">
          <div>نسخه ۲.۴.۱ (Enterprise Edition) | سرور: فعال | نقش جاری: {currentUser.roleTitle}</div>
          <div>© ۱۴۰۳ مرکز مشاوره و همسان گزینی الزهرا (س) | شیلد محرمانگی فعال</div>
        </footer>
      </div>

      {/* New Applicant Multi-Step Modal */}
      <NewApplicantModal
        isOpen={isNewApplicantModalOpen}
        onClose={() => setIsNewApplicantModalOpen(false)}
        onSuccess={handleNewApplicantSuccess}
      />

      {/* AI Counselor Assistant Modal */}
      <AiAssistantModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        initialApplicantId={selectedApplicantId || undefined}
      />

      {/* Real Firebase Auth Dialog */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}
