import React, { useState } from 'react';
import {
  Search,
  Bell,
  Sparkles,
  ShieldAlert,
  Menu,
  X,
  Eye,
  EyeOff,
  UserCheck,
  CheckCircle2,
  Calendar,
  Layers,
  HeartHandshake,
  KeyRound,
} from 'lucide-react';
import { useCRMStore } from '../services/store';
import { NavTab } from './Sidebar';

interface HeaderProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  onOpenNewApplicant: () => void;
  onOpenAiAssistant: () => void;
  onOpenAuth?: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewApplicant,
  onOpenAiAssistant,
  onOpenAuth,
  searchQuery,
  setSearchQuery,
}) => {
  const { currentUser, setCurrentUser, users, isGlobalUnmasked, toggleGlobalUnmask, applicants, sessions, introductions } =
    useCRMStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const activeCasesCount = applicants.filter((a) => a.status === 'active').length;
  const todaySessionsCount = sessions.filter((s) => s.sessionDate.includes('۰۹') || s.status === 'scheduled').length;
  const successfulMarriages = introductions.filter((i) => i.status === 'successful').length;

  return (
    <>
      {/* Desktop Top Header Bar */}
      <header className="hidden md:flex items-center justify-between bg-white border-b border-gray-200 px-6 h-14 sticky top-0 z-30 shadow-xs">
        {/* Right Area: Search */}
        <div className="flex items-center gap-3 flex-1 max-w-xl">
          <div className="relative w-full max-w-md">
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">🔍</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجوی پیشرفته متقاضیان (نام، کد ملی، شماره پرونده)..."
              className="w-full bg-gray-100 border border-gray-200/80 rounded-md pr-8 pl-4 py-1.5 text-xs text-slate-800 placeholder:text-gray-400 focus:bg-white focus:border-amber-500 focus:outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Left Area: Quick Actions & Controls */}
        <div className="flex items-center gap-3">
          {/* Real Firebase Auth Login Button */}
          {onOpenAuth && (
            <button
              onClick={onOpenAuth}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 px-3 py-1.5 rounded text-xs font-medium transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
              title="ورود با پیامک OTP یا ایمیل سازمانی"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-600" />
              <span>احراز هویت پرسنل</span>
            </button>
          )}

          {/* Quick Register Button */}
          <button
            onClick={onOpenNewApplicant}
            className="bg-amber-600 hover:bg-amber-700 text-white px-3.5 py-1.5 rounded text-xs font-medium transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <span>+ ثبت متقاضی جدید</span>
          </button>

          {/* AI Marriage Counselor Assistant */}
          <button
            onClick={onOpenAiAssistant}
            className="flex items-center gap-1.5 bg-indigo-900 hover:bg-indigo-800 text-white px-3 py-1.5 rounded text-xs font-medium shadow-xs transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>دستیار هوشمند (AI)</span>
          </button>

          <div className="h-5 w-px bg-gray-200 mx-0.5"></div>

          {/* Quick Privacy Toggle */}
          <button
            onClick={toggleGlobalUnmask}
            className={`px-2.5 py-1.5 rounded border transition-colors text-xs flex items-center gap-1.5 cursor-pointer ${
              isGlobalUnmasked
                ? 'bg-amber-50 border-amber-300 text-amber-900'
                : 'bg-gray-100 border-gray-200 text-gray-600 hover:bg-gray-200'
            }`}
            title="حالت محرمانگی / نمایش اطلاعات"
          >
            {isGlobalUnmasked ? <Eye className="w-3.5 h-3.5 text-amber-700" /> : <EyeOff className="w-3.5 h-3.5 text-gray-500" />}
            <span className="text-[11px] font-medium hidden lg:inline">
              {isGlobalUnmasked ? 'اطلاعات آشکار' : 'ماسک محرمانگی'}
            </span>
          </button>

          {/* Notifications dropdown trigger */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-1.5 rounded-md bg-gray-100 border border-gray-200 text-gray-600 hover:bg-gray-200 relative transition-colors cursor-pointer"
              title="اعلان‌ها"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-amber-500 rounded-full ring-2 ring-white"></span>
            </button>

            {showNotifications && (
              <div className="absolute left-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 p-3 text-right z-50 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-2">
                  <span className="text-xs font-bold text-slate-800">اعلان‌های سیستم و پیگیری‌ها</span>
                  <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">
                    ۳ مورد جدید
                  </span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="p-2 bg-gray-50 rounded border border-gray-100">
                    <p className="font-semibold text-slate-800">نوبت مشاوره علیرضا صادقی و مریم ا.</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">امروز ساعت ۱۵:۰۰ - اتاق مشاوره شماره ۲</p>
                  </div>
                  <div className="p-2 bg-gray-50 rounded border border-gray-100">
                    <p className="font-semibold text-slate-800">تطبیق ۹۲٪ در موتور هوشمند</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">پرونده علیرضا صادقی و مریم ابراهیمی آماده معرفی</p>
                  </div>
                  <div className="p-2 bg-gray-50 rounded border border-gray-100">
                    <p className="font-semibold text-slate-800">یادآوری تماس با لیست پیگیری</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">مهلت ارسال پیامک هماهنگی تا ساعت ۱۶:۰۰</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Header Bar */}
      <header className="md:hidden flex items-center justify-between bg-white border-b border-[#c2c7d1] px-4 py-3 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-[#f2f4f6] text-[#191c1e]"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <button
            onClick={onOpenAiAssistant}
            className="p-2 rounded-lg bg-[#00355f] text-white"
            title="دستیار هوشمند"
          >
            <Sparkles className="w-4 h-4 text-[#9af0d9]" />
          </button>
        </div>

        <div className="text-center">
          <h1 className="text-sm font-bold text-[#00355f]">مرکز همسان‌گزینی الزهرا</h1>
          <p className="text-[10px] text-[#42474f]">سامانه مدیریت پرونده‌ها</p>
        </div>

        <button
          onClick={onOpenNewApplicant}
          className="bg-[#00355f] text-white text-xs px-3 py-1.5 rounded-lg font-semibold"
        >
          ثبت مراجع
        </button>
      </header>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-14 bg-black/50 backdrop-blur-xs z-50 flex flex-col">
          <div className="bg-[#f7f9fb] p-4 w-4/5 max-w-sm h-full overflow-y-auto space-y-3 mr-auto text-right border-l border-[#c2c7d1]">
            <div className="flex items-center justify-between border-b pb-3">
              <span className="font-bold text-[#00355f]">منوی مدیریت</span>
              <button onClick={() => setMobileMenuOpen(false)} className="text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1">
              {[
                { id: 'dashboard', label: 'داشبورد' },
                { id: 'applicants', label: 'پرونده‌ها' },
                { id: 'matching', label: 'موتور تطبیق هوشمند' },
                { id: 'introductions', label: 'معرفی‌ها' },
                { id: 'counseling', label: 'مشاوره' },
                { id: 'tasks', label: 'پیگیری‌ها و وظایف' },
                { id: 'reports', label: 'گزارشات و آمار' },
                { id: 'rbac', label: 'سطوح دسترسی و کاربران' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as NavTab);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-right p-3 rounded-lg text-sm font-medium ${
                    activeTab === item.id ? 'bg-[#9af0d9] text-[#03705e] font-bold' : 'text-[#191c1e] hover:bg-gray-200'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Role switch on mobile */}
            <div className="pt-4 border-t border-gray-200">
              <label className="text-xs text-gray-500 block mb-1">تعویض نقش کاربر:</label>
              <select
                value={currentUser.id}
                onChange={(e) => setCurrentUser(e.target.value)}
                className="w-full text-xs bg-white border border-gray-300 rounded p-2"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.roleTitle})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
