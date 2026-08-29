import React, { useState } from 'react';
import {
  BrainCircuit,
  Calendar,
  Clock,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  FileText,
  User,
  Shield,
  Layers,
} from 'lucide-react';
import { useCRMStore } from '../services/store';
import { CounselingSession } from '../types';

interface CounselingViewProps {
  onSelectApplicant: (id: string) => void;
  onOpenAiAssistant: () => void;
}

export const CounselingView: React.FC<CounselingViewProps> = ({
  onSelectApplicant,
  onOpenAiAssistant,
}) => {
  const { sessions, addSession, updateSession, applicants, isGlobalUnmasked, currentUser, canAccess } =
    useCRMStore();

  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'scheduled' | 'completed'>('all');
  const [selectedSession, setSelectedSession] = useState<CounselingSession | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);

  // New session state
  const [newTitle, setNewTitle] = useState('جلسه ارزیابی روانشناختی و معیارها');
  const [newApplicantId, setNewApplicantId] = useState(applicants[0]?.id || '');
  const [newDate, setNewDate] = useState('۱۴۰۲/۰۹/۲۵');
  const [newTime, setNewTime] = useState('۱۵:۰۰');
  const [newRoom, setNewRoom] = useState('اتاق مشاوره ۲');
  const [newNotes, setNewNotes] = useState('');
  const [newPrivateNotes, setNewPrivateNotes] = useState('');
  const [newFollowUp, setNewFollowUp] = useState('بررسی نتیجه آزمون نئو در جلسه بعد');

  const [revealedNotes, setRevealedNotes] = useState<Record<string, boolean>>({});

  const toggleNotesReveal = (id: string) => {
    setRevealedNotes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const isRevealed = (id: string) => isGlobalUnmasked || !!revealedNotes[id];

  const filteredSessions = sessions.filter((s) => {
    if (activeTab !== 'all' && s.status !== activeTab) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        s.title.toLowerCase().includes(q) ||
        s.applicantName.toLowerCase().includes(q) ||
        s.applicantFileCode.toLowerCase().includes(q) ||
        s.counselorName.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault();
    const app = applicants.find((a) => a.id === newApplicantId) || applicants[0];

    const session: CounselingSession = {
      id: 'sess_' + Date.now(),
      applicantId: app.id,
      applicantName: `${app.firstName} ${app.lastName}`,
      applicantFileCode: app.fileCode,
      sessionNumber: 1,
      counselorId: currentUser.id,
      counselorName: currentUser.name,
      sessionDate: newDate,
      sessionTime: newTime,
      roomNumber: newRoom,
      title: newTitle,
      status: 'scheduled',
      topics: ['ارزیابی اولیه', 'بررسی معیارها'],
      summary: newNotes || 'جلسه تنظیم شد.',
      privateNotes: newPrivateNotes || 'ثبت در حین جلسه انجام خواهد شد.',
      readinessScore: 80,
      homework: newFollowUp,
    };

    addSession(session);
    setShowNewModal(false);
    setNewNotes('');
    setNewPrivateNotes('');
  };

  const handleCompleteSession = (session: CounselingSession) => {
    updateSession(session.id, {
      status: 'completed',
    });
    if (selectedSession && selectedSession.id === session.id) {
      setSelectedSession({ ...selectedSession, status: 'completed' });
    }
  };

  return (
    <div className="space-y-6 pb-16 text-right">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-[#c2c7d1]/60 shadow-xs">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-[#00355f] flex items-center gap-2 justify-end">
            <span>مدیریت جلسات مشاوره و پرونده بالینی</span>
            <BrainCircuit className="w-6 h-6 text-[#006b59]" />
          </h2>
          <p className="text-xs md:text-sm text-[#42474f] mt-1">
            برنامه‌ریزی نوبت‌ها، یادداشت‌های بالینی محافظت‌شده و پرونده روانشناختی مراجعین
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenAiAssistant}
            className="bg-emerald-50 text-[#006b59] border border-[#006b59]/30 px-3.5 py-2 rounded-lg text-xs font-bold hover:bg-[#9af0d9]/30 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#006b59]" />
            <span>دستیار بالینی مشاور</span>
          </button>
          <button
            onClick={() => setShowNewModal(true)}
            className="bg-[#00355f] text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-[#07497d] transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>ثبت نوبت مشاوره جدید</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col md:flex-row gap-3 justify-between items-stretch md:items-center">
        <div className="flex gap-2">
          {[
            { id: 'all', label: 'همه نوبت‌ها' },
            { id: 'scheduled', label: 'در انتظار برگزاری' },
            { id: 'completed', label: 'برگزار شده' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === t.id
                  ? 'bg-[#00355f] text-white shadow-xs'
                  : 'bg-white border border-[#c2c7d1]/70 text-[#42474f] hover:bg-gray-100'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-[#727780]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="جستجو در جلسات و مراجعین..."
            className="w-full bg-white pr-9 pl-3 py-2 border border-[#c2c7d1] rounded-lg text-xs text-[#191c1e] outline-none focus:border-[#00355f]"
          />
        </div>
      </div>

      {/* Sessions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSessions.map((session) => {
          const isDone = session.status === 'completed';

          return (
            <div
              key={session.id}
              className="bg-white rounded-xl border border-[#c2c7d1]/70 p-5 shadow-xs hover:border-[#00355f]/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between border-b border-[#c2c7d1]/40 pb-2.5 mb-3">
                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                      isDone ? 'bg-emerald-100 text-emerald-900' : 'bg-[#9af0d9] text-[#03705e]'
                    }`}
                  >
                    {isDone ? 'برگزار شده' : 'در نوبت'}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-[#727780]">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{session.sessionDate} - {session.sessionTime}</span>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-[#00355f] mb-1.5">{session.title}</h3>

                <div className="p-2.5 bg-[#f7f9fb] rounded-lg border border-[#c2c7d1]/30 mb-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[#727780]">کد: #{session.applicantFileCode}</span>
                    <span
                      onClick={() => onSelectApplicant(session.applicantId)}
                      className="font-bold text-[#191c1e] hover:text-[#00355f] cursor-pointer"
                    >
                      <span className={isGlobalUnmasked ? '' : 'privacy-blur'}>{session.applicantName}</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1 text-[11px] text-[#727780]">
                    <span>محل: {session.roomNumber}</span>
                    <span>مشاور: {session.counselorName}</span>
                  </div>
                </div>

                {/* Clinical Notes snippet with Privacy toggle */}
                <div className="bg-[#f2f4f6] p-3 rounded-lg text-xs mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <button
                      onClick={() => toggleNotesReveal(session.id)}
                      className="text-[#006b59] hover:text-[#03705e] flex items-center gap-1 text-[10px] font-bold"
                    >
                      {isRevealed(session.id) ? (
                        <>
                          <EyeOff className="w-3 h-3" /> مخفی‌سازی
                        </>
                      ) : (
                        <>
                          <Eye className="w-3 h-3" /> مشاهده یادداشت
                        </>
                      )}
                    </button>
                    <span className="font-bold text-[#191c1e] text-[11px] flex items-center gap-1">
                      <Shield className="w-3 h-3 text-[#00355f]" />
                      یادداشت بالینی محرمانه
                    </span>
                  </div>
                  <p
                    className={`text-[#42474f] leading-relaxed text-[11px] ${
                      isRevealed(session.id) ? '' : 'privacy-blur'
                    }`}
                  >
                    {session.privateNotes || session.summary}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-[#c2c7d1]/40">
                {!isDone ? (
                  <button
                    onClick={() => handleCompleteSession(session)}
                    className="flex-1 bg-[#006b59] text-white py-1.5 rounded-lg text-xs font-semibold hover:bg-[#03705e] transition-colors cursor-pointer"
                  >
                    ثبت انجام و اتمام جلسه
                  </button>
                ) : (
                  <span className="flex-1 text-center py-1.5 text-xs text-emerald-700 font-bold bg-emerald-50 rounded-lg">
                    جلسه تکمیل شده
                  </span>
                )}
                <button
                  onClick={() => setSelectedSession(session)}
                  className="px-3 py-1.5 border border-[#c2c7d1] rounded-lg text-xs text-[#191c1e] hover:bg-gray-100 cursor-pointer"
                >
                  جزئیات
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Session Details Modal */}
      {selectedSession && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full text-right border border-[#c2c7d1] shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <button onClick={() => setSelectedSession(null)} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
              <h3 className="text-base font-bold text-[#00355f]">{selectedSession.title}</h3>
            </div>

            <div className="space-y-3 mb-6 text-xs">
              <div className="p-3 bg-[#f7f9fb] rounded-lg border border-[#c2c7d1]">
                <p>
                  <strong>مراجع:</strong> {selectedSession.applicantName} (#{selectedSession.applicantFileCode})
                </p>
                <p className="mt-1">
                  <strong>زمان و مکان:</strong> {selectedSession.sessionDate} ساعت {selectedSession.sessionTime} ({selectedSession.roomNumber})
                </p>
                <p className="mt-1">
                  <strong>مشاور مسئول:</strong> {selectedSession.counselorName}
                </p>
              </div>

              <div>
                <strong className="block text-[#191c1e] mb-1">توضیحات کلی جلسه:</strong>
                <p className="p-3 bg-gray-50 rounded-lg text-[#42474f]">{selectedSession.summary}</p>
              </div>

              <div>
                <strong className="block text-[#00355f] mb-1">یادداشت‌های محرمانه مشاور:</strong>
                <p className="p-3 bg-amber-50 rounded-lg text-amber-950 border border-amber-200">
                  {selectedSession.privateNotes}
                </p>
              </div>

              {selectedSession.homework && (
                <div>
                  <strong className="block text-[#006b59] mb-1">توصیه‌ها و تمرین‌های ارائه‌شده:</strong>
                  <p className="p-2 bg-emerald-50 rounded text-emerald-900">{selectedSession.homework}</p>
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedSession(null)}
              className="w-full bg-gray-100 text-gray-800 py-2 rounded-lg text-xs font-semibold"
            >
              بستن
            </button>
          </div>
        </div>
      )}

      {/* New Session Modal */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <form
            onSubmit={handleCreateSession}
            className="bg-white rounded-2xl p-6 max-w-lg w-full text-right border border-[#c2c7d1] shadow-2xl space-y-4 text-xs"
          >
            <div className="flex items-center justify-between border-b pb-3">
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
              <h3 className="text-base font-bold text-[#00355f]">ثبت نوبت مشاوره جدید</h3>
            </div>

            <div>
              <label className="font-bold text-[#191c1e] block mb-1">عنوان جلسه:</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                required
                className="w-full p-2.5 border border-[#c2c7d1] rounded-lg outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-[#191c1e] block mb-1">انتخاب مراجع:</label>
              <select
                value={newApplicantId}
                onChange={(e) => setNewApplicantId(e.target.value)}
                className="w-full p-2.5 border border-[#c2c7d1] rounded-lg outline-none cursor-pointer"
              >
                {applicants.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.firstName} {a.lastName} (#{a.fileCode}) - {a.age} سال
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="font-bold text-[#191c1e] block mb-1">تاریخ:</label>
                <input
                  type="text"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full p-2 border border-[#c2c7d1] rounded-lg outline-none"
                />
              </div>
              <div>
                <label className="font-bold text-[#191c1e] block mb-1">ساعت:</label>
                <input
                  type="text"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full p-2 border border-[#c2c7d1] rounded-lg outline-none"
                />
              </div>
              <div>
                <label className="font-bold text-[#191c1e] block mb-1">اتاق مشاوره:</label>
                <input
                  type="text"
                  value={newRoom}
                  onChange={(e) => setNewRoom(e.target.value)}
                  className="w-full p-2 border border-[#c2c7d1] rounded-lg outline-none"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-[#191c1e] block mb-1">یادداشت محرمانه مشاور:</label>
              <textarea
                value={newPrivateNotes}
                onChange={(e) => setNewPrivateNotes(e.target.value)}
                rows={2}
                placeholder="محورهای بررسی، آزمون‌های لازم و نکات بالینی..."
                className="w-full p-2 border border-[#c2c7d1] rounded-lg outline-none"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 bg-[#00355f] text-white py-2.5 rounded-lg font-bold hover:bg-[#07497d]"
              >
                ثبت نوبت در تقویم مرکز
              </button>
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-semibold"
              >
                انصراف
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
