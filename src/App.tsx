import React, { useState } from 'react';
import { Sidebar, NavTab } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { ApplicantListView } from './components/ApplicantListView';
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

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [selectedApplicantId, setSelectedApplicantId] = useState<string | null>(null);
  const [matchingInitialApplicantId, setMatchingInitialApplicantId] = useState<string | undefined>(undefined);
  const [isNewApplicantModalOpen, setIsNewApplicantModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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
    setSelectedApplicantId(newApplicantId);
  };

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

      {/* Main Content Area (offset by 64 (16rem / 256px) on desktop) */}
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
            if (q.trim() && activeTab !== 'applicants') {
              setActiveTab('applicants');
            }
          }}
        />

        {/* View Router */}
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

              {activeTab === 'applicants' && (
                <ApplicantListView
                  onSelectApplicant={handleSelectApplicant}
                  onOpenNewApplicant={() => setIsNewApplicantModalOpen(true)}
                  onNavigateToMatching={handleNavigateToMatching}
                  initialSearch={searchQuery}
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

              {activeTab === 'reports' && <ReportsView />}

              {activeTab === 'rbac' && <RbacView />}
            </>
          )}
        </main>

        {/* High Density System Status Footer */}
        <footer className="h-8 bg-gray-200 border-t border-gray-300/80 flex items-center justify-between px-6 text-[10px] text-gray-500 mt-auto">
          <div>نسخه ۲.۴.۱ (Enterprise Edition) | سرور: فعال</div>
          <div>© ۱۴۰۳ مرکز مشاوره و همسان گزینی الزهرا (س) | طراحی شده برای امنیت سطح ۱</div>
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
