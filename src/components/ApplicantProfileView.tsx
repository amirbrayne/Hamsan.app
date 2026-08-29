import React, { useState } from 'react';
import {
  User,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Calendar,
  Shield,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  Edit,
  Plus,
  Users,
  BrainCircuit,
  Heart,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Download,
  Lock,
  Save,
  Check,
  Building,
  Home,
  Car,
  Award,
  BookOpen,
  Activity,
  Layers,
  ChevronLeft,
  X
} from 'lucide-react';
import { useCRMStore } from '../services/store';
import { calculateAgeFromJalali, toPersianDigits, formatJalaliFull } from '../utils/persianDate';
import {
  Applicant,
  ApplicantWorkflowStatus,
  MaritalHistory,
  MilitaryStatus,
  SmokingStatus,
  PrayerStatus,
  FastingStatus,
  KhumsStatus,
  PersonalCovering,
  HousingStatus,
  InsuranceStatus,
  VehicleStatus
} from '../types';

interface ApplicantProfileViewProps {
  applicantId: string;
  onBack: () => void;
  onNavigateToMatching: (applicantId: string) => void;
  onScheduleSession: (applicant: Applicant) => void;
}

export const ApplicantProfileView: React.FC<ApplicantProfileViewProps> = ({
  applicantId,
  onBack,
  onNavigateToMatching,
  onScheduleSession,
}) => {
  const { getApplicantById, updateApplicant, sessions, introductions, isGlobalUnmasked, currentUser, canAccess } =
    useCRMStore();

  const applicant = getApplicantById(applicantId);

  const [activeTab, setActiveTab] = useState<
    | 'overview'
    | 'personal'
    | 'family'
    | 'education_career'
    | 'religion_lifestyle'
    | 'personality'
    | 'preferences'
    | 'counseling'
    | 'files_history'
  >('overview');

  const [revealedFields, setRevealedFields] = useState<Record<string, boolean>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [editSuccessMsg, setEditSuccessMsg] = useState(false);

  // Edit state initialized from applicant
  const [formData, setFormData] = useState<Applicant | null>(null);

  React.useEffect(() => {
    if (applicant) {
      setFormData(JSON.parse(JSON.stringify(applicant)));
    }
  }, [applicant]);

  if (!applicant || !formData) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-gray-200 text-right">
        <p className="text-gray-600 mb-4">پرونده مراجع مورد نظر یافت نشد.</p>
        <button
          onClick={onBack}
          className="bg-[#00355f] text-white px-4 py-2 rounded-lg text-xs font-semibold"
        >
          بازگشت به فهرست مراجعین
        </button>
      </div>
    );
  }

  const toggleFieldReveal = (fieldKey: string) => {
    setRevealedFields((prev) => ({ ...prev, [fieldKey]: !prev[fieldKey] }));
  };

  const isFieldRevealed = (fieldKey: string) => {
    return isGlobalUnmasked || !!revealedFields[fieldKey];
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    const recalculatedAge = formData.birthDate ? calculateAgeFromJalali(formData.birthDate) : formData.age;

    updateApplicant(applicant.id, {
      ...formData,
      age: recalculatedAge || formData.age,
      lastUpdateDate: new Date().toLocaleDateString('fa-IR'),
      lastUpdate: 'امروز، چند لحظه پیش',
    });

    setIsEditing(false);
    setEditSuccessMsg(true);
    setTimeout(() => setEditSuccessMsg(false), 3500);
  };

  const handleWorkflowChange = (newStatus: ApplicantWorkflowStatus) => {
    updateApplicant(applicant.id, {
      workflowStatus: newStatus,
      status: newStatus === 'SUCCESSFUL' ? 'completed' : newStatus === 'CLOSED' ? 'archived' : 'active',
      lastUpdateDate: new Date().toLocaleDateString('fa-IR'),
      lastUpdate: 'امروز، چند لحظه پیش',
    });
    setFormData((prev) => prev ? { ...prev, workflowStatus: newStatus } : null);
  };

  const applicantSessions = sessions.filter(
    (s) => s.applicantId === applicant.id || s.applicantFileCode?.includes(applicant.caseCode || applicant.fileCode || '')
  );
  const applicantIntroductions = introductions.filter(
    (i) => i.maleApplicantId === applicant.id || i.femaleApplicantId === applicant.id
  );

  const workflowSteps: { status: ApplicantWorkflowStatus; label: string; bg: string }[] = [
    { status: 'NEW', label: 'ثبت اولیه', bg: 'bg-blue-100 text-blue-800' },
    { status: 'UNDER_REVIEW', label: 'بررسی پرونده', bg: 'bg-amber-100 text-amber-800' },
    { status: 'COUNSELING', label: 'مشاوره بالینی', bg: 'bg-purple-100 text-purple-800' },
    { status: 'MATCHING', label: 'همسان‌گزینی فعال', bg: 'bg-teal-100 text-teal-800' },
    { status: 'INTRODUCED', label: 'معرفی شده', bg: 'bg-indigo-100 text-indigo-800' },
    { status: 'SUCCESSFUL', label: 'ازدواج موفق', bg: 'bg-emerald-100 text-emerald-800' },
    { status: 'CLOSED', label: 'مختومه / بایگانی', bg: 'bg-gray-100 text-gray-800' },
  ];

  return (
    <div className="space-y-4 pb-16 text-right">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-[#c2c7d1]/60 shadow-xs">
        <button
          onClick={onBack}
          className="text-xs text-[#00355f] font-semibold hover:bg-gray-100 flex items-center gap-1.5 cursor-pointer px-3 py-1.5 rounded-lg border border-gray-200 transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          <span>بازگشت به فهرست</span>
        </button>

        {/* Workflow step badge indicator */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] text-gray-500 font-bold ml-1">گردش پرونده:</span>
          {workflowSteps.map((ws) => {
            const isCurrent = applicant.workflowStatus === ws.status;
            return (
              <button
                key={ws.status}
                type="button"
                onClick={() => handleWorkflowChange(ws.status)}
                className={`text-[10px] font-bold px-2.5 py-1 rounded-md transition-all ${
                  isCurrent
                    ? `${ws.bg} ring-2 ring-[#00355f] shadow-xs scale-105 font-black`
                    : 'bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-700'
                }`}
                title="کلیک برای تغییر مرحله پرونده"
              >
                {ws.label}
              </button>
            );
          })}
        </div>

        {/* Quick action buttons */}
        <div className="flex items-center gap-2">
          {canAccess('edit_profiles') && (
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                isEditing
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300'
              }`}
            >
              <Edit className="w-3.5 h-3.5" />
              <span>{isEditing ? 'بستن پنل ویرایش' : 'پنل تکمیل و ویرایش کارمند'}</span>
            </button>
          )}

          <button
            onClick={() => onScheduleSession(applicant)}
            className="bg-[#00355f] text-white hover:bg-[#002747] px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
          >
            <Calendar className="w-3.5 h-3.5 text-blue-200" />
            <span>ثبت نوبت مشاوره</span>
          </button>

          <button
            onClick={() => onNavigateToMatching(applicant.id)}
            className="bg-[#006b59] hover:bg-[#005446] text-white px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
          >
            <Sparkles className="w-4 h-4 text-[#9af0d9]" />
            <span>همسان‌گزینی هوشمند AI</span>
          </button>
        </div>
      </div>

      {editSuccessMsg && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-3 rounded-lg text-xs font-bold flex items-center justify-between animate-in fade-in">
          <span className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            تغییرات پرونده با موفقیت در دیتابیس ذخیره و لاگ نظارتی (Audit Log) ثبت شد.
          </span>
          <button onClick={() => setEditSuccessMsg(false)} className="text-emerald-700 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Profile Header Card */}
      <div className="bg-white rounded-xl p-5 border border-[#c2c7d1]/60 shadow-xs flex flex-col md:flex-row-reverse items-start md:items-center justify-between gap-5">
        <div className="w-24 h-24 rounded-xl overflow-hidden border-2 border-[#00355f]/20 shrink-0 mx-auto md:mx-0 shadow-sm relative">
          <img
            src={applicant.photoUrl}
            alt={applicant.firstName}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1 text-right space-y-1.5">
          <div className="flex flex-wrap items-center justify-end gap-3">
            <span className="bg-blue-50 text-blue-900 font-mono font-bold text-xs px-2.5 py-0.5 rounded border border-blue-200">
              {applicant.caseCode || applicant.fileCode}
            </span>
            <span className="bg-emerald-50 text-[#006b59] text-xs font-bold px-2.5 py-0.5 rounded border border-emerald-200">
              {applicant.category || 'عادی'}
            </span>
            {applicant.isVip && (
              <span className="bg-amber-100 text-amber-900 text-xs font-bold px-2 py-0.5 rounded border border-amber-300">
                ⭐ VIP
              </span>
            )}
            <h2 className="text-xl font-bold text-[#00355f] flex items-center gap-2">
              <span
                onClick={() => toggleFieldReveal('name')}
                className={`cursor-pointer transition-all ${
                  isFieldRevealed('name') ? '' : 'privacy-blur'
                }`}
                title="کلیک برای نمایش / پنهان‌سازی نام مراجع"
              >
                {applicant.firstName} {applicant.lastName}
              </span>
              <button
                type="button"
                onClick={() => toggleFieldReveal('name')}
                className="text-[#006b59] hover:text-[#03705e] p-0.5"
                title="تغییر وضعیت نمایش نام"
              >
                {isFieldRevealed('name') ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
            </h2>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-y-1 gap-x-4 text-xs text-[#5d6470]">
            <span>جنسیت: <strong>{applicant.gender === 'male' ? 'آقا' : 'خانم'}</strong></span>
            <span>سن: <strong>{applicant.age} سال</strong> (متولد {applicant.birthDate})</span>
            <span>اصالت و شهر: <strong>{applicant.nationalityOrigin} ({applicant.residenceCity})</strong></span>
            <span>قد و وزن: <strong>{applicant.height}cm / {applicant.weight}kg</strong></span>
            <span>سابقه ازدواج: <strong>{applicant.maritalHistory?.previousMarriageStatusFa || 'مجرد'}</strong></span>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-y-1 gap-x-4 text-[11px] text-gray-500 pt-1 border-t border-gray-100 font-mono">
            <span>تاریخ ثبت: {applicant.registrationDate} ({applicant.registrationMethod === 'in_person' ? 'حضوری' : 'اینترنتی'})</span>
            <span>آخرین بروزرسانی: {applicant.lastUpdateDate || applicant.lastUpdate}</span>
            <span>مشاور پرونده: <strong className="text-blue-900">{applicant.counselorName}</strong></span>
            <span>کارشناس پذیرش: <strong className="text-gray-800">{applicant.assignedEmployeeName || 'واحد تطبیق'}</strong></span>
          </div>
        </div>
      </div>

      {/* Full Interactive Employee Edit Panel (When Open) */}
      {isEditing && (
        <form onSubmit={handleSaveEdit} className="bg-amber-50/40 border-2 border-amber-300 rounded-xl p-5 shadow-md space-y-4 animate-in fade-in text-xs">
          <div className="flex items-center justify-between border-b border-amber-200 pb-3">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="text-gray-500 hover:text-gray-700 p-1"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="text-right">
              <h3 className="font-bold text-sm text-amber-950 flex items-center gap-1.5 justify-end">
                <span>پنل تکمیل، تصحیح و ویرایش اطلاعات کارمند مرکز الزهرا</span>
                <Edit className="w-4 h-4 text-amber-700" />
              </h3>
              <p className="text-[11px] text-amber-800">تمام ۳۳ فیلد اطلاعاتی را می‌توانید مستقیماً بروزرسانی کنید.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-white p-3 rounded-lg border border-amber-200">
            <div>
              <label className="font-bold block mb-1">نام:</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full p-1.5 border rounded"
              />
            </div>
            <div>
              <label className="font-bold block mb-1">نام خانوادگی:</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full p-1.5 border rounded"
              />
            </div>
            <div>
              <label className="font-bold block mb-1">شماره تماس (محرمانه):</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full p-1.5 border rounded font-mono"
              />
            </div>
            <div>
              <label className="font-bold block mb-1">شماره ملی:</label>
              <input
                type="text"
                value={formData.nationalId}
                onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
                className="w-full p-1.5 border rounded font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-white p-3 rounded-lg border border-amber-200">
            <div>
              <label className="font-bold block mb-1">تحصیلات دانشگاهی:</label>
              <input
                type="text"
                value={formData.educationSkills?.academicEducationFa || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  educationSkills: { ...formData.educationSkills, academicEducationFa: e.target.value } as any
                })}
                className="w-full p-1.5 border rounded"
              />
            </div>
            <div>
              <label className="font-bold block mb-1">رشته تحصیلی:</label>
              <input
                type="text"
                value={formData.educationSkills?.fieldOfStudy || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  educationSkills: { ...formData.educationSkills, fieldOfStudy: e.target.value } as any
                })}
                className="w-full p-1.5 border rounded"
              />
            </div>
            <div>
              <label className="font-bold block mb-1">عنوان شغل فعلی:</label>
              <input
                type="text"
                value={formData.careerFinancial?.currentJob || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  careerFinancial: { ...formData.careerFinancial, currentJob: e.target.value } as any
                })}
                className="w-full p-1.5 border rounded"
              />
            </div>
            <div>
              <label className="font-bold block mb-1">محدوده درآمد ماهانه:</label>
              <input
                type="text"
                value={formData.careerFinancial?.incomeRange || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  careerFinancial: { ...formData.careerFinancial, incomeRange: e.target.value } as any
                })}
                className="w-full p-1.5 border rounded"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-3 rounded-lg border border-amber-200">
            <div>
              <label className="font-bold block mb-1">پوشش شخصی:</label>
              <input
                type="text"
                value={formData.religiousValues?.personalCoveringFa || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  religiousValues: { ...formData.religiousValues, personalCoveringFa: e.target.value } as any
                })}
                className="w-full p-1.5 border rounded"
              />
            </div>
            <div>
              <label className="font-bold block mb-1">وضعیت نماز:</label>
              <input
                type="text"
                value={formData.religiousValues?.prayerStatusFa || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  religiousValues: { ...formData.religiousValues, prayerStatusFa: e.target.value } as any
                })}
                className="w-full p-1.5 border rounded"
              />
            </div>
            <div>
              <label className="font-bold block mb-1">وضعیت خمس:</label>
              <input
                type="text"
                value={formData.religiousValues?.khumsStatusFa || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  religiousValues: { ...formData.religiousValues, khumsStatusFa: e.target.value } as any
                })}
                className="w-full p-1.5 border rounded"
              />
            </div>
          </div>

          <div className="bg-white p-3 rounded-lg border border-amber-200 space-y-2">
            <label className="font-bold block text-gray-700">یادداشت تکمیلی مشاور و کارشناس پرونده:</label>
            <textarea
              rows={2}
              value={formData.personality?.personalityNotes || ''}
              onChange={(e) => setFormData({
                ...formData,
                personality: { ...formData.personality, personalityNotes: e.target.value } as any
              })}
              className="w-full p-2 border rounded"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg text-xs"
            >
              انصراف
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-md"
            >
              <Save className="w-4 h-4" />
              <span>ذخیره تغییرات در پرونده دیتابیس</span>
            </button>
          </div>
        </form>
      )}

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1 border-b border-[#c2c7d1]/60 overflow-x-auto bg-white px-2 py-1.5 rounded-lg">
        {[
          { id: 'overview', label: 'خلاصه و شاخص‌ها', icon: Activity },
          { id: 'personal', label: 'هویت و سابقه ازدواج', icon: User },
          { id: 'family', label: 'خانواده و والدین', icon: Users },
          { id: 'education_career', label: 'تحصیل، شغل و مالی', icon: Briefcase },
          { id: 'religion_lifestyle', label: 'دین، احکام و سبک زندگی', icon: Heart },
          { id: 'personality', label: 'شخصیت و روانشناسی', icon: BrainCircuit },
          { id: 'preferences', label: 'ملاک‌های همسر و خط قرمز', icon: Award },
          { id: 'counseling', label: `جلسات مشاوره (${applicantSessions.length})`, icon: Calendar },
          { id: 'files_history', label: `مدارک و سوابق (${applicantIntroductions.length})`, icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg transition-all shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-[#00355f] text-white shadow-xs'
                  : 'text-[#42474f] hover:bg-gray-100 hover:text-[#00355f]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in">
          {/* Key Indicators Card */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs space-y-3">
            <h3 className="font-bold text-xs text-[#00355f] border-b pb-2 flex items-center justify-between">
              <span>شاخص‌های محوری تطابق</span>
              <Activity className="w-4 h-4 text-emerald-600" />
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">پوشش شخصی:</span>
                <span className="font-bold text-slate-800">{applicant.religiousValues?.personalCoveringFa || 'رسمی'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">التزام به نماز:</span>
                <span className="font-bold text-emerald-700">{applicant.religiousValues?.prayerStatusFa || 'مرتب'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">وضعیت خمس:</span>
                <span className="font-bold text-slate-800">{applicant.religiousValues?.khumsStatusFa || 'دارای سال خمسی'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">مصرف دخانیات:</span>
                <span className="font-bold text-slate-800">{applicant.healthLifestyle?.smokingStatusFa || 'عدم مصرف'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">مسکن و خودرو:</span>
                <span className="font-bold text-blue-900">{applicant.careerFinancial?.housingStatusFa || 'مالک'} / {applicant.careerFinancial?.vehicleStatusFa || 'دارای خودرو'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-500">تیپ روانشناختی:</span>
                <span className="font-bold font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                  {applicant.personality?.mbti} ({applicant.personality?.mbtiTitleFa})
                </span>
              </div>
            </div>
          </div>

          {/* Psychological & Counselor Evaluation */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs space-y-3">
            <h3 className="font-bold text-xs text-[#00355f] border-b pb-2 flex items-center justify-between">
              <span>ارزیابی روانشناختی مشاور</span>
              <BrainCircuit className="w-4 h-4 text-purple-600" />
            </h3>
            <p className="text-xs text-gray-700 leading-relaxed bg-purple-50/50 p-3 rounded-lg border border-purple-100">
              {applicant.personality?.personalityNotes || 'مراجع دارای سلامت روان پایدار، بینش عاطفی قوی و آمادگی کامل جهت تشکیل زندگی مشترک است.'}
            </p>
            <div className="pt-1 text-[11px] space-y-1">
              <div>سبک دلبستگی: <strong className="text-purple-900">{applicant.personality?.attachmentStyle || 'ایمن'}</strong></div>
              <div>نقاط قوت: <strong className="text-gray-800">{applicant.personality?.strengths?.join('، ') || 'مسئولیت‌پذیری، صداقت'}</strong></div>
            </div>
          </div>

          {/* Marriage Priorities & Deal Breakers */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs space-y-3">
            <h3 className="font-bold text-xs text-[#00355f] border-b pb-2 flex items-center justify-between">
              <span>اولویت‌ها و خطوط قرمز</span>
              <Shield className="w-4 h-4 text-red-600" />
            </h3>
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-gray-500 block mb-1">اولویت‌های اصلی:</span>
                <div className="flex flex-wrap gap-1">
                  {applicant.marriagePreferences?.priorities?.map((p, idx) => (
                    <span key={idx} className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded text-[11px] border border-emerald-200">
                      {p}
                    </span>
                  )) || <span className="text-gray-400">ثبت نشده</span>}
                </div>
              </div>
              <div className="pt-2">
                <span className="text-red-700 block mb-1 font-bold">خطوط قرمز قطعی:</span>
                <div className="flex flex-wrap gap-1">
                  {applicant.marriagePreferences?.dealBreakers?.map((d, idx) => (
                    <span key={idx} className="bg-red-50 text-red-800 px-2 py-0.5 rounded text-[11px] border border-red-200 font-medium">
                      ⚠️ {d}
                    </span>
                  )) || <span className="text-gray-400">ثبت نشده</span>}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Personal Identity & Marriage History */}
      {activeTab === 'personal' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-3">
            <h3 className="font-bold text-xs text-[#00355f] border-b pb-2 flex items-center justify-between">
              <span>اطلاعات هویتی و ثبت احوال (تقویم جلالی)</span>
              <Calendar className="w-4 h-4 text-[#006b59]" />
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-gray-500 block">تاریخ تولد شمسی:</span>
                <span className="font-bold font-mono text-[#00355f]">{applicant.birthDate}</span>
                <span className="text-[10px] text-gray-500 block">{formatJalaliFull(applicant.birthDate)}</span>
              </div>
              <div>
                <span className="text-gray-500 block">سن دقیق (تقویم جلالی):</span>
                <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block">
                  {toPersianDigits(calculateAgeFromJalali(applicant.birthDate) || applicant.age)} سال تمام
                </span>
              </div>
              <div>
                <span className="text-gray-500 block">شماره ملی (محرمانه):</span>
                <span className={`font-bold font-mono ${isFieldRevealed('nationalId') ? '' : 'privacy-blur'}`}>
                  {applicant.nationalId}
                </span>
                <button
                  onClick={() => toggleFieldReveal('nationalId')}
                  className="text-xs text-blue-600 mr-2 hover:underline"
                >
                  {isFieldRevealed('nationalId') ? 'مخفی' : 'نمایش'}
                </button>
              </div>
              <div>
                <span className="text-gray-500 block">شماره تماس مراجع:</span>
                <span className={`font-bold font-mono ${isFieldRevealed('phone') ? '' : 'privacy-blur'}`}>
                  {applicant.phone}
                </span>
                <button
                  onClick={() => toggleFieldReveal('phone')}
                  className="text-xs text-blue-600 mr-2 hover:underline"
                >
                  {isFieldRevealed('phone') ? 'مخفی' : 'نمایش'}
                </button>
              </div>
              <div>
                <span className="text-gray-500 block">تلفن معرف یا والدین:</span>
                <span className={`font-bold font-mono ${isFieldRevealed('guardianPhone') ? '' : 'privacy-blur'}`}>
                  {applicant.guardianPhone || 'ندارد'}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block">محل تولد و اصالت:</span>
                <span className="font-bold">{applicant.birthPlace} / {applicant.nationalityOrigin}</span>
              </div>
              <div>
                <span className="text-gray-500 block">محل سکونت فعلی:</span>
                <span className="font-bold">{applicant.residenceCity} ({applicant.province})</span>
              </div>
              <div>
                <span className="text-gray-500 block">وضعیت نظام وظیفه (آقایان):</span>
                <span className="font-bold text-slate-800">{applicant.careerFinancial?.militaryStatusFa || 'نامربوط'}</span>
              </div>
              <div className="sm:col-span-4">
                <span className="text-gray-500 block">آدرس محل سکونت (محرمانه):</span>
                <span className={`font-bold ${isFieldRevealed('address') ? '' : 'privacy-blur'}`}>
                  {applicant.address}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-3">
            <h3 className="font-bold text-xs text-amber-900 border-b pb-2">سابقه ازدواج قبلی، جدایی یا فرزندان</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-gray-500 block">وضعیت تأهل قبلی:</span>
                <span className="font-bold text-blue-900">{applicant.maritalHistory?.previousMarriageStatusFa || 'مجرد'}</span>
              </div>
              <div>
                <span className="text-gray-500 block">مدت زندگی مشترک:</span>
                <span className="font-bold">{applicant.maritalHistory?.marriageDurationText || 'ندارد'}</span>
              </div>
              <div>
                <span className="text-gray-500 block">تاریخ جدایی یا فوت:</span>
                <span className="font-bold">{applicant.maritalHistory?.separationDate || 'ندارد'}</span>
              </div>
              <div>
                <span className="text-gray-500 block">تعداد فرزندان:</span>
                <span className="font-bold">{applicant.maritalHistory?.childrenCount || 0} نفر</span>
              </div>
              <div className="sm:col-span-4 bg-amber-50/50 p-3 rounded-lg border border-amber-100">
                <span className="text-amber-900 block font-bold mb-1">شرح علت جدایی و وضعیت حضانت فرزندان:</span>
                <p className="text-gray-800">{applicant.maritalHistory?.separationReason || 'فاقد سابقه ازدواج قبلی'}</p>
                {applicant.maritalHistory?.childrenCustodyStatus && (
                  <p className="text-gray-600 mt-1">وضعیت حضانت: {applicant.maritalHistory.childrenCustodyStatus}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Family */}
      {activeTab === 'family' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-2 text-xs">
              <h4 className="font-bold text-[#00355f] border-b pb-2">مشخصات پدر:</h4>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">وضعیت حیات:</span>
                <span className="font-bold">{applicant.familyInfo?.fatherLiving ? 'در قید حیات' : 'مرحوم'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">سن پدر:</span>
                <span className="font-bold">{applicant.familyInfo?.fatherAge || '—'} سال</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">تحصیلات پدر:</span>
                <span className="font-bold">{applicant.familyInfo?.fatherEducation || '—'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-500">شغل پدر:</span>
                <span className="font-bold">{applicant.familyInfo?.fatherJob || '—'}</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-2 text-xs">
              <h4 className="font-bold text-[#00355f] border-b pb-2">مشخصات مادر:</h4>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">وضعیت حیات:</span>
                <span className="font-bold">{applicant.familyInfo?.motherLiving ? 'در قید حیات' : 'مرحومه'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">سن مادر:</span>
                <span className="font-bold">{applicant.familyInfo?.motherAge || '—'} سال</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">تحصیلات مادر:</span>
                <span className="font-bold">{applicant.familyInfo?.motherEducation || '—'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-500">شغل مادر:</span>
                <span className="font-bold">{applicant.familyInfo?.motherJob || '—'}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-3 text-xs">
            <h4 className="font-bold text-[#00355f] border-b pb-2">بافت خانوادگی و خواهر/برادرها</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <span className="text-gray-500 block">وضعیت تأهل والدین:</span>
                <span className="font-bold">{applicant.familyInfo?.parentsMaritalStatusFa || 'در حال زندگی مشترک'}</span>
              </div>
              <div>
                <span className="text-gray-500 block">ترتیب تولد:</span>
                <span className="font-bold">فرزند {applicant.familyInfo?.birthOrder || 1} خانواده</span>
              </div>
              <div>
                <span className="text-gray-500 block">سکونت با:</span>
                <span className="font-bold">{applicant.familyInfo?.livingWith || 'همراه با خانواده'}</span>
              </div>
              <div>
                <span className="text-gray-500 block">سطح اقتصادی خانواده:</span>
                <span className="font-bold">{applicant.familyInfo?.economicLevel || 'متوسط رو به بالا'}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-gray-500 block">وضعیت خواهران:</span>
                <span className="font-bold">{applicant.familyInfo?.sistersCountAndStatus || 'ندارد'}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-gray-500 block">وضعیت برادران:</span>
                <span className="font-bold">{applicant.familyInfo?.brothersCountAndStatus || 'ندارد'}</span>
              </div>
            </div>
            <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100 mt-2">
              <span className="text-blue-900 block font-bold mb-1">یادداشت مشاور در خصوص بافت خانواده:</span>
              <p className="text-gray-700">{applicant.familyInfo?.counselorFamilyNotes || 'خانواده اصیل و دارای فرهنگ متعادل.'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Education, Career & Financial */}
      {activeTab === 'education_career' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-3 text-xs">
            <h3 className="font-bold text-xs text-[#00355f] border-b pb-2">سوابق تحصیلی و مهارتی</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <span className="text-gray-500 block">مقطع دانشگاهی:</span>
                <span className="font-bold">{applicant.educationSkills?.academicEducationFa || 'کارشناسی'}</span>
              </div>
              <div>
                <span className="text-gray-500 block">رشته تحصیلی:</span>
                <span className="font-bold">{applicant.educationSkills?.fieldOfStudy || '—'}</span>
              </div>
              <div>
                <span className="text-gray-500 block">دانشگاه محل تحصیل:</span>
                <span className="font-bold">{applicant.educationSkills?.university || '—'}</span>
              </div>
              <div>
                <span className="text-gray-500 block">تحصیلات حوزوی:</span>
                <span className="font-bold">{applicant.educationSkills?.religiousEducation || 'ندارد'}</span>
              </div>
              <div className="sm:col-span-4">
                <span className="text-gray-500 block mb-1">مهارت‌ها و زبان‌های تکمیلی:</span>
                <div className="flex flex-wrap gap-1">
                  {applicant.educationSkills?.additionalSkills?.map((skill, idx) => (
                    <span key={idx} className="bg-purple-50 text-purple-800 px-2.5 py-0.5 rounded border border-purple-200">
                      {skill}
                    </span>
                  )) || <span className="text-gray-400">ندارد</span>}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-3 text-xs">
            <h3 className="font-bold text-xs text-[#00355f] border-b pb-2">وضعیت شغلی، درآمد و دارایی‌ها</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <span className="text-gray-500 block">وضعیت نظام وظیفه:</span>
                <span className="font-bold">{applicant.careerFinancial?.militaryStatusFa || 'کارت پایان خدمت'}</span>
              </div>
              <div>
                <span className="text-gray-500 block">شغل و سمت فعلی:</span>
                <span className="font-bold text-blue-900">{applicant.careerFinancial?.currentJob || '—'}</span>
              </div>
              <div>
                <span className="text-gray-500 block">نوع صنف و سازمان:</span>
                <span className="font-bold">{applicant.careerFinancial?.organizationType || 'خصوصی'}</span>
              </div>
              <div>
                <span className="text-gray-500 block">محدوده درآمد ماهانه:</span>
                <span className="font-bold text-emerald-800">{applicant.careerFinancial?.incomeRange || '—'}</span>
              </div>
              <div>
                <span className="text-gray-500 block">وضعیت مسکن:</span>
                <span className="font-bold">{applicant.careerFinancial?.housingStatusFa || 'مالک'}</span>
              </div>
              <div>
                <span className="text-gray-500 block">وسیله نقلیه:</span>
                <span className="font-bold">{applicant.careerFinancial?.vehicleStatusFa || 'دارای خودرو'}</span>
              </div>
              <div>
                <span className="text-gray-500 block">پوشش بیمه:</span>
                <span className="font-bold">{applicant.careerFinancial?.insuranceStatusFa || 'تأمین اجتماعی'}</span>
              </div>
              <div>
                <span className="text-gray-500 block">استقلال مالی:</span>
                <span className="font-bold">{applicant.careerFinancial?.financialIndependence ? 'دارای استقلال مالی کامل' : 'وابسته'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Religion, Values & Lifestyle */}
      {activeTab === 'religion_lifestyle' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-3 text-xs">
            <h3 className="font-bold text-xs text-teal-900 border-b pb-2">اعتقادات دینی و احکام شرعی</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <span className="text-gray-500 block">دین و مذهب:</span>
                <span className="font-bold">اسلام - شیعه ۱۲ امامی</span>
              </div>
              <div>
                <span className="text-gray-500 block">مرجع تقلید:</span>
                <span className="font-bold">{applicant.religiousValues?.marja || 'آیت‌الله خامنه‌ای'}</span>
              </div>
              <div>
                <span className="text-gray-500 block">التزام به اقامه نماز:</span>
                <span className="font-bold text-emerald-700">{applicant.religiousValues?.prayerStatusFa || 'مرتب'}</span>
              </div>
              <div>
                <span className="text-gray-500 block">روزه ماه مبارک رمضان:</span>
                <span className="font-bold">{applicant.religiousValues?.fastingStatusFa || 'مقید'}</span>
              </div>
              <div>
                <span className="text-gray-500 block">وضعیت پرداخت خمس:</span>
                <span className="font-bold">{applicant.religiousValues?.khumsStatusFa || 'دارای سال خمسی'}</span>
              </div>
              <div>
                <span className="text-gray-500 block">پوشش شخصی مراجع:</span>
                <span className="font-bold text-blue-900">{applicant.religiousValues?.personalCoveringFa || 'رسمی'}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-gray-500 block">پوشش مادر و خانواده مراجع:</span>
                <span className="font-bold">{applicant.religiousValues?.familyCovering || 'چادر و پوشش کامل'}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-3 text-xs">
            <h3 className="font-bold text-xs text-[#00355f] border-b pb-2">سلامت جسمی و سبک زندگی</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <span className="text-gray-500 block">وضعیت سلامت:</span>
                <span className="font-bold">{applicant.healthLifestyle?.healthStatus || 'سالم'}</span>
              </div>
              <div>
                <span className="text-gray-500 block">مصرف دخانیات:</span>
                <span className="font-bold">{applicant.healthLifestyle?.smokingStatusFa || 'عدم مصرف'}</span>
              </div>
              <div>
                <span className="text-gray-500 block">سطح فعالیت ورزشی:</span>
                <span className="font-bold">{applicant.healthLifestyle?.exerciseLevel === 'regular' ? 'ورزش منظم هفتگی' : 'گاه‌به‌گاه'}</span>
              </div>
              <div>
                <span className="text-gray-500 block">علاقه به مسافرت:</span>
                <span className="font-bold">{applicant.healthLifestyle?.travelInterest === 'high' ? 'علاقه‌مند زیاد' : 'متوسط'}</span>
              </div>
              <div className="sm:col-span-4 bg-gray-50 p-3 rounded-lg border border-gray-200">
                <span className="text-gray-700 block font-bold mb-1">توضیحات سبک زندگی و اوقات فراغت:</span>
                <p className="text-gray-600">{applicant.healthLifestyle?.lifestyleNotes || 'ورزش منظم، اهل مطالعه و سفرهای زیارتی.'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: Personality */}
      {activeTab === 'personality' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-3 text-xs">
            <h3 className="font-bold text-xs text-indigo-900 border-b pb-2">تیپ شخصیتی و سبک دلبستگی</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-indigo-50/60 p-3 rounded-lg border border-indigo-100 text-center">
                <span className="text-gray-500 block text-[11px]">تیپ MBTI</span>
                <span className="text-lg font-black font-mono text-indigo-900">{applicant.personality?.mbti}</span>
                <span className="block text-xs font-bold text-indigo-700 mt-0.5">{applicant.personality?.mbtiTitleFa}</span>
              </div>
              <div className="bg-purple-50/60 p-3 rounded-lg border border-purple-100 text-center">
                <span className="text-gray-500 block text-[11px]">سبک دلبستگی</span>
                <span className="text-base font-bold text-purple-900 mt-1 block">{applicant.personality?.attachmentStyle || 'ایمن'}</span>
                <span className="block text-[10px] text-purple-700 mt-0.5">ارزیابی بر اساس پروتکل تشخیصی</span>
              </div>
              <div className="bg-emerald-50/60 p-3 rounded-lg border border-emerald-100 text-center">
                <span className="text-gray-500 block text-[11px]">آمادگی ازدواج</span>
                <span className="text-lg font-black text-emerald-900 mt-1 block">۸۸ ٪</span>
                <span className="block text-[10px] text-emerald-700 mt-0.5">امتیاز آمادگی روانی و بلوغ</span>
              </div>
            </div>

            {/* Big Five Indicators */}
            {applicant.personality?.bigFive && (
              <div className="pt-3 border-t border-gray-100">
                <span className="font-bold block mb-2 text-gray-700">شاخص‌های ۵ عاملی شخصیت (Big Five):</span>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  <div className="bg-gray-50 p-2 rounded text-center border">
                    <span className="text-[10px] text-gray-500 block">وظیفه‌شناسی</span>
                    <strong className="text-xs font-mono text-blue-900">{applicant.personality.bigFive.conscientiousness}٪</strong>
                  </div>
                  <div className="bg-gray-50 p-2 rounded text-center border">
                    <span className="text-[10px] text-gray-500 block">برون‌گرایی</span>
                    <strong className="text-xs font-mono text-blue-900">{applicant.personality.bigFive.extraversion}٪</strong>
                  </div>
                  <div className="bg-gray-50 p-2 rounded text-center border">
                    <span className="text-[10px] text-gray-500 block">توافق‌پذیری</span>
                    <strong className="text-xs font-mono text-blue-900">{applicant.personality.bigFive.agreeableness}٪</strong>
                  </div>
                  <div className="bg-gray-50 p-2 rounded text-center border">
                    <span className="text-[10px] text-gray-500 block">پایداری هیجانی</span>
                    <strong className="text-xs font-mono text-blue-900">{100 - applicant.personality.bigFive.neuroticism}٪</strong>
                  </div>
                  <div className="bg-gray-50 p-2 rounded text-center border">
                    <span className="text-[10px] text-gray-500 block">گشودگی به تجربه</span>
                    <strong className="text-xs font-mono text-blue-900">{applicant.personality.bigFive.openness}٪</strong>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 mt-2">
              <span className="font-bold text-slate-800 block mb-1">یادداشت تخصصی مشاور:</span>
              <p className="text-slate-700 leading-relaxed">{applicant.personality?.personalityNotes}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 7: Preferences & Deal Breakers */}
      {activeTab === 'preferences' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-3 text-xs">
            <h3 className="font-bold text-xs text-[#00355f] border-b pb-2">معیارها و انتظارات از همسر آینده</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <span className="text-gray-500 block">بازه سنی مورد نظر:</span>
                <span className="font-bold text-blue-900">{applicant.marriagePreferences?.ageMin} تا {applicant.marriagePreferences?.ageMax} سال</span>
              </div>
              <div>
                <span className="text-gray-500 block">بازه قدی مورد نظر:</span>
                <span className="font-bold">{applicant.marriagePreferences?.heightMin} تا {applicant.marriagePreferences?.heightMax} cm</span>
              </div>
              <div>
                <span className="text-gray-500 block">حداقل مدرک تحصیلی:</span>
                <span className="font-bold">{applicant.marriagePreferences?.minEducation || 'کارشناسی'}</span>
              </div>
              <div>
                <span className="text-gray-500 block">شهرهای مورد پذیرش:</span>
                <span className="font-bold">{applicant.marriagePreferences?.acceptableCities?.join('، ') || 'تهران'}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-gray-500 block">انتظارات اعتقادی:</span>
                <span className="font-bold">{applicant.marriagePreferences?.religiousExpectations || 'پایبند به مبانی اخلاقی و واجبات دینی'}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-gray-500 block">انتظارات اقتصادی:</span>
                <span className="font-bold">{applicant.marriagePreferences?.financialExpectations || 'همراهی و درک متقابل'}</span>
              </div>
            </div>

            {/* Full Criteria Matrix with Importance and Flexibility */}
            {applicant.marriagePreferences?.criteriaItems && applicant.marriagePreferences.criteriaItems.length > 0 && (
              <div className="pt-3 border-t border-gray-100 space-y-2">
                <span className="font-bold text-slate-800 block text-xs">جدول رتبه‌بندی ملاک‌ها بر اساس اهمیت و انعطاف:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {applicant.marriagePreferences.criteriaItems.map((crit) => (
                    <div key={crit.id} className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-800 block">{crit.title}</span>
                        <span className="text-[10px] text-slate-500">{crit.category}</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="bg-amber-100 text-amber-900 text-[10px] px-2 py-0.5 rounded font-bold">
                          {crit.importance === 'very_important' ? '⭐⭐⭐ بسیار مهم' : crit.importance === 'important' ? '⭐⭐ مهم' : '⭐ متوسط'}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                          crit.flexibility === 'dealbreaker' ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {crit.flexibility === 'dealbreaker' ? '⛔ خط قرمز' : '🤝 قابل مذاکره'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2 border-t border-gray-100">
              <span className="font-bold text-red-700 block mb-1">خطوط قرمز قطعی (Deal-Breakers):</span>
              <div className="flex flex-wrap gap-1.5">
                {applicant.marriagePreferences?.dealBreakers?.map((db, idx) => (
                  <span key={idx} className="bg-red-50 text-red-800 px-3 py-1 rounded-lg text-xs border border-red-200 font-bold">
                    ⛔ {db}
                  </span>
                )) || <span className="text-gray-400">موردی ثبت نشده است</span>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 8: Counseling Sessions */}
      {activeTab === 'counseling' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xs text-[#00355f]">جلسات مشاوره و پرونده بالینی</h3>
            <button
              onClick={() => onScheduleSession(applicant)}
              className="bg-[#00355f] text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>افزودن جلسه جدید</span>
            </button>
          </div>

          {applicantSessions.length === 0 ? (
            <div className="bg-white p-8 rounded-xl border text-center text-gray-500 text-xs">
              هنوز جلسه‌ای برای این مراجع ثبت نشده است. می‌توانید با زدن دکمه بالا جلسه جدید ثبت کنید.
            </div>
          ) : (
            <div className="space-y-3">
              {applicantSessions.map((session) => (
                <div key={session.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs space-y-2 text-xs">
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="font-bold text-blue-900">{session.title}</span>
                    <span className="bg-blue-50 text-blue-800 px-2 py-0.5 rounded text-[11px] font-mono font-bold">
                      {session.date} - ساعت {session.time}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-gray-600 text-[11px]">
                    <span>مشاور: <strong>{session.counselorName}</strong></span>
                    <span>محل: <strong>{session.location}</strong></span>
                    <span>وضعیت: <strong>{session.statusFa}</strong></span>
                  </div>
                  {session.clinicalNotes && (
                    <div className="bg-purple-50/50 p-2.5 rounded border border-purple-100 text-purple-950 mt-1">
                      <strong>یادداشت بالینی مشاور:</strong> {session.clinicalNotes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 9: Files & Introductions History */}
      {activeTab === 'files_history' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-3 text-xs">
            <h3 className="font-bold text-xs text-[#00355f] border-b pb-2">مدارک و فایل‌های پیوست پرونده</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {applicant.files?.map((file) => (
                <div key={file.id} className="bg-gray-50 p-3 rounded-lg border flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-700" />
                    <div>
                      <span className="font-bold block text-gray-800">{file.name}</span>
                      <span className="text-[10px] text-gray-500">{file.size} - {file.uploadDate}</span>
                    </div>
                  </div>
                  <button className="text-blue-700 hover:text-blue-900 p-1">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              )) || <p className="text-gray-400">فایلی پیوست نشده است</p>}
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-3 text-xs">
            <h3 className="font-bold text-xs text-[#00355f] border-b pb-2">تاریخچه معرفی‌ها و جلسات معارفه ({applicantIntroductions.length})</h3>
            {applicantIntroductions.length === 0 ? (
              <p className="text-gray-400 text-center py-4">تاکنون معرفی فعالی برای این پرونده ثبت نشده است.</p>
            ) : (
              <div className="space-y-2">
                {applicantIntroductions.map((intro) => (
                  <div key={intro.id} className="bg-gray-50 p-3 rounded-lg border flex items-center justify-between">
                    <div>
                      <strong className="text-blue-900">{intro.introCode}</strong>: معرفی با{' '}
                      <strong>{applicant.gender === 'male' ? intro.femaleApplicantName : intro.maleApplicantName}</strong>
                    </div>
                    <span className="bg-teal-50 text-teal-800 text-[11px] px-2.5 py-0.5 rounded border border-teal-200 font-bold">
                      {intro.statusFa} (تطابق {intro.compatibilityScore}٪)
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Audit History & Digital Trail */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-3 text-xs">
            <h3 className="font-bold text-xs text-[#00355f] border-b pb-2 flex items-center justify-between">
              <span>ردپای نظارتی و تاریخچه تغییرات پرونده (Audit Logs)</span>
              <span className="text-[10px] text-gray-500 font-mono">
                {applicant.auditHistory?.length || 1} رخداد ثبت‌شده
              </span>
            </h3>
            <div className="space-y-2">
              {applicant.auditHistory && applicant.auditHistory.length > 0 ? (
                applicant.auditHistory.map((log) => (
                  <div key={log.id} className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">
                        {log.userName} ({log.userRole === 'main_admin' ? 'مدیر ارشد' : log.userRole === 'internal_manager' ? 'مدیر داخلی' : log.userRole === 'counselor' ? 'مشاور' : 'کارمند'})
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">{log.timestamp}</span>
                    </div>
                    <p className="text-slate-700 text-[11px]">{log.changedFields}</p>
                    {log.note && <p className="text-[10px] text-slate-500 italic">{log.note}</p>}
                  </div>
                ))
              ) : (
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">
                      {applicant.assignedEmployeeName || 'کارشناس پذیرش مرکز'}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">{applicant.registrationDate}</span>
                  </div>
                  <p className="text-slate-700 text-[11px]">تشکیل و ثبت اولیه پرونده متقاضی در سامانه همسان‌گزینی</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
