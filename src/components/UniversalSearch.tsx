import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Filter,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Eye,
  EyeOff,
  UserCheck,
  Sparkles,
  Lock,
  Unlock,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  SlidersHorizontal,
  FileText,
  Clock,
  Phone,
  GraduationCap,
  Briefcase,
  MapPin,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  ArrowUpDown
} from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useCRMStore } from '../services/store';
import { logActivity } from '../utils/AuditLogger';
import { Applicant, ApplicantWorkflowStatus, Gender } from '../types';

interface UniversalSearchProps {
  onSelectApplicant: (id: string) => void;
  onNavigateToMatching: (applicantId: string) => void;
  onOpenNewApplicant?: () => void;
}

type SortField = 'name' | 'code' | 'age' | 'status' | 'date';
type SortOrder = 'asc' | 'desc';

export const UniversalSearch: React.FC<UniversalSearchProps> = ({
  onSelectApplicant,
  onNavigateToMatching,
  onOpenNewApplicant,
}) => {
  const { currentUser, applicants, isGlobalUnmasked, toggleGlobalUnmask, updateApplicant } = useCRMStore();

  // Determine Privacy Role Access (Only ADMIN & COUNSELOR have full access to applicant_private)
  const normalizedRole = (currentUser?.role || '').toUpperCase();
  const hasPrivateAccess =
    normalizedRole === 'ADMIN' ||
    normalizedRole === 'MAIN_ADMIN' ||
    normalizedRole === 'COUNSELOR';

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWorkflowStatuses, setSelectedWorkflowStatuses] = useState<string[]>([
    'NEW',
    'UNDER_REVIEW',
    'READY_FOR_MATCHING',
    'INTRODUCTION',
  ]);
  const [genderFilter, setGenderFilter] = useState<Gender | 'all'>('all');
  const [cityFilter, setCityFilter] = useState<string>('all');
  const [ageRange, setAgeRange] = useState<{ min: string; max: string }>({ min: '', max: '' });
  
  // Sorting & Pagination
  const [sortField, setSortField] = useState<SortField>('code');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Selected Applicant for Private Shield Details Modal
  const [viewingPrivateApplicant, setViewingPrivateApplicant] = useState<Applicant | null>(null);
  const [privateClinicalData, setPrivateClinicalData] = useState<{ notes?: string; loading: boolean; error?: string }>({
    loading: false,
  });

  // Fetch Private Clinical Record safely obeying Privacy Shield
  const handleOpenPrivateShield = async (applicant: Applicant) => {
    if (!hasPrivateAccess) {
      alert('دسترسی به اطلاعات محرمانه پرونده بالینی نیازمند نقش مدیر ارشد (ADMIN) یا مشاور بالینی (COUNSELOR) است.');
      return;
    }

    setViewingPrivateApplicant(applicant);
    setPrivateClinicalData({ loading: true });

    try {
      // Fetch strictly from 'applicant_private' Firestore collection
      const privateDocRef = doc(db, 'applicant_private', applicant.id);
      const snapshot = await getDoc(privateDocRef);

      if (snapshot.exists()) {
        const data = snapshot.data();
        setPrivateClinicalData({
          notes: data.privateNotes || 'یادداشت‌های محرمانه مشاور ثبت نشده است.',
          loading: false,
        });
      } else {
        setPrivateClinicalData({
          notes: 'هیچ یادداشت محرمانه‌ای برای این پرونده در پایگاه داده ذخیره نشده است.',
          loading: false,
        });
      }

      // Log access attempt in audit logs
      logActivity(
        currentUser.id,
        'VIEW_PRIVATE_RECORD',
        'applicant_private',
        `مشاهده پرونده محرمانه ${applicant.firstName} ${applicant.lastName} (${applicant.caseCode})`,
        currentUser.name,
        currentUser.role
      );
    } catch (err: any) {
      console.warn('Error reading applicant_private:', err);
      setPrivateClinicalData({
        loading: false,
        error: 'خطا در بارگذاری اطلاعات محرمانه یا عدم احراز دسترسی پایگاه داده.',
      });
    }
  };

  // Status mapping
  const workflowStatusConfig: Record<
    string,
    { label: string; bg: string; text: string; border: string }
  > = {
    NEW: { label: 'ثبت اولیه', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    UNDER_REVIEW: { label: 'در حال بررسی', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
    READY_FOR_MATCHING: {
      label: 'آماده همسان‌گزینی',
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
    },
    MATCHING: {
      label: 'آماده همسان‌گزینی',
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
    },
    INTRODUCTION: { label: 'معرفی شده', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
    INTRODUCED: { label: 'معرفی شده', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
    COUNSELING: { label: 'در حال مشاوره', bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
    SUCCESSFUL: { label: 'ازدواج موفق', bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' },
    CLOSED: { label: 'بسته شده', bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-300' },
  };

  // Filter Applicants
  const filteredApplicants = useMemo(() => {
    return applicants.filter((app) => {
      // 1. Search Query: Code, Name, Phone
      if (searchTerm.trim()) {
        const q = searchTerm.trim().toLowerCase();
        const fullName = `${app.firstName} ${app.lastName}`.toLowerCase();
        const code = (app.caseCode || app.fileCode || '').toLowerCase();
        const phone = (app.phone || '').toLowerCase();
        const natId = (app.nationalId || '').toLowerCase();

        if (
          !fullName.includes(q) &&
          !code.includes(q) &&
          !phone.includes(q) &&
          !natId.includes(q)
        ) {
          return false;
        }
      }

      // 2. Workflow Status Filter (Support legacy & new workflow codes)
      if (selectedWorkflowStatuses.length > 0) {
        const appWf = app.workflowStatus || (app.status === 'active' ? 'READY_FOR_MATCHING' : app.status === 'pending' ? 'UNDER_REVIEW' : 'NEW');
        const isMatched =
          selectedWorkflowStatuses.includes(appWf) ||
          (selectedWorkflowStatuses.includes('READY_FOR_MATCHING') && appWf === 'MATCHING') ||
          (selectedWorkflowStatuses.includes('INTRODUCTION') && appWf === 'INTRODUCED');
        if (!isMatched) return false;
      }

      // 3. Gender Filter
      if (genderFilter !== 'all' && app.gender !== genderFilter) {
        return false;
      }

      // 4. City Filter
      if (cityFilter !== 'all') {
        const city = app.residenceCity || app.city || '';
        if (!city.includes(cityFilter)) return false;
      }

      // 5. Age Range
      if (ageRange.min && app.age < parseInt(ageRange.min, 10)) return false;
      if (ageRange.max && app.age > parseInt(ageRange.max, 10)) return false;

      return true;
    });
  }, [applicants, searchTerm, selectedWorkflowStatuses, genderFilter, cityFilter, ageRange]);

  // Sort Applicants
  const sortedApplicants = useMemo(() => {
    return [...filteredApplicants].sort((a, b) => {
      let valA: any;
      let valB: any;

      if (sortField === 'name') {
        valA = `${a.firstName} ${a.lastName}`;
        valB = `${b.firstName} ${b.lastName}`;
      } else if (sortField === 'age') {
        valA = a.age || 0;
        valB = b.age || 0;
      } else if (sortField === 'status') {
        valA = a.workflowStatus || a.status;
        valB = b.workflowStatus || b.status;
      } else {
        valA = a.caseCode || a.fileCode || a.id;
        valB = b.caseCode || b.fileCode || b.id;
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredApplicants, sortField, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(sortedApplicants.length / itemsPerPage) || 1;
  const paginatedApplicants = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedApplicants.slice(start, start + itemsPerPage);
  }, [sortedApplicants, currentPage, itemsPerPage]);

  const handleToggleStatus = (st: string) => {
    setSelectedWorkflowStatuses((prev) =>
      prev.includes(st) ? prev.filter((item) => item !== st) : [...prev, st]
    );
    setCurrentPage(1);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  // Mask sensitive values for staff without permissions
  const maskPhone = (phoneStr: string) => {
    if (!phoneStr) return '---';
    if (isGlobalUnmasked && hasPrivateAccess) return phoneStr;
    if (phoneStr.length >= 11) {
      return phoneStr.substring(0, 4) + '•••' + phoneStr.substring(7);
    }
    return '••••••••••';
  };

  return (
    <div className="space-y-4 text-right" dir="rtl">
      {/* Top Banner & Stats */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-amber-50 rounded-lg text-amber-700">
              <Search className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <span>جستجوی سراسری و جدول پرونده‌های مراجعین</span>
                <span className="text-[11px] bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full font-mono font-bold">
                  {applicants.length} پرونده کل | {filteredApplicants.length} نتیجه
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                کوئری سریع بر اساس کد پرونده، نام و نام خانوادگی، وضعیت فرآیند و انطباق با شیلد محرمانگی
              </p>
            </div>
          </div>
        </div>

        {/* Privacy Shield Status & Controls */}
        <div className="flex items-center gap-2 self-stretch md:self-auto justify-end">
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border font-medium ${
              hasPrivateAccess
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}
          >
            {hasPrivateAccess ? (
              <>
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>دسترسی به شیلد محرمانه: مجاز ({currentUser.roleTitle.split(' ')[0]})</span>
              </>
            ) : (
              <>
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                <span>شیلد محرمانه: فعال (محدود به مشاور و مدیر)</span>
              </>
            )}
          </div>

          <button
            onClick={toggleGlobalUnmask}
            className={`px-3 py-1.5 rounded-lg text-xs border font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
              isGlobalUnmasked
                ? 'bg-amber-600 text-white border-amber-600'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
            title="تغییر وضعیت ماسک اطلاعات هویتی"
          >
            {isGlobalUnmasked ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>{isGlobalUnmasked ? 'اطلاعات آشکار' : 'ماسک فعال'}</span>
          </button>
        </div>
      </div>

      {/* Query Bar & Filters Section */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3.5">
        {/* Row 1: Instant Search Field & Status Chips */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Main Search Input (5 Cols) */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="جستجو فوری: کد پرونده (#PR-102)، نام، نام خانوادگی یا تلفن..."
              className="w-full pr-9 pl-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:border-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-200 transition-all"
            />
          </div>

          {/* Status Quick Filter Chips (7 Cols) */}
          <div className="md:col-span-7 flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-500 ml-1">وضعیت:</span>
            {[
              { id: 'NEW', label: 'ثبت اولیه (NEW)' },
              { id: 'UNDER_REVIEW', label: 'در حال بررسی (UNDER_REVIEW)' },
              { id: 'READY_FOR_MATCHING', label: 'آماده همسان‌گزینی (READY_FOR_MATCHING)' },
              { id: 'INTRODUCTION', label: 'معرفی شده (INTRODUCTION)' },
            ].map((st) => {
              const isSelected = selectedWorkflowStatuses.includes(st.id);
              return (
                <button
                  key={st.id}
                  onClick={() => handleToggleStatus(st.id)}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {st.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Row 2: Gender, City, Age Range Filters */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 text-xs">
          {/* Gender */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">جنسیت:</span>
            <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
              {(['all', 'male', 'female'] as const).map((g) => (
                <button
                  key={g}
                  onClick={() => {
                    setGenderFilter(g);
                    setCurrentPage(1);
                  }}
                  className={`px-2.5 py-0.5 rounded text-[11px] font-semibold transition-all ${
                    genderFilter === g
                      ? 'bg-white text-slate-800 shadow-xs border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {g === 'all' ? 'همه' : g === 'male' ? 'آقایان' : 'خانم‌ها'}
                </button>
              ))}
            </div>
          </div>

          {/* City */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">شهر:</span>
            <select
              value={cityFilter}
              onChange={(e) => {
                setCityFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-xs text-slate-700 outline-none"
            >
              <option value="all">همه شهرها</option>
              <option value="تهران">تهران</option>
              <option value="قم">قم</option>
              <option value="مشهد">مشهد</option>
              <option value="اصفهان">اصفهان</option>
              <option value="شیراز">شیراز</option>
              <option value="یزد">یزد</option>
            </select>
          </div>

          {/* Age Range */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">بازه سنی:</span>
            <input
              type="number"
              value={ageRange.min}
              onChange={(e) => {
                setAgeRange((p) => ({ ...p, min: e.target.value }));
                setCurrentPage(1);
              }}
              placeholder="از"
              className="w-12 px-1.5 py-1 text-center border border-slate-200 rounded-md bg-white text-xs"
            />
            <span className="text-slate-400">تا</span>
            <input
              type="number"
              value={ageRange.max}
              onChange={(e) => {
                setAgeRange((p) => ({ ...p, max: e.target.value }));
                setCurrentPage(1);
              }}
              placeholder="تا"
              className="w-12 px-1.5 py-1 text-center border border-slate-200 rounded-md bg-white text-xs"
            />
            <span className="text-slate-400 text-[10px]">سال</span>
          </div>

          {/* Clear Filters */}
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedWorkflowStatuses(['NEW', 'UNDER_REVIEW', 'READY_FOR_MATCHING', 'INTRODUCTION']);
              setGenderFilter('all');
              setCityFilter('all');
              setAgeRange({ min: '', max: '' });
              setCurrentPage(1);
            }}
            className="mr-auto text-[11px] text-amber-700 hover:underline font-semibold"
          >
            پاکسازی فیلترها
          </button>
        </div>
      </div>

      {/* Results Query Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 text-xs font-bold select-none">
                <th
                  onClick={() => handleSort('code')}
                  className="py-3 px-3.5 cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>کد پرونده</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('name')}
                  className="py-3 px-3.5 cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>متقاضی</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('age')}
                  className="py-3 px-3.5 cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>سن / تولد</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-3.5">تحصیلات و شغل</th>
                <th className="py-3 px-3.5">شهر سکونت</th>
                <th className="py-3 px-3.5">تماس (محرمانگی)</th>
                <th
                  onClick={() => handleSort('status')}
                  className="py-3 px-3.5 cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>وضعیت فرآیند</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-3.5 text-center">شیلد بالینی</th>
                <th className="py-3 px-3.5 text-center">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {paginatedApplicants.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                    <span>هیچ پرونده‌ای با مشخصات و فیلترهای جستجو شده یافت نشد.</span>
                  </td>
                </tr>
              ) : (
                paginatedApplicants.map((applicant) => {
                  const wfStatusKey = applicant.workflowStatus || (applicant.status === 'active' ? 'READY_FOR_MATCHING' : 'NEW');
                  const badge = workflowStatusConfig[wfStatusKey] || workflowStatusConfig['NEW'];
                  const jobName =
                    applicant.careerFinancial?.currentJob ||
                    applicant.educationJob?.jobTitle ||
                    applicant.educationJob?.occupation ||
                    'نامشخص';
                  const educationLevel =
                    applicant.educationSkills?.academicEducation ||
                    applicant.educationJob?.educationLevel ||
                    '---';

                  return (
                    <tr
                      key={applicant.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Case Code */}
                      <td className="py-3 px-3.5 font-mono font-bold text-amber-800">
                        {applicant.caseCode || applicant.fileCode || `#PR-${applicant.id.substring(0, 5)}`}
                      </td>

                      {/* Name & Avatar */}
                      <td className="py-3 px-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="relative">
                            {applicant.photoUrl ? (
                              <img
                                src={applicant.photoUrl}
                                alt={applicant.firstName}
                                className="w-8 h-8 rounded-full object-cover border border-slate-200"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs">
                                {applicant.firstName.charAt(0)}
                              </div>
                            )}
                            <span
                              className={`absolute -bottom-0.5 -left-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${
                                applicant.gender === 'male' ? 'bg-blue-500' : 'bg-rose-500'
                              }`}
                            />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
                              {applicant.firstName} {applicant.lastName}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {applicant.gender === 'male' ? 'آقا' : 'خانم'} • {applicant.maritalHistory === 'never_married' ? 'مجرد' : 'سابقه ازدواج'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Age */}
                      <td className="py-3 px-3.5">
                        <div className="font-semibold text-slate-800">{applicant.age} سال</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          متولد {applicant.birthYear || '---'}
                        </div>
                      </td>

                      {/* Education & Job */}
                      <td className="py-3 px-3.5">
                        <div className="font-medium text-slate-800">{jobName}</div>
                        <div className="text-[10px] text-slate-500">{educationLevel}</div>
                      </td>

                      {/* City */}
                      <td className="py-3 px-3.5">
                        <div className="flex items-center gap-1 text-slate-700">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{applicant.residenceCity || applicant.city || 'تهران'}</span>
                        </div>
                      </td>

                      {/* Phone with Privacy Masking */}
                      <td className="py-3 px-3.5 font-mono text-slate-600">
                        {maskPhone(applicant.phone)}
                      </td>

                      {/* Status Badge */}
                      <td className="py-3 px-3.5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border ${badge.bg} ${badge.text} ${badge.border}`}
                        >
                          {badge.label}
                        </span>
                      </td>

                      {/* Privacy Shield Button (Obeying RBAC) */}
                      <td className="py-3 px-3.5 text-center">
                        <button
                          onClick={() => handleOpenPrivateShield(applicant)}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            hasPrivateAccess
                              ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                              : 'text-slate-400 bg-slate-100 hover:bg-slate-200 cursor-not-allowed opacity-60'
                          }`}
                          title={
                            hasPrivateAccess
                              ? 'مشاهده یادداشت‌های بالینی محرمانه (مجاز)'
                              : 'محرمانه - فقط مشاور و مدیر کل'
                          }
                        >
                          {hasPrivateAccess ? (
                            <Unlock className="w-3.5 h-3.5" />
                          ) : (
                            <Lock className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3 px-3.5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onSelectApplicant(applicant.id)}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-medium transition-colors cursor-pointer"
                          >
                            پرونده
                          </button>
                          <button
                            onClick={() => onNavigateToMatching(applicant.id)}
                            className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded text-[11px] font-bold transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Sparkles className="w-3 h-3" />
                            <span>تطابق</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <div>
            صفحه <span className="font-bold text-slate-800">{currentPage}</span> از{' '}
            <span className="font-bold text-slate-800">{totalPages}</span> (نمایش{' '}
            {paginatedApplicants.length} از {filteredApplicants.length} پرونده)
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Private Clinical Modal (Strict Privacy Shield View) */}
      {viewingPrivateApplicant && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full p-5 space-y-4 text-right animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
                  <ShieldCheck className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">
                    پرونده بالینی و محرمانه: {viewingPrivateApplicant.firstName}{' '}
                    {viewingPrivateApplicant.lastName}
                  </h3>
                  <span className="text-[10px] text-slate-400 font-mono">
                    کد: {viewingPrivateApplicant.caseCode} | پایگاه داده: applicant_private
                  </span>
                </div>
              </div>
              <button
                onClick={() => setViewingPrivateApplicant(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200/80 text-xs leading-relaxed space-y-2">
              <div className="text-[11px] font-bold text-amber-800 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                <span>یادداشت‌های اختصاصی مشاور و روانشناس مرکز:</span>
              </div>

              {privateClinicalData.loading ? (
                <div className="py-6 text-center text-slate-400 flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-amber-600" />
                  <span>در حال بازخوانی از پایگاه داده Firestore...</span>
                </div>
              ) : (
                <p className="text-slate-700 whitespace-pre-wrap">
                  {privateClinicalData.notes}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[10px] text-slate-400">
                ثبت لاگ امنیتی در collection: audit_logs انجام شد
              </span>
              <button
                onClick={() => setViewingPrivateApplicant(null)}
                className="px-4 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-semibold hover:bg-slate-900 transition-colors"
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
