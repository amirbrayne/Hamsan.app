import { Applicant, ApplicantAuditItem, UserRole } from '../types';

export interface QualityAnalysisResult {
  completionPercentage: number;
  qualityScore: number;
  gradeBadge: { label: string; color: string; bg: string; border: string; stars: string };
  missingFields: string[];
  suggestions: string[];
}

/**
 * Calculates profile completion % and quality score across all 11 categories
 */
export function analyzeApplicantQuality(applicant: Partial<Applicant>): QualityAnalysisResult {
  const missingFields: string[] = [];
  const suggestions: string[] = [];

  let completedWeight = 0;
  let totalWeight = 0;

  const check = (condition: boolean, fieldName: string, weight: number, suggestionText?: string) => {
    totalWeight += weight;
    if (condition) {
      completedWeight += weight;
    } else {
      missingFields.push(fieldName);
      if (suggestionText) suggestions.push(suggestionText);
    }
  };

  // 1. اطلاعات هویتی و پایه
  check(!!applicant.firstName?.trim() && !!applicant.lastName?.trim(), 'نام و نام خانوادگی', 5, 'نام و نام خانوادگی را وارد کنید');
  check(!!applicant.nationalId?.trim() && applicant.nationalId.length >= 10, 'کد ملی ۱۰ رقمی معتبر', 5, 'کد ملی ۱۰ رقمی ثبت شود');
  check(!!applicant.phone?.trim(), 'شماره تماس مستقیم متقاضی', 5, 'شماره همراه در دسترس متقاضی ثبت شود');
  check(!!applicant.guardianPhone?.trim(), 'شماره تماس معرف یا والدین', 3, 'شماره تماس یکی از والدین یا معرف جهت راستی‌آزمایی ثبت شود');
  check(!!applicant.birthDate?.trim() && (applicant.age || 0) >= 15, 'تاریخ تولد و سن معتبر', 5, 'تاریخ تولد شمسی صحیح ثبت شود');
  check(!!applicant.residenceCity?.trim(), 'شهر محل سکونت', 3, 'شهر محل سکونت مشخص شود');
  check(!!applicant.nationalityOrigin?.trim(), 'اصالت و قومیت', 3, 'اصالت خانوادگی تعیین شود');
  check((applicant.height || 0) > 120 && (applicant.weight || 0) > 30, 'قد و وزن', 3, 'قد و وزن دقیق ثبت شود');

  // 2. سابقه ازدواج
  check(!!applicant.maritalHistory?.previousMarriageStatus, 'وضعیت سابقه ازدواج', 4, 'وضعیت سابقه ازدواج قبلی مشخص شود');
  if (applicant.maritalHistory?.previousMarriageStatus === 'divorced') {
    check(!!applicant.maritalHistory?.separationReason?.trim(), 'علت جدایی ازدواج قبلی', 3, 'علت متارکه و مدت زندگی مشترک قبلی شفاف شود');
  }

  // 3. خانواده
  check(applicant.familyInfo?.fatherLiving !== undefined, 'وضعیت حیات پدر', 3);
  check(!!applicant.familyInfo?.fatherJob?.trim(), 'شغل پدر', 2, 'شغل و وضعیت شغلی پدر ثبت شود');
  check(applicant.familyInfo?.motherLiving !== undefined, 'وضعیت حیات مادر', 3);
  check(!!applicant.familyInfo?.motherJob?.trim(), 'شغل مادر', 2, 'شغل و وضعیت مادر ثبت شود');
  check(!!applicant.familyInfo?.livingWith?.trim(), 'افراد هم‌خانه و سکونت', 2, 'مشخص شود متقاضی با چه کسانی زندگی می‌کند');

  // 4. تحصیلات و اشتغال
  check(!!applicant.educationSkills?.academicEducation, 'مقطع تحصیلی دانشگاهی', 5, 'مقطع تحصیلی متقاضی انتخاب شود');
  check(!!applicant.educationSkills?.fieldOfStudy?.trim(), 'رشته تحصیلی', 4, 'رشته تحصیلی مشخص شود');
  check(!!applicant.careerFinancial?.currentJob?.trim(), 'شغل فعلی', 5, 'عنوان شغلی متقاضی ثبت شود');
  check(!!applicant.careerFinancial?.incomeRange?.trim(), 'محدوده درآمد ماهانه', 3, 'بازه درآمد ماهانه مشخص شود');
  check(!!applicant.careerFinancial?.housingStatus, 'وضعیت مسکن', 3, 'وضعیت مسکن (مالک، رهن، با خانواده) مشخص شود');
  check(!!applicant.careerFinancial?.vehicleStatus, 'وضعیت وسیله نقلیه', 2);

  // سربازی (برای آقایان)
  if (applicant.gender === 'male' && (applicant.age || 0) >= 18) {
    check(applicant.careerFinancial?.militaryStatus !== undefined && applicant.careerFinancial?.militaryStatus !== 'na', 'وضعیت نظام وظیفه (آقایان)', 4, 'وضعیت کارت پایان خدمت یا معافیت نظام وظیفه ثبت شود');
  }

  // 5. اعتقادات و مذهب
  check(!!applicant.religiousValues?.prayerStatus && applicant.religiousValues.prayerStatus !== 'no_info', 'وضعیت پایبندی به نماز', 4, 'پایبندی به نماز در فرم یا جلسه اولیه بررسی شود');
  check(!!applicant.religiousValues?.fastingStatus && applicant.religiousValues.fastingStatus !== 'no_info', 'وضعیت روزه', 3, 'وضعیت روزه بررسی شود');
  check(!!applicant.religiousValues?.personalCovering, 'نوع پوشش شخصی', 4, 'نوع پوشش فردی ثبت شود');

  // 6. سلامت و دخانیات
  check(!!applicant.healthLifestyle?.smokingStatus, 'وضعیت مصرف دخانیات', 4, 'وضعیت دخانیات شفاف شود');
  check(!!applicant.healthLifestyle?.healthStatus?.trim(), 'وضعیت سلامتی و بیماری خاص', 3, 'شرح وضعیت سلامت و عدم بیماری خاص ثبت شود');

  // 7. روانشناسی و مشاوره
  if (applicant.personality?.isCounselingDeferred) {
    // Marked deferred - small penalty but noted
    suggestions.push('نوبت‌دهی جلسه مشاوره جهت تعیین تیپ شخصیتی MBTI و سبک دلبستگی');
  } else {
    check(!!applicant.personality?.mbti?.trim(), 'تیپ شخصیتی MBTI', 4, 'ارزیابی آزمون MBTI تکمیل شود');
    check(!!applicant.personality?.attachmentStyle, 'سبک دلبستگی عاطفی', 3, 'سبک دلبستگی در مصاحبه بالینی مشخص شود');
  }

  // 8. معیارهای همسرگزینی
  check((applicant.marriagePreferences?.ageMin || 0) > 0 && (applicant.marriagePreferences?.ageMax || 0) > 0, 'بازه سنی مورد نظر برای همسر', 4, 'حداقل و حداکثر سن همسر مورد نظر تعیین شود');
  check((applicant.marriagePreferences?.acceptableCities || []).length > 0, 'شهرهای مورد پذیرش سکونت', 3, 'شهرهای مورد قبول برای زندگی ثبت شوند');
  check((applicant.marriagePreferences?.dealBreakers || []).length > 0, 'خطوط قرمز قطعی (Deal-Breakers)', 4, 'خط قرمزهای اساسی همسرگزینی مشخص شود');

  // 9. مدارک و پیوست‌ها
  check((applicant.files || []).length > 0, 'بارگذاری تصویر یا مدارک شناسایی', 3, 'تصویر چهره یا مدارک هویتی بارگذاری شود');

  const completionPercentage = Math.min(100, Math.round((completedWeight / totalWeight) * 100));

  // Quality score considers depth and validation
  let qualityBonus = 0;
  if ((applicant.marriagePreferences?.criteriaItems || []).length >= 5) qualityBonus += 5;
  if ((applicant.educationSkills?.additionalSkills || []).length >= 2) qualityBonus += 3;
  if (applicant.personality?.counselorImpression?.trim()) qualityBonus += 4;
  if (applicant.files && applicant.files.length >= 2) qualityBonus += 3;

  const qualityScore = Math.min(100, Math.max(0, Math.round(completionPercentage * 0.85 + qualityBonus)));

  let gradeBadge = {
    label: '🔴 پرونده ناقص',
    color: 'text-red-700',
    bg: 'bg-red-50',
    border: 'border-red-200',
    stars: '★☆☆☆',
  };

  if (qualityScore >= 90) {
    gradeBadge = {
      label: '🌟 کیفیت عالی (تکمیل ۱۰۰٪)',
      color: 'text-emerald-800',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      stars: '★★★★',
    };
  } else if (qualityScore >= 75) {
    gradeBadge = {
      label: '🟢 کیفیت خوب (آماده همسان‌گزینی)',
      color: 'text-teal-800',
      bg: 'bg-teal-50',
      border: 'border-teal-200',
      stars: '★★★☆',
    };
  } else if (qualityScore >= 55) {
    gradeBadge = {
      label: '🟡 کیفیت متوسط (نیازمند تکمیل)',
      color: 'text-amber-800',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      stars: '★★☆☆',
    };
  }

  return {
    completionPercentage,
    qualityScore,
    gradeBadge,
    missingFields,
    suggestions,
  };
}

/**
 * Creates an Audit Log item for any profile creation/modification
 */
export function createApplicantAuditLog(
  applicantId: string,
  applicantName: string,
  action: 'create' | 'update' | 'status_change' | 'counseling_deferral' | 'criteria_update',
  user: { id: string; name: string; role: UserRole | string },
  changedFieldsSummary: string,
  note?: string
): ApplicantAuditItem {
  const dateStr = new Intl.DateTimeFormat('fa-IR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date());

  return {
    id: 'aud_' + Math.random().toString(36).substr(2, 9),
    timestamp: dateStr,
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    action,
    changedFields: changedFieldsSummary,
    note,
  };
}
