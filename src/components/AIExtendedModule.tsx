import React, { useState, useEffect } from 'react';
import { Student360Profile, Department, CollegeSettings } from '../types';
import {
  Bot,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  FileText,
  Mail,
  Send,
  User,
  RefreshCw,
  Search,
  CheckCircle2,
  Copy,
  BookOpen,
  Award,
  Share2,
} from 'lucide-react';

interface AIExtendedModuleProps {
  students: Student360Profile[];
  departments: Department[];
  settings: CollegeSettings;
  userRole: string;
}

export const AIExtendedModule: React.FC<AIExtendedModuleProps> = ({
  students,
  departments,
  settings,
  userRole,
}) => {
  const [activeTab, setActiveTab] = useState<
    'chat' | 'attendance' | 'defaulter' | 'performance' | 'summary' | 'notice' | 'email'
  >('chat');

  // Chat State
  const [messages, setMessages] = useState<{ sender: 'user' | 'ai'; text: string }[]>([
    {
      sender: 'ai',
      text: `Hello! I am your AI College Executive Assistant powered by Gemini. Select any AI feature tab above or ask me directly about attendance, defaulters, timetable, or student analytics.`,
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Selected Student for Predictions
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const selectedStudent = students.find((s) => s.id === selectedStudentId) || students[0];

  // Attendance Prediction State
  const [attPrediction, setAttPrediction] = useState<string>('');
  const [isPredictingAtt, setIsPredictingAtt] = useState(false);

  // Defaulter Prediction State
  const [defaulterSearch, setDefaulterSearch] = useState('');

  // Performance Prediction State
  const [perfPrediction, setPerfPrediction] = useState<string>('');
  const [isPredictingPerf, setIsPredictingPerf] = useState(false);

  // Report Summary State
  const [reportType, setReportType] = useState('Monthly Institutional Attendance & Defaulters');
  const [summaryText, setSummaryText] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);

  // Notice Drafting State
  const [noticeTopic, setNoticeTopic] = useState('Mandatory Mid-Term Exam Attendance & Submission');
  const [noticeAudience, setNoticeAudience] = useState('All SY & TY B.Com Students');
  const [noticeKeyPoints, setNoticeKeyPoints] = useState('Attendance must be above 75%. Internal assignment deadline is September 20. Hall tickets issued next week.');
  const [draftedNotice, setDraftedNotice] = useState('');
  const [isDraftingNotice, setIsDraftingNotice] = useState(false);
  const [noticeCopied, setNoticeCopied] = useState(false);

  // Email Generation State
  const [emailPurpose, setEmailPurpose] = useState('Defaulter Attendance Warning to Parents');
  const [emailStudentName, setEmailStudentName] = useState(selectedStudent?.fullName || 'Aarav Sharma');
  const [emailAttPct, setEmailAttPct] = useState(selectedStudent?.attendancePercentage || 68);
  const [draftedEmail, setDraftedEmail] = useState('');
  const [isDraftingEmail, setIsDraftingEmail] = useState(false);
  const [emailCopied, setEmailCopied] = useState(false);

  // Run initial predictions when student changes
  useEffect(() => {
    if (selectedStudent) {
      handlePredictAttendance(selectedStudent.id);
      handlePredictPerformance(selectedStudent.id);
    }
  }, [selectedStudentId]);

  // Chat Handler
  const handleSendChat = async (textToSend?: string) => {
    const prompt = textToSend || inputPrompt;
    if (!prompt.trim() || isChatLoading) return;

    setMessages((prev) => [...prev, { sender: 'user', text: prompt }]);
    if (!textToSend) setInputPrompt('');
    setIsChatLoading(true);

    try {
      const res = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, userRole }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { sender: 'ai', text: data.reply || 'No response returned.' }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: 'ai', text: 'Error connecting to Gemini AI Assistant.' },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Prediction Handlers
  const handlePredictAttendance = async (id: string) => {
    setIsPredictingAtt(true);
    setAttPrediction('');
    try {
      const res = await fetch('/api/ai/predict-attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: id }),
      });
      const data = await res.json();
      setAttPrediction(data.prediction);
    } catch (err) {
      setAttPrediction('Error running attendance prediction.');
    } finally {
      setIsPredictingAtt(false);
    }
  };

  const handlePredictPerformance = async (id: string) => {
    setIsPredictingPerf(true);
    setPerfPrediction('');
    try {
      const res = await fetch('/api/ai/predict-performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: id }),
      });
      const data = await res.json();
      setPerfPrediction(data.prediction);
    } catch (err) {
      setPerfPrediction('Error running academic performance prediction.');
    } finally {
      setIsPredictingPerf(false);
    }
  };

  // Report Summary Handler
  const handleGenerateSummary = async () => {
    setIsSummarizing(true);
    setSummaryText('');
    try {
      const res = await fetch('/api/ai/summarize-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportType }),
      });
      const data = await res.json();
      setSummaryText(data.summary);
    } catch (err) {
      setSummaryText('Error generating executive summary.');
    } finally {
      setIsSummarizing(false);
    }
  };

  // Notice Drafting Handler
  const handleDraftNotice = async () => {
    setIsDraftingNotice(true);
    setDraftedNotice('');
    try {
      const res = await fetch('/api/ai/draft-notice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: noticeTopic,
          targetAudience: noticeAudience,
          keyPoints: noticeKeyPoints,
        }),
      });
      const data = await res.json();
      setDraftedNotice(data.noticeText);
    } catch (err) {
      setDraftedNotice('Error drafting notice.');
    } finally {
      setIsDraftingNotice(false);
    }
  };

  // Email Drafting Handler
  const handleDraftEmail = async () => {
    setIsDraftingEmail(true);
    setDraftedEmail('');
    try {
      const res = await fetch('/api/ai/draft-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          purpose: emailPurpose,
          studentName: emailStudentName,
          attendancePct: emailAttPct,
        }),
      });
      const data = await res.json();
      setDraftedEmail(data.emailContent);
    } catch (err) {
      setDraftedEmail('Error drafting email.');
    } finally {
      setIsDraftingEmail(false);
    }
  };

  // High-risk defaulter filter
  const highRiskDefaulters = students
    .filter((s) => s.attendancePercentage < settings.minimumAttendancePct)
    .filter(
      (s) =>
        s.fullName.toLowerCase().includes(defaulterSearch.toLowerCase()) ||
        s.rollNumber.toLowerCase().includes(defaulterSearch.toLowerCase()) ||
        s.departmentName.toLowerCase().includes(defaulterSearch.toLowerCase())
    );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white p-6 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shrink-0">
            <Bot className="w-8 h-8 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold">AI College Executive Assistant Suite</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-400 text-indigo-950 uppercase tracking-wider flex items-center space-x-1">
                <Sparkles className="w-3 h-3" />
                <span>Gemini 2.5 Flash</span>
              </span>
            </div>
            <p className="text-xs text-indigo-200 mt-1">
              Predictive analytics, automated notice drafting, defaulter early warnings, and executive report summaries.
            </p>
          </div>
        </div>

        {/* Quick Stats Pill */}
        <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-md border border-white/10 px-4 py-2.5 rounded-2xl shrink-0 text-xs">
          <div>
            <p className="text-[10px] text-indigo-200 uppercase font-semibold">Min Threshold</p>
            <p className="font-bold text-amber-300">{settings.minimumAttendancePct}% Attendance</p>
          </div>
          <div className="h-6 w-px bg-white/20" />
          <div>
            <p className="text-[10px] text-indigo-200 uppercase font-semibold">Flagged Defaulters</p>
            <p className="font-bold text-rose-300">
              {students.filter((s) => s.attendancePercentage < settings.minimumAttendancePct).length} Students
            </p>
          </div>
        </div>
      </div>

      {/* Feature Navigation Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs">
        <button
          onClick={() => setActiveTab('chat')}
          className={`px-4 py-2 rounded-xl font-bold flex items-center space-x-2 transition ${
            activeTab === 'chat'
              ? 'bg-indigo-600 text-white shadow'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Bot className="w-4 h-4" />
          <span>1. AI Executive Chatbot</span>
        </button>

        <button
          onClick={() => setActiveTab('attendance')}
          className={`px-4 py-2 rounded-xl font-bold flex items-center space-x-2 transition ${
            activeTab === 'attendance'
              ? 'bg-indigo-600 text-white shadow'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>2. Attendance Prediction</span>
        </button>

        <button
          onClick={() => setActiveTab('defaulter')}
          className={`px-4 py-2 rounded-xl font-bold flex items-center space-x-2 transition ${
            activeTab === 'defaulter'
              ? 'bg-indigo-600 text-white shadow'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-rose-500" />
          <span>3. Defaulter Risk Predictor</span>
        </button>

        <button
          onClick={() => setActiveTab('performance')}
          className={`px-4 py-2 rounded-xl font-bold flex items-center space-x-2 transition ${
            activeTab === 'performance'
              ? 'bg-indigo-600 text-white shadow'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Award className="w-4 h-4 text-amber-500" />
          <span>4. Performance & CGPA Predictor</span>
        </button>

        <button
          onClick={() => setActiveTab('summary')}
          className={`px-4 py-2 rounded-xl font-bold flex items-center space-x-2 transition ${
            activeTab === 'summary'
              ? 'bg-indigo-600 text-white shadow'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>5. AI Report Summary</span>
        </button>

        <button
          onClick={() => setActiveTab('notice')}
          className={`px-4 py-2 rounded-xl font-bold flex items-center space-x-2 transition ${
            activeTab === 'notice'
              ? 'bg-indigo-600 text-white shadow'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>6. AI Notice Drafter</span>
        </button>

        <button
          onClick={() => setActiveTab('email')}
          className={`px-4 py-2 rounded-xl font-bold flex items-center space-x-2 transition ${
            activeTab === 'email'
              ? 'bg-indigo-600 text-white shadow'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Mail className="w-4 h-4" />
          <span>7. AI Email Drafter</span>
        </button>
      </div>

      {/* TAB 1: AI CHATBOT */}
      {activeTab === 'chat' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[580px]">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bot className="w-5 h-5 text-indigo-600" />
              <span className="font-bold text-slate-800 text-xs">Conversational AI Executive Assistant</span>
            </div>
            <span className="text-[10px] text-slate-500 font-medium">Role: {userRole}</span>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50 text-xs">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex items-start space-x-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'ai' && (
                  <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`max-w-[82%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-indigo-600 text-white font-medium rounded-tr-none'
                      : 'bg-white text-slate-800 border border-slate-200 shadow-sm rounded-tl-none whitespace-pre-wrap'
                  }`}
                >
                  {m.text}
                </div>
                {m.sender === 'user' && (
                  <div className="w-7 h-7 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {isChatLoading && (
              <div className="flex items-center space-x-2 text-xs text-indigo-600 font-semibold p-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Gemini AI is analyzing ERP database...</span>
              </div>
            )}
          </div>

          <div className="p-3 border-t border-slate-200 bg-white">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendChat();
              }}
              className="flex items-center space-x-2"
            >
              <input
                type="text"
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                placeholder="Ask about defaulters, faculty load, timetable conflicts, or student grades..."
                className="flex-1 text-xs bg-slate-50 border border-slate-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                disabled={isChatLoading || !inputPrompt.trim()}
                className="px-4 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition disabled:opacity-50 flex items-center space-x-1.5"
              >
                <Send className="w-4 h-4" />
                <span>Ask</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: ATTENDANCE PREDICTION */}
      {activeTab === 'attendance' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
                <span>AI Student Attendance Trajectory Predictor</span>
              </h3>
              <p className="text-xs text-slate-500">
                Forecasts student end-of-semester attendance percentage based on upcoming lectures and medical leave buffer.
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <label className="text-xs font-bold text-slate-700">Select Student:</label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.fullName} ({s.rollNumber} - {s.attendancePercentage}%)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Student Detail Card */}
            <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl bg-indigo-100 border border-indigo-200 flex items-center justify-center font-bold text-indigo-700 text-lg">
                  {selectedStudent.fullName.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{selectedStudent.fullName}</h4>
                  <p className="text-xs text-slate-500">
                    Roll: {selectedStudent.rollNumber} • Sem {selectedStudent.semester}
                  </p>
                  <p className="text-[11px] text-indigo-600 font-semibold">{selectedStudent.departmentName}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-slate-200">
                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <p className="text-[10px] text-slate-500 font-semibold">Attended</p>
                  <p className="font-bold text-slate-800 text-sm">
                    {selectedStudent.attendedLectures} / {selectedStudent.totalLectures}
                  </p>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <p className="text-[10px] text-slate-500 font-semibold">Current %</p>
                  <p
                    className={`font-bold text-sm ${
                      selectedStudent.attendancePercentage < settings.minimumAttendancePct
                        ? 'text-rose-600'
                        : 'text-emerald-600'
                    }`}
                  >
                    {selectedStudent.attendancePercentage}%
                  </p>
                </div>
              </div>

              <button
                onClick={() => handlePredictAttendance(selectedStudent.id)}
                disabled={isPredictingAtt}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-2 transition shadow-sm disabled:opacity-50"
              >
                {isPredictingAtt ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>Recalculate Prediction</span>
              </button>
            </div>

            {/* AI Prediction Result */}
            <div className="lg:col-span-2 p-5 bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl shadow-lg space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-amber-300" />
                  <h4 className="font-bold text-sm text-white">AI Gemini Prediction Output</h4>
                </div>
                <span className="text-[10px] bg-white/10 px-2.5 py-1 rounded-full text-indigo-200 font-semibold">
                  Model: Gemini 2.5 Flash
                </span>
              </div>

              {isPredictingAtt ? (
                <div className="p-8 flex items-center justify-center space-x-3 text-indigo-300 text-xs">
                  <RefreshCw className="w-5 h-5 animate-spin text-amber-400" />
                  <span>Calculating attendance trajectory & recovery threshold...</span>
                </div>
              ) : (
                <div className="text-xs leading-relaxed text-indigo-100 whitespace-pre-wrap font-mono bg-black/20 p-4 rounded-xl border border-white/10">
                  {attPrediction || 'Click recalculate to run prediction.'}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DEFAULTER RISK PREDICTOR */}
      {activeTab === 'defaulter' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-5 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <span>AI Defaulter Risk Identification Engine</span>
              </h3>
              <p className="text-xs text-slate-500">
                Lists students currently flagged below mandatory threshold ({settings.minimumAttendancePct}%) or trending into critical defaulter status.
              </p>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={defaulterSearch}
                onChange={(e) => setDefaulterSearch(e.target.value)}
                placeholder="Search defaulter student name or roll..."
                className="pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800"
              />
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-2xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-3">Student Info</th>
                  <th className="p-3">Department</th>
                  <th className="p-3">Attended / Total</th>
                  <th className="p-3">Current Attendance</th>
                  <th className="p-3">Risk Level</th>
                  <th className="p-3">AI Intervention Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {highRiskDefaulters.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80">
                    <td className="p-3 font-semibold text-slate-900">
                      <div>{s.fullName}</div>
                      <div className="text-[10px] text-slate-500 font-normal">Roll: {s.rollNumber} • Sem {s.semester}</div>
                    </td>
                    <td className="p-3 text-slate-600">{s.departmentName}</td>
                    <td className="p-3 font-mono text-slate-700">
                      {s.attendedLectures} / {s.totalLectures}
                    </td>
                    <td className="p-3 font-bold text-rose-600">{s.attendancePercentage}%</td>
                    <td className="p-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          s.attendancePercentage < 65
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {s.attendancePercentage < 65 ? 'CRITICAL DEFAULTER' : 'WARNING RISK'}
                      </span>
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => {
                          setEmailStudentName(s.fullName);
                          setEmailAttPct(s.attendancePercentage);
                          setActiveTab('email');
                        }}
                        className="px-3 py-1 bg-indigo-50 text-indigo-600 border border-indigo-200 hover:bg-indigo-600 hover:text-white rounded-lg text-[11px] font-bold transition"
                      >
                        Draft Warning Email
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: PERFORMANCE PREDICTOR */}
      {activeTab === 'performance' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <Award className="w-5 h-5 text-amber-500" />
                <span>AI Student Performance & CGPA Forecast Engine</span>
              </h3>
              <p className="text-xs text-slate-500">
                Correlates attendance consistency and internal marks to forecast current semester SGPA and graduation CGPA.
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <label className="text-xs font-bold text-slate-700">Select Student:</label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.fullName} (CGPA: {s.overallCgpa})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="p-5 bg-gradient-to-r from-purple-900 to-indigo-900 text-white rounded-2xl shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h4 className="font-bold text-sm text-amber-300 flex items-center space-x-2">
                <Sparkles className="w-4 h-4" />
                <span>Forecasted CGPA & Academic Trajectory for {selectedStudent.fullName}</span>
              </h4>
              <button
                onClick={() => handlePredictPerformance(selectedStudent.id)}
                disabled={isPredictingPerf}
                className="px-3 py-1 bg-white/20 hover:bg-white/30 text-white text-xs font-bold rounded-lg transition disabled:opacity-50 flex items-center space-x-1"
              >
                {isPredictingPerf ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                <span>Refresh AI Forecast</span>
              </button>
            </div>

            {isPredictingPerf ? (
              <div className="p-6 text-center text-xs text-purple-200">
                Generating academic correlation model...
              </div>
            ) : (
              <div className="text-xs leading-relaxed text-purple-100 whitespace-pre-wrap font-mono bg-black/20 p-4 rounded-xl border border-white/10">
                {perfPrediction || 'Click refresh to run CGPA prediction.'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: REPORT SUMMARY */}
      {activeTab === 'summary' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-5 shadow-sm">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              <span>AI Executive Report Summary Generator</span>
            </h3>
            <p className="text-xs text-slate-500">
              Generates executive summary reports for HODs and College Management in seconds.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="flex-1 px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800"
            >
              <option value="Monthly Institutional Attendance & Defaulters">Monthly Institutional Attendance & Defaulters Summary</option>
              <option value="Department Wise Faculty Workload Analysis">Department Wise Faculty Workload Analysis</option>
              <option value="Academic Risk & Student Failure Projections">Academic Risk & Student Failure Projections</option>
              <option value="ATKT & Re-Examination Operations Summary">ATKT & Re-Examination Operations Summary</option>
            </select>

            <button
              onClick={handleGenerateSummary}
              disabled={isSummarizing}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-2 transition shadow-sm disabled:opacity-50"
            >
              {isSummarizing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>Generate AI Summary</span>
            </button>
          </div>

          {summaryText && (
            <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl text-xs leading-relaxed text-slate-800 whitespace-pre-wrap font-sans shadow-inner">
              {summaryText}
            </div>
          )}
        </div>
      )}

      {/* TAB 6: NOTICE DRAFTER */}
      {activeTab === 'notice' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-5 shadow-sm">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              <span>AI Official Notice Drafting Assistant</span>
            </h3>
            <p className="text-xs text-slate-500">
              Draft formal college notices with reference numbers and official tone ready to publish to the ERP Notice Board.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Notice Topic / Heading</label>
              <input
                type="text"
                value={noticeTopic}
                onChange={(e) => setNoticeTopic(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-800"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Target Audience</label>
              <input
                type="text"
                value={noticeAudience}
                onChange={(e) => setNoticeAudience(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1 text-xs">Key Information / Bullet Points</label>
            <textarea
              rows={3}
              value={noticeKeyPoints}
              onChange={(e) => setNoticeKeyPoints(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 font-medium"
            />
          </div>

          <button
            onClick={handleDraftNotice}
            disabled={isDraftingNotice}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center space-x-2 transition shadow-sm disabled:opacity-50"
          >
            {isDraftingNotice ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>Draft Official Notice with Gemini</span>
          </button>

          {draftedNotice && (
            <div className="p-5 bg-amber-50/50 border border-amber-200 rounded-2xl space-y-3">
              <div className="flex justify-between items-center border-b border-amber-200 pb-2">
                <span className="font-bold text-amber-900 text-xs">Drafted Official Notice</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(draftedNotice);
                    setNoticeCopied(true);
                    setTimeout(() => setNoticeCopied(false), 2000);
                  }}
                  className="px-3 py-1 bg-white text-slate-700 border border-slate-300 hover:bg-slate-100 rounded-lg text-[11px] font-bold flex items-center space-x-1"
                >
                  {noticeCopied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{noticeCopied ? 'Copied!' : 'Copy Notice'}</span>
                </button>
              </div>
              <div className="text-xs leading-relaxed text-slate-800 whitespace-pre-wrap font-serif">
                {draftedNotice}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 7: EMAIL DRAFTER */}
      {activeTab === 'email' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-5 shadow-sm">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <Mail className="w-5 h-5 text-indigo-600" />
              <span>AI Warning & Communication Email Generator</span>
            </h3>
            <p className="text-xs text-slate-500">
              Drafts personalized defaulter warning emails or parent communications with placeholders.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Communication Purpose</label>
              <input
                type="text"
                value={emailPurpose}
                onChange={(e) => setEmailPurpose(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-800"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Student Name</label>
              <input
                type="text"
                value={emailStudentName}
                onChange={(e) => setEmailStudentName(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-800"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Current Attendance (%)</label>
              <input
                type="number"
                value={emailAttPct}
                onChange={(e) => setEmailAttPct(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-800"
              />
            </div>
          </div>

          <button
            onClick={handleDraftEmail}
            disabled={isDraftingEmail}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center space-x-2 transition shadow-sm disabled:opacity-50"
          >
            {isDraftingEmail ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>Generate Email Draft with Gemini</span>
          </button>

          {draftedEmail && (
            <div className="p-5 bg-indigo-50/50 border border-indigo-200 rounded-2xl space-y-3">
              <div className="flex justify-between items-center border-b border-indigo-200 pb-2">
                <span className="font-bold text-indigo-950 text-xs">Generated Email Template</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(draftedEmail);
                    setEmailCopied(true);
                    setTimeout(() => setEmailCopied(false), 2000);
                  }}
                  className="px-3 py-1 bg-white text-slate-700 border border-slate-300 hover:bg-slate-100 rounded-lg text-[11px] font-bold flex items-center space-x-1"
                >
                  {emailCopied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{emailCopied ? 'Copied!' : 'Copy Email'}</span>
                </button>
              </div>
              <div className="text-xs leading-relaxed text-slate-800 whitespace-pre-wrap font-sans">
                {draftedEmail}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
