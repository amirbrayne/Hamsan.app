import React from 'react';
import {
  LayoutDashboard,
  FolderKanban,
  Sparkles,
  Users2,
  BrainCircuit,
  CheckSquare2,
  BarChart3,
  ShieldCheck,
  UserPlus,
  LogOut,
  Eye,
  EyeOff,
  UserCheck,
} from 'lucide-react';
import { useCRMStore } from '../services/store';
import { getTodayJalali } from '../utils/persianDate';

export type NavTab =
  | 'dashboard'
  | 'applicants'
  | 'matching'
  | 'introductions'
  | 'counseling'
  | 'tasks'
  | 'reports'
  | 'rbac';

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  onOpenNewApplicant: () => void;
  onOpenAiAssistant: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewApplicant,
}) => {
  const { currentUser, setCurrentUser, users, isGlobalUnmasked, toggleGlobalUnmask } = useCRMStore();

  const mainNavItems: { id: NavTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'dashboard', label: 'داشبورد مدیریت', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'applicants', label: 'مدیریت متقاضیان', icon: <FolderKanban className="w-4 h-4" />, badge: '۸۴۲' },
    { id: 'matching', label: 'موتور هوشمند تطابق', icon: <Sparkles className="w-4 h-4 text-amber-400" /> },
    { id: 'introductions', label: 'معرفی و پیگیری', icon: <Users2 className="w-4 h-4" /> },
  ];

  const operationsNavItems: { id: NavTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'counseling', label: 'جلسات مشاوره', icon: <BrainCircuit className="w-4 h-4" /> },
    { id: 'tasks', label: 'وظایف و پیگیری‌ها', icon: <CheckSquare2 className="w-4 h-4" /> },
    { id: 'reports', label: 'گزارشات تحلیلی', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'rbac', label: 'کاربران و دسترسی‌ها', icon: <ShieldCheck className="w-4 h-4" /> },
  ];

  return (
    <aside className="hidden md:flex flex-col bg-[#1E293B] text-slate-300 w-64 h-screen fixed right-0 top-0 z-40 select-none border-l border-slate-700 shadow-md">
      {/* Brand Header */}
      <div className="p-4 bg-[#0F172A] border-b border-slate-800 text-right">
        <div className="text-white font-bold text-base leading-tight">مرکز مشاوره الزهرا</div>
        <div className="text-slate-400 text-xs mt-0.5">سیستم مدیریت همسان‌گزینی</div>
        <div className="mt-2.5 inline-flex items-center gap-1.5 px-2 py-1 rounded bg-slate-800/80 border border-slate-700/80 text-[11px] text-amber-300 font-mono">
          <span>📅 تقویم جلالی:</span>
          <strong className="text-slate-100">{getTodayJalali().fullDateFa}</strong>
        </div>
      </div>

      {/* Quick Action Button */}
      <div className="px-3 pt-3">
        <button
          onClick={onOpenNewApplicant}
          className="w-full bg-amber-600 hover:bg-amber-700 text-white px-3 py-2 rounded text-xs font-medium flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ ثبت متقاضی جدید</span>
        </button>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 py-3 px-2 overflow-y-auto space-y-4">
        {/* Main Group */}
        <div>
          <div className="px-3 mb-1 text-slate-400 uppercase text-[10px] font-bold tracking-wider text-right">
            اصلی
          </div>
          <div className="space-y-0.5">
            {mainNavItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-right transition-colors cursor-pointer rounded-sm ${
                    isActive
                      ? 'text-white bg-[#334155] border-r-4 border-amber-500 font-bold'
                      : 'text-slate-300 hover:bg-[#334155] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={isActive ? 'text-amber-400' : 'text-slate-400'}>{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#0F172A] text-slate-300 border border-slate-700">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Operations Group */}
        <div>
          <div className="px-3 mb-1 text-slate-400 uppercase text-[10px] font-bold tracking-wider text-right">
            عملیات و مشاوره
          </div>
          <div className="space-y-0.5">
            {operationsNavItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-right transition-colors cursor-pointer rounded-sm ${
                    isActive
                      ? 'text-white bg-[#334155] border-r-4 border-amber-500 font-bold'
                      : 'text-slate-300 hover:bg-[#334155] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={isActive ? 'text-amber-400' : 'text-slate-400'}>{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Footer User Info & Settings */}
      <div className="p-3 border-t border-slate-700 bg-[#0F172A] space-y-2">
        {/* Privacy Mode Toggle */}
        <button
          onClick={toggleGlobalUnmask}
          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-[11px] transition-colors border ${
            isGlobalUnmasked
              ? 'bg-amber-950/70 text-amber-300 border-amber-800/80'
              : 'bg-[#1E293B] text-slate-300 border-slate-700 hover:bg-[#334155]'
          }`}
          title="تغییر وضعیت ماسک اطلاعات هویتی"
        >
          <div className="flex items-center gap-2">
            {isGlobalUnmasked ? <Eye className="w-3.5 h-3.5 text-amber-400" /> : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
            <span>{isGlobalUnmasked ? 'اطلاعات آشکار (تست)' : 'ماسک محرمانگی (فعال)'}</span>
          </div>
        </button>

        {/* User Card */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-7 h-7 rounded bg-amber-500 flex items-center justify-center text-white font-bold text-xs ml-2.5 shrink-0">
              {currentUser.name.charAt(0)}
            </div>
            <div className="text-right min-w-0">
              <div className="text-white text-xs font-medium truncate">{currentUser.name}</div>
              <div className="text-slate-400 text-[10px] truncate">{currentUser.roleTitle}</div>
            </div>
          </div>
        </div>

        {/* Role Switcher */}
        <select
          value={currentUser.id}
          onChange={(e) => setCurrentUser(e.target.value)}
          className="w-full text-[10px] bg-[#1E293B] border border-slate-700 text-slate-200 rounded px-2 py-1 outline-none cursor-pointer"
        >
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              نقش: {u.roleTitle.split(' ')[0]} ({u.name})
            </option>
          ))}
        </select>
      </div>
    </aside>
  );
};
