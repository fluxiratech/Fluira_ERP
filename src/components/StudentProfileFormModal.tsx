import React, { useState, useEffect } from 'react';
import { Student360Profile, Department, Program, Course, DepartmentActivity } from '../types';
import { X, Save, User, BookOpen, Phone, Users, GraduationCap, Award, Wrench, CheckCircle2, Plus, Trash2, Image, Upload } from 'lucide-react';
import { convertFileToJPGDataUrl } from '../utils/imageUtils';

interface StudentProfileFormModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  initialData?: Partial<Student360Profile>;
  departments: Department[];
  programs?: Program[];
  courses?: Course[];
  onClose: () => void;
  onSave: (studentData: Student360Profile) => void;
}

export const StudentProfileFormModal: React.FC<StudentProfileFormModalProps> = ({
  isOpen,
  mode,
  initialData,
  departments,
  programs = [],
  courses = [],
  onClose,
  onSave,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<
    'personal' | 'enrollment' | 'contact' | 'parents' | 'qualifications' | 'gpas' | 'skills' | 'deptActivities'
  >('personal');

  // Comprehensive Form State
  const [formData, setFormData] = useState<Partial<Student360Profile>>({
    id: initialData?.id || `stu-${Date.now()}`,
    studentId: initialData?.studentId || initialData?.prnNumber || `PRN2024${Math.floor(10000 + Math.random() * 90000)}`,
    prnNumber: initialData?.prnNumber || initialData?.studentId || `PRN2024${Math.floor(10000 + Math.random() * 90000)}`,
    rollNumber: initialData?.rollNumber || '',
    fullName: initialData?.fullName || '',
    email: initialData?.email || '',
    personalMobile: initialData?.personalMobile || '',
    whatsappNumber: initialData?.whatsappNumber || initialData?.personalMobile || '',
    departmentId: initialData?.departmentId || departments[0]?.id || 'dept-af',
    departmentName: initialData?.departmentName || departments[0]?.name || 'Department of Accounting and Finance',
    course: initialData?.course || 'B.Com Accounting and Finance',
    academicYear: initialData?.academicYear || initialData?.year || '2024-2025',
    year: initialData?.year || initialData?.academicYear || 'FY',
    semester: initialData?.semester || 1,
    division: initialData?.division || 'A',
    gender: initialData?.gender || 'Male',
    dob: initialData?.dob || '2005-01-01',
    bloodGroup: initialData?.bloodGroup || 'O+',
    category: initialData?.category || 'General',
    aadhaarNumber: initialData?.aadhaarNumber || '',
    abcId: initialData?.abcId || '',
    emergencyContact: initialData?.emergencyContact || '',
    permanentAddress: initialData?.permanentAddress || '',
    temporaryAddress: initialData?.temporaryAddress || '',
    
    // Parents
    fatherName: initialData?.fatherName || '',
    motherName: initialData?.motherName || '',
    guardianName: initialData?.guardianName || '',
    parentMobile: initialData?.parentMobile || initialData?.fatherMobile || '',
    fatherMobile: initialData?.fatherMobile || initialData?.parentMobile || '',
    motherMobile: initialData?.motherMobile || '',
    parentEmail: initialData?.parentEmail || '',
    parentOccupation: initialData?.parentOccupation || '',
    annualIncome: initialData?.annualIncome || '',

    // SSC & HSC
    sscSchoolName: initialData?.sscSchoolName || '',
    sscBoard: initialData?.sscBoard || 'Maharashtra State Board',
    sscPassingYear: initialData?.sscPassingYear || initialData?.sscYear || '2020',
    sscYear: initialData?.sscYear || initialData?.sscPassingYear || '2020',
    sscPercentage: initialData?.sscPercentage || 0,

    hscCollegeName: initialData?.hscCollegeName || '',
    hscBoard: initialData?.hscBoard || 'Maharashtra State Board',
    hscStream: initialData?.hscStream || 'Commerce',
    hscPassingYear: initialData?.hscPassingYear || initialData?.hscYear || '2022',
    hscYear: initialData?.hscYear || initialData?.hscPassingYear || '2022',
    hscPercentage: initialData?.hscPercentage || 0,

    // GPAs
    sem1Gpa: initialData?.sem1Gpa || 0,
    sem2Gpa: initialData?.sem2Gpa || 0,
    sem3Gpa: initialData?.sem3Gpa || 0,
    sem4Gpa: initialData?.sem4Gpa || 0,
    sem5Gpa: initialData?.sem5Gpa || 0,
    sem6Gpa: initialData?.sem6Gpa || 0,
    overallCgpa: initialData?.overallCgpa || 0,

    // Skills
    technicalSkills: initialData?.technicalSkills || [],
    programmingLanguages: initialData?.programmingLanguages || [],

    // Department Activities
    departmentActivities: initialData?.departmentActivities || [],

    // System
    admissionDate: initialData?.admissionDate || new Date().toISOString().substring(0, 10),
    passportPhoto: initialData?.passportPhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
    attendancePercentage: initialData?.attendancePercentage || 85,
    totalLectures: initialData?.totalLectures || 120,
    attendedLectures: initialData?.attendedLectures || 102,
    academicStatus: initialData?.academicStatus || 'Active',
  });

  const [techSkillsInput, setTechSkillsInput] = useState(
    (initialData?.technicalSkills || []).join(', ')
  );
  const [progLangsInput, setProgLangsInput] = useState(
    (initialData?.programmingLanguages || []).join(', ')
  );

  const [deptActivities, setDeptActivities] = useState<DepartmentActivity[]>(
    initialData?.departmentActivities || []
  );

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        studentId: initialData.studentId || initialData.prnNumber || `PRN2024${Math.floor(10000 + Math.random() * 90000)}`,
        prnNumber: initialData.prnNumber || initialData.studentId || `PRN2024${Math.floor(10000 + Math.random() * 90000)}`,
      });
      setTechSkillsInput((initialData.technicalSkills || []).join(', '));
      setProgLangsInput((initialData.programmingLanguages || []).join(', '));
      setDeptActivities(initialData.departmentActivities || []);
    }
  }, [initialData]);

  const handleAddActivity = () => {
    const newAct: DepartmentActivity = {
      id: `act-${Date.now()}`,
      type: 'Research Projects',
      title: '',
      date: new Date().toISOString().substring(0, 10),
      organizer: '',
      roleOrPosition: 'Participant',
      description: '',
      photoUrl: '',
      certificateUrl: '',
    };
    setDeptActivities([...deptActivities, newAct]);
  };

  const handleUpdateActivity = (index: number, updatedFields: Partial<DepartmentActivity>) => {
    const updated = [...deptActivities];
    updated[index] = { ...updated[index], ...updatedFields };
    setDeptActivities(updated);
  };

  const handleRemoveActivity = (index: number) => {
    setDeptActivities(deptActivities.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName?.trim() || !formData.rollNumber?.trim()) {
      alert('Full Name and Roll Number are required fields.');
      return;
    }

    const prn = formData.prnNumber || formData.studentId || `PRN2024${Math.floor(10000 + Math.random() * 90000)}`;

    const parsedTechSkills = techSkillsInput
      .split(/[,;]/)
      .map((s) => s.trim())
      .filter(Boolean);

    const parsedProgLangs = progLangsInput
      .split(/[,;]/)
      .map((s) => s.trim())
      .filter(Boolean);

    const finalStudent: Student360Profile = {
      id: formData.id || `stu-${Date.now()}`,
      studentId: prn,
      prnNumber: prn,
      rollNumber: formData.rollNumber || '',
      fullName: formData.fullName || '',
      gender: formData.gender || 'Male',
      dob: formData.dob || '2005-01-01',
      admissionDate: formData.admissionDate || new Date().toISOString().substring(0, 10),
      passportPhoto: formData.passportPhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
      bloodGroup: formData.bloodGroup || 'O+',
      category: formData.category || 'General',
      course: formData.course || 'B.Com Accounting and Finance',
      departmentId: formData.departmentId || departments[0]?.id || 'dept-af',
      departmentName: formData.departmentName || departments[0]?.name || 'Department of Accounting and Finance',
      semester: Number(formData.semester) || 1,
      division: formData.division || 'A',
      academicYear: formData.academicYear || '2024-2025',
      year: formData.year || 'FY',

      personalMobile: formData.personalMobile || '',
      whatsappNumber: formData.whatsappNumber || formData.personalMobile || '',
      email: formData.email || '',
      emergencyContact: formData.emergencyContact || '',
      permanentAddress: formData.permanentAddress || '',
      temporaryAddress: formData.temporaryAddress || formData.permanentAddress || '',

      fatherName: formData.fatherName || '',
      motherName: formData.motherName || '',
      guardianName: formData.guardianName || '',
      parentMobile: formData.parentMobile || '',
      parentEmail: formData.parentEmail || '',
      parentOccupation: formData.parentOccupation || '',
      annualIncome: formData.annualIncome || '',

      sscSchoolName: formData.sscSchoolName || '',
      sscBoard: formData.sscBoard || 'Maharashtra State Board',
      sscPassingYear: formData.sscPassingYear || formData.sscYear || '2020',
      sscYear: formData.sscYear || formData.sscPassingYear || '2020',
      sscPercentage: Number(formData.sscPercentage) || 0,

      hscCollegeName: formData.hscCollegeName || '',
      hscBoard: formData.hscBoard || 'Maharashtra State Board',
      hscStream: formData.hscStream || 'Commerce',
      hscPassingYear: formData.hscPassingYear || formData.hscYear || '2022',
      hscYear: formData.hscYear || formData.hscPassingYear || '2022',
      hscPercentage: Number(formData.hscPercentage) || 0,

      sem1Gpa: Number(formData.sem1Gpa) || 0,
      sem2Gpa: Number(formData.sem2Gpa) || 0,
      sem3Gpa: Number(formData.sem3Gpa) || 0,
      sem4Gpa: Number(formData.sem4Gpa) || 0,
      sem5Gpa: Number(formData.sem5Gpa) || 0,
      sem6Gpa: Number(formData.sem6Gpa) || 0,
      overallCgpa: Number(formData.overallCgpa) || 0,

      technicalSkills: parsedTechSkills,
      programmingLanguages: parsedProgLangs,
      departmentActivities: deptActivities,
      certifications: formData.certifications || [],
      internships: formData.internships || [],
      projects: formData.projects || [],
      sportsAndExtra: formData.sportsAndExtra || [],

      aadhaarNumber: formData.aadhaarNumber || '',
      abcId: formData.abcId || '',
      academicStatus: formData.academicStatus || 'Active',
      totalLectures: formData.totalLectures || 120,
      attendedLectures: formData.attendedLectures || 102,
      attendancePercentage: formData.attendancePercentage || 85,
    };

    onSave(finalStudent);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden my-8 max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold flex items-center space-x-2">
              <User className="w-5 h-5 text-indigo-400" />
              <span>{mode === 'create' ? 'Add New Student Profile' : `Edit Student Profile (${formData.fullName || formData.rollNumber})`}</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Enter comprehensive academic, personal, parent contact, qualification, skills, and department activities.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl bg-white/10 hover:bg-white/20 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Sub-Header Navigation */}
        <div className="border-b border-slate-200 bg-slate-50 px-5 py-2.5 flex items-center space-x-1.5 overflow-x-auto shadow-sm text-xs">
          {[
            { id: 'personal', label: '1. Personal & Identity', icon: User },
            { id: 'enrollment', label: '2. Course & Class', icon: BookOpen },
            { id: 'contact', label: '3. Contact & Address', icon: Phone },
            { id: 'parents', label: '4. Parents & Family', icon: Users },
            { id: 'qualifications', label: '5. SSC & HSC Marks', icon: GraduationCap },
            { id: 'gpas', label: '6. GPAs & CGPA', icon: Award },
            { id: 'skills', label: '7. Skills & Languages', icon: Wrench },
            { id: 'deptActivities', label: '8. Department Activities', icon: Award },
          ].map((tb) => {
            const Icon = tb.icon;
            return (
              <button
                key={tb.id}
                type="button"
                onClick={() => setActiveTab(tb.id as any)}
                className={`py-2 px-3 text-xs font-bold rounded-xl transition whitespace-nowrap flex items-center space-x-1.5 ${
                  activeTab === tb.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tb.label}</span>
              </button>
            );
          })}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden bg-slate-50">
          <div className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
            
            {/* TAB 1: Personal & Identity */}
            {activeTab === 'personal' && (
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-900 border-b pb-2">
                  Personal & Official Identification Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="md:col-span-2 lg:col-span-3 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 flex items-center space-x-4">
                    <div className="shrink-0">
                      {formData.passportPhoto ? (
                        <img src={formData.passportPhoto} className="w-16 h-16 rounded-xl object-cover border-2 border-indigo-300 shadow-sm" alt="Student Passport" />
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-slate-200 flex items-center justify-center text-slate-400">
                          <User className="w-8 h-8" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <label className="font-bold text-slate-800 block mb-1">Student Passport Photo (.jpg format only)</label>
                      <p className="text-[11px] text-slate-500 mb-2">Upload student photograph in .jpg format from your computer or camera</p>
                      <label className="cursor-pointer px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-sm transition inline-flex items-center space-x-1.5">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Choose .JPG Photo File</span>
                        <input
                          type="file"
                          accept="image/jpeg,.jpg,.jpeg"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              try {
                                const jpgDataUrl = await convertFileToJPGDataUrl(file);
                                setFormData({ ...formData, passportPhoto: jpgDataUrl });
                              } catch (err) {
                                alert('Please upload a valid .jpg photo file.');
                              }
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.fullName || ''}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="e.g. Aarav Rajesh Sharma"
                      className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">PRN / Student ID *</label>
                    <input
                      type="text"
                      required
                      value={formData.prnNumber || formData.studentId || ''}
                      onChange={(e) => setFormData({ ...formData, prnNumber: e.target.value, studentId: e.target.value })}
                      placeholder="e.g. 2024016400921201"
                      className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl font-mono font-bold focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Gender</label>
                    <select
                      value={formData.gender || 'Male'}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                      className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Date of Birth (DOB)</label>
                    <input
                      type="date"
                      value={formData.dob || ''}
                      onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Blood Group</label>
                    <select
                      value={formData.bloodGroup || 'O+'}
                      onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500"
                    >
                      {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((bg) => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Category</label>
                    <select
                      value={formData.category || 'General'}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                      className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="General">General</option>
                      <option value="OBC">OBC</option>
                      <option value="SC">SC</option>
                      <option value="ST">ST</option>
                      <option value="EWS">EWS</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Aadhaar Card Number</label>
                    <input
                      type="text"
                      value={formData.aadhaarNumber || ''}
                      onChange={(e) => setFormData({ ...formData, aadhaarNumber: e.target.value })}
                      placeholder="e.g. 9821-4402-1198"
                      className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl font-mono font-medium focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">ABC ID (Academic Bank of Credits)</label>
                    <input
                      type="text"
                      value={formData.abcId || ''}
                      onChange={(e) => setFormData({ ...formData, abcId: e.target.value })}
                      placeholder="e.g. ABC-8921-3301-4490"
                      className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl font-mono font-medium focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Academic Status</label>
                    <select
                      value={formData.academicStatus || 'Active'}
                      onChange={(e) => setFormData({ ...formData, academicStatus: e.target.value as any })}
                      className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="Active">Active</option>
                      <option value="Pass Out">Pass Out</option>
                      <option value="Alumni">Alumni</option>
                      <option value="Dropout">Dropout</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Course & Class */}
            {activeTab === 'enrollment' && (
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-900 border-b pb-2">
                  Academic Enrollment & Institutional Mapping
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Roll Number *</label>
                    <input
                      type="text"
                      required
                      value={formData.rollNumber || ''}
                      onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                      placeholder="e.g. 24AF09"
                      className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl font-bold focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Department *</label>
                    <select
                      value={formData.departmentId || 'dept-af'}
                      onChange={(e) => {
                        const val = e.target.value;
                        const deptName = val === 'dept-ba' || val === 'Business Analytics' ? 'Business Analytics' : 'Accounting & Finance';
                        setFormData({
                          ...formData,
                          departmentId: val,
                          departmentName: deptName,
                        });
                      }}
                      className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="dept-af">Accounting & Finance</option>
                      <option value="dept-ba">Business Analytics</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Degree Course *</label>
                    <select
                      value={formData.course || 'BAF'}
                      onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="BAF">BAF</option>
                      <option value="M.Com">M.Com</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Program / Level</label>
                    <select
                      value={formData.programName || (formData.course === 'M.Com' ? 'Postgraduate' : 'Undergraduate')}
                      onChange={(e) => setFormData({ ...formData, programName: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="Undergraduate">Undergraduate</option>
                      <option value="Postgraduate">Postgraduate</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Semester Number *</label>
                    <select
                      value={formData.semester || 1}
                      onChange={(e) => setFormData({ ...formData, semester: Number(e.target.value) })}
                      className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500"
                    >
                      {[1, 2, 3, 4, 5, 6].map((s) => (
                        <option key={s} value={s}>Semester {s}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Division / Section *</label>
                    <select
                      value={formData.division || 'A'}
                      onChange={(e) => setFormData({ ...formData, division: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="A">Division A</option>
                      <option value="B">Division B</option>
                      <option value="C">Division C</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Academic Cycle Year</label>
                    <input
                      type="text"
                      value={formData.academicYear || '2024-2025'}
                      onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                      placeholder="AY 2024-2025"
                      className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Admission Date</label>
                    <input
                      type="date"
                      value={formData.admissionDate || ''}
                      onChange={(e) => setFormData({ ...formData, admissionDate: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: Contact & Address */}
            {activeTab === 'contact' && (
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-900 border-b pb-2">
                  Student Direct Contact & Address Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Email Address *</label>
                    <input
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="student@cktcollege.edu.in"
                      className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Mobile Number *</label>
                    <input
                      type="text"
                      value={formData.personalMobile || ''}
                      onChange={(e) => setFormData({ ...formData, personalMobile: e.target.value })}
                      placeholder="+91 98765 00000"
                      className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">WhatsApp Number</label>
                    <input
                      type="text"
                      value={formData.whatsappNumber || ''}
                      onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                      placeholder="+91 98765 00000"
                      className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Emergency Contact Number</label>
                    <input
                      type="text"
                      value={formData.emergencyContact || ''}
                      onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                      placeholder="+91 98000 11122"
                      className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="font-bold text-slate-700 block mb-1">Permanent Address</label>
                    <textarea
                      rows={2}
                      value={formData.permanentAddress || ''}
                      onChange={(e) => setFormData({ ...formData, permanentAddress: e.target.value })}
                      placeholder="House/Flat No, Street, Landmark, City, District, Pincode, State"
                      className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="font-bold text-slate-700 block mb-1">Temporary / Local Address</label>
                    <textarea
                      rows={2}
                      value={formData.temporaryAddress || ''}
                      onChange={(e) => setFormData({ ...formData, temporaryAddress: e.target.value })}
                      placeholder="Local hostel or rental residence address"
                      className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: Parents & Family */}
            {activeTab === 'parents' && (
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-900 border-b pb-2">
                  Parent & Guardian Particulars
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Father Name</label>
                    <input
                      type="text"
                      value={formData.fatherName || ''}
                      onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                      placeholder="Father's full name"
                      className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Mother Name</label>
                    <input
                      type="text"
                      value={formData.motherName || ''}
                      onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                      placeholder="Mother's full name"
                      className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Guardian Name</label>
                    <input
                      type="text"
                      value={formData.guardianName || ''}
                      onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                      placeholder="Guardian name (if applicable)"
                      className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Parent Mobile Number</label>
                    <input
                      type="text"
                      value={formData.parentMobile || ''}
                      onChange={(e) => setFormData({ ...formData, parentMobile: e.target.value, fatherMobile: e.target.value })}
                      placeholder="+91 98221 00112"
                      className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Parent Email</label>
                    <input
                      type="email"
                      value={formData.parentEmail || ''}
                      onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
                      placeholder="parents@gmail.com"
                      className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Parent Occupation</label>
                    <input
                      type="text"
                      value={formData.parentOccupation || ''}
                      onChange={(e) => setFormData({ ...formData, parentOccupation: e.target.value })}
                      placeholder="e.g. Business / Government Service"
                      className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Annual Family Income</label>
                    <input
                      type="text"
                      value={formData.annualIncome || ''}
                      onChange={(e) => setFormData({ ...formData, annualIncome: e.target.value })}
                      placeholder="e.g. ₹ 5,50,000 / annum"
                      className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: Qualifications */}
            {activeTab === 'qualifications' && (
              <div className="space-y-4">
                {/* SSC */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-900 border-b pb-2">
                    Secondary School Certificate (SSC / 10th Standard)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">SSC School Name</label>
                      <input
                        type="text"
                        value={formData.sscSchoolName || ''}
                        onChange={(e) => setFormData({ ...formData, sscSchoolName: e.target.value })}
                        placeholder="School name"
                        className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">SSC Board</label>
                      <input
                        type="text"
                        value={formData.sscBoard || ''}
                        onChange={(e) => setFormData({ ...formData, sscBoard: e.target.value })}
                        placeholder="e.g. Maharashtra State Board / CBSE"
                        className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Passing Year (SSC Year)</label>
                      <input
                        type="text"
                        value={formData.sscPassingYear || formData.sscYear || ''}
                        onChange={(e) => setFormData({ ...formData, sscPassingYear: e.target.value, sscYear: e.target.value })}
                        placeholder="2020"
                        className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">SSC Percentage (%)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.sscPercentage || ''}
                        onChange={(e) => setFormData({ ...formData, sscPercentage: Number(e.target.value) })}
                        placeholder="88.5"
                        className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl font-bold text-emerald-700"
                      />
                    </div>
                  </div>
                </div>

                {/* HSC */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-900 border-b pb-2">
                    Higher Secondary Certificate (HSC / 12th Standard)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">HSC College Name</label>
                      <input
                        type="text"
                        value={formData.hscCollegeName || ''}
                        onChange={(e) => setFormData({ ...formData, hscCollegeName: e.target.value })}
                        placeholder="Junior college name"
                        className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">HSC Board</label>
                      <input
                        type="text"
                        value={formData.hscBoard || ''}
                        onChange={(e) => setFormData({ ...formData, hscBoard: e.target.value })}
                        placeholder="e.g. HSC Board"
                        className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">HSC Stream</label>
                      <input
                        type="text"
                        value={formData.hscStream || ''}
                        onChange={(e) => setFormData({ ...formData, hscStream: e.target.value })}
                        placeholder="Commerce / Science / Arts"
                        className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">HSC Year</label>
                      <input
                        type="text"
                        value={formData.hscPassingYear || formData.hscYear || ''}
                        onChange={(e) => setFormData({ ...formData, hscPassingYear: e.target.value, hscYear: e.target.value })}
                        placeholder="2022"
                        className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">HSC Percentage (%)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.hscPercentage || ''}
                        onChange={(e) => setFormData({ ...formData, hscPercentage: Number(e.target.value) })}
                        placeholder="85.2"
                        className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl font-bold text-indigo-700"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 6: GPAs & Performance */}
            {activeTab === 'gpas' && (
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-900 border-b pb-2">
                  Semester 1-6 GPAs & Cumulative CGPA Matrix
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Sem 1 GPA</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.sem1Gpa || ''}
                      onChange={(e) => setFormData({ ...formData, sem1Gpa: Number(e.target.value) })}
                      placeholder="8.50"
                      className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl font-semibold"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Sem 2 GPA</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.sem2Gpa || ''}
                      onChange={(e) => setFormData({ ...formData, sem2Gpa: Number(e.target.value) })}
                      placeholder="8.70"
                      className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl font-semibold"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Sem 3 GPA</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.sem3Gpa || ''}
                      onChange={(e) => setFormData({ ...formData, sem3Gpa: Number(e.target.value) })}
                      placeholder="8.80"
                      className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl font-semibold"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Sem 4 GPA</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.sem4Gpa || ''}
                      onChange={(e) => setFormData({ ...formData, sem4Gpa: Number(e.target.value) })}
                      placeholder="8.90"
                      className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl font-semibold"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Sem 5 GPA</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.sem5Gpa || ''}
                      onChange={(e) => setFormData({ ...formData, sem5Gpa: Number(e.target.value) })}
                      placeholder="8.60"
                      className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl font-semibold"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Sem 6 GPA</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.sem6Gpa || ''}
                      onChange={(e) => setFormData({ ...formData, sem6Gpa: Number(e.target.value) })}
                      placeholder="9.00"
                      className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl font-semibold"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-amber-900 block mb-1">Overall CGPA</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.overallCgpa || ''}
                      onChange={(e) => setFormData({ ...formData, overallCgpa: Number(e.target.value) })}
                      placeholder="8.75"
                      className="w-full bg-amber-50 border border-amber-300 p-2.5 rounded-xl font-bold text-amber-900"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 7: Skills & Languages */}
            {activeTab === 'skills' && (
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-900 border-b pb-2">
                  Technical Skills & Programming Languages
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Technical Skills (Comma separated)</label>
                    <textarea
                      rows={2}
                      value={techSkillsInput}
                      onChange={(e) => setTechSkillsInput(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl font-medium"
                      placeholder="Financial Accounting, Advanced Excel, Tally Prime, GST Return Filing"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Programming Languages & Tools (Comma separated)</label>
                    <textarea
                      rows={2}
                      value={progLangsInput}
                      onChange={(e) => setProgLangsInput(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl font-medium"
                      placeholder="Python for Finance, SQL, Power BI, Excel VBA"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 8: Department Activities */}
            {activeTab === 'deptActivities' && (
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-900">
                      Department Activities & Co-Curricular Involvement
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Add records for Research Projects, Seminars, Internships, Achievements, Awards, Competitions, Volunteer Activities, and Other.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddActivity}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-sm transition inline-flex items-center space-x-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Activity</span>
                  </button>
                </div>

                {deptActivities.length === 0 ? (
                  <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                    <Award className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="font-bold text-slate-600 text-xs">No Department Activities Added</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Click "Add Activity" above to record student projects, awards, or seminars.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {deptActivities.map((act, index) => (
                      <div key={act.id || index} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 relative">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-indigo-800 text-xs uppercase tracking-wider">
                            Activity #{index + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveActivity(index)}
                            className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
                            title="Remove Activity"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          <div>
                            <label className="font-bold text-slate-700 block mb-1">Category *</label>
                            <select
                              value={act.type}
                              onChange={(e) => handleUpdateActivity(index, { type: e.target.value as any })}
                              className="w-full bg-white border border-slate-300 p-2 rounded-xl font-bold text-slate-800"
                            >
                              <option value="Research Projects">Research Projects</option>
                              <option value="Seminars">Seminars</option>
                              <option value="Internships">Internships</option>
                              <option value="Achievements">Achievements</option>
                              <option value="Awards">Awards</option>
                              <option value="Competitions">Competitions</option>
                              <option value="Volunteer Activities">Volunteer Activities</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>

                          <div>
                            <label className="font-bold text-slate-700 block mb-1">Activity Title / Name *</label>
                            <input
                              type="text"
                              value={act.title}
                              onChange={(e) => handleUpdateActivity(index, { title: e.target.value })}
                              placeholder="e.g. FinTech AI Paper Presentation"
                              className="w-full bg-white border border-slate-300 p-2 rounded-xl font-medium"
                            />
                          </div>

                          <div>
                            <label className="font-bold text-slate-700 block mb-1">Date</label>
                            <input
                              type="date"
                              value={act.date}
                              onChange={(e) => handleUpdateActivity(index, { date: e.target.value })}
                              className="w-full bg-white border border-slate-300 p-2 rounded-xl font-medium"
                            />
                          </div>

                          <div>
                            <label className="font-bold text-slate-700 block mb-1">Organizer / Venue</label>
                            <input
                              type="text"
                              value={act.organizer}
                              onChange={(e) => handleUpdateActivity(index, { organizer: e.target.value })}
                              placeholder="e.g. Dept. of Accounting & Finance"
                              className="w-full bg-white border border-slate-300 p-2 rounded-xl font-medium"
                            />
                          </div>

                          <div>
                            <label className="font-bold text-slate-700 block mb-1">Role / Position</label>
                            <input
                              type="text"
                              value={act.roleOrPosition}
                              onChange={(e) => handleUpdateActivity(index, { roleOrPosition: e.target.value })}
                              placeholder="e.g. Winner / 1st Rank / Participant"
                              className="w-full bg-white border border-slate-300 p-2 rounded-xl font-medium"
                            />
                          </div>

                          <div>
                            <label className="font-bold text-slate-700 block mb-1">Activity Photo (.jpg format)</label>
                            <div className="flex items-center space-x-2">
                              {act.photoUrl ? (
                                <img src={act.photoUrl} alt="Activity" className="w-9 h-9 rounded-lg object-cover border border-slate-300 shrink-0" />
                              ) : null}
                              <label className="cursor-pointer px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl text-xs border border-indigo-200 transition inline-flex items-center space-x-1">
                                <Upload className="w-3.5 h-3.5" />
                                <span>Upload JPG</span>
                                <input
                                  type="file"
                                  accept="image/jpeg,image/jpg,image/png,.jpg,.jpeg"
                                  className="hidden"
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      const jpgDataUrl = await convertFileToJPGDataUrl(file);
                                      handleUpdateActivity(index, { photoUrl: jpgDataUrl });
                                    }
                                  }}
                                />
                              </label>
                            </div>
                          </div>

                          <div className="md:col-span-2 lg:col-span-3">
                            <label className="font-bold text-slate-700 block mb-1">Description & Key Outcomes</label>
                            <textarea
                              rows={2}
                              value={act.description || ''}
                              onChange={(e) => handleUpdateActivity(index, { description: e.target.value })}
                              placeholder="Brief description of the activity and achievements..."
                              className="w-full bg-white border border-slate-300 p-2 rounded-xl font-medium"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Footer Actions */}
          <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg transition flex items-center space-x-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{mode === 'create' ? 'Save New Student Record' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
