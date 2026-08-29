import React, { useState, useMemo } from 'react';
import {
  Search,
  SlidersHorizontal,
  Plus,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Eye,
  EyeOff,
  Filter,
  RotateCcw,
  CheckCircle2,
  Clock,
  UserCheck,
  Building,
  GraduationCap,
} from 'lucide-react';
import { useCRMStore } from '../services/store';
import { Applicant, ApplicantStatus, Gender } from '../types';

interface ApplicantListViewProps {
  onSelectApplicant: (id: string) => void;
  onOpenNewApplicant: () => void;
  onNavigateToMatching: (applicantId: string) => void;
  initialSearch?: string;
}

export const ApplicantListView: React.FC<ApplicantListViewProps> = ({
  onSelectApplicant,
  onOpenNewApplicant,
  onNavigateToMatching,
  initialSearch = '',
}) => {
  const { applicants, isGlobalUnmasked, toggleGlobalUnmask } = useCRMStore();

  // Filters State
  const [search, setSearch] = useState(initialSearch);
  const [selectedStatuses, setSelectedStatuses] = useState<ApplicantStatus[]>(['active', 'pending', 'introduced']);
  const [ageMin, setAgeMin] = useState<string>('');
  const [ageMax, setAgeMax] = useState<string>('');
  const [selectedEducation, setSelectedEducation] = useState<string>('');
  const [mbtiFilter, setMbtiFilter] = useState<string>('');
  const [genderFilter, setGenderFilter] = useState<Gender | 'all'>('all');
  const [cityFilter, setCityFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const handleToggleStatus = (status: ApplicantStatus) => {
    setSelectedStatuses((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearch('');
    setSelectedStatuses(['active', 'pending', 'introduced']);
    setAgeMin('');
    setAgeMax('');
    setSelectedEducation('');
    setMbtiFilter('');
    setGenderFilter('all');
    setCityFilter('');
    setCurrentPage(1);
  };

  // Filtered applicants calculation
  const filteredApplicants = useMemo(() => {
    return applicants.filter((app) => {
      // Search
      if (search.trim()) {
        const query = search.toLowerCase();
        const fullName = `${app.firstName} ${app.lastName}`.toLowerCase();
        const code = (app.caseCode || app.fileCode || '').toLowerCase();
        const nationalId = (app.nationalId || '').toLowerCase();
        const job = (app.careerFinancial?.currentJob || app.educationJob?.jobTitle || app.educationJob?.occupation || '').toLowerCase();
        const field = (app.educationSkills?.fieldOfStudy || app.educationJob?.fieldOfStudy || '').toLowerCase();
        const city = (app.residenceCity || app.city || '').toLowerCase();

        if (
          !fullName.includes(query) &&
          !code.includes(query) &&
          !nationalId.includes(query) &&
          !job.includes(query) &&
          !field.includes(query) &&
          !city.includes(query)
        ) {
          return false;
        }
      }

      // Status
      if (selectedStatuses.length > 0 && !selectedStatuses.includes(app.status)) {
        return false;
      }

      // Gender
      if (genderFilter !== 'all' && app.gender !== genderFilter) {
        return false;
      }

      // Age Range
      if (ageMin && app.age < parseInt(ageMin)) {
        return false;
      }
      if (ageMax && app.age > parseInt(ageMax)) {
        return false;
      }

      // Education
      if (selectedEducation) {
        const edu = app.educationSkills?.academicEducation || app.educationJob?.educationLevel;
        if (edu !== selectedEducation) {
          return false;
        }
      }

      // MBTI
      if (mbtiFilter.trim()) {
        const mbtiVal = app.personality?.mbti || '';
        if (!mbtiVal.toLowerCase().includes(mbtiFilter.trim().toLowerCase())) {
          return false;
        }
      }

      // City
      if (cityFilter) {
        const c = app.residenceCity || app.city;
        if (c !== cityFilter) {
          return false;
        }
      }

      return true;
    });
  }, [
    applicants,
    search,
    selectedStatuses,
    genderFilter,
    ageMin,
    ageMax,
    selectedEducation,
    mbtiFilter,
    cityFilter,
  ]);

  const totalPages = Math.ceil(filteredApplicants.length / itemsPerPage) || 1;
  const paginatedApplicants = filteredApplicants.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-4 pb-6 text-right">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-3.5 rounded-lg border border-gray-200 shadow-xs">
        <div>
          <h2 className="text-sm md:text-base font-bold text-slate-800 flex items-center gap-2">
            <span>بانک اطلاعات متقاضیان و مراجعین</span>
            <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-bold">
              {filteredApplicants.length} پرونده
            </span>
          </h2>
          <p className="text-[11px] text-gray-500 mt-0.5">
            فهرست متقاضیان فعال، در انتظار و معرفی شده در سامانه همسان‌گزینی الزهرا
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Quick Search */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="جستجو نام، کد پرونده، شغل..."
              className="w-full pr-8 pl-3 py-1.5 bg-gray-50 border border-gray-200 rounded text-xs text-slate-800 focus:border-amber-600 focus:bg-white outline-none"
            />
          </div>

          <button
            onClick={onOpenNewApplicant}
            className="bg-amber-600 text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-amber-700 transition-colors flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>ثبت متقاضی</span>
          </button>
        </div>
      </div>

      {/* Main Layout: Filter Sidebar + Table Canvas */}
      <div className="flex flex-col lg:flex-row gap-4 items-start">
        {/* Advanced Filters Sidebar (w-64 on desktop) */}
        <aside className="w-full lg:w-64 bg-white rounded-lg border border-gray-200 p-3.5 shrink-0 shadow-xs">
          <div className="flex justify-between items-center mb-3 border-b border-gray-100 pb-2">
            <button
              onClick={handleClearFilters}
              className="text-[10px] font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              پاکسازی
            </button>
            <h3 className="text-xs font-bold flex items-center gap-1 text-slate-800">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-600" />
              <span>فیلترهای پرونده</span>
            </h3>
          </div>

          <div className="space-y-3.5 text-right text-xs">
            {/* Status Filter */}
            <div>
              <label className="text-[11px] font-bold text-slate-700 mb-1.5 block">وضعیت پرونده</label>
              <div className="flex flex-wrap gap-1">
                {[
                  { id: 'active', label: 'فعال', activeClass: 'bg-indigo-900 text-white' },
                  { id: 'pending', label: 'در انتظار', activeClass: 'bg-amber-600 text-white' },
                  { id: 'introduced', label: 'معرفی شده', activeClass: 'bg-slate-700 text-white' },
                ].map((st) => {
                  const isChecked = selectedStatuses.includes(st.id as ApplicantStatus);
                  return (
                    <button
                      key={st.id}
                      onClick={() => handleToggleStatus(st.id as ApplicantStatus)}
                      className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all cursor-pointer ${
                        isChecked
                          ? `${st.activeClass} font-bold shadow-xs`
                          : 'border border-gray-200 text-gray-600 bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      {st.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Gender Filter */}
            <div>
              <label className="text-[11px] font-bold text-slate-700 mb-1 block">جنسیت</label>
              <div className="grid grid-cols-3 gap-1 bg-gray-100 p-0.5 rounded">
                {[
                  { id: 'all', label: 'همه' },
                  { id: 'male', label: 'آقایان' },
                  { id: 'female', label: 'خانم‌ها' },
                ].map((g) => (
                  <button
                    key={g.id}
                    onClick={() => {
                      setGenderFilter(g.id as any);
                      setCurrentPage(1);
                    }}
                    className={`py-1 rounded text-[10px] transition-all cursor-pointer text-center ${
                      genderFilter === g.id
                        ? 'bg-white font-bold text-slate-800 shadow-xs'
                        : 'text-gray-500 hover:text-slate-800'
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Age Range */}
            <div>
              <label className="text-[11px] font-bold text-slate-700 mb-1 block">محدوده سنی</label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  placeholder="از"
                  min={18}
                  max={80}
                  value={ageMin}
                  onChange={(e) => {
                    setAgeMin(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-2 py-1 bg-gray-50 border border-gray-200 rounded text-xs focus:border-amber-600 focus:bg-white outline-none text-center"
                />
                <span className="text-gray-400 font-bold">-</span>
                <input
                  type="number"
                  placeholder="تا"
                  min={18}
                  max={80}
                  value={ageMax}
                  onChange={(e) => {
                    setAgeMax(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-2 py-1 bg-gray-50 border border-gray-200 rounded text-xs focus:border-amber-600 focus:bg-white outline-none text-center"
                />
              </div>
            </div>

            {/* Education Level */}
            <div>
              <label className="text-[11px] font-bold text-slate-700 mb-1 block">مقطع تحصیلی</label>
              <select
                value={selectedEducation}
                onChange={(e) => {
                  setSelectedEducation(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-2 py-1 bg-gray-50 border border-gray-200 rounded text-xs focus:border-amber-600 focus:bg-white outline-none cursor-pointer"
              >
                <option value="">همه مقاطع</option>
                <option value="bachelor">کارشناسی</option>
                <option value="master">کارشناسی ارشد</option>
                <option value="phd">دکتری تخصصی</option>
                <option value="seminary">سطوح حوزوی</option>
              </select>
            </div>

            {/* MBTI Personality */}
            <div>
              <label className="text-[11px] font-bold text-slate-700 mb-1 block">تیپ شخصیتی (MBTI)</label>
              <input
                type="text"
                placeholder="مثلا INTJ یا ENFP..."
                value={mbtiFilter}
                onChange={(e) => {
                  setMbtiFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-2 py-1 bg-gray-50 border border-gray-200 rounded text-xs focus:border-amber-600 focus:bg-white outline-none"
              />
            </div>

            {/* City */}
            <div>
              <label className="text-[11px] font-bold text-slate-700 mb-1 block">شهر سکونت</label>
              <select
                value={cityFilter}
                onChange={(e) => {
                  setCityFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-2 py-1 bg-gray-50 border border-gray-200 rounded text-xs focus:border-amber-600 focus:bg-white outline-none cursor-pointer"
              >
                <option value="">همه شهرها</option>
                <option value="تهران">تهران</option>
                <option value="اصفهان">اصفهان</option>
                <option value="مشهد">مشهد</option>
                <option value="شیراز">شیراز</option>
                <option value="قم">قم</option>
                <option value="کرج">کرج</option>
              </select>
            </div>
          </div>
        </aside>

        {/* Data Table Canvas */}
        <div className="flex-1 bg-white rounded-lg border border-gray-200 overflow-hidden w-full shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                <tr className="text-[10px] text-gray-500 font-bold uppercase">
                  <th className="py-2.5 px-4">شناسه / نام مراجع</th>
                  <th className="py-2.5 px-4">سن / شغل / مدرک</th>
                  <th className="py-2.5 px-4">شاخص تطابق</th>
                  <th className="py-2.5 px-4">وضعیت</th>
                  <th className="py-2.5 px-4">آخرین اقدام</th>
                  <th className="py-2.5 px-4 text-center">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {paginatedApplicants.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-400 text-xs">
                      موردی با فیلترهای انتخابی یافت نشد.
                    </td>
                  </tr>
                ) : (
                  paginatedApplicants.map((applicant, index) => {
                    const initials = applicant.firstName[0] + ' ' + (applicant.lastName[0] || '');
                    const matchScore = [85, 92, 78, 65, 88, 90][index % 6];

                    return (
                      <tr
                        key={applicant.id}
                        className="hover:bg-gray-50/80 transition-colors cursor-pointer"
                        onClick={() => onSelectApplicant(applicant.id)}
                      >
                        {/* 1. Name and ID */}
                        <td className="py-2.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${
                                applicant.gender === 'male'
                                  ? 'bg-slate-700 text-slate-200'
                                  : 'bg-indigo-100 text-indigo-800'
                              }`}
                            >
                              {initials}
                            </div>
                            <div>
                              <div
                                className={`text-xs font-bold text-slate-800 flex items-center gap-1 ${
                                  isGlobalUnmasked ? '' : 'privacy-mask'
                                }`}
                              >
                                <span>{applicant.firstName} {applicant.lastName}</span>
                                {applicant.isVip && (
                                  <span className="text-[9px] bg-amber-100 text-amber-800 px-1 rounded font-bold">
                                    VIP
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-gray-400 font-mono">
                                #{applicant.caseCode || applicant.fileCode} • {applicant.residenceCity || applicant.city}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* 2. Age / Job */}
                        <td className="py-2.5 px-4">
                          <div className="font-semibold text-slate-800 text-xs">
                            {applicant.age} سال • {applicant.educationSkills?.fieldOfStudy || applicant.educationJob?.fieldOfStudy}
                          </div>
                          <div className="text-[10px] text-gray-500 truncate max-w-[150px]">
                            {applicant.careerFinancial?.currentJob || applicant.educationJob?.jobTitle}
                          </div>
                        </td>

                        {/* 3. Match Score Indicator */}
                        <td className="py-2.5 px-4 min-w-[110px]">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-1.5">
                              <div
                                className={`h-1.5 rounded-full ${
                                  matchScore >= 85 ? 'bg-green-500' : 'bg-amber-500'
                                }`}
                                style={{ width: `${matchScore}%` }}
                              ></div>
                            </div>
                            <span className="font-bold text-[11px] text-slate-700">{matchScore}٪</span>
                          </div>
                        </td>

                        {/* 4. Status Badge */}
                        <td className="py-2.5 px-4">
                          {applicant.status === 'active' && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-50 text-green-700 border border-green-200">
                              فعال
                            </span>
                          )}
                          {applicant.status === 'pending' && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              در انتظار
                            </span>
                          )}
                          {applicant.status === 'introduced' && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                              معرفی شده
                            </span>
                          )}
                        </td>

                        {/* 5. Last Update */}
                        <td className="py-2.5 px-4 text-gray-500 text-[10px]">
                          {applicant.lastUpdate}
                        </td>

                        {/* 6. Actions */}
                        <td className="py-2.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => onNavigateToMatching(applicant.id)}
                              className="p-1 rounded text-amber-600 hover:bg-amber-50 transition-colors"
                              title="یافتن همسان هوشمند"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onSelectApplicant(applicant.id)}
                              className="p-1 rounded text-indigo-600 hover:bg-indigo-50 transition-colors"
                              title="مشاهده پرونده کامل"
                            >
                              <ChevronLeft className="w-3.5 h-3.5" />
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

          {/* Pagination */}
          <div className="border-t border-gray-200 px-3 py-2 flex items-center justify-between bg-gray-50 text-[11px] text-gray-600">
            <span>
              نمایش {(currentPage - 1) * itemsPerPage + 1} تا{' '}
              {Math.min(currentPage * itemsPerPage, filteredApplicants.length)} از{' '}
              {filteredApplicants.length} متقاضی
            </span>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-2 py-0.5 rounded border border-gray-300 text-gray-700 hover:bg-white disabled:opacity-30 transition-colors cursor-pointer text-xs"
              >
                قبلی
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-6 h-6 rounded text-xs font-bold transition-colors cursor-pointer ${
                    currentPage === pageNum
                      ? 'bg-slate-800 text-white shadow-xs'
                      : 'border border-gray-200 text-slate-700 hover:bg-white'
                  }`}
                >
                  {pageNum}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-2 py-0.5 rounded border border-gray-300 text-gray-700 hover:bg-white disabled:opacity-30 transition-colors cursor-pointer text-xs"
              >
                بعدی
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
