import React, { useState } from 'react';
import { Student360Profile, Faculty, Subject, TimetableSlot, ImportHistoryLog, DepartmentActivity } from '../types';
import {
  Upload,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  History,
  FileText,
  Trash2,
  RefreshCw,
  Users,
  UserCheck,
  UserCog,
  Award,
  BookOpen,
  Calendar,
} from 'lucide-react';

interface BulkUploadModuleProps {
  onImportSuccess: (importedStudents: Partial<Student360Profile>[]) => void;
  onImportFacultySuccess?: (importedFaculty: Partial<Faculty>[]) => void;
  onImportSubjectsSuccess?: (importedSubjects: Partial<Subject>[]) => void;
  onImportTimetableSuccess?: (importedSlots: Partial<TimetableSlot>[]) => void;
  importLogs: ImportHistoryLog[];
}

interface ParsedStudentRow {
  rowNum: number;
  studentId: string; // PRN
  fullName: string;
  email: string;
  personalMobile: string;
  whatsappNumber: string;
  departmentName: string;
  course: string;
  academicYear: string;
  semester: number;
  division: string;
  rollNumber: string;
  gender: string;
  dob: string;
  bloodGroup: string;
  category: string;
  aadhaarNumber: string;
  abcId: string;
  emergencyContact: string;
  permanentAddress: string;
  fatherName: string;
  motherName: string;
  guardianName: string;
  parentMobile: string;
  parentEmail: string;
  parentOccupation: string;
  annualIncome: string;
  sscSchoolName: string;
  sscBoard: string;
  sscPassingYear: string;
  sscPercentage: number;
  hscCollegeName: string;
  hscBoard: string;
  hscStream: string;
  hscPassingYear: string;
  hscPercentage: number;
  sem1Gpa: number;
  sem2Gpa: number;
  sem3Gpa: number;
  sem4Gpa: number;
  sem5Gpa: number;
  sem6Gpa: number;
  overallCgpa: number;
  technicalSkills: string[];
  programmingLanguages: string[];
  departmentActivities: DepartmentActivity[];
  isValid: boolean;
  errors: string[];
}

interface ParsedFacultyRow {
  rowNum: number;
  facultyId: string;
  fullName: string;
  email: string;
  mobile: string;
  designation: 'Professor' | 'Associate Professor' | 'Assistant Professor' | 'Lecturer';
  departmentName: string;
  qualification: string;
  experienceYears: number;
  weeklyWorkloadHours: number;
  photo: string;
  allocatedSubjects: string[];
  isValid: boolean;
  errors: string[];
}

interface ParsedSubjectRow {
  rowNum: number;
  code: string;
  name: string;
  departmentName: string;
  semester: number;
  credits: number;
  type: string;
  division: string;
  assignedFacultyName: string;
  isValid: boolean;
  errors: string[];
}

interface ParsedTimetableRow {
  rowNum: number;
  day: string;
  timeSlot: string;
  subjectCode: string;
  subjectName: string;
  facultyName: string;
  classroom: string;
  departmentName: string;
  semester: number;
  division: string;
  type: string;
  isValid: boolean;
  errors: string[];
}

export const BulkUploadModule: React.FC<BulkUploadModuleProps> = ({
  onImportSuccess,
  onImportFacultySuccess,
  onImportSubjectsSuccess,
  onImportTimetableSuccess,
  importLogs,
}) => {
  const [importCategory, setImportCategory] = useState<'students' | 'faculty' | 'subjects' | 'timetable'>('students');
  const [file, setFile] = useState<File | null>(null);
  const [parsedStudentRows, setParsedStudentRows] = useState<ParsedStudentRow[]>([]);
  const [parsedFacultyRows, setParsedFacultyRows] = useState<ParsedFacultyRow[]>([]);
  const [parsedSubjectRows, setParsedSubjectRows] = useState<ParsedSubjectRow[]>([]);
  const [parsedTimetableRows, setParsedTimetableRows] = useState<ParsedTimetableRow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'upload' | 'history'>('upload');
  const [previewTab, setPreviewTab] = useState<'basic' | 'parents' | 'academics' | 'skills' | 'activities'>('basic');

  // Sample CSV Downloads
  const handleDownloadSampleStudentCSV = () => {
    const headers = [
      'PRN',
      'Full Name',
      'Email',
      'Mobile',
      'WhatsApp',
      'Department',
      'Course',
      'Academic Year',
      'Semester',
      'Division',
      'Roll Number',
      'Gender',
      'DOB',
      'Blood Group',
      'Category',
      'Aadhaar Number',
      'ABC ID',
      'Emergency Contact',
      'Permanent Address',
      'Father Name',
      'Mother Name',
      'Guardian Name',
      'Parent Mobile',
      'Parent Email',
      'Parent Occupation',
      'Annual Income',
      'SSC School',
      'SSC Board',
      'SSC Year',
      'SSC %',
      'HSC College',
      'HSC Board',
      'HSC Stream',
      'HSC Year',
      'HSC %',
      'Sem1 GPA',
      'Sem2 GPA',
      'Sem3 GPA',
      'Sem4 GPA',
      'Sem5 GPA',
      'Sem6 GPA',
      'Overall CGPA',
      'Technical Skills',
      'Programming Languages',
    ].join(',');

    const row1 = [
      'PRN2026101',
      'Aarav Vijay Sharma',
      'aarav.sharma@cktcollege.edu.in',
      '9820112233',
      '9820112233',
      'Commerce & Management',
      'B.Com (Accounting & Finance)',
      'TY',
      '5',
      'A',
      '26BA01',
      'Male',
      '2004-05-15',
      'B+',
      'General',
      '9821-4402-1198',
      'ABC-8921-3301-4490',
      '+91 98201 12233',
      'Sector 12, New Panvel, Navi Mumbai 410206',
      'Vijay Sharma',
      'Sunita Sharma',
      'N/A',
      '9820110011',
      'vijay.s@gmail.com',
      'Senior Accountant',
      '₹ 8,50,000 / annum',
      'New Panvel High School',
      'CBSE',
      '2020',
      '88.5',
      'CKT Junior College',
      'HSC',
      'Commerce',
      '2022',
      '86.0',
      '8.20',
      '8.40',
      '8.50',
      '8.60',
      '8.80',
      '9.00',
      '8.58',
      'Financial Accounting; Tally Prime; Advanced Excel',
      'Python; SQL',
    ].map((v) => `"${v}"`).join(',');

    const row2 = [
      'PRN2026102',
      'Ananya Suresh Deshmukh',
      'ananya.d@cktcollege.edu.in',
      '9820112234',
      '9820112234',
      'Commerce & Management',
      'B.Com (Accounting & Finance)',
      'TY',
      '5',
      'A',
      '26BA02',
      'Female',
      '2004-08-22',
      'O+',
      'OBC',
      '9821-4402-1199',
      'ABC-8921-3301-4491',
      '+91 98201 12234',
      'Plot 12, Sector 15, Kharghar, Navi Mumbai 410210',
      'Suresh Deshmukh',
      'Priya Deshmukh',
      'N/A',
      '9820110022',
      'suresh.d@gmail.com',
      'Bank Manager',
      '₹ 9,00,000 / annum',
      'St. Joseph Convent School',
      'ICSE',
      '2020',
      '91.2',
      'CKT Junior College',
      'HSC',
      'Commerce',
      '2022',
      '89.4',
      '8.90',
      '9.10',
      '9.00',
      '9.20',
      '9.30',
      '9.40',
      '9.15',
      'Corporate Tax; Auditing; Power BI; Advanced Excel',
      'R Analytics; SQL',
    ].map((v) => `"${v}"`).join(',');

    const csvContent = `${headers}\n${row1}\n${row2}\n`;
    downloadCSVFile(csvContent, 'Student_Bulk_Import_Sample_Template.csv');
  };

  const handleDownloadSampleFacultyCSV = () => {
    const headers = [
      'Faculty ID',
      'Full Name',
      'Email',
      'Mobile',
      'Designation',
      'Department',
      'Qualification',
      'Experience Years',
      'Weekly Workload Hours',
      'Photo',
      'Allocated Subjects',
    ].join(',');

    const row1 = [
      'FAC104',
      'Prof. Rajesh K. Varma',
      'prof.varma@cktcollege.edu.in',
      '9820566778',
      'Assistant Professor',
      'Department of Accounting & Finance',
      'M.Com, NET, SET, Ph.D.',
      '9',
      '18',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
      'Financial Accounting V; Auditing',
    ].map((v) => `"${v}"`).join(',');

    const row2 = [
      'FAC105',
      'Dr. Meenakshi Joshi',
      'dr.joshi@cktcollege.edu.in',
      '9820599887',
      'Associate Professor',
      'Department of Accounting & Finance',
      'Ph.D. Financial Economics, M.Com',
      '14',
      '16',
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200',
      'Cost Accounting II; Business Analytics',
    ].map((v) => `"${v}"`).join(',');

    const csvContent = `${headers}\n${row1}\n${row2}\n`;
    downloadCSVFile(csvContent, 'Faculty_Bulk_Import_Sample_Template.csv');
  };

  const handleDownloadSampleSubjectCSV = () => {
    const headers = [
      'Subject Code',
      'Subject Name',
      'Department',
      'Semester',
      'Credits',
      'Type',
      'Division',
      'Assigned Faculty',
    ].join(',');

    const row1 = [
      'AF101',
      'Financial Accounting I',
      'Department of Accounting & Finance',
      '1',
      '4',
      'Theory',
      'All Divisions',
      'Prof. Rajesh K. Varma',
    ].map((v) => `"${v}"`).join(',');

    const row2 = [
      'AF102',
      'Cost Accounting I',
      'Department of Accounting & Finance',
      '1',
      '4',
      'Theory',
      'All Divisions',
      'Dr. Meenakshi Joshi',
    ].map((v) => `"${v}"`).join(',');

    const csvContent = `${headers}\n${row1}\n${row2}\n`;
    downloadCSVFile(csvContent, 'Subjects_Bulk_Import_Sample_Template.csv');
  };

  const handleDownloadSampleTimetableCSV = () => {
    const headers = [
      'Day',
      'Time Slot',
      'Subject Code',
      'Subject Name',
      'Faculty Name',
      'Classroom',
      'Department',
      'Semester',
      'Division',
      'Type',
    ].join(',');

    const row1 = [
      'Monday',
      '07:50 AM - 08:50 AM',
      'AF101',
      'Financial Accounting I',
      'Prof. Rajesh K. Varma',
      'Room 201',
      'Department of Accounting & Finance',
      '1',
      'A',
      'Lecture',
    ].map((v) => `"${v}"`).join(',');

    const row2 = [
      'Monday',
      '08:50 AM - 09:50 AM',
      'AF102',
      'Cost Accounting I',
      'Dr. Meenakshi Joshi',
      'Room 202',
      'Department of Accounting & Finance',
      '1',
      'A',
      'Lecture',
    ].map((v) => `"${v}"`).join(',');

    const csvContent = `${headers}\n${row1}\n${row2}\n`;
    downloadCSVFile(csvContent, 'Timetable_Bulk_Import_Sample_Template.csv');
  };

  const downloadCSVFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"' || char === "'") {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim().replace(/^["']|["']$/g, ''));
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim().replace(/^["']|["']$/g, ''));
    return result;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (importCategory === 'students') {
        parseStudentCSV(text);
      } else if (importCategory === 'faculty') {
        parseFacultyCSV(text);
      } else if (importCategory === 'subjects') {
        parseSubjectCSV(text);
      } else if (importCategory === 'timetable') {
        parseTimetableCSV(text);
      }
      setIsProcessing(false);
    };
    reader.readAsText(uploadedFile);
  };

  const parseStudentCSV = (csvText: string) => {
    const lines = csvText.split(/\r\n|\n/).filter((line) => line.trim().length > 0);
    if (lines.length < 2) {
      alert('The uploaded CSV file appears to be empty or missing headers.');
      return;
    }

    const headerCols = parseCSVLine(lines[0]).map((h) => h.toLowerCase().trim());

    const getVal = (cols: string[], possibleHeaders: string[], fallbackIdx: number, defaultVal: string = ''): string => {
      if (headerCols.length > 0) {
        for (const h of possibleHeaders) {
          const idx = headerCols.findIndex((hdr) => hdr.includes(h.toLowerCase()));
          if (idx !== -1 && cols[idx] !== undefined && cols[idx].trim() !== '') {
            return cols[idx].trim();
          }
        }
      }
      if (headerCols.length === 0 && fallbackIdx >= 0 && cols[fallbackIdx] !== undefined && cols[fallbackIdx].trim() !== '') {
        return cols[fallbackIdx].trim();
      }
      return defaultVal;
    };

    const rows: ParsedStudentRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = parseCSVLine(lines[i]);
      if (cols.length < 2) continue;

      const rawPrn = getVal(cols, ['prn', 'student id', 'student_id', 'student_code', 'enrollment'], -1, '');
      const prn = rawPrn || `STU${1000 + i}`;
      const name = getVal(cols, ['full name', 'fullname', 'name', 'student name', 'student_name'], 0, `Student ${i}`);
      const email = getVal(cols, ['email', 'email address', 'email_id', 'mail'], 1, `student${i}@cktcollege.edu.in`);
      const mobile = getVal(cols, ['mobile', 'phone', 'personal mobile', 'contact'], 2, '9820000000');
      const whatsapp = getVal(cols, ['whatsapp'], 3, mobile);
      const dept = getVal(cols, ['department', 'dept', 'branch', 'stream'], 4, 'Department of Accounting & Finance');
      const course = getVal(cols, ['course', 'program', 'degree'], 5, 'B.Com (Accounting & Finance)');
      const year = getVal(cols, ['academic year', 'year'], 6, 'TY');
      const sem = parseInt(getVal(cols, ['semester', 'sem'], 7, '5'), 10) || 5;
      const div = getVal(cols, ['division', 'div', 'section'], 8, 'A');
      const roll = getVal(cols, ['roll number', 'roll', 'rollno', 'roll_no', 'roll no'], 9, `${i}`);
      const gender = getVal(cols, ['gender', 'sex'], 11, 'Male');
      const dob = getVal(cols, ['dob', 'date of birth'], 12, '2004-05-15');
      const bloodGroup = getVal(cols, ['blood group', 'bloodgroup', 'blood'], 13, 'B+');
      const category = getVal(cols, ['category', 'caste'], 14, 'General');
      const aadhaar = getVal(cols, ['aadhaar', 'aadhaar number', 'aadhar'], 15, '9821-4402-1198');
      const abcId = getVal(cols, ['abc id', 'abc_id', 'abc'], 16, 'ABC-8921-3301-4490');
      const emergency = getVal(cols, ['emergency', 'emergency contact'], 17, mobile);
      const address = getVal(cols, ['permanent address', 'address'], 18, 'Panvel, Navi Mumbai, Maharashtra');

      const fatherName = getVal(cols, ['father name', 'father'], 19, `Father of ${name}`);
      const motherName = getVal(cols, ['mother name', 'mother'], 20, `Mother of ${name}`);
      const guardianName = getVal(cols, ['guardian name', 'guardian'], 21, 'N/A');
      const parentMobile = getVal(cols, ['parent mobile', 'parent phone'], 22, mobile);
      const parentEmail = getVal(cols, ['parent email'], 23, email);
      const parentOcc = getVal(cols, ['parent occupation', 'occupation'], 24, 'Business / Service');
      const income = getVal(cols, ['annual income', 'income'], 25, '₹ 6,50,000 / annum');

      const sscSchool = getVal(cols, ['ssc school', '10th school'], 26, 'New Panvel High School');
      const sscBoard = getVal(cols, ['ssc board', '10th board'], 27, 'Maharashtra State Board');
      const sscYear = getVal(cols, ['ssc year', 'ssc passing year'], 28, '2020');
      const sscPct = parseFloat(getVal(cols, ['ssc %', 'ssc percentage', '10th %'], 29, '85')) || 85;

      const hscCollege = getVal(cols, ['hsc college', '12th college'], 30, 'CKT Junior College');
      const hscBoard = getVal(cols, ['hsc board', '12th board'], 31, 'HSC');
      const hscStream = getVal(cols, ['hsc stream', 'stream'], 32, 'Commerce');
      const hscYear = getVal(cols, ['hsc year', 'hsc passing year'], 33, '2022');
      const hscPct = parseFloat(getVal(cols, ['hsc %', 'hsc percentage', '12th %'], 34, '82')) || 82;

      const sem1Gpa = parseFloat(getVal(cols, ['sem1 gpa', 'sem 1 gpa', 'sem 1'], 35, '8.2')) || 8.2;
      const sem2Gpa = parseFloat(getVal(cols, ['sem2 gpa', 'sem 2 gpa', 'sem 2'], 36, '8.4')) || 8.4;
      const sem3Gpa = parseFloat(getVal(cols, ['sem3 gpa', 'sem 3 gpa', 'sem 3'], 37, '8.5')) || 8.5;
      const sem4Gpa = parseFloat(getVal(cols, ['sem4 gpa', 'sem 4 gpa', 'sem 4'], 38, '8.6')) || 8.6;
      const sem5Gpa = parseFloat(getVal(cols, ['sem5 gpa', 'sem 5 gpa', 'sem 5'], 39, '8.8')) || 8.8;
      const sem6Gpa = parseFloat(getVal(cols, ['sem6 gpa', 'sem 6 gpa', 'sem 6'], 40, '9.0')) || 9.0;
      const overallCgpa = parseFloat(getVal(cols, ['overall cgpa', 'cgpa'], 41, '8.5')) || 8.5;

      const techSkillsRaw = getVal(cols, ['technical skills', 'skills'], 42, 'Financial Analysis; Tally Prime; Excel');
      const progLangsRaw = getVal(cols, ['programming languages', 'languages'], 43, 'Python; SQL');

      const techSkills = techSkillsRaw.split(/[;,]/).map((s) => s.trim()).filter(Boolean);
      const progLangs = progLangsRaw.split(/[;,]/).map((s) => s.trim()).filter(Boolean);

      // Department Activities Parsing
      const deptActivities: DepartmentActivity[] = [];

      const resProjects = getVal(cols, ['research projects', 'research project', 'research'], 44, '');
      if (resProjects) {
        deptActivities.push({
          id: `act-res-${Date.now()}-${i}`,
          type: 'Research Projects',
          title: resProjects,
          date: new Date().toISOString().substring(0, 10),
          organizer: dept,
          roleOrPosition: 'Researcher / Lead',
          description: resProjects,
        });
      }

      const seminars = getVal(cols, ['seminars', 'seminar'], 45, '');
      if (seminars) {
        deptActivities.push({
          id: `act-sem-${Date.now()}-${i}`,
          type: 'Seminars',
          title: seminars,
          date: new Date().toISOString().substring(0, 10),
          organizer: dept,
          roleOrPosition: 'Participant',
          description: seminars,
        });
      }

      const internshipsCol = getVal(cols, ['internships', 'internship'], 46, '');
      if (internshipsCol) {
        deptActivities.push({
          id: `act-int-${Date.now()}-${i}`,
          type: 'Internships',
          title: internshipsCol,
          date: new Date().toISOString().substring(0, 10),
          organizer: dept,
          roleOrPosition: 'Intern',
          description: internshipsCol,
        });
      }

      const achievements = getVal(cols, ['achievements', 'achievement'], 47, '');
      if (achievements) {
        deptActivities.push({
          id: `act-ach-${Date.now()}-${i}`,
          type: 'Achievements',
          title: achievements,
          date: new Date().toISOString().substring(0, 10),
          organizer: dept,
          roleOrPosition: 'Achiever',
          description: achievements,
        });
      }

      const awards = getVal(cols, ['awards', 'award'], 48, '');
      if (awards) {
        deptActivities.push({
          id: `act-awd-${Date.now()}-${i}`,
          type: 'Awards',
          title: awards,
          date: new Date().toISOString().substring(0, 10),
          organizer: dept,
          roleOrPosition: 'Awardee',
          description: awards,
        });
      }

      const competitions = getVal(cols, ['competitions', 'competition'], 49, '');
      if (competitions) {
        deptActivities.push({
          id: `act-cmp-${Date.now()}-${i}`,
          type: 'Competitions',
          title: competitions,
          date: new Date().toISOString().substring(0, 10),
          organizer: dept,
          roleOrPosition: 'Participant',
          description: competitions,
        });
      }

      const volunteer = getVal(cols, ['volunteer activities', 'volunteer', 'nss'], 50, '');
      if (volunteer) {
        deptActivities.push({
          id: `act-vol-${Date.now()}-${i}`,
          type: 'Volunteer Activities',
          title: volunteer,
          date: new Date().toISOString().substring(0, 10),
          organizer: dept,
          roleOrPosition: 'Volunteer',
          description: volunteer,
        });
      }

      const otherAct = getVal(cols, ['other activities', 'other activity', 'other'], 51, '');
      if (otherAct) {
        deptActivities.push({
          id: `act-oth-${Date.now()}-${i}`,
          type: 'Other',
          title: otherAct,
          date: new Date().toISOString().substring(0, 10),
          organizer: dept,
          roleOrPosition: 'Participant',
          description: otherAct,
        });
      }

      const generalDeptAct = getVal(cols, ['department activities', 'dept activities'], 52, '');
      if (generalDeptAct) {
        const items = generalDeptAct.split(';');
        items.forEach((item, idx) => {
          const trimmed = item.trim();
          if (!trimmed) return;
          let type: any = 'Other';
          let title = trimmed;
          if (trimmed.includes(':')) {
            const parts = trimmed.split(':');
            const catKey = parts[0].trim().toLowerCase();
            title = parts.slice(1).join(':').trim();
            if (catKey.includes('research')) type = 'Research Projects';
            else if (catKey.includes('seminar')) type = 'Seminars';
            else if (catKey.includes('intern')) type = 'Internships';
            else if (catKey.includes('achieve')) type = 'Achievements';
            else if (catKey.includes('award')) type = 'Awards';
            else if (catKey.includes('compet')) type = 'Competitions';
            else if (catKey.includes('volunt')) type = 'Volunteer Activities';
          }
          deptActivities.push({
            id: `act-gen-${Date.now()}-${i}-${idx}`,
            type,
            title: title || trimmed,
            date: new Date().toISOString().substring(0, 10),
            organizer: dept,
            roleOrPosition: 'Participant',
            description: title || trimmed,
          });
        });
      }

      const errors: string[] = [];
      if (!prn) errors.push('PRN Number is required');
      if (!name) errors.push('Full Name is required');
      if (!email || !email.includes('@')) errors.push('Valid Email Address is required');

      rows.push({
        rowNum: i,
        studentId: prn,
        fullName: name,
        email,
        personalMobile: mobile,
        whatsappNumber: whatsapp,
        departmentName: dept,
        course,
        academicYear: year,
        semester: sem,
        division: div,
        rollNumber: roll,
        gender,
        dob,
        bloodGroup,
        category,
        aadhaarNumber: aadhaar,
        abcId,
        emergencyContact: emergency,
        permanentAddress: address,
        fatherName,
        motherName,
        guardianName,
        parentMobile,
        parentEmail,
        parentOccupation: parentOcc,
        annualIncome: income,
        sscSchoolName: sscSchool,
        sscBoard,
        sscPassingYear: sscYear,
        sscPercentage: sscPct,
        hscCollegeName: hscCollege,
        hscBoard,
        hscStream,
        hscPassingYear: hscYear,
        hscPercentage: hscPct,
        sem1Gpa,
        sem2Gpa,
        sem3Gpa,
        sem4Gpa,
        sem5Gpa,
        sem6Gpa,
        overallCgpa,
        technicalSkills: techSkills,
        programmingLanguages: progLangs,
        departmentActivities: deptActivities,
        isValid: errors.length === 0,
        errors,
      });
    }

    setParsedStudentRows(rows);
  };

  const parseFacultyCSV = (csvText: string) => {
    const lines = csvText.split(/\r\n|\n/).filter((line) => line.trim().length > 0);
    if (lines.length < 2) {
      alert('The uploaded Faculty CSV file appears to be empty or missing headers.');
      return;
    }

    const headerCols = parseCSVLine(lines[0]).map((h) => h.toLowerCase().trim());

    const getVal = (cols: string[], possibleHeaders: string[], fallbackIdx: number, defaultVal: string = ''): string => {
      for (const h of possibleHeaders) {
        const idx = headerCols.findIndex((hdr) => hdr.includes(h.toLowerCase()));
        if (idx !== -1 && cols[idx] !== undefined) {
          return cols[idx].trim();
        }
      }
      return cols[fallbackIdx] !== undefined ? cols[fallbackIdx].trim() : defaultVal;
    };

    const rows: ParsedFacultyRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = parseCSVLine(lines[i]);
      if (cols.length < 2) continue;

      const facultyId = getVal(cols, ['faculty id', 'employee id', 'fac id'], 0, `FAC${100 + i}`);
      const fullName = getVal(cols, ['full name', 'name', 'faculty name'], 1);
      const email = getVal(cols, ['email', 'email address'], 2);
      const mobile = getVal(cols, ['mobile', 'phone'], 3, '+91 98200 00000');
      const designationRaw = getVal(cols, ['designation', 'post', 'role'], 4, 'Assistant Professor');
      const departmentName = getVal(cols, ['department', 'dept'], 5, 'Department of Accounting & Finance');
      const qualification = getVal(cols, ['qualification', 'degree'], 6, 'M.Com, NET, SET');
      const expYears = parseInt(getVal(cols, ['experience', 'experience years', 'exp'], 7, '6'), 10) || 6;
      const workload = parseInt(getVal(cols, ['weekly workload', 'workload hours', 'hours'], 8, '16'), 10) || 16;
      const photo = getVal(cols, ['photo', 'photo url', 'pic'], 9, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200');
      const allocatedSubjectsRaw = getVal(cols, ['allocated subjects', 'subjects'], 10, 'Financial Accounting; Auditing');

      let designation: 'Professor' | 'Associate Professor' | 'Assistant Professor' | 'Lecturer' = 'Assistant Professor';
      if (designationRaw.toLowerCase().includes('assoc')) designation = 'Associate Professor';
      else if (designationRaw.toLowerCase().includes('prof') && !designationRaw.toLowerCase().includes('asst')) designation = 'Professor';
      else if (designationRaw.toLowerCase().includes('lecturer')) designation = 'Lecturer';

      const allocatedSubjects = allocatedSubjectsRaw.split(/[;,]/).map((s) => s.trim()).filter(Boolean);

      const errors: string[] = [];
      if (!fullName) errors.push('Full Name is required');
      if (!email || !email.includes('@')) errors.push('Valid Email Address is required');

      rows.push({
        rowNum: i,
        facultyId,
        fullName,
        email,
        mobile,
        designation,
        departmentName,
        qualification,
        experienceYears: expYears,
        weeklyWorkloadHours: workload,
        photo,
        allocatedSubjects,
        isValid: errors.length === 0,
        errors,
      });
    }

    setParsedFacultyRows(rows);
  };

  const parseSubjectCSV = (csvText: string) => {
    const lines = csvText.split(/\r\n|\n/).filter((line) => line.trim().length > 0);
    if (lines.length < 2) {
      alert('The uploaded Subjects CSV file appears to be empty or missing headers.');
      return;
    }

    const headerCols = parseCSVLine(lines[0]).map((h) => h.toLowerCase().trim());

    const getVal = (cols: string[], possibleHeaders: string[], fallbackIdx: number, defaultVal: string = ''): string => {
      for (const h of possibleHeaders) {
        const idx = headerCols.findIndex((hdr) => hdr.includes(h.toLowerCase()));
        if (idx !== -1 && cols[idx] !== undefined) {
          return cols[idx].trim();
        }
      }
      return cols[fallbackIdx] !== undefined ? cols[fallbackIdx].trim() : defaultVal;
    };

    const rows: ParsedSubjectRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = parseCSVLine(lines[i]);
      if (cols.length < 2) continue;

      const code = getVal(cols, ['subject code', 'code', 'sub code'], 0, `SUB${100 + i}`);
      const name = getVal(cols, ['subject name', 'name', 'subject'], 1);
      const departmentName = getVal(cols, ['department', 'dept'], 2, 'Department of Accounting & Finance');
      const sem = parseInt(getVal(cols, ['semester', 'sem'], 3, '1'), 10) || 1;
      const credits = parseInt(getVal(cols, ['credits', 'credit'], 4, '4'), 10) || 4;
      const type = getVal(cols, ['type', 'subject type'], 5, 'Theory');
      const division = getVal(cols, ['division', 'div'], 6, 'All Divisions');
      const faculty = getVal(cols, ['assigned faculty', 'faculty', 'professor'], 7, 'Faculty Instructor');

      const errors: string[] = [];
      if (!name) errors.push('Subject Name is required');
      if (!code) errors.push('Subject Code is required');

      rows.push({
        rowNum: i,
        code,
        name,
        departmentName,
        semester: sem,
        credits,
        type,
        division,
        assignedFacultyName: faculty,
        isValid: errors.length === 0,
        errors,
      });
    }

    setParsedSubjectRows(rows);
  };

  const parseTimetableCSV = (csvText: string) => {
    const lines = csvText.split(/\r\n|\n/).filter((line) => line.trim().length > 0);
    if (lines.length < 2) {
      alert('The uploaded Timetable CSV file appears to be empty or missing headers.');
      return;
    }

    const headerCols = parseCSVLine(lines[0]).map((h) => h.toLowerCase().trim());

    const getVal = (cols: string[], possibleHeaders: string[], fallbackIdx: number, defaultVal: string = ''): string => {
      for (const h of possibleHeaders) {
        const idx = headerCols.findIndex((hdr) => hdr.includes(h.toLowerCase()));
        if (idx !== -1 && cols[idx] !== undefined) {
          return cols[idx].trim();
        }
      }
      return cols[fallbackIdx] !== undefined ? cols[fallbackIdx].trim() : defaultVal;
    };

    const rows: ParsedTimetableRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = parseCSVLine(lines[i]);
      if (cols.length < 3) continue;

      const day = getVal(cols, ['day', 'weekday'], 0, 'Monday');
      const timeSlot = getVal(cols, ['time slot', 'time', 'slot'], 1, '07:50 AM - 08:50 AM');
      const subjectCode = getVal(cols, ['subject code', 'code'], 2, 'AF101');
      const subjectName = getVal(cols, ['subject name', 'subject'], 3, 'Financial Accounting I');
      const facultyName = getVal(cols, ['faculty name', 'faculty', 'professor'], 4, 'Faculty Instructor');
      const classroom = getVal(cols, ['classroom', 'room'], 5, 'Room 201');
      const departmentName = getVal(cols, ['department', 'dept'], 6, 'Department of Accounting & Finance');
      const sem = parseInt(getVal(cols, ['semester', 'sem'], 7, '1'), 10) || 1;
      const division = getVal(cols, ['division', 'div'], 8, 'A');
      const type = getVal(cols, ['type', 'lecture type'], 9, 'Lecture');

      const errors: string[] = [];
      if (!day) errors.push('Day is required');
      if (!timeSlot) errors.push('Time Slot is required');
      if (!subjectName && !subjectCode) errors.push('Subject Name/Code is required');

      rows.push({
        rowNum: i,
        day,
        timeSlot,
        subjectCode,
        subjectName,
        facultyName,
        classroom,
        departmentName,
        semester: sem,
        division,
        type,
        isValid: errors.length === 0,
        errors,
      });
    }

    setParsedTimetableRows(rows);
  };

  const handleConfirmStudentImport = () => {
    const validRows = parsedStudentRows.filter((r) => r.isValid);
    if (validRows.length === 0) {
      alert('No valid student rows to import. Please resolve CSV validation errors.');
      return;
    }

    const newStudents: Partial<Student360Profile>[] = validRows.map((r) => ({
      studentId: r.studentId,
      fullName: r.fullName,
      email: r.email,
      personalMobile: r.personalMobile,
      whatsappNumber: r.whatsappNumber || r.personalMobile,
      departmentName: r.departmentName,
      course: r.course,
      academicYear: r.academicYear,
      semester: r.semester,
      division: r.division,
      rollNumber: r.rollNumber,
      gender: r.gender as any,
      dob: r.dob,
      bloodGroup: r.bloodGroup,
      category: r.category as any,
      aadhaarNumber: r.aadhaarNumber,
      abcId: r.abcId,
      emergencyContact: r.emergencyContact,
      permanentAddress: r.permanentAddress,
      temporaryAddress: r.permanentAddress,
      fatherName: r.fatherName,
      motherName: r.motherName,
      guardianName: r.guardianName,
      parentMobile: r.parentMobile,
      parentEmail: r.parentEmail,
      parentOccupation: r.parentOccupation,
      annualIncome: r.annualIncome,
      sscSchoolName: r.sscSchoolName,
      sscBoard: r.sscBoard,
      sscPassingYear: r.sscPassingYear,
      sscPercentage: r.sscPercentage,
      hscCollegeName: r.hscCollegeName,
      hscBoard: r.hscBoard,
      hscStream: r.hscStream,
      hscPassingYear: r.hscPassingYear,
      hscPercentage: r.hscPercentage,
      sem1Gpa: r.sem1Gpa,
      sem2Gpa: r.sem2Gpa,
      sem3Gpa: r.sem3Gpa,
      sem4Gpa: r.sem4Gpa,
      sem5Gpa: r.sem5Gpa,
      sem6Gpa: r.sem6Gpa,
      overallCgpa: r.overallCgpa,
      technicalSkills: r.technicalSkills,
      programmingLanguages: r.programmingLanguages,
      departmentActivities: r.departmentActivities || [],
      certifications: [],
      internships: [],
      projects: [],
      sportsAndExtra: [],
      academicStatus: 'Active',
      admissionDate: new Date().toISOString().split('T')[0],
      attendancePercentage: 100,
      totalLectures: 0,
      attendedLectures: 0,
      passportPhoto: `https://images.unsplash.com/photo-${1534528741775 + r.rowNum}?w=150`,
    }));

    onImportSuccess(newStudents);
    alert(`Successfully imported ${validRows.length} students into the Student 360° database!`);
    setFile(null);
    setParsedStudentRows([]);
  };

  const handleConfirmFacultyImport = () => {
    const validRows = parsedFacultyRows.filter((r) => r.isValid);
    if (validRows.length === 0) {
      alert('No valid faculty rows to import. Please resolve CSV validation errors.');
      return;
    }

    const newFaculty: Partial<Faculty>[] = validRows.map((r) => ({
      facultyId: r.facultyId,
      fullName: r.fullName,
      email: r.email,
      mobile: r.mobile,
      designation: r.designation,
      departmentName: r.departmentName,
      departmentId: 'dept-af',
      qualification: r.qualification,
      experienceYears: r.experienceYears,
      weeklyWorkloadHours: r.weeklyWorkloadHours,
      photo: r.photo,
      allocatedSubjects: r.allocatedSubjects,
      isActive: true,
    }));

    if (onImportFacultySuccess) {
      onImportFacultySuccess(newFaculty);
    }
    alert(`Successfully imported ${validRows.length} faculty members into the Institutional Staff Directory!`);
    setFile(null);
    setParsedFacultyRows([]);
  };

  const handleConfirmSubjectImport = () => {
    const validRows = parsedSubjectRows.filter((r) => r.isValid);
    if (validRows.length === 0) {
      alert('No valid subject rows to import. Please resolve CSV validation errors.');
      return;
    }

    const newSubjects: Partial<Subject>[] = validRows.map((r) => ({
      code: r.code,
      name: r.name,
      departmentName: r.departmentName,
      departmentId: 'dept-af',
      programId: 'prog-ug',
      courseId: 'course-baf',
      semester: r.semester,
      credits: r.credits,
      type: r.type,
      division: r.division,
      assignedFacultyName: r.assignedFacultyName,
      status: 'Active',
    }));

    if (onImportSubjectsSuccess) {
      onImportSubjectsSuccess(newSubjects);
    }
    alert(`Successfully imported ${validRows.length} subjects into the Course Curriculum Catalog!`);
    setFile(null);
    setParsedSubjectRows([]);
  };

  const handleConfirmTimetableImport = () => {
    const validRows = parsedTimetableRows.filter((r) => r.isValid);
    if (validRows.length === 0) {
      alert('No valid timetable rows to import. Please resolve CSV validation errors.');
      return;
    }

    const newSlots: Partial<TimetableSlot>[] = validRows.map((r) => ({
      day: r.day,
      timeSlot: r.timeSlot,
      subjectCode: r.subjectCode,
      subjectName: r.subjectName,
      facultyName: r.facultyName,
      classroom: r.classroom,
      departmentName: r.departmentName,
      departmentId: 'dept-af',
      semester: r.semester,
      division: r.division,
      type: r.type,
    }));

    if (onImportTimetableSuccess) {
      onImportTimetableSuccess(newSlots);
    }
    alert(`Successfully imported ${validRows.length} timetable lecture slots into the Weekly Schedule!`);
    setFile(null);
    setParsedTimetableRows([]);
  };

  const validStudentCount = parsedStudentRows.filter((r) => r.isValid).length;
  const invalidStudentCount = parsedStudentRows.filter((r) => !r.isValid).length;
  const validFacultyCount = parsedFacultyRows.filter((r) => r.isValid).length;
  const invalidFacultyCount = parsedFacultyRows.filter((r) => !r.isValid).length;
  const validSubjectCount = parsedSubjectRows.filter((r) => r.isValid).length;
  const invalidSubjectCount = parsedSubjectRows.filter((r) => !r.isValid).length;
  const validTimetableCount = parsedTimetableRows.filter((r) => r.isValid).length;
  const invalidTimetableCount = parsedTimetableRows.filter((r) => !r.isValid).length;

  const categoryLabelMap = {
    students: 'Student',
    faculty: 'Faculty',
    subjects: 'Subject',
    timetable: 'Timetable',
  };

  return (
    <div className="space-y-6">
      {/* Module Title Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-2xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <FileSpreadsheet className="w-6 h-6 text-indigo-400" />
            <h2 className="text-xl font-bold">Bulk CSV & Excel Import Module</h2>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Batch import Students, Faculty, Subjects, and Timetable slots with real-time schema validation, duplicate detection, and audit logging.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
              activeTab === 'upload' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white/10 text-slate-300 hover:bg-white/20'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Upload CSV</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
              activeTab === 'history' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white/10 text-slate-300 hover:bg-white/20'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Import Logs</span>
          </button>
        </div>
      </div>

      {activeTab === 'upload' && (
        <div className="space-y-6">
          {/* Category Switcher: Students vs Faculty vs Subjects vs Timetable */}
          <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setImportCategory('students');
                setFile(null);
                setParsedStudentRows([]);
                setParsedFacultyRows([]);
                setParsedSubjectRows([]);
                setParsedTimetableRows([]);
              }}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 ${
                importCategory === 'students'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Students</span>
            </button>
            <button
              onClick={() => {
                setImportCategory('faculty');
                setFile(null);
                setParsedStudentRows([]);
                setParsedFacultyRows([]);
                setParsedSubjectRows([]);
                setParsedTimetableRows([]);
              }}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 ${
                importCategory === 'faculty'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <UserCog className="w-4 h-4" />
              <span>Faculty</span>
            </button>
            <button
              onClick={() => {
                setImportCategory('subjects');
                setFile(null);
                setParsedStudentRows([]);
                setParsedFacultyRows([]);
                setParsedSubjectRows([]);
                setParsedTimetableRows([]);
              }}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 ${
                importCategory === 'subjects'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Subjects</span>
            </button>
            <button
              onClick={() => {
                setImportCategory('timetable');
                setFile(null);
                setParsedStudentRows([]);
                setParsedFacultyRows([]);
                setParsedSubjectRows([]);
                setParsedTimetableRows([]);
              }}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 ${
                importCategory === 'timetable'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Timetable</span>
            </button>
          </div>

          {/* File Upload Box */}
          <div className="bg-white rounded-2xl border-2 border-dashed border-indigo-200 p-8 text-center shadow-sm space-y-4 hover:border-indigo-400 transition">
            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <Upload className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-800">
                Choose {categoryLabelMap[importCategory]} CSV file or drag and drop
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Supports standard comma-separated values (.csv) with header mapping
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <label className="cursor-pointer px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition inline-flex items-center space-x-2">
                <FileText className="w-4 h-4" />
                <span>Select {categoryLabelMap[importCategory]} CSV File</span>
                <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
              </label>

              <button
                onClick={() => {
                  if (importCategory === 'students') handleDownloadSampleStudentCSV();
                  else if (importCategory === 'faculty') handleDownloadSampleFacultyCSV();
                  else if (importCategory === 'subjects') handleDownloadSampleSubjectCSV();
                  else if (importCategory === 'timetable') handleDownloadSampleTimetableCSV();
                }}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 transition inline-flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Download Sample {categoryLabelMap[importCategory]} CSV Template</span>
              </button>
            </div>

            {file && (
              <div className="pt-2 text-xs font-semibold text-emerald-600 flex items-center justify-center space-x-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Selected File: {file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
              </div>
            )}
          </div>

          {/* Student Validation Summary Bar */}
          {importCategory === 'students' && parsedStudentRows.length > 0 && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Student CSV Parsing & Validation Results</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Found {parsedStudentRows.length} total student records in file
                  </p>
                </div>

                <div className="flex items-center gap-4 text-xs font-bold">
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{validStudentCount} Valid Rows</span>
                  </span>
                  <span className="px-3 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg flex items-center space-x-1.5">
                    <XCircle className="w-4 h-4" />
                    <span>{invalidStudentCount} Errors</span>
                  </span>
                  <button
                    onClick={handleConfirmStudentImport}
                    disabled={validStudentCount === 0}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-md transition flex items-center space-x-2"
                  >
                    <Users className="w-4 h-4" />
                    <span>Import {validStudentCount} Valid Students</span>
                  </button>
                </div>
              </div>

              {/* Student Data Preview Table Header with Sub-Tabs */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-slate-700">Preview Parsed Student 360 Data:</span>
                <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-medium">
                  <button
                    type="button"
                    onClick={() => setPreviewTab('basic')}
                    className={`px-3 py-1 rounded-lg transition ${
                      previewTab === 'basic' ? 'bg-indigo-600 text-white font-bold shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    1. Enrollment & IDs
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewTab('parents')}
                    className={`px-3 py-1 rounded-lg transition ${
                      previewTab === 'parents' ? 'bg-indigo-600 text-white font-bold shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    2. Personal & Parent Info
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewTab('academics')}
                    className={`px-3 py-1 rounded-lg transition ${
                      previewTab === 'academics' ? 'bg-indigo-600 text-white font-bold shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    3. SSC/HSC & GPAs
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewTab('skills')}
                    className={`px-3 py-1 rounded-lg transition ${
                      previewTab === 'skills' ? 'bg-indigo-600 text-white font-bold shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    4. Technical Skills
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewTab('activities')}
                    className={`px-3 py-1 rounded-lg transition ${
                      previewTab === 'activities' ? 'bg-indigo-600 text-white font-bold shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    5. Dept Activities ({previewTab === 'activities' ? 'Active' : ''})
                  </button>
                </div>
              </div>

              {/* Student Data Preview Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-200 max-h-96">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] font-bold tracking-wider sticky top-0 z-10 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">Row</th>
                      <th className="px-4 py-3">PRN & Roll</th>
                      <th className="px-4 py-3">Student Name</th>
                      {previewTab === 'basic' && (
                        <>
                          <th className="px-4 py-3">Email & Mobile</th>
                          <th className="px-4 py-3">Course & Dept</th>
                          <th className="px-4 py-3">Year / Sem / Div</th>
                          <th className="px-4 py-3">ABC ID & Aadhaar</th>
                        </>
                      )}
                      {previewTab === 'parents' && (
                        <>
                          <th className="px-4 py-3">DOB, Blood, Category</th>
                          <th className="px-4 py-3">Father & Mother</th>
                          <th className="px-4 py-3">Parent Mobile & Email</th>
                          <th className="px-4 py-3">Permanent Address</th>
                        </>
                      )}
                      {previewTab === 'academics' && (
                        <>
                          <th className="px-4 py-3">SSC School & %</th>
                          <th className="px-4 py-3">HSC College & %</th>
                          <th className="px-4 py-3">Sem 1-4 GPAs</th>
                          <th className="px-4 py-3">Overall CGPA</th>
                        </>
                      )}
                      {previewTab === 'skills' && (
                        <>
                          <th className="px-4 py-3">Technical Skills</th>
                          <th className="px-4 py-3">Programming Languages</th>
                        </>
                      )}
                      {previewTab === 'activities' && (
                        <>
                          <th className="px-4 py-3">Department Activities</th>
                          <th className="px-4 py-3">Activity Categories</th>
                        </>
                      )}
                      <th className="px-4 py-3 text-right">Validation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {parsedStudentRows.map((r) => (
                      <tr key={r.rowNum} className={r.isValid ? 'hover:bg-slate-50' : 'bg-rose-50/40 hover:bg-rose-50'}>
                        <td className="px-4 py-3 text-slate-400 font-mono">#{r.rowNum}</td>
                        <td className="px-4 py-3">
                          <div className="font-mono font-bold text-slate-900">{r.studentId}</div>
                          <div className="text-[10px] text-slate-500">Roll: {r.rollNumber}</div>
                        </td>
                        <td className="px-4 py-3 font-bold text-slate-900">
                          {r.fullName}
                          <span className="text-[10px] block font-normal text-slate-500">{r.gender}</span>
                        </td>

                        {previewTab === 'basic' && (
                          <>
                            <td className="px-4 py-3">
                              <div className="text-slate-800">{r.email}</div>
                              <div className="text-[10px] text-slate-500">{r.personalMobile}</div>
                            </td>
                            <td className="px-4 py-3 text-slate-600">
                              <div className="font-semibold text-slate-800">{r.course}</div>
                              <div className="text-[10px] text-slate-500">{r.departmentName}</div>
                            </td>
                            <td className="px-4 py-3 text-slate-600">
                              <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 font-bold rounded">
                                {r.academicYear} Sem {r.semester}-{r.division}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-mono text-[10px] text-slate-600">
                              <div>ABC: <strong className="text-slate-800">{r.abcId}</strong></div>
                              <div>Aadhaar: <strong className="text-slate-800">{r.aadhaarNumber}</strong></div>
                            </td>
                          </>
                        )}

                        {previewTab === 'parents' && (
                          <>
                            <td className="px-4 py-3 text-slate-600">
                              <div>DOB: <strong className="text-slate-800">{r.dob}</strong></div>
                              <div className="text-[10px]">Blood: {r.bloodGroup} • Cat: {r.category}</div>
                            </td>
                            <td className="px-4 py-3 text-slate-600">
                              <div>F: <strong className="text-slate-800">{r.fatherName}</strong></div>
                              <div>M: <strong className="text-slate-800">{r.motherName}</strong></div>
                            </td>
                            <td className="px-4 py-3 text-slate-600">
                              <div>{r.parentMobile}</div>
                              <div className="text-[10px] text-slate-500">{r.parentEmail}</div>
                            </td>
                            <td className="px-4 py-3 text-slate-600 text-[10px] max-w-xs truncate">
                              {r.permanentAddress}
                            </td>
                          </>
                        )}

                        {previewTab === 'academics' && (
                          <>
                            <td className="px-4 py-3 text-slate-600">
                              <div>{r.sscSchoolName} ({r.sscBoard})</div>
                              <div className="font-bold text-emerald-700">{r.sscPercentage}% ({r.sscPassingYear})</div>
                            </td>
                            <td className="px-4 py-3 text-slate-600">
                              <div>{r.hscCollegeName} ({r.hscStream})</div>
                              <div className="font-bold text-indigo-700">{r.hscPercentage}% ({r.hscPassingYear})</div>
                            </td>
                            <td className="px-4 py-3 text-slate-600 text-[10px]">
                              <div>S1: {r.sem1Gpa} | S2: {r.sem2Gpa}</div>
                              <div>S3: {r.sem3Gpa} | S4: {r.sem4Gpa}</div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="px-2.5 py-1 bg-amber-50 text-amber-800 font-bold border border-amber-200 rounded-lg">
                                CGPA {r.overallCgpa}
                              </span>
                            </td>
                          </>
                        )}

                        {previewTab === 'skills' && (
                          <>
                            <td className="px-4 py-3">
                              <div className="flex flex-wrap gap-1">
                                {r.technicalSkills.map((sk, skIdx) => (
                                  <span key={skIdx} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded">
                                    {sk}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex flex-wrap gap-1">
                                {r.programmingLanguages.map((pl, plIdx) => (
                                  <span key={plIdx} className="px-2 py-0.5 bg-purple-50 text-purple-700 text-[10px] font-bold rounded">
                                    {pl}
                                  </span>
                                ))}
                              </div>
                            </td>
                          </>
                        )}

                        {previewTab === 'activities' && (
                          <>
                            <td className="px-4 py-3">
                              {r.departmentActivities.length === 0 ? (
                                <span className="text-slate-400 italic text-[10px]">No activities recorded</span>
                              ) : (
                                <div className="space-y-1">
                                  {r.departmentActivities.slice(0, 3).map((act, actIdx) => (
                                    <div key={actIdx} className="text-[11px] font-semibold text-slate-800 flex items-center space-x-1">
                                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 inline-block"></span>
                                      <span>{act.title}</span>
                                    </div>
                                  ))}
                                  {r.departmentActivities.length > 3 && (
                                    <span className="text-[10px] text-indigo-600 font-bold">
                                      +{r.departmentActivities.length - 3} more activities
                                    </span>
                                  )}
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex flex-wrap gap-1">
                                {Array.from(new Set(r.departmentActivities.map((a) => a.type))).map((t, tIdx) => (
                                  <span key={tIdx} className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded">
                                    {t}
                                  </span>
                                ))}
                              </div>
                            </td>
                          </>
                        )}

                        <td className="px-4 py-3 text-right">
                          {r.isValid ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              VALID
                            </span>
                          ) : (
                            <div className="text-[10px] text-rose-600 font-bold space-y-0.5 text-right">
                              {r.errors.map((err, eIdx) => (
                                <p key={eIdx}>• {err}</p>
                              ))}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Faculty Validation Summary Bar */}
          {importCategory === 'faculty' && parsedFacultyRows.length > 0 && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Faculty CSV Parsing & Validation Results</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Found {parsedFacultyRows.length} total faculty records in file
                  </p>
                </div>

                <div className="flex items-center gap-4 text-xs font-bold">
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{validFacultyCount} Valid Rows</span>
                  </span>
                  <span className="px-3 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg flex items-center space-x-1.5">
                    <XCircle className="w-4 h-4" />
                    <span>{invalidFacultyCount} Errors</span>
                  </span>
                  <button
                    onClick={handleConfirmFacultyImport}
                    disabled={validFacultyCount === 0}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-md transition flex items-center space-x-2"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Import {validFacultyCount} Valid Faculty</span>
                  </button>
                </div>
              </div>

              {/* Faculty Data Preview Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-200 max-h-96">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] font-bold tracking-wider sticky top-0 z-10 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">Row</th>
                      <th className="px-4 py-3">Faculty ID</th>
                      <th className="px-4 py-3">Full Name & Designation</th>
                      <th className="px-4 py-3">Email & Mobile</th>
                      <th className="px-4 py-3">Department</th>
                      <th className="px-4 py-3">Qualification & Experience</th>
                      <th className="px-4 py-3">Workload</th>
                      <th className="px-4 py-3">Allocated Subjects</th>
                      <th className="px-4 py-3 text-right">Validation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {parsedFacultyRows.map((r) => (
                      <tr key={r.rowNum} className={r.isValid ? 'hover:bg-slate-50' : 'bg-rose-50/40 hover:bg-rose-50'}>
                        <td className="px-4 py-3 text-slate-400 font-mono">#{r.rowNum}</td>
                        <td className="px-4 py-3 font-mono font-bold text-indigo-600">{r.facultyId}</td>
                        <td className="px-4 py-3 font-bold text-slate-900">
                          {r.fullName}
                          <span className="text-[10px] block font-normal text-indigo-600">{r.designation}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-slate-800">{r.email}</div>
                          <div className="text-[10px] text-slate-500">{r.mobile}</div>
                        </td>
                        <td className="px-4 py-3 text-slate-600">{r.departmentName}</td>
                        <td className="px-4 py-3 text-slate-600">
                          <div>Qual: <strong className="text-slate-800">{r.qualification}</strong></div>
                          <div className="text-[10px]">Exp: {r.experienceYears} Years</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 font-bold rounded">
                            {r.weeklyWorkloadHours} Hrs/Wk
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {r.allocatedSubjects.map((sub, sIdx) => (
                              <span key={sIdx} className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-semibold rounded">
                                {sub}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {r.isValid ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              VALID
                            </span>
                          ) : (
                            <div className="text-[10px] text-rose-600 font-bold space-y-0.5 text-right">
                              {r.errors.map((err, eIdx) => (
                                <p key={eIdx}>• {err}</p>
                              ))}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Subjects Validation Summary Bar */}
          {importCategory === 'subjects' && parsedSubjectRows.length > 0 && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Subject CSV Parsing & Validation Results</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Found {parsedSubjectRows.length} total subject records in file
                  </p>
                </div>

                <div className="flex items-center gap-4 text-xs font-bold">
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{validSubjectCount} Valid Rows</span>
                  </span>
                  <span className="px-3 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg flex items-center space-x-1.5">
                    <XCircle className="w-4 h-4" />
                    <span>{invalidSubjectCount} Errors</span>
                  </span>
                  <button
                    onClick={handleConfirmSubjectImport}
                    disabled={validSubjectCount === 0}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-md transition flex items-center space-x-2"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Import {validSubjectCount} Valid Subjects</span>
                  </button>
                </div>
              </div>

              {/* Subject Data Preview Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-200 max-h-96">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] font-bold tracking-wider sticky top-0 z-10 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">Row</th>
                      <th className="px-4 py-3">Subject Code</th>
                      <th className="px-4 py-3">Subject Name</th>
                      <th className="px-4 py-3">Department</th>
                      <th className="px-4 py-3">Semester</th>
                      <th className="px-4 py-3">Credits & Type</th>
                      <th className="px-4 py-3">Division</th>
                      <th className="px-4 py-3">Assigned Faculty</th>
                      <th className="px-4 py-3 text-right">Validation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {parsedSubjectRows.map((r) => (
                      <tr key={r.rowNum} className={r.isValid ? 'hover:bg-slate-50' : 'bg-rose-50/40 hover:bg-rose-50'}>
                        <td className="px-4 py-3 text-slate-400 font-mono">#{r.rowNum}</td>
                        <td className="px-4 py-3 font-mono font-bold text-indigo-600">{r.code}</td>
                        <td className="px-4 py-3 font-bold text-slate-900">{r.name}</td>
                        <td className="px-4 py-3 text-slate-600">{r.departmentName}</td>
                        <td className="px-4 py-3 text-slate-600 font-bold">Sem {r.semester}</td>
                        <td className="px-4 py-3 text-slate-600">
                          <div>Credits: <strong className="text-slate-800">{r.credits}</strong></div>
                          <div className="text-[10px] text-slate-500">{r.type}</div>
                        </td>
                        <td className="px-4 py-3 text-slate-600">{r.division}</td>
                        <td className="px-4 py-3 font-semibold text-slate-800">{r.assignedFacultyName}</td>
                        <td className="px-4 py-3 text-right">
                          {r.isValid ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              VALID
                            </span>
                          ) : (
                            <div className="text-[10px] text-rose-600 font-bold space-y-0.5 text-right">
                              {r.errors.map((err, eIdx) => (
                                <p key={eIdx}>• {err}</p>
                              ))}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Timetable Validation Summary Bar */}
          {importCategory === 'timetable' && parsedTimetableRows.length > 0 && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Timetable CSV Parsing & Validation Results</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Found {parsedTimetableRows.length} total timetable slots in file
                  </p>
                </div>

                <div className="flex items-center gap-4 text-xs font-bold">
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{validTimetableCount} Valid Rows</span>
                  </span>
                  <span className="px-3 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg flex items-center space-x-1.5">
                    <XCircle className="w-4 h-4" />
                    <span>{invalidTimetableCount} Errors</span>
                  </span>
                  <button
                    onClick={handleConfirmTimetableImport}
                    disabled={validTimetableCount === 0}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-md transition flex items-center space-x-2"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Import {validTimetableCount} Valid Slots</span>
                  </button>
                </div>
              </div>

              {/* Timetable Data Preview Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-200 max-h-96">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] font-bold tracking-wider sticky top-0 z-10 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">Row</th>
                      <th className="px-4 py-3">Day & Time Slot</th>
                      <th className="px-4 py-3">Subject</th>
                      <th className="px-4 py-3">Faculty</th>
                      <th className="px-4 py-3">Classroom</th>
                      <th className="px-4 py-3">Department & Sem</th>
                      <th className="px-4 py-3">Division</th>
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3 text-right">Validation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {parsedTimetableRows.map((r) => (
                      <tr key={r.rowNum} className={r.isValid ? 'hover:bg-slate-50' : 'bg-rose-50/40 hover:bg-rose-50'}>
                        <td className="px-4 py-3 text-slate-400 font-mono">#{r.rowNum}</td>
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-900">{r.day}</div>
                          <div className="text-[10px] text-indigo-600 font-mono">{r.timeSlot}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-900">{r.subjectName}</div>
                          <div className="text-[10px] font-mono text-slate-500">{r.subjectCode}</div>
                        </td>
                        <td className="px-4 py-3 text-slate-800 font-medium">{r.facultyName}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-mono text-[10px] font-bold rounded">
                            {r.classroom}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-600 text-[10px]">
                          <div>{r.departmentName}</div>
                          <div className="font-bold text-slate-800">Sem {r.semester}</div>
                        </td>
                        <td className="px-4 py-3 text-slate-600 font-bold">Div {r.division}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded">
                            {r.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {r.isValid ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              VALID
                            </span>
                          ) : (
                            <div className="text-[10px] text-rose-600 font-bold space-y-0.5 text-right">
                              {r.errors.map((err, eIdx) => (
                                <p key={eIdx}>• {err}</p>
                              ))}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Bulk Import History & Audit Logs</h3>
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">File Name</th>
                  <th className="px-4 py-3">Uploaded At</th>
                  <th className="px-4 py-3">Uploaded By</th>
                  <th className="px-4 py-3">Total Rows</th>
                  <th className="px-4 py-3">Imported</th>
                  <th className="px-4 py-3">Skipped</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {importLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-semibold text-slate-900 flex items-center space-x-2">
                      <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                      <span>{log.fileName}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{log.uploadedAt}</td>
                    <td className="px-4 py-3 text-slate-700 font-bold">{log.uploadedBy}</td>
                    <td className="px-4 py-3 font-semibold">{log.totalRecords}</td>
                    <td className="px-4 py-3 font-bold text-emerald-600">{log.importedCount}</td>
                    <td className="px-4 py-3 text-slate-400">{log.skippedCount}</td>
                    <td className="px-4 py-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {log.status}
                      </span>
                    </td>
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
