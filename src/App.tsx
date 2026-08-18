/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Wallet, 
  Receipt, 
  Plus, 
  Search, 
  Bell, 
  Settings,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  DollarSign,
  Loader2,
  Trash2,
  BookOpen,
  ChevronDown,
  PlusCircle,
  Phone,
  Menu,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  Coins,
  X,
  Pencil,
  LogOut,
  Printer
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import * as XLSX from 'xlsx';
import { Term, Student, TeacherSalary, Expense, Level } from './types';

type Section = 'overview' | 'registration' | 'payroll' | 'expenses';

interface User {
  id: string;
  username: string;
  role: 'manager' | 'reception';
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [activeSection, setActiveSection] = useState<Section>('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [terms, setTerms] = useState<Term[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [salaries, setSalaries] = useState<TeacherSalary[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  const fetchJSON = async (url: string, options?: RequestInit) => {
    const res = await fetch(url, options);
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`HTTP error! status: ${res.status}, body: ${text.slice(0, 100)}`);
    }
    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await res.text();
      throw new TypeError(`Expected JSON, got ${contentType}. Body: ${text.slice(0, 100)}`);
    }
    return await res.json();
  };

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [t, s, sal, exp, l] = await Promise.all([
          fetchJSON('/api/terms'),
          fetchJSON('/api/students'),
          fetchJSON('/api/salaries'),
          fetchJSON('/api/expenses'),
          fetchJSON('/api/levels')
        ]);
        
        const mapId = (arr: any[]) => arr.map(i => ({ ...i, id: i._id || i.id }));

        setTerms(mapId(t));
        setStudents(mapId(s));
        setSalaries(mapId(sal));
        setExpenses(mapId(exp));
        setLevels(mapId(l));
      } catch (err) {
        console.error("Fetch error details:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUser(data.user);
        setActiveSection(data.user.role === 'manager' ? 'overview' : 'registration');
      } else {
        setLoginError(data.message || 'Ù†Ø§Ù… Ú©Ø§Ø±Ø¨Ø±ÛŒ ÛŒØ§ Ø±Ù…Ø² Ø¹Ø¨ÙˆØ± Ø§Ø´ØªØ¨Ø§Ù‡ Ø§Ø³Øª');
      }
    } catch (err) {
      setLoginError('Ø®Ø·Ø§ Ø¯Ø± Ø¨Ø±Ù‚Ø±Ø§Ø±ÛŒ Ø§Ø±ØªØ¨Ø§Ø· Ø¨Ø§ Ø³Ø±ÙˆØ±');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setUsername('');
    setPassword('');
    setTerms([]);
    setStudents([]);
    setSalaries([]);
    setExpenses([]);
    setLevels([]);
  };

  const handleAddTerm = async (name: string) => {
    const data = await fetchJSON('/api/terms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, status: 'active', createdAt: Date.now() })
    });
    const newTerm = { ...data, id: data._id || data.id };
    setTerms([newTerm, ...terms]);
  };

  const handleUpdateTerm = async (id: string, name: string) => {
    try {
      await fetchJSON(`/api/terms/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      setTerms(terms.map((t: Term) => t.id === id ? { ...t, name } : t));
    } catch (err) { console.error(err); }
  };

  const handleDeleteTerm = async (id: string) => {
    if (!window.confirm('Ø¢ÛŒØ§ Ø§Ø² Ø­Ø°Ù Ø§ÛŒÙ† ØªØ±Ù… Ø§Ø·Ù…ÛŒÙ†Ø§Ù† Ø¯Ø§Ø±ÛŒØ¯ØŸ')) return;
    try {
      const res = await fetch(`/api/terms/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Ø®Ø·Ø§ Ø¯Ø± Ø­Ø°Ù ØªØ±Ù…');
        return;
      }
      setTerms(terms.filter((t: Term) => t.id !== id));
    } catch (err) { console.error(err); }
  };

  const handleAddStudent = async (studentData: Omit<Student, 'id' | 'debt' | 'status'>) => {
    const debt = studentData.totalPayable - studentData.amountPaid;
    const body = { ...studentData, debt, status: debt === 0 ? 'paid' : 'unpaid' };
    
    try {
      // Û±. Ø«Ø¨Øª Ø¯Ø§Ù†Ø´Ø¬Ùˆ
      const data = await fetchJSON('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const newStudent = { ...data, id: data._id || data.id };
      setStudents(prev => [newStudent, ...prev]);

      // Û². ØµØ¯ÙˆØ± Ø®ÙˆØ¯Ú©Ø§Ø± Ø±Ø³ÛŒØ¯ Ø¯Ø± ØµÙˆØ±Øª ÙˆØ¬ÙˆØ¯ Ù¾Ø±Ø¯Ø§Ø®ØªÛŒ Ø§ÙˆÙ„ÛŒÙ‡
      if (Number(studentData.amountPaid) > 0) {
        await fetchJSON('/api/receipts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentId: newStudent.id,
            termId: newStudent.termId,
            paidAmount: Number(studentData.amountPaid),
            date: new Date().toLocaleDateString('fa-IR')
          })
        });
      }
    } catch (err) {
      console.error("Ø®Ø·Ø§ Ø¯Ø± Ø«Ø¨Øª Ø§Ø·Ù„Ø§Ø¹Ø§Øª:", err);
      throw err;
    }
  };

  const handleUpdateStudent = async (id: string, amountPaid: number, receiptUrl?: string, extraData?: any) => {
    const data = await fetchJSON(`/api/students/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amountPaid, receiptUrl, ...extraData })
    });
    if (data.success) {
      setStudents(students.map((s: Student) => s.id === id ? { 
        ...s, 
        amountPaid, 
        totalPayable: extraData?.totalPayable !== undefined ? extraData.totalPayable : s.totalPayable,
        hasBook: extraData?.hasBook !== undefined ? extraData.hasBook : s.hasBook,
        bookName: extraData?.bookName !== undefined ? extraData.bookName : s.bookName,
        bookPrice: extraData?.bookPrice !== undefined ? extraData.bookPrice : s.bookPrice,
        hasInterview: extraData?.hasInterview !== undefined ? extraData.hasInterview : s.hasInterview,
        hasDiscount: extraData?.hasDiscount !== undefined ? extraData.hasDiscount : s.hasDiscount,
        discountPercent: extraData?.discountPercent !== undefined ? extraData.discountPercent : s.discountPercent,
        discountAmount: extraData?.discountAmount !== undefined ? extraData.discountAmount : s.discountAmount,
        debt: data.debt, 
        status: data.status, 
        receiptUrl: receiptUrl || s.receiptUrl 
      } : s));
    }
  };

  const handleDeleteStudent = async (id: string) => {
    try {
      await fetchJSON(`/api/students/${id}`, { method: 'DELETE' });
      setStudents(students.filter((s: Student) => s.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleBatchStudent = async (studentsList: any[]) => {
    try {
      setIsLoading(true);
      const data = await fetchJSON('/api/students/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentsList)
      });
      if (data.success) {
        const s = await fetchJSON('/api/students');
        setStudents(s.map((i: any) => ({ ...i, id: i._id || i.id })));
        alert(`${studentsList.length} Ø¯Ø§Ù†Ø´Ø¬Ùˆ Ø¨Ø§ Ù…ÙˆÙÙ‚ÛŒØª Ø¨Ù‡ Ø³ÛŒØ³ØªÙ… Ø§Ø¶Ø§ÙÙ‡ Ø´Ø¯Ù†Ø¯.`);
      }
    } catch (err: any) {
      console.error(err);
      alert('Ø®Ø·Ø§ Ø¯Ø± Ø°Ø®ÛŒØ±Ù‡â€ŒØ³Ø§Ø²ÛŒ Ø§Ø·Ù„Ø§Ø¹Ø§Øª Ø¯Ø± Ø³ÛŒØ³ØªÙ…. Ù„Ø·ÙØ§ Ø§ØªØµØ§Ù„ Ø§ÛŒÙ†ØªØ±Ù†Øª Ùˆ ÙØ±Ù…Øª ÙØ§ÛŒÙ„ Ø±Ø§ Ø¨Ø±Ø±Ø³ÛŒ Ú©Ù†ÛŒØ¯.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSalary = async (id: string) => {
    if (!window.confirm('Ø¢ÛŒØ§ Ø§Ø² Ø­Ø°Ù Ø§ÛŒÙ† ÙÛŒØ´ Ø­Ù‚ÙˆÙ‚ÛŒ Ø§Ø·Ù…ÛŒÙ†Ø§Ù† Ø¯Ø§Ø±ÛŒØ¯ØŸ')) return;
    try {
      await fetchJSON(`/api/salaries/${id}`, { method: 'DELETE' });
      setSalaries(salaries.filter((s: TeacherSalary) => s.id !== id));
    } catch (err) { console.error(err); }
  };

  const handleUpdateSalary = async (id: string, updatedData: any) => {
    try {
      await fetchJSON(`/api/salaries/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });
      setSalaries(salaries.map((s: TeacherSalary) => s.id === id ? { ...s, ...updatedData } : s));
    } catch (err) { console.error(err); }
  };

  const handleAddSalary = async (s: any) => {
    try {
      const data = await fetchJSON('/api/salaries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(s)
      });
      const newSalary = { ...data, id: data._id || data.id };
      setSalaries([newSalary, ...salaries]);
    } catch (err) { console.error(err); }
  };

  const handleDeleteExpense = async (id: string) => {
    if (!window.confirm('Ø¢ÛŒØ§ Ø§Ø² Ø­Ø°Ù Ø§ÛŒÙ† Ù‡Ø²ÛŒÙ†Ù‡ Ø§Ø·Ù…ÛŒÙ†Ø§Ù† Ø¯Ø§Ø±ÛŒØ¯ØŸ')) return;
    try {
      await fetchJSON(`/api/expenses/${id}`, { method: 'DELETE' });
      setExpenses(expenses.filter((e: Expense) => e.id !== id));
    } catch (err) { console.error(err); }
  };

  const handleUpdateExpense = async (id: string, updatedData: any) => {
    try {
      await fetchJSON(`/api/expenses/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });
      setExpenses(expenses.map((e: Expense) => e.id === id ? { ...e, ...updatedData } : e));
    } catch (err) { console.error(err); }
  };

  const handleAddExpense = async (e: any) => {
    try {
      const data = await fetchJSON('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(e)
      });
      const newExp = { ...data, id: data._id || data.id };
      setExpenses([newExp, ...expenses]);
    } catch (err) { console.error(err); }
  };

  const handleAddLevel = async (level: Omit<Level, 'id'>) => {
    try {
      const data = await fetchJSON('/api/levels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(level)
      });
      const newLevel = { ...data, id: data._id || data.id };
      setLevels(prev => [...prev, newLevel]);
    } catch (err) { 
      console.error("Error in handleAddLevel:", err);
    }
  };

  const handleDeleteLevel = async (id: string) => {
    try {
      await fetchJSON(`/api/levels/${id}`, { method: 'DELETE' });
      setLevels(levels.filter(l => (l as any)._id !== id && l.id !== id));
    } catch (err) { console.error(err); }
  };

  const handleBatchLevels = async (levelsList: any[]) => {
    try {
      setIsLoading(true);
      const data = await fetchJSON('/api/levels/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(levelsList)
      });
      if (data.success) {
        const l = await fetchJSON('/api/levels');
        setLevels(l.map((i: any) => ({ ...i, id: i._id || i.id })));
        alert(`${levelsList.length} Ø³Ø·Ø­ Ø¢Ù…ÙˆØ²Ø´ÛŒ Ø¨Ø§ Ù…ÙˆÙÙ‚ÛŒØª Ø¨Ù‡ Ø³ÛŒØ³ØªÙ… Ø§Ø¶Ø§ÙÙ‡ Ø´Ø¯Ù†Ø¯.`);
      }
    } catch (err: any) {
      console.error(err);
      alert('Ø®Ø·Ø§ Ø¯Ø± Ø°Ø®ÛŒØ±Ù‡â€ŒØ³Ø§Ø²ÛŒ Ø³Ø·ÙˆØ­ Ø¢Ù…ÙˆØ²Ø´ÛŒ. Ù„Ø·ÙØ§ ÙØ±Ù…Øª ÙØ§ÛŒÙ„ Ø±Ø§ Ø¨Ø±Ø±Ø³ÛŒ Ú©Ù†ÛŒØ¯.');
    } finally {
      setIsLoading(false);
    }
  };

  const navItems = [
    { id: 'overview', label: 'Ù†Ù…Ø§ÛŒ Ú©Ù„ÛŒ', icon: LayoutDashboard, roles: ['manager'] },
    { id: 'registration', label: 'Ø«Ø¨Øª Ù†Ø§Ù…', icon: Users, roles: ['manager', 'reception'] },
    { id: 'payroll', label: 'Ø­Ù‚ÙˆÙ‚ Ùˆ Ø¯Ø³ØªÙ…Ø²Ø¯', icon: Wallet, roles: ['manager'] },
    { id: 'expenses', label: 'Ù‡Ø²ÛŒÙ†Ù‡â€ŒÙ‡Ø§', icon: Receipt, roles: ['manager'] },
  ];

  const allowedNavItems = navItems.filter(item => user && item.roles.includes(user.role));

  if (!user) {
    return (
      <div className="flex h-screen w-full bg-[#08080C] text-slate-100 font-sans overflow-hidden relative" dir="rtl">
        {/* Ambient Red Liquid Glowing Lights */}
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-red-600/15 rounded-full blur-[140px] pointer-events-none animate-float-slow" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-rose-700/15 rounded-full blur-[140px] pointer-events-none animate-float-slow" />

        {/* Decorative Left Panel - Centered & Cleaned Up */}
        <div className="hidden lg:flex w-5/12 h-full bg-[#0A0A10]/60 text-white p-12 flex-col justify-center items-center relative overflow-hidden border-l border-red-900/30">
          <div className="absolute top-[-80px] right-[-80px] w-96 h-96 border border-red-500/10 rounded-full opacity-60 pointer-events-none animate-pulse"></div>
          <div className="absolute bottom-[-40px] left-[-40px] w-72 h-72 border border-red-400/10 rounded-full opacity-60 pointer-events-none"></div>
          
          <div className="z-10 flex flex-col items-center text-center">
            <div className="text-[10px] tracking-[0.4em] uppercase text-red-400 mb-6 font-mono flex items-center gap-2 bg-red-950/30 px-4 py-2 rounded-full border border-red-900/50" dir="ltr">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
              Ghazal Academy
            </div>
            
            {/* Removed italic to fix Persian font rendering issue */}
            <h1 className="text-7xl lg:text-8xl leading-none font-serif mb-6 text-transparent bg-clip-text bg-gradient-to-b from-white to-red-300 drop-shadow-[0_0_20px_rgba(239,68,68,0.3)] pb-2">
              ØºØ²Ø§Ù„
            </h1>
            
            <p className="text-sm lg:text-base leading-relaxed text-red-200/70 max-w-xs font-light">
              Ø³ÛŒØ³ØªÙ… ÛŒÚ©Ù¾Ø§Ø±Ú†Ù‡ Ù…Ø¯ÛŒØ±ÛŒØª Ù…Ø§Ù„ÛŒ<br/>Ùˆ Ø«Ø¨Øªâ€ŒÙ†Ø§Ù… Ø²Ø¨Ø§Ù†â€ŒØ¢Ù…ÙˆØ²Ø§Ù†
            </p>

            <div className="w-16 h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent my-8"></div>
            
            <p className="text-xs text-red-400/50 font-serif">
              Â«Ø®Ø§Ù…ÙˆØ´ÛŒ Ø²Ø¨Ø§Ù† Ø®Ø¯Ø§Ø³ØªØŒ Ø¯ÛŒÚ¯Ø± Ù‡Ù…Ù‡ ØªØ±Ø¬Ù…Ù‡ Ù†Ø§Ù‚Øµ Ø§Ø³Øª.Â»
            </p>
          </div>
        </div>

        {/* Login Form Panel */}
        <div className="w-full lg:w-7/12 h-full flex flex-col items-center justify-center p-6 sm:p-12 lg:p-20 overflow-y-auto relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-md liquid-glass p-8 sm:p-10 rounded-3xl border border-red-900/30 shadow-[0_12px_40px_rgba(0,0,0,0.8)]"
          >
            <div className="mb-8 text-center lg:text-right">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-red-600 to-rose-800 text-white mb-4 shadow-[0_0_20px_rgba(220,38,38,0.5)]">
                <BookOpen size={28} />
              </div>
              <h2 className="text-3xl lg:text-4xl font-serif font-light text-white mb-2">ÙˆØ±ÙˆØ¯ Ø¨Ù‡ Ù¾Ù†Ù„ ØºØ²Ø§Ù„</h2>
              <p className="text-xs lg:text-sm text-slate-400 tracking-wide">Ø§Ø·Ù„Ø§Ø¹Ø§Øª Ú©Ø§Ø±Ø¨Ø±ÛŒ Ø®ÙˆØ¯ Ø±Ø§ Ø¨Ø±Ø§ÛŒ Ø¯Ø³ØªØ±Ø³ÛŒ Ø¨Ù‡ Ø³ÛŒØ³ØªÙ… ÙˆØ§Ø±Ø¯ Ù†Ù…Ø§ÛŒÛŒØ¯</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="relative">
                <label className="text-[10px] uppercase tracking-widest text-red-400 absolute -top-2.5 right-4 bg-[#0E0E16] px-2 z-10 font-medium border border-red-900/40 rounded-full">Ù†Ø§Ù… Ú©Ø§Ø±Ø¨Ø±ÛŒ</label>
                <input 
                  type="text" 
                  required 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ù†Ø§Ù… Ú©Ø§Ø±Ø¨Ø±ÛŒ" 
                  className="w-full bg-[#12121C]/90 border border-red-900/40 px-6 py-4 rounded-full text-sm text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 placeholder:text-slate-600 transition-all"
                />
              </div>

              <div className="relative">
                <label className="text-[10px] uppercase tracking-widest text-red-400 absolute -top-2.5 right-4 bg-[#0E0E16] px-2 z-10 font-medium border border-red-900/40 rounded-full">Ø±Ù…Ø² Ø¹Ø¨ÙˆØ±</label>
                <input 
                  type="password" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢" 
                  className="w-full bg-[#12121C]/90 border border-red-900/40 px-6 py-4 rounded-full text-sm text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 placeholder:text-slate-600 font-mono transition-all"
                />
              </div>

              {loginError && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-xs text-red-400 bg-red-950/50 border border-red-500/40 py-3 px-4 rounded-2xl text-center font-medium"
                >
                  {loginError}
                </motion.div>
              )}

              <button 
                type="submit" 
                disabled={isLoggingIn}
                className="w-full bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white py-4 rounded-full text-xs uppercase tracking-[0.2em] font-medium hover:brightness-110 transition-all shadow-[0_0_20px_rgba(220,38,38,0.4)] mt-6 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="animate-spin text-white" size={18} />
                    <span>Ø¯Ø± Ø­Ø§Ù„ Ø¨Ø±Ø±Ø³ÛŒ...</span>
                  </>
                ) : (
                  <span>ÙˆØ±ÙˆØ¯ Ø¨Ù‡ Ø³Ø§Ù…Ø§Ù†Ù‡</span>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#08080C] flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-2 border-red-500/20 border-t-red-500 animate-spin" />
          <Loader2 className="text-red-500 animate-spin absolute inset-0 m-auto" size={24} />
        </div>
        <span className="text-xs text-red-400 tracking-wider">Ø¯Ø± Ø­Ø§Ù„ Ø¨Ø§Ø±Ú¯Ø°Ø§Ø±ÛŒ Ø¯Ø§Ø¯Ù‡â€ŒÙ‡Ø§ÛŒ ØºØ²Ø§Ù„...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#08080C] text-slate-100 flex overflow-hidden font-sans relative" dir="rtl">
      {/* Background Liquid Red Orbs */}
      <div className="fixed top-[-10%] right-[-5%] w-[600px] h-[600px] bg-red-600/10 rounded-full blur-[150px] pointer-events-none animate-float-slow" />
      <div className="fixed bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-rose-700/10 rounded-full blur-[150px] pointer-events-none animate-float-slow" />

      {/* Sidebar Overlay for Mobile */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar - Liquid Glass Red & Obsidian */}
      <aside className={`fixed lg:static inset-y-0 right-0 w-72 bg-[#0B0B10]/90 backdrop-blur-2xl text-white border-l border-red-900/30 flex flex-col z-50 transition-transform duration-300 transform ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`}>
        <div className="p-6 flex items-center justify-between border-b border-red-900/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-rose-800 border border-red-400/30 flex items-center justify-center text-white shadow-[0_0_15px_rgba(220,38,38,0.4)]">
              <BookOpen size={20} />
            </div>
            <div>
              <h1 className="text-lg font-serif font-semibold tracking-wide text-white">Ø¢Ú©Ø§Ø¯Ù…ÛŒ ØºØ²Ø§Ù„</h1>
              <p className="text-[10px] text-red-400/80 text-right mt-0.5 font-sans">
                {user.role === 'manager' ? 'Ø¯Ø³ØªØ±Ø³ÛŒ: Ù…Ø¯ÛŒØ± Ú©Ù„' : 'Ø¯Ø³ØªØ±Ø³ÛŒ: Ù¾Ø°ÛŒØ±Ø´'}
              </p>
            </div>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {allowedNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id as Section);
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-200 cursor-pointer ${
                  isActive 
                    ? 'bg-gradient-to-r from-red-600 to-rose-700 text-white font-medium shadow-[0_0_20px_rgba(220,38,38,0.4)] border border-red-400/30' 
                    : 'text-slate-400 hover:text-red-300 hover:bg-red-950/20 border border-transparent'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-white' : 'text-slate-400'} />
                <span className="text-sm text-right flex-1 font-medium">{item.label}</span>
                {isActive && <div className="w-2 h-2 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)] animate-pulse" />}
              </button>
            );
          })}
        </nav>

        <div className="p-6 mt-auto space-y-4 border-t border-red-900/20">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-900/50 py-3 rounded-2xl transition-all text-xs font-medium cursor-pointer"
          >
            <LogOut size={14} />
            <span>Ø®Ø±ÙˆØ¬ Ø§Ø² Ø­Ø³Ø§Ø¨</span>
          </button>
          
          <div className="p-2 text-center">
            <p className="text-[10px] text-slate-500 font-mono tracking-wider" dir="ltr">GHAZAL ACADEMY â€¢ LIQUID GLASS</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 relative overflow-y-auto overflow-x-hidden bg-[#08080C]/80">
        <header className="sticky top-0 z-10 bg-[#0A0A0E]/80 backdrop-blur-2xl border-b border-red-900/20 px-4 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative w-40 lg:w-96 hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-red-400/60" size={18} />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ø¬Ø³ØªØ¬Ùˆ Ø¯Ø± Ø§Ø·Ù„Ø§Ø¹Ø§Øª..."
                className="w-full bg-[#12121C]/90 border border-red-900/30 rounded-full py-2 pl-10 pr-4 focus:outline-none focus:border-red-500 transition-colors text-sm text-right text-white placeholder:text-slate-500"
                dir="rtl"
              />
            </div>
            <button 
              onClick={() => setShowMobileSearch(!showMobileSearch)} 
              className="sm:hidden p-2 hover:bg-red-950/30 rounded-full transition-colors text-slate-200 relative"
            >
              <Search size={20} />
            </button>
            {showMobileSearch && (
              <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 bg-[#12121C] border border-red-500/40 rounded-full py-1.5 px-3 flex items-center sm:hidden z-25 shadow-2xl">
                <Search size={16} className="text-red-400 ml-2" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Ø¬Ø³ØªØ¬Ùˆ..."
                  className="w-full bg-transparent border-0 outline-none py-1 text-sm text-right text-white"
                  dir="rtl"
                  autoFocus
                />
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2 lg:gap-4">
            <div className="text-right hidden xs:block">
              <p className="text-sm font-semibold truncate max-w-[80px] lg:max-w-none text-white">{user.username === 'admin' ? 'Ù…Ø¯ÛŒØ±ÛŒØª ØºØ²Ø§Ù„' : user.username}</p>
              <p className="text-[10px] lg:text-xs text-red-400/80">{user.role === 'manager' ? 'Ù…Ø¯ÛŒØ± Ú©Ù„' : 'Ù¾Ø°ÛŒØ±Ø´ Ø¢Ù…ÙˆØ²Ø´Ú¯Ø§Ù‡'}</p>
            </div>
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2.5 bg-red-950/60 border border-red-500/30 text-white rounded-xl">
              <Menu size={18} />
            </button>
          </div>
        </header>

        <div className="p-4 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <SectionRouter 
                section={activeSection} 
                data={{ terms, students, salaries, expenses, levels, searchQuery }}
                actions={{ 
                  handleAddTerm, 
                  handleUpdateTerm,
                  handleDeleteTerm,
                  handleAddStudent, 
                  handleUpdateStudent, 
                  handleDeleteStudent, 
                  handleBatchStudent, 
                  handleAddSalary,
                  handleUpdateSalary,
                  handleDeleteSalary,
                  handleAddExpense,
                  handleUpdateExpense,
                  handleDeleteExpense,
                  handleAddLevel, 
                  handleDeleteLevel,
                  handleBatchLevels
                }}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function SectionRouter({ section, data, actions }: any) {
  switch (section) {
    case 'overview': return <OverviewSection data={data} />;
    case 'registration': return (
      <RegistrationSection 
        terms={data.terms} 
        students={data.students} 
        levels={data.levels}
        searchQuery={data.searchQuery}
        onAddTerm={actions.handleAddTerm} 
        onUpdateTerm={actions.handleUpdateTerm}
        onDeleteTerm={actions.handleDeleteTerm}
        onAddStudent={actions.handleAddStudent}
        onUpdateStudent={actions.handleUpdateStudent}
        onDeleteStudent={actions.handleDeleteStudent}
        onBatchStudent={actions.handleBatchStudent}
        onAddLevel={actions.handleAddLevel}
        onDeleteLevel={actions.handleDeleteLevel}
        onBatchLevels={actions.handleBatchLevels}
      />
    );
    case 'payroll': return (
      <PayrollSection 
        salaries={data.salaries} 
        terms={data.terms} 
        searchQuery={data.searchQuery}
        onAddSalary={actions.handleAddSalary}
        onUpdateSalary={actions.handleUpdateSalary}
        onDeleteSalary={actions.handleDeleteSalary}
      />
    );
    case 'expenses': return (
      <ExpensesSection 
        expenses={data.expenses} 
        terms={data.terms} 
        searchQuery={data.searchQuery}
        onAddExpense={actions.handleAddExpense}
        onUpdateExpense={actions.handleUpdateExpense}
        onDeleteExpense={actions.handleDeleteExpense}
      />
    );
    default: return null;
  }
}

function OverviewSection({ data }: { data: any }) {
  const [selectedTermId, setSelectedTermId] = useState<string | null>(data.terms?.[0]?.id || null);

  const query = data.searchQuery ? data.searchQuery.trim().toLowerCase() : '';
  const filteredRawStudents = query
    ? data.students.filter((s: any) =>
        s.firstName?.toLowerCase().includes(query) ||
        s.lastName?.toLowerCase().includes(query) ||
        s.phone?.toLowerCase().includes(query) ||
        s.level?.toLowerCase().includes(query)
      )
    : data.students;

  const filteredRawExpenses = query
    ? data.expenses.filter((e: any) =>
        e.title?.toLowerCase().includes(query) ||
        e.category?.toLowerCase().includes(query) ||
        e.date?.toLowerCase().includes(query)
      )
    : data.expenses;

  const filteredRawSalaries = query
    ? data.salaries.filter((s: any) =>
        s.teacherName?.toLowerCase().includes(query) ||
        s.role?.toLowerCase().includes(query) ||
        s.month?.toLowerCase().includes(query)
      )
    : data.salaries;

  const students = selectedTermId && selectedTermId !== 'all' ? filteredRawStudents.filter((s: any) => String(s.termId) === String(selectedTermId)) : filteredRawStudents;
  const expenses = selectedTermId && selectedTermId !== 'all' ? filteredRawExpenses.filter((e: any) => String(e.termId) === String(selectedTermId)) : filteredRawExpenses;
  const salaries = selectedTermId && selectedTermId !== 'all' ? filteredRawSalaries.filter((s: any) => String(s.termId) === String(selectedTermId)) : filteredRawSalaries;

  const totalExpected = Math.max(0, students.reduce((acc: number, s: any) => acc + (Number(s.totalPayable) || 0), 0));
  const totalReceived = Math.max(0, students.reduce((acc: number, s: any) => acc + (Number(s.amountPaid) || 0), 0));
  const totalExpenses = Math.max(0, expenses.reduce((acc: number, e: any) => acc + (Number(e.amount) || 0), 0));
  const totalPayroll = Math.max(0, salaries.reduce((acc: number, s: any) => acc + (Number(s.amount) || 0), 0));
  const totalDebt = Math.max(0, students.reduce((acc: number, s: any) => acc + (Number(s.debt) || 0), 0));
  const netIncome = totalExpected - totalExpenses - totalPayroll;

  const handleExportExcel = () => {
    const overviewData = [
      { 'Ø¹Ù†ÙˆØ§Ù†': 'Ø¬Ù…Ø¹ Ø¯Ø±ÛŒØ§ÙØªÛŒ ØªØ§ Ø§ÛŒÙ† Ù„Ø­Ø¸Ù‡', 'Ù…Ø¨Ù„Øº (ØªÙˆÙ…Ø§Ù†)': totalReceived },
      { 'Ø¹Ù†ÙˆØ§Ù†': 'Ø¬Ù…Ø¹ Ù‚Ø§Ø¨Ù„ Ø¯Ø±ÛŒØ§ÙØª', 'Ù…Ø¨Ù„Øº (ØªÙˆÙ…Ø§Ù†)': totalExpected },
      { 'Ø¹Ù†ÙˆØ§Ù†': 'Ø¯Ø±Ø¢Ù…Ø¯ Ú©Ù„', 'Ù…Ø¨Ù„Øº (ØªÙˆÙ…Ø§Ù†)': netIncome },
      { 'Ø¹Ù†ÙˆØ§Ù†': 'Ø¬Ù…Ø¹ Ù…Ø¨Ø§Ù„Øº Ø¨Ø¯Ù‡ÛŒ', 'Ù…Ø¨Ù„Øº (ØªÙˆÙ…Ø§Ù†)': totalDebt },
      { 'Ø¹Ù†ÙˆØ§Ù†': 'Ù‡Ø²ÛŒÙ†Ù‡â€ŒÙ‡Ø§', 'Ù…Ø¨Ù„Øº (ØªÙˆÙ…Ø§Ù†)': totalExpenses },
      { 'Ø¹Ù†ÙˆØ§Ù†': 'Ø­Ù‚ÙˆÙ‚ Ù¾Ø±Ø¯Ø§Ø®ØªÙ†ÛŒ', 'Ù…Ø¨Ù„Øº (ØªÙˆÙ…Ø§Ù†)': totalPayroll },
    ];

    const salariesData = salaries.map((s: any) => ({
      'Ù†Ø§Ù… Ø§Ø³ØªØ§Ø¯': s.teacherName || '',
      'Ù†Ù‚Ø´': s.role || '',
      'Ù…Ø¨Ù„Øº (ØªÙˆÙ…Ø§Ù†)': s.amount || 0,
      'Ø¨Ø§Ø¨Øª Ù…Ø§Ù‡': s.month || '',
      'ÙˆØ¶Ø¹ÛŒØª Ù¾Ø±Ø¯Ø§Ø®Øª': s.status === 'paid' ? 'Ù¾Ø±Ø¯Ø§Ø®Øª Ø´Ø¯Ù‡' : 'Ù¾Ø±Ø¯Ø§Ø®Øª Ù†Ø´Ø¯Ù‡'
    }));

    const studentsData = students.map((s: any) => ({
      'Ù†Ø§Ù…': s.firstName || '',
      'Ù†Ø§Ù… Ø®Ø§Ù†ÙˆØ§Ø¯Ú¯ÛŒ': s.lastName || '',
      'Ø³Ø·Ø­/Ø¯ÙˆØ±Ù‡': s.level || '',
      'Ø´Ù…Ø§Ø±Ù‡ ØªÙ…Ø§Ø³': s.phone || '',
      'Ù†ÙˆØ¹ Ú©Ù„Ø§Ø³': s.classType || '',
      'Ú©Ù„ Ø´Ù‡Ø±ÛŒÙ‡': s.totalPayable || 0,
      'Ù…Ø¨Ù„Øº Ù¾Ø±Ø¯Ø§Ø®ØªÛŒ': s.amountPaid || 0,
      'Ø¨Ø¯Ù‡ÛŒ': s.debt || 0,
      'ÙˆØ¶Ø¹ÛŒØª ØªØ³ÙˆÛŒÙ‡': s.status === 'paid' ? 'ØªØ³ÙˆÛŒÙ‡ Ø´Ø¯Ù‡' : 'Ø¨Ø¯Ù‡Ú©Ø§Ø±'
    }));

    const expensesData = expenses.map((e: any) => ({
      'Ø¹Ù†ÙˆØ§Ù†': e.title || '',
      'Ø¯Ø³ØªÙ‡ Ø¨Ù†Ø¯ÛŒ': e.category || '',
      'Ù…Ø¨Ù„Øº (ØªÙˆÙ…Ø§Ù†)': e.amount || 0,
      'ØªØ§Ø±ÛŒØ®': e.date || ''
    }));

    const wb = XLSX.utils.book_new();
    const wsOverview = XLSX.utils.json_to_sheet(overviewData);
    const wsSalaries = XLSX.utils.json_to_sheet(salariesData);
    const wsStudents = XLSX.utils.json_to_sheet(studentsData);
    const wsExpenses = XLSX.utils.json_to_sheet(expensesData);

    XLSX.utils.book_append_sheet(wb, wsOverview, 'Ù†Ù…Ø§ÛŒ Ú©Ù„ÛŒ');
    XLSX.utils.book_append_sheet(wb, wsSalaries, 'Ø­Ù‚ÙˆÙ‚ Ø¯Ø³ØªÙ…Ø²Ø¯');
    XLSX.utils.book_append_sheet(wb, wsStudents, 'Ø«Ø¨Øª Ù†Ø§Ù…');
    XLSX.utils.book_append_sheet(wb, wsExpenses, 'Ù‡Ø²ÛŒÙ†Ù‡ Ù‡Ø§');

    const termName = selectedTermId && selectedTermId !== 'all' 
      ? data.terms.find((t: any) => String(t.id) === String(selectedTermId))?.name || 'Ú¯Ø²Ø§Ø±Ø´'
      : 'Ù‡Ù…Ù‡_ØªØ±Ù…_Ù‡Ø§';
      
    XLSX.writeFile(wb, `Ghazal_Report_${termName.replace(/\s+/g, '_')}.xlsx`);
  };

  const stats = [
    { label: 'Ø¬Ù…Ø¹ Ø¯Ø±ÛŒØ§ÙØªÛŒ ØªØ§ Ø§ÛŒÙ† Ù„Ø­Ø¸Ù‡', value: totalReceived, icon: CheckCircle2, color: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' },
    { label: 'Ø¬Ù…Ø¹ Ù‚Ø§Ø¨Ù„ Ø¯Ø±ÛŒØ§ÙØª', value: totalExpected, icon: TrendingUp, color: 'bg-sky-500/10 text-sky-400 border border-sky-500/30' },
    { label: 'Ø¯Ø±Ø¢Ù…Ø¯ Ú©Ù„', value: netIncome, icon: Coins, color: 'bg-purple-500/10 text-purple-400 border border-purple-500/30' },
    { label: 'Ø¬Ù…Ø¹ Ù…Ø¨Ø§Ù„Øº Ø¨Ø¯Ù‡ÛŒ', value: totalDebt, icon: DollarSign, color: 'bg-rose-500/10 text-rose-300 border border-rose-500/30' },
    { label: 'Ù‡Ø²ÛŒÙ†Ù‡â€ŒÙ‡Ø§ÛŒ Ø¬Ø§Ø±ÛŒ', value: totalExpenses, icon: TrendingDown, color: 'bg-red-500/10 text-red-400 border border-red-500/30' },
    { label: 'Ø­Ù‚ÙˆÙ‚ Ù¾Ø±Ø¯Ø§Ø®ØªÙ†ÛŒ', value: totalPayroll, icon: Wallet, color: 'bg-amber-500/10 text-amber-400 border border-amber-500/30' },
  ];

  return (
    <div className="space-y-6 lg:space-y-10 p-4 lg:p-8" dir="rtl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl lg:text-3xl font-serif font-medium text-white">Ø¯Ø§Ø´Ø¨ÙˆØ±Ø¯ Ù…Ø¯ÛŒØ±ÛŒØªÛŒ</h2>
          <p className="text-slate-400 mt-1 text-sm lg:text-base">Ø®Ù„Ø§ØµÙ‡ ÙˆØ¶Ø¹ÛŒØª Ù…Ø§Ù„ÛŒ Ùˆ Ø¹Ù…Ù„Ú©Ø±Ø¯ Ø¢Ú©Ø§Ø¯Ù…ÛŒ ØºØ²Ø§Ù„</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <button 
            onClick={handleExportExcel}
            className="flex justify-center items-center gap-2 bg-gradient-to-r from-red-950 to-red-900 text-red-200 hover:text-white hover:border-red-500 px-5 py-2.5 rounded-full transition-all border border-red-500/30 text-sm font-medium whitespace-nowrap cursor-pointer shadow-[0_0_15px_rgba(220,38,38,0.2)]"
          >
            <Download size={18} />
            <span>Ø®Ø±ÙˆØ¬ÛŒ Ø§Ú©Ø³Ù„</span>
          </button>
          <select 
            value={selectedTermId || 'all'}
            onChange={(e) => setSelectedTermId(e.target.value)}
            className="bg-[#12121C] border border-red-900/40 rounded-full py-2.5 px-5 focus:border-red-500 outline-none text-white cursor-pointer text-sm font-medium min-w-[200px]"
          >
            <option value="all" className="bg-[#12121C] text-white">Ù‡Ù…Ù‡ ØªØ±Ù…â€ŒÙ‡Ø§</option>
            {data.terms.map((t: any) => (
              <option key={t.id} value={t.id} className="bg-[#12121C] text-white">{t.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6 gap-4 lg:gap-5">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          const formattedValue = Math.abs(stat.value).toLocaleString();
          const isNegative = stat.value < 0;
          return (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              key={i} 
              className="liquid-glass-interactive p-5 rounded-2xl border border-red-900/30 shadow-[0_8px_32px_rgba(0,0,0,0.5)] group flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div className={`p-2.5 rounded-xl transition-transform group-hover:scale-105 ${stat.color}`}>
                    <Icon size={20} />
                  </div>
                </div>
                <p className="text-slate-400 text-xs sm:text-sm mb-2 font-medium truncate" title={stat.label}>{stat.label}</p>
              </div>
              <div>
                <h3 className="text-base sm:text-lg lg:text-xl font-bold tracking-tight text-white flex items-baseline gap-1.5 flex-wrap">
                  <span dir="ltr" className={`inline-block font-sans font-bold tracking-normal ${isNegative ? 'text-rose-400' : ''}`}>
                    {isNegative ? `-${formattedValue}` : formattedValue}
                  </span>
                  <span className="text-xs font-normal text-slate-400 font-sans">ØªÙˆÙ…Ø§Ù†</span>
                </h3>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="liquid-glass p-6 lg:p-8 rounded-3xl border border-red-900/30 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
        <h4 className="text-xl font-serif font-medium text-white mb-8">Ù†Ù…Ø§ÛŒ Ú©Ù„ÛŒ Ø«Ø¨Øªâ€ŒÙ†Ø§Ù…</h4>
        <div className="w-full h-48 lg:h-64 flex items-end gap-4 lg:gap-12 px-4 justify-around mt-8">
           {[
             { label: 'Ú©Ù„ Ø¯Ø§Ù†Ø´â€ŒØ¢Ù…ÙˆØ²Ø§Ù†', value: students.length, barBg: 'bg-gradient-to-t from-red-900 to-rose-600', textColor: 'text-red-300' },
             { label: 'ØªØ³ÙˆÛŒÙ‡â€ŒØ´Ø¯Ù‡', value: students.filter((s:any) => s.status === 'paid').length, barBg: 'bg-gradient-to-t from-emerald-900 to-emerald-500', textColor: 'text-emerald-400' },
             { label: 'Ø¨Ø¯Ù‡Ú©Ø§Ø±', value: students.filter((s:any) => s.status === 'unpaid').length, barBg: 'bg-gradient-to-t from-red-950 to-red-600', textColor: 'text-red-400' }
           ].map((item, i, arr) => {
             const maxVal = Math.max(arr[0].value, 1);
             const heightPct = (item.value / maxVal) * 100;
             return (
               <div key={i} className="flex-1 flex flex-col items-center gap-4 h-full justify-end">
                 <div className={`text-xl lg:text-3xl font-bold ${item.textColor}`}>{item.value} <span className="text-xs font-normal text-slate-400">Ù†ÙØ±</span></div>
                 <motion.div 
                   initial={{ height: 0 }}
                   animate={{ height: `${heightPct}%` }}
                   transition={{ delay: i * 0.1, duration: 0.8 }}
                   className={`w-full max-w-[120px] ${item.barBg} rounded-t-xl shadow-[0_0_15px_rgba(220,38,38,0.2)]`}
                 />
                 <span className="text-xs lg:text-sm text-slate-400 font-medium whitespace-nowrap">{item.label}</span>
               </div>
             );
           })}
        </div>
      </div>
    </div>
  );
}

function EditPaymentModal({
  editingStudent,
  onClose,
  onUpdateStudent
}: {
  editingStudent: Student;
  onClose: () => void;
  onUpdateStudent: (id: string, amountPaid: number, receiptUrl?: string, extraData?: any) => Promise<void>;
}) {
  const [hasBook, setHasBook] = useState(!!editingStudent.hasBook);
  const [bookName, setBookName] = useState(editingStudent.bookName || '');
  const [bookPrice, setBookPrice] = useState<number | string>(editingStudent.bookPrice || '');
  const [hasInterview, setHasInterview] = useState(!!editingStudent.hasInterview);
  const [hasDiscount, setHasDiscount] = useState(!!editingStudent.hasDiscount);
  const [discountPercent, setDiscountPercent] = useState<number | string>(editingStudent.discountPercent || '');

  const prevDiscount = (editingStudent.hasDiscount && editingStudent.discountAmount) ? editingStudent.discountAmount : 0;
  const prevBook = editingStudent.hasBook ? (Number(editingStudent.bookPrice) || 0) : 0;
  const prevInterview = editingStudent.hasInterview ? 250000 : 0;
  const rawBaseTuition = Math.max(0, editingStudent.totalPayable + prevDiscount - prevBook - prevInterview);

  const discountPctNum = hasDiscount ? (Number(discountPercent) || 0) : 0;
  const calculatedDiscountAmount = Math.round(rawBaseTuition * (discountPctNum / 100));
  const discountedBaseTuition = Math.max(0, rawBaseTuition - calculatedDiscountAmount);

  const calculatedBookPrice = hasBook ? (Number(bookPrice) || 0) : 0;
  const calculatedInterviewFee = hasInterview ? 250000 : 0;
  const calculatedTotalPayable = discountedBaseTuition + calculatedBookPrice + calculatedInterviewFee;

  const [amountPaid, setAmountPaid] = useState<number | string>(editingStudent.amountPaid);
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <Modal title={`ÙˆÛŒØ±Ø§ÛŒØ´ Ù¾Ø±Ø¯Ø§Ø®Øª: ${editingStudent.firstName} ${editingStudent.lastName}`} onClose={onClose}>
      <form onSubmit={async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
          const f = new FormData(e.currentTarget);
          let receiptUrl = '';
          const file = f.get('receipt') as File;
          if (file && file.size > 0) {
            receiptUrl = await new Promise((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as string);
              reader.readAsDataURL(file);
            });
          }

          await onUpdateStudent(
            editingStudent.id,
            Number(amountPaid),
            receiptUrl || undefined,
            {
              totalPayable: calculatedTotalPayable,
              hasBook,
              bookName: hasBook ? bookName : '',
              bookPrice: hasBook ? (Number(bookPrice) || 0) : 0,
              hasInterview,
              hasDiscount,
              discountPercent: discountPctNum,
              discountAmount: calculatedDiscountAmount
            }
          );
          onClose();
        } catch (err) {
          console.error(err);
        } finally {
          setIsSubmitting(false);
        }
      }} className="space-y-4">

        <div className="space-y-1">
          <label className="text-[10px] text-red-400 px-1 font-medium">Ø´Ù‡Ø±ÛŒÙ‡ Ù¾Ø§ÛŒÙ‡ Ø³Ø·Ø­ (ØªÙˆÙ…Ø§Ù†)</label>
          <div className="w-full bg-[#12121C] border border-red-900/40 text-slate-200 rounded-xl py-2.5 px-3 font-semibold text-sm">
            {rawBaseTuition.toLocaleString()}
          </div>
        </div>

        {/* Ø¨Ø®Ø´ Ú¯Ø²ÛŒÙ†Ù‡â€ŒÙ‡Ø§: Ú©ØªØ§Ø¨ØŒ interview Ùˆ ØªØ®ÙÛŒÙ */}
        <div className="bg-[#12121C]/90 border border-red-900/40 rounded-xl p-3.5 space-y-3">
          <div className="text-xs font-bold text-red-300 border-b border-red-900/30 pb-2">
            Ø®Ø¯Ù…Ø§ØªØŒ ØªØ®ÙÛŒÙ Ùˆ Ø§ÙØ²ÙˆØ¯Ù‡ Ù…Ø§Ù„ÛŒ
          </div>

          {/* 1. ØªÛŒÚ© Ú©ØªØ§Ø¨ */}
          <div className="space-y-2">
            <label className="flex items-center gap-2.5 text-sm text-slate-200 font-medium cursor-pointer select-none">
              <input
                type="checkbox"
                checked={hasBook}
                onChange={(e) => setHasBook(e.target.checked)}
                className="w-4 h-4 accent-red-600 rounded cursor-pointer"
              />
              <span>Ú©ØªØ§Ø¨</span>
            </label>

            {hasBook && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 bg-[#181826] p-3 rounded-lg border border-red-900/30">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-medium">Ø§Ø³Ù… Ú©ØªØ§Ø¨</label>
                  <input
                    type="text"
                    required={hasBook}
                    value={bookName}
                    onChange={(e) => setBookName(e.target.value)}
                    placeholder="Ù…Ø«Ø§Ù„: Family & Friends"
                    className="w-full bg-[#0E0E16] border border-red-900/40 text-white rounded-lg py-2 px-3 text-xs focus:border-red-500 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-medium">Ù…Ø¨Ù„Øº Ú©ØªØ§Ø¨ (ØªÙˆÙ…Ø§Ù†)</label>
                  <input
                    type="number"
                    required={hasBook}
                    value={bookPrice}
                    onChange={(e) => setBookPrice(e.target.value)}
                    placeholder="ØªÙˆÙ…Ø§Ù†"
                    className="w-full bg-[#0E0E16] border border-red-900/40 text-white rounded-lg py-2 px-3 text-xs focus:border-red-500 outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 2. ØªÛŒÚ© interview */}
          <div className="pt-2 border-t border-red-900/30 flex items-center justify-between">
            <label className="flex items-center gap-2.5 text-sm text-slate-200 font-medium cursor-pointer select-none">
              <input
                type="checkbox"
                checked={hasInterview}
                onChange={(e) => setHasInterview(e.target.checked)}
                className="w-4 h-4 accent-red-600 rounded cursor-pointer"
              />
              <span>interview</span>
            </label>
            <span className={`text-xs font-semibold ${hasInterview ? 'text-emerald-400' : 'text-slate-400'}`}>
              Û²ÛµÛ°,Û°Û°Û° ØªÙˆÙ…Ø§Ù† {hasInterview ? '(Ø§ÙØ²ÙˆØ¯Ù‡ Ø´Ø¯)' : ''}
            </span>
          </div>

          {/* 3. ØªÛŒÚ© ØªØ®ÙÛŒÙ */}
          <div className="pt-2 border-t border-red-900/30 space-y-2">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2.5 text-sm text-slate-200 font-medium cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={hasDiscount}
                  onChange={(e) => setHasDiscount(e.target.checked)}
                  className="w-4 h-4 accent-red-600 rounded cursor-pointer"
                />
                <span>ØªØ®ÙÛŒÙ Ø±ÙˆÛŒ Ø´Ù‡Ø±ÛŒÙ‡ ØªØ±Ù…</span>
              </label>
              {hasDiscount && (
                <span className="text-xs font-semibold text-rose-400 font-mono">
                  Ú©Ù… Ø´Ø¯Ù‡: {calculatedDiscountAmount.toLocaleString()} ØªÙˆÙ…Ø§Ù†
                </span>
              )}
            </div>

            {hasDiscount && (
              <div className="bg-[#181826] p-3 rounded-lg border border-red-900/30 space-y-1">
                <label className="text-[10px] text-slate-400 font-medium">Ø¯Ø±ØµØ¯ ØªØ®ÙÛŒÙ (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  required={hasDiscount}
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(e.target.value)}
                  placeholder="Ù…Ø«Ø§Ù„: Û±Û°"
                  className="w-full bg-[#0E0E16] border border-red-900/40 text-white rounded-lg py-2 px-3 text-xs focus:border-red-500 outline-none font-mono"
                />
              </div>
            )}
          </div>
        </div>

        {/* Ø¬Ù…Ø¹ Ø´Ù‡Ø±ÛŒÙ‡ Ø¬Ø¯ÛŒØ¯ Ù¾Ø³ Ø§Ø² Ø§Ø­ØªØ³Ø§Ø¨ ØªÛŒÚ©â€ŒÙ‡Ø§ */}
        <div className="bg-gradient-to-r from-red-950 to-red-900 text-white p-3 rounded-xl flex justify-between items-center text-xs font-medium border border-red-500/30">
          <span>Ù…Ø¬Ù…ÙˆØ¹ Ú©Ù„ Ø´Ù‡Ø±ÛŒÙ‡ (Ù‚Ø§Ø¨Ù„ Ù¾Ø±Ø¯Ø§Ø®Øª):</span>
          <span className="text-sm font-bold text-emerald-400 font-mono">{calculatedTotalPayable.toLocaleString()} ØªÙˆÙ…Ø§Ù†</span>
        </div>

        {/* Ù…Ø¨Ù„Øº Ù¾Ø±Ø¯Ø§Ø®Øª Ø´Ø¯Ù‡ */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <label className="text-[10px] text-slate-400 px-1 font-medium">Ù…Ø¨Ù„Øº Ù¾Ø±Ø¯Ø§Ø®Øª Ø´Ø¯Ù‡ (ØªÙˆÙ…Ø§Ù†)</label>
            <button
              type="button"
              onClick={() => setAmountPaid(calculatedTotalPayable)}
              className="text-[10px] text-emerald-400 hover:underline font-medium cursor-pointer"
            >
              ØªØ³ÙˆÛŒÙ‡ Ú©Ø§Ù…Ù„ ({calculatedTotalPayable.toLocaleString()})
            </button>
          </div>
          <input
            name="p"
            type="number"
            required
            value={amountPaid}
            onChange={(e) => setAmountPaid(e.target.value)}
            placeholder="ØªÙˆÙ…Ø§Ù†"
            className="w-full bg-[#12121C] border border-red-900/40 text-white rounded-xl py-2.5 px-3 focus:border-red-500 outline-none text-sm font-semibold font-mono"
          />
        </div>

        {/* Ø¢Ù¾Ù„ÙˆØ¯ Ø±Ø³ÛŒØ¯ */}
        <div className="space-y-1 mt-2">
          <label className="text-[10px] text-slate-400 px-1 font-medium">Ø¢Ù¾Ù„ÙˆØ¯ Ø±Ø³ÛŒØ¯ Ø¬Ø¯ÛŒØ¯ (Ø§Ø®ØªÛŒØ§Ø±ÛŒ)</label>
          <input
            name="receipt"
            type="file"
            accept="image/*"
            className="w-full bg-[#12121C] border border-red-900/40 rounded-xl py-2 px-3 focus:border-red-500 outline-none text-xs text-slate-200 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-[10px] file:font-semibold file:bg-red-600 file:text-white hover:file:bg-red-700 transition-all cursor-pointer"
          />
        </div>

        {editingStudent.receiptUrl && (
          <div className="pt-2">
            <label className="text-[10px] text-slate-400 px-1 block mb-2 font-medium">Ø±Ø³ÛŒØ¯ ÙØ¹Ù„ÛŒ</label>
            <img src={editingStudent.receiptUrl} alt="Receipt" className="h-24 rounded-lg object-contain bg-[#12121C] p-1 border border-red-900/40" />
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-red-600 to-rose-700 text-white hover:brightness-110 py-3.5 rounded-2xl font-bold shadow-[0_0_20px_rgba(220,38,38,0.4)] transition-all text-xs uppercase tracking-wider cursor-pointer mt-4"
        >
          {isSubmitting ? 'Ø¯Ø± Ø­Ø§Ù„ Ø°Ø®ÛŒØ±Ù‡...' : 'Ø°Ø®ÛŒØ±Ù‡ ØªØºÛŒÛŒØ±Ø§Øª'}
        </button>
      </form>
    </Modal>
  );
}

function RegistrationSection({ terms, students: rawStudents, levels, searchQuery, onAddTerm, onUpdateTerm, onDeleteTerm, onAddStudent, onUpdateStudent, onDeleteStudent, onBatchStudent, onAddLevel, onDeleteLevel, onBatchLevels }: any) {
  const [showAddTerm, setShowAddTerm] = useState(false);
  const [editingTerm, setEditingTerm] = useState<Term | null>(null);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [showAddLevel, setShowAddLevel] = useState(false);
  const [view, setView] = useState<'students' | 'levels'>('students');
  const [selectedLevelInfo, setSelectedLevelInfo] = useState<{name: string, fee: number} | null>(null);
  const [selectedTermId, setSelectedTermId] = useState<string | null>(null);
  const [showTermMenu, setShowTermMenu] = useState(false);
  const [visiblePhoneId, setVisiblePhoneId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [classTypeFilter, setClassTypeFilter] = useState<'all' | 'Ø­Ø¶ÙˆØ±ÛŒ' | 'Ø¢Ù†Ù„Ø§ÛŒÙ†' | 'Ù…Ù†ØªÙˆØ±ÛŒÙ†Ú¯' | 'Ø¢Ù„Ù…Ø§Ù†ÛŒ' | 'Ø®ØµÙˆØµÛŒ'>('all');
  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Ù…ØªØºÛŒØ±Ù‡Ø§ÛŒ ÙØ±Ù… Ø«Ø¨Øª Ø¯Ø§Ù†Ø´Ø¬Ùˆ Ø¨Ø±Ø§ÛŒ Ú©ØªØ§Ø¨ØŒ Ù…ØµØ§Ø­Ø¨Ù‡ Ùˆ ØªØ®ÙÛŒÙ
  const [addHasBook, setAddHasBook] = useState(false);
  const [addBookName, setAddBookName] = useState('');
  const [addBookPrice, setAddBookPrice] = useState('');
  const [addHasInterview, setAddHasInterview] = useState(false);
  const [addHasDiscount, setAddHasDiscount] = useState(false);
  const [addDiscountPercent, setAddDiscountPercent] = useState('');
  
  // Ù…ØªØºÛŒØ±Ù‡Ø§ÛŒ Ø¨Ø®Ø´ Ø±Ø³ÛŒØ¯Ù‡Ø§
  const [receiptModalStudent, setReceiptModalStudent] = useState<Student | null>(null);
  const [studentReceipts, setStudentReceipts] = useState<any[]>([]);
  const [receiptAmount, setReceiptAmount] = useState('');
  const [isReceiptLoading, setIsReceiptLoading] = useState(false);
  
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const levelFileInputRef = React.useRef<HTMLInputElement>(null);

  const query = searchQuery ? searchQuery.trim().toLowerCase() : '';
  const students = query
    ? rawStudents.filter((s: Student) =>
        s.firstName?.toLowerCase().includes(query) ||
        s.lastName?.toLowerCase().includes(query) ||
        s.phone?.toLowerCase().includes(query) ||
        s.level?.toLowerCase().includes(query) ||
        s.classType?.toLowerCase().includes(query)
      )
    : rawStudents;

  const selectedTerm = terms.find((t: Term) => t.id === selectedTermId) || terms[0];
  
  useEffect(() => {
    if (!selectedTermId && terms.length > 0) {
      setSelectedTermId(terms[0].id);
    }
  }, [terms, selectedTermId]);

  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!selectedTermId) {
      alert('Ù„Ø·ÙØ§ Ø§Ø¨ØªØ¯Ø§ ÛŒÚ© ØªØ±Ù… Ø±Ø§ Ø§Ù†ØªØ®Ø§Ø¨ Ú©Ù†ÛŒØ¯');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet) as any[];

        const studentsToImport = json.map(row => {
          const firstName = row['Ù†Ø§Ù…'] || row['First Name'] || '';
          const lastName = row['Ù†Ø§Ù… Ø®Ø§Ù†ÙˆØ§Ø¯Ú¯ÛŒ'] || row['Last Name'] || '';
          const levelName = row['Ø³Ø·Ø­'] || row['Level'] || '';
          const phone = row['Ø´Ù…Ø§Ø±Ù‡ ØªÙ…Ø§Ø³'] || row['Phone'] || '';
          const classType = row['Ù†ÙˆØ¹ Ú©Ù„Ø§Ø³'] || row['Class Type'] || 'Ø­Ø¶ÙˆØ±ÛŒ';
          const amountPaid = Number(row['Ù…Ø¨Ù„Øº Ù¾Ø±Ø¯Ø§Ø®ØªÛŒ'] || row['Paid Amount'] || 0);
          
          const level = levels.find((l: any) => l.name === levelName);
          const totalPayable = level ? level.fee : 0;
          const debt = totalPayable - amountPaid;
          const status = debt <= 0 ? 'paid' : 'unpaid';

          return {
            firstName,
            lastName,
            level: levelName,
            phone: String(phone),
            classType,
            totalPayable,
            amountPaid,
            debt,
            status,
            termId: selectedTermId
          };
        }).filter(s => s.firstName && s.lastName);

        if (studentsToImport.length > 0) {
          onBatchStudent(studentsToImport);
        } else {
          alert('Ù‡ÛŒÚ† Ø¯Ø§Ù†Ø´Ø¬ÙˆÛŒ Ù…Ø¹ØªØ¨Ø±ÛŒ Ø¯Ø± ÙØ§ÛŒÙ„ ÛŒØ§ÙØª Ù†Ø´Ø¯. Ù„Ø·ÙØ§ Ø³ØªÙˆÙ†â€ŒÙ‡Ø§ÛŒ "Ù†Ø§Ù…"ØŒ "Ù†Ø§Ù… Ø®Ø§Ù†ÙˆØ§Ø¯Ú¯ÛŒ" Ùˆ "Ø³Ø·Ø­" Ø±Ø§ Ú†Ú© Ú©Ù†ÛŒØ¯.');
        }
      } catch (err) {
        console.error(err);
        alert('Ø®Ø·Ø§ Ø¯Ø± Ø®ÙˆØ§Ù†Ø¯Ù† ÙØ§ÛŒÙ„ Ø§Ú©Ø³Ù„');
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDownloadTemplate = () => {
    const templateData = [
      {
        'Ù†Ø§Ù…': 'Ù…Ø«Ø§Ù„: Ø¹Ù„ÛŒ',
        'Ù†Ø§Ù… Ø®Ø§Ù†ÙˆØ§Ø¯Ú¯ÛŒ': 'Ù…Ø«Ø§Ù„: Ù…Ø­Ù…Ø¯ÛŒ',
        'Ø³Ø·Ø­': 'Ù…Ø«Ø§Ù„: Elementary 1',
        'Ù†ÙˆØ¹ Ú©Ù„Ø§Ø³': 'Ø­Ø¶ÙˆØ±ÛŒ / Ø¢Ù†Ù„Ø§ÛŒÙ† / Ù…Ù†ØªÙˆØ±ÛŒÙ†Ú¯ / Ø¢Ù„Ù…Ø§Ù†ÛŒ',
        'Ø´Ù…Ø§Ø±Ù‡ ØªÙ…Ø§Ø³': '09121234567',
        'Ù…Ø¨Ù„Øº Ù¾Ø±Ø¯Ø§Ø®ØªÛŒ': 500000
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Students");
    XLSX.writeFile(workbook, "ghazal_import_template.xlsx");
  };

  const handleImportLevelExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet) as any[];

        const levelsToImport = json.map(row => {
          const name = String(row['Ù†Ø§Ù… Ø³Ø·Ø­'] || row['Ø³Ø·Ø­'] || row['Ù†Ø§Ù…'] || row['Level Name'] || row['Level'] || row['Name'] || '').trim();
          let rawFee = row['Ø´Ù‡Ø±ÛŒÙ‡ (ØªÙˆÙ…Ø§Ù†)'] || row['Ø´Ù‡Ø±ÛŒÙ‡'] || row['Ø´Ù‡Ø±ÛŒÙ‡ Ù¾Ø§ÛŒÙ‡'] || row['Ù…Ø¨Ù„Øº Ø´Ù‡Ø±ÛŒÙ‡'] || row['Ù…Ø¨Ù„Øº'] || row['Fee'] || row['Tuition'] || row['Price'] || 0;
          
          if (typeof rawFee === 'string') {
            rawFee = rawFee.replace(/[^\d]/g, '');
          }
          const fee = Number(rawFee) || 0;

          return { name, fee };
        }).filter(l => l.name && l.fee > 0);

        if (levelsToImport.length > 0) {
          if (typeof onBatchLevels === 'function') {
            onBatchLevels(levelsToImport);
          }
        } else {
          alert('Ù‡ÛŒÚ† Ø³Ø·Ø­ Ù…Ø¹ØªØ¨Ø±ÛŒ Ø¯Ø± ÙØ§ÛŒÙ„ ÛŒØ§ÙØª Ù†Ø´Ø¯. Ù„Ø·ÙØ§ Ø³ØªÙˆÙ†â€ŒÙ‡Ø§ÛŒ "Ù†Ø§Ù… Ø³Ø·Ø­" Ùˆ "Ø´Ù‡Ø±ÛŒÙ‡" Ø±Ø§ Ú†Ú© Ú©Ù†ÛŒØ¯.');
        }
      } catch (err) {
        console.error(err);
        alert('Ø®Ø·Ø§ Ø¯Ø± Ø®ÙˆØ§Ù†Ø¯Ù† ÙØ§ÛŒÙ„ Ø§Ú©Ø³Ù„ Ø³Ø·ÙˆØ­');
      }
      if (levelFileInputRef.current) levelFileInputRef.current.value = '';
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDownloadLevelTemplate = () => {
    const templateData = [
      {
        'Ù†Ø§Ù… Ø³Ø·Ø­': 'Elementary (A1)',
        'Ø´Ù‡Ø±ÛŒÙ‡ (ØªÙˆÙ…Ø§Ù†)': 1800000
      },
      {
        'Ù†Ø§Ù… Ø³Ø·Ø­': 'Pre-Intermediate (A2)',
        'Ø´Ù‡Ø±ÛŒÙ‡ (ØªÙˆÙ…Ø§Ù†)': 2200000
      },
      {
        'Ù†Ø§Ù… Ø³Ø·Ø­': 'Intermediate (B1)',
        'Ø´Ù‡Ø±ÛŒÙ‡ (ØªÙˆÙ…Ø§Ù†)': 2500000
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Levels");
    XLSX.writeFile(workbook, "ghazal_levels_template.xlsx");
  };

  // ------------------------------------
  // ØªÙˆØ§Ø¨Ø¹ Ù…Ø±Ø¨ÙˆØ· Ø¨Ù‡ Ø³ÛŒØ³ØªÙ… Ú†Ø§Ù¾ Ø±Ø³ÛŒØ¯
  // ------------------------------------
  const handleOpenReceipts = async (student: Student) => {
    setReceiptModalStudent(student);
    setIsReceiptLoading(true);
    try {
      const res = await fetch(`/api/receipts/${student.id}`);
      const data = await res.json();
      setStudentReceipts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsReceiptLoading(false);
    }
  };

  const formatEnNum = (num: number | string) => {
    const n = Number(num);
    if (isNaN(n)) return String(num);
    return n.toLocaleString('en-US');
  };

  const toEnDigits = (str: string | number) => {
    return String(str)
      .replace(/[Û°-Û¹]/g, (d) => "0123456789"["Û°Û±Û²Û³Û´ÛµÛ¶Û·Û¸Û¹".indexOf(d)])
      .replace(/[Ù -Ù©]/g, (d) => "0123456789"["Ù Ù¡Ù¢Ù£Ù¤Ù¥Ù¦Ù§Ù¨Ù©".indexOf(d)]);
  };

  const printHTML = (student: Student, amount: number, date: string) => {
    const termName = terms.find((t: any) => String(t.id) === String(student.termId))?.name || 'Ù†Ø§Ù…Ø´Ø®Øµ';
    const printWindow = window.open('', '', 'width=800,height=600');
    if (!printWindow) return alert('Ù„Ø·ÙØ§ Ù¾Ø§Ù¾â€ŒØ¢Ù¾ (Pop-up) Ù…Ø±ÙˆØ±Ú¯Ø± Ø±Ø§ ÙØ¹Ø§Ù„ Ú©Ù†ÛŒØ¯');

    const bookCost = student.hasBook ? (Number(student.bookPrice) || 0) : 0;
    const interviewCost = student.hasInterview ? 250000 : 0;
    const discountCost = (student.hasDiscount && student.discountAmount) ? student.discountAmount : 0;
    const rawBaseTuition = Math.max(0, (Number(student.totalPayable) || 0) + discountCost - bookCost - interviewCost);

    let rowCount = 1;
    const itemRows = [];

    itemRows.push(`
      <tr>
        <td style="text-align: center;">${rowCount++}</td>
        <td style="text-align: right; padding-right: 15px;">Ø´Ù‡Ø±ÛŒÙ‡ Ø¯ÙˆØ±Ù‡ Ø¢Ù…ÙˆØ²Ø´ÛŒ (${student.level})</td>
        <td style="text-align: center;">${formatEnNum(rawBaseTuition)} ØªÙˆÙ…Ø§Ù†</td>
      </tr>
    `);

    if (student.hasDiscount && discountCost > 0) {
      itemRows.push(`
        <tr style="background-color: #fef2f2;">
          <td style="text-align: center;">${rowCount++}</td>
          <td style="text-align: right; padding-right: 15px; color: #b91c1c;">ØªØ®ÙÛŒÙ ÙˆÛŒÚ˜Ù‡ Ø´Ù‡Ø±ÛŒÙ‡ ØªØ±Ù… (${student.discountPercent || 0}%)</td>
          <td style="text-align: center; color: #b91c1c; font-weight: bold;">-${formatEnNum(discountCost)} ØªÙˆÙ…Ø§Ù†</td>
        </tr>
      `);
    }

    if (student.hasBook) {
      itemRows.push(`
        <tr>
          <td style="text-align: center;">${rowCount++}</td>
          <td style="text-align: right; padding-right: 15px;">Ú©ØªØ§Ø¨ Ø¢Ù…ÙˆØ²Ø´ÛŒ: ${student.bookName || 'Ú©ØªØ§Ø¨'}</td>
          <td style="text-align: center;">${formatEnNum(bookCost)} ØªÙˆÙ…Ø§Ù†</td>
        </tr>
      `);
    }

    if (student.hasInterview) {
      itemRows.push(`
        <tr>
          <td style="text-align: center;">${rowCount++}</td>
          <td style="text-align: right; padding-right: 15px;">Ù…ØµØ§Ø­Ø¨Ù‡ / Interview</td>
          <td style="text-align: center;">${formatEnNum(250000)} ØªÙˆÙ…Ø§Ù†</td>
        </tr>
      `);
    }

    const html = `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
    <meta charset="UTF-8">
    <title>Ú†Ø§Ù¾ Ø±Ø³ÛŒØ¯ ØºØ²Ø§Ù„</title>
    <style>
        body { font-family: Arial, Tahoma, sans-serif; padding: 20px; color: black; background: white; margin: 0; }
        .receipt-container { max-width: 100%; margin: 0 auto; border: 2px solid #ccc; padding: 30px; border-radius: 12px; }
        .header { display: flex; justify-content: space-between; border-bottom: 2px solid #333; padding-bottom: 15px; margin-bottom: 30px; }
        .header h2 { margin: 0; font-size: 24px; font-weight: bold; }
        .header p { margin: 5px 0 0; font-size: 14px; color: #555; }
        .info p { margin: 5px 0; font-size: 14px; }
        .title { text-align: center; font-size: 20px; font-weight: bold; margin-bottom: 30px; }
        .details { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px; font-size: 14px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 14px; }
        th, td { border: 1px solid #ccc; padding: 10px 12px; }
        th { background-color: #f3f4f6; color: #1f2937; font-weight: bold; }
        .summary-title { text-align: left; padding-left: 20px; font-weight: bold; }
        .summary-val { text-align: center; font-weight: bold; }
        .footer { display: flex; justify-content: space-between; border-top: 1px solid #ccc; padding-top: 30px; align-items: flex-end; }
        .footer-note { font-size: 12px; color: #666; max-width: 60%; line-height: 1.6; margin: 0; }
        .signature { text-align: center; }
        @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } .receipt-container { border: none; padding: 0; box-shadow: none; } }
    </style>
</head>
<body>
    <div class="receipt-container">
        <div class="header">
            <div>
                <h2>Ø¢Ù…ÙˆØ²Ø´Ú¯Ø§Ù‡ Ø²Ø¨Ø§Ù† ØºØ²Ø§Ù„</h2>
                <p>Ø³ÛŒØ³ØªÙ… ÛŒÚ©Ù¾Ø§Ø±Ú†Ù‡ Ù…Ø¯ÛŒØ±ÛŒØª Ù…Ø§Ù„ÛŒ</p>
            </div>
            <div class="info">
                <p><strong>ØªØ§Ø±ÛŒØ® ØµØ¯ÙˆØ±:</strong> ${toEnDigits(date)}</p>
            </div>
        </div>
        <div class="title">Ø±Ø³ÛŒØ¯ Ù¾Ø±Ø¯Ø§Ø®Øª Ùˆ ØµÙˆØ±ØªØ­Ø³Ø§Ø¨</div>
        <div class="details">
            <div><strong>Ù†Ø§Ù… Ø²Ø¨Ø§Ù†â€ŒØ¢Ù…ÙˆØ²:</strong> ${student.firstName} ${student.lastName}</div>
            <div><strong>Ø´Ù…Ø§Ø±Ù‡ ØªÙ…Ø§Ø³:</strong> ${toEnDigits(student.phone || '---')}</div>
            <div><strong>ØªØ±Ù… ØªØ­ØµÛŒÙ„ÛŒ:</strong> ${termName}</div>
            <div><strong>Ø³Ø·Ø­ Ùˆ Ù†ÙˆØ¹ Ú©Ù„Ø§Ø³:</strong> ${student.level} (${student.classType || 'Ù†Ø§Ù…Ø´Ø®Øµ'})</div>
        </div>

        <table>
            <thead>
                <tr>
                    <th style="width: 8%; text-align: center;">Ø±Ø¯ÛŒÙ</th>
                    <th style="text-align: right; padding-right: 15px;">Ø´Ø±Ø­ Ø®Ø¯Ù…Ø§Øª / Ø§Ù‚Ù„Ø§Ù… ØµÙˆØ±ØªØ­Ø³Ø§Ø¨</th>
                    <th style="width: 32%; text-align: center;">Ù…Ø¨Ù„Øº (ØªÙˆÙ…Ø§Ù†)</th>
                </tr>
            </thead>
            <tbody>
                ${itemRows.join('')}
                <tr style="background-color: #f9fafb; border-top: 2px solid #333;">
                    <td colspan="2" class="summary-title">Ø¬Ù…Ø¹ Ú©Ù„ Ø´Ù‡Ø±ÛŒÙ‡ Ùˆ Ø®Ø¯Ù…Ø§Øª (ÙØ§Ú©ØªÙˆØ±):</td>
                    <td class="summary-val" style="font-size: 15px; color: #111827;">${formatEnNum(student.totalPayable)} ØªÙˆÙ…Ø§Ù†</td>
                </tr>
                <tr style="background-color: #f0fdf4;">
                    <td colspan="2" class="summary-title" style="color: #15803d;">Ù…Ø¨Ù„Øº Ø¯Ø±ÛŒØ§ÙØªÛŒ Ø§ÛŒÙ† Ø±Ø³ÛŒØ¯:</td>
                    <td class="summary-val" style="color: #15803d; font-size: 15px;">${formatEnNum(amount)} ØªÙˆÙ…Ø§Ù†</td>
                </tr>
                <tr style="background-color: #fef2f2;">
                    <td colspan="2" class="summary-title" style="color: #b91c1c;">Ù…Ø§Ù†Ø¯Ù‡ Ø¨Ø¯Ù‡ÛŒ ÙØ¹Ù„ÛŒ:</td>
                    <td class="summary-val" style="color: #b91c1c; font-size: 15px;">${formatEnNum(student.debt)} ØªÙˆÙ…Ø§Ù†</td>
                </tr>
            </tbody>
        </table>

        <div class="footer">
            <p class="footer-note">Ø§ÛŒÙ† Ø±Ø³ÛŒØ¯ Ø¨Ø¯ÙˆÙ† Ù…Ù‡Ø± Ùˆ Ø§Ù…Ø¶Ø§ÛŒ Ù…Ø¯ÛŒØ±ÛŒØª Ø¢Ù…ÙˆØ²Ø´Ú¯Ø§Ù‡ ÙØ§Ù‚Ø¯ Ø§Ø¹ØªØ¨Ø§Ø± Ù‚Ø§Ù†ÙˆÙ†ÛŒ Ø§Ø³Øª.</p>
            <div class="signature">
                <p style="margin: 0 0 40px 0; font-weight: bold; font-size: 14px;">Ù…Ù‡Ø± Ùˆ Ø§Ù…Ø¶Ø§ÛŒ Ø¢Ù…ÙˆØ²Ø´Ú¯Ø§Ù‡</p>
                <p style="margin: 0; color: #999;">................................</p>
            </div>
        </div>
    </div>
    <script>
        window.onload = () => { setTimeout(() => { window.print(); window.close(); }, 300); }
    </script>
</body>
</html>`;
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  };

  const handleIssueNewReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiptModalStudent || !receiptAmount) return;
    
    const date = new Date().toLocaleDateString('fa-IR');
    const amount = Number(receiptAmount);
    
    try {
      await fetch('/api/receipts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: receiptModalStudent.id,
          termId: receiptModalStudent.termId,
          paidAmount: amount,
          date: date
        })
      });

      const newPaid = (Number(receiptModalStudent.amountPaid) || 0) + amount;
      const newDebt = Math.max(0, (Number(receiptModalStudent.totalPayable) || 0) - newPaid);
      const updatedStudentForPrint = {
        ...receiptModalStudent,
        amountPaid: newPaid,
        debt: newDebt,
        status: newDebt === 0 ? ('ØªØ³ÙˆÛŒÙ‡' as const) : ('Ø¨Ø¯Ù‡Ú©Ø§Ø±' as const)
      };
      
      printHTML(updatedStudentForPrint, amount, date);
      
      const refreshRes = await fetch(`/api/receipts/${receiptModalStudent.id}`);
      const data = await refreshRes.json();
      setStudentReceipts(data);
      setReceiptAmount('');

      if (typeof onUpdateStudent === 'function') {
        await onUpdateStudent(receiptModalStudent.id, newPaid);
      }
      setReceiptModalStudent(updatedStudentForPrint);
      
    } catch (err) {
      console.error(err);
      alert('Ø®Ø·Ø§ Ø¯Ø± ØµØ¯ÙˆØ± Ø±Ø³ÛŒØ¯');
    }
  };

  return (
    <div className="space-y-6 lg:space-y-8" dir="rtl">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-end gap-6">
        <div>
          <h2 className="text-2xl lg:text-3xl font-serif font-medium text-white">Ù…Ø¯ÛŒØ±ÛŒØª Ø«Ø¨Øªâ€ŒÙ†Ø§Ù…</h2>
          <p className="text-slate-400 mt-1 text-sm lg:text-base">ØªØ¹Ø±ÛŒÙ ØªØ±Ù…â€ŒÙ‡Ø§ØŒ Ø³Ø·ÙˆØ­ Ø¢Ù…ÙˆØ²Ø´ÛŒ Ùˆ Ù¾Ø±ÙˆÙ†Ø¯Ù‡ Ø¯Ø§Ù†Ø´Ø¬ÙˆÛŒØ§Ù†</p>
        </div>
        <div className="flex flex-wrap gap-2 lg:gap-3">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImportExcel} 
            accept=".xlsx, .xls, .csv" 
            className="hidden" 
          />
          <input 
            type="file" 
            ref={levelFileInputRef} 
            onChange={handleImportLevelExcel} 
            accept=".xlsx, .xls, .csv" 
            className="hidden" 
          />
          <button 
            onClick={() => setView(view === 'students' ? 'levels' : 'students')} 
            className={`flex-1 lg:flex-none px-5 py-2.5 rounded-full font-medium flex items-center justify-center gap-2 transition-all text-sm cursor-pointer ${view === 'levels' ? 'bg-gradient-to-r from-red-600 to-rose-700 text-white font-bold shadow-[0_0_15px_rgba(220,38,38,0.3)]' : 'bg-[#12121C] border border-red-900/40 text-slate-200 hover:bg-red-950/40 hover:border-red-500/40'}`}
          >
            {view === 'levels' ? <Users size={16} /> : <BookOpen size={16} />}
            {view === 'levels' ? 'Ø¯Ø§Ù†Ø´Ø¬ÙˆÛŒØ§Ù†' : 'Ø³Ø·ÙˆØ­ Ùˆ Ø´Ù‡Ø±ÛŒÙ‡'}
          </button>
          
          {view === 'students' ? (
            <>
              <button 
                onClick={handleDownloadTemplate} 
                className="flex-1 lg:flex-none bg-[#12121C] border border-red-900/40 text-slate-200 px-4 py-2.5 rounded-full font-medium flex items-center justify-center gap-2 hover:bg-red-950/40 hover:border-red-500/40 transition-all text-sm cursor-pointer"
                title="Ø¯Ø§Ù†Ù„ÙˆØ¯ ÙØ§ÛŒÙ„ Ø§Ú©Ø³Ù„ Ù†Ù…ÙˆÙ†Ù‡"
              >
                <Download size={16} className="text-sky-400" /> Ù†Ù…ÙˆÙ†Ù‡
              </button>
              <button 
                onClick={() => fileInputRef.current?.click()} 
                className="flex-1 lg:flex-none bg-[#12121C] border border-red-900/40 text-slate-200 px-4 py-2.5 rounded-full font-medium flex items-center justify-center gap-2 hover:bg-red-950/40 hover:border-red-500/40 transition-all text-sm cursor-pointer"
              >
                <FileSpreadsheet size={16} className="text-emerald-400" /> Ø¢Ù¾Ù„ÙˆØ¯ Ø§Ú©Ø³Ù„
              </button>
              <div className="relative flex-1 lg:flex-none">
                <button 
                  onClick={() => setShowTermMenu(!showTermMenu)} 
                  className="w-full bg-[#12121C] border border-red-900/40 text-slate-200 px-5 py-2.5 rounded-full font-medium flex items-center justify-center gap-2 hover:bg-red-950/40 hover:border-red-500/40 transition-all text-sm min-w-[130px] cursor-pointer"
                >
                  <ChevronDown size={16} className={`transition-transform ${showTermMenu ? 'rotate-180' : ''}`} />
                  {selectedTerm ? selectedTerm.name : 'Ø§Ù†ØªØ®Ø§Ø¨ ØªØ±Ù…'}
                </button>
                
                <AnimatePresence>
                  {showTermMenu && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full right-0 mt-2 w-full sm:w-60 bg-[#0F0F18]/95 backdrop-blur-2xl border border-red-500/30 rounded-2xl shadow-[0_0_30px_rgba(220,38,38,0.3)] z-50 overflow-hidden"
                    >
                      <div className="max-h-60 overflow-y-auto py-2 custom-scrollbar">
                        {terms.map((term: Term) => (
                          <div key={term.id} className="group/item flex items-center justify-between hover:bg-red-950/40 transition-colors">
                            <button 
                              onClick={() => {
                                setSelectedTermId(term.id);
                                setShowTermMenu(false);
                              }}
                              className={`flex-1 text-right px-4 py-2.5 text-sm flex items-center justify-between ${selectedTermId === term.id ? 'text-white font-bold' : 'text-slate-400'}`}
                            >
                              <span>{term.name}</span>
                              {selectedTermId === term.id && <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />}
                            </button>
                            <div className="flex items-center gap-1 px-2 opacity-0 group-hover/item:opacity-100 transition-opacity">
                              <button 
                                onClick={(e) => { e.stopPropagation(); setEditingTerm(term); setShowTermMenu(false); }} 
                                className="p-1 hover:bg-red-900/40 rounded-lg text-sky-400"
                                title="ÙˆÛŒØ±Ø§ÛŒØ´"
                              >
                                <Pencil size={12} />
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); onDeleteTerm(term.id); }} 
                                className="p-1 hover:bg-red-900/40 rounded-lg text-rose-400"
                                title="Ø­Ø°Ù"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <button 
                        onClick={() => {
                          setShowAddTerm(true);
                          setShowTermMenu(false);
                        }}
                        className="w-full text-right px-4 py-3 text-xs bg-[#0A0A10] text-red-300 font-medium border-t border-red-900/30 hover:bg-red-950/60 transition-all flex items-center gap-2 cursor-pointer"
                      >
                        <PlusCircle size={14} />
                        <span>Ø§ÙØ²ÙˆØ¯Ù† ØªØ±Ù… Ø¬Ø¯ÛŒØ¯...</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <button onClick={() => setShowAddStudent(true)} className="flex-1 lg:flex-none bg-gradient-to-r from-red-600 to-rose-700 text-white hover:brightness-110 px-5 py-2.5 rounded-full font-bold flex items-center justify-center gap-2 transition-all text-sm cursor-pointer shadow-[0_0_20px_rgba(220,38,38,0.4)]">
                <Plus size={16} /> Ø¯Ø§Ù†Ø´Ø¬Ùˆ
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={handleDownloadLevelTemplate} 
                className="flex-1 lg:flex-none bg-[#12121C] border border-red-900/40 text-slate-200 px-4 py-2.5 rounded-full font-medium flex items-center justify-center gap-2 hover:bg-red-950/40 hover:border-red-500/40 transition-all text-sm cursor-pointer"
                title="Ø¯Ø§Ù†Ù„ÙˆØ¯ ÙØ§ÛŒÙ„ Ø§Ú©Ø³Ù„ Ù†Ù…ÙˆÙ†Ù‡ Ø³Ø·ÙˆØ­"
              >
                <Download size={16} className="text-sky-400" /> Ù†Ù…ÙˆÙ†Ù‡ Ø§Ú©Ø³Ù„
              </button>
              <button 
                onClick={() => levelFileInputRef.current?.click()} 
                className="flex-1 lg:flex-none bg-[#12121C] border border-red-900/40 text-slate-200 px-4 py-2.5 rounded-full font-medium flex items-center justify-center gap-2 hover:bg-red-950/40 hover:border-red-500/40 transition-all text-sm cursor-pointer"
              >
                <FileSpreadsheet size={16} className="text-emerald-400" /> Ø¢Ù¾Ù„ÙˆØ¯ Ø§Ú©Ø³Ù„
              </button>
              <button onClick={() => setShowAddLevel(true)} className="w-full lg:w-auto bg-gradient-to-r from-red-600 to-rose-700 text-white hover:brightness-110 px-6 py-2.5 rounded-full font-bold flex items-center justify-center gap-2 transition-all text-sm cursor-pointer shadow-[0_0_20px_rgba(220,38,38,0.4)]">
                <Plus size={16} /> Ø§ÙØ²ÙˆØ¯Ù† Ø³Ø·Ø­ Ø¢Ù…ÙˆØ²Ø´ÛŒ
              </button>
            </>
          )}
        </div>
      </div>

      {view === 'levels' ? (
        levels.length === 0 ? (
          <div className="bg-[#0F0F18]/90 backdrop-blur-xl p-12 rounded-3xl border border-red-900/30 text-center space-y-4 shadow-[0_0_30px_rgba(220,38,38,0.1)]">
            <BookOpen size={48} className="mx-auto text-red-500/50" />
            <h3 className="text-xl font-serif text-white font-medium">Ù‡ÛŒÚ† Ø³Ø·Ø­ Ø¢Ù…ÙˆØ²Ø´ÛŒ ØªØ¹Ø±ÛŒÙ Ù†Ø´Ø¯Ù‡ Ø§Ø³Øª</h3>
            <p className="text-sm text-slate-400 max-w-md mx-auto">Ù…ÛŒâ€ŒØªÙˆØ§Ù†ÛŒØ¯ Ø¨Ù‡ Ø±Ø§Ø­ØªÛŒ Ø³Ø·ÙˆØ­ Ø¢Ù…ÙˆØ²Ø´ÛŒ Ø±Ø§ Ø¨Ù‡â€ŒØµÙˆØ±Øª Ú¯Ø±ÙˆÙ‡ÛŒ Ø§Ø² Ø·Ø±ÛŒÙ‚ ÙØ§ÛŒÙ„ Ø§Ú©Ø³Ù„ ÙˆØ§Ø±Ø¯ Ú©Ù†ÛŒØ¯ ÛŒØ§ Ø¨Ù‡ ØµÙˆØ±Øª Ø¯Ø³ØªÛŒ Ø«Ø¨Øª Ù†Ù…Ø§ÛŒÛŒØ¯.</p>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <button 
                onClick={handleDownloadLevelTemplate} 
                className="bg-[#12121C] border border-red-900/40 hover:border-red-500/50 text-slate-200 px-4 py-2.5 rounded-full text-sm font-medium flex items-center gap-2 transition-all cursor-pointer"
              >
                <Download size={16} className="text-sky-400" /> Ø¯Ø§Ù†Ù„ÙˆØ¯ Ù†Ù…ÙˆÙ†Ù‡
              </button>
              <button 
                onClick={() => levelFileInputRef.current?.click()} 
                className="bg-[#12121C] border border-red-900/40 hover:border-red-500/50 text-slate-200 px-5 py-2.5 rounded-full text-sm font-medium flex items-center gap-2 transition-all cursor-pointer"
              >
                <FileSpreadsheet size={16} className="text-emerald-400" /> ÙˆØ§Ø±Ø¯ Ú©Ø±Ø¯Ù† Ø§Ø² ÙØ§ÛŒÙ„ Ø§Ú©Ø³Ù„
              </button>
              <button 
                onClick={() => setShowAddLevel(true)} 
                className="bg-gradient-to-r from-red-600 to-rose-700 text-white px-5 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 cursor-pointer hover:brightness-110 transition-all shadow-[0_0_15px_rgba(220,38,38,0.3)]"
              >
                <Plus size={16} /> Ø§ÙØ²ÙˆØ¯Ù† Ø¯Ø³ØªÛŒ Ø³Ø·Ø­
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            <AnimatePresence>
              {levels.map((level: Level) => (
                <motion.div 
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={level.id || (level as any)._id} 
                  className="bg-[#0F0F18]/90 backdrop-blur-xl p-6 rounded-3xl relative group border border-red-900/30 shadow-[0_0_30px_rgba(220,38,38,0.1)] hover:border-red-500/40 hover:shadow-[0_0_40px_rgba(220,38,38,0.2)] transition-all"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-11 h-11 rounded-2xl bg-red-950/50 border border-red-500/30 text-red-400 flex items-center justify-center">
                      <BookOpen size={20} />
                    </div>
                    <button 
                      onClick={() => onDeleteLevel((level as any)._id || level.id)}
                      className="p-2 lg:opacity-0 lg:group-hover:opacity-100 hover:bg-rose-950/60 text-rose-400 rounded-xl transition-all cursor-pointer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <h3 className="text-xl font-serif font-medium text-white">{level.name}</h3>
                  <p className="text-2xl font-bold mt-2 text-red-400 font-mono">{level.fee.toLocaleString()} <span className="text-[10px] font-normal text-slate-400">ØªÙˆÙ…Ø§Ù†</span></p>
                  <p className="text-[10px] text-slate-400 mt-6 border-t border-red-900/30 pt-4">Ø´Ù‡Ø±ÛŒÙ‡ Ù…ØµÙˆØ¨ Ø§ÛŒÙ† Ø³Ø·Ø­ Ø¯Ø± Ø¢Ú©Ø§Ø¯Ù…ÛŒ ØºØ²Ø§Ù„</p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )
      ) : (
        <div className="space-y-8">
          <div className="bg-[#0F0F18]/90 backdrop-blur-xl p-4 lg:p-8 rounded-3xl overflow-hidden border border-red-900/30 shadow-[0_0_30px_rgba(220,38,38,0.1)]">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h4 className="text-xl font-serif font-medium text-white">Ù„ÛŒØ³Øª Ù¾Ø±ÙˆÙ†Ø¯Ù‡ Ø¯Ø§Ù†Ø´Ø¬ÙˆÛŒØ§Ù†</h4>
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 font-medium uppercase">ÙˆØ¶Ø¹ÛŒØª:</span>
                  <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="bg-[#12121C] border border-red-900/40 rounded-full py-1.5 px-3 text-xs outline-none focus:border-red-500 transition-colors text-slate-200 cursor-pointer"
                  >
                    <option value="all">Ù‡Ù…Ù‡ ÙˆØ¶Ø¹ÛŒØªâ€ŒÙ‡Ø§</option>
                    <option value="paid">ØªØ³ÙˆÛŒÙ‡ Ø´Ø¯Ù‡</option>
                    <option value="unpaid">Ø¨Ø¯Ù‡Ú©Ø§Ø±</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 font-medium uppercase">Ù†ÙˆØ¹ Ú©Ù„Ø§Ø³:</span>
                  <select 
                    value={classTypeFilter}
                    onChange={(e) => setClassTypeFilter(e.target.value as any)}
                    className="bg-[#12121C] border border-red-900/40 rounded-full py-1.5 px-3 text-xs outline-none focus:border-red-500 transition-colors text-slate-200 cursor-pointer"
                  >
                    <option value="all">Ù‡Ù…Ù‡ Ú©Ù„Ø§Ø³â€ŒÙ‡Ø§</option>
                    <option value="Ø­Ø¶ÙˆØ±ÛŒ">Ø­Ø¶ÙˆØ±ÛŒ</option>
                    <option value="Ø¢Ù†Ù„Ø§ÛŒÙ†">Ø¢Ù†Ù„Ø§ÛŒÙ†</option>
                    <option value="Ù…Ù†ØªÙˆØ±ÛŒÙ†Ú¯">Ù…Ù†ØªÙˆØ±ÛŒÙ†Ú¯</option>
                    <option value="Ø¢Ù„Ù…Ø§Ù†ÛŒ">Ø¢Ù„Ù…Ø§Ù†ÛŒ</option>
                    <option value="Ø®ØµÙˆØµÛŒ">Ø®ØµÙˆØµÛŒ</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto -mx-4 px-4 lg:mx-0 lg:px-0">
              <table className="w-full text-right border-collapse min-w-[700px]">
                <thead>
                  <tr className="text-slate-400 font-serif text-xs uppercase border-b border-red-900/30">
                    <th className="py-3 pr-4 text-right">Ù†Ø§Ù… Ø¯Ø§Ù†Ø´Ø¬Ùˆ</th>
                    <th className="py-3 text-right">Ø³Ø·Ø­</th>
                    <th className="py-3 text-center">Ù†ÙˆØ¹ Ú©Ù„Ø§Ø³</th>
                    <th className="py-3 text-center">Ø´Ù‡Ø±ÛŒÙ‡ Ú©Ù„</th>
                    <th className="py-3 text-center">Ù¾Ø±Ø¯Ø§Ø®Øª Ø´Ø¯Ù‡</th>
                    <th className="py-3 text-center">Ù…Ø§Ù†Ø¯Ù‡ Ø¨Ø¯Ù‡ÛŒ</th>
                    <th className="py-3 text-center">ÙˆØ¶Ø¹ÛŒØª</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-red-900/20">
                  {students
                    .filter((s: Student) => !selectedTermId || String(s.termId) === String(selectedTermId))
                    .filter((s: Student) => statusFilter === 'all' || s.status === statusFilter)
                    .filter((s: Student) => classTypeFilter === 'all' || s.classType === classTypeFilter)
                    .reverse()
                    .map((s: Student) => (
                    <tr key={s.id} className="hover:bg-red-950/20 transition-colors group">
                      <td className="py-4 pr-4 font-medium text-white">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm">{s.firstName} {s.lastName}</span>
                          
                          {s.hasDiscount && s.discountPercent ? (
                            <span className="bg-rose-950/60 text-rose-300 border border-rose-500/30 text-[10px] px-2 py-0.5 rounded-full font-medium" title={`ØªØ®ÙÛŒÙ: ${s.discountPercent}% (${(s.discountAmount || 0).toLocaleString()} ØªÙˆÙ…Ø§Ù†)`}>
                              ðŸ·ï¸ ØªØ®ÙÛŒÙ: {s.discountPercent}%
                            </span>
                          ) : null}

                          {s.hasBook ? (
                            <span className="bg-amber-950/60 text-amber-300 border border-amber-500/30 text-[10px] px-2 py-0.5 rounded-full font-medium" title={s.bookName ? `Ú©ØªØ§Ø¨: ${s.bookName}` : 'Ú©ØªØ§Ø¨'}>
                              Ú©ØªØ§Ø¨: {s.bookName || 'Ú©ØªØ§Ø¨'}
                            </span>
                          ) : null}
                          {s.hasInterview ? (
                            <span className="bg-sky-950/60 text-sky-300 border border-sky-500/30 text-[10px] px-2 py-0.5 rounded-full font-medium" title="Ù…ØµØ§Ø­Ø¨Ù‡ (Û²ÛµÛ°,Û°Û°Û° ØªÙˆÙ…Ø§Ù†)">
                              Interview
                            </span>
                          ) : null}
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenReceipts(s);
                            }}
                            className="p-1.5 hover:bg-red-900/40 rounded-lg text-slate-400 hover:text-sky-400 transition-all cursor-pointer"
                            title="Ù…Ø¯ÛŒØ±ÛŒØª Ùˆ ØµØ¯ÙˆØ± Ø±Ø³ÛŒØ¯"
                          >
                            <Printer size={14} />
                          </button>

                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setVisiblePhoneId(visiblePhoneId === s.id ? null : s.id);
                            }}
                            className="p-1.5 hover:bg-red-900/40 rounded-lg text-slate-400 hover:text-white transition-all relative cursor-pointer"
                          >
                            <Phone size={14} />
                            <AnimatePresence>
                              {visiblePhoneId === s.id && (
                                <motion.div 
                                  initial={{ opacity: 0, scale: 0.9, x: 20 }}
                                  animate={{ opacity: 1, scale: 1, x: 0 }}
                                  exit={{ opacity: 0, scale: 0.9, x: 20 }}
                                  className="absolute left-full mr-2 top-0 bg-[#12121C] text-white border border-red-500/30 px-3 py-1 rounded-xl text-xs whitespace-nowrap shadow-xl z-40 font-mono"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {s.phone || 'Ø«Ø¨Øª Ù†Ø´Ø¯Ù‡'}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </button>
                          {s.receiptUrl && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedReceipt(s.receiptUrl || null);
                              }}
                              className="p-1.5 hover:bg-red-900/40 rounded-lg text-slate-400 hover:text-emerald-400 transition-all cursor-pointer"
                              title="Ù…Ø´Ø§Ù‡Ø¯Ù‡ Ø±Ø³ÛŒØ¯"
                            >
                              <Receipt size={14} />
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingStudent(s);
                            }}
                            className="p-1.5 hover:bg-red-900/40 rounded-lg text-slate-400 hover:text-sky-400 transition-all cursor-pointer"
                            title="ÙˆÛŒØ±Ø§ÛŒØ´ Ù¾Ø±Ø¯Ø§Ø®Øª"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteStudent(s.id);
                            }}
                            className="p-1.5 hover:bg-red-900/40 rounded-lg text-slate-400 hover:text-rose-400 transition-all cursor-pointer"
                            title="Ø­Ø°Ù Ø¯Ø§Ù†Ø´Ø¬Ùˆ"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                      <td className="py-4 text-slate-400 text-xs">{s.level}</td>
                      <td className="py-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-medium border ${
                          s.classType === 'Ø­Ø¶ÙˆØ±ÛŒ' ? 'bg-sky-950/50 text-sky-400 border-sky-500/30' : 
                          s.classType === 'Ø¢Ù†Ù„Ø§ÛŒÙ†' ? 'bg-purple-950/50 text-purple-400 border-purple-500/30' : 
                          s.classType === 'Ù…Ù†ØªÙˆØ±ÛŒÙ†Ú¯' ? 'bg-amber-950/50 text-amber-400 border-amber-500/30' : 
                          s.classType === 'Ø®ØµÙˆØµÛŒ' ? 'bg-emerald-950/50 text-emerald-400 border-emerald-500/30' : 
                          'bg-rose-950/50 text-rose-400 border-rose-500/30'
                        }`}>
                          {s.classType || 'Ù†Ø§Ù…Ø´Ø®Øµ'}
                        </span>
                      </td>
                      <td className="py-4 text-center font-mono text-xs text-slate-200">{s.totalPayable.toLocaleString()}</td>
                      <td className="py-4 text-center font-mono text-xs text-emerald-400 font-medium">{s.amountPaid.toLocaleString()}</td>
                      <td className="py-4 text-center font-mono text-xs text-rose-400 font-medium">{s.debt.toLocaleString()}</td>
                      <td className="py-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-medium border ${s.status === 'paid' ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/40' : 'bg-rose-950/60 text-rose-400 border-rose-500/40'}`}>
                          {s.status === 'paid' ? 'ØªØ³ÙˆÛŒÙ‡' : 'Ø¨Ø¯Ù‡Ú©Ø§Ø±'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {students
                .filter((s: Student) => !selectedTermId || String(s.termId) === String(selectedTermId))
                .filter((s: Student) => statusFilter === 'all' || s.status === statusFilter)
                .filter((s: Student) => classTypeFilter === 'all' || s.classType === classTypeFilter)
                .length === 0 && (
                <div className="py-12 text-center text-slate-400 italic text-sm">Ù‡ÛŒÚ† Ø¯Ø§Ù†Ø´Ø¬ÙˆÛŒÛŒ Ø¨Ø§ Ø§ÛŒÙ† ÙÛŒÙ„ØªØ±Ù‡Ø§ ÛŒØ§ÙØª Ù†Ø´Ø¯.</div>
              )}
            </div>
          </div>
        </div>
      )}

      <AnimatePresence>
        {editingStudent && (
          <EditPaymentModal
            editingStudent={editingStudent}
            onClose={() => setEditingStudent(null)}
            onUpdateStudent={onUpdateStudent}
          />
        )}
        {selectedReceipt && (
          <Modal title="Ù…Ø´Ø§Ù‡Ø¯Ù‡ Ø±Ø³ÛŒØ¯" onClose={() => setSelectedReceipt(null)}>
            <div className="flex justify-center p-4">
              <img src={selectedReceipt} alt="Receipt" className="max-w-full max-h-[60vh] rounded-xl object-contain" />
            </div>
          </Modal>
        )}
        {showAddLevel && (
          <Modal title="Ø§ÙØ²ÙˆØ¯Ù† Ø³Ø·Ø­ Ùˆ Ø´Ù‡Ø±ÛŒÙ‡" onClose={() => setShowAddLevel(false)}>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              await onAddLevel({
                name: f.get('name') as string,
                fee: Number(f.get('fee'))
              });
              setShowAddLevel(false);
            }} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-gray-500 px-1">Ù†Ø§Ù… Ø³Ø·Ø­ Ø¢Ù…ÙˆØ²Ø´ÛŒ</label>
                <input name="name" required placeholder="Pre-Intermediate 1" className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:border-red-500/50 outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-gray-500 px-1">Ù…Ø¨Ù„Øº Ø´Ù‡Ø±ÛŒÙ‡ Ù¾Ø§ÛŒÙ‡ (ØªÙˆÙ…Ø§Ù†)</label>
                <input name="fee" type="number" required placeholder="Û±,ÛµÛ°Û°,Û°Û°Û°" className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:border-red-500/50 outline-none" />
              </div>
              <button type="submit" className="w-full bg-red-600 py-3 rounded-xl font-bold red-glow mt-2 shadow-lg">Ø°Ø®ÛŒØ±Ù‡ Ø³Ø·Ø­</button>
            </form>
          </Modal>
        )}
        {showAddTerm && (
          <Modal title="Ø§ÙØ²ÙˆØ¯Ù† ØªØ±Ù… Ø¬Ø¯ÛŒØ¯" onClose={() => setShowAddTerm(false)}>
            <form onSubmit={async (e) => {
              e.preventDefault();
              await onAddTerm((e.currentTarget.elements.namedItem('name') as HTMLInputElement).value);
              setShowAddTerm(false);
            }} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-[#8B7E74] px-1 font-medium">Ù†Ø§Ù… ØªØ±Ù…</label>
                <input name="name" required placeholder="Ø¨Ù‡Ø§Ø± Û±Û´Û°Û³" className="w-full bg-white border border-[#E5E1DA] text-[#2D2424] rounded-xl py-3 px-4 focus:border-[#2D2424] outline-none text-sm" />
              </div>
              <button type="submit" className="w-full bg-[#2D2424] text-[#FCF9F6] py-3.5 rounded-full font-medium hover:bg-[#4A3D3D] mt-2 shadow-sm text-xs uppercase tracking-wider cursor-pointer">Ø«Ø¨Øª ØªØ±Ù…</button>
            </form>
          </Modal>
        )}
        {editingTerm && (
          <Modal title="ÙˆÛŒØ±Ø§ÛŒØ´ ØªØ±Ù…" onClose={() => setEditingTerm(null)}>
            <form onSubmit={async (e) => {
              e.preventDefault();
              await onUpdateTerm(editingTerm.id, (e.currentTarget.elements.namedItem('name') as HTMLInputElement).value);
              setEditingTerm(null);
            }} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-[#8B7E74] px-1 font-medium">Ù†Ø§Ù… ØªØ±Ù…</label>
                <input name="name" required defaultValue={editingTerm.name} placeholder="Ø¨Ù‡Ø§Ø± Û±Û´Û°Û³" className="w-full bg-white border border-[#E5E1DA] text-[#2D2424] rounded-xl py-3 px-4 focus:border-[#2D2424] outline-none text-sm" />
              </div>
              <button type="submit" className="w-full bg-[#2D2424] text-[#FCF9F6] py-3.5 rounded-full font-medium hover:bg-[#4A3D3D] mt-2 shadow-sm text-xs uppercase tracking-wider cursor-pointer">Ø¨Ø±ÙˆØ²Ø±Ø³Ø§Ù†ÛŒ ØªØ±Ù…</button>
            </form>
          </Modal>
        )}
        {showAddStudent && (
          <Modal title="Ø«Ø¨Øªâ€ŒÙ†Ø§Ù… Ø¯Ø§Ù†Ø´Ø¬Ùˆ" onClose={() => {
            setShowAddStudent(false);
            setAddHasBook(false);
            setAddBookName('');
            setAddBookPrice('');
            setAddHasInterview(false);
            setAddHasDiscount(false);
            setAddDiscountPercent('');
          }}>
            <form onSubmit={async (e) => {
                  e.preventDefault();
                  if (isSubmitting) return;
                  
                  const f = new FormData(e.currentTarget);
                  const tid = f.get('tid') as string;
                  const lv = f.get('lv') as string;

                  if (!tid) {
                    alert('Ù„Ø·ÙØ§ Ø§Ø¨ØªØ¯Ø§ ÛŒÚ© ØªØ±Ù… Ø§Ù†ØªØ®Ø§Ø¨ Ú©Ù†ÛŒØ¯. Ø§Ú¯Ø± ØªØ±Ù…ÛŒ ÙˆØ¬ÙˆØ¯ Ù†Ø¯Ø§Ø±Ø¯ØŒ Ø§Ø¨ØªØ¯Ø§ Ø¢Ù† Ø±Ø§ Ø¨Ø³Ø§Ø²ÛŒØ¯.');
                    return;
                  }
                  if (!lv) {
                    alert('Ù„Ø·ÙØ§ ÛŒÚ© Ø³Ø·Ø­ Ø§Ù†ØªØ®Ø§Ø¨ Ú©Ù†ÛŒØ¯.');
                    return;
                  }

                  setIsSubmitting(true);
                  try {
                    let receiptUrl = '';
                    const file = f.get('receipt') as File;
                    if (file && file.size > 0) {
                      receiptUrl = await new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onloadend = () => resolve(reader.result as string);
                        reader.onerror = reject;
                        reader.readAsDataURL(file);
                      });
                    }

                    const baseFee = selectedLevelInfo?.fee || 0;
                    const discountPctNum = addHasDiscount ? (Number(addDiscountPercent) || 0) : 0;
                    const discountAmt = Math.round(baseFee * (discountPctNum / 100));

                    await onAddStudent({
                      firstName: f.get('f') as string,
                      lastName: f.get('l') as string,
                      level: lv,
                      classType: f.get('ct') as any,
                      phone: f.get('ph') as string,
                      totalPayable: Number(f.get('t')),
                      amountPaid: Number(f.get('p')),
                      termId: tid,
                      receiptUrl,
                      hasBook: addHasBook,
                      bookName: addHasBook ? addBookName : '',
                      bookPrice: addHasBook ? (Number(addBookPrice) || 0) : 0,
                      hasInterview: addHasInterview,
                      hasDiscount: addHasDiscount && discountPctNum > 0,
                      discountPercent: addHasDiscount ? discountPctNum : 0,
                      discountAmount: addHasDiscount ? discountAmt : 0
                    });
                    setShowAddStudent(false);
                    setAddHasBook(false);
                    setAddBookName('');
                    setAddBookPrice('');
                    setAddHasInterview(false);
                    setAddHasDiscount(false);
                    setAddDiscountPercent('');
                  } catch (err: any) {
                    console.error('Registration Error:', err);
                    alert('Ø®Ø·Ø§ Ø¯Ø± Ø«Ø¨Øª Ø¯Ø§Ù†Ø´Ø¬Ùˆ: ' + (err.message || 'Ø®Ø·Ø§ÛŒ Ù†Ø§Ù…Ø´Ø®Øµ'));
                  } finally {
                    setIsSubmitting(false);
                  }
                }} className="space-y-4 max-h-[60vh] overflow-y-auto px-1 custom-scrollbar">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 px-1 font-medium">Ù†Ø§Ù…</label>
                      <input name="f" required placeholder="Ø¹Ù„ÛŒ" className="w-full bg-[#12121C] border border-red-900/40 text-white rounded-xl py-2.5 px-3 focus:border-red-500/50 outline-none text-sm" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 px-1 font-medium">Ù†Ø§Ù… Ø®Ø§Ù†ÙˆØ§Ø¯Ú¯ÛŒ</label>
                      <input name="l" required placeholder="Ù…Ø­Ù…Ø¯ÛŒ" className="w-full bg-[#12121C] border border-red-900/40 text-white rounded-xl py-2.5 px-3 focus:border-red-500/50 outline-none text-sm" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 px-1 font-medium">Ø´Ù…Ø§Ø±Ù‡ ØªÙ…Ø§Ø³ (Ø§Ø®ØªÛŒØ§Ø±ÛŒ)</label>
                    <input name="ph" placeholder="Û°Û¹Û±Û²..." className="w-full bg-[#12121C] border border-red-900/40 text-white rounded-xl py-2.5 px-3 focus:border-red-500/50 outline-none text-sm text-left font-mono" dir="ltr" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 px-1 font-medium">Ù†ÙˆØ¹ Ú©Ù„Ø§Ø³</label>
                    <select name="ct" required className="w-full bg-[#12121C] border border-red-900/40 text-white rounded-xl py-2.5 px-3 focus:border-red-500/50 outline-none text-sm cursor-pointer">
                      <option value="Ø­Ø¶ÙˆØ±ÛŒ">Ø­Ø¶ÙˆØ±ÛŒ</option>
                      <option value="Ø¢Ù†Ù„Ø§ÛŒÙ†">Ø¢Ù†Ù„Ø§ÛŒÙ†</option>
                      <option value="Ù…Ù†ØªÙˆØ±ÛŒÙ†Ú¯">Ù…Ù†ØªÙˆØ±ÛŒÙ†Ú¯</option>
                      <option value="Ø¢Ù„Ù…Ø§Ù†ÛŒ">Ø¢Ù„Ù…Ø§Ù†ÛŒ</option>
                      <option value="Ø®ØµÙˆØµÛŒ">Ø®ØµÙˆØµÛŒ</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 px-1 font-medium">Ø§Ù†ØªØ®Ø§Ø¨ ØªØ±Ù…</label>
                      <select name="tid" required defaultValue={selectedTermId || ''} className="w-full bg-[#12121C] border border-red-900/40 text-white rounded-xl py-2.5 px-3 focus:border-red-500/50 outline-none text-sm cursor-pointer">
                        <option value="" disabled className="text-slate-500">Ø§Ù†ØªØ®Ø§Ø¨ ØªØ±Ù…...</option>
                        {terms.map((t: Term, idx: number) => <option key={`add-std-term-${t.id || idx}`} value={t.id}>{t.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 px-1 font-medium">Ø§Ù†ØªØ®Ø§Ø¨ Ø³Ø·Ø­</label>
                      <select 
                        name="lv" 
                        required 
                        onChange={(e) => {
                          const level = levels.find((l: Level) => l.name === e.target.value);
                          if (level) setSelectedLevelInfo({ name: level.name, fee: level.fee });
                        }}
                        className="w-full bg-[#12121C] border border-red-900/40 text-white rounded-xl py-2.5 px-3 focus:border-red-500/50 outline-none text-sm cursor-pointer"
                      >
                        <option value="" className="text-slate-500">Ø§Ù†ØªØ®Ø§Ø¨ Ø³Ø·Ø­...</option>
                        {levels.map((l: Level, idx: number) => <option key={`add-std-lvl-${l.id || (l as any)._id || idx}`} value={l.name}>{l.name}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Ø¨Ø®Ø´ Ø§ÙØ²ÙˆØ¯Ù‡: ØªØ®ÙÛŒÙØŒ Ú©ØªØ§Ø¨ Ùˆ Interview */}
                  <div className="bg-[#12121C]/80 border border-red-900/40 rounded-xl p-3.5 space-y-3">
                    <div className="text-xs font-bold text-slate-200 border-b border-red-900/30 pb-2">
                      Ø®Ø¯Ù…Ø§ØªØŒ ØªØ®ÙÛŒÙ Ùˆ Ø§ÙØ²ÙˆØ¯Ù‡ Ù…Ø§Ù„ÛŒ
                    </div>

                    {/* 1. ØªÛŒÚ© ØªØ®ÙÛŒÙ */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2.5 text-sm text-slate-200 font-medium cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={addHasDiscount}
                          onChange={(e) => setAddHasDiscount(e.target.checked)}
                          className="w-4 h-4 accent-red-600 rounded cursor-pointer"
                        />
                        <span>ØªØ®ÙÛŒÙ Ø±ÙˆÛŒ Ø´Ù‡Ø±ÛŒÙ‡ ØªØ±Ù…</span>
                      </label>

                      {addHasDiscount && (
                        <div className="pt-1 bg-[#0A0A10] p-3 rounded-lg border border-red-900/30 space-y-1">
                          <label className="text-[10px] text-rose-300 font-medium">Ø¯Ø±ØµØ¯ ØªØ®ÙÛŒÙ (ÙÙ‚Ø· Ø§Ø² Ø´Ù‡Ø±ÛŒÙ‡ ØªØ±Ù… Ú©Ø³Ø± Ù…ÛŒâ€ŒØ´ÙˆØ¯)</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              required={addHasDiscount}
                              value={addDiscountPercent}
                              onChange={(e) => setAddDiscountPercent(e.target.value)}
                              placeholder="Ù…Ø«Ø§Ù„: Û±Û°"
                              className="w-full bg-[#12121C] border border-red-900/40 text-white rounded-lg py-2 px-3 text-xs focus:border-red-500 outline-none font-mono"
                            />
                            <span className="text-xs font-bold text-rose-400">%</span>
                          </div>
                          {selectedLevelInfo && (
                            <div className="text-[10px] text-rose-400 mt-1">
                              Ù…Ø¨Ù„Øº ØªØ®ÙÛŒÙ: {Math.round((selectedLevelInfo.fee || 0) * ((Number(addDiscountPercent) || 0) / 100)).toLocaleString()} ØªÙˆÙ…Ø§Ù†
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* 2. ØªÛŒÚ© Ú©ØªØ§Ø¨ */}
                    <div className="space-y-2 pt-2 border-t border-red-900/30">
                      <label className="flex items-center gap-2.5 text-sm text-slate-200 font-medium cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={addHasBook}
                          onChange={(e) => setAddHasBook(e.target.checked)}
                          className="w-4 h-4 accent-red-600 rounded cursor-pointer"
                        />
                        <span>Ú©ØªØ§Ø¨</span>
                      </label>

                      {addHasBook && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 bg-[#0A0A10] p-3 rounded-lg border border-red-900/30">
                          <div className="space-y-1">
                            <label className="text-[10px] text-slate-400 font-medium">Ø§Ø³Ù… Ú©ØªØ§Ø¨</label>
                            <input
                              type="text"
                              required={addHasBook}
                              value={addBookName}
                              onChange={(e) => setAddBookName(e.target.value)}
                              placeholder="Ù…Ø«Ø§Ù„: Family & Friends"
                              className="w-full bg-[#12121C] border border-red-900/40 text-white rounded-lg py-2 px-3 text-xs focus:border-red-500 outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] text-slate-400 font-medium">Ù…Ø¨Ù„Øº Ú©ØªØ§Ø¨ (ØªÙˆÙ…Ø§Ù†)</label>
                            <input
                              type="number"
                              required={addHasBook}
                              value={addBookPrice}
                              onChange={(e) => setAddBookPrice(e.target.value)}
                              placeholder="ØªÙˆÙ…Ø§Ù†"
                              className="w-full bg-[#12121C] border border-red-900/40 text-white rounded-lg py-2 px-3 text-xs focus:border-red-500 outline-none font-mono"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 3. ØªÛŒÚ© interview */}
                    <div className="pt-2 border-t border-red-900/30 flex items-center justify-between">
                      <label className="flex items-center gap-2.5 text-sm text-slate-200 font-medium cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={addHasInterview}
                          onChange={(e) => setAddHasInterview(e.target.checked)}
                          className="w-4 h-4 accent-red-600 rounded cursor-pointer"
                        />
                        <span>interview</span>
                      </label>
                      <span className={`text-xs font-semibold ${addHasInterview ? 'text-emerald-400' : 'text-slate-400'}`}>
                        Û²ÛµÛ°,Û°Û°Û° ØªÙˆÙ…Ø§Ù† {addHasInterview ? '(Ø§ÙØ²ÙˆØ¯Ù‡ Ø´Ø¯)' : ''}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 px-1 font-medium">Ø´Ù‡Ø±ÛŒÙ‡ Ú©Ù„ (Ù…Ø­Ø§Ø³Ø¨Ù‡ Ø´Ø¯Ù‡)</label>
                      <input 
                        name="t" 
                        type="number" 
                        required 
                        placeholder="ØªÙˆÙ…Ø§Ù†" 
                        key={`payable-${selectedLevelInfo?.fee}-${addHasDiscount}-${addDiscountPercent}-${addHasBook}-${addBookPrice}-${addHasInterview}`}
                        defaultValue={(() => {
                          const base = selectedLevelInfo?.fee || 0;
                          const discPct = addHasDiscount ? (Number(addDiscountPercent) || 0) : 0;
                          const discAmt = Math.round(base * (discPct / 100));
                          const discBase = Math.max(0, base - discAmt);
                          const bookP = addHasBook ? (Number(addBookPrice) || 0) : 0;
                          const interviewP = addHasInterview ? 250000 : 0;
                          return discBase + bookP + interviewP;
                        })()}
                        className="w-full bg-[#0A0A10] border border-red-500/40 text-red-400 font-mono font-bold rounded-xl py-2.5 px-3 focus:border-red-500 outline-none text-sm" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 px-1 font-medium">Ù…Ø¨Ù„Øº Ù¾Ø±Ø¯Ø§Ø®ØªÛŒ Ø§ÙˆÙ„ÛŒÙ‡</label>
                      <input name="p" type="number" required placeholder="ØªÙˆÙ…Ø§Ù†" className="w-full bg-[#12121C] border border-red-900/40 text-white font-mono rounded-xl py-2.5 px-3 focus:border-red-500 outline-none text-sm" />
                    </div>
                  </div>
                  <div className="space-y-1 mt-2">
                    <label className="text-[10px] text-slate-400 px-1 font-medium">Ø¢Ù¾Ù„ÙˆØ¯ Ø±Ø³ÛŒØ¯ (Ø§Ø®ØªÛŒØ§Ø±ÛŒ)</label>
                    <input name="receipt" type="file" accept="image/*" className="w-full bg-[#12121C] border border-red-900/40 rounded-xl py-2 px-3 focus:border-red-500 outline-none text-xs text-slate-200 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-[10px] file:font-semibold file:bg-red-600 file:text-white hover:file:bg-red-700 transition-all cursor-pointer" />
                  </div>
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className={`w-full py-3.5 rounded-full font-bold mt-4 shadow-[0_0_20px_rgba(220,38,38,0.4)] transition-all text-xs uppercase tracking-wider cursor-pointer ${isSubmitting ? 'bg-slate-700 text-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-red-600 to-rose-700 text-white hover:brightness-110'}`}
                  >
                    {isSubmitting ? 'Ø¯Ø± Ø­Ø§Ù„ Ø«Ø¨Øª...' : 'Ø«Ø¨Øª Ù†Ù‡Ø§ÛŒÛŒ Ø¯Ø§Ù†Ø´Ø¬Ùˆ'}
                  </button>
                </form>
          </Modal>
        )}
        {receiptModalStudent && (
          <Modal title={`Ù…Ø¯ÛŒØ±ÛŒØª Ø±Ø³ÛŒØ¯Ù‡Ø§: ${receiptModalStudent.firstName} ${receiptModalStudent.lastName}`} onClose={() => { setReceiptModalStudent(null); setReceiptAmount(''); }}>
            <div className="space-y-5">

              {/* Ø®Ù„Ø§ØµÙ‡ Ù¾Ø±ÙˆÙ†Ø¯Ù‡ Ù…Ø§Ù„ÛŒ Ùˆ Ø®Ø¯Ù…Ø§Øª Ø§ÙØ²ÙˆØ¯Ù‡ */}
              <div className="bg-[#12121C] border border-red-900/40 rounded-2xl p-4 space-y-3">
                <div className="flex flex-wrap justify-between items-center text-xs text-slate-400 gap-2">
                  <span>Ø³Ø·Ø­: <strong className="text-white">{receiptModalStudent.level} ({receiptModalStudent.classType || 'Ù†Ø§Ù…Ø´Ø®Øµ'})</strong></span>
                  <span>Ø´Ù…Ø§Ø±Ù‡ ØªÙ…Ø§Ø³: <strong className="text-slate-200 font-mono">{receiptModalStudent.phone || '---'}</strong></span>
                </div>

                {/* Ø§Ù‚Ù„Ø§Ù… ÙØ§Ú©ØªÙˆØ± (ØªØ®ÙÛŒÙØŒ Ú©ØªØ§Ø¨ Ùˆ Ù…ØµØ§Ø­Ø¨Ù‡) */}
                <div className="space-y-1.5 pt-1 border-t border-red-900/30">
                  <div className="text-[11px] font-bold text-slate-200">Ø®Ø¯Ù…Ø§Øª Ùˆ Ø§ÙØ²ÙˆØ¯Ù‡ Ù…Ø§Ù„ÛŒ Ø¨Ø± Ø±ÙˆÛŒ ÙÛŒØ´:</div>
                  <div className="flex flex-wrap gap-2">
                    {receiptModalStudent.hasDiscount && receiptModalStudent.discountPercent ? (
                      <span className="bg-rose-950/60 text-rose-300 border border-rose-500/30 text-[11px] px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
                        ðŸ·ï¸ ØªØ®ÙÛŒÙ Ø´Ù‡Ø±ÛŒÙ‡: {receiptModalStudent.discountPercent}% ({(receiptModalStudent.discountAmount || 0).toLocaleString()} ØªÙˆÙ…Ø§Ù†)
                      </span>
                    ) : null}

                    {receiptModalStudent.hasBook ? (
                      <span className="bg-amber-950/60 text-amber-300 border border-amber-500/30 text-[11px] px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
                        ðŸ“– Ú©ØªØ§Ø¨: {receiptModalStudent.bookName || 'Ú©ØªØ§Ø¨'} ({Number(receiptModalStudent.bookPrice || 0).toLocaleString()} ØªÙˆÙ…Ø§Ù†)
                      </span>
                    ) : (
                      <span className="bg-[#0A0A10] text-slate-500 border border-red-900/20 text-[10px] px-2.5 py-0.5 rounded-full">
                        Ø¨Ø¯ÙˆÙ† Ú©ØªØ§Ø¨
                      </span>
                    )}

                    {receiptModalStudent.hasInterview ? (
                      <span className="bg-sky-950/60 text-sky-300 border border-sky-500/30 text-[11px] px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
                        ðŸŽ™ï¸ Ù…ØµØ§Ø­Ø¨Ù‡ / Interview (Û²ÛµÛ°,Û°Û°Û° ØªÙˆÙ…Ø§Ù†)
                      </span>
                    ) : (
                      <span className="bg-[#0A0A10] text-slate-500 border border-red-900/20 text-[10px] px-2.5 py-0.5 rounded-full">
                        Ø¨Ø¯ÙˆÙ† Ù…ØµØ§Ø­Ø¨Ù‡
                      </span>
                    )}
                  </div>
                </div>

                {/* Ø®Ù„Ø§ØµÙ‡ Ù…Ø§Ù„ÛŒ */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-red-900/30 text-center">
                  <div className="bg-[#0A0A10] p-2 rounded-xl border border-red-900/30">
                    <div className="text-[10px] text-slate-400">Ø´Ù‡Ø±ÛŒÙ‡ Ú©Ù„ (Ø¨Ø§ Ø®Ø¯Ù…Ø§Øª)</div>
                    <div className="text-xs font-bold text-white font-mono mt-0.5">{Number(receiptModalStudent.totalPayable).toLocaleString()} <span className="text-[9px] font-normal text-slate-400">ØªÙˆÙ…Ø§Ù†</span></div>
                  </div>
                  <div className="bg-[#0A0A10] p-2 rounded-xl border border-red-900/30">
                    <div className="text-[10px] text-slate-400">Ù¾Ø±Ø¯Ø§Ø®ØªÛŒ ØªØ§ Ú©Ù†ÙˆÙ†</div>
                    <div className="text-xs font-bold text-emerald-400 font-mono mt-0.5">{Number(receiptModalStudent.amountPaid).toLocaleString()} <span className="text-[9px] font-normal text-slate-400">ØªÙˆÙ…Ø§Ù†</span></div>
                  </div>
                  <div className="bg-[#0A0A10] p-2 rounded-xl border border-red-900/30">
                    <div className="text-[10px] text-slate-400">Ù…Ø§Ù†Ø¯Ù‡ Ø¨Ø¯Ù‡ÛŒ</div>
                    <div className="text-xs font-bold text-rose-400 font-mono mt-0.5">{Number(receiptModalStudent.debt).toLocaleString()} <span className="text-[9px] font-normal text-slate-400">ØªÙˆÙ…Ø§Ù†</span></div>
                  </div>
                </div>
              </div>

              {/* ÙØ±Ù… ØµØ¯ÙˆØ± Ø±Ø³ÛŒØ¯ Ø¬Ø¯ÛŒØ¯ */}
              <form onSubmit={handleIssueNewReceipt} className="bg-[#12121C] p-4 rounded-2xl border border-red-900/40 space-y-3">
                <h4 className="text-sm font-serif font-medium text-white flex items-center gap-2"><Printer size={16}/> ØµØ¯ÙˆØ± Ø±Ø³ÛŒØ¯ Ø¬Ø¯ÛŒØ¯</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] text-slate-400 px-1 font-medium">Ù…Ø¨Ù„Øº Ø§ÛŒÙ† Ø±Ø³ÛŒØ¯ (ØªÙˆÙ…Ø§Ù†)</label>
                    {receiptModalStudent.debt > 0 && (
                      <button
                        type="button"
                        onClick={() => setReceiptAmount(String(receiptModalStudent.debt))}
                        className="text-[10px] text-emerald-400 hover:underline font-medium cursor-pointer"
                      >
                        ØªØ³ÙˆÛŒÙ‡ Ø¨Ø¯Ù‡ÛŒ ({Number(receiptModalStudent.debt).toLocaleString()} ØªÙˆÙ…Ø§Ù†)
                      </button>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <input 
                      type="number" 
                      required 
                      value={receiptAmount} 
                      onChange={(e) => setReceiptAmount(e.target.value)} 
                      placeholder="ØªÙˆÙ…Ø§Ù†" 
                      className="flex-1 bg-[#0A0A10] border border-red-900/40 text-white rounded-xl py-2 px-3 focus:border-red-500 outline-none text-sm font-bold font-mono" 
                    />
                    <button type="submit" className="bg-gradient-to-r from-red-600 to-rose-700 hover:brightness-110 text-white px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 shadow-[0_0_15px_rgba(220,38,38,0.3)]">
                      Ø«Ø¨Øª Ùˆ Ú†Ø§Ù¾
                    </button>
                  </div>
                </div>
              </form>

              <div>
                <h4 className="text-sm font-serif font-medium mb-3 text-white">ØªØ§Ø±ÛŒØ®Ú†Ù‡ Ø±Ø³ÛŒØ¯Ù‡Ø§ÛŒ ØµØ§Ø¯Ø± Ø´Ø¯Ù‡</h4>
                {isReceiptLoading ? (
                   <p className="text-center text-xs text-slate-400 py-4">Ø¯Ø± Ø­Ø§Ù„ Ø¨Ø§Ø±Ú¯Ø°Ø§Ø±ÛŒ...</p>
                ) : studentReceipts.length === 0 ? (
                   <p className="text-center text-xs text-slate-400 py-4 bg-[#12121C] rounded-xl border border-red-900/30">ØªØ§ Ú©Ù†ÙˆÙ† Ø±Ø³ÛŒØ¯ÛŒ Ø¨Ø±Ø§ÛŒ Ø§ÛŒÙ† Ø¯Ø§Ù†Ø´Ø¬Ùˆ ØµØ§Ø¯Ø± Ù†Ø´Ø¯Ù‡ Ø§Ø³Øª.</p>
                ) : (
                   <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                     {studentReceipts.map((r, idx) => (
                       <div key={idx} className="flex justify-between items-center bg-[#12121C] p-3 rounded-xl border border-red-900/30 hover:border-red-500/40 transition-colors">
                         <div>
                           <div className="text-sm font-bold text-emerald-400 font-mono">{Number(r.paidAmount).toLocaleString()} <span className="text-[10px] text-slate-400 font-sans">ØªÙˆÙ…Ø§Ù†</span></div>
                           <div className="text-[10px] text-slate-400 mt-1">{r.date}</div>
                         </div>
                         <button 
                           onClick={(e) => { e.preventDefault(); printHTML(receiptModalStudent, r.paidAmount, r.date); }}
                           className="p-2 bg-red-950/40 hover:bg-red-600 text-red-300 hover:text-white rounded-full transition-colors cursor-pointer"
                           title="Ú†Ø§Ù¾ Ù…Ø¬Ø¯Ø¯"
                           type="button"
                         >
                           <Printer size={16} />
                         </button>
                       </div>
                     ))}
                   </div>
                )}
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

function PayrollSection({ salaries: rawSalaries, terms, searchQuery, onAddSalary, onUpdateSalary, onDeleteSalary }: any) {
  const [showAddSalary, setShowAddSalary] = useState(false);
  const [editingSalary, setEditingSalary] = useState<TeacherSalary | null>(null);
  const [selectedTermId, setSelectedTermId] = useState<string | null>(terms?.[0]?.id || null);
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableRoles = Array.from(
    new Set(
      rawSalaries
        .map((s: TeacherSalary) => s.role?.trim())
        .filter((r: string | undefined): r is string => Boolean(r))
    )
  ) as string[];

  const query = searchQuery ? searchQuery.trim().toLowerCase() : '';
  const allSalaries = query
    ? rawSalaries.filter((s: TeacherSalary) =>
        s.teacherName?.toLowerCase().includes(query) ||
        s.role?.toLowerCase().includes(query) ||
        s.month?.toLowerCase().includes(query) ||
        s.status?.toLowerCase().includes(query)
      )
    : rawSalaries;

  let salaries = selectedTermId && selectedTermId !== 'all' ? allSalaries.filter((s: any) => String(s.termId) === String(selectedTermId)) : allSalaries;

  if (selectedRole && selectedRole !== 'all') {
    salaries = salaries.filter((s: any) => s.role?.trim() === selectedRole);
  }

  const handleProcessSalary = async (e: React.FormEvent<HTMLFormElement>, isEdit: boolean) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const f = new FormData(e.currentTarget);
      const tId = f.get('tId') as string;
      
      let receiptUrl = (isEdit && editingSalary?.receiptUrl) || '';
      const file = f.get('receipt') as File;
      if (file && file.size > 0) {
        receiptUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      }

      const salaryData = {
        teacherName: f.get('n') as string,
        role: f.get('r') as string,
        amount: Number(f.get('a')),
        month: f.get('m') as string,
        status: f.get('s') as string || 'unpaid',
        termId: tId,
        receiptUrl
      };

      if (isEdit && editingSalary) {
        await onUpdateSalary(editingSalary.id, salaryData);
        setEditingSalary(null);
      } else {
        await onAddSalary(salaryData);
        setShowAddSalary(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 lg:space-y-8" dir="rtl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 border-b border-red-900/30 pb-6">
        <div>
          <h2 className="text-2xl lg:text-3xl font-serif font-medium text-white">Ø­Ù‚ÙˆÙ‚ Ùˆ Ø¯Ø³ØªÙ…Ø²Ø¯</h2>
          <p className="text-slate-400 mt-1 text-sm">Ù…Ø¯ÛŒØ±ÛŒØª ÙÛŒØ´â€ŒÙ‡Ø§ÛŒ Ù‚Ø§Ù†ÙˆÙ†ÛŒ Ø§Ø³Ø§ØªÛŒØ¯ Ø¢Ú©Ø§Ø¯Ù…ÛŒ ØºØ²Ø§Ù„</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <select 
            value={selectedTermId || 'all'}
            onChange={(e) => setSelectedTermId(e.target.value)}
            className="flex-1 sm:flex-none bg-[#12121C] border border-red-900/40 rounded-full py-2.5 px-4 focus:border-red-500 outline-none text-slate-200 cursor-pointer text-sm font-medium min-w-[140px]"
          >
            <option value="all">Ù‡Ù…Ù‡ ØªØ±Ù…â€ŒÙ‡Ø§</option>
            {terms.map((t: any) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
          <select 
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="flex-1 sm:flex-none bg-[#12121C] border border-red-900/40 rounded-full py-2.5 px-4 focus:border-red-500 outline-none text-slate-200 cursor-pointer text-sm font-medium min-w-[140px]"
          >
            <option value="all">Ù‡Ù…Ù‡ Ù†Ù‚Ø´â€ŒÙ‡Ø§ / Ø³Ù…Øªâ€ŒÙ‡Ø§</option>
            {availableRoles.map((role: string) => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
          <button onClick={() => setShowAddSalary(true)} className="flex-1 sm:flex-none bg-gradient-to-r from-red-600 to-rose-700 text-white px-5 py-2.5 rounded-full font-bold flex items-center justify-center gap-2 hover:brightness-110 transition-all text-sm cursor-pointer shadow-[0_0_20px_rgba(220,38,38,0.4)]">
            <Plus size={16} /> ØµØ¯ÙˆØ± ÙÛŒØ´ Ø¬Ø¯ÛŒØ¯
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
        <div className="lg:col-span-3 bg-[#0F0F18]/90 backdrop-blur-xl p-6 lg:p-8 rounded-3xl border border-red-900/30 shadow-[0_0_30px_rgba(220,38,38,0.1)] order-2 lg:order-1">
          <h4 className="text-xl font-serif font-medium text-white mb-6">Ù„ÛŒØ³Øª ÙÛŒØ´â€ŒÙ‡Ø§ÛŒ ØµØ§Ø¯Ø±Ù‡</h4>
          <div className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar pl-2">
            {salaries.length === 0 ? (
               <div className="text-center py-20 bg-[#12121C]/60 rounded-3xl border border-dashed border-red-900/30">
                 <Wallet className="mx-auto text-slate-500 mb-4" size={40} />
                 <p className="text-slate-400 text-sm italic">Ù‡Ù†ÙˆØ² Ù‡ÛŒÚ† ÙÛŒØ´ Ø­Ù‚ÙˆÙ‚ÛŒ ØµØ§Ø¯Ø± Ù†Ø´Ø¯Ù‡ Ø§Ø³Øª.</p>
               </div>
            ) : (
              salaries.map((s: TeacherSalary) => (
                <div key={s.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 bg-[#12121C] rounded-2xl border border-red-900/30 hover:border-red-500/40 transition-all group">
                  <div className="flex items-center gap-4 mb-3 sm:mb-0">
                    <div className="w-10 h-10 rounded-2xl bg-red-950/50 border border-red-500/30 text-red-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Users size={18} />
                    </div>
                    <div>
                      <p className="font-medium text-base text-white">{s.teacherName}</p>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider">{s.role || s.month} â€¢ {terms.find((t:any) => String(t.id) === String(s.termId))?.name || 'Ù†Ø§Ù…Ø´Ø®Øµ'}</p>
                    </div>
                  </div>
                  <div className="w-full sm:w-auto flex justify-between sm:items-center gap-4">
                    <div className="sm:text-left">
                      <p className="font-mono font-bold text-sm lg:text-base text-white">{s.amount.toLocaleString()} <span className="text-[10px] font-normal text-slate-400">ØªÙˆÙ…Ø§Ù†</span></p>
                      <span className={`text-[10px] font-medium px-2.5 py-0.5 rounded-full inline-block mt-1 border ${s.status === 'paid' ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/40' : 'bg-amber-950/60 text-amber-400 border-amber-500/40'}`}>
                        {s.status === 'paid' ? 'Ù¾Ø±Ø¯Ø§Ø®Øª Ø´Ø¯Ù‡' : 'Ø¯Ø± Ù†ÙˆØ¨Øª Ù¾Ø±Ø¯Ø§Ø®Øª'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {s.receiptUrl && (
                        <button onClick={() => setSelectedReceipt(s.receiptUrl || null)} className="p-2 hover:bg-red-900/40 rounded-lg text-emerald-400" title="Ù…Ø´Ø§Ù‡Ø¯Ù‡ Ø±Ø³ÛŒØ¯">
                          <Receipt size={16} />
                        </button>
                      )}
                      <button onClick={() => setEditingSalary(s)} className="p-2 hover:bg-red-900/40 rounded-lg text-sky-400" title="ÙˆÛŒØ±Ø§ÛŒØ´">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => onDeleteSalary(s.id)} className="p-2 hover:bg-red-900/40 rounded-lg text-rose-400" title="Ø­Ø°Ù">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="lg:col-span-2 space-y-6 order-1 lg:order-2">
          <div className="bg-[#0F0F18]/90 backdrop-blur-xl p-8 rounded-3xl flex flex-col items-center justify-center text-center border border-red-900/30 shadow-[0_0_30px_rgba(220,38,38,0.1)] min-h-[250px] relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-8 opacity-10 text-red-500 -mr-4 -mt-4 group-hover:scale-110 transition-transform duration-700">
               <Wallet size={120} />
             </div>
             <div className="w-14 h-14 rounded-2xl bg-red-950/50 border border-red-500/30 text-red-400 flex items-center justify-center mb-5 shadow-[0_0_15px_rgba(220,38,38,0.3)]">
               <TrendingUp size={28} />
             </div>
             <h4 className="text-slate-400 text-sm font-medium">Ù…Ø¬Ù…ÙˆØ¹ Ù‡Ø²ÛŒÙ†Ù‡â€ŒÙ‡Ø§ÛŒ Ø¯ÙØªØ±ÛŒ Ø§Ø³Ø§ØªÛŒØ¯</h4>
             <h3 className="text-3xl lg:text-4xl font-bold mt-3 text-red-400 font-mono tracking-tight">{salaries.reduce((a: number, b: any) => a + b.amount, 0).toLocaleString()} <span className="text-xs font-normal text-slate-400">ØªÙˆÙ…Ø§Ù†</span></h3>
             <div className="mt-6 flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
               <p className="text-[10px] text-slate-500 font-mono tracking-wider">GHAZAL FINANCIAL REPORT</p>
             </div>
          </div>
          <div className="bg-[#0F0F18]/90 backdrop-blur-xl p-6 rounded-3xl border border-red-900/30 shadow-[0_0_30px_rgba(220,38,38,0.1)] text-center">
            <p className="text-xs text-slate-400 mb-1">ØªØ¹Ø¯Ø§Ø¯ ÙÛŒØ´â€ŒÙ‡Ø§ÛŒ Ø«Ø¨Øª Ø´Ø¯Ù‡ Ø§ÛŒÙ† Ø¯ÙˆØ±Ù‡</p>
            <p className="text-2xl font-bold text-white font-mono">{salaries.length} <span className="text-xs font-normal text-slate-400">Ø¹Ø¯Ø¯</span></p>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {(showAddSalary || editingSalary) && (
          <Modal title={editingSalary ? "ÙˆÛŒØ±Ø§ÛŒØ´ ÙÛŒØ´ Ø­Ù‚ÙˆÙ‚ÛŒ" : "ØµØ¯ÙˆØ± ÙÛŒØ´ Ø­Ù‚ÙˆÙ‚ÛŒ"} onClose={() => { setShowAddSalary(false); setEditingSalary(null); }}>
             <form onSubmit={(e) => handleProcessSalary(e, !!editingSalary)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 px-1 font-medium">Ù†Ø§Ù… Ùˆ Ù†Ø§Ù… Ø®Ø§Ù†ÙˆØ§Ø¯Ú¯ÛŒ Ø§Ø³ØªØ§Ø¯</label>
                  <input name="n" required defaultValue={editingSalary?.teacherName} placeholder="Ø§Ø³ØªØ§Ø¯ Ø¹Ù„ÙˆÛŒ" className="w-full bg-[#12121C] border border-red-900/40 text-white rounded-xl py-3 px-4 outline-none focus:border-red-500 text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 px-1 font-medium">Ø³Ù…Øª / Ø¯Ù¾Ø§Ø±ØªÙ…Ø§Ù†</label>
                  <input name="r" defaultValue={editingSalary?.role} placeholder="Ù…Ø¯ÛŒØ± Ú¯Ø±ÙˆÙ‡ Ø²Ø¨Ø§Ù†" className="w-full bg-[#12121C] border border-red-900/40 text-white rounded-xl py-3 px-4 outline-none focus:border-red-500 text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 px-1 font-medium">Ø§Ù†ØªØ®Ø§Ø¨ ØªØ±Ù…</label>
                  <select name="tId" required defaultValue={editingSalary?.termId || (selectedTermId && selectedTermId !== 'all' ? selectedTermId : '')} className="w-full bg-[#12121C] border border-red-900/40 text-white rounded-xl py-3 px-4 focus:border-red-500 outline-none text-sm cursor-pointer">
                    <option value="" disabled className="text-slate-500">Ø§Ù†ØªØ®Ø§Ø¨ ØªØ±Ù…...</option>
                    {terms.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 px-1 font-medium">ÙˆØ¶Ø¹ÛŒØª Ù¾Ø±Ø¯Ø§Ø®Øª</label>
                  <select name="s" required defaultValue={editingSalary?.status || 'unpaid'} className="w-full bg-[#12121C] border border-red-900/40 text-white rounded-xl py-3 px-4 focus:border-red-500 outline-none text-sm cursor-pointer">
                    <option value="unpaid">Ø¯Ø± Ù†ÙˆØ¨Øª Ù¾Ø±Ø¯Ø§Ø®Øª</option>
                    <option value="paid">Ù¾Ø±Ø¯Ø§Ø®Øª Ø´Ø¯Ù‡</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 px-1 font-medium">Ù…Ø¨Ù„Øº Ø®Ø§Ù„Øµ Ø¯Ø±ÛŒØ§ÙØªÛŒ (ØªÙˆÙ…Ø§Ù†)</label>
                  <input name="a" type="number" required defaultValue={editingSalary?.amount} placeholder="Û±Û²,Û°Û°Û°,Û°Û°Û°" className="w-full bg-[#12121C] border border-red-900/40 text-white rounded-xl py-3 px-4 outline-none focus:border-red-500 font-mono text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 px-1 font-medium">ØªÙˆØ¶ÛŒØ­Ø§Øª / Ù…Ø§Ù‡</label>
                  <input name="m" defaultValue={editingSalary?.month} placeholder="Ø§Ø±Ø¯ÛŒØ¨Ù‡Ø´Øª Û±Û´Û°Û³" className="w-full bg-[#12121C] border border-red-900/40 text-white rounded-xl py-3 px-4 outline-none focus:border-red-500 text-sm" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 px-1 font-medium">Ø¢Ù¾Ù„ÙˆØ¯ Ø±Ø³ÛŒØ¯ Ù¾Ø±Ø¯Ø§Ø®Øª (Ø§Ø®ØªÛŒØ§Ø±ÛŒ)</label>
                <input name="receipt" type="file" accept="image/*" className="w-full bg-[#12121C] border border-red-900/40 rounded-xl py-2 px-3 focus:border-red-500 outline-none text-xs text-slate-200 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-[10px] file:font-semibold file:bg-red-600 file:text-white hover:file:bg-red-700 transition-all cursor-pointer" />
              </div>
              <button type="submit" disabled={isSubmitting} className="w-full bg-gradient-to-r from-red-600 to-rose-700 text-white py-3.5 rounded-full font-bold hover:brightness-110 mt-2 shadow-[0_0_20px_rgba(220,38,38,0.4)] transition-all text-xs uppercase tracking-wider cursor-pointer disabled:opacity-50">
                {isSubmitting ? "Ø¯Ø± Ø­Ø§Ù„ Ø«Ø¨Øª..." : (editingSalary ? "Ø°Ø®ÛŒØ±Ù‡ ØªØºÛŒÛŒØ±Ø§Øª" : "ØªØ§ÛŒÛŒØ¯ Ùˆ ØµØ¯ÙˆØ± ÙÛŒØ´")}
              </button>
            </form>
          </Modal>
        )}
        {selectedReceipt && (
          <Modal title="Ù…Ø´Ø§Ù‡Ø¯Ù‡ Ø±Ø³ÛŒØ¯" onClose={() => setSelectedReceipt(null)}>
            <div className="flex justify-center p-4">
              <img src={selectedReceipt} alt="Receipt" className="max-w-full max-h-[60vh] rounded-2xl object-contain shadow-xl" />
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

function ExpensesSection({ expenses: rawExpenses, terms, searchQuery, onAddExpense, onUpdateExpense, onDeleteExpense }: any) {
  const [showAdd, setShowAdd] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [selectedTermId, setSelectedTermId] = useState<string | null>(terms?.[0]?.id || null);
  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const query = searchQuery ? searchQuery.trim().toLowerCase() : '';
  const allExpenses = query
    ? rawExpenses.filter((e: Expense) =>
        e.title?.toLowerCase().includes(query) ||
        e.category?.toLowerCase().includes(query) ||
        e.date?.toLowerCase().includes(query)
      )
    : rawExpenses;

  const expenses = selectedTermId && selectedTermId !== 'all' ? allExpenses.filter((e: any) => String(e.termId) === String(selectedTermId)) : allExpenses;

  const handleProcessExpense = async (e: React.FormEvent<HTMLFormElement>, isEdit: boolean) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const f = new FormData(e.currentTarget);
      const tId = f.get('tId') as string;
      
      let receiptUrl = (isEdit && editingExpense?.receiptUrl) || '';
      const file = f.get('receipt') as File;
      if (file && file.size > 0) {
        receiptUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      }

      const expenseData = {
        title: f.get('t') as string,
        category: f.get('c') as string,
        amount: Number(f.get('a')),
        date: editingExpense?.date || new Date().toLocaleDateString('fa-IR'),
        termId: tId,
        receiptUrl
      };

      if (isEdit && editingExpense) {
        await onUpdateExpense(editingExpense.id, expenseData);
        setEditingExpense(null);
      } else {
        await onAddExpense(expenseData);
        setShowAdd(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 lg:space-y-8" dir="rtl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 border-b border-red-900/30 pb-6">
        <div>
          <h2 className="text-2xl lg:text-3xl font-serif font-medium text-white">Ù…Ø¯ÛŒØ±ÛŒØª Ù…Ø®Ø§Ø±Ø¬</h2>
          <p className="text-slate-400 mt-1 text-sm">Ø«Ø¨Øª Ùˆ Ø¨Ø§ÛŒÚ¯Ø§Ù†ÛŒ Ù‡Ø²ÛŒÙ†Ù‡â€ŒÙ‡Ø§ÛŒ Ø¬Ø§Ø±ÛŒ Ø¢Ù…ÙˆØ²Ø´Ú¯Ø§Ù‡</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select 
            value={selectedTermId || 'all'}
            onChange={(e) => setSelectedTermId(e.target.value)}
            className="flex-1 sm:flex-none bg-[#12121C] border border-red-900/40 rounded-full py-2.5 px-5 focus:border-red-500 outline-none text-slate-200 cursor-pointer text-sm font-medium min-w-[150px]"
          >
            <option value="all">Ù‡Ù…Ù‡ ØªØ±Ù…â€ŒÙ‡Ø§</option>
            {terms.map((t: any) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
          <button onClick={() => setShowAdd(true)} className="flex-1 sm:flex-none bg-gradient-to-r from-red-600 to-rose-700 text-white px-5 py-2.5 rounded-full font-bold flex items-center justify-center gap-2 hover:brightness-110 transition-all text-sm cursor-pointer shadow-[0_0_20px_rgba(220,38,38,0.4)]">
            <Plus size={16} /> Ø«Ø¨Øª ØªÙ†Ø®ÙˆØ§Ù‡ Ø¬Ø¯ÛŒØ¯
          </button>
        </div>
      </div>
      <div className="bg-[#0F0F18]/90 backdrop-blur-xl rounded-3xl overflow-hidden border border-red-900/30 shadow-[0_0_30px_rgba(220,38,38,0.1)]">
        <div className="overflow-x-auto">
          <table className="w-full text-right min-w-[600px] border-collapse">
            <thead>
              <tr className="bg-[#12121C] text-slate-400 font-serif text-xs uppercase border-b border-red-900/30">
                <th className="px-8 py-4 font-medium">Ø¹Ù†ÙˆØ§Ù† Ù‡Ø²ÛŒÙ†Ù‡</th>
                <th className="px-8 py-4 font-medium">Ø¯Ø³ØªÙ‡â€ŒØ¨Ù†Ø¯ÛŒ</th>
                <th className="px-8 py-4 font-medium text-center">Ù…Ø¨Ù„Øº Ù¾Ø±Ø¯Ø§Ø®ØªÛŒ</th>
                <th className="px-8 py-4 font-medium text-center">ØªØ±Ù… / ØªØ§Ø±ÛŒØ®</th>
                <th className="px-8 py-4 font-medium text-center">Ø¹Ù…Ù„ÛŒØ§Øª</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-red-900/20 text-sm">
              {expenses.length === 0 ? (
                 <tr><td colSpan={5} className="px-8 py-20 text-center text-slate-500 italic">Ù‡Ù†ÙˆØ² Ù‡Ø²ÛŒÙ†Ù‡â€ŒØ§ÛŒ Ø¯Ø± Ø§ÛŒÙ† Ø¯ÙˆØ±Ù‡ Ø«Ø¨Øª Ù†Ø´Ø¯Ù‡ Ø§Ø³Øª.</td></tr>
              ) : (
                expenses.map((e: Expense) => (
                  <tr key={e.id} className="hover:bg-[#12121C]/60 transition-colors group">
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-red-950/50 border border-red-500/30 text-red-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                          <Receipt size={14} />
                        </div>
                        <span className="font-medium text-white">{e.title}</span>
                      </div>
                    </td>
                    <td className="px-8 py-4"><span className="bg-[#12121C] px-3 py-1 rounded-full text-[10px] border border-red-900/30 font-medium text-slate-300">{e.category}</span></td>
                    <td className="px-8 py-4 text-center font-mono font-bold text-rose-400 text-base">{e.amount.toLocaleString()} <span className="text-[10px] font-normal text-slate-400">ØªÙˆÙ…Ø§Ù†</span></td>
                    <td className="px-8 py-4 text-slate-400 text-xs font-mono text-center">
                      <div>{e.date}</div>
                      <div className="text-[10px] text-slate-500 mt-1 font-sans">{terms.find((t:any) => String(t.id) === String(e.termId))?.name || 'Ù†Ø§Ù…Ø´Ø®Øµ'}</div>
                    </td>
                    <td className="px-8 py-4 text-center">
                      <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                         {e.receiptUrl && (
                           <button onClick={() => setSelectedReceipt(e.receiptUrl || null)} className="p-2 hover:bg-red-900/40 rounded-lg text-emerald-400" title="Ù…Ø´Ø§Ù‡Ø¯Ù‡ Ø±Ø³ÛŒØ¯">
                             <Receipt size={16} />
                           </button>
                         )}
                         <button onClick={() => setEditingExpense(e)} className="p-2 hover:bg-red-900/40 rounded-lg text-sky-400" title="ÙˆÛŒØ±Ø§ÛŒØ´">
                           <Pencil size={16} />
                         </button>
                         <button onClick={() => onDeleteExpense(e.id)} className="p-2 hover:bg-red-900/40 rounded-lg text-rose-400" title="Ø­Ø°Ù">
                           <Trash2 size={16} />
                         </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {(showAdd || editingExpense) && (
          <Modal title={editingExpense ? "ÙˆÛŒØ±Ø§ÛŒØ´ Ù‡Ø²ÛŒÙ†Ù‡" : "Ø«Ø¨Øª Ù‡Ø²ÛŒÙ†Ù‡ Ø¬Ø¯ÛŒØ¯"} onClose={() => { setShowAdd(false); setEditingExpense(null); }}>
             <form onSubmit={(e) => handleProcessExpense(e, !!editingExpense)} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 px-1 font-medium">Ø´Ø±Ø­ Ù‡Ø²ÛŒÙ†Ù‡</label>
                <input name="t" required defaultValue={editingExpense?.title} placeholder="Ø®Ø±ÛŒØ¯ Ù…Ù„Ø²ÙˆÙ…Ø§Øª Ø¯ÙØªØ±ÛŒ" className="w-full bg-[#12121C] border border-red-900/40 text-white rounded-xl py-3 px-4 outline-none focus:border-red-500 text-sm" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 px-1 font-medium">Ø§Ù†ØªØ®Ø§Ø¨ ØªØ±Ù…</label>
                <select name="tId" required defaultValue={editingExpense?.termId || (selectedTermId && selectedTermId !== 'all' ? selectedTermId : '')} className="w-full bg-[#12121C] border border-red-900/40 text-white rounded-xl py-3 px-4 focus:border-red-500 outline-none text-sm cursor-pointer">
                  <option value="" disabled className="text-slate-500">Ø§Ù†ØªØ®Ø§Ø¨ ØªØ±Ù…...</option>
                  {terms.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 px-1 font-medium">Ø¯Ø³ØªÙ‡â€ŒØ¨Ù†Ø¯ÛŒ</label>
                  <input name="c" required defaultValue={editingExpense?.category} placeholder="Ù…Ù„Ø²ÙˆÙ…Ø§Øª / Ù‚Ø¨ÙˆØ¶ / ØªØ¹Ù…ÛŒØ±Ø§Øª" className="w-full bg-[#12121C] border border-red-900/40 text-white rounded-xl py-3 px-4 outline-none focus:border-red-500 text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 px-1 font-medium">Ù…Ø¨Ù„Øº ÙØ§Ú©ØªÙˆØ± (ØªÙˆÙ…Ø§Ù†)</label>
                  <input name="a" type="number" required defaultValue={editingExpense?.amount} placeholder="ØªÙˆÙ…Ø§Ù†" className="w-full bg-[#12121C] border border-red-900/40 text-white rounded-xl py-3 px-4 outline-none focus:border-red-500 font-mono text-sm" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 px-1 font-medium">Ø¢Ù¾Ù„ÙˆØ¯ Ø±Ø³ÛŒØ¯ / ÙØ§Ú©ØªÙˆØ± (Ø§Ø®ØªÛŒØ§Ø±ÛŒ)</label>
                <input name="receipt" type="file" accept="image/*" className="w-full bg-[#12121C] border border-red-900/40 rounded-xl py-2 px-3 focus:border-red-500 outline-none text-xs text-slate-200 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-[10px] file:font-semibold file:bg-red-600 file:text-white hover:file:bg-red-700 transition-all cursor-pointer" />
              </div>
              <button type="submit" disabled={isSubmitting} className="w-full bg-gradient-to-r from-red-600 to-rose-700 text-white py-3.5 rounded-full font-bold hover:brightness-110 mt-4 shadow-[0_0_20px_rgba(220,38,38,0.4)] transition-all text-xs uppercase tracking-wider cursor-pointer disabled:opacity-50">
                {isSubmitting ? "Ø¯Ø± Ø­Ø§Ù„ Ø«Ø¨Øª..." : (editingExpense ? "Ø°Ø®ÛŒØ±Ù‡ ØªØºÛŒÛŒØ±Ø§Øª" : "Ø«Ø¨Øª Ø¯Ø± Ø³ÛŒØ³ØªÙ… Ø¯ÙØªØ±ÛŒ")}
              </button>
            </form>
          </Modal>
        )}
        {selectedReceipt && (
          <Modal title="Ù…Ø´Ø§Ù‡Ø¯Ù‡ Ø±Ø³ÛŒØ¯" onClose={() => setSelectedReceipt(null)}>
            <div className="flex justify-center p-4">
              <img src={selectedReceipt} alt="Receipt" className="max-w-full max-h-[60vh] rounded-2xl object-contain shadow-xl" />
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

function Modal({ title, children, onClose }: { title: string, children: React.ReactNode, onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onClose();
        }} 
        className="absolute inset-0 bg-black/75 backdrop-blur-md" 
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-[#0F0F18]/95 backdrop-blur-2xl text-slate-100 w-full max-w-lg p-6 lg:p-8 rounded-3xl relative z-10 border border-red-500/30 shadow-[0_0_50px_rgba(220,38,38,0.25)] max-h-[90vh] flex flex-col overflow-hidden"
        dir="rtl"
      >
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-red-900/30 shrink-0">
          <div>
            <h3 className="text-xl lg:text-2xl font-serif font-medium text-white">{title}</h3>
          </div>
          <button 
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }} 
            className="p-2.5 bg-red-950/40 border border-red-500/30 hover:bg-red-600 text-red-300 hover:text-white rounded-full transition-all cursor-pointer shrink-0 z-20 flex items-center justify-center shadow-[0_0_10px_rgba(220,38,38,0.2)]"
            aria-label="Ø¨Ø³ØªÙ†"
          >
            <X size={18} />
          </button>
        </div>
        
        <div className="relative overflow-y-auto custom-scrollbar pr-1">
          {children}
        </div>
      </motion.div>
    </div>
  );
}

