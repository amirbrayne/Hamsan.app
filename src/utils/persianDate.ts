// Iranian Solar Hijri (Jalali) Calendar Utilities and Exact Age Engine

export interface JalaliDate {
  year: number;
  month: number;
  day: number;
}

export const PERSIAN_MONTHS = [
  { value: '01', name: 'فروردین', days: 31 },
  { value: '02', name: 'اردیبهشت', days: 31 },
  { value: '03', name: 'خرداد', days: 31 },
  { value: '04', name: 'تیر', days: 31 },
  { value: '05', name: 'مرداد', days: 31 },
  { value: '06', name: 'شهریور', days: 31 },
  { value: '07', name: 'مهر', days: 30 },
  { value: '08', name: 'آبان', days: 30 },
  { value: '09', name: 'آذر', days: 30 },
  { value: '10', name: 'دی', days: 30 },
  { value: '11', name: 'بهمن', days: 30 },
  { value: '12', name: 'اسفند', days: 29 },
];

export const PERSIAN_WEEKDAYS = [
  'شنبه',
  'یک‌شنبه',
  'دوشنبه',
  'سه‌شنبه',
  'چهارشنبه',
  'پنج‌شنبه',
  'جمعه',
];

// Reference standard constants for the system
export const CURRENT_SOLAR_YEAR = 1405;
export const CURRENT_SOLAR_MONTH = 6;
export const CURRENT_SOLAR_DAY = 1;
export const CURRENT_SOLAR_DATE_STR = '1405/06/01';

/**
 * Converts Persian/Arabic digits to standard ASCII English digits
 */
export function toEnglishDigits(str: string | number | null | undefined): string {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/[۰٠]/g, '0')
    .replace(/[۱١]/g, '1')
    .replace(/[۲٢]/g, '2')
    .replace(/[۳٣]/g, '3')
    .replace(/[۴٤]/g, '4')
    .replace(/[۵٥]/g, '5')
    .replace(/[۶٦]/g, '6')
    .replace(/[۷٧]/g, '7')
    .replace(/[۸٨]/g, '8')
    .replace(/[۹٩]/g, '9');
}

/**
 * Converts ASCII digits to Persian digits
 */
export function toPersianDigits(num: number | string | null | undefined): string {
  if (num === null || num === undefined) return '';
  const str = String(num);
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return str.replace(/[0-9]/g, (d) => persianDigits[parseInt(d, 10)]);
}

/**
 * Checks if a string contains only digits
 */
export function isOnlyDigits(str: string): boolean {
  const normalized = toEnglishDigits(str).trim();
  return /^[0-9]+$/.test(normalized);
}

/**
 * Accurate Gregorian to Jalali (Solar Hijri) conversion algorithm
 */
export function gregorianToJalali(gy: number, gm: number, gd: number): { jy: number; jm: number; jd: number } {
  const g_d_m = [0, 31, (gy % 4 === 0 && gy % 100 !== 0) || (gy % 400 === 0) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const gy2 = (gm > 2) ? (gy + 1) : gy;
  let days = 355666 + (365 * gy) + Math.floor((gy2 + 3) / 4) - Math.floor((gy2 + 99) / 100) + Math.floor((gy2 + 399) / 400) + gd;
  for (let i = 0; i < gm; ++i) days += g_d_m[i];
  let jy = -1595 + (33 * Math.floor(days / 12053));
  days %= 12053;
  jy += 4 * Math.floor(days / 1461);
  days %= 1461;
  if (days > 365) {
    jy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }
  let jm: number;
  let jd: number;
  if (days < 186) {
    jm = 1 + Math.floor(days / 31);
    jd = 1 + (days % 31);
  } else {
    jm = 7 + Math.floor((days - 186) / 30);
    jd = 1 + ((days - 186) % 30);
  }
  return { jy, jm, jd };
}

/**
 * Determines if a Jalali year is a leap year (کبیسه)
 */
export function isLeapJalaliYear(jy: number): boolean {
  const breaks = [-61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210, 1635, 2060, 2097, 2192, 2262, 2324, 2394, 2456, 3178];
  let jp = breaks[0];
  if (jy < jp || jy >= breaks[breaks.length - 1]) return false;
  for (let i = 1; i < breaks.length; i++) {
    const jm = breaks[i];
    const jump = jm - jp;
    if (jy < jm) {
      const N = jy - jp;
      let leapJ = -14 + Math.floor(N / 33) * 8 + Math.floor(((N % 33) + 3) / 4);
      if (jump % 33 === 4 && jump - N === 4) leapJ += 1;
      const leap1 = -14 + Math.floor((N - 1) / 33) * 8 + Math.floor((((N - 1) % 33) + 3) / 4);
      return (leapJ - leap1) === 1;
    }
    jp = jm;
  }
  return false;
}

/**
 * Returns today's current Jalali date dynamically and accurately
 */
export function getTodayJalali(customDate?: Date): {
  year: number;
  month: number;
  day: number;
  dateString: string;
  formattedFa: string;
  monthName: string;
  fullDateFa: string;
} {
  const d = customDate || new Date();
  const conv = gregorianToJalali(d.getFullYear(), d.getMonth() + 1, d.getDate());
  
  // Guarantee fallback to system standard 1405/06/01 if year matches 2026/1405
  const year = conv.jy || CURRENT_SOLAR_YEAR;
  const month = conv.jm || CURRENT_SOLAR_MONTH;
  const day = conv.jd || CURRENT_SOLAR_DAY;

  const mm = month < 10 ? `0${month}` : `${month}`;
  const dd = day < 10 ? `0${day}` : `${day}`;
  const dateString = `${year}/${mm}/${dd}`;
  const formattedFa = `${toPersianDigits(year)}/${toPersianDigits(mm)}/${toPersianDigits(dd)}`;
  const monthName = PERSIAN_MONTHS[month - 1]?.name || 'شهریور';
  const fullDateFa = `${toPersianDigits(day)} ${monthName} ${toPersianDigits(year)}`;

  return {
    year,
    month,
    day,
    dateString,
    formattedFa,
    monthName,
    fullDateFa,
  };
}

/**
 * Parses any Jalali date string (e.g. "1390/01/01", "1390/1/1", "۱۳۹۰/۰۱/۰۱", "1390-01-01")
 */
export function parseJalaliDate(dateStr: string): { year: number; month: number; day: number; isValid: boolean } | null {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const clean = toEnglishDigits(dateStr).trim().replace(/[-.]/g, '/');
  const parts = clean.split('/').map((p) => parseInt(p.trim(), 10));

  if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
    const year = parts[0];
    const month = parts[1];
    const day = parts[2];
    const isValid = year >= 1300 && year <= 1450 && month >= 1 && month <= 12 && day >= 1 && day <= 31;
    return { year, month, day, isValid };
  }
  return null;
}

/**
 * Exact Jalali Age Calculator
 * 
 * STRICT COMPLIANCE RULES:
 * When reference date is 1405/06/01:
 * - Birth 1390/01/01 => Age 15 (1405 - 1390 = 15, birthday passed)
 * - Birth 1387/01/01 => Age 18 (1405 - 1387 = 18, birthday passed)
 * - Birth 1387/10/01 => Age 17 (1405 - 1387 = 18, birthday not yet reached this year, so 18 - 1 = 17)
 */
export function calculateAgeFromJalali(
  birthDate: string | JalaliDate | null | undefined,
  referenceDate?: string | JalaliDate | null
): number {
  if (!birthDate) return 0;

  let birth: JalaliDate | null = null;
  if (typeof birthDate === 'string') {
    const parsed = parseJalaliDate(birthDate);
    if (parsed && parsed.isValid) {
      birth = { year: parsed.year, month: parsed.month, day: parsed.day };
    }
  } else if (typeof birthDate === 'object' && birthDate.year) {
    birth = {
      year: Number(toEnglishDigits(birthDate.year)),
      month: Number(toEnglishDigits(birthDate.month)) || 1,
      day: Number(toEnglishDigits(birthDate.day)) || 1,
    };
  }

  if (!birth || !birth.year || isNaN(birth.year)) return 0;

  let ref: JalaliDate;
  if (!referenceDate) {
    const today = getTodayJalali();
    ref = { year: today.year, month: today.month, day: today.day };
  } else if (typeof referenceDate === 'string') {
    const parsedRef = parseJalaliDate(referenceDate);
    if (parsedRef && parsedRef.isValid) {
      ref = { year: parsedRef.year, month: parsedRef.month, day: parsedRef.day };
    } else {
      ref = { year: CURRENT_SOLAR_YEAR, month: CURRENT_SOLAR_MONTH, day: CURRENT_SOLAR_DAY };
    }
  } else {
    ref = {
      year: Number(toEnglishDigits(referenceDate.year)) || CURRENT_SOLAR_YEAR,
      month: Number(toEnglishDigits(referenceDate.month)) || CURRENT_SOLAR_MONTH,
      day: Number(toEnglishDigits(referenceDate.day)) || CURRENT_SOLAR_DAY,
    };
  }

  // Exact solar age calculation
  let age = ref.year - birth.year;
  if (ref.month < birth.month || (ref.month === birth.month && ref.day < birth.day)) {
    age -= 1;
  }

  return Math.max(0, age);
}

/**
 * Validates a solar birth date string in format YYYY/MM/DD or components
 */
export function validateSolarDate(
  yearStr: string,
  monthStr: string,
  dayStr: string,
  referenceDate?: string | JalaliDate
): {
  isValid: boolean;
  errorMessage?: string;
  age?: number;
  formattedDate?: string;
  formattedDateFa?: string;
  monthName?: string;
} {
  const y = parseInt(toEnglishDigits(yearStr), 10);
  const m = parseInt(toEnglishDigits(monthStr), 10);
  const d = parseInt(toEnglishDigits(dayStr), 10);

  if (!yearStr || isNaN(y)) {
    return { isValid: false, errorMessage: 'سال تولد شمسی وارد نشده است.' };
  }
  if (!monthStr || isNaN(m)) {
    return { isValid: false, errorMessage: 'ماه تولد انتخاب نشده است.' };
  }
  if (!dayStr || isNaN(d)) {
    return { isValid: false, errorMessage: 'روز تولد وارد نشده است.' };
  }

  // Year range check (e.g. 1310 to CURRENT_SOLAR_YEAR)
  if (y < 1310 || y > CURRENT_SOLAR_YEAR) {
    return { isValid: false, errorMessage: `سال تولد باید بین ۱۳۱۰ تا ${toPersianDigits(CURRENT_SOLAR_YEAR)} باشد.` };
  }

  // Month check (1-12)
  if (m < 1 || m > 12) {
    return { isValid: false, errorMessage: 'ماه تولد باید بین ۱ تا ۱۲ باشد.' };
  }

  // Day check
  const monthConfig = PERSIAN_MONTHS[m - 1];
  let maxDays = monthConfig ? monthConfig.days : 31;
  if (m === 12) {
    maxDays = isLeapJalaliYear(y) ? 30 : 29;
  }

  if (d < 1 || d > maxDays) {
    return {
      isValid: false,
      errorMessage: `روز تولد در ماه ${monthConfig?.name || m} سال ${toPersianDigits(y)} باید بین ۱ تا ${toPersianDigits(maxDays)} باشد.`,
    };
  }

  // Calculate age using exact Jalali engine
  const age = calculateAgeFromJalali({ year: y, month: m, day: d }, referenceDate);

  if (age < 15) {
    return {
      isValid: false,
      age,
      errorMessage: `سن متقاضی بر اساس تقویم جلالی ${toPersianDigits(age)} سال است؛ حداقل سن ثبت پرونده ۱۵ سال تمام می‌باشد.`,
    };
  }
  if (age > 85) {
    return {
      isValid: false,
      age,
      errorMessage: `سن متقاضی (${toPersianDigits(age)} سال) بیش از سقف مجاز (۸۵ سال) است.`,
    };
  }

  const mm = m < 10 ? `0${m}` : `${m}`;
  const dd = d < 10 ? `0${d}` : `${d}`;
  const formattedDate = `${y}/${mm}/${dd}`;
  const formattedDateFa = `${toPersianDigits(y)}/${toPersianDigits(mm)}/${toPersianDigits(dd)}`;

  return {
    isValid: true,
    age,
    formattedDate,
    formattedDateFa,
    monthName: monthConfig?.name,
  };
}

/**
 * Format a Jalali date string into a friendly Persian label
 */
export function formatJalaliFull(dateStr: string): string {
  const parsed = parseJalaliDate(dateStr);
  if (!parsed) return dateStr || '';
  const monthName = PERSIAN_MONTHS[parsed.month - 1]?.name || '';
  return `${toPersianDigits(parsed.day)} ${monthName} ${toPersianDigits(parsed.year)}`;
}

/**
 * Mandatory self-verification test runner
 */
export function runMandatoryJalaliTests(): { passed: boolean; results: { test: string; expected: number; actual: number; passed: boolean }[] } {
  const ref = '1405/06/01';
  const tests = [
    { name: '1390/01/01', expected: 15 },
    { name: '1387/01/01', expected: 18 },
    { name: '1387/10/01', expected: 17 },
  ];

  const results = tests.map((t) => {
    const actual = calculateAgeFromJalali(t.name, ref);
    return {
      test: `امروز: ${ref} | تولد: ${t.name}`,
      expected: t.expected,
      actual,
      passed: actual === t.expected,
    };
  });

  const passed = results.every((r) => r.passed);
  if (!passed) {
    console.error('CRITICAL: Jalali Date Engine Mandatory Test Failure', results);
  }
  return { passed, results };
}

// Auto-run verification on load
runMandatoryJalaliTests();

