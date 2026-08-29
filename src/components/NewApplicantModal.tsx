import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Users,
  Briefcase,
  Heart,
  BrainCircuit,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Shield,
  Upload,
  Calendar,
  Phone,
  MapPin,
  Sparkles,
  FileText,
  BadgePercent,
  Check,
  AlertCircle,
  RotateCcw,
  Save,
  Clock,
  HelpCircle
} from 'lucide-react';
import { useCRMStore } from '../services/store';
import {
  Applicant,
  Gender,
  ApplicantWorkflowStatus,
  MaritalHistory,
  RegistrationMethod,
  UpdateMethod,
  MilitaryStatus,
  SmokingStatus,
  PrayerStatus,
  FastingStatus,
  KhumsStatus,
  PersonalCovering,
  HousingStatus,
  InsuranceStatus,
  VehicleStatus,
  PartnerCriterionItem,
  DocumentFile,
} from '../types';
import {
  IRAN_CITIES,
  IRAN_PROVINCES,
  FIELDS_OF_STUDY,
  UNIVERSITIES,
  ETHNICITY_ORIGINS,
  OCCUPATIONS,
  SKILLS_LIST,
  MALE_COVERINGS,
  FEMALE_COVERINGS,
  PERSONALITY_TRAITS,
  DEFAULT_PARTNER_CRITERIA,
} from '../data/formOptions';
import {
  SmartSearchSelect,
  SmartMultiSelect,
  PersianDatePicker,
  CriteriaMatrix,
} from './common/SmartFormControls';
import { calculateAgeFromJalali } from '../utils/persianDate';
import { analyzeApplicantQuality, createApplicantAuditLog } from '../services/qualityScorer';

interface NewApplicantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newApplicantId: string) => void;
}

const DRAFT_STORAGE_KEY = 'alzahra_applicant_form_draft_v3';

export const NewApplicantModal: React.FC<NewApplicantModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { addApplicant, currentUser, users } = useCRMStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [hasDraft, setHasDraft] = useState(false);
  const [autoSavedTime, setAutoSavedTime] = useState<string | null>(null);
  const [stepErrors, setStepErrors] = useState<{ [key: string]: string }>({});

  // ==========================================
  // STEP 1: Basic & Identification & Marriage History
  // ==========================================
  const [caseCode, setCaseCode] = useState(() => 'PR-' + Math.floor(10000 + Math.random() * 90000));
  const [category, setCategory] = useState('عادی');
  const [registrationMethod, setRegistrationMethod] = useState<RegistrationMethod>('in_person');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [gender, setGender] = useState<Gender>('male');
  const [birthDate, setBirthDate] = useState(''); // Empty by default per requirement!
  const [calculatedAge, setCalculatedAge] = useState<number | undefined>(undefined);
  const [birthPlace, setBirthPlace] = useState('تهران');
  const [nationalityOrigin, setNationalityOrigin] = useState('فارس / تهرانی');
  const [residenceCity, setResidenceCity] = useState('تهران');
  const [province, setProvince] = useState('تهران');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [height, setHeight] = useState('175');
  const [weight, setWeight] = useState('72');

  // Previous marriage
  const [maritalStatus, setMaritalStatus] = useState<MaritalHistory>('never_married');
  const [marriageDurationText, setMarriageDurationText] = useState('');
  const [separationDate, setSeparationDate] = useState('');
  const [separationReason, setSeparationReason] = useState('');
  const [childrenCount, setChildrenCount] = useState('0');
  const [childrenCustodyStatus, setChildrenCustodyStatus] = useState('');

  // ==========================================
  // STEP 2: Family & Parents
  // ==========================================
  const [fatherLiving, setFatherLiving] = useState(true);
  const [fatherAge, setFatherAge] = useState('');
  const [fatherJob, setFatherJob] = useState('کارمند بازنشسته');
  const [fatherEducation, setFatherEducation] = useState('کارشناسی');
  const [motherLiving, setMotherLiving] = useState(true);
  const [motherAge, setMotherAge] = useState('');
  const [motherJob, setMotherJob] = useState('خانه‌دار');
  const [motherEducation, setMotherEducation] = useState('دیپلم');
  const [parentsMaritalStatus, setParentsMaritalStatus] = useState<'living_together' | 'divorced' | 'deceased_one' | 'deceased_both'>('living_together');
  const [sistersCountAndStatus, setSistersCountAndStatus] = useState('');
  const [brothersCountAndStatus, setBrothersCountAndStatus] = useState('');
  const [livingWith, setLivingWith] = useState('همراه با والدین');
  const [birthOrder, setBirthOrder] = useState('1');
  const [familyCulture, setFamilyCulture] = useState<'traditional' | 'moderate' | 'modern' | 'religious'>('moderate');
  const [economicLevel, setEconomicLevel] = useState<'modest' | 'middle' | 'upper_middle' | 'high'>('upper_middle');
  const [counselorFamilyNotes, setCounselorFamilyNotes] = useState('');

  // ==========================================
  // STEP 3: Education, Job & Finance
  // ==========================================
  const [academicEducation, setAcademicEducation] = useState<'diploma' | 'associate' | 'bachelor' | 'master' | 'phd'>('bachelor');
  const [fieldOfStudy, setFieldOfStudy] = useState('مهندسی نرم‌افزار / کامپیوتر');
  const [university, setUniversity] = useState('دانشگاه تهران');
  const [religiousEducation, setReligiousEducation] = useState('ندارد (مطالعات آزاد معارف)');
  const [additionalSkills, setAdditionalSkills] = useState<string[]>(['زبان انگلیسی پیشرفته / تافل / آیلتس']);
  
  // 4. وضعیت سربازی
  const [militaryStatus, setMilitaryStatus] = useState<MilitaryStatus>('completed');
  const [currentJob, setCurrentJob] = useState('مهندس نرم‌افزار / توسعه‌دهنده وب / IT');
  const [organizationType, setOrganizationType] = useState('شرکت دانش‌بنیان خصوصی');
  const [incomeRange, setIncomeRange] = useState('۳۵ تا ۵۰ میلیون تومان');
  
  // 5. بیمه، مسکن و خودرو
  const [insuranceList, setInsuranceList] = useState<string[]>(['تأمین اجتماعی', 'بیمه تکمیلی']);
  const [housingStatus, setHousingStatus] = useState<HousingStatus>('owner');
  const [vehicleStatus, setVehicleStatus] = useState<VehicleStatus>('personal_car');
  const [financialIndependence, setFinancialIndependence] = useState(true);

  // ==========================================
  // STEP 4: Health, Religion & Lifestyle
  // ==========================================
  const [healthStatus, setHealthStatus] = useState('سالم و بدون سابقه بیماری خاص');
  const [smokingStatus, setSmokingStatus] = useState<SmokingStatus>('none');
  const [lifestyleNotes, setLifestyleNotes] = useState('');
  const [exerciseLevel, setExerciseLevel] = useState<'none' | 'occasional' | 'regular' | 'professional'>('regular');
  const [travelInterest, setTravelInterest] = useState<'low' | 'moderate' | 'high'>('high');
  
  // 6. بخش اعتقادی
  const [religion, setReligion] = useState('اسلام');
  const [denomination, setDenomination] = useState('شیعه ۱۲ امامی');
  const [marja, setMarja] = useState('آیت‌الله خامنه‌ای');
  const [prayerStatus, setPrayerStatus] = useState<PrayerStatus>('always_strict');
  const [prayerNotes, setPrayerNotes] = useState('');
  const [fastingStatus, setFastingStatus] = useState<FastingStatus>('always');
  const [khumsStatus, setKhumsStatus] = useState<KhumsStatus>('committed_has_year');
  const [personalCovering, setPersonalCovering] = useState<PersonalCovering>('formal_suit');
  const [familyCovering, setFamilyCovering] = useState('چادر و پوشش کامل اسلامی');

  // ==========================================
  // STEP 5: Personality & Marriage Preferences
  // ==========================================
  // 8. بخش شخصیت و مشاوره (قابلیت خالی بودن و وضعیت "تکمیل پس از جلسه مشاوره")
  const [isCounselingDeferred, setIsCounselingDeferred] = useState(false);
  const [mbti, setMbti] = useState('INTJ');
  const [attachmentStyle, setAttachmentStyle] = useState<'ایمن' | 'متمایل به اضطرابی' | 'اجتنابی' | 'ناامن دوسوگرا'>('ایمن');
  const [personalityTraits, setPersonalityTraits] = useState<string[]>(['منطقی و خردگرا', 'مسئولیت‌پذیر و متعهد', 'آرام و صبور']);
  const [strengthsText, setStrengthsText] = useState('مدیریت تعارض، حل مسئله، صداقت در رفتار');
  const [weaknessesText, setWeaknessesText] = useState('حساسیت نسبت به نظم و برنامه‌ریزی');
  const [personalityNotes, setPersonalityNotes] = useState('');
  const [counselorImpression, setCounselorImpression] = useState('');

  // 9. معیارهای انتخاب همسر
  const [criteriaItems, setCriteriaItems] = useState<PartnerCriterionItem[]>(() =>
    DEFAULT_PARTNER_CRITERIA.map((c) => ({
      ...c,
      importance: 'very_important',
      flexibility: 'dealbreaker',
    }))
  );
  const [ageMin, setAgeMin] = useState('22');
  const [ageMax, setAgeMax] = useState('30');
  const [heightMin, setHeightMin] = useState('160');
  const [heightMax, setHeightMax] = useState('175');
  const [acceptableCities, setAcceptableCities] = useState<string[]>(['تهران', 'قم', 'کرج']);
  const [minEducation, setMinEducation] = useState('کارشناسی');
  const [religiousExpectations, setReligiousExpectations] = useState('پایبند به مبانی اخلاقی و واجبات شرعی');
  const [financialExpectations, setFinancialExpectations] = useState('همراهی در ساختن زندگی و درک متقابل');

  // ==========================================
  // STEP 6: Files & Final Workflow Assignment
  // ==========================================
  const [workflowStatus, setWorkflowStatus] = useState<ApplicantWorkflowStatus>('NEW');
  const [assignedCounselorId, setAssignedCounselorId] = useState('user_counselor');
  const [isVip, setIsVip] = useState(false);

  // Check Draft on mount
  useEffect(() => {
    try {
      const draft = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (draft) {
        setHasDraft(true);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Update coverings when gender changes
  useEffect(() => {
    if (gender === 'male') {
      if (personalCovering.includes('chador') || personalCovering.includes('manteau')) {
        setPersonalCovering('formal_suit');
      }
    } else {
      if (personalCovering === 'formal_suit' || personalCovering === 'casual' || personalCovering === 'clerical') {
        setPersonalCovering('chador_complete');
      }
      setMilitaryStatus('na');
    }
  }, [gender]);

  // Auto-save draft on every change
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      try {
        const stateObj = {
          caseCode, category, registrationMethod, firstName, lastName, nationalId, gender,
          birthDate, birthPlace, nationalityOrigin, residenceCity, province, address, phone,
          guardianPhone, height, weight, maritalStatus, marriageDurationText, separationDate,
          separationReason, childrenCount, childrenCustodyStatus, fatherLiving, fatherAge,
          fatherJob, fatherEducation, motherLiving, motherAge, motherJob, motherEducation,
          parentsMaritalStatus, sistersCountAndStatus, brothersCountAndStatus, livingWith,
          birthOrder, familyCulture, economicLevel, counselorFamilyNotes, academicEducation,
          fieldOfStudy, university, religiousEducation, additionalSkills, militaryStatus,
          currentJob, organizationType, incomeRange, insuranceList, housingStatus, vehicleStatus,
          financialIndependence, healthStatus, smokingStatus, lifestyleNotes, exerciseLevel,
          travelInterest, religion, denomination, marja, prayerStatus, prayerNotes,
          fastingStatus, khumsStatus, personalCovering, familyCovering, isCounselingDeferred,
          mbti, attachmentStyle, personalityTraits, strengthsText, weaknessesText,
          personalityNotes, counselorImpression, criteriaItems, ageMin, ageMax, heightMin,
          heightMax, acceptableCities, minEducation, religiousExpectations, financialExpectations,
          workflowStatus, assignedCounselorId, isVip, currentStep,
          timestamp: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
        };
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(stateObj));
        setAutoSavedTime(stateObj.timestamp);
      } catch (e) {
        console.error('Error auto-saving draft', e);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [
    caseCode, category, registrationMethod, firstName, lastName, nationalId, gender,
    birthDate, birthPlace, nationalityOrigin, residenceCity, province, address, phone,
    guardianPhone, height, weight, maritalStatus, marriageDurationText, separationDate,
    separationReason, childrenCount, childrenCustodyStatus, fatherLiving, fatherAge,
    fatherJob, fatherEducation, motherLiving, motherAge, motherJob, motherEducation,
    parentsMaritalStatus, sistersCountAndStatus, brothersCountAndStatus, livingWith,
    birthOrder, familyCulture, economicLevel, counselorFamilyNotes, academicEducation,
    fieldOfStudy, university, religiousEducation, additionalSkills, militaryStatus,
    currentJob, organizationType, incomeRange, insuranceList, housingStatus, vehicleStatus,
    financialIndependence, healthStatus, smokingStatus, lifestyleNotes, exerciseLevel,
    travelInterest, religion, denomination, marja, prayerStatus, prayerNotes,
    fastingStatus, khumsStatus, personalCovering, familyCovering, isCounselingDeferred,
    mbti, attachmentStyle, personalityTraits, strengthsText, weaknessesText,
    personalityNotes, counselorImpression, criteriaItems, ageMin, ageMax, heightMin,
    heightMax, acceptableCities, minEducation, religiousExpectations, financialExpectations,
    workflowStatus, assignedCounselorId, isVip, currentStep, isOpen
  ]);

  const loadDraft = () => {
    try {
      const draftStr = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (!draftStr) return;
      const d = JSON.parse(draftStr);
      if (d.firstName !== undefined) setFirstName(d.firstName);
      if (d.lastName !== undefined) setLastName(d.lastName);
      if (d.nationalId !== undefined) setNationalId(d.nationalId);
      if (d.gender !== undefined) setGender(d.gender);
      if (d.birthDate !== undefined) setBirthDate(d.birthDate);
      if (d.phone !== undefined) setPhone(d.phone);
      if (d.guardianPhone !== undefined) setGuardianPhone(d.guardianPhone);
      if (d.residenceCity !== undefined) setResidenceCity(d.residenceCity);
      if (d.nationalityOrigin !== undefined) setNationalityOrigin(d.nationalityOrigin);
      if (d.maritalStatus !== undefined) setMaritalStatus(d.maritalStatus);
      if (d.academicEducation !== undefined) setAcademicEducation(d.academicEducation);
      if (d.fieldOfStudy !== undefined) setFieldOfStudy(d.fieldOfStudy);
      if (d.university !== undefined) setUniversity(d.university);
      if (d.currentJob !== undefined) setCurrentJob(d.currentJob);
      if (d.militaryStatus !== undefined) setMilitaryStatus(d.militaryStatus);
      if (d.insuranceList !== undefined) setInsuranceList(d.insuranceList);
      if (d.housingStatus !== undefined) setHousingStatus(d.housingStatus);
      if (d.vehicleStatus !== undefined) setVehicleStatus(d.vehicleStatus);
      if (d.prayerStatus !== undefined) setPrayerStatus(d.prayerStatus);
      if (d.fastingStatus !== undefined) setFastingStatus(d.fastingStatus);
      if (d.personalCovering !== undefined) setPersonalCovering(d.personalCovering);
      if (d.isCounselingDeferred !== undefined) setIsCounselingDeferred(d.isCounselingDeferred);
      if (d.criteriaItems !== undefined) setCriteriaItems(d.criteriaItems);
      if (d.currentStep !== undefined) setCurrentStep(d.currentStep);
      setHasDraft(false);
    } catch (e) {
      console.error('Failed to parse draft', e);
    }
  };

  const clearDraft = () => {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    setHasDraft(false);
  };

  // ==========================================
  // STEP VALIDATION
  // ==========================================
  const validateCurrentStep = (): boolean => {
    const errors: { [key: string]: string } = {};

    if (currentStep === 1) {
      if (!firstName.trim()) errors.firstName = 'نام متقاضی الزامی است';
      if (!lastName.trim()) errors.lastName = 'نام خانوادگی الزامی است';
      
      // National ID Validation (10 digits)
      const cleanNationalId = nationalId.trim().replace(/\D/g, '');
      if (!cleanNationalId || cleanNationalId.length !== 10) {
        errors.nationalId = 'کد ملی باید دقیقاً ۱۰ رقم عددی باشد';
      }

      // Phone Number Validation (09xxxxxxxxx or 11 digits)
      const cleanPhone = phone.trim().replace(/\D/g, '');
      if (!cleanPhone || cleanPhone.length !== 11 || !cleanPhone.startsWith('09')) {
        errors.phone = 'شماره همراه باید ۱۱ رقم و با ۰۹ شروع شود (مانند ۰۹۱۲۳۴۵۶۷۸۹)';
      }

      // Birth Date format check (YYYY/MM/DD)
      if (!birthDate.trim()) {
        errors.birthDate = 'تاریخ تولد شمسی الزامی است و نباید خالی باشد';
      } else if (!/^\d{4}\/\d{2}\/\d{2}$/.test(birthDate.trim())) {
        errors.birthDate = 'فرمت تاریخ تولد باید به صورت سال/ماه/روز باشد (مثال: ۱۳۷۲/۰۵/۱۴)';
      }

      if (!residenceCity.trim()) errors.residenceCity = 'شهر محل سکونت الزامی است';
      if (!nationalityOrigin.trim()) errors.nationalityOrigin = 'اصالت / قومیت الزامی است';
      if (maritalStatus === 'divorced' && !separationReason.trim()) {
        errors.separationReason = 'علت جدایی در سابقه ازدواج قبلی الزامی است';
      }
    } else if (currentStep === 2) {
      // Family
      if (!livingWith.trim()) errors.livingWith = 'وضعیت افراد هم‌خانه مشخص شود';
    } else if (currentStep === 3) {
      // Education & Job
      if (!fieldOfStudy.trim()) errors.fieldOfStudy = 'رشته تحصیلی الزامی است';
      if (!currentJob.trim()) errors.currentJob = 'شغل فعلی متقاضی الزامی است';
      if (gender === 'male' && (calculatedAge === undefined || calculatedAge >= 18)) {
        if (!militaryStatus || militaryStatus === 'na') {
          errors.militaryStatus = 'تعیین وضعیت نظام وظیفه برای آقایان الزامی است';
        }
      }
    } else if (currentStep === 4) {
      // Health & Religion
      if (!prayerStatus) errors.prayerStatus = 'وضعیت نماز الزامی است';
      if (!fastingStatus) errors.fastingStatus = 'وضعیت روزه الزامی است';
      if (!personalCovering) errors.personalCovering = 'نوع پوشش فردی الزامی است';
    } else if (currentStep === 5) {
      // Personality & Criteria
      if (!isCounselingDeferred) {
        if (!mbti) errors.mbti = 'تیپ شخصیتی یا گزینه "تکمیل پس از مشاوره" انتخاب شود';
      }
      if (acceptableCities.length === 0) {
        errors.acceptableCities = 'حداقل یک شهر مورد پذیرش برای سکونت انتخاب شود';
      }
    }

    setStepErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = () => {
    if (validateCurrentStep()) {
      setStepErrors({});
      setCurrentStep((prev) => Math.min(6, prev + 1));
    }
  };

  const handlePrevStep = () => {
    setStepErrors({});
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  // Quality Preview
  const currentApplicantData: Partial<Applicant> = {
    firstName,
    lastName,
    nationalId,
    phone,
    guardianPhone,
    gender,
    birthDate,
    age: (calculatedAge !== undefined && calculatedAge > 0)
      ? calculatedAge
      : (birthDate ? calculateAgeFromJalali(birthDate) : 28),
    residenceCity,
    nationalityOrigin,
    height: Number(height) || 175,
    weight: Number(weight) || 70,
    maritalHistory: {
      previousMarriageStatus: maritalStatus,
      previousMarriageStatusFa: maritalStatus === 'never_married' ? 'مجرد (فاقد سابقه)' : maritalStatus === 'divorced' ? 'جدا شده' : 'فوت همسر',
      separationReason,
      childrenCount: Number(childrenCount) || 0,
      childrenCustodyStatus,
    },
    familyInfo: {
      fatherLiving,
      fatherJob,
      motherLiving,
      motherJob,
      livingWith,
      parentsMaritalStatus,
      parentsMaritalStatusFa: parentsMaritalStatus === 'together' ? 'در قید حیات و همراه هم' : parentsMaritalStatus === 'divorced' ? 'متارکه و طلاق والدین' : 'فوت یکی یا هر دو والدین',
      sistersCountAndStatus,
      brothersCountAndStatus,
      birthOrder: Number(birthOrder) || 1,
      familyCultureType: familyCulture,
      economicLevel,
      counselorFamilyNotes,
    },
    educationSkills: {
      academicEducation,
      academicEducationFa: academicEducation === 'phd' ? 'دکتری تخصصی' : academicEducation === 'master' ? 'کارشناسی ارشد' : 'کارشناسی',
      fieldOfStudy,
      university,
      religiousEducation,
      additionalSkills,
    },
    careerFinancial: {
      militaryStatus: gender === 'male' ? militaryStatus : 'na',
      militaryStatusFa: militaryStatus === 'completed' ? 'کارت پایان خدمت' : militaryStatus === 'exempt_medical' ? 'معافیت پزشکی' : 'معافیت دائم',
      currentJob,
      organizationType,
      incomeRange,
      insuranceStatus: 'social_security',
      insuranceStatusFa: insuranceList.join('، '),
      insuranceList,
      housingStatus,
      housingStatusFa: housingStatus === 'owner' ? 'مالک شخصی' : housingStatus === 'tenant' ? 'اجاره‌ای' : 'همراه خانواده',
      vehicleStatus,
      vehicleStatusFa: vehicleStatus === 'personal_car' ? 'خودرو شخصی' : 'فاقد خودرو',
      financialIndependence,
    },
    religiousValues: {
      religion,
      denomination,
      marja,
      prayerStatus,
      prayerStatusFa: prayerStatus === 'always_strict' ? 'همیشه اول وقت' : 'همیشه عادی',
      prayerNotes,
      fastingStatus,
      fastingStatusFa: fastingStatus === 'always' ? 'همیشه' : 'گاهی',
      khumsStatus,
      khumsStatusFa: khumsStatus === 'committed_has_year' ? 'دارای سال خمسی' : 'فاقد سال خمسی',
      personalCovering,
      personalCoveringFa: personalCovering,
      familyCovering,
      coreValues: ['صداقت', 'پایبندی اخلاقی', 'حفظ حریم خانواده'],
    },
    personality: {
      isCounselingDeferred,
      mbti: isCounselingDeferred ? 'بررسی در مشاوره' : mbti,
      mbtiTitleFa: isCounselingDeferred ? 'در انتظار ارزیابی' : 'تیپ ارزیابی‌شده',
      attachmentStyle,
      personalityTraits,
      strengths: strengthsText.split('،').map((s) => s.trim()).filter(Boolean),
      weaknesses: weaknessesText.split('،').map((s) => s.trim()).filter(Boolean),
      personalityNotes,
      counselorImpression,
      bigFive: {
        conscientiousness: 80,
        extraversion: 70,
        agreeableness: 85,
        neuroticism: 25,
        openness: 75,
      },
    },
    marriagePreferences: {
      preferredPartnerCriteria: criteriaItems.map((c) => c.title),
      ageMin: Number(ageMin) || 20,
      ageMax: Number(ageMax) || 35,
      heightMin: Number(heightMin) || 155,
      heightMax: Number(heightMax) || 185,
      acceptableCities,
      minEducation,
      acceptableMaritalHistory: [maritalStatus],
      importantValues: ['اخلاق مداری', 'صداقت', 'احترام متقابل'],
      priorities: criteriaItems.filter((c) => c.importance === 'very_important').map((c) => c.title),
      dealBreakers: criteriaItems.filter((c) => c.flexibility === 'dealbreaker').map((c) => c.title),
      criteriaItems,
      religiousExpectations,
      financialExpectations,
    },
    files: [
      {
        id: 'file_id_doc',
        name: 'تصویر کارت ملی و شناسنامه.jpg',
        category: 'id_card',
        size: '۱.۲ مگابایت',
        uploadDate: '۱۴۰۴/۰۶/۰۱',
        url: '#',
        isConfidential: true,
      },
    ],
  };

  const qualityAnalysis = analyzeApplicantQuality(currentApplicantData);

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateCurrentStep()) return;

    const newId = 'app_' + Math.floor(1000 + Math.random() * 9000);
    const counselorUser = users.find((u) => u.id === assignedCounselorId) || users[0];

    const auditLog = createApplicantAuditLog(
      newId,
      `${firstName} ${lastName}`,
      'create',
      currentUser,
      'ثبت پرونده اولیه متقاضی جدید با تمامی ۳۳ فیلد اطلاعاتی',
      `ثبت شده توسط ${currentUser.name} (${currentUser.roleTitle})`
    );

    const fullApplicant: Applicant = {
      ...currentApplicantData,
      id: newId,
      caseCode: caseCode || `#PR-${Math.floor(10000 + Math.random() * 90000)}`,
      category,
      registrationDate: new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()),
      registrationMethod,
      lastUpdateDate: new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()),
      updateMethod: 'in_person',
      workflowStatus,
      status: 'active',
      isVip,
      photoUrl: gender === 'male'
        ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      counselorId: assignedCounselorId,
      counselorName: counselorUser.name,
      assignedEmployeeId: currentUser.role === 'employee' ? currentUser.id : undefined,
      assignedEmployeeName: currentUser.role === 'employee' ? currentUser.name : undefined,
      qualityScore: qualityAnalysis.qualityScore,
      completionPercentage: qualityAnalysis.completionPercentage,
      missingFields: qualityAnalysis.missingFields,
      improvementSuggestions: qualityAnalysis.suggestions,
      lastModifiedBy: {
        id: currentUser.id,
        name: currentUser.name,
        role: currentUser.role,
        timestamp: new Date().toISOString(),
      },
      auditHistory: [auditLog],
    } as Applicant;

    addApplicant(fullApplicant);
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    onSuccess(newId);
    onClose();
  };

  if (!isOpen) return null;

  const stepsList = [
    { num: 1, title: 'هویتی و تأهل', icon: <User className="w-4 h-4" /> },
    { num: 2, title: 'خانواده و والدین', icon: <Users className="w-4 h-4" /> },
    { num: 3, title: 'تحصیل و اشتغال', icon: <Briefcase className="w-4 h-4" /> },
    { num: 4, title: 'سلامت و مذهب', icon: <Heart className="w-4 h-4" /> },
    { num: 5, title: 'روانشناسی و معیارها', icon: <BrainCircuit className="w-4 h-4" /> },
    { num: 6, title: 'تأیید و ثبت نهایی', icon: <CheckCircle2 className="w-4 h-4" /> },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 text-right">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* Header Bar */}
        <div className="bg-slate-900 text-white px-6 py-3.5 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white">
                ثبت پرونده مراجع جدید (فرم استاندارد ۳۳ متغیره الزهرا)
              </h2>
              <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5">
                <span>کد پرونده: <span className="font-mono text-amber-400 font-bold">{caseCode}</span></span>
                <span>•</span>
                <span>ثبت‌کننده: {currentUser.name} ({currentUser.roleTitle})</span>
                {autoSavedTime && (
                  <>
                    <span>•</span>
                    <span className="text-emerald-400 flex items-center gap-1">
                      <Save className="w-3 h-3" /> ذخیره خودکار: {autoSavedTime}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Draft Recovery Banner */}
        {hasDraft && (
          <div className="bg-amber-50 border-b border-amber-200 px-6 py-2 flex items-center justify-between text-xs text-amber-900 shrink-0">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600 shrink-0" />
              <span>یک پیش‌نویس ذخیره‌شده از ثبت‌نام قبلی یافت شد. مایلید اطلاعات را بازیابی کنید؟</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={loadDraft}
                className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-1 rounded-md text-[11px] font-bold cursor-pointer transition-colors"
              >
                بازیابی پیش‌نویس
              </button>
              <button
                type="button"
                onClick={clearDraft}
                className="text-slate-500 hover:text-slate-700 px-2 py-1 text-[11px] cursor-pointer"
              >
                شروع مجدد
              </button>
            </div>
          </div>
        )}

        {/* Step Indicator & Progress */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-2.5 shrink-0">
          <div className="flex items-center justify-between gap-1 overflow-x-auto pb-1 sm:pb-0">
            {stepsList.map((step) => {
              const isDone = currentStep > step.num;
              const isCurrent = currentStep === step.num;
              return (
                <button
                  type="button"
                  key={step.num}
                  onClick={() => {
                    if (step.num < currentStep || validateCurrentStep()) {
                      setCurrentStep(step.num);
                    }
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    isCurrent
                      ? 'bg-amber-600 text-white shadow-xs'
                      : isDone
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span className="shrink-0">{isDone ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : step.icon}</span>
                  <span>{step.num}. {step.title}</span>
                </button>
              );
            })}
          </div>

          {/* Quality & Completion Micro-Bar */}
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-600 pt-1 border-t border-slate-200/60">
            <div className="flex items-center gap-2">
              <span>درصد تکمیل اطلاعات:</span>
              <div className="w-32 bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    qualityAnalysis.completionPercentage >= 80
                      ? 'bg-emerald-500'
                      : qualityAnalysis.completionPercentage >= 50
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                  }`}
                  style={{ width: `${qualityAnalysis.completionPercentage}%` }}
                ></div>
              </div>
              <span className="font-bold font-mono">{qualityAnalysis.completionPercentage}%</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">شاخص کیفیت:</span>
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${qualityAnalysis.gradeBadge.bg} ${qualityAnalysis.gradeBadge.color} border ${qualityAnalysis.gradeBadge.border}`}>
                {qualityAnalysis.gradeBadge.label} ({qualityAnalysis.qualityScore} از ۱۰۰)
              </span>
            </div>
          </div>
        </div>

        {/* Form Body with Scroll */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* ======================================================== */}
          {/* STEP 1: Basic & Identification & Gender & Birth & Marriage */}
          {/* ======================================================== */}
          {currentStep === 1 && (
            <div className="space-y-5 animate-in fade-in">
              <div className="bg-amber-50/50 border border-amber-200/70 p-3.5 rounded-xl text-xs text-amber-950 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-amber-900 mb-0.5">مرحله ۱: اطلاعات هویتی، سن و سابقه ازدواج</h3>
                  <p className="text-slate-600 text-[11px]">
                    جنسیت متقاضی در این مرحله ساختار فیلدهای پوشش، نظام وظیفه و معیارهای بعدی را تعیین می‌کند.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setGender('male')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      gender === 'male'
                        ? 'bg-blue-700 text-white shadow-xs ring-2 ring-blue-300'
                        : 'bg-white text-slate-700 border border-slate-300'
                    }`}
                  >
                    👨 متقاضی آقا (مرد)
                  </button>
                  <button
                    type="button"
                    onClick={() => setGender('female')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      gender === 'female'
                        ? 'bg-rose-700 text-white shadow-xs ring-2 ring-rose-300'
                        : 'bg-white text-slate-700 border border-slate-300'
                    }`}
                  >
                    👩 متقاضی خانم (زن)
                  </button>
                </div>
              </div>

              {/* Core Name and Identifiers */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    نام متقاضی <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="مثلاً: علیرضا"
                    className={`w-full bg-white border rounded-lg px-3 py-2 text-xs text-slate-800 outline-none ${
                      stepErrors.firstName ? 'border-red-400 bg-red-50/40 ring-1 ring-red-400' : 'border-slate-300 focus:border-amber-500'
                    }`}
                  />
                  {stepErrors.firstName && <p className="text-[11px] text-red-500 mt-1">{stepErrors.firstName}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    نام خانوادگی <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="مثلاً: رضایی مقدم"
                    className={`w-full bg-white border rounded-lg px-3 py-2 text-xs text-slate-800 outline-none ${
                      stepErrors.lastName ? 'border-red-400 bg-red-50/40 ring-1 ring-red-400' : 'border-slate-300 focus:border-amber-500'
                    }`}
                  />
                  {stepErrors.lastName && <p className="text-[11px] text-red-500 mt-1">{stepErrors.lastName}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    کد ملی (۱۰ رقم) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    maxLength={10}
                    value={nationalId}
                    onChange={(e) => setNationalId(e.target.value.replace(/[^0-9۰-۹]/g, ''))}
                    placeholder="۰۰۱۲۳۴۵۶۷۸"
                    className={`w-full bg-white border rounded-lg px-3 py-2 text-xs text-slate-800 font-mono outline-none ${
                      stepErrors.nationalId ? 'border-red-400 bg-red-50/40 ring-1 ring-red-400' : 'border-slate-300 focus:border-amber-500'
                    }`}
                  />
                  {stepErrors.nationalId && <p className="text-[11px] text-red-500 mt-1">{stepErrors.nationalId}</p>}
                </div>
              </div>

              {/* Birth Date Picker (Requirement 2: Empty by default, numbers only, standard solar, age validation) */}
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
                <PersianDatePicker
                  value={birthDate}
                  onChange={(date, age) => {
                    setBirthDate(date);
                    setCalculatedAge(age);
                  }}
                  required
                  error={stepErrors.birthDate}
                />
              </div>

              {/* Contacts & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    شماره همراه مستقیم <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                    className={`w-full bg-white border rounded-lg px-3 py-2 text-xs text-slate-800 font-mono outline-none ${
                      stepErrors.phone ? 'border-red-400 bg-red-50/40 ring-1 ring-red-400' : 'border-slate-300 focus:border-amber-500'
                    }`}
                  />
                  {stepErrors.phone && <p className="text-[11px] text-red-500 mt-1">{stepErrors.phone}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    شماره تماس والدین / معرف
                  </label>
                  <input
                    type="tel"
                    value={guardianPhone}
                    onChange={(e) => setGuardianPhone(e.target.value)}
                    placeholder="۰۲۱۲۲۳۳۴۴۵۵"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 font-mono outline-none focus:border-amber-500"
                  />
                </div>

                {/* Smart Search Select for City */}
                <SmartSearchSelect
                  label="شهر محل سکونت"
                  required
                  value={residenceCity}
                  onChange={setResidenceCity}
                  options={IRAN_CITIES}
                  placeholder="انتخاب یا جستجوی شهر..."
                  error={stepErrors.residenceCity}
                />

                {/* Smart Search Select for Ethnicity / Origin */}
                <SmartSearchSelect
                  label="اصالت و قومیت"
                  required
                  value={nationalityOrigin}
                  onChange={setNationalityOrigin}
                  options={ETHNICITY_ORIGINS}
                  placeholder="انتخاب اصالت خانوادگی..."
                  error={stepErrors.nationalityOrigin}
                />
              </div>

              {/* Physical Attributes & Address */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">قد (سانتی‌متر)</label>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 font-bold outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">وزن (کیلوگرم)</label>
                  <input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 font-bold outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">آدرس و محدوده سکونت</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="مثلاً: تهران، منطقه ۲، سعادت‌آباد"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Previous Marriage Section */}
              <div className="border-t border-slate-200 pt-4 space-y-3">
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-2">
                  <span>وضعیت سابقه ازدواج قبلی:</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'never_married', label: 'مجرد (فاقد سابقه ازدواج)' },
                    { id: 'failed_engagement', label: 'عقد و جدایی در دوران نامزدی' },
                    { id: 'divorced', label: 'متأهل سابق (جدا شده با زندگی مشترک)' },
                    { id: 'widowed', label: 'همسر فوت‌شده' },
                  ].map((m) => (
                    <button
                      type="button"
                      key={m.id}
                      onClick={() => setMaritalStatus(m.id as MaritalHistory)}
                      className={`p-2.5 rounded-xl border text-xs font-semibold text-right transition-all cursor-pointer ${
                        maritalStatus === m.id
                          ? 'bg-amber-50 border-amber-500 text-amber-900 ring-1 ring-amber-400'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>

                {maritalStatus !== 'never_married' && (
                  <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-3.5 grid grid-cols-1 sm:grid-cols-3 gap-3 animate-in fade-in">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        مدت زندگی مشترک قبلی
                      </label>
                      <input
                        type="text"
                        value={marriageDurationText}
                        onChange={(e) => setMarriageDurationText(e.target.value)}
                        placeholder="مثلاً: ۲ سال و ۶ ماه"
                        className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        علت جدایی یا فوت <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={separationReason}
                        onChange={(e) => setSeparationReason(e.target.value)}
                        placeholder="علت اصلی متارکه..."
                        className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 outline-none"
                      />
                      {stepErrors.separationReason && (
                        <p className="text-[11px] text-red-500 mt-1">{stepErrors.separationReason}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        تعداد فرزندان و حضانت
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={childrenCount}
                          onChange={(e) => setChildrenCount(e.target.value)}
                          placeholder="تعداد فرزند"
                          className="w-20 bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs text-slate-800 text-center font-bold"
                        />
                        <input
                          type="text"
                          value={childrenCustodyStatus}
                          onChange={(e) => setChildrenCustodyStatus(e.target.value)}
                          placeholder="شرح حضانت..."
                          className="flex-1 bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs text-slate-800"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 2: Family & Parents */}
          {/* ======================================================== */}
          {currentStep === 2 && (
            <div className="space-y-5 animate-in fade-in">
              <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-xs text-slate-700">
                <h3 className="font-bold text-slate-900 mb-0.5">مرحله ۲: بافت خانواده، والدین و خواهران/برادران</h3>
                <p className="text-slate-500 text-[11px]">
                  بررسی اصالت خانوادگی، تحصیلات و شغل والدین و فضای حاکم بر رشد فرد
                </p>
              </div>

              {/* Parents Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Father Card */}
                <div className="border border-slate-200 rounded-xl p-4 space-y-3 bg-white">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="font-bold text-slate-800 text-xs">مشخصات پدر:</span>
                    <label className="flex items-center gap-1.5 text-xs cursor-pointer text-slate-600">
                      <input
                        type="checkbox"
                        checked={fatherLiving}
                        onChange={(e) => setFatherLiving(e.target.checked)}
                        className="rounded text-amber-600"
                      />
                      <span>در قید حیات</span>
                    </label>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-slate-600 block mb-1">سن پدر:</label>
                      <input
                        type="text"
                        value={fatherAge}
                        onChange={(e) => setFatherAge(e.target.value)}
                        placeholder="مثلاً ۶۰"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-600 block mb-1">تحصیلات پدر:</label>
                      <input
                        type="text"
                        value={fatherEducation}
                        onChange={(e) => setFatherEducation(e.target.value)}
                        placeholder="دیپلم، کارشناسی..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-600 block mb-1">شغل پدر:</label>
                    <input
                      type="text"
                      value={fatherJob}
                      onChange={(e) => setFatherJob(e.target.value)}
                      placeholder="عنوان شغل پدر..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800"
                    />
                  </div>
                </div>

                {/* Mother Card */}
                <div className="border border-slate-200 rounded-xl p-4 space-y-3 bg-white">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="font-bold text-slate-800 text-xs">مشخصات مادر:</span>
                    <label className="flex items-center gap-1.5 text-xs cursor-pointer text-slate-600">
                      <input
                        type="checkbox"
                        checked={motherLiving}
                        onChange={(e) => setMotherLiving(e.target.checked)}
                        className="rounded text-amber-600"
                      />
                      <span>در قید حیات</span>
                    </label>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-slate-600 block mb-1">سن مادر:</label>
                      <input
                        type="text"
                        value={motherAge}
                        onChange={(e) => setMotherAge(e.target.value)}
                        placeholder="مثلاً ۵۵"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-600 block mb-1">تحصیلات مادر:</label>
                      <input
                        type="text"
                        value={motherEducation}
                        onChange={(e) => setMotherEducation(e.target.value)}
                        placeholder="دیپلم، کارشناسی..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-600 block mb-1">شغل مادر:</label>
                    <input
                      type="text"
                      value={motherJob}
                      onChange={(e) => setMotherJob(e.target.value)}
                      placeholder="خانه‌دار، معلم، کارمند..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* Siblings & Living Arrangement */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">وضعیت خواهران</label>
                  <input
                    type="text"
                    value={sistersCountAndStatus}
                    onChange={(e) => setSistersCountAndStatus(e.target.value)}
                    placeholder="مثلاً: ۱ خواهر متأهل، ۱ خواهر دانش‌آموز"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">وضعیت برادران</label>
                  <input
                    type="text"
                    value={brothersCountAndStatus}
                    onChange={(e) => setBrothersCountAndStatus(e.target.value)}
                    placeholder="مثلاً: ۲ برادر مجرد دانشجو"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">سکونت فعلی با چه کسانی است؟</label>
                  <input
                    type="text"
                    value={livingWith}
                    onChange={(e) => setLivingWith(e.target.value)}
                    placeholder="مثلاً: همراه والدین، مستقل مجردی"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none"
                  />
                </div>
              </div>

              {/* Family Culture & Economics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ترتیب تولد (فرزند چندم)</label>
                  <input
                    type="number"
                    value={birthOrder}
                    onChange={(e) => setBirthOrder(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">فضای فرهنگی حاکم بر خانواده</label>
                  <select
                    value={familyCulture}
                    onChange={(e) => setFamilyCulture(e.target.value as any)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 font-semibold"
                  >
                    <option value="religious">مذهبی و سنتی اصیل</option>
                    <option value="moderate">متعادل و مذهبی معتدل</option>
                    <option value="traditional">سنتی و پایبند به آداب</option>
                    <option value="modern">امروزی و بازتر</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">سطح اقتصادی خانواده</label>
                  <select
                    value={economicLevel}
                    onChange={(e) => setEconomicLevel(e.target.value as any)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 font-semibold"
                  >
                    <option value="modest">ساده و متوسط به پایین</option>
                    <option value="middle">متوسط جامعه</option>
                    <option value="upper_middle">متوسط رو به بالا (خوب)</option>
                    <option value="high">متمول و مرفه</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  یادداشت مشاور درباره فضای تربیتی و تعاملات خانوادگی:
                </label>
                <textarea
                  rows={2}
                  value={counselorFamilyNotes}
                  onChange={(e) => setCounselorFamilyNotes(e.target.value)}
                  placeholder="توضیحات در خصوص میزان صمیمیت، دخالت والدین یا استقلال فرد..."
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 outline-none"
                />
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 3: Education, Military, Job & Facilities */}
          {/* ======================================================== */}
          {currentStep === 3 && (
            <div className="space-y-5 animate-in fade-in">
              <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-xs text-slate-700">
                <h3 className="font-bold text-slate-900 mb-0.5">مرحله ۳: تحصیلات، وضعیت نظام وظیفه، اشتغال و امکانات مالی</h3>
                <p className="text-slate-500 text-[11px]">
                  بررسی توانمندی اقتصادی، ثبات شغلی و شرایط تحصیلی متقاضی
                </p>
              </div>

              {/* Academic Education */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    مقطع تحصیلی دانشگاهی <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={academicEducation}
                    onChange={(e) => setAcademicEducation(e.target.value as any)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 font-semibold outline-none"
                  >
                    <option value="diploma">دیپلم متوسطه</option>
                    <option value="associate">فوق دیپلم (کاردانی)</option>
                    <option value="bachelor">کارشناسی (لیسانس)</option>
                    <option value="master">کارشناسی ارشد (فوق لیسانس)</option>
                    <option value="phd">دکتری تخصصی / فوق دکتری</option>
                  </select>
                </div>

                {/* Smart Field of Study */}
                <SmartSearchSelect
                  label="رشته تحصیلی"
                  required
                  value={fieldOfStudy}
                  onChange={setFieldOfStudy}
                  options={FIELDS_OF_STUDY}
                  placeholder="انتخاب یا جستجوی رشته..."
                  error={stepErrors.fieldOfStudy}
                />

                {/* Smart University */}
                <SmartSearchSelect
                  label="دانشگاه محل تحصیل"
                  value={university}
                  onChange={setUniversity}
                  options={UNIVERSITIES}
                  placeholder="انتخاب یا جستجوی دانشگاه..."
                />
              </div>

              {/* Skills Multi-Select */}
              <SmartMultiSelect
                label="مهارت‌ها و زبان‌های خارجی"
                values={additionalSkills}
                onChange={setAdditionalSkills}
                options={SKILLS_LIST}
                placeholder="انتخاب مهارت‌ها، زبان‌ها و دوره‌های گذرانده‌شده..."
              />

              {/* Military Status (Requirement 4: Gender & Age dependent) */}
              <div className="border-t border-slate-200 pt-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-amber-600" />
                    <span>وضعیت خدمت نظام وظیفه:</span>
                  </label>
                  {gender === 'female' && (
                    <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold">
                      بانوان (شامل نمی‌شود)
                    </span>
                  )}
                  {gender === 'male' && calculatedAge !== undefined && calculatedAge < 18 && (
                    <span className="text-[11px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-bold">
                      زیر سن مشمولیت (زیر ۱۸ سال)
                    </span>
                  )}
                </div>

                {gender === 'female' ? (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500">
                    برای متقاضیان خانم، وضعیت نظام وظیفه به صورت خودکار «شامل نمی‌شود» ثبت می‌گردد.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                    {[
                      { id: 'completed', label: 'انجام شده (کارت پایان خدمت)' },
                      { id: 'in_progress', label: 'در حال انجام (سرباز)' },
                      { id: 'exempt_permanent', label: 'معافیت دائم (کفالت/ایثارگری)' },
                      { id: 'exempt_medical', label: 'معافیت پزشکی' },
                      { id: 'not_gone_yet', label: 'هنوز نرفته (معافیت تحصیلی)' },
                      { id: 'na', label: 'شامل نمی‌شود' },
                    ].map((m) => (
                      <button
                        type="button"
                        key={m.id}
                        onClick={() => setMilitaryStatus(m.id as MilitaryStatus)}
                        className={`p-2 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer ${
                          militaryStatus === m.id
                            ? 'bg-amber-50 border-amber-500 text-amber-900 ring-1 ring-amber-400 font-bold'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                )}
                {stepErrors.militaryStatus && (
                  <p className="text-[11px] text-red-500 mt-1.5">{stepErrors.militaryStatus}</p>
                )}
              </div>

              {/* Career & Financial Details */}
              <div className="border-t border-slate-200 pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <SmartSearchSelect
                  label="شغل فعلی"
                  required
                  value={currentJob}
                  onChange={setCurrentJob}
                  options={OCCUPATIONS}
                  placeholder="انتخاب یا نوشتن شغل..."
                  error={stepErrors.currentJob}
                />

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">نوع سازمان یا صنف</label>
                  <input
                    type="text"
                    value={organizationType}
                    onChange={(e) => setOrganizationType(e.target.value)}
                    placeholder="دولتی، خصوصی، آزاد..."
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">محدوده درآمد ماهانه</label>
                  <select
                    value={incomeRange}
                    onChange={(e) => setIncomeRange(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 font-semibold"
                  >
                    <option value="زیر ۱۵ میلیون تومان">زیر ۱۵ میلیون تومان</option>
                    <option value="۱۵ تا ۲۵ میلیون تومان">۱۵ تا ۲۵ میلیون تومان</option>
                    <option value="۲۵ تا ۳۵ میلیون تومان">۲۵ تا ۳۵ میلیون تومان</option>
                    <option value="۳۵ تا ۵۰ میلیون تومان">۳۵ تا ۵۰ میلیون تومان</option>
                    <option value="۵۰ تا ۸۰ میلیون تومان">۵۰ تا ۸۰ میلیون تومان</option>
                    <option value="بالای ۸۰ میلیون تومان">بالای ۸۰ میلیون تومان (عالی)</option>
                  </select>
                </div>
              </div>

              {/* Requirement 5: Insurance, Vehicle & Housing Options */}
              <div className="border-t border-slate-200 pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Multi-select Insurance */}
                <SmartMultiSelect
                  label="وضعیت بیمه (چند انتخابی)"
                  values={insuranceList}
                  onChange={setInsuranceList}
                  options={[
                    'تأمین اجتماعی',
                    'خدمات درمانی / سلامت',
                    'نیروهای مسلح',
                    'بیمه تکمیلی',
                    'بدون بیمه',
                  ]}
                  placeholder="انتخاب بیمه‌ها..."
                />

                {/* Housing */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">وضعیت مسکن</label>
                  <select
                    value={housingStatus}
                    onChange={(e) => setHousingStatus(e.target.value as HousingStatus)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 font-semibold"
                  >
                    <option value="owner">مالک شخصی مسکن</option>
                    <option value="tenant">اجاره‌ای مستقل</option>
                    <option value="mortgage">رهن کامل مستقل</option>
                    <option value="family">سکونت همراه خانواده</option>
                    <option value="organizational">مسکن سازمانی / شرکتی</option>
                    <option value="no_independent">بدون مسکن مستقل در حال حاضر</option>
                    <option value="other">سایر شرایط مسکن</option>
                  </select>
                </div>

                {/* Vehicle */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">وسیله نقلیه</label>
                  <select
                    value={vehicleStatus}
                    onChange={(e) => setVehicleStatus(e.target.value as VehicleStatus)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 font-semibold"
                  >
                    <option value="personal_car">خودرو شخصی</option>
                    <option value="motorcycle">موتورسیکلت</option>
                    <option value="company_car">خودرو سازمانی / کاری</option>
                    <option value="multiple_cars">چند خودرو</option>
                    <option value="none">ندارد</option>
                    <option value="other">سایر وسایل</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 4: Health, Religion & Coverings (Gender-Dependent) */}
          {/* ======================================================== */}
          {currentStep === 4 && (
            <div className="space-y-5 animate-in fade-in">
              <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-xs text-slate-700">
                <h3 className="font-bold text-slate-900 mb-0.5">مرحله ۴: سلامت جسمانی، اعتقادات مذهبی و سبک پوشش</h3>
                <p className="text-slate-500 text-[11px]">
                  بررسی پایبندی‌های شرعی، سال خمسی، مرجع تقلید، دخانیات و نوع پوشش هماهنگ با جنسیت
                </p>
              </div>

              {/* Health & Smoking */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">وضعیت سلامت و بیماری‌های خاص</label>
                  <input
                    type="text"
                    value={healthStatus}
                    onChange={(e) => setHealthStatus(e.target.value)}
                    placeholder="سالم و بدون بیماری مزمن..."
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">وضعیت مصرف دخانیات</label>
                  <select
                    value={smokingStatus}
                    onChange={(e) => setSmokingStatus(e.target.value as SmokingStatus)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 font-semibold"
                  >
                    <option value="none">فاقد هرگونه مصرف دخانیات (کاملاً پاک)</option>
                    <option value="occasional">گاهی تفریحی قلیان</option>
                    <option value="hookah_only">فقط قلیان</option>
                    <option value="smoker">سیگاری</option>
                  </select>
                </div>
              </div>

              {/* Requirement 6: Religious options (Prayers, Fasting, Khums) */}
              <div className="border-t border-slate-200 pt-4 space-y-4">
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-rose-600" />
                  <span>پایبندی‌های عبادی و اعتقادی:</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Prayer Status */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      وضعیت اقامه نماز <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={prayerStatus}
                      onChange={(e) => setPrayerStatus(e.target.value as PrayerStatus)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 font-semibold"
                    >
                      <option value="always_strict">همیشه انجام می‌دهد (اول وقت و مقید)</option>
                      <option value="always_regular">همیشه انجام می‌دهد (عادی)</option>
                      <option value="sometimes">گاهی انجام می‌دهد</option>
                      <option value="none">انجام نمی‌دهد</option>
                      <option value="improving">در حال اصلاح و بهبود</option>
                      <option value="no_info">فاقد اطلاعات فعلی / بررسی در مشاوره</option>
                    </select>
                  </div>

                  {/* Fasting Status */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      وضعیت روزه <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={fastingStatus}
                      onChange={(e) => setFastingStatus(e.target.value as FastingStatus)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 font-semibold"
                    >
                      <option value="always">همیشه (کامل و مقید)</option>
                      <option value="sometimes">گاهی</option>
                      <option value="none">انجام نمی‌دهد</option>
                      <option value="medical_excuse">به علت شرایط خاص یا پزشکی انجام نمی‌دهد</option>
                      <option value="no_info">فاقد اطلاعات فعلی / بررسی در مشاوره</option>
                    </select>
                  </div>

                  {/* Khums */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">وضعیت پرداخت خمس</label>
                    <select
                      value={khumsStatus}
                      onChange={(e) => setKhumsStatus(e.target.value as KhumsStatus)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 font-semibold"
                    >
                      <option value="committed_has_year">مقید و دارای سال خمسی مشخص</option>
                      <option value="not_committed">عدم پرداخت خمس</option>
                      <option value="unfamiliar">آشنایی محدود</option>
                      <option value="no_info">فاقد اطلاعات فعلی</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">مرجع تقلید</label>
                    <input
                      type="text"
                      value={marja}
                      onChange={(e) => setMarja(e.target.value)}
                      placeholder="نام مرجع عالیقدر..."
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">توضیحات مشاور درباره نماز و احکام</label>
                    <input
                      type="text"
                      value={prayerNotes}
                      onChange={(e) => setPrayerNotes(e.target.value)}
                      placeholder="یادداشت در خصوص رویکرد معنوی و واجبات..."
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Requirement 7: Gender-Dependent Coverings */}
              <div className="border-t border-slate-200 pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800">
                    سبک و نوع پوشش شخصی ({gender === 'male' ? 'آقا' : 'خانم'}):
                  </h4>
                  <span className="text-[11px] text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 font-bold">
                    منطبق بر جنسیت انتخابی
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(gender === 'male' ? MALE_COVERINGS : FEMALE_COVERINGS).map((cov) => (
                    <button
                      type="button"
                      key={cov.value}
                      onClick={() => setPersonalCovering(cov.value as PersonalCovering)}
                      className={`p-3 rounded-xl border text-xs text-right font-semibold transition-all cursor-pointer flex items-center justify-between ${
                        personalCovering === cov.value
                          ? 'bg-amber-50 border-amber-500 text-amber-900 ring-1 ring-amber-400 font-bold'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>{cov.label}</span>
                      {personalCovering === cov.value && <Check className="w-4 h-4 text-amber-600 shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 5: Personality (Deferrable) & Marriage Criteria */}
          {/* ======================================================== */}
          {currentStep === 5 && (
            <div className="space-y-6 animate-in fade-in">
              {/* Requirement 8: Personality Section can be deferred */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-white shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-2">
                      <BrainCircuit className="w-4 h-4 text-indigo-600" />
                      <span>ارزیابی روانشناختی و ویژگی‌های شخصیتی:</span>
                    </h3>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      امکان ثبت آزمون MBTI، سبک دلبستگی و نقاط قوت؛ یا ارجاع به جلسه مشاوره
                    </p>
                  </div>

                  {/* Toggle Defer to Counseling */}
                  <label className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-xl cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isCounselingDeferred}
                      onChange={(e) => setIsCounselingDeferred(e.target.checked)}
                      className="rounded text-indigo-600 w-4 h-4"
                    />
                    <span className="text-xs font-bold text-indigo-950">
                      تکمیل پس از جلسه مشاوره تخصصی
                    </span>
                  </label>
                </div>

                {isCounselingDeferred ? (
                  <div className="bg-indigo-50/70 border border-indigo-200 p-3.5 rounded-xl text-xs text-indigo-900 flex items-center gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0" />
                    <div>
                      <p className="font-bold">این بخش به کارشناس و مشاور ارشد ارجاع داده شد.</p>
                      <p className="text-[11px] text-indigo-700 mt-0.5">
                        پس از انجام جلسه مصاحبه بالینی، نتایج آزمون MBTI و سبک دلبستگی توسط مشاور در پرونده وارد خواهد شد.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">تیپ شخصیتی MBTI</label>
                        <select
                          value={mbti}
                          onChange={(e) => setMbti(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 font-bold"
                        >
                          {['INTJ', 'INTP', 'ENTJ', 'ENTP', 'INFJ', 'INFP', 'ENFJ', 'ENFP', 'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ', 'ISTP', 'ISFP', 'ESTP', 'ESFP'].map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">سبک دلبستگی عاطفی</label>
                        <select
                          value={attachmentStyle}
                          onChange={(e) => setAttachmentStyle(e.target.value as any)}
                          className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 font-semibold"
                        >
                          <option value="ایمن">ایمن (Secure)</option>
                          <option value="متمایل به اضطرابی">متمایل به اضطرابی (Anxious-Preoccupied)</option>
                          <option value="اجتنابی">اجتنابی و فاصله‌گیر (Dismissive-Avoidant)</option>
                          <option value="ناامن دوسوگرا">ناامن دوسوگرا (Fearful-Avoidant)</option>
                        </select>
                      </div>
                    </div>

                    <SmartMultiSelect
                      label="ویژگی‌های بارز شخصیتی"
                      values={personalityTraits}
                      onChange={setPersonalityTraits}
                      options={PERSONALITY_TRAITS}
                      placeholder="انتخاب ویژگی‌های رفتاری..."
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">نقاط قوت شخصیتی</label>
                        <input
                          type="text"
                          value={strengthsText}
                          onChange={(e) => setStrengthsText(e.target.value)}
                          placeholder="صداقت، مدیریت بحران..."
                          className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">نقاط ضعف / زمینه‌های رشد</label>
                        <input
                          type="text"
                          value={weaknessesText}
                          onChange={(e) => setWeaknessesText(e.target.value)}
                          placeholder="حساسیت بالا، کم‌صبر در گفتگو..."
                          className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Requirement 9: Partner Criteria with Importance (بسیار مهم تا فاقد اهمیت) and Dealbreaker / Negotiable */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-white shadow-2xs space-y-4">
                <h3 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-2">
                  <Heart className="w-4 h-4 text-amber-600" />
                  <span>معیارها، اولویت‌ها و خطوط قرمز انتخاب همسر ({gender === 'male' ? 'مشخصات خانم مورد نظر' : 'مشخصات آقا مورد نظر'}):</span>
                </h3>

                {/* Range Selectors */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">بازه سنی مورد نظر (سال)</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        value={ageMin}
                        onChange={(e) => setAgeMin(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-md p-1.5 text-xs text-center font-bold"
                        placeholder="از"
                      />
                      <span className="text-slate-400 text-xs">تا</span>
                      <input
                        type="number"
                        value={ageMax}
                        onChange={(e) => setAgeMax(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-md p-1.5 text-xs text-center font-bold"
                        placeholder="تا"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">بازه قدی مورد نظر (سانتی‌متر)</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        value={heightMin}
                        onChange={(e) => setHeightMin(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-md p-1.5 text-xs text-center font-bold"
                        placeholder="از"
                      />
                      <span className="text-slate-400 text-xs">تا</span>
                      <input
                        type="number"
                        value={heightMax}
                        onChange={(e) => setHeightMax(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-md p-1.5 text-xs text-center font-bold"
                        placeholder="تا"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">حداقل مدرک تحصیلی همسر</label>
                    <select
                      value={minEducation}
                      onChange={(e) => setMinEducation(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-md p-1.5 text-xs text-slate-800 font-semibold"
                    >
                      <option value="دیپلم">دیپلم به بالا</option>
                      <option value="کارشناسی">کارشناسی به بالا</option>
                      <option value="کارشناسی ارشد">کارشناسی ارشد و دکتری</option>
                    </select>
                  </div>

                  {/* Acceptable Cities Multi-Select */}
                  <SmartMultiSelect
                    label="شهرهای مورد پذیرش سکونت"
                    required
                    values={acceptableCities}
                    onChange={setAcceptableCities}
                    options={IRAN_CITIES}
                    placeholder="انتخاب شهرهای مجاز..."
                    error={stepErrors.acceptableCities}
                  />
                </div>

                {/* Criteria Matrix Table Component */}
                <CriteriaMatrix
                  criteria={criteriaItems}
                  onChange={setCriteriaItems}
                />
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 6: Final Review & Quality Score Summary */}
          {/* ======================================================== */}
          {currentStep === 6 && (
            <div className="space-y-6 animate-in fade-in">
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-emerald-950 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-emerald-900 text-sm flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>بررسی نهایی، ارزیابی کیفیت پرونده و ثبت نهایی</span>
                  </h3>
                  <p className="text-emerald-800 text-xs mt-0.5">
                    پرونده با اطلاعات کامل در سامانه CRM ثبت شده و در گردش کار قرار می‌گیرد.
                  </p>
                </div>
                <span className="text-xs bg-emerald-600 text-white px-3 py-1.5 rounded-lg font-bold">
                  آماده ذخیره
                </span>
              </div>

              {/* Quality & Completeness Card */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-center space-y-2">
                  <span className="text-xs text-slate-500 font-bold block">درصد تکمیل فیلدها</span>
                  <div className="text-3xl font-black text-slate-800 font-mono">
                    {qualityAnalysis.completionPercentage}%
                  </div>
                  <span className="text-[11px] text-slate-600">
                    {qualityAnalysis.missingFields.length === 0 ? 'تمامی فیلدهای ضروری تکمیل است' : `${qualityAnalysis.missingFields.length} فیلد اختیاری خالی است`}
                  </span>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-center space-y-2">
                  <span className="text-xs text-slate-500 font-bold block">امتیاز کیفیت داده</span>
                  <div className="text-3xl font-black text-amber-700 font-mono">
                    {qualityAnalysis.qualityScore} / ۱۰۰
                  </div>
                  <span className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded ${qualityAnalysis.gradeBadge.bg} ${qualityAnalysis.gradeBadge.color}`}>
                    {qualityAnalysis.gradeBadge.label}
                  </span>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-center space-y-2">
                  <span className="text-xs text-slate-500 font-bold block">تعداد خطوط قرمز (Deal-Breakers)</span>
                  <div className="text-3xl font-black text-red-700 font-mono">
                    {criteriaItems.filter((c) => c.flexibility === 'dealbreaker').length}
                  </div>
                  <span className="text-[11px] text-slate-600">ملاک‌های غیرقابل مذاکره در همسان‌گزینی</span>
                </div>
              </div>

              {/* Suggestions for improvement if any */}
              {qualityAnalysis.suggestions.length > 0 && (
                <div className="bg-amber-50/70 border border-amber-200 p-4 rounded-xl space-y-2">
                  <h4 className="font-bold text-amber-900 text-xs flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>پیشنهادات سیستم جهت ارتقای کیفیت و سرعت همسان‌گزینی:</span>
                  </h4>
                  <ul className="text-xs text-amber-950 space-y-1 pr-4 list-disc">
                    {qualityAnalysis.suggestions.map((s, idx) => (
                      <li key={idx}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Assignment & Workflow Status */}
              <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-4">
                <h4 className="font-bold text-slate-800 text-xs">تعیین وضعیت اولیه و مشاور مسئول پرونده:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      وضعیت اولیه در گردش کار (Workflow Status)
                    </label>
                    <select
                      value={workflowStatus}
                      onChange={(e) => setWorkflowStatus(e.target.value as ApplicantWorkflowStatus)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 font-bold"
                    >
                      <option value="NEW">ثبت اولیه (NEW)</option>
                      <option value="UNDER_REVIEW">در حال بررسی مدارک و تطبیق (UNDER_REVIEW)</option>
                      <option value="COUNSELING">ارجاع به جلسه مشاوره اولیه (COUNSELING)</option>
                      <option value="MATCHING">آماده برای پردازش موتور همسان‌گزینی (MATCHING)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      مشاور ارشد مسئول پرونده
                    </label>
                    <select
                      value={assignedCounselorId}
                      onChange={(e) => setAssignedCounselorId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 font-bold"
                    >
                      {users.filter(u => u.role === 'counselor' || u.role === 'internal_manager' || u.role === 'main_admin').map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.roleTitle})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3.5 flex items-center justify-between shrink-0">
          <div>
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handlePrevStep}
                className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
                <span>مرحله قبل</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="text-slate-500 hover:text-slate-800 px-3 py-2 text-xs font-medium cursor-pointer"
            >
              انصراف
            </button>

            {currentStep < 6 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="bg-amber-600 hover:bg-amber-700 text-white px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <span>مرحله بعد</span>
                <ChevronLeft className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>ثبت نهایی و تشکیل پرونده</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
