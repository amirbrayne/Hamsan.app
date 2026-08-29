import React, { useState, useEffect } from 'react';
import {
  Lock,
  Phone,
  Mail,
  KeyRound,
  ShieldCheck,
  User,
  ArrowRight,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Building,
} from 'lucide-react';
import { authService } from '../services/authService';
import { UserRole } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type AuthMode = 'otp' | 'password' | 'register';

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [mode, setMode] = useState<AuthMode>('otp');
  
  // Phone OTP state
  const [phoneNumber, setPhoneNumber] = useState('09123456789');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  
  // Email / Password state
  const [email, setEmail] = useState('admin@alzahra-crm.ir');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('counselor');

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setErrorMsg(null);
      setSuccessMsg(null);
    }
  }, [isOpen, mode]);

  if (!isOpen) return null;

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!phoneNumber || phoneNumber.length < 11) {
      setErrorMsg('لطفاً شماره همراه معتبر ۱۱ رقمی وارد نمایید.');
      return;
    }

    setIsLoading(true);
    try {
      await authService.requestPhoneOtp(phoneNumber);
      setOtpSent(true);
      setSuccessMsg('کد تأیید پیامکی ارسال شد.');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'خطا در ارسال کد تأیید. می‌توانید از ورود با ایمیل و کلمه عبور استفاده کنید.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!otpCode || otpCode.length < 4) {
      setErrorMsg('لطفاً کد ۶ رقمی دریافتی را وارد کنید.');
      return;
    }

    setIsLoading(true);
    try {
      await authService.verifyPhoneOtp(otpCode);
      setSuccessMsg('ورود با موفقیت انجام شد.');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 500);
    } catch (err: any) {
      setErrorMsg(err.message || 'کد تأیید نامعتبر یا منقضی شده است.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!email || !password) {
      setErrorMsg('لطفاً ایمیل سازمانی و کلمه عبور را وارد فرمایید.');
      return;
    }

    setIsLoading(true);
    try {
      await authService.loginWithEmail(email, password);
      setSuccessMsg('ورود به سامانه با موفقیت انجام شد.');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 500);
    } catch (err: any) {
      setErrorMsg('نام کاربری یا کلمه عبور اشتباه است.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!email || !password || !fullName) {
      setErrorMsg('تمامی فیلدهای ستاره‌دار الزامی است.');
      return;
    }

    setIsLoading(true);
    try {
      const roleTitles: Record<UserRole, string> = {
        main_admin: 'مدیر ارشد و راهبر سامانه (ADMIN)',
        internal_manager: 'مدیر داخلی و هماهنگی (INTERNAL_MANAGER)',
        counselor: 'مشاور ارشد خانواده (COUNSELOR)',
        employee: 'کارشناس پذیرش و پرونده (EMPLOYEE)',
        applicant: 'متقاضی ازدواج (APPLICANT)',
      };

      await authService.registerWithEmail(
        email,
        password,
        fullName,
        selectedRole,
        roleTitles[selectedRole],
        phoneNumber
      );
      setSuccessMsg('حساب کاربری سازمانی با موفقیت ایجاد گردید.');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 600);
    } catch (err: any) {
      setErrorMsg(err.message || 'خطا در ثبت کاربر جدید.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 text-right">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="bg-[#0F172A] p-6 text-white text-center relative border-b border-slate-800">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto mb-3">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-white">ورود به درگاه سازمانی الزهرا</h2>
          <p className="text-xs text-slate-400 mt-1">احراز هویت دومرحله‌ای و کنترل دسترسی امنیتی</p>
          <div id="recaptcha-container"></div>
        </div>

        {/* Tab switcher */}
        <div className="grid grid-cols-3 bg-slate-100 p-1 border-b border-slate-200 text-xs font-semibold">
          <button
            onClick={() => { setMode('otp'); setOtpSent(false); }}
            className={`py-2 rounded-lg transition-all ${
              mode === 'otp' ? 'bg-white text-amber-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            پیامک OTP
          </button>
          <button
            onClick={() => setMode('password')}
            className={`py-2 rounded-lg transition-all ${
              mode === 'password' ? 'bg-white text-amber-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            کلمه عبور
          </button>
          <button
            onClick={() => setMode('register')}
            className={`py-2 rounded-lg transition-all ${
              mode === 'register' ? 'bg-white text-amber-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            عضویت پرسنل
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4">
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 p-3 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-xs text-emerald-700 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* 1. Phone OTP Mode */}
          {mode === 'otp' && (
            <div>
              {!otpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      شماره همراه پرسنل (با صفر اول)
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="tel"
                        dir="ltr"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="09123456789"
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl pr-9 pl-3 py-2 text-xs font-mono text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                  >
                    {isLoading ? 'در حال ارسال پیامک...' : 'ارسال کد یکبار مصرف (OTP)'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      کد تأیید ۶ رقمی پیامک شده
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        dir="ltr"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        placeholder="123456"
                        maxLength={6}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl pr-9 pl-3 py-2 text-xs font-mono text-center tracking-widest text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="text-[11px] text-amber-700 hover:underline mt-1.5 inline-block"
                    >
                      ویرایش شماره همراه ({phoneNumber})
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                  >
                    {isLoading ? 'در حال راستی‌آزمایی...' : 'تأیید و ورود به سیستم'}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* 2. Email & Password Mode */}
          {mode === 'password' && (
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ایمیل سازمانی کارشناس
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    dir="ltr"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="counselor@alzahra-crm.ir"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pr-9 pl-3 py-2 text-xs font-mono text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  کلمه عبور امنیتی
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    dir="ltr"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pr-9 pl-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                {isLoading ? 'در حال احراز هویت...' : 'ورود با ایمیل و پسورد'}
              </button>
            </form>
          )}

          {/* 3. Register Personnel */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">نام و نام خانوادگی کامل</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="دکتر سارا حسینی"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">ایمیل سازمانی</label>
                <input
                  type="email"
                  dir="ltr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="sara.hosseini@alzahra.ir"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">کلمه عبور انتخابی</label>
                <input
                  type="password"
                  dir="ltr"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="حداقل ۶ کاراکتر"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">نقش و سطح دسترسی (RBAC)</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold"
                >
                  <option value="main_admin">مدیر ارشد و راهبر سامانه (ADMIN)</option>
                  <option value="internal_manager">مدیر داخلی و هماهنگی (INTERNAL_MANAGER)</option>
                  <option value="counselor">مشاور خانواده و روانشناس (COUNSELOR)</option>
                  <option value="employee">کارشناس پذیرش و پرونده (EMPLOYEE)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer mt-2"
              >
                {isLoading ? 'در حال ثبت...' : 'ایجاد حساب کاربری سازمانی'}
              </button>
            </form>
          )}

          {/* Close Button */}
          <div className="pt-2 text-center">
            <button
              onClick={onClose}
              className="text-xs text-slate-500 hover:text-slate-800 transition-colors"
            >
              انصراف و بازگشت
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
