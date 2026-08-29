import React, { useState } from 'react';
import {
  ShieldCheck,
  Users,
  Lock,
  Eye,
  EyeOff,
  Clock,
  RotateCcw,
  CheckCircle2,
  XCircle,
  KeyRound,
  ShieldAlert,
  UserPlus,
} from 'lucide-react';
import { useCRMStore } from '../services/store';
import { UserRole } from '../types';

export const RbacView: React.FC = () => {
  const {
    users,
    currentUser,
    setCurrentUser,
    auditLogs,
    resetToSeedData,
    isGlobalUnmasked,
    toggleGlobalUnmask,
  } = useCRMStore();

  const [activeTab, setActiveTab] = useState<'matrix' | 'users' | 'audit'>('matrix');

  const permissionsMatrix: {
    key: string;
    label: string;
    admin: boolean;
    manager: boolean;
    counselor: boolean;
    employee: boolean;
    applicant: boolean;
  }[] = [
    { key: 'view_all', label: 'مشاهده لیست ۸۰۰+ مراجع', admin: true, manager: true, counselor: true, employee: true, applicant: false },
    { key: 'register_app', label: 'ثبت مراجع جدید (پرسشنامه جامع ۳۳ فیلدی)', admin: true, manager: true, counselor: false, employee: true, applicant: false },
    { key: 'edit_profile', label: 'ویرایش مشخصات پرونده مراجعین', admin: true, manager: true, counselor: false, employee: true, applicant: false },
    { key: 'smart_match', label: 'دسترسی به موتور تطبیق ۳۲ متغیره', admin: true, manager: true, counselor: true, employee: true, applicant: false },
    { key: 'create_intro', label: 'ایجاد پرونده معرفی و تغییر وضعیت', admin: true, manager: true, counselor: true, employee: true, applicant: false },
    { key: 'clinical_notes', label: 'مشاهده و ثبت یادداشت‌های بالینی محرمانه', admin: true, manager: true, counselor: true, employee: false, applicant: false },
    { key: 'export_reports', label: 'خروجی اکسل و گزارشات مدیریتی', admin: true, manager: true, counselor: false, employee: false, applicant: false },
    { key: 'manage_users', label: 'مدیریت کاربران و سطوح دسترسی (RBAC)', admin: true, manager: false, counselor: false, employee: false, applicant: false },
    { key: 'unmask_privacy', label: 'افشای شماره تماس و اطلاعات هویتی', admin: true, manager: true, counselor: true, employee: false, applicant: false },
    { key: 'view_own_profile', label: 'مشاهده و تکمیل مشخصات پرونده شخصی خود', admin: true, manager: true, counselor: true, employee: true, applicant: true },
  ];

  return (
    <div className="space-y-6 pb-16 text-right">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-[#c2c7d1]/60 shadow-xs">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-[#00355f] flex items-center gap-2 justify-end">
            <span>مدیریت دسترسی‌ها (RBAC) و لاگ‌های امنیتی</span>
            <ShieldCheck className="w-6 h-6 text-[#006b59]" />
          </h2>
          <p className="text-xs md:text-sm text-[#42474f] mt-1">
            سیاست‌های محرمانگی، تفکیک وظایف کارشناسان و ردپای دیجیتال (Audit Logs)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (window.confirm('آیا از بازنشانی داده‌ها به نمونه اولیه اطمینان دارید؟')) {
                resetToSeedData();
              }
            }}
            className="bg-gray-100 text-[#191c1e] hover:bg-gray-200 px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer border border-[#c2c7d1]/60"
          >
            <RotateCcw className="w-4 h-4" />
            <span>بازنشانی داده‌های دمو</span>
          </button>
        </div>
      </div>

      {/* Role Switching Interactive Box */}
      <div className="bg-[#f7f9fb] border border-[#00355f]/20 rounded-xl p-5 text-right">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-[#00355f] mb-1">
              شبیه‌ساز و سوئیچ سریع نقش کاربر فعال:
            </h3>
            <p className="text-xs text-[#42474f]">
              برای آزمایش سطح دسترسی، هر یک از کاربران زیر را انتخاب نمایید:
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {users.map((user) => {
              const isCurrent = user.id === currentUser.id;
              return (
                <button
                  key={user.id}
                  onClick={() => setCurrentUser(user.id)}
                  className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    isCurrent
                      ? 'bg-[#00355f] text-white shadow-xs'
                      : 'bg-white border border-[#c2c7d1] text-[#42474f] hover:bg-gray-100'
                  }`}
                >
                  <img src={user.avatar} alt={user.name} className="w-5 h-5 rounded-full object-cover" />
                  <span>{user.name}</span>
                  <span className="text-[10px] opacity-80">({user.roleTitle.split(' ')[0]})</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[#c2c7d1]/50 pb-2">
        <button
          onClick={() => setActiveTab('matrix')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'matrix' ? 'bg-[#00355f] text-white' : 'text-[#42474f] hover:bg-gray-100'
          }`}
        >
          ماتریس جامع دسترسی‌ها (RBAC Matrix)
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'users' ? 'bg-[#00355f] text-white' : 'text-[#42474f] hover:bg-gray-100'
          }`}
        >
          کاربران و پرسنل مرکز ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'audit' ? 'bg-[#00355f] text-white' : 'text-[#42474f] hover:bg-gray-100'
          }`}
        >
          گزارش ممیزی و وقایع امنیتی ({auditLogs.length})
        </button>
      </div>

      {/* Tab: Matrix */}
      {activeTab === 'matrix' && (
        <div className="bg-white rounded-xl border border-[#c2c7d1]/70 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse text-xs">
              <thead>
                <tr className="bg-[#f2f4f6] border-b border-[#c2c7d1]/70">
                  <th className="py-3.5 px-6 font-bold text-[#191c1e]">مجوز / قابلیت سیستم</th>
                  <th className="py-3.5 px-3 font-bold text-[#00355f] text-center">مدیر اصلی</th>
                  <th className="py-3.5 px-3 font-bold text-[#0f4c81] text-center">مدیر داخلی</th>
                  <th className="py-3.5 px-3 font-bold text-[#006b59] text-center">مشاور</th>
                  <th className="py-3.5 px-3 font-bold text-[#727780] text-center">کارمند</th>
                  <th className="py-3.5 px-3 font-bold text-amber-800 text-center">مراجع</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c2c7d1]/30">
                {permissionsMatrix.map((item, idx) => (
                  <tr key={idx} className="hover:bg-[#f7f9fb] transition-colors">
                    <td className="py-3.5 px-6 font-semibold text-[#191c1e]">{item.label}</td>
                    <td className="py-3.5 px-3 text-center">
                      {item.admin ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" />
                      ) : (
                        <XCircle className="w-4 h-4 text-gray-300 mx-auto" />
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      {item.manager ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" />
                      ) : (
                        <XCircle className="w-4 h-4 text-gray-300 mx-auto" />
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      {item.counselor ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" />
                      ) : (
                        <XCircle className="w-4 h-4 text-gray-300 mx-auto" />
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      {item.employee ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" />
                      ) : (
                        <XCircle className="w-4 h-4 text-gray-300 mx-auto" />
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      {item.applicant ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" />
                      ) : (
                        <XCircle className="w-4 h-4 text-gray-300 mx-auto" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Users */}
      {activeTab === 'users' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {users.map((user) => (
            <div
              key={user.id}
              className="bg-white p-5 rounded-xl border border-[#c2c7d1]/60 shadow-xs flex items-start gap-4 flex-row-reverse text-right"
            >
              <img src={user.avatar} alt={user.name} className="w-14 h-14 rounded-full object-cover border-2 border-[#00355f]/20" />
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-sm text-[#191c1e]">{user.name}</h4>
                <span className="text-[11px] text-[#006b59] font-bold bg-[#9af0d9]/40 px-2 py-0.5 rounded inline-block mt-1">
                  {user.roleTitle}
                </span>
                <p className="text-xs text-[#727780] mt-1 font-mono">{user.email}</p>
                <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-[#c2c7d1]/30">
                  <span className="text-emerald-700 font-semibold">حساب کاربری فعال</span>
                  <span className="text-[#727780]">کد پرسنلی: #{user.id.toUpperCase()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab: Audit Logs */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-xl border border-[#c2c7d1]/70 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse text-xs">
              <thead>
                <tr className="bg-[#f2f4f6] border-b border-[#c2c7d1]/70">
                  <th className="py-3.5 px-4 font-bold text-[#191c1e]">زمان و تاریخ</th>
                  <th className="py-3.5 px-4 font-bold text-[#191c1e]">کاربر مجری</th>
                  <th className="py-3.5 px-4 font-bold text-[#191c1e]">نوع اقدام</th>
                  <th className="py-3.5 px-4 font-bold text-[#191c1e]">موجودیت و شناسه</th>
                  <th className="py-3.5 px-4 font-bold text-[#191c1e]">شرح عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c2c7d1]/30">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#f7f9fb]">
                    <td className="py-3 px-4 font-mono text-[#727780]">{log.timestamp}</td>
                    <td className="py-3 px-4 font-bold text-[#00355f]">{log.userName}</td>
                    <td className="py-3 px-4 font-semibold text-[#191c1e]">{log.action}</td>
                    <td className="py-3 px-4 font-mono text-[#006b59]">{log.targetEntity} (#{log.targetId})</td>
                    <td className="py-3 px-4 text-[#42474f]">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
