import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Plus,
  Check,
  X,
  ChevronDown,
  Calendar,
  AlertCircle,
  Sparkles,
  Shield,
  Star,
  CheckCircle2
} from 'lucide-react';
import {
  PERSIAN_MONTHS,
  toEnglishDigits,
  toPersianDigits,
  validateSolarDate,
} from '../../utils/persianDate';
import { CriteriaImportance, CriteriaFlexibility, PartnerCriterionItem } from '../../types';

// ==========================================
// 1. SMART SEARCHABLE SINGLE-SELECT WITH ADD
// ==========================================
interface SmartSearchSelectProps {
  id?: string;
  label?: string;
  value: string;
  onChange: (val: string) => void;
  options: string[];
  placeholder?: string;
  allowCustom?: boolean;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  className?: string;
}

export const SmartSearchSelect: React.FC<SmartSearchSelectProps> = ({
  id,
  label,
  value,
  onChange,
  options,
  placeholder = 'انتخاب یا جستجو کنید...',
  allowCustom = true,
  required = false,
  error,
  disabled = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [customInput, setCustomInput] = useState('');
  const [showAddCustom, setShowAddCustom] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setShowAddCustom(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter((opt) =>
    opt.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (opt: string) => {
    onChange(opt);
    setIsOpen(false);
    setSearch('');
    setShowAddCustom(false);
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (customInput.trim()) {
      onChange(customInput.trim());
      setCustomInput('');
      setShowAddCustom(false);
      setIsOpen(false);
      setSearch('');
    }
  };

  return (
    <div className={`relative text-right ${className}`} ref={dropdownRef}>
      {label && (
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div
        id={id}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between bg-white border rounded-lg px-3 py-2 text-xs transition-all cursor-pointer select-none ${
          error
            ? 'border-red-400 bg-red-50/40 ring-1 ring-red-400'
            : isOpen
            ? 'border-amber-500 ring-2 ring-amber-100 shadow-xs'
            : 'border-slate-300 hover:border-slate-400'
        } ${disabled ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'text-slate-800'}`}
      >
        <span className={value ? 'font-medium text-slate-800' : 'text-slate-400'}>
          {value || placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-amber-600' : ''}`} />
      </div>

      {error && <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{error}</p>}

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 right-0 left-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl p-2 max-h-64 overflow-hidden flex flex-col text-right animate-in fade-in zoom-in-95">
          {/* Search Box */}
          <div className="relative mb-2 shrink-0">
            <Search className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="جستجو در گزینه‌ها..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pr-8 pl-3 py-1.5 text-xs text-slate-800 outline-none focus:border-amber-500 focus:bg-white transition-all"
            />
          </div>

          {/* Options List */}
          <div className="overflow-y-auto space-y-0.5 max-h-40 flex-1 pr-0.5">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => {
                const isSelected = opt === value;
                return (
                  <button
                    type="button"
                    key={opt}
                    onClick={() => handleSelect(opt)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer text-right ${
                      isSelected
                        ? 'bg-amber-50 text-amber-900 font-bold'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>{opt}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-amber-600 shrink-0" />}
                  </button>
                );
              })
            ) : (
              <div className="text-center py-3 text-slate-400 text-xs">
                موردی یافت نشد
              </div>
            )}
          </div>

          {/* Add Custom Option Section */}
          {allowCustom && (
            <div className="border-t border-slate-100 pt-2 mt-1 shrink-0">
              {!showAddCustom ? (
                <button
                  type="button"
                  onClick={() => setShowAddCustom(true)}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>افزودن مقدار دلخواه جدید...</span>
                </button>
              ) : (
                <div className="flex items-center gap-1.5 pt-1">
                  <input
                    type="text"
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    placeholder="عنوان دلخواه را بنویسید..."
                    className="flex-1 bg-slate-50 border border-amber-300 rounded-md px-2 py-1 text-xs outline-none focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustom}
                    className="bg-amber-600 hover:bg-amber-700 text-white px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer"
                  >
                    ثبت
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddCustom(false)}
                    className="text-slate-400 hover:text-slate-600 p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ==========================================
// 2. SMART MULTI-SELECT WITH CHIPS & CUSTOM
// ==========================================
interface SmartMultiSelectProps {
  id?: string;
  label?: string;
  values: string[];
  onChange: (vals: string[]) => void;
  options: string[];
  placeholder?: string;
  allowCustom?: boolean;
  required?: boolean;
  error?: string;
  className?: string;
}

export const SmartMultiSelect: React.FC<SmartMultiSelectProps> = ({
  id,
  label,
  values = [],
  onChange,
  options,
  placeholder = 'انتخاب گزینه‌ها...',
  allowCustom = true,
  required = false,
  error,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [customInput, setCustomInput] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (opt: string) => {
    if (values.includes(opt)) {
      onChange(values.filter((v) => v !== opt));
    } else {
      onChange([...values, opt]);
    }
  };

  const removeValue = (opt: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(values.filter((v) => v !== opt));
  };

  const addCustomOption = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customInput.trim();
    if (trimmed && !values.includes(trimmed)) {
      onChange([...values, trimmed]);
      setCustomInput('');
    }
  };

  const filteredOptions = options.filter((opt) =>
    opt.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={`relative text-right ${className}`} ref={dropdownRef}>
      {label && (
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {/* Container Box */}
      <div
        id={id}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full min-h-[38px] flex flex-wrap items-center gap-1.5 bg-white border rounded-lg p-1.5 text-xs transition-all cursor-pointer ${
          error
            ? 'border-red-400 bg-red-50/40 ring-1 ring-red-400'
            : isOpen
            ? 'border-amber-500 ring-2 ring-amber-100 shadow-xs'
            : 'border-slate-300 hover:border-slate-400'
        }`}
      >
        {values.length === 0 ? (
          <span className="text-slate-400 px-1 py-0.5">{placeholder}</span>
        ) : (
          values.map((v) => (
            <span
              key={v}
              className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-900 px-2 py-0.5 rounded-md text-[11px] font-semibold"
            >
              <span>{v}</span>
              <button
                type="button"
                onClick={(e) => removeValue(v, e)}
                className="hover:text-red-600 rounded-full p-0.5"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </span>
          ))
        )}
        <div className="mr-auto pl-1">
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-amber-600' : ''}`} />
        </div>
      </div>

      {error && <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{error}</p>}

      {/* Multi-Select Menu */}
      {isOpen && (
        <div className="absolute z-50 right-0 left-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl p-2 max-h-64 overflow-hidden flex flex-col text-right animate-in fade-in zoom-in-95">
          {/* Search */}
          <div className="relative mb-2 shrink-0">
            <Search className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="جستجوی سریع..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pr-8 pl-3 py-1 text-xs text-slate-800 outline-none focus:border-amber-500 focus:bg-white"
            />
          </div>

          {/* Options Grid / List */}
          <div className="overflow-y-auto space-y-0.5 max-h-40 flex-1 pr-0.5">
            {filteredOptions.map((opt) => {
              const isChecked = values.includes(opt);
              return (
                <div
                  key={opt}
                  onClick={() => toggleOption(opt)}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                    isChecked
                      ? 'bg-amber-50 text-amber-900 font-bold'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span>{opt}</span>
                  <div
                    className={`w-4 h-4 rounded border flex items-center justify-center ${
                      isChecked ? 'bg-amber-600 border-amber-600 text-white' : 'border-slate-300 bg-white'
                    }`}
                  >
                    {isChecked && <Check className="w-3 h-3" />}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add custom tag */}
          {allowCustom && (
            <div className="border-t border-slate-100 pt-2 mt-1 shrink-0 flex items-center gap-1.5">
              <input
                type="text"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="+ افزودن گزینه دلخواه..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-xs outline-none focus:border-amber-400"
              />
              <button
                type="button"
                onClick={addCustomOption}
                className="bg-amber-600 hover:bg-amber-700 text-white px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer shrink-0"
              >
                افزودن
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ==========================================
// 3. PERSIAN DATE PICKER (DIGITS-ONLY & STRICT VALIDATION)
// ==========================================
interface PersianDatePickerProps {
  id?: string;
  label?: string;
  value: string; // "1374/05/15" or ""
  onChange: (formattedDate: string, calculatedAge?: number) => void;
  required?: boolean;
  error?: string;
}

export const PersianDatePicker: React.FC<PersianDatePickerProps> = ({
  id,
  label = 'تاریخ تولد (شمسی)',
  value = '',
  onChange,
  required = true,
  error,
}) => {
  // Parse initial value
  const parts = (value || '').split('/');
  const [year, setYear] = useState(parts[0] || '');
  const [month, setMonth] = useState(parts[1] || '');
  const [day, setDay] = useState(parts[2] || '');
  const [validationMsg, setValidationMsg] = useState<string | null>(null);
  const [calculatedAge, setCalculatedAge] = useState<number | null>(null);

  // Sync state if external value changes
  useEffect(() => {
    if (value) {
      const p = value.split('/');
      if (p.length === 3) {
        setYear(p[0]);
        setMonth(p[1]);
        setDay(p[2]);
        const res = validateSolarDate(p[0], p[1], p[2]);
        if (res.isValid && res.age !== undefined) {
          setCalculatedAge(res.age);
          setValidationMsg(null);
        }
      }
    } else {
      setYear('');
      setMonth('');
      setDay('');
      setCalculatedAge(null);
    }
  }, [value]);

  const handleUpdate = (newY: string, newM: string, newD: string) => {
    // Digits only filtering
    const cleanY = toEnglishDigits(newY).replace(/[^0-9]/g, '').slice(0, 4);
    const cleanM = toEnglishDigits(newM).replace(/[^0-9]/g, '').slice(0, 2);
    const cleanD = toEnglishDigits(newD).replace(/[^0-9]/g, '').slice(0, 2);

    setYear(cleanY);
    setMonth(cleanM);
    setDay(cleanD);

    if (cleanY.length === 4 && cleanM && cleanD) {
      const result = validateSolarDate(cleanY, cleanM, cleanD);
      if (result.isValid && result.formattedDate) {
        setValidationMsg(null);
        setCalculatedAge(result.age || null);
        onChange(result.formattedDate, result.age);
      } else {
        setValidationMsg(result.errorMessage || 'تاریخ نامعتبر است');
        setCalculatedAge(null);
        onChange(`${cleanY}/${cleanM}/${cleanD}`);
      }
    } else {
      setValidationMsg(null);
      setCalculatedAge(null);
      if (cleanY || cleanM || cleanD) {
        onChange(`${cleanY}/${cleanM}/${cleanD}`);
      } else {
        onChange('');
      }
    }
  };

  return (
    <div className="text-right" id={id}>
      <div className="flex items-center justify-between mb-1">
        <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-amber-600" />
          <span>{label}</span>
          {required && <span className="text-red-500">*</span>}
        </label>
        {calculatedAge !== null && (
          <span className="text-[11px] bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full font-bold">
            سن: {toPersianDigits(calculatedAge)} سال تمام
          </span>
        )}
      </div>

      {/* 3-Part Strict Input Control */}
      <div className="grid grid-cols-12 gap-2">
        {/* Day */}
        <div className="col-span-3">
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={2}
            placeholder="روز (۱-۳۱)"
            value={day}
            onChange={(e) => handleUpdate(year, month, e.target.value)}
            className="w-full text-center bg-white border border-slate-300 rounded-lg py-2 px-1 text-xs text-slate-800 font-bold focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none"
          />
        </div>

        {/* Month Dropdown / Input */}
        <div className="col-span-5">
          <select
            value={month}
            onChange={(e) => handleUpdate(year, e.target.value, day)}
            className="w-full text-center bg-white border border-slate-300 rounded-lg py-2 px-2 text-xs text-slate-800 font-semibold focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none cursor-pointer"
          >
            <option value="">انتخاب ماه...</option>
            {PERSIAN_MONTHS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.value} - {m.name}
              </option>
            ))}
          </select>
        </div>

        {/* Year */}
        <div className="col-span-4">
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={4}
            placeholder="سال (مثلاً ۱۳۷۲)"
            value={year}
            onChange={(e) => handleUpdate(e.target.value, month, day)}
            className="w-full text-center bg-white border border-slate-300 rounded-lg py-2 px-1 text-xs text-slate-800 font-bold focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none"
          />
        </div>
      </div>

      {/* Error or validation prompt */}
      {(validationMsg || error) && (
        <p className="text-[11px] text-red-600 mt-1.5 flex items-center gap-1 font-medium bg-red-50 p-1.5 rounded border border-red-200">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{validationMsg || error}</span>
        </p>
      )}
    </div>
  );
};

// ==========================================
// 4. CRITERIA IMPORTANCE & FLEXIBILITY MATRIX
// ==========================================
interface CriteriaMatrixProps {
  criteria: PartnerCriterionItem[];
  onChange: (items: PartnerCriterionItem[]) => void;
}

export const CriteriaMatrix: React.FC<CriteriaMatrixProps> = ({ criteria, onChange }) => {
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('شخصی');

  const updateItem = (
    id: string,
    field: 'importance' | 'flexibility',
    val: CriteriaImportance | CriteriaFlexibility
  ) => {
    onChange(
      criteria.map((item) => {
        if (item.id === id) {
          return { ...item, [field]: val };
        }
        return item;
      })
    );
  };

  const removeCriterion = (id: string) => {
    onChange(criteria.filter((c) => c.id !== id));
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const newItem: PartnerCriterionItem = {
      id: 'crit_' + Math.random().toString(36).substr(2, 7),
      category: newCategory,
      title: newTitle.trim(),
      importance: 'important',
      flexibility: 'negotiable',
    };
    onChange([...criteria, newItem]);
    setNewTitle('');
  };

  return (
    <div className="space-y-3 text-right">
      <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-3 text-xs text-slate-700">
        <p className="font-bold text-amber-900 mb-1 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-600" />
          <span>تعیین دقیق درجه اهمیت و خطوط قرمز معیارهای همسرگزینی:</span>
        </p>
        <p className="text-slate-600 text-[11px]">
          برای هر ملاک، درجه اهمیت (بسیار مهم تا فاقد اهمیت) و وضعیت انعطاف (خط قرمز قطعی ⛔ یا قابل مذاکره 🤝) را مشخص فرمایید.
        </p>
      </div>

      <div className="space-y-2">
        {criteria.map((item) => (
          <div
            key={item.id}
            className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs hover:border-amber-300 transition-colors"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-2.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold">
                  {item.category}
                </span>
                <span className="font-bold text-slate-800 text-xs">{item.title}</span>
              </div>
              <button
                type="button"
                onClick={() => removeCriterion(item.id)}
                className="text-slate-400 hover:text-red-500 p-1 text-[11px] self-end sm:self-auto cursor-pointer"
                title="حذف معیار"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Selectors for Importance & Flexibility */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {/* Importance */}
              <div>
                <label className="text-[11px] text-slate-500 block mb-1">درجه اهمیت:</label>
                <select
                  value={item.importance}
                  onChange={(e) => updateItem(item.id, 'importance', e.target.value as CriteriaImportance)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs text-slate-800 font-medium outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="very_important">⭐⭐⭐ بسیار مهم (حیاتی)</option>
                  <option value="important">⭐⭐ مهم (اولویت بالا)</option>
                  <option value="moderate">⭐ متوسط (مطلوب)</option>
                  <option value="low_importance">کم‌اهمیت</option>
                  <option value="unimportant">فاقد اهمیت</option>
                </select>
              </div>

              {/* Flexibility */}
              <div>
                <label className="text-[11px] text-slate-500 block mb-1">وضعیت توافق و مذاکره:</label>
                <select
                  value={item.flexibility}
                  onChange={(e) => updateItem(item.id, 'flexibility', e.target.value as CriteriaFlexibility)}
                  className={`w-full border rounded-lg p-1.5 text-xs font-bold outline-none cursor-pointer ${
                    item.flexibility === 'dealbreaker'
                      ? 'bg-red-50 border-red-300 text-red-800'
                      : item.flexibility === 'negotiable'
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <option value="dealbreaker">⛔ خط قرمز قطعی (غیرقابل مذاکره)</option>
                  <option value="negotiable">🤝 قابل مذاکره و انعطاف‌پذیر</option>
                  <option value="indifferent">⚪ بدون اهمیت</option>
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add New Custom Criterion */}
      <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-3">
        <label className="block text-xs font-semibold text-slate-700 mb-2">
          + افزودن معیار اختصاصی جدید برای این مراجع:
        </label>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="عنوان معیار (مثلاً: علاقه به سکونت در خارج از کشور، عدم حضور در مشاغل شیفتی...)"
            className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 outline-none focus:border-amber-500"
          />
          <select
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs text-slate-700 outline-none"
          >
            <option value="شخصی">شخصی</option>
            <option value="خانوادگی">خانوادگی</option>
            <option value="اعتقادی">اعتقادی</option>
            <option value="شغلی">شغلی</option>
            <option value="سکونت">سکونت</option>
          </select>
          <button
            type="button"
            onClick={handleAddCustom}
            className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            ثبت معیار
          </button>
        </div>
      </div>
    </div>
  );
};
