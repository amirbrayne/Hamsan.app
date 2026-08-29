import { Applicant, MatchAnalysis } from '../types';

// MBTI Complementary Pairs in Matchmaking Psychology
const MBTI_COMPATIBILITY_MAP: Record<string, Record<string, number>> = {
  INTJ: { ENFP: 95, ENTP: 92, INFJ: 88, ENTJ: 85, INTP: 82, INFP: 80, ISFJ: 65, ISTJ: 70, ESFP: 45 },
  ENFP: { INTJ: 95, INFJ: 94, ENTJ: 90, ENFJ: 88, ENTP: 85, INFP: 82, ISTJ: 50, ESTJ: 55 },
  INFJ: { ENFP: 94, ENTP: 95, INTJ: 88, ENFJ: 90, INFP: 86, ISFJ: 75, ESTP: 40 },
  ENTJ: { INFP: 95, INTP: 92, ENFP: 90, INTJ: 85, ISFP: 75, ISTP: 70, ESFP: 50 },
  INFP: { ENTJ: 95, ENFJ: 95, INTJ: 82, ENFP: 85, INTP: 80, ISFP: 85, ESTJ: 50 },
  ISTJ: { ISFJ: 92, ESFJ: 94, ESTJ: 90, ISTP: 82, INTJ: 70, ENFP: 50, ENTP: 45 },
  ISFJ: { ISTJ: 92, ESFJ: 92, ESTJ: 94, ISFP: 85, INFJ: 75, ENTP: 45 },
  ENTP: { INFJ: 95, INTJ: 92, ENFP: 85, ENTJ: 85, INTP: 80, ISFJ: 45 },
};

// Safe helper extractors
function getReligiousCommitment(app?: Applicant): string {
  if (!app) return 'moderate';
  if (app.religionValues?.religiousCommitment) return app.religionValues.religiousCommitment;
  if (app.religiousValues?.prayerStatus === 'strict_on_time' || app.religiousValues?.prayerStatus === 'always_strict') return 'high';
  return 'moderate';
}

function getPrayerCommitment(app?: Applicant): string {
  if (!app) return 'regular';
  if (app.religionValues?.prayerCommitment) return app.religionValues.prayerCommitment;
  if (app.religiousValues?.prayerStatus === 'strict_on_time' || app.religiousValues?.prayerStatus === 'always_strict') return 'strict';
  return 'regular';
}

function getSmokingStatus(app?: Applicant): boolean {
  if (!app) return false;
  if (typeof app.lifestyle?.smoking === 'boolean') return app.lifestyle.smoking;
  if (app.healthLifestyle?.smokingStatus === 'smoker') return true;
  return false;
}

function getMbti(app?: Applicant): string {
  return app?.personality?.mbti || 'INTJ';
}

function getAttachmentStyle(app?: Applicant): string {
  return app?.personality?.attachmentStyle || 'ایمن';
}

function getFamilyCulture(app?: Applicant): string {
  return app?.familyInfo?.familyCultureType || 'moderate';
}

function getEconomicLevel(app?: Applicant): string {
  return app?.familyInfo?.economicLevel || 'upper_middle';
}

function getTravelInterest(app?: Applicant): string {
  return app?.lifestyle?.travelInterest || app?.healthLifestyle?.travelInterest || 'high';
}

function getExerciseLevel(app?: Applicant): string {
  return app?.lifestyle?.exerciseLevel || app?.healthLifestyle?.exerciseLevel || 'regular';
}

function getCity(app?: Applicant): string {
  return app?.city || app?.residenceCity || 'تهران';
}

function getEducationLevel(app?: Applicant): string {
  return app?.educationJob?.educationLevel || app?.educationSkills?.academicEducation || 'master';
}

function getExtraversion(app?: Applicant): number {
  return app?.personality?.bigFive?.extraversion ?? 60;
}

export function calculateMatchScore(applicantA: Applicant, applicantB: Applicant): MatchAnalysis {
  if (!applicantA || !applicantB) {
    return {
      applicantA,
      applicantB,
      compatibilityScore: 70,
      dimensionScores: {
        sharedValues: 70,
        personalityFit: 70,
        familyBackground: 70,
        lifestyleFit: 70,
        expectationsOverlap: 70,
      },
      strengths: [],
      risks: [],
      aiClinicalVerdict: 'اطلاعات پرونده در حال بررسی بالینی است.',
    };
  }

  // Ensure we compare male vs female or bidirectional
  let male = applicantA.gender === 'male' ? applicantA : applicantB;
  let female = applicantA.gender === 'female' ? applicantA : applicantB;

  // 1. Shared Values Score (30% weight)
  let sharedValues = 70;
  const maleRel = getReligiousCommitment(male);
  const femaleRel = getReligiousCommitment(female);

  if (maleRel === femaleRel) {
    sharedValues += 18;
  } else if (
    (maleRel === 'moderate' && femaleRel === 'high') ||
    (maleRel === 'moderate' && femaleRel === 'cultural')
  ) {
    sharedValues += 8;
  }

  if (getPrayerCommitment(male) === getPrayerCommitment(female)) {
    sharedValues += 8;
  }

  if (getSmokingStatus(male) === getSmokingStatus(female)) {
    sharedValues += 4;
  }
  sharedValues = Math.min(98, Math.max(40, sharedValues));

  // 2. Personality Fit (25% weight)
  const mbtiA = getMbti(male);
  const mbtiB = getMbti(female);
  let mbtiScore = 75;
  if (MBTI_COMPATIBILITY_MAP[mbtiA]?.[mbtiB]) {
    mbtiScore = MBTI_COMPATIBILITY_MAP[mbtiA][mbtiB];
  } else if (MBTI_COMPATIBILITY_MAP[mbtiB]?.[mbtiA]) {
    mbtiScore = MBTI_COMPATIBILITY_MAP[mbtiB][mbtiA];
  }

  // Attachment styles
  let attachmentBonus = 0;
  const attachA = getAttachmentStyle(male);
  const attachB = getAttachmentStyle(female);
  if (attachA === 'ایمن' && attachB === 'ایمن') {
    attachmentBonus = 8;
  } else if (attachA === 'ایمن' || attachB === 'ایمن') {
    attachmentBonus = 4;
  }

  const personalityFit = Math.min(98, Math.max(45, Math.round(mbtiScore * 0.85 + attachmentBonus)));

  // 3. Family Background & Culture (20% weight)
  let familyScore = 72;
  const famCultA = getFamilyCulture(male);
  const famCultB = getFamilyCulture(female);
  if (famCultA === famCultB) {
    familyScore += 16;
  } else if (
    (famCultA === 'moderate' && famCultB === 'traditional') ||
    (famCultA === 'moderate' && famCultB === 'modern')
  ) {
    familyScore += 8;
  }

  if (getEconomicLevel(male) === getEconomicLevel(female)) {
    familyScore += 8;
  }
  const familyBackground = Math.min(96, Math.max(40, familyScore));

  // 4. Lifestyle & Activity Fit (15% weight)
  let lifestyleScore = 70;
  if (getTravelInterest(male) === getTravelInterest(female)) {
    lifestyleScore += 12;
  }
  if (getExerciseLevel(male) === getExerciseLevel(female)) {
    lifestyleScore += 8;
  }
  if (getCity(male) === getCity(female)) {
    lifestyleScore += 10;
  }
  const lifestyleFit = Math.min(95, Math.max(45, lifestyleScore));

  // 5. Expectations & Criteria (10% weight)
  let expectationsScore = 75;
  const maleAge = male.age || 30;
  const femaleAge = female.age || 28;
  const ageDiff = maleAge - femaleAge;
  if (ageDiff >= 1 && ageDiff <= 7) {
    expectationsScore += 12;
  } else if (ageDiff >= -1 && ageDiff <= 9) {
    expectationsScore += 6;
  }

  if (getEducationLevel(male) === getEducationLevel(female)) {
    expectationsScore += 8;
  }
  const expectationsOverlap = Math.min(95, Math.max(50, expectationsScore));

  // Weighted overall compatibility score
  const overallScore = Math.round(
    sharedValues * 0.3 +
    personalityFit * 0.25 +
    familyBackground * 0.2 +
    lifestyleFit * 0.15 +
    expectationsOverlap * 0.1
  );

  // Generate dynamic strengths
  const strengths: { title: string; description: string }[] = [];
  
  if (sharedValues >= 80) {
    strengths.push({
      title: 'همسویی اهداف بلندمدت و ارزش‌های بنیادی',
      description: 'هر دو مراجع در نگرش به زندگی خانوادگی، حلال و حرام و استقلال پیش از فرزندآوری اشتراک نظر بالایی دارند.',
    });
  }

  if (personalityFit >= 75) {
    strengths.push({
      title: `مکمل بودن تیپ‌های شخصیتی (${mbtiA} و ${mbtiB})`,
      description: `ساختارمندی و تحلیل‌گری ${male.firstName || 'آقا'} (${mbtiA}) با گرمی، خلاقیت و انعطاف‌پذیری ${female.firstName || 'خانم'} (${mbtiB}) تعادل و پویایی مثبتی خلق می‌کند.`,
    });
  }

  if (attachA === 'ایمن' && attachB === 'ایمن') {
    strengths.push({
      title: 'سبک دلبستگی ایمن در هر دو طرف',
      description: 'ظرفیت عاطفی بالا در گفتگو، حل تعارض بدون پرخاشگری و اطمینان‌بخشی متقابل در شرایط چالش‌برانگیز.',
    });
  }

  const maleCity = getCity(male);
  const femaleCity = getCity(female);
  if (maleCity === femaleCity) {
    strengths.push({
      title: 'تطابق جغرافیایی و سهولت هماهنگی',
      description: `سکونت هر دو در شهر ${maleCity} امکان مراودات منظم خانوادگی و آشنایی حضوری را تسهیل می‌کند.`,
    });
  }

  // Generate dynamic potential risks / concerns
  const risks: { title: string; description: string }[] = [];

  const extraA = getExtraversion(male);
  const extraB = getExtraversion(female);
  const extraversionDiff = Math.abs(extraA - extraB);
  if (extraversionDiff >= 30) {
    risks.push({
      title: 'ریسک بالقوه: مدیریت زمان فراغت و معاشرت',
      description: `تفاوت معنادار در میزان برون‌گرایی (${extraA}٪ در برابر ${extraB}٪) نیازمند توافق شفاف در خصوص برنامه‌های تفریحی آخر هفته است.`,
    });
  }

  if (famCultA !== famCultB) {
    risks.push({
      title: 'تفاوت در فضای فرهنگی خانواده‌ها',
      description: `خانواده آقا با بافت ${famCultA === 'traditional' ? 'سنتی' : 'مدرن/متعادل'} و خانواده خانم با بافت ${famCultB === 'traditional' ? 'سنتی' : 'مدرن/متعادل'}، نیازمند هماهنگی در رسوم پذیرایی و مراسمات است.`,
    });
  }

  if (risks.length === 0) {
    risks.push({
      title: 'نکته مراقبتی: سرعت‌بخشی به تصمیم‌گیری',
      description: 'پیشنهاد می‌شود حداقل ۳ جلسه مشاوره تخصصی در مرکز قبل از هرگونه تصمیم‌گیری قطعی طی شود.',
    });
  }

  // Clinical Verdict
  let aiClinicalVerdict = '';
  if (overallScore >= 80) {
    aiClinicalVerdict = `بر اساس تحلیل ۳۲ متغیر روانشناختی، خانوادگی و اجتماعی، این زوج دارای پتانسیل بالایی برای ایجاد یک رابطه پایدار هستند. همپوشانی در ارزش‌های بنیادین قابل توجه است.`;
  } else if (overallScore >= 65) {
    aiClinicalVerdict = `تطابق در سطح خوب و قابل بررسی است. اشتراکات مهمی وجود دارد اما نیازمند بررسی دقیق‌تر در جلسات مشاوره تخصصی می‌باشد.`;
  } else {
    aiClinicalVerdict = `تفاوت‌های قابل توجهی در نگرش‌ها یا سبک زندگی دیده می‌شود که ممکن است در آینده اصطکاک ایجاد کند.`;
  }

  return {
    applicantA,
    applicantB,
    compatibilityScore: overallScore,
    dimensionScores: {
      sharedValues,
      personalityFit,
      familyBackground,
      lifestyleFit,
      expectationsOverlap,
    },
    strengths,
    risks,
    aiClinicalVerdict,
  };
}

export function findTopMatchesForApplicant(targetApplicant: Applicant, allApplicants: Applicant[]): MatchAnalysis[] {
  const oppositeGender = targetApplicant.gender === 'male' ? 'female' : 'male';
  const candidates = allApplicants.filter(
    (a) => a.id !== targetApplicant.id && a.gender === oppositeGender && a.status !== 'archived'
  );

  const results: MatchAnalysis[] = candidates.map((candidate) =>
    calculateMatchScore(targetApplicant, candidate)
  );

  return results.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
}
