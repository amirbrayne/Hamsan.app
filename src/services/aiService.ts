import { Applicant, MatchAnalysis, CounselingSession } from '../types';

export interface AISummaryResponse {
  briefPersona: string;
  keyStrengths: string[];
  recommendedPartnerProfile: string;
  counselorFocusPoints: string[];
  suggestedQuestions: string[];
}

export interface AIMatchAnalysisResponse {
  compatibilityVerdict: string;
  synergyHighlights: string[];
  potentialFrictionAreas: string[];
  counselingMeetingAgenda: string[];
}

export interface AICounselorAssistResponse {
  suggestedInterventions: string[];
  assessmentQuestions: string[];
  readinessChecklist: { item: string; checked: boolean }[];
}

export const AIService = {
  /**
   * Generates smart summary of an applicant profile
   */
  async generateProfileSummary(applicant: Applicant): Promise<AISummaryResponse> {
    // Simulated intelligent synthesis formatted specifically for Iranian marriage counseling context
    await new Promise((res) => setTimeout(res, 600));

    const eduLevel = applicant.educationJob?.educationLevelFa || applicant.educationSkills?.academicEducationFa || 'تحصیلات عالی';
    const job = applicant.educationJob?.jobTitle || applicant.careerFinancial?.currentJob || 'شاغل';
    const mbti = applicant.personality?.mbti || 'INTJ';
    const mbtiTitle = applicant.personality?.mbtiTitleFa || 'تحلیل‌گر';
    const attachment = applicant.personality?.attachmentStyle || 'ایمن';
    const traits = (applicant.personality?.keyTraits || applicant.personality?.personalityTraits || ['متعهد', 'صادق', 'مسئولیت‌پذیر']).slice(0, 3).join('، ');
    const famCult = applicant.familyInfo?.familyCultureType === 'traditional' ? 'اصیل و سنتی' : 'فرهیخته و منعطف';
    const conscientiousness = applicant.personality?.bigFive?.conscientiousness ?? 80;
    const minAge = applicant.marriagePreferences?.ageMin ?? (applicant.age ? applicant.age - 5 : 25);
    const maxAge = applicant.marriagePreferences?.ageMax ?? (applicant.age ? applicant.age + 5 : 35);
    const cities = (applicant.marriagePreferences?.acceptableCities || ['تهران']).join(' یا ');
    const minEdu = applicant.marriagePreferences?.minEducation || 'کارشناسی';

    return {
      briefPersona: `مراجع ${applicant.age || 30} ساله، دارای مدرک ${eduLevel} و شاغل به عنوان ${job}. با تیپ شخصیتی ${mbti} (${mbtiTitle}) و سبک دلبستگی ${attachment}. دارای روحیه ${traits}.`,
      keyStrengths: [
        'ثبات شغلی و استقلال مالی اثبات‌شده',
        `پشتوانه خانوادگی ${famCult}`,
        `میزان وظیفه‌شناسی بالا (${conscientiousness}٪ در آزمون پنج عاملی)`,
        'شفافیت در بیان انتظارات و خطوط قرمز ازدواج',
      ],
      recommendedPartnerProfile: `خانم/آقای ${minAge} تا ${maxAge} ساله، ساکن ${cities}، با تحصیلات حداقل ${minEdu} و تیپ‌های مکملی نظیر ${(applicant.marriagePreferences?.preferredMbtiList || ['ENFP', 'INFJ']).join('، ')}.`,
      counselorFocusPoints: [
        'بررسی انعطاف‌پذیری در تقسیم وظایف اقتصادی و خانوادگی',
        'سنجش میزان استقلال عاطفی از خانواده پدری در تصمیم‌گیری‌های کلان',
        'تطبیق انتظارات فرهنگی با طرف مقابل در جلسه دوم مشاوره',
      ],
      suggestedQuestions: [
        'در مواجهه با اختلاف نظر با همسر در زمینه اولویت‌های مالی، چه سازوکاری را برای توافق ترجیح می‌دهید؟',
        'انتظار شما از میزان معاشرت با بستگان درجه یک در طول هفته چگونه تعریف می‌شود؟',
        'چه ویژگی رفتاری را در طرف مقابل به عنوان خط قرمز غیرقابل مذاکره می‌دانید؟',
      ],
    };
  },

  /**
   * Performs deep AI matching analysis between two candidates
   */
  async analyzeMatchPairs(analysis: MatchAnalysis): Promise<AIMatchAnalysisResponse> {
    await new Promise((res) => setTimeout(res, 700));

    const { applicantA, applicantB, compatibilityScore } = analysis;
    const fileCodeA = applicantA?.fileCode || applicantA?.caseCode || '10001';
    const fileCodeB = applicantB?.fileCode || applicantB?.caseCode || '10002';
    const mbtiA = applicantA?.personality?.mbti || 'INTJ';
    const mbtiB = applicantB?.personality?.mbti || 'INFJ';

    return {
      compatibilityVerdict: `تطابق پرونده‌های #${fileCodeA} و #${fileCodeB} با شاخص کلان ${compatibilityScore}٪ نشان‌دهنده همپوشانی ممتاز در ارزش‌های اساسی و سبک زندگی است. تفاوت‌های شخصیتی در نقش مکمل ظاهر خواهند شد.`,
      synergyHighlights: [
        `ترکیب تیپ ${mbtiA} و ${mbtiB} دارای نرخ موفقیت و پایداری ۸۵٪ در پژوهش‌های بالینی مرکز است.`,
        'همسویی هر دو طرف در نگرش به تعهد مذهبی، سلامت اخلاقی و استقلال مالی اولیه.',
        'تطابق جغرافیایی ایده‌آل و نزدیکی پایگاه اجتماعی خانواده‌ها.',
      ],
      potentialFrictionAreas: [
        'اختلاف در تمایل به مراودات اجتماعی و نحوه گذراندن اوقات فراغت (درون‌گرایی در برابر برون‌گرایی).',
        'نیاز به هماهنگی اولیه درباره جزئیات مراسمات و آداب و رسوم خانوادگی.',
      ],
      counselingMeetingAgenda: [
        'بخش اول (۱۵ دقیقه): آشنایی کلی و مرور مسیر تحصیلی و شغلی',
        'بخش دوم (۲۰ دقیقه): گفتگو پیرامون خطوط قرمز و انتظارات از زندگی مشترک',
        'بخش سوم (۱۵ دقیقه): بررسی نحوه مدیریت تعارض و دیدگاه‌های اقتصادی',
        'جمع‌بندی مشاور (۱۰ دقیقه): ارائه تمرین خانگی و هماهنگی جلسه بعد',
      ],
    };
  },

  /**
   * Generates clinical counselor assistant advice
   */
  async getCounselorAssistantAdvice(sessions: CounselingSession[], applicant: Applicant): Promise<AICounselorAssistResponse> {
    await new Promise((res) => setTimeout(res, 500));

    return {
      suggestedInterventions: [
        'استفاده از تکنیک بازتاب احساسات برای کشف انگیزه‌های پنهان در ملاک‌های سخت‌گیرانه',
        'اجرای آزمون عملی حل مسئله مشترک در جلسه سوم معارفه',
        'آموزش الگوی گفتگوی بدون سرزنش (I-Statements) برای انتقال خواسته‌ها',
      ],
      assessmentQuestions: [
        'در جلسات قبلی چه حسی نسبت به میزان همدلی طرف مقابل دریافت کردید؟',
        'آیا احساس امنیت روانی در ابراز تفاوت‌های سلیقه‌ای برای شما فراهم بوده است؟',
      ],
      readinessChecklist: [
        { item: 'ثبات تصمیم‌گیری و تمایل آگاهانه به ازدواج', checked: true },
        { item: 'حل تعارض‌های حل‌نشده با خانواده مبدا', checked: true },
        { item: 'شفافیت در توانمندی‌های اقتصادی و مسکن', checked: true },
        { item: 'تطابق واقع‌بینانه انتظارات در آزمون سازگاری', checked: false },
      ],
    };
  },
};
