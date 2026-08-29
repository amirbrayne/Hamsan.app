import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Users,
  HeartHandshake,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ChevronDown,
  Download,
  Share2,
  Calendar,
  Layers,
  BrainCircuit,
  Sliders,
  Check,
  Building,
} from 'lucide-react';
import { useCRMStore } from '../services/store';
import { calculateMatchScore, findTopMatchesForApplicant } from '../services/matchingEngine';
import { Applicant, MatchAnalysis, Introduction } from '../types';

interface SmartMatchingViewProps {
  initialApplicantId?: string;
  onNavigateToIntroductions: () => void;
  onSelectApplicant: (id: string) => void;
}

export const SmartMatchingView: React.FC<SmartMatchingViewProps> = ({
  initialApplicantId,
  onNavigateToIntroductions,
  onSelectApplicant,
}) => {
  const { applicants, addIntroduction, isGlobalUnmasked, currentUser } = useCRMStore();

  const maleApplicants = useMemo(() => applicants.filter((a) => a.gender === 'male'), [applicants]);
  const femaleApplicants = useMemo(() => applicants.filter((a) => a.gender === 'female'), [applicants]);

  const [selectedMaleId, setSelectedMaleId] = useState<string>(
    initialApplicantId && maleApplicants.some((m) => m.id === initialApplicantId)
      ? initialApplicantId
      : maleApplicants[0]?.id || ''
  );

  const [selectedFemaleId, setSelectedFemaleId] = useState<string>(
    initialApplicantId && femaleApplicants.some((f) => f.id === initialApplicantId)
      ? initialApplicantId
      : femaleApplicants[0]?.id || ''
  );

  const maleApplicant = applicants.find((a) => a.id === selectedMaleId) || maleApplicants[0];
  const femaleApplicant = applicants.find((a) => a.id === selectedFemaleId) || femaleApplicants[0];

  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  // Top Matches suggestions
  const topMatchesForMale = useMemo(() => {
    if (!maleApplicant) return [];
    return findTopMatchesForApplicant(maleApplicant, applicants);
  }, [maleApplicant, applicants]);

  const matchAnalysis: MatchAnalysis = useMemo(() => {
    if (!maleApplicant || !femaleApplicant) {
      return {
        applicantA: maleApplicants[0],
        applicantB: femaleApplicants[0],
        compatibilityScore: 85,
        dimensionScores: {
          sharedValues: 90,
          personalityFit: 82,
          familyBackground: 80,
          lifestyleFit: 85,
          expectationsOverlap: 88,
        },
        strengths: [],
        risks: [],
        aiClinicalVerdict: '',
      };
    }
    return calculateMatchScore(maleApplicant, femaleApplicant);
  }, [maleApplicant, femaleApplicant, maleApplicants, femaleApplicants]);

  const handleCreateIntroduction = () => {
    if (!maleApplicant || !femaleApplicant) return;

    const newIntro: Introduction = {
      id: 'intro_' + Date.now(),
      introCode: 'INT-' + Math.floor(1000 + Math.random() * 9000),
      maleApplicantId: maleApplicant.id,
      maleApplicantName: `${maleApplicant.firstName} ${maleApplicant.lastName}`,
      maleFileCode: maleApplicant.fileCode || maleApplicant.caseCode || '10001',
      maleAge: maleApplicant.age,
      maleJob: maleApplicant.educationJob?.jobTitle || maleApplicant.careerFinancial?.currentJob || 'نامشخص',
      femaleApplicantId: femaleApplicant.id,
      femaleApplicantName: `${femaleApplicant.firstName} ${femaleApplicant.lastName}`,
      femaleFileCode: femaleApplicant.fileCode || femaleApplicant.caseCode || '10002',
      femaleAge: femaleApplicant.age,
      femaleJob: femaleApplicant.educationJob?.jobTitle || femaleApplicant.careerFinancial?.currentJob || 'نامشخص',
      createdDate: new Date().toLocaleDateString('fa-IR'),
      status: 'pending' as const,
      statusFa: 'در انتظار بررسی اولیه',
      stageName: 'مرحله ۱: بررسی و پیشنهاد اولیه',
      compatibilityScore: matchAnalysis.compatibilityScore,
      counselorId: currentUser.id,
      counselorName: currentUser.name,
      notes: 'تشکیل پرونده بر مبنای تطبیق ۳۲ متغیره هوشمند.',
      timeline: [
        {
          date: new Date().toLocaleDateString('fa-IR'),
          title: 'تشکیل پرونده معرفی بر اساس تطابق هوشمند',
          description: `ایجاد معرفی با امتیاز سازگاری ${matchAnalysis.compatibilityScore}٪ توسط ${currentUser.name}`,
          actor: currentUser.name,
        },
      ],
    };

    addIntroduction(newIntro);
    setIsSuccessModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-16 text-right">
      {/* Header Banner (Matches Image 5) */}
      <div className="bg-white border border-[#c2c7d1]/60 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="text-right">
            <h2 className="text-xl md:text-2xl font-bold text-[#00355f] flex items-center gap-2 justify-end">
              <span>موتور تطبیق و همسان‌گزینی هوشمند</span>
              <Sparkles className="w-6 h-6 text-[#006b59]" />
            </h2>
            <p className="text-xs md:text-sm text-[#42474f] mt-1">
              تحلیل سازگاری ۳۲ متغیره بر اساس آزمون‌های روانشناختی، پیش‌نیازهای مذهبی، بافت خانوادگی و اولویت‌های بالینی
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => alert('دریافت گزارش جامع بالینی به فرمت PDF برای پرونده جاری آماده شد.')}
              className="bg-[#f7f9fb] border border-[#c2c7d1] text-[#00355f] px-4 py-2 rounded-lg text-xs font-semibold hover:bg-gray-100 flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>خروجی گزارش بالینی (PDF)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Selectors Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#f2f4f6] p-4 rounded-xl border border-[#c2c7d1]/60 text-xs">
        {/* Male Selector */}
        <div className="text-right">
          <label className="font-bold text-[#191c1e] block mb-1.5 flex items-center gap-1.5 justify-end">
            <span>انتخاب متقاضی آقا:</span>
            <span className="w-2 h-2 rounded-full bg-[#00355f]"></span>
          </label>
          <select
            value={selectedMaleId}
            onChange={(e) => setSelectedMaleId(e.target.value)}
            className="w-full bg-white border border-[#c2c7d1] rounded-lg p-2.5 text-xs text-[#191c1e] outline-none focus:border-[#00355f] cursor-pointer"
          >
            {maleApplicants.map((m) => (
              <option key={m.id} value={m.id}>
                {m.firstName} {m.lastName} (#{m.fileCode || m.caseCode}) - {m.age} سال - {m.educationJob?.jobTitle || m.careerFinancial?.currentJob || 'متقاضی'}
              </option>
            ))}
          </select>
        </div>

        {/* Female Selector */}
        <div className="text-right">
          <label className="font-bold text-[#191c1e] block mb-1.5 flex items-center gap-1.5 justify-end">
            <span>انتخاب متقاضی خانم:</span>
            <span className="w-2 h-2 rounded-full bg-[#006b59]"></span>
          </label>
          <select
            value={selectedFemaleId}
            onChange={(e) => setSelectedFemaleId(e.target.value)}
            className="w-full bg-white border border-[#c2c7d1] rounded-lg p-2.5 text-xs text-[#191c1e] outline-none focus:border-[#006b59] cursor-pointer"
          >
            {femaleApplicants.map((f) => (
              <option key={f.id} value={f.id}>
                {f.firstName} {f.lastName} (#{f.fileCode || f.caseCode}) - {f.age} سال - {f.educationJob?.jobTitle || f.careerFinancial?.currentJob || 'متقاضی'}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Candidate Comparison Hero Card (Matches Image 5) */}
      <div className="bg-white rounded-2xl border border-[#c2c7d1]/70 p-6 md:p-8 shadow-xs relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Candidate A (Male) (lg:col-span-4) */}
          <div className="lg:col-span-4 bg-[#f7f9fb] p-5 rounded-2xl border border-[#c2c7d1]/50 text-right space-y-3">
            <div className="flex items-center gap-4 flex-row-reverse">
              <img
                src={maleApplicant.photoUrl}
                alt={maleApplicant.firstName}
                className="w-16 h-16 rounded-full object-cover border-2 border-[#00355f]/30"
              />
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-[#191c1e]">
                  <span className={isGlobalUnmasked ? '' : 'privacy-blur'}>
                    {maleApplicant.firstName} {maleApplicant.lastName}
                  </span>
                </h3>
                <p className="text-xs text-[#727780] font-mono">کد پرونده: #{maleApplicant.fileCode || maleApplicant.caseCode}</p>
                <span className="inline-block bg-[#00355f] text-white text-[10px] px-2 py-0.5 rounded-full font-semibold mt-1">
                  آقا • {maleApplicant.age} ساله
                </span>
              </div>
            </div>

            <div className="space-y-1.5 text-xs pt-2 border-t border-[#c2c7d1]/40">
              <p className="text-[#42474f]">
                <strong>تحصیلات و شغل:</strong> {maleApplicant.educationJob?.educationLevelFa || maleApplicant.educationSkills?.academicEducationFa || 'نامشخص'} - {maleApplicant.educationJob?.jobTitle || maleApplicant.careerFinancial?.currentJob || 'نامشخص'}
              </p>
              <p className="text-[#42474f]">
                <strong>سکونت:</strong> {maleApplicant.city || maleApplicant.residenceCity || 'تهران'}
              </p>
              <p className="text-[#42474f]">
                <strong>تیپ شخصیتی:</strong> {maleApplicant.personality?.mbti || 'INTJ'} ({maleApplicant.personality?.mbtiTitleFa || 'تحلیل‌گر'})
              </p>
              <p className="text-[#42474f]">
                <strong>پایبندی دینی:</strong> {maleApplicant.religionValues?.religiousCommitmentFa || maleApplicant.religiousValues?.prayerStatusFa || 'پایبند به ارزش‌های دینی'}
              </p>
            </div>

            <button
              onClick={() => onSelectApplicant(maleApplicant.id)}
              className="w-full text-center text-xs text-[#00355f] font-bold hover:underline pt-2 block cursor-pointer"
            >
              مشاهده پرونده کامل آقا ←
            </button>
          </div>

          {/* Center Compatibility Score Gauge (Matches Image 5) (lg:col-span-4) */}
          <div className="lg:col-span-4 text-center flex flex-col items-center justify-center p-4">
            <div className="relative w-36 h-36 flex items-center justify-center">
              {/* Outer Ring */}
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  className="text-gray-100"
                  strokeWidth="8"
                  stroke="currentColor"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  className="text-[#006b59] transition-all duration-1000 ease-out"
                  strokeWidth="8"
                  strokeDasharray={264}
                  strokeDashoffset={264 - (264 * matchAnalysis.compatibilityScore) / 100}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-3xl md:text-4xl font-extrabold text-[#006b59] font-mono">
                  {matchAnalysis.compatibilityScore}٪
                </span>
                <span className="text-[10px] text-[#727780] font-semibold">شاخص کل</span>
              </div>
            </div>

            <h4 className="text-sm font-bold text-[#191c1e] mt-3">شاخص سازگاری و تناسب</h4>
            <span className="mt-1 bg-[#9af0d9] text-[#005143] text-xs px-3 py-1 rounded-full font-bold shadow-xs">
              {matchAnalysis.compatibilityScore >= 80 ? 'تطابق بسیار بالا - اولویت معرفی' : 'تطابق نیازمند بررسی تخصصی'}
            </span>

            <button
              onClick={handleCreateIntroduction}
              className="mt-5 w-full bg-[#00355f] text-white py-2.5 px-4 rounded-xl text-xs font-bold hover:bg-[#07497d] transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <HeartHandshake className="w-4 h-4 text-[#9af0d9]" />
              <span>ایجاد پرونده معرفی و هماهنگی جلسه</span>
            </button>
          </div>

          {/* Candidate B (Female) (lg:col-span-4) */}
          <div className="lg:col-span-4 bg-[#f7f9fb] p-5 rounded-2xl border border-[#c2c7d1]/50 text-right space-y-3">
            <div className="flex items-center gap-4 flex-row-reverse">
              <img
                src={femaleApplicant.photoUrl}
                alt={femaleApplicant.firstName}
                className="w-16 h-16 rounded-full object-cover border-2 border-[#006b59]/30"
              />
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-[#191c1e]">
                  <span className={isGlobalUnmasked ? '' : 'privacy-blur'}>
                    {femaleApplicant.firstName} {femaleApplicant.lastName}
                  </span>
                </h3>
                <p className="text-xs text-[#727780] font-mono">کد پرونده: #{femaleApplicant.fileCode || femaleApplicant.caseCode}</p>
                <span className="inline-block bg-[#006b59] text-white text-[10px] px-2 py-0.5 rounded-full font-semibold mt-1">
                  خانم • {femaleApplicant.age} ساله
                </span>
              </div>
            </div>

            <div className="space-y-1.5 text-xs pt-2 border-t border-[#c2c7d1]/40">
              <p className="text-[#42474f]">
                <strong>تحصیلات و شغل:</strong> {femaleApplicant.educationJob?.educationLevelFa || femaleApplicant.educationSkills?.academicEducationFa || 'نامشخص'} - {femaleApplicant.educationJob?.jobTitle || femaleApplicant.careerFinancial?.currentJob || 'نامشخص'}
              </p>
              <p className="text-[#42474f]">
                <strong>سکونت:</strong> {femaleApplicant.city || femaleApplicant.residenceCity || 'تهران'}
              </p>
              <p className="text-[#42474f]">
                <strong>تیپ شخصیتی:</strong> {femaleApplicant.personality?.mbti || 'INFJ'} ({femaleApplicant.personality?.mbtiTitleFa || 'حامی'})
              </p>
              <p className="text-[#42474f]">
                <strong>پایبندی دینی:</strong> {femaleApplicant.religionValues?.religiousCommitmentFa || femaleApplicant.religiousValues?.prayerStatusFa || 'پایبند به ارزش‌های دینی'}
              </p>
            </div>

            <button
              onClick={() => onSelectApplicant(femaleApplicant.id)}
              className="w-full text-center text-xs text-[#006b59] font-bold hover:underline pt-2 block cursor-pointer"
            >
              مشاهده پرونده کامل خانم ←
            </button>
          </div>
        </div>
      </div>

      {/* 5 Dimensional Breakdown & Progress Bars (Matches Image 5) */}
      <div className="bg-white rounded-xl border border-[#c2c7d1]/60 p-6 shadow-xs text-right">
        <h3 className="text-base font-bold text-[#00355f] mb-5 flex items-center gap-2 justify-end">
          <span>تفکیک ابعاد پنج‌گانه سازگاری و روانشناختی</span>
          <Layers className="w-5 h-5 text-[#006b59]" />
        </h3>

        <div className="space-y-4">
          {/* Dimension 1: Shared Values */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-[#006b59] font-bold">{matchAnalysis.dimensionScores.sharedValues}٪</span>
              <span className="text-[#191c1e]">۱. اهداف و ارزش‌های مشترک (دینداری، پایبندی اخلاقی، تعهد خانوادگی)</span>
            </div>
            <div className="h-2.5 w-full bg-[#f2f4f6] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#006b59] rounded-full"
                style={{ width: `${matchAnalysis.dimensionScores.sharedValues}%` }}
              ></div>
            </div>
          </div>

          {/* Dimension 2: Personality */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-[#00355f] font-bold">{matchAnalysis.dimensionScores.personalityFit}٪</span>
              <span className="text-[#191c1e]">۲. تناسب روانشناختی و تیپ شخصیتی (MBTI و Big Five)</span>
            </div>
            <div className="h-2.5 w-full bg-[#f2f4f6] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#00355f] rounded-full"
                style={{ width: `${matchAnalysis.dimensionScores.personalityFit}%` }}
              ></div>
            </div>
          </div>

          {/* Dimension 3: Family */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-[#006b59] font-bold">{matchAnalysis.dimensionScores.familyBackground}٪</span>
              <span className="text-[#191c1e]">۳. بستر خانوادگی و تشابهات فرهنگی</span>
            </div>
            <div className="h-2.5 w-full bg-[#f2f4f6] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#006b59] rounded-full"
                style={{ width: `${matchAnalysis.dimensionScores.familyBackground}%` }}
              ></div>
            </div>
          </div>

          {/* Dimension 4: Lifestyle */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-[#0f4c81] font-bold">{matchAnalysis.dimensionScores.lifestyleFit}٪</span>
              <span className="text-[#191c1e]">۴. سبک زندگی، اوقات فراغت و سطح فعالیت روزمره</span>
            </div>
            <div className="h-2.5 w-full bg-[#f2f4f6] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#0f4c81] rounded-full"
                style={{ width: `${matchAnalysis.dimensionScores.lifestyleFit}%` }}
              ></div>
            </div>
          </div>

          {/* Dimension 5: Expectations */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-[#006b59] font-bold">{matchAnalysis.dimensionScores.expectationsOverlap}٪</span>
              <span className="text-[#191c1e]">۵. همپوشانی انتظارات، محدوده سنی و خطوط قرمز</span>
            </div>
            <div className="h-2.5 w-full bg-[#f2f4f6] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#006b59] rounded-full"
                style={{ width: `${matchAnalysis.dimensionScores.expectationsOverlap}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Highlights & Potential Friction Grid (Matches Image 5) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Synergies / Strengths */}
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-5 shadow-xs text-right">
          <h4 className="text-sm font-bold text-emerald-950 mb-3 flex items-center gap-2 justify-end">
            <span>نقاط قوت و هم‌افزایی‌های بارز پیوند</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-700" />
          </h4>

          <div className="space-y-3 text-xs text-emerald-900">
            {matchAnalysis.strengths.map((item, idx) => (
              <div key={idx} className="bg-white/80 p-3 rounded-lg border border-emerald-100">
                <p className="font-bold text-emerald-950 mb-0.5">{item.title}</p>
                <p className="text-emerald-800 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Potential Friction / Risks */}
        <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-5 shadow-xs text-right">
          <h4 className="text-sm font-bold text-amber-950 mb-3 flex items-center gap-2 justify-end">
            <span>ریسک‌های بالقوه و نکات مراقبتی برای جلسه مشاوره</span>
            <AlertTriangle className="w-5 h-5 text-amber-700" />
          </h4>

          <div className="space-y-3 text-xs text-amber-900">
            {matchAnalysis.risks.map((item, idx) => (
              <div key={idx} className="bg-white/80 p-3 rounded-lg border border-amber-100">
                <p className="font-bold text-amber-950 mb-0.5">{item.title}</p>
                <p className="text-amber-800 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Clinical Verdict (Matches Image 5) */}
      <div className="bg-gradient-to-l from-[#00355f]/10 to-[#9af0d9]/20 border border-[#00355f]/20 rounded-xl p-5 text-right">
        <div className="flex items-center gap-2 mb-2 justify-end">
          <span className="text-xs font-bold text-[#00355f]">جمع‌بندی بالینی هوشمند مرکز الزهرا</span>
          <BrainCircuit className="w-5 h-5 text-[#00355f]" />
        </div>
        <p className="text-xs md:text-sm text-[#191c1e] leading-relaxed">
          {matchAnalysis.aiClinicalVerdict}
        </p>
      </div>

      {/* Top Alternative Matches Suggestions */}
      {topMatchesForMale.length > 1 && (
        <div className="bg-white rounded-xl border border-[#c2c7d1]/60 p-6 shadow-xs text-right">
          <h4 className="text-sm font-bold text-[#00355f] mb-3">
            سایر گزینه‌های دارای تطابق بالا برای {maleApplicant.firstName} {maleApplicant.lastName}:
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {topMatchesForMale
              .filter((m) => m.applicantB.id !== femaleApplicant.id)
              .slice(0, 3)
              .map((match) => (
                <div
                  key={match.applicantB.id}
                  onClick={() => setSelectedFemaleId(match.applicantB.id)}
                  className="p-3 bg-[#f7f9fb] rounded-lg border border-[#c2c7d1]/40 hover:border-[#006b59] transition-all cursor-pointer flex items-center justify-between text-xs"
                >
                  <span className="bg-[#9af0d9] text-[#03705e] px-2 py-0.5 rounded font-bold">
                    {match.compatibilityScore}٪
                  </span>
                  <div className="text-right">
                    <p className="font-bold text-[#191c1e]">
                      {match.applicantB.firstName} {match.applicantB.lastName} ({match.applicantB.age} س)
                    </p>
                    <p className="text-[11px] text-[#727780]">{match.applicantB.educationJob?.jobTitle || match.applicantB.careerFinancial?.currentJob || 'متقاضی'}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Success Modal */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full text-right border border-[#c2c7d1] shadow-2xl">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8" />
            </div>

            <h3 className="text-lg font-bold text-[#00355f] text-center mb-2">پرونده معرفی با موفقیت ایجاد شد</h3>
            <p className="text-xs text-[#42474f] text-center leading-relaxed mb-6">
              معرفی بین {maleApplicant.firstName} {maleApplicant.lastName} و {femaleApplicant.firstName} {femaleApplicant.lastName} با امتیاز {matchAnalysis.compatibilityScore}٪ در کارتابل معرفی‌ها ثبت شد.
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setIsSuccessModalOpen(false);
                  onNavigateToIntroductions();
                }}
                className="flex-1 bg-[#00355f] text-white py-2.5 rounded-lg text-xs font-bold hover:bg-[#07497d]"
              >
                انتقال به بخش مدیریت معرفی‌ها
              </button>
              <button
                onClick={() => setIsSuccessModalOpen(false)}
                className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold"
              >
                بستن
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
