import React, { useState } from 'react';
import {
  CheckSquare2,
  Calendar,
  Clock,
  Plus,
  Phone,
  Filter,
  CheckCircle2,
  AlertCircle,
  Search,
  UserCheck,
} from 'lucide-react';
import { useCRMStore } from '../services/store';
import { Task } from '../types';

export const TasksView: React.FC = () => {
  const { tasks, toggleTaskDone, addTask, postponeTask, currentUser, isGlobalUnmasked } = useCRMStore();

  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'completed' | 'calls' | 'urgent'>('all');
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [postponeModalTask, setPostponeModalTask] = useState<Task | null>(null);
  const [postponeDate, setPostponeDate] = useState('فردا - ۱۰:۰۰');

  // New task fields
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newType, setNewType] = useState<'call' | 'review' | 'sms' | 'finance' | 'counseling'>('call');
  const [newPriority, setNewPriority] = useState<'urgent' | 'medium' | 'low'>('medium');
  const [newDueTime, setNewDueTime] = useState('۱۴:۰۰');
  const [newPhone, setNewPhone] = useState('');
  const [newApplicantName, setNewApplicantName] = useState('');

  const filteredTasks = tasks.filter((task) => {
    if (activeFilter === 'pending' && task.isDone) return false;
    if (activeFilter === 'completed' && !task.isDone) return false;
    if (activeFilter === 'calls' && task.type !== 'call') return false;
    if (activeFilter === 'urgent' && task.priority !== 'urgent') return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        task.title.toLowerCase().includes(q) ||
        task.description.toLowerCase().includes(q) ||
        (task.relatedApplicantName && task.relatedApplicantName.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const task: Task = {
      id: 'task_' + Date.now(),
      title: newTitle,
      description: newDescription,
      dueDate: 'امروز',
      dueTime: newDueTime,
      priority: newPriority,
      isDone: false,
      assignedRole: currentUser.role,
      assignedUserName: currentUser.name,
      type: newType,
      relatedApplicantName: newApplicantName || undefined,
      relatedApplicantPhone: newPhone || undefined,
    };

    addTask(task);
    setShowAddModal(false);
    setNewTitle('');
    setNewDescription('');
    setNewPhone('');
    setNewApplicantName('');
  };

  const handleSavePostpone = () => {
    if (postponeModalTask) {
      postponeTask(postponeModalTask.id, postponeDate);
      setPostponeModalTask(null);
    }
  };

  return (
    <div className="space-y-6 pb-16 text-right">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-[#c2c7d1]/60 shadow-xs">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-[#00355f] flex items-center gap-2 justify-end">
            <span>مدیریت وظایف و پیگیری‌ها</span>
            <CheckSquare2 className="w-6 h-6 text-[#006b59]" />
          </h2>
          <p className="text-xs md:text-sm text-[#42474f] mt-1">
            پیگیری تماس‌های روزانه، بررسی وضعیت پرونده‌ها و هماهنگی‌های مشاورین
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-[#00355f] text-white px-4 py-2.5 rounded-lg text-xs font-semibold hover:bg-[#07497d] transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>افزودن وظیفه / پیگیری جدید</span>
        </button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col md:flex-row gap-3 justify-between items-stretch md:items-center">
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: 'all', label: 'همه وظایف' },
            { id: 'pending', label: 'انجام‌نشده' },
            { id: 'calls', label: 'تماس‌های تلفنی' },
            { id: 'urgent', label: 'موارد فوری' },
            { id: 'completed', label: 'تکمیل‌شده' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeFilter === tab.id
                  ? 'bg-[#00355f] text-white shadow-xs'
                  : 'bg-white border border-[#c2c7d1]/70 text-[#42474f] hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-[#727780]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="جستجو در وظایف و مراجعین..."
            className="w-full bg-white pr-9 pl-3 py-2 border border-[#c2c7d1] rounded-lg text-xs text-[#191c1e] outline-none focus:border-[#00355f]"
          />
        </div>
      </div>

      {/* Task List */}
      <div className="bg-white rounded-xl border border-[#c2c7d1]/70 shadow-xs divide-y divide-[#c2c7d1]/30">
        {filteredTasks.length === 0 ? (
          <div className="p-12 text-center text-gray-500 text-xs">وظیفه‌ای در این دسته‌بندی یافت نشد.</div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className="p-4 hover:bg-[#f7f9fb] transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3.5 flex-1">
                <input
                  type="checkbox"
                  checked={task.isDone}
                  onChange={() => toggleTaskDone(task.id)}
                  className="mt-1 w-5 h-5 rounded border-[#727780] text-[#00355f] focus:ring-[#00355f] cursor-pointer"
                />

                <div>
                  <div className="flex items-center gap-2">
                    <h4
                      className={`text-sm font-bold transition-all ${
                        task.isDone ? 'line-through text-gray-400' : 'text-[#191c1e]'
                      }`}
                    >
                      {task.title}
                    </h4>

                    {task.priority === 'urgent' && (
                      <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                        فوری
                      </span>
                    )}

                    {task.type === 'call' && (
                      <span className="text-[10px] font-bold text-[#006b59] bg-[#9af0d9]/40 px-2 py-0.5 rounded flex items-center gap-1">
                        <Phone className="w-3 h-3" /> تماس
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-[#42474f] mt-1 leading-relaxed">{task.description}</p>

                  <div className="flex items-center gap-3 mt-2 text-[11px] text-[#727780]">
                    <span>موعد: {task.dueDate} {task.dueTime ? `- ساعت ${task.dueTime}` : ''}</span>
                    <span>•</span>
                    <span>مسئول پیگیری: {task.assignedUserName}</span>
                    {task.relatedApplicantPhone && (
                      <>
                        <span>•</span>
                        <span className="text-[#00355f] font-mono font-bold">
                          تلفن: <span className={isGlobalUnmasked ? '' : 'privacy-blur'}>{task.relatedApplicantPhone}</span>
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                {task.type === 'call' && !task.isDone && (
                  <button
                    onClick={() => {
                      alert(`در حال شماره‌گیری تلفن مراجع: ${task.relatedApplicantPhone || '۰۹۱۲...'}`);
                    }}
                    className="bg-[#00355f] text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-[#07497d] flex items-center gap-1 cursor-pointer"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    تماس
                  </button>
                )}
                {!task.isDone && (
                  <button
                    onClick={() => setPostponeModalTask(task)}
                    className="border border-[#c2c7d1] text-[#42474f] px-3 py-1.5 rounded-lg text-xs hover:bg-gray-100 flex items-center gap-1 cursor-pointer"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    تعویق
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Postpone Dialog */}
      {postponeModalTask && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full text-right border border-[#c2c7d1] shadow-2xl space-y-4 text-xs">
            <h3 className="text-base font-bold text-[#00355f]">تعویق زمان پیگیری</h3>
            <p className="text-[#42474f]">وظیفه: {postponeModalTask.title}</p>
            <div>
              <label className="font-bold block mb-1">زمان جدید:</label>
              <select
                value={postponeDate}
                onChange={(e) => setPostponeDate(e.target.value)}
                className="w-full p-2 border border-[#c2c7d1] rounded-lg"
              >
                <option value="عصر امروز - ۱۶:۳۰">عصر امروز - ساعت ۱۶:۳۰</option>
                <option value="فردا - ۱۰:۰۰">فردا صبح - ساعت ۱۰:۰۰</option>
                <option value="پس‌فردا - ۱۴:۰۰">پس‌فردا - ساعت ۱۴:۰۰</option>
                <option value="شنبه آینده">شنبه آینده</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSavePostpone}
                className="flex-1 bg-[#00355f] text-white py-2 rounded-lg font-bold"
              >
                ذخیره
              </button>
              <button
                onClick={() => setPostponeModalTask(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg"
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <form
            onSubmit={handleCreateTask}
            className="bg-white rounded-2xl p-6 max-w-lg w-full text-right border border-[#c2c7d1] shadow-2xl space-y-4 text-xs"
          >
            <div className="flex items-center justify-between border-b pb-3">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
              <h3 className="text-base font-bold text-[#00355f]">افزودن وظیفه / پیگیری جدید</h3>
            </div>

            <div>
              <label className="font-bold block mb-1">عنوان وظیفه:</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                required
                placeholder="مثلا: تماس با مراجع جهت اعلام نتیجه..."
                className="w-full p-2.5 border border-[#c2c7d1] rounded-lg outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold block mb-1">نوع کار:</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as any)}
                  className="w-full p-2 border border-[#c2c7d1] rounded-lg"
                >
                  <option value="call">تماس تلفنی</option>
                  <option value="review">بررسی مدارک و پرونده</option>
                  <option value="counseling">هماهنگی مشاوره</option>
                  <option value="sms">ارسال پیامک</option>
                  <option value="finance">امور مالی و ثبت‌نام</option>
                </select>
              </div>

              <div>
                <label className="font-bold block mb-1">اولویت:</label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as any)}
                  className="w-full p-2 border border-[#c2c7d1] rounded-lg"
                >
                  <option value="medium">عادی و متوسط</option>
                  <option value="urgent">فوری</option>
                  <option value="low">کم</option>
                </select>
              </div>
            </div>

            <div>
              <label className="font-bold block mb-1">شرح جزئیات:</label>
              <textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                rows={2}
                placeholder="توضیحات و نکات تکمیلی برای پیگیری..."
                className="w-full p-2 border border-[#c2c7d1] rounded-lg"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold block mb-1">نام مراجع (در صورت ارتباط):</label>
                <input
                  type="text"
                  value={newApplicantName}
                  onChange={(e) => setNewApplicantName(e.target.value)}
                  placeholder="مثلا: سارا محمدی"
                  className="w-full p-2 border border-[#c2c7d1] rounded-lg"
                />
              </div>
              <div>
                <label className="font-bold block mb-1">شماره تماس (محرمانه):</label>
                <input
                  type="text"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="۰۹۱۲..."
                  className="w-full p-2 border border-[#c2c7d1] rounded-lg font-mono"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 bg-[#00355f] text-white py-2.5 rounded-lg font-bold hover:bg-[#07497d]"
              >
                ثبت وظیفه
              </button>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-semibold"
              >
                انصراف
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
