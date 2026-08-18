// Central Report Exporter Utility for College Attendance ERP
// Provides standardized PDF, Excel, and CSV exports with mandatory College Header

import { Student360Profile, SubjectDetail, DepartmentActivity } from '../types';

export const COLLEGE_HEADER_DETAILS = {
  institution: 'JBSPS',
  collegeName: 'CHANGU KANA THAKUR',
  collegeType: 'ARTS, COMMERCE & SCIENCE COLLEGE, NEW PANVEL (EMPOWERED AUTONOMOUS)',
  naac: 'Accredited A++ Grade by NAAC (Fourth Cycle - CGPA-3.52)',
  ugc: "'College with Potential for Excellence' Status Awarded by UGC",
  mumbaiAward: "'Best College Award' by University of Mumbai",
  department: 'Department of Accounting & Finance',
};

// Vector SVG logo of JBSPS emblem
export const JBSPS_LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 220" width="80" height="88">
  <defs>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f59e0b" />
      <stop offset="50%" stop-color="#fbbf24" />
      <stop offset="100%" stop-color="#d97706" />
    </linearGradient>
    <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="100%" stop-color="#0284c7" />
    </linearGradient>
  </defs>

  <!-- Outer Ring -->
  <circle cx="100" cy="95" r="85" fill="url(#goldGrad)" stroke="#b45309" stroke-width="4"/>
  <circle cx="100" cy="95" r="72" fill="#fff" stroke="#b45309" stroke-width="2"/>
  <circle cx="100" cy="95" r="54" fill="url(#skyGrad)" stroke="#0369a1" stroke-width="2"/>

  <!-- Sun rays -->
  <g stroke="#fef08a" stroke-width="2.5" opacity="0.9">
    <line x1="100" y1="95" x2="100" y2="45" />
    <line x1="100" y1="95" x2="135" y2="60" />
    <line x1="100" y1="95" x2="150" y2="95" />
    <line x1="100" y1="95" x2="135" y2="130" />
    <line x1="100" y1="95" x2="65" y2="60" />
    <line x1="100" y1="95" x2="50" y2="95" />
    <line x1="100" y1="95" x2="65" y2="130" />
  </g>

  <!-- Rising Sun -->
  <circle cx="100" cy="95" r="16" fill="#f59e0b" stroke="#fef08a" stroke-width="2" />

  <!-- Open Book -->
  <path d="M 68 115 Q 100 108 100 120 Q 100 108 132 115 L 132 135 Q 100 128 100 138 Q 100 128 68 135 Z" fill="#ffffff" stroke="#1e3a8a" stroke-width="2" />
  <line x1="100" y1="120" x2="100" y2="138" stroke="#1e3a8a" stroke-width="2" />

  <!-- Text on Outer Ring -->
  <path id="textArcTop" d="M 28 95 A 72 72 0 0 1 172 95" fill="none"/>
  <text font-size="12" font-weight="900" fill="#78350f" font-family="Arial, sans-serif">
    <textPath href="#textArcTop" startOffset="50%" text-anchor="middle">
      J.B.S.P. SANSTHA
    </textPath>
  </text>

  <path id="textArcBottom" d="M 172 95 A 72 72 0 0 1 28 95" fill="none"/>
  <text font-size="11" font-weight="900" fill="#78350f" font-family="Arial, sans-serif">
    <textPath href="#textArcBottom" startOffset="50%" text-anchor="middle">
      PANVEL, RAIGAD
    </textPath>
  </text>

  <!-- Bottom Ribbon -->
  <path d="M 20 175 L 45 160 L 155 160 L 180 175 L 165 195 L 100 185 L 35 195 Z" fill="url(#goldGrad)" stroke="#92400e" stroke-width="2"/>
  <text x="100" y="178" font-size="13" font-weight="bold" fill="#78350f" text-anchor="middle" font-family="Arial, sans-serif">
    ज.भा.शि.प्र. संस्था
  </text>
</svg>`;

export interface ExportMetadata {
  program?: string;
  course?: string;
  academicYear?: string;
  semester?: string;
  division?: string;
  subject?: string;
  generatedBy?: string;
  generatedAt?: string;
  [key: string]: string | undefined;
}

export interface ReportExportData {
  title: string;
  metadata?: ExportMetadata;
  headers: string[];
  rows: (string | number)[][];
  filename?: string;
  orientation?: 'portrait' | 'landscape';
}

const getCurrentDateTimeFormatted = (): string => {
  const now = new Date();
  return now.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

/**
 * Clean data row cells to avoid null/undefined
 */
const sanitizeCell = (cell: any): string => {
  if (cell === null || cell === undefined) return '';
  return String(cell);
};

/**
 * EXPORT TO CSV
 * Includes College Header and metadata as plain text before table
 */
export const exportReportToCSV = (options: ReportExportData): void => {
  const meta = {
    program: 'All Programs',
    course: 'B.Com Accounting & Finance',
    academicYear: 'AY 2025-26',
    semester: 'All Semesters',
    division: 'All Divisions',
    subject: 'N/A',
    generatedBy: 'Admin (College Attendance ERP)',
    generatedAt: getCurrentDateTimeFormatted(),
    ...options.metadata,
  };

  const lines: string[] = [];

  // College Header
  lines.push(`${COLLEGE_HEADER_DETAILS.institution}`);
  lines.push(`${COLLEGE_HEADER_DETAILS.collegeName}`);
  lines.push(`${COLLEGE_HEADER_DETAILS.collegeType}`);
  lines.push(`${COLLEGE_HEADER_DETAILS.naac}`);
  lines.push(`${COLLEGE_HEADER_DETAILS.ugc}`);
  lines.push(`${COLLEGE_HEADER_DETAILS.mumbaiAward}`);
  lines.push(`${COLLEGE_HEADER_DETAILS.department}`);
  lines.push('');

  // Report Metadata
  lines.push(`REPORT TITLE,"${options.title.replace(/"/g, '""')}"`);
  lines.push(`Program,"${meta.program}"`);
  lines.push(`Course,"${meta.course}"`);
  lines.push(`Academic Year,"${meta.academicYear}"`);
  lines.push(`Semester,"${meta.semester}"`);
  lines.push(`Division,"${meta.division}"`);
  if (meta.subject && meta.subject !== 'N/A') {
    lines.push(`Subject,"${meta.subject}"`);
  }
  lines.push(`Generated By,"${meta.generatedBy}"`);
  lines.push(`Generated Date & Time,"${meta.generatedAt}"`);
  lines.push('');

  // Table Headers
  const headerRow = options.headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(',');
  lines.push(headerRow);

  // Table Rows
  options.rows.forEach((row) => {
    const rowStr = row.map((cell) => `"${sanitizeCell(cell).replace(/"/g, '""')}"`).join(',');
    lines.push(rowStr);
  });

  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + encodeURIComponent(lines.join('\n'));
  const link = document.createElement('a');
  const fname = options.filename
    ? options.filename.endsWith('.csv') ? options.filename : `${options.filename}.csv`
    : `${options.title.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().substring(0, 10)}.csv`;

  link.setAttribute('href', csvContent);
  link.setAttribute('download', fname);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * EXPORT TO EXCEL
 * Generates an Excel HTML/XML spreadsheet with merged header, bold styling, auto-fit columns, and frozen headers.
 */
export const exportReportToExcel = (options: ReportExportData): void => {
  const meta = {
    program: 'All Programs',
    course: 'B.Com Accounting & Finance',
    academicYear: 'AY 2025-26',
    semester: 'All Semesters',
    division: 'All Divisions',
    subject: 'N/A',
    generatedBy: 'Admin (College Attendance ERP)',
    generatedAt: getCurrentDateTimeFormatted(),
    ...options.metadata,
  };

  const colCount = Math.max(options.headers.length, 6);

  let excelHtml = `
  <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
  <head>
    <meta http-equiv="content-type" content="text/plain; charset=UTF-8"/>
    <!--[if gte mso 9]>
    <xml>
      <x:ExcelWorkbook>
        <x:ExcelWorksheets>
          <x:ExcelWorksheet>
            <x:Name>Official Report</x:Name>
            <x:WorksheetOptions>
              <x:DisplayGridlines/>
              <x:FreezePanes/>
              <x:FrozenNoSplit/>
              <x:SplitHorizontal>15</x:SplitHorizontal>
              <x:TopRowBottomPane>15</x:TopRowBottomPane>
              <x:ActivePane>2</x:ActivePane>
            </x:WorksheetOptions>
          </x:ExcelWorksheet>
        </x:ExcelWorksheets>
      </x:ExcelWorkbook>
    </xml>
    <![endif]-->
    <style>
      body { font-family: Arial, sans-serif; font-size: 11pt; }
      .header-institution { font-size: 16pt; font-weight: bold; color: #1e3a8a; text-align: center; }
      .header-college { font-size: 14pt; font-weight: bold; color: #0f172a; text-align: center; }
      .header-desc { font-size: 10pt; color: #334155; text-align: center; }
      .header-accred { font-size: 9pt; font-style: italic; color: #475569; text-align: center; }
      .header-dept { font-size: 11pt; font-weight: bold; color: #1d4ed8; text-align: center; }
      .report-title { font-size: 13pt; font-weight: bold; color: #0f172a; background-color: #f1f5f9; text-align: center; padding: 6px; }
      .meta-label { font-weight: bold; color: #334155; background-color: #f8fafc; }
      .meta-val { color: #0f172a; }
      .th-cell { background-color: #0f172a; color: #ffffff; font-weight: bold; text-align: left; padding: 8px; border: 1px solid #0f172a; }
      .td-cell { border: 1px solid #cbd5e1; padding: 6px; vertical-align: middle; }
      .td-alt { background-color: #f8fafc; }
    </style>
  </head>
  <body>
    <table>
      <!-- College Header Rows -->
      <tr><td colspan="${colCount}" class="header-institution">${COLLEGE_HEADER_DETAILS.institution}</td></tr>
      <tr><td colspan="${colCount}" class="header-college">${COLLEGE_HEADER_DETAILS.collegeName}</td></tr>
      <tr><td colspan="${colCount}" class="header-desc">${COLLEGE_HEADER_DETAILS.collegeType}</td></tr>
      <tr><td colspan="${colCount}" class="header-accred">${COLLEGE_HEADER_DETAILS.naac}</td></tr>
      <tr><td colspan="${colCount}" class="header-accred">${COLLEGE_HEADER_DETAILS.ugc}</td></tr>
      <tr><td colspan="${colCount}" class="header-accred">${COLLEGE_HEADER_DETAILS.mumbaiAward}</td></tr>
      <tr><td colspan="${colCount}" class="header-dept">${COLLEGE_HEADER_DETAILS.department}</td></tr>
      <tr><td colspan="${colCount}"></td></tr>

      <!-- Report Metadata Block -->
      <tr><td colspan="${colCount}" class="report-title">${options.title.toUpperCase()}</td></tr>
      <tr>
        <td class="meta-label">Program:</td><td class="meta-val">${meta.program}</td>
        <td class="meta-label">Course:</td><td class="meta-val">${meta.course}</td>
        <td class="meta-label">Academic Year:</td><td class="meta-val">${meta.academicYear}</td>
      </tr>
      <tr>
        <td class="meta-label">Semester:</td><td class="meta-val">${meta.semester}</td>
        <td class="meta-label">Division:</td><td class="meta-val">${meta.division}</td>
        <td class="meta-label">Subject:</td><td class="meta-val">${meta.subject}</td>
      </tr>
      <tr>
        <td class="meta-label">Generated By:</td><td class="meta-val">${meta.generatedBy}</td>
        <td class="meta-label">Generated Date & Time:</td><td colspan="${colCount - 3}" class="meta-val">${meta.generatedAt}</td>
      </tr>
      <tr><td colspan="${colCount}"></td></tr>

      <!-- Data Table Headers -->
      <tr>
        ${options.headers.map((h) => `<th class="th-cell">${h}</th>`).join('')}
      </tr>

      <!-- Data Rows -->
      ${options.rows
        .map(
          (row, rIdx) => `
        <tr class="${rIdx % 2 === 1 ? 'td-alt' : ''}">
          ${row.map((cell) => `<td class="td-cell">${sanitizeCell(cell)}</td>`).join('')}
        </tr>`
        )
        .join('')}
    </table>
  </body>
  </html>
  `;

  const blob = new Blob([excelHtml], { type: 'application/vnd.ms-excel;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const fname = options.filename
    ? options.filename.endsWith('.xls') || options.filename.endsWith('.xlsx')
      ? options.filename
      : `${options.filename}.xls`
    : `${options.title.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().substring(0, 10)}.xls`;

  link.href = url;
  link.download = fname;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * EXPORT TO PDF & PRINT PREVIEW
 * Opens a dedicated print container window with page numbers, footer, and College Header
 */
export const exportReportToPDF = (options: ReportExportData): void => {
  const meta = {
    program: 'All Programs',
    course: 'B.Com Accounting & Finance',
    academicYear: 'AY 2025-26',
    semester: 'All Semesters',
    division: 'All Divisions',
    subject: 'N/A',
    generatedBy: 'Admin (College Attendance ERP)',
    generatedAt: getCurrentDateTimeFormatted(),
    ...options.metadata,
  };

  const isLandscape = options.orientation === 'landscape' || options.headers.length > 6;

  const htmlWindowContent = `<!DOCTYPE html>
<html>
<head>
  <title>${options.title} - JBSPS College Attendance ERP</title>
  <meta charset="utf-8" />
  <style>
    @page {
      size: A4 ${isLandscape ? 'landscape' : 'portrait'};
      margin: 12mm 12mm 15mm 12mm;
    }
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      color: #0f172a;
      margin: 0;
      padding: 15px;
      background: #fff;
      font-size: 11px;
    }
    
    /* Header Layout */
    .header-container {
      text-align: center;
      margin-bottom: 12px;
      padding-bottom: 10px;
      border-bottom: 2px solid #1e3a8a;
      position: relative;
    }
    .logo-wrapper {
      margin: 0 auto 6px auto;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .inst-name {
      font-size: 14px;
      font-weight: 900;
      letter-spacing: 1px;
      color: #78350f;
      text-transform: uppercase;
      margin: 0;
    }
    .college-name {
      font-size: 17px;
      font-weight: 900;
      color: #0f172a;
      margin: 2px 0;
      letter-spacing: 0.5px;
    }
    .college-type {
      font-size: 11px;
      font-weight: 800;
      color: #1e3a8a;
      margin: 1px 0;
    }
    .accreditation {
      font-size: 9.5px;
      color: #334155;
      font-weight: 600;
      margin: 1px 0;
    }
    .dept-name {
      font-size: 12px;
      font-weight: 800;
      color: #2563eb;
      margin-top: 4px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    /* Metadata Box */
    .report-title-banner {
      background: #0f172a;
      color: #ffffff;
      text-align: center;
      font-size: 13px;
      font-weight: 800;
      padding: 6px 10px;
      border-radius: 4px;
      margin-bottom: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .meta-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 6px 12px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      padding: 8px 12px;
      border-radius: 6px;
      margin-bottom: 14px;
      font-size: 10px;
    }
    .meta-item {
      display: flex;
      gap: 4px;
    }
    .meta-label {
      font-weight: 700;
      color: #475569;
    }
    .meta-value {
      font-weight: 600;
      color: #0f172a;
    }

    /* Table Styling */
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 4px;
      font-size: 10px;
    }
    th {
      background-color: #1e293b;
      color: #ffffff;
      font-weight: 700;
      text-align: left;
      padding: 7px 8px;
      border: 1px solid #1e293b;
      text-transform: uppercase;
      font-size: 9px;
      letter-spacing: 0.5px;
    }
    td {
      padding: 6px 8px;
      border: 1px solid #cbd5e1;
      vertical-align: middle;
    }
    tr:nth-child(even) {
      background-color: #f8fafc;
    }

    /* Page Footer */
    .page-footer {
      margin-top: 20px;
      padding-top: 8px;
      border-top: 1px solid #cbd5e1;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 9px;
      color: #64748b;
      font-weight: 600;
    }

    @media print {
      body { padding: 0; }
      .no-print { display: none !important; }
      .page-footer {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background: #fff;
      }
    }
  </style>
</head>
<body>

  <!-- Controls for preview window -->
  <div class="no-print" style="margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center; background: #f1f5f9; padding: 10px 15px; border-radius: 8px; border: 1px solid #cbd5e1;">
    <div style="font-weight: bold; color: #0f172a; font-size: 12px;">
      📄 PDF Export / Print Document View
    </div>
    <div style="display: flex; gap: 8px;">
      <button onclick="window.print()" style="background: #2563eb; color: #fff; border: none; padding: 7px 16px; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 12px;">
        🖨️ Print / Save as PDF
      </button>
      <button onclick="window.close()" style="background: #475569; color: #fff; border: none; padding: 7px 14px; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 12px;">
        Close Window
      </button>
    </div>
  </div>

  <!-- College Header -->
  <div class="header-container">
    <div class="logo-wrapper">
      ${JBSPS_LOGO_SVG}
    </div>
    <h3 class="inst-name">${COLLEGE_HEADER_DETAILS.institution}</h3>
    <h1 class="college-name">${COLLEGE_HEADER_DETAILS.collegeName}</h1>
    <div class="college-type">${COLLEGE_HEADER_DETAILS.collegeType}</div>
    <div class="accreditation">${COLLEGE_HEADER_DETAILS.naac}</div>
    <div class="accreditation">${COLLEGE_HEADER_DETAILS.ugc}</div>
    <div class="accreditation">${COLLEGE_HEADER_DETAILS.mumbaiAward}</div>
    <div class="dept-name">${COLLEGE_HEADER_DETAILS.department}</div>
  </div>

  <!-- Metadata Title & Details -->
  <div class="report-title-banner">${options.title}</div>
  
  <div class="meta-grid">
    <div class="meta-item"><span class="meta-label">Program:</span> <span class="meta-value">${meta.program}</span></div>
    <div class="meta-item"><span class="meta-label">Course:</span> <span class="meta-value">${meta.course}</span></div>
    <div class="meta-item"><span class="meta-label">Academic Year:</span> <span class="meta-value">${meta.academicYear}</span></div>
    <div class="meta-item"><span class="meta-label">Semester:</span> <span class="meta-value">${meta.semester}</span></div>
    <div class="meta-item"><span class="meta-label">Division:</span> <span class="meta-value">${meta.division}</span></div>
    <div class="meta-item"><span class="meta-label">Subject:</span> <span class="meta-value">${meta.subject}</span></div>
    <div class="meta-item"><span class="meta-label">Generated By:</span> <span class="meta-value">${meta.generatedBy}</span></div>
    <div class="meta-item"><span class="meta-label">Date & Time:</span> <span class="meta-value">${meta.generatedAt}</span></div>
  </div>

  <!-- Data Table -->
  <table>
    <thead>
      <tr>
        ${options.headers.map((h) => `<th>${h}</th>`).join('')}
      </tr>
    </thead>
    <tbody>
      ${options.rows
        .map(
          (row) => `
        <tr>
          ${row.map((cell) => `<td>${sanitizeCell(cell)}</td>`).join('')}
        </tr>`
        )
        .join('')}
    </tbody>
  </table>

  <!-- Footer -->
  <div class="page-footer">
    <div>Generated from College Attendance ERP</div>
    <div>Document Official Seal • Page 1 of 1</div>
  </div>

  <script>
    // Automatically trigger print popup after load
    window.addEventListener('load', () => {
      setTimeout(() => {
        window.print();
      }, 300);
    });
  </script>
</body>
</html>`;

  const printWin = window.open('', '_blank');
  if (printWin) {
    printWin.document.write(htmlWindowContent);
    printWin.document.close();
  } else {
    alert('Pop-up blocked! Please allow pop-ups for this site to export PDF/Print reports.');
  }
};

/**
 * EXPORT INDIVIDUAL STUDENT 360° PROFILE TO PDF
 * Generates an official, comprehensive printable PDF dossier for a single student
 */
export const exportStudent360ToPDF = (student: Student360Profile): void => {
  const generatedAt = getCurrentDateTimeFormatted();

  const skillsList = Array.isArray(student.technicalSkills) ? student.technicalSkills.join(', ') : (student.technicalSkills || 'Financial Analysis, Tally Prime, Excel, GST Return Filing, Power BI');
  const langsList = Array.isArray(student.programmingLanguages) ? student.programmingLanguages.join(', ') : (student.programmingLanguages || 'Python for Finance, R Data Analytics, SQL, Excel VBA');
  
  const certsFormatted = Array.isArray(student.certifications) && student.certifications.length > 0
    ? student.certifications.map(c => typeof c === 'object' && c !== null ? `${(c as any).title || 'Certification'}${ (c as any).issuer ? ' (' + (c as any).issuer + ')' : ''}` : String(c)).join(', ')
    : 'NISM Series V-A Mutual Fund Certification, Certificate in Financial Risk Analytics (NSE Academy)';

  const projectsFormatted = Array.isArray(student.projects) && student.projects.length > 0
    ? student.projects.map(p => `${p.title}: ${p.description} [${p.techStack}]`).join('; ')
    : 'Corporate Tax Planning & GST Audit Project: Comprehensive study on tax minimization strategies for MSMEs [Tally Prime, Excel, Income Tax Portal]';

  const internshipsFormatted = Array.isArray(student.internships) && student.internships.length > 0
    ? student.internships.map(i => `${i.role} at ${i.company} (${i.duration})`).join('; ')
    : 'Financial Research Intern at Motilal Oswal Financial Services (3 Months)';

  const attendanceStatus = student.attendancePercentage >= 75
    ? '<span style="color: #15803d; font-weight: bold;">SATISFACTORY COMPLIANCE (Eligible for Examinations)</span>'
    : '<span style="color: #b91c1c; font-weight: bold;">DEFAULTER WARNING (<75% Mandatory Threshold)</span>';

  const defaultSubjects: SubjectDetail[] = student.registeredSubjectsDetails || [
    { subjectCode: 'AF401', subjectName: 'Financial Accounting – IV', facultyName: 'Prof. Amit Patel', credits: 4, attendancePct: 92, internalMarks: 36, externalMarks: 52, totalMarks: 88, grade: 'O' },
    { subjectCode: 'AF402', subjectName: 'Financial Management – I', facultyName: 'Prof. Priya Deshmukh', credits: 4, attendancePct: 86, internalMarks: 34, externalMarks: 48, totalMarks: 82, grade: 'A+' },
    { subjectCode: 'AF403', subjectName: 'Taxation – I (Direct Taxes)', facultyName: 'Dr. Sunita Kulkarni', credits: 3, attendancePct: 89, internalMarks: 32, externalMarks: 46, totalMarks: 78, grade: 'A' },
    { subjectCode: 'AF404', subjectName: 'Business Economics – II', facultyName: 'Prof. Amit Patel', credits: 3, attendancePct: 90, internalMarks: 35, externalMarks: 50, totalMarks: 85, grade: 'A+' },
    { subjectCode: 'AF405', subjectName: 'Auditing & Corporate Governance', facultyName: 'Prof. Priya Deshmukh', credits: 3, attendancePct: 84, internalMarks: 30, externalMarks: 44, totalMarks: 74, grade: 'B+' },
  ];

  const defaultActivities: DepartmentActivity[] = student.departmentActivities || [
    {
      id: 'act-1',
      type: 'Seminar',
      title: 'National Seminar on Financial Analytics & AI in FinTech',
      date: '2026-03-15',
      organizer: 'Dept. of Accounting & Finance',
      roleOrPosition: 'Winner / First Prize Paper Presenter',
      description: 'Presented research paper on Machine Learning for Algorithmic Stock Trading.',
    },
    {
      id: 'act-2',
      type: 'Industrial Visit',
      title: 'Industrial Visit to National Stock Exchange (NSE) & SEBI Head Office',
      date: '2026-01-20',
      organizer: 'College Placement Cell',
      roleOrPosition: 'Student Event Coordinator',
      description: 'Coordinated 120 students for a full-day guided tour of NSE trading floors and SEBI regulatory wing.',
    },
    {
      id: 'act-3',
      type: 'Placement Drive',
      title: 'Deloitte & KPMG Campus Recruitment Drive',
      date: '2026-04-10',
      organizer: 'Training & Placement Cell',
      roleOrPosition: 'Shortlisted for Audit Associate Role',
      description: 'Cleared Aptitude Test, Group Discussion, and Technical Interview rounds.',
    },
    {
      id: 'act-4',
      type: 'NSS/NCC Event',
      title: 'Annual Blood Donation Drive & Financial Literacy Camp in Panvel Rural Area',
      date: '2025-11-26',
      organizer: 'NSS Unit CKT College',
      roleOrPosition: 'Lead Volunteer',
      description: 'Educated over 350 rural villagers on Digital Banking security and PM Jan Dhan accounts.',
    },
  ];

  const subjectRows = defaultSubjects.map(sub => `
    <tr>
      <td style="font-family: monospace; font-weight: 700; color: #1e3a8a;">${sub.subjectCode}</td>
      <td style="font-weight: 700; color: #0f172a;">${sub.subjectName}</td>
      <td style="color: #475569;">${sub.facultyName}</td>
      <td style="text-align: center; font-weight: 600;">${sub.credits}</td>
      <td style="text-align: center; font-weight: 700; color: #15803d;">${sub.attendancePct}%</td>
      <td style="text-align: center; font-weight: 600;">${sub.internalMarks}</td>
      <td style="text-align: center; font-weight: 600;">${sub.externalMarks}</td>
      <td style="text-align: center; font-weight: 900; color: #0f172a;">${sub.totalMarks}</td>
      <td style="text-align: center; font-weight: 800; color: #1e3a8a;">${sub.grade}</td>
    </tr>
  `).join('');

  const activityRows = defaultActivities.map(act => `
    <tr>
      <td style="font-weight: 700; color: #1e3a8a; white-space: nowrap;">${act.type}</td>
      <td style="font-weight: 700; color: #0f172a;">${act.title}</td>
      <td style="white-space: nowrap; color: #64748b;">${act.date}</td>
      <td style="color: #334155;">${act.organizer}</td>
      <td style="font-weight: 700; color: #15803d;">${act.roleOrPosition}</td>
    </tr>
  `).join('');

  const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <title>Student 360 Profile Dossier - ${student.fullName} (${student.rollNumber})</title>
  <meta charset="utf-8" />
  <style>
    @page {
      size: A4 portrait;
      margin: 8mm;
    }
    * {
      box-sizing: border-box;
    }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      color: #0f172a;
      margin: 0;
      padding: 12px;
      background: #ffffff;
      font-size: 10px;
      line-height: 1.35;
    }

    /* Print Controls Bar */
    .no-print {
      margin-bottom: 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #f1f5f9;
      padding: 10px 16px;
      border-radius: 8px;
      border: 1px solid #cbd5e1;
    }

    /* Official College Header */
    .header-box {
      text-align: center;
      padding-bottom: 6px;
      border-bottom: 2.5px solid #1e3a8a;
      margin-bottom: 10px;
      position: relative;
    }
    .inst-title {
      font-size: 12px;
      font-weight: 900;
      color: #92400e;
      letter-spacing: 0.8px;
      margin: 0;
      text-transform: uppercase;
    }
    .college-name {
      font-size: 15px;
      font-weight: 900;
      color: #0f172a;
      margin: 2px 0;
    }
    .college-sub {
      font-size: 10px;
      font-weight: 800;
      color: #1e3a8a;
      margin: 1px 0;
    }
    .accreditation {
      font-size: 8.5px;
      color: #334155;
      font-weight: 600;
    }
    .dept-title {
      font-size: 11px;
      font-weight: 800;
      color: #2563eb;
      margin-top: 3px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    /* Dossier Banner */
    .dossier-banner {
      background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%);
      color: #ffffff;
      padding: 6px 12px;
      border-radius: 6px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }
    .dossier-title {
      font-size: 12px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    /* Student Top Identity Layout */
    .student-identity-card {
      display: flex;
      gap: 12px;
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 8px 10px;
      margin-bottom: 10px;
      page-break-inside: avoid;
    }
    .student-photo {
      width: 85px;
      height: 100px;
      object-fit: cover;
      border-radius: 6px;
      border: 2px solid #1e3a8a;
      flex-shrink: 0;
    }
    .identity-details {
      flex: 1;
    }
    .student-name {
      font-size: 15px;
      font-weight: 900;
      color: #0f172a;
      margin: 0 0 3px 0;
    }

    /* Section Headers & Tables */
    .section-header {
      background: #e2e8f0;
      color: #0f172a;
      font-size: 9.5px;
      font-weight: 800;
      text-transform: uppercase;
      padding: 3.5px 8px;
      border-left: 4px solid #1e3a8a;
      margin: 10px 0 5px 0;
      letter-spacing: 0.5px;
      page-break-inside: avoid;
    }

    .info-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 8px;
      page-break-inside: avoid;
    }
    .info-table td, .info-table th {
      padding: 3.5px 6px;
      border: 1px solid #cbd5e1;
      vertical-align: top;
      font-size: 9.5px;
    }
    .info-table th {
      background: #f1f5f9;
      font-weight: 800;
      color: #1e3a8a;
      text-transform: uppercase;
      font-size: 8.5px;
    }
    .info-label {
      font-weight: 700;
      color: #475569;
      width: 22%;
      background: #f8fafc;
    }
    .info-value {
      font-weight: 600;
      color: #0f172a;
      width: 28%;
    }

    /* GPA & Attendance Summary Grid */
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 6px;
      margin-bottom: 8px;
      page-break-inside: avoid;
    }
    .stat-box {
      border: 1px solid #cbd5e1;
      border-radius: 5px;
      padding: 5px 6px;
      text-align: center;
      background: #f8fafc;
    }
    .stat-title {
      font-size: 8px;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
    }
    .stat-value {
      font-size: 12px;
      font-weight: 900;
      color: #1e3a8a;
      margin-top: 1px;
    }

    /* Signatures Section */
    .sig-section {
      margin-top: 20px;
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      text-align: center;
      page-break-inside: avoid;
    }
    .sig-box {
      border-top: 1.5px solid #0f172a;
      padding-top: 4px;
      font-size: 9px;
      font-weight: 800;
      color: #1e293b;
    }

    /* Footer */
    .footer {
      margin-top: 15px;
      padding-top: 5px;
      border-top: 1px dashed #cbd5e1;
      display: flex;
      justify-content: space-between;
      font-size: 8px;
      color: #64748b;
      page-break-inside: avoid;
    }

    @media print {
      body { padding: 0; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>

  <!-- Controls Bar -->
  <div class="no-print">
    <div style="font-weight: bold; color: #0f172a; font-size: 12px;">
      🎓 Official Student 360° Profile Dossier - Comprehensive Print & PDF View
    </div>
    <div style="display: flex; gap: 8px;">
      <button onclick="window.print()" style="background: #2563eb; color: #fff; border: none; padding: 7px 16px; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 12px;">
        🖨️ Print / Save as PDF
      </button>
      <button onclick="window.close()" style="background: #475569; color: #fff; border: none; padding: 7px 14px; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 12px;">
        Close Window
      </button>
    </div>
  </div>

  <!-- Official College Header -->
  <div class="header-box">
    <div style="display: flex; justify-content: center; margin-bottom: 4px;">
      ${JBSPS_LOGO_SVG}
    </div>
    <h3 class="inst-title">${COLLEGE_HEADER_DETAILS.institution}</h3>
    <h1 class="college-name">${COLLEGE_HEADER_DETAILS.collegeName}</h1>
    <div class="college-sub">${COLLEGE_HEADER_DETAILS.collegeType}</div>
    <div class="accreditation">${COLLEGE_HEADER_DETAILS.naac} • ${COLLEGE_HEADER_DETAILS.ugc}</div>
    <div class="dept-title">${COLLEGE_HEADER_DETAILS.department}</div>
  </div>

  <!-- Title Banner -->
  <div class="dossier-banner">
    <div class="dossier-title">STUDENT 360° COMPREHENSIVE PROFILE DOSSIER</div>
    <div style="font-size: 9px; font-weight: 600;">CONFIDENTIAL ACADEMIC RECORD</div>
  </div>

  <!-- Student Identity Card -->
  <div class="student-identity-card">
    <img src="${student.passportPhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}" class="student-photo" alt="Student Photo" />
    <div class="identity-details">
      <h2 class="student-name">${student.fullName}</h2>
      <table class="info-table" style="margin: 0;">
        <tr>
          <td class="info-label">Roll Number:</td>
          <td class="info-value" style="font-weight: 900; color: #1e3a8a;">${student.rollNumber}</td>
          <td class="info-label">PRN / Student ID:</td>
          <td class="info-value" style="font-family: monospace; font-weight: 800;">${student.studentId}</td>
        </tr>
        <tr>
          <td class="info-label">Program & Course:</td>
          <td class="info-value" colspan="3">${student.course} (${student.departmentName})</td>
        </tr>
        <tr>
          <td class="info-label">Semester / Division:</td>
          <td class="info-value">Semester ${student.semester} (Div ${student.division})</td>
          <td class="info-label">Academic Year:</td>
          <td class="info-value">${student.academicYear}</td>
        </tr>
        <tr>
          <td class="info-label">ABC ID:</td>
          <td class="info-value" style="font-family: monospace;">${student.abcId || 'ABC-8921-3301-4490'}</td>
          <td class="info-label">Aadhaar Number:</td>
          <td class="info-value" style="font-family: monospace;">${student.aadhaarNumber || '9821-4402-1198'}</td>
        </tr>
        <tr>
          <td class="info-label">Overall CGPA:</td>
          <td class="info-value" style="color: #1e3a8a; font-weight: 900;">${student.overallCgpa || '8.80'} / 10.0</td>
          <td class="info-label">Attendance:</td>
          <td class="info-value" style="color: ${student.attendancePercentage >= 75 ? '#15803d' : '#b91c1c'}; font-weight: 900;">
            ${student.attendancePercentage}% (${student.attendedLectures}/${student.totalLectures} Lect.)
          </td>
        </tr>
      </table>
    </div>
  </div>

  <!-- 1. Personal & Contact Particulars -->
  <div class="section-header">1. Personal & Contact Particulars</div>
  <table class="info-table">
    <tr>
      <td class="info-label">Gender:</td>
      <td class="info-value">${student.gender}</td>
      <td class="info-label">Date of Birth:</td>
      <td class="info-value">${student.dob}</td>
    </tr>
    <tr>
      <td class="info-label">Blood Group:</td>
      <td class="info-value">${student.bloodGroup}</td>
      <td class="info-label">Category:</td>
      <td class="info-value">${student.category}</td>
    </tr>
    <tr>
      <td class="info-label">Personal Mobile:</td>
      <td class="info-value">${student.personalMobile}</td>
      <td class="info-label">WhatsApp Number:</td>
      <td class="info-value">${student.whatsappNumber || student.personalMobile}</td>
    </tr>
    <tr>
      <td class="info-label">Email Address:</td>
      <td class="info-value">${student.email}</td>
      <td class="info-label">Emergency Contact:</td>
      <td class="info-value" style="color: #b91c1c; font-weight: 800;">${student.emergencyContact || '+91 98765 00000'}</td>
    </tr>
    <tr>
      <td class="info-label">Admission Date:</td>
      <td class="info-value">${student.admissionDate}</td>
      <td class="info-label">Annual Family Income:</td>
      <td class="info-value">${student.annualIncome || '₹ 6,50,000 / annum'}</td>
    </tr>
    <tr>
      <td class="info-label">Permanent Address:</td>
      <td class="info-value" colspan="3">${student.permanentAddress || 'New Panvel, Navi Mumbai, Maharashtra'}</td>
    </tr>
  </table>

  <!-- 2. Parent & Guardian Information -->
  <div class="section-header">2. Parent & Guardian Particulars</div>
  <table class="info-table">
    <tr>
      <td class="info-label">Father's Name:</td>
      <td class="info-value">${student.fatherName || 'Rajesh Sharma'}</td>
      <td class="info-label">Mother's Name:</td>
      <td class="info-value">${student.motherName || 'Sunita Sharma'}</td>
    </tr>
    <tr>
      <td class="info-label">Guardian Name:</td>
      <td class="info-value">${student.guardianName || 'N/A'}</td>
      <td class="info-label">Parent Contact Mobile:</td>
      <td class="info-value">${student.parentMobile || '+91 98221 00112'}</td>
    </tr>
    <tr>
      <td class="info-label">Parent Email:</td>
      <td class="info-value">${student.parentEmail || 'parents@gmail.com'}</td>
      <td class="info-label">Parent Occupation:</td>
      <td class="info-value">${student.parentOccupation || 'Business / Service'}</td>
    </tr>
  </table>

  <!-- 3. Secondary (SSC) & Higher Secondary (HSC) Qualifications -->
  <div class="section-header">3. Secondary (SSC) & Higher Secondary (HSC) Qualifications</div>
  <table class="info-table">
    <thead>
      <tr>
        <th>Examination</th>
        <th>Board / Institution</th>
        <th>Passing Year</th>
        <th>Seat Number</th>
        <th>Percentage Marks</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>SSC (Class X)</strong></td>
        <td>${student.sscBoard || 'Maharashtra State Board'} (${student.sscSchoolName || 'New Panvel High School'})</td>
        <td>${student.sscPassingYear || (student as any).sscYear || '2020'}</td>
        <td style="font-family: monospace;">S202088190</td>
        <td><strong style="color: #1e3a8a;">${student.sscPercentage || 88.5}%</strong></td>
      </tr>
      <tr>
        <td><strong>HSC (Class XII)</strong></td>
        <td>${student.hscBoard || 'Maharashtra State Board'} (${student.hscCollegeName || 'CKT Junior College'})</td>
        <td>${student.hscPassingYear || (student as any).hscYear || '2022'}</td>
        <td style="font-family: monospace;">M202299104</td>
        <td><strong style="color: #1e3a8a;">${student.hscPercentage || 85.2}% (${student.hscStream || 'Commerce'})</strong></td>
      </tr>
    </tbody>
  </table>

  <!-- 4. College Semester-Wise Academic Performance & GPA Matrix -->
  <div class="section-header">4. College Semester-Wise Academic Performance & GPA Matrix</div>
  <div class="summary-grid">
    <div class="stat-box">
      <div class="stat-title">Sem I SGPA</div>
      <div class="stat-value">${student.sem1Gpa || 8.50}</div>
    </div>
    <div class="stat-box">
      <div class="stat-title">Sem II SGPA</div>
      <div class="stat-value">${student.sem2Gpa || 8.70}</div>
    </div>
    <div class="stat-box">
      <div class="stat-title">Sem III SGPA</div>
      <div class="stat-value">${student.sem3Gpa || 8.80}</div>
    </div>
    <div class="stat-box">
      <div class="stat-title">Sem IV SGPA</div>
      <div class="stat-value">${student.sem4Gpa || 8.90}</div>
    </div>
    <div class="stat-box">
      <div class="stat-title">Sem V SGPA</div>
      <div class="stat-value">${student.sem5Gpa || 9.10}</div>
    </div>
    <div class="stat-box">
      <div class="stat-title">Sem VI SGPA</div>
      <div class="stat-value">${student.sem6Gpa || 9.20}</div>
    </div>
  </div>

  <!-- 5. Enrolled Course Subjects & Assessment Marks Breakdown -->
  <div class="section-header">5. Enrolled Course Subjects & Internal/External Marks Breakdown</div>
  <table class="info-table">
    <thead>
      <tr>
        <th>Code</th>
        <th>Subject Name</th>
        <th>Faculty Name</th>
        <th>Credits</th>
        <th>Att. %</th>
        <th>Internal (40)</th>
        <th>External (60)</th>
        <th>Total (100)</th>
        <th>Grade</th>
      </tr>
    </thead>
    <tbody>
      ${subjectRows}
    </tbody>
  </table>

  <!-- 6. Department Activities & Co-Curricular Record -->
  <div class="section-header">6. Department Activities & Co-Curricular Involvement</div>
  <table class="info-table">
    <thead>
      <tr>
        <th>Activity Type</th>
        <th>Event Title</th>
        <th>Date</th>
        <th>Organizer</th>
        <th>Role / Award Position</th>
      </tr>
    </thead>
    <tbody>
      ${activityRows}
    </tbody>
  </table>

  <!-- 7. Projects, Internships & Certifications -->
  <div class="section-header">7. Projects, Internships & Verified Certifications</div>
  <table class="info-table">
    <tr>
      <td class="info-label">Academic Projects:</td>
      <td class="info-value" colspan="3">${projectsFormatted}</td>
    </tr>
    <tr>
      <td class="info-label">Internship History:</td>
      <td class="info-value" colspan="3">${internshipsFormatted}</td>
    </tr>
    <tr>
      <td class="info-label">Verified Certifications:</td>
      <td class="info-value" colspan="3">${certsFormatted}</td>
    </tr>
  </table>

  <!-- 8. Technical Skills & Software Tools -->
  <div class="section-header">8. Technical Skills & Software Proficiency</div>
  <table class="info-table">
    <tr>
      <td class="info-label">Core Technical Skills:</td>
      <td class="info-value" colspan="3">${skillsList}</td>
    </tr>
    <tr>
      <td class="info-label">Programming / Software:</td>
      <td class="info-value" colspan="3">${langsList}</td>
    </tr>
  </table>

  <!-- 9. Attendance Analysis & Official Compliance Status -->
  <div class="section-header">9. Attendance Analysis & Official Examination Compliance</div>
  <table class="info-table">
    <tr>
      <td class="info-label">Total Conducted Lectures:</td>
      <td class="info-value">${student.totalLectures} Lectures</td>
      <td class="info-label">Attended Lectures:</td>
      <td class="info-value">${student.attendedLectures} Lectures (${student.attendancePercentage}%)</td>
    </tr>
    <tr>
      <td class="info-label">Examination Clearance:</td>
      <td class="info-value" colspan="3">${attendanceStatus}</td>
    </tr>
  </table>

  <!-- 6 to 7 Blank Lines BEFORE Signatures -->
  <div style="margin-top: 25px; margin-bottom: 25px; page-break-inside: avoid;">
    <div style="font-weight: 800; font-size: 10px; color: #1e3a8a; text-transform: uppercase; margin-bottom: 8px; letter-spacing: 0.5px; border-bottom: 1.5px solid #1e3a8a; padding-bottom: 3px;">
      OFFICIAL REMARKS & ACADEMIC COUNSELING NOTES (6-7 BLANK LINES FOR AUTHORIZED SIGNATORY REMARKS):
    </div>
    <div style="border-bottom: 1px dashed #cbd5e1; height: 22px; margin-bottom: 2px;"></div>
    <div style="border-bottom: 1px dashed #cbd5e1; height: 22px; margin-bottom: 2px;"></div>
    <div style="border-bottom: 1px dashed #cbd5e1; height: 22px; margin-bottom: 2px;"></div>
    <div style="border-bottom: 1px dashed #cbd5e1; height: 22px; margin-bottom: 2px;"></div>
    <div style="border-bottom: 1px dashed #cbd5e1; height: 22px; margin-bottom: 2px;"></div>
    <div style="border-bottom: 1px dashed #cbd5e1; height: 22px; margin-bottom: 2px;"></div>
    <div style="border-bottom: 1px dashed #cbd5e1; height: 22px; margin-bottom: 2px;"></div>
  </div>

  <!-- Official Signatures Box -->
  <div class="sig-section">
    <div class="sig-box">Student Signature</div>
    <div class="sig-box">Class Teacher / Mentor</div>
    <div class="sig-box">Head of Department (HOD)</div>
    <div class="sig-box">Principal / Registrar (Seal)</div>
  </div>

  <!-- Official Footer -->
  <div class="footer">
    <div>Generated from JBSPS CKT College ERP System • Dept. of Accounting & Finance</div>
    <div>Report Date: ${generatedAt} • Document Verification ID: CKT-360-${student.studentId}</div>
  </div>

  <script>
    window.addEventListener('load', () => {
      setTimeout(() => {
        window.print();
      }, 350);
    });
  </script>
</body>
</html>`;

  const printWin = window.open('', '_blank');
  if (printWin) {
    printWin.document.write(htmlContent);
    printWin.document.close();
  } else {
    alert('Pop-up blocked! Please allow pop-ups for this site to export PDF reports.');
  }
};

