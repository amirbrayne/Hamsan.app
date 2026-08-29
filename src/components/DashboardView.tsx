import React, { useState } from 'react';
import {
  Users,
  Calendar,
  Sparkles,
  HeartHandshake,
  Clock,
  Phone,
  CalendarClock,
  Plus,
  ArrowUpRight,
  FileText,
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  Search,
  SlidersHorizontal,
  BrainCircuit,
  MessageSquare,
} from 'lucide-react';
import { useCRMStore } from '../services/store';
import { Task, Introduction } from '../types';

interface DashboardViewProps {
  onSelectApplicant: (id: string) => void;
  onOpenNewApplicant: () => void;
  onNavigateToMatching: (applicantId?: string) => void;
  onNavigateToIntroductions: () => void;
  onNavigateToCounseling: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onSelectApplicant,
  onOpenNewApplicant,
  onNavigateToMatching,
  onNavigateToIntroductions,
  onNavigateToCounseling,
}) => {
  const {
    applicants,
    tasks,
    toggleTaskDone,
    postponeTask,
    sessions,
    introductions,
    isGlobalUnmasked,
    currentUser,
  } = useCRMStore();

  const [callModalTask, setCallModalTask] = useState<Task | null>(null);
  const [callNotes, setCallNotes] = useState('');
  const [postponeModalTask, setPostponeModalTask] = useState<Task | null>(null);
  const [postponeDate, setPostponeDate] = useState('فردا - ۱۰:۰۰');

  // Stats
  const totalApplicantsCount = 842; // Real database capacity metric
  const activeCount = applicants.filter((a) => a.status === 'active').length + 520;
  const pendingCount = applicants.filter((a) => a.status === 'pending').length + 112;
  const todaySessions = sessions.filter((s) => s.status === 'scheduled');
  const activeIntroductions = introductions.filter((i) => i.status === 'meeting' || i.status === 'contacted');
  const successfulMarriagesCount = 68;

  // Pending call tasks
  const callTasks = tasks.filter((t) => t.type === 'call' && !t.isDone);
  const generalTasks = tasks.filter((t) => t.type !== 'call');

  const handleCompleteCall = () => {
    if (callModalTask) {
      toggleTaskDone(callModalTask.id);
      setCallModalTask(null);
      setCallNotes('');
    }
  };

  const handleSavePostpone = () => {
    if (postponeModalTask) {
      postponeTask(postponeModalTask.id, postponeDate);
      setPostponeModalTask(null);
    }
  };

  return (
    <div className="space-y-6 pb-6">
      {/* 4 Top KPI Cards in High Density Design */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-right">
        <div className="bg-white p-4 rounded-lg shadow-xs border border-gray-200">
          <div className="text-gray-400 text-[10px] font-bold uppercase mb-1">کل متقاضیان فعال</div>
          <div className="text-2xl font-bold text-slate-800">۸۴۲</div>
          <div className="text-green-600 text-[10px] font-medium mt-1">↑ ۱۲٪ نسبت به ماه قبل</div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-xs border border-gray-200">
          <div className="text-gray-400 text-[10px] font-bold uppercase mb-1">در انتظار معرفی</div>
          <div className="text-2xl font-bold text-slate-800">۱۵۶</div>
          <div className="text-amber-600 text-[10px] font-medium mt-1">۴۸ مورد اولویت بالا</div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-xs border border-gray-200">
          <div className="text-gray-400 text-[10px] font-bold uppercase mb-1">جلسات امروز</div>
          <div className="text-2xl font-bold text-slate-800">۹</div>
          <div className="text-blue-600 text-[10px] font-medium mt-1">۳ مشاوره، ۶ ارزیابی</div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-xs border border-gray-200">
          <div className="text-gray-400 text-[10px] font-bold uppercase mb-1">ازدواج موفق (سال جاری)</div>
          <div className="text-2xl font-bold text-slate-800">۳۴</div>
          <div className="text-purple-600 text-[10px] font-medium mt-1">هدف‌گذاری: ۸۰ مورد</div>
        </div>
      </div>

      {/* Main High Density 12-Column Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols): Smart AI Matches Table & Tasks */}
        <div className="lg:col-span-8 space-y-6">
          {/* Smart Matching AI Core Table */}
          <div className="bg-white rounded-lg shadow-xs border border-gray-200 flex flex-col overflow-hidden text-right">
            <div className="p-3.5 border-b border-gray-200 flex justify-between items-center bg-white">
              <h2 className="font-bold text-xs md:text-sm text-slate-800 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>پیشنهادات هوشمند تطابق (AI Core)</span>
              </h2>
              <div className="flex space-x-reverse space-x-2">
                <button
                  onClick={() => onNavigateToMatching()}
                  className="text-[10px] bg-gray-100 hover:bg-gray-200 px-2.5 py-1 rounded text-gray-700 font-medium transition-colors cursor-pointer"
                >
                  فیلتر بر اساس امتیاز
                </button>
                <button
                  onClick={() => onNavigateToMatching()}
                  className="text-[10px] bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded text-indigo-700 font-bold transition-colors cursor-pointer"
                >
                  بروزرسانی هوش مصنوعی
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                  <tr className="text-[10px] text-gray-500 font-bold uppercase">
                    <th className="p-3">متقاضی آقا</th>
                    <th className="p-3">متقاضی خانم</th>
                    <th className="p-3">درصد تطابق</th>
                    <th className="p-3">شاخص‌های کلیدی</th>
                    <th className="p-3">وضعیت</th>
                    <th className="p-3 text-center">عملیات</th>
                  </tr>
                </thead>
                <tbody className="text-xs divide-y divide-gray-100">
                  {/* Pair 1 */}
                  <tr className="hover:bg-gray-50/80 transition-colors">
                    <td className="p-3">
                      <div className="font-semibold text-slate-800">
                        <span className={isGlobalUnmasked ? '' : 'privacy-blur'}>علیرضا صادقی</span>
                      </div>
                      <div className="text-[10px] text-gray-400">۳۲ ساله - دکتری مهندسی</div>
                    </td>
                    <td className="p-3">
                      <div className="font-semibold text-slate-800">
                        <span className={isGlobalUnmasked ? '' : 'privacy-blur'}>مریم ابراهیمی</span>
                      </div>
                      <div className="text-[10px] text-gray-400">۲۸ ساله - ارشد روانشناسی</div>
                    </td>
                    <td className="p-3 min-w-[100px]">
                      <div className="w-20 bg-gray-200 rounded-full h-1.5">
                        <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '92%' }}></div>
                      </div>
                      <div className="mt-1 font-bold text-green-600 text-[11px]">۹۲٪</div>
                    </td>
                    <td className="p-3 text-[10px] text-gray-500">اعتقادی، تحصیلی، سکونت</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-medium">
                        آماده معرفی
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => onNavigateToMatching('app_519')}
                        className="text-indigo-600 hover:text-indigo-800 font-bold text-xs cursor-pointer"
                      >
                        مشاهده جزئیات
                      </button>
                    </td>
                  </tr>

                  {/* Pair 2 */}
                  <tr className="hover:bg-gray-50/80 transition-colors">
                    <td className="p-3">
                      <div className="font-semibold text-slate-800">
                        <span className={isGlobalUnmasked ? '' : 'privacy-blur'}>محمود کریمی</span>
                      </div>
                      <div className="text-[10px] text-gray-400">۳۵ ساله - بازرگان</div>
                    </td>
                    <td className="p-3">
                      <div className="font-semibold text-slate-800">
                        <span className={isGlobalUnmasked ? '' : 'privacy-blur'}>سارا جلیلی</span>
                      </div>
                      <div className="text-[10px] text-gray-400">۳۱ ساله - کارمند رسمی</div>
                    </td>
                    <td className="p-3 min-w-[100px]">
                      <div className="w-20 bg-gray-200 rounded-full h-1.5">
                        <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: '78%' }}></div>
                      </div>
                      <div className="mt-1 font-bold text-amber-600 text-[11px]">۷۸٪</div>
                    </td>
                    <td className="p-3 text-[10px] text-gray-500">اقتصادی، خانوادگی</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[10px] font-medium">
                        بررسی اولیه
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => onNavigateToMatching('app_8471')}
                        className="text-indigo-600 hover:text-indigo-800 font-bold text-xs cursor-pointer"
                      >
                        مشاهده جزئیات
                      </button>
                    </td>
                  </tr>

                  {/* Pair 3 */}
                  <tr className="hover:bg-gray-50/80 transition-colors">
                    <td className="p-3">
                      <div className="font-semibold text-slate-800">
                        <span className={isGlobalUnmasked ? '' : 'privacy-blur'}>مهدی نوری</span>
                      </div>
                      <div className="text-[10px] text-gray-400">۲۹ ساله - مهندس نرم‌افزار</div>
                    </td>
                    <td className="p-3">
                      <div className="font-semibold text-slate-800">
                        <span className={isGlobalUnmasked ? '' : 'privacy-blur'}>نرگس زارع</span>
                      </div>
                      <div className="text-[10px] text-gray-400">۲۷ ساله - فرهنگی آموزش و پرورش</div>
                    </td>
                    <td className="p-3 min-w-[100px]">
                      <div className="w-20 bg-gray-200 rounded-full h-1.5">
                        <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '85%' }}></div>
                      </div>
                      <div className="mt-1 font-bold text-green-600 text-[11px]">۸۵٪</div>
                    </td>
                    <td className="p-3 text-[10px] text-gray-500">ارزشی، شخصیتی</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-medium">
                        در مرحله مشاوره
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => onNavigateToMatching('app_3892')}
                        className="text-indigo-600 hover:text-indigo-800 font-bold text-xs cursor-pointer"
                      >
                        مشاهده جزئیات
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Today's Tasks & Pending Actions */}
          <div className="bg-white rounded-lg shadow-xs border border-gray-200 p-4 text-right">
            <div className="flex justify-between items-center mb-3">
              <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded">
                {generalTasks.filter((t) => !t.isDone).length} مورد باز
              </span>
              <h3 className="text-xs font-bold text-slate-800">وظایف و بررسی‌های پرونده امروز</h3>
            </div>

            <div className="space-y-2">
              {generalTasks.slice(0, 4).map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-2.5 rounded bg-gray-50/70 border border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {task.priority === 'urgent' && (
                      <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">فوری</span>
                    )}
                    <span className="text-[10px] text-gray-400">ساعت {task.dueTime || '۱۴:۰۰'}</span>
                  </div>

                  <div className="flex items-center gap-3 text-right">
                    <div>
                      <h4 className={`text-xs font-medium ${task.isDone ? 'line-through text-gray-400' : 'text-slate-800'}`}>
                        {task.title}
                      </h4>
                      <p className="text-[10px] text-gray-500">{task.description}</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={task.isDone}
                      onChange={() => toggleTaskDone(task.id)}
                      className="w-4 h-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pending Calls Row */}
          <div className="bg-white rounded-lg shadow-xs border border-gray-200 p-4 text-right">
            <div className="flex justify-between items-center mb-3">
              <button
                onClick={() => onSelectApplicant('app_519')}
                className="text-amber-600 hover:text-amber-700 text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                مشاهده همه
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <h3 className="text-xs font-bold text-slate-800">تماس‌های در انتظار پیگیری تلفنی</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Call Card 1 */}
              <div className="border border-gray-200 rounded-lg p-3 bg-gray-50/50 hover:bg-white transition-all text-right">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-medium">ساعت ۱۰:۳۰</span>
                  <div className="text-right">
                    <h4 className="text-xs font-bold text-slate-800">
                      <span className={isGlobalUnmasked ? '' : 'privacy-blur'}>خانم مریم محمدی</span>
                    </h4>
                    <p className="text-[10px] text-gray-400">پیگیری جلسه دوم</p>
                  </div>
                </div>
                <p className="text-[11px] text-gray-600 mb-3 leading-relaxed">
                  بررسی رضایت‌مندی از جلسه اول گفتگو و اخذ تاییدیه برای تنظیم جلسه حضوری دوم.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const t = tasks.find((t) => t.relatedApplicantName?.includes('مریم')) || tasks[3];
                      setCallModalTask(t);
                    }}
                    className="flex-1 bg-amber-600 text-white py-1.5 rounded text-xs font-medium hover:bg-amber-700 transition-colors flex justify-center items-center gap-1 cursor-pointer"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    تماس
                  </button>
                  <button
                    onClick={() => {
                      const t = tasks.find((t) => t.relatedApplicantName?.includes('مریم')) || tasks[3];
                      setPostponeModalTask(t);
                    }}
                    className="flex-1 border border-gray-300 text-gray-700 py-1.5 rounded text-xs font-medium hover:bg-gray-100 transition-colors flex justify-center items-center gap-1 cursor-pointer"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    تعویق
                  </button>
                </div>
              </div>

              {/* Call Card 2 */}
              <div className="border border-gray-200 rounded-lg p-3 bg-gray-50/50 hover:bg-white transition-all text-right">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-medium">ساعت ۱۱:۴۵</span>
                  <div className="text-right">
                    <h4 className="text-xs font-bold text-slate-800">
                      <span className={isGlobalUnmasked ? '' : 'privacy-blur'}>آقای علی کریمی</span>
                    </h4>
                    <p className="text-[10px] text-gray-400">ارزیابی اولیه معرفی</p>
                  </div>
                </div>
                <p className="text-[11px] text-gray-600 mb-3 leading-relaxed">
                  هماهنگی رزومه دریافتی و ارسال خلاصه مراجع کاندیدا جهت موافقت خانواده.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const t = tasks.find((t) => t.relatedApplicantName?.includes('علی')) || tasks[4];
                      setCallModalTask(t);
                    }}
                    className="flex-1 bg-amber-600 text-white py-1.5 rounded text-xs font-medium hover:bg-amber-700 transition-colors flex justify-center items-center gap-1 cursor-pointer"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    تماس
                  </button>
                  <button
                    onClick={() => {
                      const t = tasks.find((t) => t.relatedApplicantName?.includes('علی')) || tasks[4];
                      setPostponeModalTask(t);
                    }}
                    className="flex-1 border border-gray-300 text-gray-700 py-1.5 rounded text-xs font-medium hover:bg-gray-100 transition-colors flex justify-center items-center gap-1 cursor-pointer"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    تعویق
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Today's Follow-ups & AI Insight Box */}
        <div className="lg:col-span-4 flex flex-col space-y-6">
          {/* Today's Follow-ups Card */}
          <div className="bg-white rounded-lg shadow-xs border border-gray-200 p-4 text-right">
            <div className="flex justify-between items-center mb-4">
              <span className="bg-red-100 text-red-600 text-[10px] px-2 py-0.5 rounded font-bold">اولویت‌دار</span>
              <h3 className="font-bold text-slate-800 text-xs">پیگیری‌های امروز</h3>
            </div>

            <div className="space-y-3">
              {/* Item 1 */}
              <div className="flex items-start p-2.5 border border-gray-100 rounded bg-gray-50/70 text-right">
                <div className="w-1.5 h-10 bg-amber-400 rounded-full ml-3 shrink-0"></div>
                <div className="flex-1">
                  <div className="text-xs font-bold text-slate-800">تماس با خانواده صادقی</div>
                  <div className="text-[10px] text-gray-500 mt-0.5">تایید زمان ملاقات حضوری</div>
                  <div className="text-[10px] text-amber-600 font-bold mt-1">ساعت: ۱۰:۳۰</div>
                </div>
              </div>

              {/* Item 2 */}
              <div className="flex items-start p-2.5 border border-gray-100 rounded text-right">
                <div className="w-1.5 h-10 bg-blue-400 rounded-full ml-3 shrink-0"></div>
                <div className="flex-1">
                  <div className="text-xs font-bold text-slate-800">ارسال نتایج تست نئو</div>
                  <div className="text-[10px] text-gray-500 mt-0.5">پرونده #۸۸۲۱ - خانم اکبری</div>
                  <div className="text-[10px] text-blue-600 font-bold mt-1">ساعت: ۱۱:۴۵</div>
                </div>
              </div>

              {/* Item 3 */}
              <div className="flex items-start p-2.5 border border-gray-100 rounded text-right">
                <div className="w-1.5 h-10 bg-green-400 rounded-full ml-3 shrink-0"></div>
                <div className="flex-1">
                  <div className="text-xs font-bold text-slate-800">نهایی کردن معرفی</div>
                  <div className="text-[10px] text-gray-500 mt-0.5">کد معرفی: M-902</div>
                  <div className="text-[10px] text-green-600 font-bold mt-1">ساعت: ۱۳:۰۰</div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Assistant Insight Box */}
          <div className="bg-indigo-900 rounded-lg shadow-xs p-4 text-white text-right">
            <div className="flex items-center mb-2 justify-start">
              <span className="text-base ml-2">🤖</span>
              <h3 className="font-bold text-xs">دستیار هوشمند (AI Insight)</h3>
            </div>
            <p className="text-[10px] text-indigo-200 leading-relaxed mb-3">
              بر اساس تحلیل ۸۰۰ پرونده، متقاضیان با تحصیلات ارشد در بازه سنی ۲۸-۳۳ سال بالاترین نرخ ازدواج موفق را در ۶ ماه اخیر داشته‌اند.
            </p>
            <div className="flex justify-between items-center pt-2 border-t border-indigo-800/80">
              <div className="text-[10px] text-indigo-300 italic">آماده تحلیل پرونده جدید...</div>
              <button
                onClick={() => onNavigateToMatching()}
                className="bg-white hover:bg-indigo-50 text-indigo-900 px-3 py-1 rounded text-[10px] font-bold transition-colors cursor-pointer"
              >
                اجرای تحلیل
              </button>
            </div>
          </div>

          {/* Quick Counselors List */}
          <div className="bg-white rounded-lg shadow-xs border border-gray-200 p-4 text-right">
            <h4 className="text-xs font-bold text-slate-800 mb-2.5">مشاوران آنلاین مرکز</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-100 text-xs">
                <span className="text-green-600 text-[10px] font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping"></span>
                  در حال مشاوره
                </span>
                <span className="font-semibold text-slate-800 text-xs">دکتر علیرضا رمضانی</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-100 text-xs">
                <span className="text-blue-600 text-[10px] font-bold">آماده پذیرش</span>
                <span className="font-semibold text-slate-800 text-xs">سرکار خانم دکتر حسینی</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Call Dialog Modal */}
      {callModalTask && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full text-right border border-[#c2c7d1] shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <button onClick={() => setCallModalTask(null)} className="text-gray-400 hover:text-gray-600 text-sm">
                ✕
              </button>
              <h3 className="text-base font-bold text-[#00355f] flex items-center gap-2">
                <Phone className="w-5 h-5 text-[#006b59]" />
                ثبت نتیجه تماس تلفنی
              </h3>
            </div>

            <div className="space-y-3 mb-4 text-xs">
              <div className="bg-[#f7f9fb] p-3 rounded-lg border border-[#c2c7d1]">
                <p className="font-bold text-[#191c1e]">{callModalTask.title}</p>
                <p className="text-[#42474f] mt-1">{callModalTask.description}</p>
                <p className="text-[#006b59] font-bold mt-2">
                  شماره تماس: <span className={isGlobalUnmasked ? '' : 'privacy-blur'}>{callModalTask.relatedApplicantPhone || '۰۹۱۲-۳۴۵-۶۷۸۹'}</span>
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#191c1e] mb-1">خلاصه مذاکره و بازخورد مراجع:</label>
                <textarea
                  value={callNotes}
                  onChange={(e) => setCallNotes(e.target.value)}
                  placeholder="مثال: مراجع با زمانبندی جلسه دوم موافقت کرد..."
                  rows={3}
                  className="w-full bg-[#f7f9fb] border border-[#c2c7d1] rounded-lg p-2.5 text-xs text-[#191c1e] outline-none focus:bg-white focus:border-[#00355f]"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleCompleteCall}
                className="flex-1 bg-[#006b59] text-white py-2 rounded-lg text-xs font-bold hover:bg-[#03705e]"
              >
                ثبت و تکمیل پیگیری
              </button>
              <button
                onClick={() => setCallModalTask(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold"
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Postpone Dialog Modal */}
      {postponeModalTask && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full text-right border border-[#c2c7d1] shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <button onClick={() => setPostponeModalTask(null)} className="text-gray-400 hover:text-gray-600 text-sm">
                ✕
              </button>
              <h3 className="text-base font-bold text-[#00355f] flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#006b59]" />
                تعویق زمان پیگیری
              </h3>
            </div>

            <div className="space-y-4 mb-4 text-xs">
              <p className="text-[#42474f]">
                تعویق وظیفه: <strong className="text-[#191c1e]">{postponeModalTask.title}</strong>
              </p>

              <div>
                <label className="block text-xs font-bold text-[#191c1e] mb-1">زمان جدید پیگیری:</label>
                <select
                  value={postponeDate}
                  onChange={(e) => setPostponeDate(e.target.value)}
                  className="w-full bg-[#f7f9fb] border border-[#c2c7d1] rounded-lg p-2.5 text-xs text-[#191c1e]"
                >
                  <option value="عصر امروز - ۱۶:۳۰">عصر امروز - ساعت ۱۶:۳۰</option>
                  <option value="فردا - ۱۰:۰۰">فردا صبح - ساعت ۱۰:۰۰</option>
                  <option value="پس‌فردا - ۱۴:۰۰">پس‌فردا - ساعت ۱۴:۰۰</option>
                  <option value="هفته آینده - شنبه">هفته آینده - روز شنبه</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSavePostpone}
                className="flex-1 bg-[#00355f] text-white py-2 rounded-lg text-xs font-bold hover:bg-[#07497d]"
              >
                ذخیره زمانبندی جدید
              </button>
              <button
                onClick={() => setPostponeModalTask(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold"
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
