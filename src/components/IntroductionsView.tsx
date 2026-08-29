import React, { useState } from 'react';
import {
  Users2,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  Search,
  Filter,
  Phone,
  Calendar,
  HeartHandshake,
  ArrowRight,
  User,
  Sparkles,
  ChevronLeft,
} from 'lucide-react';
import { useCRMStore } from '../services/store';
import { Introduction, IntroductionStatus } from '../types';

interface IntroductionsViewProps {
  onNavigateToMatching: () => void;
  onSelectApplicant: (id: string) => void;
}

export const IntroductionsView: React.FC<IntroductionsViewProps> = ({
  onNavigateToMatching,
  onSelectApplicant,
}) => {
  const { introductions, updateIntroductionStatus, isGlobalUnmasked, currentUser } = useCRMStore();

  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [selectedIntro, setSelectedIntro] = useState<Introduction | null>(null);
  const [showStatusModal, setShowStatusModal] = useState<Introduction | null>(null);
  const [newStatus, setNewStatus] = useState<IntroductionStatus>('meeting');
  const [statusReason, setStatusReason] = useState('');

  const statusOptions: { id: IntroductionStatus; label: string; bg: string; text: string }[] = [
    { id: 'pending', label: 'در انتظار بررسی اولیه', bg: 'bg-[#d2e4ff]', text: 'text-[#00355f]' },
    { id: 'contacted', label: 'تماس اولیه و هماهنگی خانواده‌ها', bg: 'bg-[#9af0d9]', text: 'text-[#03705e]' },
    { id: 'meeting', label: 'جلسه معارفه حضوری در مرکز', bg: 'bg-blue-100', text: 'text-blue-900' },
    { id: 'successful', label: 'پیوند موفق (عقد رسمی)', bg: 'bg-emerald-100', text: 'text-emerald-900' },
    { id: 'rejected', label: 'عدم توافق (بایگانی مورد)', bg: 'bg-rose-100', text: 'text-rose-900' },
  ];

  const filteredIntroductions = introductions.filter((intro) => {
    if (activeFilter !== 'all' && intro.status !== activeFilter) {
      return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        intro.maleApplicantName.toLowerCase().includes(q) ||
        intro.femaleApplicantName.toLowerCase().includes(q) ||
        intro.introCode.toLowerCase().includes(q) ||
        intro.maleFileCode.toLowerCase().includes(q) ||
        intro.femaleFileCode.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const handleApplyStatusChange = () => {
    if (showStatusModal) {
      updateIntroductionStatus(showStatusModal.id, newStatus, statusReason);
      setShowStatusModal(null);
      setStatusReason('');
      if (selectedIntro && selectedIntro.id === showStatusModal.id) {
        setSelectedIntro((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
    }
  };

  return (
    <div className="space-y-6 pb-16 text-right">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-[#c2c7d1]/60 shadow-xs">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-[#00355f] flex items-center gap-2 justify-end">
            <span>مدیریت معرفی‌ها و روند پیوند</span>
            <HeartHandshake className="w-6 h-6 text-[#006b59]" />
          </h2>
          <p className="text-xs md:text-sm text-[#42474f] mt-1">
            پیگیری مراحل معارفه خانواده‌ها، جلسات مشاوره حضوری و ثبت سرنوشت معرفی‌ها
          </p>
        </div>

        <button
          onClick={onNavigateToMatching}
          className="bg-[#00355f] text-white px-4 py-2.5 rounded-lg text-xs font-semibold hover:bg-[#07497d] transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-[#9af0d9]" />
          <span>ایجاد معرفی جدید (موتور تطبیق)</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-3 justify-between items-stretch md:items-center">
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: 'all', label: 'همه موارد' },
            { id: 'pending', label: 'در انتظار' },
            { id: 'contacted', label: 'تماس اولیه' },
            { id: 'meeting', label: 'جلسه معارفه' },
            { id: 'successful', label: 'پیوند موفق' },
            { id: 'rejected', label: 'عدم توافق' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeFilter === tab.id
                  ? 'bg-[#00355f] text-white shadow-xs'
                  : 'bg-white border border-[#c2c7d1]/70 text-[#42474f] hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-[#727780]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="جستجو در معرفی‌ها..."
            className="w-full bg-white pr-9 pl-3 py-2 border border-[#c2c7d1] rounded-lg text-xs text-[#191c1e] outline-none focus:border-[#00355f]"
          />
        </div>
      </div>

      {/* Introductions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredIntroductions.map((intro) => {
          const statusObj = statusOptions.find((s) => s.id === intro.status) || statusOptions[0];

          return (
            <div
              key={intro.id}
              className="bg-white rounded-xl border border-[#c2c7d1]/70 p-5 shadow-xs hover:border-[#00355f]/40 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Top Meta */}
                <div className="flex items-center justify-between border-b border-[#c2c7d1]/40 pb-3 mb-3">
                  <span className="font-mono text-xs text-[#727780] font-bold">#{intro.introCode}</span>
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${statusObj.bg} ${statusObj.text}`}>
                    {statusObj.label}
                  </span>
                </div>

                {/* Candidate Pair */}
                <div className="space-y-2 mb-4">
                  {/* Male */}
                  <div
                    onClick={() => onSelectApplicant(intro.maleApplicantId)}
                    className="p-2 bg-[#f7f9fb] rounded-lg border border-[#c2c7d1]/30 flex items-center justify-between cursor-pointer hover:bg-blue-50/50"
                  >
                    <span className="text-[11px] font-mono text-[#00355f] font-bold">#{intro.maleFileCode}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#191c1e]">
                        <span className={isGlobalUnmasked ? '' : 'privacy-blur'}>{intro.maleApplicantName}</span> ({intro.maleAge} س)
                      </span>
                      <span className="w-2 h-2 rounded-full bg-[#00355f]"></span>
                    </div>
                  </div>

                  {/* Female */}
                  <div
                    onClick={() => onSelectApplicant(intro.femaleApplicantId)}
                    className="p-2 bg-[#f7f9fb] rounded-lg border border-[#c2c7d1]/30 flex items-center justify-between cursor-pointer hover:bg-emerald-50/50"
                  >
                    <span className="text-[11px] font-mono text-[#006b59] font-bold">#{intro.femaleFileCode}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#191c1e]">
                        <span className={isGlobalUnmasked ? '' : 'privacy-blur'}>{intro.femaleApplicantName}</span> ({intro.femaleAge} س)
                      </span>
                      <span className="w-2 h-2 rounded-full bg-[#006b59]"></span>
                    </div>
                  </div>
                </div>

                {/* Match Score & Counselor */}
                <div className="flex items-center justify-between text-xs mb-3 bg-[#f2f4f6] p-2.5 rounded-lg">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-[#727780]">مشاور پرونده:</span>
                    <span className="font-bold text-[#191c1e]">{intro.counselorName}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-extrabold text-[#006b59] font-mono">{intro.compatibilityScore}٪</span>
                    <span className="text-[10px] text-[#727780]">تطابق</span>
                  </div>
                </div>

                {intro.rejectionReason && (
                  <p className="text-[11px] text-rose-800 bg-rose-50 p-2 rounded border border-rose-200 mb-3">
                    علت عدم توافق: {intro.rejectionReason}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-3 border-t border-[#c2c7d1]/40">
                <button
                  onClick={() => {
                    setShowStatusModal(intro);
                    setNewStatus(intro.status);
                  }}
                  className="flex-1 bg-[#00355f] text-white py-2 rounded-lg text-xs font-semibold hover:bg-[#07497d] transition-colors cursor-pointer text-center"
                >
                  تغییر مرحله / ثبت نتیجه
                </button>
                <button
                  onClick={() => setSelectedIntro(intro)}
                  className="p-2 border border-[#c2c7d1] rounded-lg text-[#42474f] hover:bg-gray-100 cursor-pointer"
                  title="مشاهده تایم‌لاین"
                >
                  <Clock className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Timeline Modal */}
      {selectedIntro && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full text-right border border-[#c2c7d1] shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <button onClick={() => setSelectedIntro(null)} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
              <h3 className="text-base font-bold text-[#00355f]">
                تاریخچه پیگیری معرفی #{selectedIntro.introCode}
              </h3>
            </div>

            <div className="space-y-4 mb-6">
              <div className="p-3 bg-[#f7f9fb] rounded-lg border border-[#c2c7d1]">
                <p className="font-bold text-xs text-[#191c1e]">
                  {selectedIntro.maleApplicantName} ({selectedIntro.maleFileCode}) و {selectedIntro.femaleApplicantName} ({selectedIntro.femaleFileCode})
                </p>
                <p className="text-[11px] text-[#727780] mt-0.5">امتیاز سازگاری: {selectedIntro.compatibilityScore}٪ | وضعیت فعلی: {selectedIntro.statusFa}</p>
              </div>

              <div className="relative border-r-2 border-[#c2c7d1] pr-4 space-y-4 text-xs">
                {selectedIntro.timeline.map((step, idx) => (
                  <div key={idx} className="relative">
                    <span className="absolute -right-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[#00355f]"></span>
                    <div className="flex justify-between font-bold text-[#191c1e]">
                      <span>{step.title}</span>
                      <span className="text-[#727780] text-[10px]">{step.date}</span>
                    </div>
                    <p className="text-[#42474f] mt-1">{step.description}</p>
                    <span className="text-[10px] text-[#006b59] font-medium block mt-0.5">توسط: {step.actor}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setSelectedIntro(null)}
              className="w-full bg-gray-100 text-gray-800 py-2 rounded-lg text-xs font-semibold"
            >
              بستن
            </button>
          </div>
        </div>
      )}

      {/* Change Status Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full text-right border border-[#c2c7d1] shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <button onClick={() => setShowStatusModal(null)} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
              <h3 className="text-base font-bold text-[#00355f]">
                بروزرسانی وضعیت معرفی #{showStatusModal.introCode}
              </h3>
            </div>

            <div className="space-y-4 mb-6 text-xs">
              <div>
                <label className="font-bold text-[#191c1e] block mb-1.5">انتخاب وضعیت جدید:</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as IntroductionStatus)}
                  className="w-full bg-[#f7f9fb] border border-[#c2c7d1] rounded-lg p-2.5 text-xs text-[#191c1e] outline-none"
                >
                  {statusOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-[#191c1e] block mb-1.5">
                  علت یا توضیحات جلسه / بازخورد طرفین:
                </label>
                <textarea
                  value={statusReason}
                  onChange={(e) => setStatusReason(e.target.value)}
                  placeholder="توضیحات هماهنگی، توافق حاصل شده یا علل عدم تفاهم..."
                  rows={3}
                  className="w-full bg-[#f7f9fb] border border-[#c2c7d1] rounded-lg p-2.5 text-xs text-[#191c1e] outline-none focus:bg-white"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleApplyStatusChange}
                className="flex-1 bg-[#00355f] text-white py-2 rounded-lg text-xs font-bold hover:bg-[#07497d]"
              >
                ثبت و ذخیره وضعیت
              </button>
              <button
                onClick={() => setShowStatusModal(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold"
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
