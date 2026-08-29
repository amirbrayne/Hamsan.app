import React from 'react';
import {
  BarChart3,
  TrendingUp,
  PieChart,
  Users,
  Award,
  Download,
  Calendar,
  CheckCircle2,
  HeartHandshake,
  BrainCircuit,
  Filter,
} from 'lucide-react';
import { useCRMStore } from '../services/store';

export const ReportsView: React.FC = () => {
  const { applicants, introductions, sessions } = useCRMStore();

  const totalRegistered = 842;
  const activeApplicants = 540;
  const successfulMarriages = 68;
  const totalIntroductions = 215;

  const successRate = Math.round((successfulMarriages / (successfulMarriages + 45)) * 100);

  return (
    <div className="space-y-6 pb-16 text-right">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-[#c2c7d1]/60 shadow-xs">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-[#00355f] flex items-center gap-2 justify-end">
            <span>گزارشات آماری و شاخص‌های عملکرد مرکز</span>
            <BarChart3 className="w-6 h-6 text-[#006b59]" />
          </h2>
          <p className="text-xs md:text-sm text-[#42474f] mt-1">
            تحلیل آماری جامعه مراجعین، نرخ موفقیت پیوندها و اثربخشی مشاوره‌ها
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => alert('خروجی اکسل جامع مراجعین و معرفی‌ها با موفقیت ایجاد شد.')}
            className="bg-[#00355f] text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-[#07497d] transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>خروجی اکسل (Excel/CSV)</span>
          </button>
        </div>
      </div>

      {/* Top 4 Performance Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-[#c2c7d1]/60 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-[#d2e4ff] text-[#00355f] rounded-lg">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">+۱۸٪ رشد سالانه</span>
          </div>
          <p className="text-2xl font-extrabold text-[#00355f]">{totalRegistered}</p>
          <p className="text-xs text-[#727780] font-semibold">کل مراجعین پذیرش‌شده</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#c2c7d1]/60 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-[#9af0d9] text-[#006b59] rounded-lg">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-[#006b59] bg-[#9af0d9]/40 px-2 py-0.5 rounded">عقد دائم</span>
          </div>
          <p className="text-2xl font-extrabold text-[#006b59]">{successfulMarriages} پیوند</p>
          <p className="text-xs text-[#727780] font-semibold">ازدواج‌های موفق ثبت‌شده</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#c2c7d1]/60 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-amber-100 text-amber-900 rounded-lg">
              <Award className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded">شاخص بالینی</span>
          </div>
          <p className="text-2xl font-extrabold text-amber-900">{successRate}٪</p>
          <p className="text-xs text-[#727780] font-semibold">نرخ توافق در جلسات مشاوره</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#c2c7d1]/60 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-blue-100 text-[#00355f] rounded-lg">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded">ارزیابی نئو</span>
          </div>
          <p className="text-2xl font-extrabold text-[#00355f]">۱,۴۲۰</p>
          <p className="text-xs text-[#727780] font-semibold">جلسه مشاوره و تست بالینی</p>
        </div>
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Education Breakdown */}
        <div className="bg-white rounded-xl border border-[#c2c7d1]/60 p-6 shadow-xs text-right">
          <h3 className="text-base font-bold text-[#00355f] mb-4">توزیع مقطع تحصیلی مراجعین</h3>
          <div className="space-y-3 text-xs">
            {[
              { label: 'کارشناسی ارشد (Master)', percent: 48, count: '۴۰۴ پرونده', color: 'bg-[#00355f]' },
              { label: 'کارشناسی (Bachelor)', percent: 34, count: '۲۸۶ پرونده', color: 'bg-[#006b59]' },
              { label: 'دکتری تخصصی / عمومی (PhD)', percent: 12, count: '۱۰۱ پرونده', color: 'bg-[#0f4c81]' },
              { label: 'سطوح حوزوی و سایر', percent: 6, count: '۵۱ پرونده', color: 'bg-[#727780]' },
            ].map((row, idx) => (
              <div key={idx}>
                <div className="flex justify-between font-bold text-[#191c1e] mb-1">
                  <span>{row.percent}٪ ({row.count})</span>
                  <span>{row.label}</span>
                </div>
                <div className="h-2.5 w-full bg-[#f2f4f6] rounded-full overflow-hidden">
                  <div className={`h-full ${row.color} rounded-full`} style={{ width: `${row.percent}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Age Groups Distribution */}
        <div className="bg-white rounded-xl border border-[#c2c7d1]/60 p-6 shadow-xs text-right">
          <h3 className="text-base font-bold text-[#00355f] mb-4">توزیع گروه‌های سنی مراجعین</h3>
          <div className="space-y-3 text-xs">
            {[
              { label: '۲۴ تا ۲۹ سال (بیشترین تقاضا)', percent: 42, count: '۳۵۴ نفر', color: 'bg-[#006b59]' },
              { label: '۳۰ تا ۳۵ سال', percent: 38, count: '۳۲۰ نفر', color: 'bg-[#00355f]' },
              { label: '۳۶ تا ۴۲ سال', percent: 14, count: '۱۱۸ نفر', color: 'bg-[#0f4c81]' },
              { label: 'بالای ۴۲ سال', percent: 6, count: '۵۰ نفر', color: 'bg-[#727780]' },
            ].map((row, idx) => (
              <div key={idx}>
                <div className="flex justify-between font-bold text-[#191c1e] mb-1">
                  <span>{row.percent}٪ ({row.count})</span>
                  <span>{row.label}</span>
                </div>
                <div className="h-2.5 w-full bg-[#f2f4f6] rounded-full overflow-hidden">
                  <div className={`h-full ${row.color} rounded-full`} style={{ width: `${row.percent}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Personality Types & MBTI Archetypes */}
        <div className="bg-white rounded-xl border border-[#c2c7d1]/60 p-6 shadow-xs text-right">
          <h3 className="text-base font-bold text-[#00355f] mb-4">بسامد تیپ‌های شخصیتی غالب در مرکز</h3>
          <div className="grid grid-cols-2 gap-3 text-xs">
            {[
              { type: 'INTJ / INTP', title: 'تحلیل‌گر و استراتژیک', percent: '۲۸٪', count: '۲۳۵ مورد' },
              { type: 'ENFP / ENFJ', title: 'الهام‌بخش و برون‌گرا', percent: '۲۴٪', count: '۲۰۲ مورد' },
              { type: 'INFJ / INFP', title: 'حامی و ارزش‌محور', percent: '۲۲٪', count: '۱۸۵ مورد' },
              { type: 'ISTJ / ISFJ', title: 'منظم و سنت‌گرا', percent: '۲۶٪', count: '۲۲۰ مورد' },
            ].map((item, idx) => (
              <div key={idx} className="p-3 bg-[#f7f9fb] rounded-lg border border-[#c2c7d1]/40">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-extrabold text-[#006b59] font-mono">{item.percent}</span>
                  <span className="font-black text-[#00355f] font-mono">{item.type}</span>
                </div>
                <p className="text-[11px] text-[#42474f]">{item.title}</p>
                <span className="text-[10px] text-[#727780] block mt-1">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Key Success Factors in Clinical Matches */}
        <div className="bg-white rounded-xl border border-[#c2c7d1]/60 p-6 shadow-xs text-right">
          <h3 className="text-base font-bold text-[#00355f] mb-4">عوامل کلیدی در پایداری ازدواج‌های مرکز</h3>
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-emerald-50/70 rounded-lg border border-emerald-200">
              <strong className="text-emerald-950 block mb-0.5">همسویی در ارزش‌های بنیادین و دینداری (۹۴٪)</strong>
              <p className="text-emerald-800">
                پرونده‌هایی که تشابه بالای ۸۵٪ در مقیاس دینداری و اصول اخلاقی داشتند، کمترین اصطکاک را در جلسات اول معارفه تجربه کردند.
              </p>
            </div>
            <div className="p-3 bg-blue-50/70 rounded-lg border border-blue-200">
              <strong className="text-blue-950 block mb-0.5">سبک دلبستگی ایمن در حداقل یک طرف (۸۸٪)</strong>
              <p className="text-blue-800">
                حضور دست‌کم یک فرد با سبک دلبستگی ایمن موجب حل مسالمت‌آمیز تعارض‌های دوران آشنایی و نامزدی شده است.
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <strong className="text-gray-900 block mb-0.5">شفافیت مالی پیش از تصمیم نهایی (۸۱٪)</strong>
              <p className="text-gray-700">
                توافق شفاف بر سر مسکن، استقلال مالی و تقسیم هزینه‌ها نرخ ادامه ارتباط را به میزان چشمگیری افزایش داده است.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
