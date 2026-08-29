export type UserRole = 'main_admin' | 'internal_manager' | 'employee' | 'counselor' | 'applicant';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
  roleTitle: string;
  phone: string;
  department: string;
  assignedCount: number;
}

export type ApplicantWorkflowStatus =
  | 'NEW'           // ثبت اولیه
  | 'UNDER_REVIEW'  // در حال بررسی
  | 'COUNSELING'    // در حال مشاوره
  | 'MATCHING'      // در فرآیند همسان‌گزینی
  | 'INTRODUCED'    // معرفی شده
  | 'SUCCESSFUL'    // ازدواج موفق
  | 'CLOSED';       // بسته شده

export type ApplicantStatus = 'active' | 'pending' | 'introduced' | 'completed' | 'archived';
export type Gender = 'male' | 'female';
export type RegistrationMethod = 'in_person' | 'online';
export type UpdateMethod = 'in_person' | 'phone' | 'online';
export type MaritalHistory = 'never_married' | 'divorced' | 'widowed' | 'failed_engagement';

// 4. وضعیت سربازی
export type MilitaryStatus =
  | 'completed'         // انجام شده (پایان خدمت)
  | 'in_progress'       // در حال انجام
  | 'exempt_permanent'   // معافیت دائم
  | 'exempt_medical'     // معافیت پزشکی
  | 'not_gone_yet'      // هنوز نرفته (مشمول / معافیت تحصیلی)
  | 'exempt_edu'        // معافیت تحصیلی
  | 'exempt_family'     // معافیت کفالت
  | 'na';               // شامل نمی‌شود (بانوان یا پسران زیر ۱۸ سال)

export type SmokingStatus = 'none' | 'occasional' | 'hookah_only' | 'smoker';

// 6. وضعیت نماز و روزه
export type PrayerStatus =
  | 'always_strict'     // همیشه انجام می‌دهد (اول وقت و مقید)
  | 'always_regular'    // همیشه انجام می‌دهد (عادی)
  | 'sometimes'         // گاهی انجام می‌دهد
  | 'none'              // انجام نمی‌دهد
  | 'improving'         // در حال اصلاح و بهبود
  | 'counselor_notes'   // توضیحات مشاور
  | 'no_info'           // فاقد اطلاعات فعلی / بررسی در مشاوره
  | 'strict_on_time'    // سازگاری قبلی
  | 'regular'
  | 'occasional';

export type FastingStatus =
  | 'always'            // همیشه (کامل و مقید)
  | 'sometimes'         // گاهی
  | 'none'              // انجام نمی‌دهد
  | 'medical_excuse'    // به علت شرایط خاص یا پزشکی انجام نمی‌دهد
  | 'no_info'           // فاقد اطلاعات فعلی / بررسی در مشاوره
  | 'strict'
  | 'regular'
  | 'occasional';

export type KhumsStatus = 'committed_has_year' | 'not_committed' | 'unfamiliar' | 'no_info';

// پوشش بر اساس جنسیت
export type PersonalCovering =
  | 'chador_complete'   // چادر کامل با پوشیه/هدبند
  | 'chador_student'    // چادر ملی / دانشجویی
  | 'chador_simple'     // چادر ساده سنتی
  | 'manteau_modest'    // مانتو پوشیده و بلند با مقنعه
  | 'manteau_casual'    // مانتو و روسری معمولی
  | 'formal_suit'       // کت و شلوار رسمی
  | 'casual'            // پیراهن و شلوار معمولی / اسپرت
  | 'clerical'          // طلبه و لباس روحانیت
  | 'other';

// 5. وضعیت مسکن، بیمه و خودرو
export type HousingStatus =
  | 'owner'             // مالک شخصی
  | 'tenant'            // اجاره‌ای
  | 'mortgage'          // رهن کامل
  | 'family'            // همراه خانواده
  | 'living_with_family'
  | 'organizational'    // سازمانی
  | 'no_independent'    // بدون مسکن مستقل
  | 'institutional'
  | 'other';

export type InsuranceStatus =
  | 'social_security'   // تأمین اجتماعی
  | 'health_insurance'  // خدمات درمانی / سلامت
  | 'armed_forces'      // نیروهای مسلح
  | 'complementary'     // بیمه تکمیلی
  | 'none'              // بدون بیمه
  | 'other';            // سایر

export type VehicleStatus =
  | 'none'              // ندارد
  | 'motorcycle'        // موتورسیکلت
  | 'personal_car'      // خودرو شخصی
  | 'has_car'           // خودرو دارد
  | 'company_car'       // خودرو سازمانی
  | 'multiple_cars'     // چند خودرو
  | 'other';

// 9. درجه اهمیت و انعطاف معیارها
export type CriteriaImportance =
  | 'very_important'    // بسیار مهم ⭐⭐⭐
  | 'important'         // مهم ⭐⭐
  | 'moderate'          // متوسط ⭐
  | 'low_importance'    // کم‌اهمیت
  | 'unimportant';      // فاقد اهمیت

export type CriteriaFlexibility =
  | 'dealbreaker'       // ⛔ خط قرمز قطعی
  | 'negotiable'        // 🤝 قابل مذاکره
  | 'indifferent';      // ⚪ بدون اهمیت

export interface PartnerCriterionItem {
  id: string;
  category: string;
  title: string;
  importance: CriteriaImportance;
  flexibility: CriteriaFlexibility;
  description?: string;
  customValue?: string;
}

export interface BigFiveScores {
  conscientiousness: number; // وظیفه‌شناسی
  extraversion: number;      // برون‌گرایی
  agreeableness: number;     // توافق‌پذیری
  neuroticism: number;       // روان‌رنجوری
  openness: number;          // گشودگی به تجربه
}

export interface DocumentFile {
  id: string;
  name: string;
  category: 'profile_image' | 'id_card' | 'education' | 'psych_test' | 'other';
  size: string;
  uploadDate: string;
  url: string;
  isConfidential: boolean;
}

export interface ApplicantAuditItem {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole | string;
  action: string;
  changedFields: string;
  note?: string;
}

export interface Applicant {
  id: string;
  
  // 1. اطلاعات پایه پرونده (Basic Information)
  caseCode: string;               // کد پرونده (مثلاً #PR-8472)
  category: string;               // دسته‌بندی پرونده (عادی، سادات، نخبگان، ایثارگران، VIP)
  registrationDate: string;       // تاریخ تشکیل پرونده (خورشیدی)
  registrationMethod: RegistrationMethod; // نحوه تشکیل پرونده (حضوری / غیرحضوری)
  lastUpdateDate: string;         // تاریخ آخرین بروزرسانی
  updateMethod: UpdateMethod;     // نحوه بروزرسانی (حضوری / غیرحضوری / تلفنی)
  workflowStatus: ApplicantWorkflowStatus; // فرآیند مرکز (NEW, UNDER_REVIEW, ...)
  status: ApplicantStatus;        // سازگاری با سیستم فیلتر قبلی (active, pending, ...)
  isVip: boolean;
  photoUrl: string;

  // انتسابات
  counselorId: string;
  counselorName: string;
  assignedEmployeeId?: string;
  assignedEmployeeName?: string;

  // 2. اطلاعات فردی (Personal Information)
  firstName: string;
  lastName: string;
  nationalId: string;
  phone: string;
  guardianPhone?: string;         // شماره تماس معرف یا والدین
  gender: Gender;
  birthDate: string;              // تاریخ تولد (مثلا ۱۳۷۰/۰۴/۱۲)
  birthYear: number;
  age: number;
  birthPlace: string;             // محل تولد
  residenceCity: string;          // محل سکونت (شهر)
  province: string;               // استان
  address: string;                // آدرس کامل / منطقه
  nationalityOrigin: string;      // اصالت و قومیت (یزدی، آذری، اصفهانی، مشهدی، ...)
  height: number;                 // قد (سانتی‌متر)
  weight: number;                 // وزن (کیلوگرم)

  // 3. وضعیت ازدواج قبلی (Marriage History)
  maritalHistory: {
    previousMarriageStatus: MaritalHistory; // سابقه ازدواج
    previousMarriageStatusFa: string;
    marriageDurationMonths?: number;        // مدت زندگی مشترک قبلی (ماه یا سال)
    marriageDurationText?: string;          // مدت زندگی
    separationDate?: string;                // تاریخ جدایی یا فوت همسر
    separationReason?: string;              // علت جدایی یا فوت
    childrenCount: number;                  // تعداد فرزندان
    childrenCustodyStatus?: string;         // شرح حال و وضعیت حضانت فرزندان
  };

  // 4. سلامت و سبک زندگی (Health & Lifestyle)
  healthLifestyle: {
    healthStatus: string;                   // وضعیت سلامتی و بیماری‌های خاص
    smokingStatus: SmokingStatus;           // مصرف دخانیات
    smokingStatusFa: string;
    lifestyleNotes: string;                 // توضیحات سبک زندگی
    exerciseLevel: 'none' | 'occasional' | 'regular' | 'professional';
    travelInterest: 'low' | 'moderate' | 'high';
  };

  // 5. تحصیلات و مهارت‌ها (Education & Skills)
  educationSkills: {
    academicEducation: 'diploma' | 'associate' | 'bachelor' | 'master' | 'phd'; // تحصیلات آکادمیک
    academicEducationFa: string;
    fieldOfStudy: string;                   // رشته تحصیلی
    university: string;                     // دانشگاه
    religiousEducation: string;             // تحصیلات حوزوی (ندارد، سطح ۱، سطح ۲، سطح ۳، خارج فقه)
    additionalSkills: string[];             // تحصیلات تکمیلی و مهارت‌ها
  };

  // 6. وضعیت شغلی و مالی (Career & Financial)
  careerFinancial: {
    militaryStatus: MilitaryStatus;         // وضعیت سربازی
    militaryStatusFa: string;
    currentJob: string;                     // شغل فعلی
    organizationType: string;               // نوع سازمان / صنف
    incomeRange: string;                    // محدوده درآمد (مثلاً ۳۵ تا ۵۰ میلیون)
    insuranceStatus: InsuranceStatus;       // وضعیت بیمه (تکی / اصلی)
    insuranceStatusFa: string;
    insuranceList?: string[];               // لیست چندگانه بیمه‌ها
    housingStatus: HousingStatus;           // وضعیت مسکن (مالک، مستأجر، با خانواده)
    housingStatusFa: string;
    vehicleStatus: VehicleStatus;           // وسیله نقلیه
    vehicleStatusFa: string;
    financialIndependence: boolean;
  };

  // 7. اطلاعات مذهبی و ارزشی (Religious & Values)
  religiousValues: {
    religion: string;                       // دین (اسلام)
    denomination: string;                   // مذهب (شیعه ۱۲ امامی)
    marja: string;                          // مرجع تقلید
    prayerStatus: PrayerStatus;             // وضعیت نماز
    prayerStatusFa: string;
    prayerNotes?: string;                   // توضیحات مشاور درباره نماز
    fastingStatus: FastingStatus;           // وضعیت روزه
    fastingStatusFa: string;
    khumsStatus: KhumsStatus;               // وضعیت خمس
    khumsStatusFa: string;
    personalCovering: PersonalCovering;     // پوشش شخصی
    personalCoveringFa: string;
    familyCovering: string;                 // پوشش خانوادگی
    coreValues: string[];                   // ارزش‌های اصلی
  };

  // 8. اطلاعات خانواده (Family Information)
  familyInfo: {
    fatherLiving: boolean;                  // وضعیت حیات پدر
    fatherAge?: number;
    fatherJob?: string;                     // شغل پدر
    fatherEducation?: string;               // تحصیلات پدر
    motherLiving: boolean;                  // وضعیت حیات مادر
    motherAge?: number;
    motherJob?: string;                     // شغل مادر
    motherEducation?: string;               // تحصیلات مادر
    parentsMaritalStatus: 'living_together' | 'divorced' | 'deceased_one' | 'deceased_both'; // وضعیت تأهل والدین
    parentsMaritalStatusFa: string;
    sistersCountAndStatus: string;          // تعداد و وضعیت خواهران (مثلاً ۲ خواهر متأهل)
    brothersCountAndStatus: string;         // تعداد و وضعیت برادران (مثلاً ۱ برادر مجرد دانشجو)
    livingWith: string;                     // افرادی که فرد با آنها زندگی می‌کند
    birthOrder: number;                     // ترتیب تولد (فرزند چندم)
    familyCultureType: 'traditional' | 'moderate' | 'modern' | 'religious';
    economicLevel: 'modest' | 'middle' | 'upper_middle' | 'high';
    counselorFamilyNotes: string;
  };

  // 9. ویژگی‌های شخصیتی (Personality & Counselor Assessment)
  personality: {
    isCounselingDeferred?: boolean;         // آیا تکمیل پس از مشاوره انتخاب شده
    mbti: string;                           // تیپ شخصیتی MBTI
    mbtiTitleFa: string;
    attachmentStyle: 'ایمن' | 'متمایل به اضطرابی' | 'اجتنابی' | 'ناامن دوسوگرا';
    personalityTraits: string[];            // ویژگی‌های بارز شخصیتی
    keyTraits?: string[];
    strengths: string[];                    // نقاط قوت
    weaknesses?: string[];                  // نقاط ضعف و چالش‌ها
    personalityNotes: string;               // توضیحات مشاور
    counselorImpression?: string;           // نتیجه ارزیابی و تشخیص مشاور
    bigFive: BigFiveScores;
  };

  // 10. معیارهای انتخاب همسر (Marriage Preferences)
  marriagePreferences: {
    preferredPartnerCriteria: string[];     // ملاک‌های مهم انتخاب همسر
    ageMin: number;
    ageMax: number;
    heightMin: number;
    heightMax: number;
    acceptableCities: string[];
    minEducation: string;
    acceptableMaritalHistory: MaritalHistory[];
    importantValues: string[];              // ارزش‌های مهم
    priorities: string[];                   // اولویت‌ها
    corePriorities?: string[];
    dealBreakers: string[];                 // خط قرمزها
    criteriaItems?: PartnerCriterionItem[]; // ساختار تفکیکی اهمیت و خط قرمزها
    preferredMbtiList?: string[];
    religiousExpectations: string;
    financialExpectations: string;
  };

  // 11. فایل‌ها و تصاویر (Files)
  files: DocumentFile[];

  // سیستم کیفیت اطلاعات، پیش‌نویس، و تاریخچه ویرایش (Audit & Quality)
  qualityScore?: number;                    // نمره کیفیت اطلاعات (۰ تا ۱۰۰)
  completionPercentage?: number;            // درصد تکمیل فیلدهای پرونده (۰ تا ۱۰۰)
  missingFields?: string[];                 // لیست فیلدهای ناقص
  improvementSuggestions?: string[];        // پیشنهادات هوشمند جهت تکمیل
  isDraft?: boolean;                        // آیا پیش‌نویس موقت است
  lastModifiedBy?: {
    id: string;
    name: string;
    role: UserRole | string;
    timestamp: string;
  };
  auditHistory?: ApplicantAuditItem[];      // تاریخچه تغییرات و دستکاری پرونده

  // سازگاری موقت برای متدهای قبلی UI
  fileCode?: string;
  personalInfo?: any;
  educationJob?: any;
  religionValues?: any;
  lifestyle?: any;
  city?: string;
  lastUpdate?: string;
}

export interface CounselingSession {
  id: string;
  applicantId: string;
  applicantName: string;
  applicantFileCode: string;
  sessionNumber: number;
  title: string;
  sessionDate: string;
  sessionTime: string;
  roomNumber: string;
  counselorId: string;
  counselorName: string;
  topics: string[];
  summary: string;
  privateNotes: string; // Highly confidential, privacy blurred
  readinessScore: number; // 1-100
  homework?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  // Aliases for view compatibility
  date?: string;
  time?: string;
  location?: string;
  statusFa?: string;
  clinicalNotes?: string;
}

export type IntroductionStatus = 'pending' | 'contacted' | 'meeting' | 'successful' | 'rejected';

export interface Introduction {
  id: string;
  introCode: string;
  maleApplicantId: string;
  maleApplicantName: string;
  maleFileCode: string;
  maleAge: number;
  maleJob: string;
  femaleApplicantId: string;
  femaleApplicantName: string;
  femaleFileCode: string;
  femaleAge: number;
  femaleJob: string;
  createdDate: string;
  compatibilityScore: number;
  status: IntroductionStatus;
  statusFa: string;
  stageName: string;
  rejectionReason?: string;
  meetingDate?: string;
  meetingLocation?: string;
  counselorId: string;
  counselorName: string;
  notes: string;
  timeline: {
    date: string;
    title: string;
    description: string;
    actor: string;
  }[];
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'urgent' | 'medium' | 'low';
  isDone: boolean;
  dueDate: string;
  dueTime?: string;
  assignedRole: UserRole;
  assignedUserName: string;
  relatedApplicantId?: string;
  relatedApplicantName?: string;
  relatedApplicantPhone?: string;
  type: 'review' | 'sms' | 'finance' | 'counseling' | 'call';
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  targetEntity: string;
  targetId: string;
  details: string;
}

export interface MatchAnalysis {
  applicantA: Applicant;
  applicantB: Applicant;
  compatibilityScore: number;
  dimensionScores: {
    sharedValues: number;
    personalityFit: number;
    familyBackground: number;
    lifestyleFit: number;
    expectationsOverlap: number;
  };
  strengths: { title: string; description: string }[];
  risks: { title: string; description: string }[];
  aiClinicalVerdict: string;
}
