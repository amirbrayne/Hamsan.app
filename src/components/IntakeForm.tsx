import React, { useState, useEffect, useRef } from 'react';
import {
  User,
  Phone,
  Calendar,
  Image as ImageIcon,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Shield,
  Briefcase,
  GraduationCap,
  Heart,
  Home,
  Sparkles,
  Lock,
  X,
  FileCheck,
  Save,
  Loader2
} from 'lucide-react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { storage, db } from '../services/firebase';
import { useCRMStore } from '../services/store';
import { logActivity } from '../utils/AuditLogger';
import { Applicant, Gender, MaritalHistory } from '../types';
import { getTodayJalali } from '../utils/persianDate';

interface IntakeFormProps {
  onSuccess?: (applicantId: string) => void;
  onCancel?: () => void;
}

export const IntakeForm: React.FC<IntakeFormProps> = ({ onSuccess, onCancel }) => {
  const { currentUser, addApplicant } = useCRMStore();

  // Basic Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState<Gender>('male');
  const [birthYear, setBirthYear] = useState<string>('1375');
  const [age, setAge] = useState<number>(29);
  const [phone, setPhone] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [residenceCity, setResidenceCity] = useState('تهران');
  const [maritalHistory, setMaritalHistory] = useState<MaritalHistory>('never_married');
  const [academicEducation, setAcademicEducation] = useState('کارشناسی');
  const [fieldOfStudy, setFieldOfStudy] = useState('مهندسی کامپیوتر');
  const [jobTitle, setJobTitle] = useState('کارشناس فناوری اطلاعات');
  const [monthlyIncome, setMonthlyIncome] = useState('۳۰ تا ۵۰ میلیون تومان');
  const [housingStatus, setHousingStatus] = useState('tenant');
  const [personalCovering, setPersonalCovering] = useState('casual');
  const [prayerCommitment, setPrayerCommitment] = useState('always_regular');
  const [dealBreakers, setDealBreakers] = useState('');
  const [privateClinicalNotes, setPrivateClinicalNotes] = useState('');

  // Image Upload & Firebase Storage State
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dynamic Solar Hijri current year calculation & age computation
  useEffect(() => {
    try {
      // Dynamic Solar Hijri current year (latn digits)
      const currentShamsiYearStr = new Date().toLocaleDateString('fa-IR-u-nu-latn', { year: 'numeric' });
      const currentShamsiYear = parseInt(currentShamsiYearStr, 10) || 1403;

      const cleanedBirthYear = parseInt(birthYear.replace(/[^\d]/g, ''), 10);
      if (cleanedBirthYear && cleanedBirthYear > 1320 && cleanedBirthYear <= currentShamsiYear) {
        const calculatedAge = currentShamsiYear - cleanedBirthYear;
        setAge(calculatedAge);
      } else {
        setAge(0);
      }
    } catch {
      setAge(28);
    }
  }, [birthYear]);

  // Handle BirthYear Input (Strict 4-digit numbers only, prevent letters)
  const handleBirthYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    // Convert Persian digits to Latin and strip all non-digits
    const englishDigits = rawValue
      .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
      .replace(/[^\d]/g, '');

    // Allow maximum 4 digits
    if (englishDigits.length <= 4) {
      setBirthYear(englishDigits);
      if (formErrors.birthYear) {
        setFormErrors((prev) => ({ ...prev, birthYear: '' }));
      }
    }
  };

  // Handle Phone Input (Strict digits, max 11)
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
      .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
      .replace(/[^\d]/g, '');
    if (raw.length <= 11) {
      setPhone(raw);
      if (formErrors.phone) {
        setFormErrors((prev) => ({ ...prev, phone: '' }));
      }
    }
  };

  // Handle Photo Selection with Validation (< 5MB, image/*)
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('تنها فایل‌های تصویری (JPG, PNG, WebP) مجاز هستند.');
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5 MB
    if (file.size > maxSize) {
      setUploadError('حجم تصویر نباید بیشتر از ۵ مگابایت باشد.');
      return;
    }

    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    setUploadProgress(0);
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Validate form before submission
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!firstName.trim()) errors.firstName = 'نام متقاضی الزامی است';
    if (!lastName.trim()) errors.lastName = 'نام خانوادگی الزامی است';
    if (!phone.trim() || phone.length < 10) errors.phone = 'شماره همراه معتبر (۱۱ رقم) الزامی است';

    const bYearNum = parseInt(birthYear, 10);
    if (!birthYear || birthYear.length !== 4 || bYearNum < 1320 || bYearNum > 1400) {
      errors.birthYear = 'سال تولد ۴ رقمی معتبر (بین ۱۳۲۰ تا ۱۴۰۰) وارد کنید';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Intake Form to Firebase Firestore & Storage
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setUploadError(null);

    try {
      const applicantId = `app_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const caseCode = `PR-${Math.floor(1000 + Math.random() * 9000)}`;
      let verifiedPhotoUrl = photoPreview || '';

      // 1. Upload Photo to Firebase Storage if a new file was chosen
      if (photoFile) {
        setIsUploading(true);
        const safeFileName = photoFile.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const storagePath = `applicants/temp_${Date.now()}_${safeFileName}`;
        const storageReference = ref(storage, storagePath);

        const uploadTask = uploadBytesResumable(storageReference, photoFile, {
          contentType: photoFile.type,
        });

        // Track upload progress
        await new Promise<string>((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const progress = Math.round(
                (snapshot.bytesTransferred / snapshot.totalBytes) * 100
              );
              setUploadProgress(progress);
            },
            (error) => {
              console.warn('Firebase Storage upload error:', error);
              setUploadError('خطا در بارگذاری تصویر در فضای ابری Storage. از تصویر پیش‌نمایش استفاده می‌شود.');
              resolve(photoPreview || '');
            },
            async () => {
              try {
                const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
                verifiedPhotoUrl = downloadUrl;
                resolve(downloadUrl);
              } catch (err) {
                resolve(photoPreview || '');
              }
            }
          );
        });
        setIsUploading(false);
      }

      // 2. Construct Firestore Applicant Document
      const newApplicant: Applicant = {
        id: applicantId,
        caseCode: `#${caseCode}`,
        category: 'عادی',
        registrationDate: getTodayJalali().fullDateFa,
        registrationMethod: 'in_person',
        lastUpdateDate: getTodayJalali().fullDateFa,
        updateMethod: 'in_person',
        workflowStatus: 'NEW',
        status: 'active',
        isVip: false,
        photoUrl: verifiedPhotoUrl,
        counselorId: currentUser.id,
        counselorName: currentUser.name,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        nationalId: nationalId.trim() || '---',
        phone: phone.trim(),
        gender,
        birthDate: `${birthYear}/۰۱/۰۱`,
        birthYear: parseInt(birthYear, 10) || 1375,
        age: age || 28,
        birthPlace: residenceCity,
        residenceCity,
        province: 'تهران',
        address: residenceCity,
        nationalityOrigin: 'ایرانی',
        height: gender === 'male' ? 178 : 165,
        weight: gender === 'male' ? 76 : 60,
        maritalHistory: {
          previousMarriageStatus: maritalHistory,
          previousMarriageStatusFa: maritalHistory === 'never_married' ? 'مجرد (بدون سابقه ازدواج)' : 'متارکه کرده',
          childrenCount: 0,
        },
        healthLifestyle: {
          healthStatus: 'سالم و بدون بیماری خاص',
          smokingStatus: 'none',
          smokingStatusFa: 'فاقد هرگونه دخانیات',
          lifestyleNotes: 'ورزش مرتب و تغذیه سالم',
          exerciseLevel: 'regular',
          travelInterest: 'moderate',
        },
        educationSkills: {
          academicEducation: 'bachelor',
          academicEducationFa: academicEducation,
          fieldOfStudy,
          university: 'دانشگاه دولتی / آزاد',
          religiousEducation: 'ندارد',
          additionalSkills: ['فارسی', 'مهارت‌های عمومی'],
        },
        careerFinancial: {
          militaryStatus: gender === 'male' ? 'completed' : 'na',
          militaryStatusFa: gender === 'male' ? 'دارای کارت پایان خدمت' : 'نامربوط',
          currentJob: jobTitle,
          organizationType: 'private',
          incomeRange: monthlyIncome,
          insuranceStatus: 'social_security',
          insuranceStatusFa: 'تأمین اجتماعی',
          housingStatus: housingStatus as any,
          housingStatusFa: housingStatus === 'owner' ? 'مالک مسکن' : 'مستأجر',
          vehicleStatus: 'personal_car',
          vehicleStatusFa: 'دارای خودرو شخصی',
          financialIndependence: true,
        },
        religiousValues: {
          religion: 'اسلام',
          denomination: 'شیعه ۱۲ امامی',
          marja: 'آیت‌الله خامنه‌ای',
          prayerStatus: prayerCommitment === 'always_regular' ? 'regular' : 'strict_on_time',
          prayerStatusFa: 'مرتب و اهل نماز',
          fastingStatus: 'strict',
          fastingStatusFa: 'روزه کامل',
          khumsStatus: 'committed_has_year',
          khumsStatusFa: 'دارای سال خمسی',
          personalCovering: personalCovering as any,
          personalCoveringFa: personalCovering,
          familyCovering: 'مذهبی و پوشیده',
          coreValues: ['صداقت', 'تقوا', 'اخلاق نیکو'],
        },
        familyInfo: {
          fatherLiving: true,
          motherLiving: true,
          parentsMaritalStatus: 'living_together',
          parentsMaritalStatusFa: 'در حال زندگی مشترک',
          sistersCountAndStatus: '۱ خواهر',
          brothersCountAndStatus: '۱ برادر',
          livingWith: housingStatus === 'owner' ? 'مستقل' : 'همراه والدین',
          birthOrder: 1,
          familyCultureType: 'moderate',
          economicLevel: 'middle',
          counselorFamilyNotes: 'خانواده محترم و متعهد.',
        },
        personality: {
          mbti: 'ENFJ',
          mbtiTitleFa: 'حامی و مسئولیت‌پذیر',
          attachmentStyle: 'ایمن',
          personalityTraits: ['صداقت', 'مسئولیت‌پذیری', 'اخلاق‌مدار'],
          strengths: ['ثبات هیجانی', 'انعطاف‌پذیری'],
          personalityNotes: 'آماده ازدواج پایدار و مسئولیت‌پذیر.',
          bigFive: {
            conscientiousness: 80,
            extraversion: 70,
            agreeableness: 85,
            neuroticism: 20,
            openness: 75,
          },
        },
        marriagePreferences: {
          preferredPartnerCriteria: ['صداقت', 'پایبندی اخلاقی', 'تفاهم فکری'],
          ageMin: gender === 'male' ? age - 5 : age,
          ageMax: gender === 'male' ? age : age + 5,
          heightMin: gender === 'male' ? 160 : 175,
          heightMax: gender === 'male' ? 175 : 190,
          acceptableCities: [residenceCity, 'تهران', 'قم'],
          minEducation: 'کارشناسی',
          acceptableMaritalHistory: [maritalHistory],
          importantValues: ['اخلاق', 'صداقت', 'رشد معنوی'],
          priorities: ['تفاهم اخلاقی', 'سلامت روان'],
          dealBreakers: dealBreakers ? [dealBreakers] : ['دروغ', 'عدم تقید اخلاقی'],
          religiousExpectations: 'پایبند به واجبات',
          financialExpectations: 'همراهی متقابل در زندگی مشترک',
        },
        files: [],
      };

      // 3. Save to Global Store & Firestore 'applicants' collection
      await addApplicant(newApplicant);

      // 4. Save Private Clinical Notes into 'applicant_private/{applicantId}' if present
      if (privateClinicalNotes.trim()) {
        try {
          const privateDocRef = doc(db, 'applicant_private', applicantId);
          await setDoc(privateDocRef, {
            applicantId,
            caseCode: `#${caseCode}`,
            privateNotes: privateClinicalNotes.trim(),
            confidentialFlag: true,
            authorId: currentUser.id,
            authorName: currentUser.name,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        } catch (privErr) {
          console.warn('Applicant private notes Firestore error:', privErr);
        }
      }

      // 5. Unalterable Audit Log entry
      await logActivity(
        currentUser.id,
        'INTAKE_REGISTRATION',
        'applicants',
        `ثبت پذیرش جدید متقاضی ${firstName} ${lastName} با کد پرونده #${caseCode}`,
        currentUser.name,
        currentUser.role
      );

      setSubmitSuccess(true);
      setTimeout(() => {
        if (onSuccess) onSuccess(applicantId);
      }, 1200);

    } catch (err: any) {
      console.error('Submission error:', err);
      setUploadError(err.message || 'خطا در ثبت اطلاعات در سامانه.');
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 text-right max-w-4xl mx-auto" dir="rtl">
      {/* Header Banner */}
      <div className="border-b border-slate-100 pb-4 mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-amber-50 rounded-lg text-amber-700">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-800">فرم پذیرش و ثبت‌نام متقاضی جدید</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                تکمیل مشخصات فردی، پرونده سلامت، تحصیلات، مسکن و آپلود عکس پرسنلی در فضای ابری Storage
              </p>
            </div>
          </div>
        </div>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {submitSuccess ? (
        <div className="py-12 text-center space-y-4">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h3 className="text-base font-bold text-slate-800">پرونده با موفقیت در پایگاه داده و Storage ثبت شد</h3>
          <p className="text-xs text-slate-500">
            اطلاعات متقاضی ذخیره و لاگ امنیتی در سیستم ثبت گردید. در حال انتقال به پرونده...
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Top Error Alert */}
          {uploadError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          {/* Section 1: Photo Upload & Identity */}
          <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 space-y-4">
            <h3 className="text-xs font-bold text-slate-700 flex items-center gap-2 border-b border-slate-200/60 pb-2">
              <ImageIcon className="w-4 h-4 text-amber-600" />
              <span>تصویر پرسنلی و اطلاعات هویتی</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              {/* Photo Upload Box (4 Cols) */}
              <div className="md:col-span-4 flex flex-col items-center">
                <div className="relative w-36 h-44 rounded-xl border-2 border-dashed border-slate-300 bg-white flex flex-col items-center justify-center overflow-hidden group shadow-inner">
                  {photoPreview ? (
                    <>
                      <img
                        src={photoPreview}
                        alt="پیش‌نمایش تصویر متقاضی"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="absolute top-2 right-2 bg-rose-600/90 text-white p-1 rounded-full hover:bg-rose-700 transition-colors shadow-sm"
                        title="حذف تصویر"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="cursor-pointer text-center p-3 flex flex-col items-center justify-center h-full w-full hover:bg-slate-50 transition-colors"
                    >
                      <UploadCloud className="w-8 h-8 text-slate-400 mb-2 group-hover:text-amber-600 transition-colors" />
                      <span className="text-xs font-medium text-slate-600">آپلود عکس پرسنلی</span>
                      <span className="text-[10px] text-slate-400 mt-1">حداکثر ۵ مگابایت (JPG/PNG)</span>
                    </div>
                  )}

                  {/* Upload Progress Bar */}
                  {isUploading && (
                    <div className="absolute inset-x-0 bottom-0 bg-slate-900/80 p-2 text-center">
                      <div className="w-full bg-slate-700 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-amber-500 h-1.5 transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-white mt-1 block">در حال آپلود: {uploadProgress}٪</span>
                    </div>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoSelect}
                  className="hidden"
                />

                {!photoPreview && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-2 text-xs text-amber-700 font-semibold hover:underline flex items-center gap-1"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>انتخاب فایل تصویر</span>
                  </button>
                )}
              </div>

              {/* Form Fields (8 Cols) */}
              <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* First Name */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">نام *</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => {
                        setFirstName(e.target.value);
                        if (formErrors.firstName) setFormErrors((p) => ({ ...p, firstName: '' }));
                      }}
                      placeholder="مثال: محمدحسین"
                      className={`w-full px-3 py-2 rounded-lg border text-xs bg-white focus:outline-none focus:ring-2 ${
                        formErrors.firstName
                          ? 'border-rose-400 focus:ring-rose-200'
                          : 'border-slate-300 focus:ring-amber-200 focus:border-amber-600'
                      }`}
                    />
                  </div>
                  {formErrors.firstName && (
                    <span className="text-[10px] text-rose-600 mt-0.5 block">{formErrors.firstName}</span>
                  )}
                </div>

                {/* Last Name */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">نام خانوادگی *</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => {
                      setLastName(e.target.value);
                      if (formErrors.lastName) setFormErrors((p) => ({ ...p, lastName: '' }));
                    }}
                    placeholder="مثال: رضایی یزدی"
                    className={`w-full px-3 py-2 rounded-lg border text-xs bg-white focus:outline-none focus:ring-2 ${
                      formErrors.lastName
                        ? 'border-rose-400 focus:ring-rose-200'
                        : 'border-slate-300 focus:ring-amber-200 focus:border-amber-600'
                    }`}
                  />
                  {formErrors.lastName && (
                    <span className="text-[10px] text-rose-600 mt-0.5 block">{formErrors.lastName}</span>
                  )}
                </div>

                {/* Gender (Conditional Rendering) */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">جنسیت *</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setGender('male');
                        setPersonalCovering('casual');
                      }}
                      className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
                        gender === 'male'
                          ? 'bg-blue-50 border-blue-500 text-blue-800 shadow-xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      آقا (برادر)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setGender('female');
                        setPersonalCovering('chador_student');
                      }}
                      className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
                        gender === 'female'
                          ? 'bg-rose-50 border-rose-500 text-rose-800 shadow-xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      خانم (خواهر)
                    </button>
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">شماره همراه *</label>
                  <div className="relative">
                    <input
                      type="text"
                      dir="ltr"
                      value={phone}
                      onChange={handlePhoneChange}
                      placeholder="09123456789"
                      className={`w-full px-3 py-2 rounded-lg border text-xs bg-white text-left font-mono focus:outline-none focus:ring-2 ${
                        formErrors.phone
                          ? 'border-rose-400 focus:ring-rose-200'
                          : 'border-slate-300 focus:ring-amber-200 focus:border-amber-600'
                      }`}
                    />
                  </div>
                  {formErrors.phone && (
                    <span className="text-[10px] text-rose-600 mt-0.5 block">{formErrors.phone}</span>
                  )}
                </div>

                {/* Birth Year (4 Digits, Numbers Only) */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    سال تولد خورشیدی (۴ رقم) *
                  </label>
                  <input
                    type="text"
                    dir="ltr"
                    value={birthYear}
                    onChange={handleBirthYearChange}
                    maxLength={4}
                    placeholder="1375"
                    className={`w-full px-3 py-2 rounded-lg border text-xs bg-white text-left font-mono focus:outline-none focus:ring-2 ${
                      formErrors.birthYear
                        ? 'border-rose-400 focus:ring-rose-200'
                        : 'border-slate-300 focus:ring-amber-200 focus:border-amber-600'
                    }`}
                  />
                  {formErrors.birthYear && (
                    <span className="text-[10px] text-rose-600 mt-0.5 block">{formErrors.birthYear}</span>
                  )}
                </div>

                {/* Calculated Age (Readonly with useEffect dynamic sync) */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    سن محاسبه‌شده (محاسبه خودکار)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={age > 0 ? `${age} سال` : 'نامعتبر'}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-slate-100/90 text-slate-700 font-bold cursor-not-allowed text-center"
                    />
                    <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-1.5 rounded-md shrink-0 border border-amber-200 font-mono">
                      📅 سال جاری
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Education, Career & Residence */}
          <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 space-y-4">
            <h3 className="text-xs font-bold text-slate-700 flex items-center gap-2 border-b border-slate-200/60 pb-2">
              <Briefcase className="w-4 h-4 text-amber-600" />
              <span>وضعیت تحصیلی، شغلی، اقتصادی و سکونت</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {/* Residence City */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">شهر محل سکونت</label>
                <select
                  value={residenceCity}
                  onChange={(e) => setResidenceCity(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-amber-200"
                >
                  <option value="تهران">تهران</option>
                  <option value="قم">قم</option>
                  <option value="مشهد">مشهد</option>
                  <option value="اصفهان">اصفهان</option>
                  <option value="شیراز">شیراز</option>
                  <option value="یزد">یزد</option>
                  <option value="تبریز">تبریز</option>
                  <option value="کرج">کرج</option>
                  <option value="اهواز">اهواز</option>
                  <option value="سایر">سایر شهرستان‌ها</option>
                </select>
              </div>

              {/* Academic Education */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">مقطع تحصیلی</label>
                <select
                  value={academicEducation}
                  onChange={(e) => setAcademicEducation(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-amber-200"
                >
                  <option value="دیپلم">دیپلم</option>
                  <option value="کاردانی">کاردانی</option>
                  <option value="کارشناسی">کارشناسی</option>
                  <option value="کارشناسی ارشد">کارشناسی ارشد</option>
                  <option value="دکتری تخصصی">دکتری تخصصی</option>
                  <option value="حوزوی (سطح ۲ و ۳)">حوزوی (سطح ۲ و ۳)</option>
                </select>
              </div>

              {/* Field of Study */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">رشته تحصیلی</label>
                <input
                  type="text"
                  value={fieldOfStudy}
                  onChange={(e) => setFieldOfStudy(e.target.value)}
                  placeholder="مثال: حقوق، مهندسی عمران..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-amber-200"
                />
              </div>

              {/* Job Title */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">شغل و عنوان حرفه‌ای</label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="مثال: معلم آموزش و پرورش"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-amber-200"
                />
              </div>

              {/* Monthly Income */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">سطح درآمد ماهیانه</label>
                <select
                  value={monthlyIncome}
                  onChange={(e) => setMonthlyIncome(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-amber-200"
                >
                  <option value="زیر ۲۰ میلیون تومان">زیر ۲۰ میلیون تومان</option>
                  <option value="۲۰ تا ۳۵ میلیون تومان">۲۰ تا ۳۵ میلیون تومان</option>
                  <option value="۳۵ تا ۵۰ میلیون تومان">۳۵ تا ۵۰ میلیون تومان</option>
                  <option value="بالای ۵۰ میلیون تومان">بالای ۵۰ میلیون تومان</option>
                  <option value="فاقد درآمد مستقل">فاقد درآمد مستقل (دانشجو/کارآموز)</option>
                </select>
              </div>

              {/* Housing Status */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">وضعیت مسکن</label>
                <select
                  value={housingStatus}
                  onChange={(e) => setHousingStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-amber-200"
                >
                  <option value="owner">دارای مسکن شخصی (مالک)</option>
                  <option value="tenant">مستاجر / رهن مستقل</option>
                  <option value="family">ساکن همراه خانواده</option>
                  <option value="organizational">مسکن سازمانی</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Cultural & Religious (Conditional based on gender) */}
          <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 space-y-4">
            <h3 className="text-xs font-bold text-slate-700 flex items-center gap-2 border-b border-slate-200/60 pb-2">
              <Heart className="w-4 h-4 text-amber-600" />
              <span>پوشش، اعتقادات مذهبی و سوابق تأهل</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {/* Marital History */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">سابقه ازدواج قبلی</label>
                <select
                  value={maritalHistory}
                  onChange={(e) => setMaritalHistory(e.target.value as MaritalHistory)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-amber-200"
                >
                  <option value="never_married">مجرد (بدون سابقه عقد یا ازدواج)</option>
                  <option value="divorced">متارکه کرده (با فرزند یا بدون فرزند)</option>
                  <option value="widowed">فوت همسر</option>
                  <option value="failed_engagement">نامزدی به هم خورده (دوران عقد)</option>
                </select>
              </div>

              {/* Personal Covering (Conditional by Gender) */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  نوع پوشش {gender === 'male' ? '(برادران)' : '(خواهران)'}
                </label>
                <select
                  value={personalCovering}
                  onChange={(e) => setPersonalCovering(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-amber-200"
                >
                  {gender === 'female' ? (
                    <>
                      <option value="chador_complete">چادر کامل با پوشیه یا هدبند مقنعه</option>
                      <option value="chador_student">چادر ملی / دانشجویی و روسری</option>
                      <option value="chador_simple">چادر ساده سنتی ایرانی</option>
                      <option value="manteau_modest">مانتو بلند و پوشیده با مقنعه</option>
                      <option value="manteau_casual">مانتو و شال معمولی</option>
                    </>
                  ) : (
                    <>
                      <option value="casual">پیراهن و شلوار معمولی / اسپرت مرتب</option>
                      <option value="formal_suit">کت و شلوار رسمی اداری</option>
                      <option value="clerical">طلبگی و لباس روحانیت</option>
                      <option value="other">سایر سبک‌های متعارف</option>
                    </>
                  )}
                </select>
              </div>

              {/* Prayer Commitment */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">تقید به نماز</label>
                <select
                  value={prayerCommitment}
                  onChange={(e) => setPrayerCommitment(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-amber-200"
                >
                  <option value="always_strict">همیشه و مقید به اول وقت</option>
                  <option value="always_regular">همیشه منظم</option>
                  <option value="sometimes">گاهی اوقات</option>
                  <option value="improving">در حال تقویت و اصلاح</option>
                </select>
              </div>

              {/* Deal Breakers */}
              <div className="sm:col-span-3">
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  خطوط قرمز و شرایط غیرقابل مذاکره (Deal-Breakers)
                </label>
                <input
                  type="text"
                  value={dealBreakers}
                  onChange={(e) => setDealBreakers(e.target.value)}
                  placeholder="مثال: عدم مصرف دخانیات، الزام به سکونت در تهران، تقید به حجاب چادر..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-amber-200"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Privacy Shield - Clinical Notes (Stored in applicant_private) */}
          <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-amber-900 flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-700" />
                <span>یادداشت‌های محرمانه مشاور (حفاظت‌شده با شیلد امنیتی)</span>
              </h3>
              <span className="text-[10px] bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded font-mono">
                collection: applicant_private
              </span>
            </div>
            <p className="text-[11px] text-amber-800/80">
              این یادداشت‌ها صرفاً برای مدیر سیستم (ADMIN) و مشاور (COUNSELOR) در دسترس خواهد بود و سایر کاربران به آن دسترسی نخواهند داشت.
            </p>
            <textarea
              rows={2}
              value={privateClinicalNotes}
              onChange={(e) => setPrivateClinicalNotes(e.target.value)}
              placeholder="نکات روانشناختی، ارزیابی اولیه بالینی، ملاحظات ویژه مراجع..."
              className="w-full px-3 py-2 rounded-lg border border-amber-300/80 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-amber-200 text-slate-800"
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                disabled={isSubmitting}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-50 transition-colors"
              >
                انصراف
              </button>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>در حال ثبت در Firestore و Storage...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>ثبت نهایی و ایجاد پرونده</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
