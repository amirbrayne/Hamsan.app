import React, { useState } from 'react';
import {
  Sparkles,
  X,
  BrainCircuit,
  User,
  HeartHandshake,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  MessageSquare,
  Layers,
  ArrowLeft,
  Bot,
} from 'lucide-react';
import { useCRMStore } from '../services/store';
import { AIService, AISummaryResponse, AIMatchAnalysisResponse, AICounselorAssistResponse } from '../services/aiService';
import { calculateMatchScore } from '../services/matchingEngine';

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialApplicantId?: string;
}

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({
  isOpen,
  onClose,
  initialApplicantId,
}) => {
  const { applicants } = useCRMStore();

  const [activeMode, setActiveMode] = useState<'summary' | 'match' | 'counselor'>('summary');
  const [selectedApplicantId, setSelectedApplicantId] = useState(initialApplicantId || applicants[0]?.id || '');
  const [selectedSecondId, setSelectedSecondId] = useState(applicants[1]?.id || '');

  const [isLoading, setIsLoading] = useState(false);
  const [summaryData, setSummaryData] = useState<AISummaryResponse | null>(null);
  const [matchData, setMatchData] = useState<AIMatchAnalysisResponse | null>(null);
  const [counselorData, setCounselorData] = useState<AICounselorAssistResponse | null>(null);

  if (!isOpen) return null;

  const handleGenerateSummary = async () => {
    const app = applicants.find((a) => a.id === selectedApplicantId);
    if (!app) return;
    setIsLoading(true);
    try {
      const res = await AIService.generateProfileSummary(app);
      setSummaryData(res);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateMatch = async () => {
    const appA = applicants.find((a) => a.id === selectedApplicantId);
    const appB = applicants.find((a) => a.id === selectedSecondId);
    if (!appA || !appB) return;
    setIsLoading(true);
    try {
      const matchScore = calculateMatchScore(appA, appB);
      const res = await AIService.analyzeMatchPairs(matchScore);
      setMatchData(res);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateCounselor = async () => {
    const app = applicants.find((a) => a.id === selectedApplicantId);
    if (!app) return;
    setIsLoading(true);
    try {
      const res = await AIService.getCounselorAssistantAdvice([], app);
      setCounselorData(res);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-white rounded-2xl p-6 max-w-3xl w-full text-right border border-[#c2c7d1] shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#c2c7d1]/50 pb-4 mb-4">
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
          <div className="text-right">
            <h3 className="text-lg font-bold text-[#00355f] flex items-center gap-2 justify-end">
              <span>دستیار هوشمند تحلیل و مشاوره الزهرا</span>
              <Sparkles className="w-5 h-5 text-[#006b59] animate-pulse" />
            </h3>
            <p className="text-xs text-[#727780]">
              زیرساخت مبتنی بر هوش بالینی و ارزیابی عمیق الگوهای همسان‌گزینی
            </p>
          </div>
        </div>

        {/* Feature Tabs */}
        <div className="flex gap-2 mb-4 bg-[#f2f4f6] p-1.5 rounded-xl text-xs font-bold">
          <button
            onClick={() => setActiveMode('summary')}
            className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeMode === 'summary' ? 'bg-white text-[#00355f] shadow-xs' : 'text-[#42474f]'
            }`}
          >
            <User className="w-4 h-4" />
            <span>خلاصه‌ساز پرونده مراجع</span>
          </button>

          <button
            onClick={() => setActiveMode('match')}
            className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeMode === 'match' ? 'bg-white text-[#00355f] shadow-xs' : 'text-[#42474f]'
            }`}
          >
            <HeartHandshake className="w-4 h-4" />
            <span>تحلیل زوجی و پیشنهاد جلسات</span>
          </button>

          <button
            onClick={() => setActiveMode('counselor')}
            className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeMode === 'counselor' ? 'bg-white text-[#00355f] shadow-xs' : 'text-[#42474f]'
            }`}
          >
            <BrainCircuit className="w-4 h-4" />
            <span>دستیار بالینی مشاور</span>
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto space-y-4 px-1 text-xs text-right">
          {/* Mode 1: Summary */}
          {activeMode === 'summary' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center gap-3 bg-[#f7f9fb] p-3 rounded-xl border border-[#c2c7d1]/50">
                <div className="flex-1 w-full text-right">
                  <label className="font-bold block mb-1">انتخاب مراجع:</label>
                  <select
                    value={selectedApplicantId}
                    onChange={(e) => setSelectedApplicantId(e.target.value)}
                    className="w-full p-2 bg-white border border-[#c2c7d1] rounded-lg text-xs"
                  >
                    {applicants.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.firstName} {a.lastName} (#{a.fileCode || a.caseCode}) - {a.age} سال - {a.educationJob?.jobTitle || a.careerFinancial?.currentJob || 'متقاضی'}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={handleGenerateSummary}
                  disabled={isLoading}
                  className="w-full sm:w-auto bg-[#00355f] text-white px-5 py-2.5 rounded-lg font-bold hover:bg-[#07497d] transition-colors mt-auto shrink-0 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4 text-[#9af0d9]" />
                  {isLoading ? 'در حال پردازش...' : 'تولید خلاصه بالینی'}
                </button>
              </div>

              {summaryData && (
                <div className="space-y-3 animate-in fade-in">
                  <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl">
                    <h4 className="font-bold text-sm text-[#00355f] mb-1">پرسونا و تصویر بالینی مراجع:</h4>
                    <p className="text-[#191c1e] leading-relaxed">{summaryData.briefPersona}</p>
                  </div>

                  <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl">
                    <h4 className="font-bold text-sm text-emerald-950 mb-2">نقاط قوت و دارایی‌های شخصیتی:</h4>
                    <ul className="list-disc list-inside space-y-1 text-emerald-900">
                      {summaryData.keyStrengths.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl">
                    <h4 className="font-bold text-sm text-amber-950 mb-1">نیم‌رخ شریک ایده‌آل پیشنهادی:</h4>
                    <p className="text-amber-900">{summaryData.recommendedPartnerProfile}</p>
                  </div>

                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                    <h4 className="font-bold text-sm text-[#191c1e] mb-2">پرسش‌های کلیدی پیشنهادی برای مشاور در جلسه اول:</h4>
                    <ul className="list-decimal list-inside space-y-1 text-[#42474f]">
                      {summaryData.suggestedQuestions.map((q, i) => (
                        <li key={i}>{q}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Mode 2: Match Analysis */}
          {activeMode === 'match' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#f7f9fb] p-3 rounded-xl border border-[#c2c7d1]/50">
                <div>
                  <label className="font-bold block mb-1">کاندیدای اول:</label>
                  <select
                    value={selectedApplicantId}
                    onChange={(e) => setSelectedApplicantId(e.target.value)}
                    className="w-full p-2 bg-white border border-[#c2c7d1] rounded-lg text-xs"
                  >
                    {applicants.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.firstName} {a.lastName} (#{a.fileCode})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold block mb-1">کاندیدای دوم:</label>
                  <select
                    value={selectedSecondId}
                    onChange={(e) => setSelectedSecondId(e.target.value)}
                    className="w-full p-2 bg-white border border-[#c2c7d1] rounded-lg text-xs"
                  >
                    {applicants.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.firstName} {a.lastName} (#{a.fileCode})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <button
                    onClick={handleGenerateMatch}
                    disabled={isLoading}
                    className="w-full bg-[#006b59] text-white py-2.5 rounded-lg font-bold hover:bg-[#03705e] transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <HeartHandshake className="w-4 h-4" />
                    {isLoading ? 'در حال تحلیل...' : 'تحلیل تطبیق هوشمند دو کاندیدا'}
                  </button>
                </div>
              </div>

              {matchData && (
                <div className="space-y-3 animate-in fade-in">
                  <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl">
                    <h4 className="font-bold text-sm text-emerald-950 mb-1">نظر نهایی هوش بالینی:</h4>
                    <p className="text-emerald-900 leading-relaxed">{matchData.compatibilityVerdict}</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 bg-white border border-emerald-200 rounded-lg">
                      <strong className="text-emerald-950 block mb-1">هم‌افزایی‌ها و اشتراکات:</strong>
                      <ul className="list-disc list-inside space-y-1 text-emerald-900">
                        {matchData.synergyHighlights.map((h, i) => (
                          <li key={i}>{h}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-3 bg-white border border-amber-200 rounded-lg">
                      <strong className="text-amber-950 block mb-1">موضوعات اصطکاک و نیازمند توافق:</strong>
                      <ul className="list-disc list-inside space-y-1 text-amber-900">
                        {matchData.potentialFrictionAreas.map((f, i) => (
                          <li key={i}>{f}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                    <h4 className="font-bold text-sm text-[#00355f] mb-2">دستور جلسه پیشنهادی برای نشست معارفه حضوری:</h4>
                    <ul className="list-disc list-inside space-y-1 text-[#42474f]">
                      {matchData.counselingMeetingAgenda.map((ag, i) => (
                        <li key={i}>{ag}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Mode 3: Counselor Assistant */}
          {activeMode === 'counselor' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center gap-3 bg-[#f7f9fb] p-3 rounded-xl border border-[#c2c7d1]/50">
                <div className="flex-1 w-full text-right">
                  <label className="font-bold block mb-1">انتخاب مراجع جاری:</label>
                  <select
                    value={selectedApplicantId}
                    onChange={(e) => setSelectedApplicantId(e.target.value)}
                    className="w-full p-2 bg-white border border-[#c2c7d1] rounded-lg text-xs"
                  >
                    {applicants.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.firstName} {a.lastName} (#{a.fileCode})
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={handleGenerateCounselor}
                  disabled={isLoading}
                  className="w-full sm:w-auto bg-[#00355f] text-white px-5 py-2.5 rounded-lg font-bold hover:bg-[#07497d] transition-colors mt-auto shrink-0 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <BrainCircuit className="w-4 h-4 text-[#9af0d9]" />
                  {isLoading ? 'در حال آماده‌سازی...' : 'راهنمای بالینی جلسه'}
                </button>
              </div>

              {counselorData && (
                <div className="space-y-3 animate-in fade-in">
                  <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-xl">
                    <h4 className="font-bold text-sm text-purple-950 mb-2">تکنیک‌ها و مداخلات مشاوره‌ای پیشنهادی:</h4>
                    <ul className="list-disc list-inside space-y-1 text-purple-900">
                      {counselorData.suggestedInterventions.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 bg-white border border-[#c2c7d1] rounded-xl">
                    <h4 className="font-bold text-sm text-[#00355f] mb-2">چک‌لیست آمادگی روانی و استقلال برای ازدواج:</h4>
                    <div className="space-y-2">
                      {counselorData.readinessChecklist.map((c, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <CheckCircle2 className={`w-4 h-4 ${c.checked ? 'text-emerald-600' : 'text-gray-300'}`} />
                          <span className={c.checked ? 'text-gray-800 font-medium' : 'text-gray-400'}>{c.item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
