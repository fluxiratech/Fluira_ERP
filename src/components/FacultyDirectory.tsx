import React, { useState, useEffect, useMemo } from 'react';
import { Faculty, Department, Role, Course, Program, ClassTeacherAssignment, Subject, FacultySubjectAllocation } from '../types';
import {
  UserCog,
  Mail,
  BookOpen,
  Clock,
  Plus,
  Edit2,
  Trash2,
  Search,
  X,
  Printer,
  FileSpreadsheet,
  FileText,
  Download,
  UserCheck,
  Upload,
  User,
  AlertTriangle,
  CheckCircle2,
  Layers,
  GraduationCap,
  Sparkles,
  Info,
  Check,
  AlertCircle,
  Phone,
} from 'lucide-react';
import { exportReportToPDF, exportReportToExcel, exportReportToCSV } from '../utils/reportExporter';
import { convertFileToJPGDataUrl } from '../utils/imageUtils';
import { ExportReportModal } from './ExportReportModal';
import { ClassTeacherAssignModal } from './ClassTeacherAssignModal';
import { BulkUploadModule } from './BulkUploadModule';

interface AllocationItem {
  subjectId: string;
  division: string; // 'All Divisions' | 'Div A' | 'Div B' | 'Div C'
}

interface FacultyDirectoryProps {
  facultyList: Faculty[];
  departments: Department[];
  courses?: Course[];
  programs?: Program[];
  subjects?: Subject[];
  classTeacherAssignments?: ClassTeacherAssignment[];
  userRole?: Role;
  userName?: string;
  onAssignClassTeacher?: (assignment: ClassTeacherAssignment) => void;
  onDeleteClassTeacherAssignment?: (id: string) => void;
  onImportFacultySuccess?: (newFaculty: Partial<Faculty>[]) => void;
  onAddFaculty?: (fac: Faculty) => void;
  onUpdateFaculty?: (id: string, updated: Partial<Faculty>) => void;
  onDeleteFaculty?: (id: string) => void;
}

// Helpers for division parsing and conflict detection
function parseAllocItem(item: any): AllocationItem {
  if (!item) return { subjectId: '', division: 'All Divisions' };
  if (typeof item === 'object') {
    return {
      subjectId: item.subjectId || item.id || '',
      division: item.division || (item.divisions ? item.divisions.join(', ') : 'All Divisions'),
    };
  }
  if (typeof item === 'string') {
    if (item.includes('::')) {
      const [id, div] = item.split('::');
      return { subjectId: id.trim(), division: div.trim() };
    }
    if (item.includes('#')) {
      const [id, div] = item.split('#');
      return { subjectId: id.trim(), division: div.trim() };
    }
    return { subjectId: item.trim(), division: 'All Divisions' };
  }
  return { subjectId: String(item), division: 'All Divisions' };
}

function normalizeDiv(div: string): string[] {
  const trimmed = (div || '').trim().toUpperCase();
  if (trimmed.includes('ALL') || trimmed === '' || trimmed === 'ALL DIVISIONS') {
    return ['ALL'];
  }
  const match = trimmed.match(/(?:DIV(?:ISION)?\s*)?([A-Z0-9]+)/);
  return match && match[1] ? [match[1]] : [trimmed];
}

function checkDivCollision(div1: string, div2: string): { isConflict: boolean; collidingLabel: string } {
  const norm1 = normalizeDiv(div1);
  const norm2 = normalizeDiv(div2);

  if (norm1.includes('ALL') && norm2.includes('ALL')) {
    return { isConflict: true, collidingLabel: 'All Divisions' };
  }
  if (norm1.includes('ALL')) {
    return { isConflict: true, collidingLabel: `Division ${norm2.join(', ')}` };
  }
  if (norm2.includes('ALL')) {
    return { isConflict: true, collidingLabel: `Division ${norm1.join(', ')}` };
  }
  for (const d of norm1) {
    if (norm2.includes(d)) {
      return { isConflict: true, collidingLabel: `Division ${d}` };
    }
  }
  return { isConflict: false, collidingLabel: '' };
}

export const FacultyDirectory: React.FC<FacultyDirectoryProps> = ({
  facultyList: initialFaculty,
  departments,
  courses = [],
  programs = [],
  subjects = [],
  classTeacherAssignments = [],
  userRole = 'HOD',
  userName = 'Faculty User',
  onAssignClassTeacher,
  onDeleteClassTeacherAssignment,
  onImportFacultySuccess,
  onAddFaculty,
  onUpdateFaculty,
  onDeleteFaculty,
}) => {
  const [facList, setFacList] = useState<Faculty[]>(initialFaculty);

  useEffect(() => {
    setFacList(initialFaculty);
  }, [initialFaculty]);

  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [showClassTeacherModal, setShowClassTeacherModal] = useState(false);
  const [showBulkImportModal, setShowBulkImportModal] = useState(false);

  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState<Faculty | null>(null);

  // Form States
  const [facultyId, setFacultyId] = useState('FAC101');
  const [fullName, setFullName] = useState('');
  const [designation, setDesignation] = useState('Assistant Professor');
  const [departmentId, setDepartmentId] = useState(departments[0]?.id || 'dept-cs');
  const [qualification, setQualification] = useState('Ph.D. Computer Science');
  const [experienceYears, setExperienceYears] = useState(8);
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('9876543210');
  const [weeklyWorkloadHours, setWeeklyWorkloadHours] = useState(16);
  const [photo, setPhoto] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200');
  const [allocatedSubjects, setAllocatedSubjects] = useState<AllocationItem[]>([]);
  const [subjectSearchQuery, setSubjectSearchQuery] = useState('');
  const [selectedSubjectToAdd, setSelectedSubjectToAdd] = useState('');
  const [selectedDivisionToAdd, setSelectedDivisionToAdd] = useState('All Divisions');
  const [serverError, setServerError] = useState<string | null>(null);

  // Dynamic inline warning toast / alert state
  const [inlineConflictToast, setInlineConflictToast] = useState<{
    id: string;
    type: 'conflict' | 'info' | 'success';
    title: string;
    subjectName: string;
    subjectCode: string;
    facultyName?: string;
    facultyDesignation?: string;
    division?: string;
    message: string;
    actionHint?: string;
  } | null>(null);

  // Auto-dismiss conflict toast after 8 seconds
  useEffect(() => {
    if (inlineConflictToast) {
      const timer = setTimeout(() => {
        setInlineConflictToast(null);
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [inlineConflictToast]);

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Quick Multi-Select Subject Linker Modal State
  const [quickLinkFaculty, setQuickLinkFaculty] = useState<Faculty | null>(null);
  const [quickAllocatedSubjects, setQuickAllocatedSubjects] = useState<AllocationItem[]>([]);
  const [quickSearch, setQuickSearch] = useState('');
  const [quickDivision, setQuickDivision] = useState('All Divisions');
  const [quickSaving, setQuickSaving] = useState(false);
  const [quickError, setQuickError] = useState<string | null>(null);

  const canEdit = userRole === 'Admin' || userRole === 'HOD' || userRole === 'Class Teacher';

  // List of other faculty allocations to detect collisions and parallel division mappings
  const otherFacultyAllocationsList = useMemo(() => {
    const list: {
      facultyId: string;
      facultyName: string;
      designation: string;
      subjectId: string;
      division: string;
    }[] = [];

    const currentEditId = editingFaculty?.id;

    facList.forEach((f) => {
      if (f.id === currentEditId || f.facultyId === currentEditId) return;

      const rawAllocs = f.allocatedSubjects || [];
      rawAllocs.forEach((raw) => {
        const parsed = parseAllocItem(raw);
        if (parsed.subjectId) {
          list.push({
            facultyId: f.id,
            facultyName: f.fullName,
            designation: f.designation,
            subjectId: parsed.subjectId,
            division: parsed.division || 'All Divisions',
          });
        }
      });

      // Also register from currentAllocations if available
      if (f.currentAllocations) {
        f.currentAllocations.forEach((ca) => {
          list.push({
            facultyId: f.id,
            facultyName: f.fullName,
            designation: f.designation,
            subjectId: ca.id,
            division: ca.division || 'All Divisions',
          });
          list.push({
            facultyId: f.id,
            facultyName: f.fullName,
            designation: f.designation,
            subjectId: ca.code,
            division: ca.division || 'All Divisions',
          });
        });
      }
    });

    return list;
  }, [facList, editingFaculty]);

  // Helper to query other allocations for a given subject
  const getOtherAllocationsForSubject = (subId: string, subCode?: string) => {
    return otherFacultyAllocationsList.filter(
      (a) => a.subjectId === subId || (subCode && a.subjectId === subCode)
    );
  };

  // Check if a specific target allocation has a division conflict
  const checkAllocationConflict = (subId: string, division: string, subCode?: string) => {
    const others = getOtherAllocationsForSubject(subId, subCode);
    for (const other of others) {
      const collision = checkDivCollision(division, other.division);
      if (collision.isConflict) {
        return {
          hasConflict: true,
          collidingDivision: collision.collidingLabel,
          facultyName: other.facultyName,
          facultyDesignation: other.designation,
          otherDivision: other.division,
        };
      }
    }
    return null;
  };

  // Find all active division conflicts in the currently edited allocations list
  const activeConflicts = useMemo(() => {
    const conflicts: {
      subject: Subject | { id: string; code: string; name: string };
      targetDivision: string;
      conflictFacultyName: string;
      conflictDesignation: string;
      collidingDivision: string;
    }[] = [];

    allocatedSubjects.forEach((item) => {
      const subObj =
        subjects.find((s) => s.id === item.subjectId || s.code === item.subjectId) || {
          id: item.subjectId,
          code: item.subjectId,
          name: item.subjectId,
        };
      const conflict = checkAllocationConflict(item.subjectId, item.division, (subObj as any).code);
      if (conflict) {
        conflicts.push({
          subject: subObj,
          targetDivision: item.division,
          conflictFacultyName: conflict.facultyName,
          conflictDesignation: conflict.facultyDesignation,
          collidingDivision: conflict.collidingDivision,
        });
      }
    });

    return conflicts;
  }, [allocatedSubjects, subjects, otherFacultyAllocationsList]);

  // Global directory-wide overlap/collision detection across all faculty members
  const globalFacultyOverlaps = useMemo(() => {
    const overlaps: {
      facultyA: Faculty;
      facultyB: Faculty;
      subject: { id: string; code: string; name: string };
      collidingDivision: string;
    }[] = [];

    const facultyOverlapMap = new Map<string, Array<{ subjectName: string; code: string; otherName: string; division: string }>>();

    for (let i = 0; i < facList.length; i++) {
      const facA = facList[i];
      const allocsA = (facA.allocatedSubjects || []).map(parseAllocItem);

      for (let j = i + 1; j < facList.length; j++) {
        const facB = facList[j];
        const allocsB = (facB.allocatedSubjects || []).map(parseAllocItem);

        for (const a of allocsA) {
          if (!a.subjectId) continue;
          const subObj =
            subjects.find((s) => s.id === a.subjectId || s.code === a.subjectId) || {
              id: a.subjectId,
              code: a.subjectId,
              name: a.subjectId,
            };

          for (const b of allocsB) {
            if (!b.subjectId) continue;
            const matches =
              b.subjectId === a.subjectId ||
              b.subjectId === subObj.id ||
              b.subjectId === subObj.code;

            if (matches) {
              const collision = checkDivCollision(a.division, b.division);
              if (collision.isConflict) {
                overlaps.push({
                  facultyA: facA,
                  facultyB: facB,
                  subject: subObj,
                  collidingDivision: collision.collidingLabel,
                });

                const listA = facultyOverlapMap.get(facA.id) || [];
                listA.push({
                  subjectName: subObj.name,
                  code: subObj.code,
                  otherName: facB.fullName,
                  division: collision.collidingLabel,
                });
                facultyOverlapMap.set(facA.id, listA);

                const listB = facultyOverlapMap.get(facB.id) || [];
                listB.push({
                  subjectName: subObj.name,
                  code: subObj.code,
                  otherName: facA.fullName,
                  division: collision.collidingLabel,
                });
                facultyOverlapMap.set(facB.id, listB);
              }
            }
          }
        }
      }
    }

    return { overlaps, facultyOverlapMap };
  }, [facList, subjects]);

  const filtered = facList.filter((f) => {
    const matchesDept = selectedDept === 'ALL' || f.departmentId === selectedDept;
    const matchesSearch =
      f.fullName.toLowerCase().includes(search.toLowerCase()) ||
      (f.facultyId && f.facultyId.toLowerCase().includes(search.toLowerCase())) ||
      f.departmentName.toLowerCase().includes(search.toLowerCase()) ||
      f.designation.toLowerCase().includes(search.toLowerCase()) ||
      (f.mobile && f.mobile.includes(search)) ||
      (f.currentAllocations &&
        f.currentAllocations.some(
          (ca) =>
            ca.name.toLowerCase().includes(search.toLowerCase()) ||
            ca.code.toLowerCase().includes(search.toLowerCase()) ||
            (ca.division && ca.division.toLowerCase().includes(search.toLowerCase()))
        ));
    return matchesDept && matchesSearch;
  });

  const exportHeaders = [
    'Faculty ID',
    'Faculty Name',
    'Designation',
    'Department',
    'Current Allocations & Divisions',
    'Qualification',
    'Experience',
    'Weekly Workload',
    'Email',
    'Mobile',
  ];
  const exportRows = filtered.map((f) => {
    const allocSummary =
      f.currentAllocations && f.currentAllocations.length > 0
        ? f.currentAllocations
            .map((a) => `${a.name} (${a.code}) [${a.division || 'All Divisions'}]`)
            .join('; ')
        : (f.allocatedSubjects || [])
            .map((raw) => {
              const p = parseAllocItem(raw);
              return `${p.subjectId} [${p.division}]`;
            })
            .join('; ') || 'None';

    return [
      f.facultyId || 'FAC-N/A',
      f.fullName,
      f.designation,
      f.departmentName,
      allocSummary,
      f.qualification,
      `${f.experienceYears} Years`,
      `${f.weeklyWorkloadHours} Hours/Week`,
      f.email,
      f.mobile || 'N/A',
    ];
  });

  const reportMetadata = {
    program: selectedDept === 'ALL' ? 'Department of Accounting & Finance' : selectedDept,
    course: 'B.Com Accounting & Finance / M.Com Business Analytics',
    academicYear: 'AY 2025-26',
    semester: 'All Semesters',
    division: 'Div A / B / C',
    subject: 'All Workloads & Division Allocations',
    generatedBy: 'Principal / HOD Office',
  };

  const handleOpenAdd = () => {
    setEditingFaculty(null);
    setFacultyId(`FAC${Math.floor(100 + Math.random() * 900)}`);
    setFullName('');
    setDesignation('Assistant Professor');
    setDepartmentId(departments[0]?.id || 'dept-cs');
    setQualification('Ph.D. Computer Engineering');
    setExperienceYears(6);
    setEmail('');
    setMobile('+91 98000 00000');
    setWeeklyWorkloadHours(16);
    setPhoto('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200');
    setAllocatedSubjects([]);
    setSubjectSearchQuery('');
    setSelectedSubjectToAdd('');
    setSelectedDivisionToAdd('All Divisions');
    setServerError(null);
    setShowModal(true);
  };

  const handleOpenEdit = (fac: Faculty) => {
    setEditingFaculty(fac);
    setFacultyId(fac.facultyId || `FAC${Math.floor(100 + Math.random() * 900)}`);
    setFullName(fac.fullName);
    setDesignation(fac.designation);
    setDepartmentId(fac.departmentId);
    setQualification(fac.qualification);
    setExperienceYears(fac.experienceYears);
    setEmail(fac.email);
    setMobile(fac.mobile || '+91 98000 00000');
    setWeeklyWorkloadHours(fac.weeklyWorkloadHours);
    setPhoto(fac.photo);

    // Populate allocated subjects with division metadata
    const itemsMap = new Map<string, AllocationItem>();

    if (fac.currentAllocations && fac.currentAllocations.length > 0) {
      fac.currentAllocations.forEach((ca) => {
        itemsMap.set(ca.id, {
          subjectId: ca.id,
          division: ca.division || 'All Divisions',
        });
      });
    }

    (fac.allocatedSubjects || []).forEach((raw) => {
      const parsed = parseAllocItem(raw);
      if (parsed.subjectId && !itemsMap.has(parsed.subjectId)) {
        itemsMap.set(parsed.subjectId, parsed);
      }
    });

    setAllocatedSubjects(Array.from(itemsMap.values()));
    setSubjectSearchQuery('');
    setSelectedSubjectToAdd('');
    setSelectedDivisionToAdd('All Divisions');
    setServerError(null);
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to remove this faculty member?')) {
      setFacList((prev) => prev.filter((f) => f.id !== id));
      if (onDeleteFaculty) onDeleteFaculty(id);
    }
  };

  const toggleSubjectAllocation = (subId: string, defaultDiv: string = 'All Divisions') => {
    setServerError(null);
    const subObj = subjects.find((s) => s.id === subId || s.code === subId) || {
      id: subId,
      code: subId,
      name: subId,
    };

    setAllocatedSubjects((prev) => {
      const exists = prev.some((item) => item.subjectId === subId);
      if (exists) {
        setInlineConflictToast({
          id: String(Date.now()),
          type: 'info',
          title: 'Subject Removed',
          subjectName: subObj.name,
          subjectCode: subObj.code,
          message: `Removed ${subObj.name} (${subObj.code}) from faculty subject workload allocations.`,
        });
        return prev.filter((item) => item.subjectId !== subId);
      } else {
        // Pre-check for collision against other faculty allocations
        const conflict = checkAllocationConflict(subId, defaultDiv, (subObj as any).code);
        const otherTeachers = getOtherAllocationsForSubject(subId, (subObj as any).code);

        if (conflict) {
          setInlineConflictToast({
            id: String(Date.now()),
            type: 'conflict',
            title: 'Subject Assignment Conflict Detected',
            subjectName: subObj.name,
            subjectCode: subObj.code,
            facultyName: conflict.facultyName,
            facultyDesignation: conflict.facultyDesignation,
            division: conflict.collidingDivision,
            message: `"${subObj.name}" (${subObj.code}) is already assigned to ${conflict.facultyName} (${conflict.facultyDesignation}) on ${conflict.collidingDivision}.`,
            actionHint: `To assign this subject, choose a different division (e.g. Div B or Div C) to allow parallel division teaching.`,
          });
        } else if (otherTeachers.length > 0) {
          setInlineConflictToast({
            id: String(Date.now()),
            type: 'info',
            title: 'Parallel Division Allocation',
            subjectName: subObj.name,
            subjectCode: subObj.code,
            message: `"${subObj.name}" is also taught by ${otherTeachers.map((t) => `${t.facultyName} (${t.division})`).join(', ')}.`,
            actionHint: `Allocated to ${defaultDiv}.`,
          });
        } else {
          setInlineConflictToast({
            id: String(Date.now()),
            type: 'success',
            title: 'Subject Allocated',
            subjectName: subObj.name,
            subjectCode: subObj.code,
            message: `Successfully linked ${subObj.name} (${subObj.code}) on ${defaultDiv}.`,
          });
        }

        return [...prev, { subjectId: subId, division: defaultDiv }];
      }
    });
  };

  const updateSubjectDivision = (subId: string, newDivision: string) => {
    setServerError(null);
    const subObj = subjects.find((s) => s.id === subId || s.code === subId) || {
      id: subId,
      code: subId,
      name: subId,
    };
    const conflict = checkAllocationConflict(subId, newDivision, (subObj as any).code);
    if (conflict) {
      setInlineConflictToast({
        id: String(Date.now()),
        type: 'conflict',
        title: 'Division Collision Detected',
        subjectName: subObj.name,
        subjectCode: subObj.code,
        facultyName: conflict.facultyName,
        facultyDesignation: conflict.facultyDesignation,
        division: conflict.collidingDivision,
        message: `Switching to "${newDivision}" collides with ${conflict.facultyName} on ${conflict.collidingDivision}.`,
        actionHint: 'Please choose an unassigned division for this subject or adjust existing allocations.',
      });
    } else {
      setInlineConflictToast({
        id: String(Date.now()),
        type: 'info',
        title: 'Division Updated',
        subjectName: subObj.name,
        subjectCode: subObj.code,
        message: `Updated ${subObj.name} division to ${newDivision}.`,
      });
    }

    setAllocatedSubjects((prev) =>
      prev.map((item) =>
        item.subjectId === subId ? { ...item, division: newDivision } : item
      )
    );
  };

  const handleAddSelectedSubject = () => {
    if (!selectedSubjectToAdd) return;
    setServerError(null);
    const subId = selectedSubjectToAdd;
    const div = selectedDivisionToAdd;
    const subObj = subjects.find((s) => s.id === subId || s.code === subId) || {
      id: subId,
      code: subId,
      name: subId,
    };

    const conflict = checkAllocationConflict(subId, div, (subObj as any).code);
    const otherTeachers = getOtherAllocationsForSubject(subId, (subObj as any).code);

    if (conflict) {
      setInlineConflictToast({
        id: String(Date.now()),
        type: 'conflict',
        title: 'Subject Assignment Conflict Detected',
        subjectName: subObj.name,
        subjectCode: subObj.code,
        facultyName: conflict.facultyName,
        facultyDesignation: conflict.facultyDesignation,
        division: conflict.collidingDivision,
        message: `"${subObj.name}" (${subObj.code}) is already assigned to ${conflict.facultyName} (${conflict.facultyDesignation}) on ${conflict.collidingDivision}.`,
        actionHint: `Select a non-conflicting division (e.g. Div B or Div C) to allow parallel division teaching.`,
      });
    } else if (otherTeachers.length > 0) {
      setInlineConflictToast({
        id: String(Date.now()),
        type: 'info',
        title: 'Parallel Division Allocation',
        subjectName: subObj.name,
        subjectCode: subObj.code,
        message: `"${subObj.name}" is also taught by ${otherTeachers.map((t) => `${t.facultyName} (${t.division})`).join(', ')}.`,
        actionHint: `Allocated to ${div}.`,
      });
    } else {
      setInlineConflictToast({
        id: String(Date.now()),
        type: 'success',
        title: 'Subject Allocated',
        subjectName: subObj.name,
        subjectCode: subObj.code,
        message: `Successfully added ${subObj.name} (${subObj.code}) on ${div}.`,
      });
    }

    setAllocatedSubjects((prev) => {
      const exists = prev.some((item) => item.subjectId === selectedSubjectToAdd);
      if (exists) {
        return prev.map((item) =>
          item.subjectId === selectedSubjectToAdd
            ? { ...item, division: selectedDivisionToAdd }
            : item
        );
      } else {
        return [...prev, { subjectId: selectedSubjectToAdd, division: selectedDivisionToAdd }];
      }
    });
    setSelectedSubjectToAdd('');
  };

  const handleSelectAllSubjects = () => {
    setServerError(null);
    const newItems: AllocationItem[] = filteredAvailableSubjects.map((sub) => {
      const existing = allocatedSubjects.find((a) => a.subjectId === sub.id);
      return existing || { subjectId: sub.id, division: selectedDivisionToAdd || 'All Divisions' };
    });
    setAllocatedSubjects(newItems);
  };

  const handleClearAllSubjects = () => {
    setServerError(null);
    setAllocatedSubjects([]);
  };

  // Quick Link Subject Handlers for Faculty Cards
  const openQuickLink = (fac: Faculty) => {
    setQuickLinkFaculty(fac);
    setQuickError(null);
    setQuickSearch('');
    setQuickDivision('All Divisions');

    const parsedAllocs: AllocationItem[] = (fac.allocatedSubjects || []).map((raw) => {
      const p = parseAllocItem(raw);
      return { subjectId: p.subjectId, division: p.division || 'All Divisions' };
    });
    setQuickAllocatedSubjects(parsedAllocs);
  };

  const toggleQuickSubject = (subId: string, defaultDiv: string = 'All Divisions') => {
    setQuickError(null);
    setQuickAllocatedSubjects((prev) => {
      const exists = prev.some((item) => item.subjectId === subId);
      if (exists) {
        return prev.filter((item) => item.subjectId !== subId);
      } else {
        return [...prev, { subjectId: subId, division: defaultDiv }];
      }
    });
  };

  const updateQuickSubjectDivision = (subId: string, newDivision: string) => {
    setQuickError(null);
    setQuickAllocatedSubjects((prev) =>
      prev.map((item) =>
        item.subjectId === subId ? { ...item, division: newDivision } : item
      )
    );
  };

  const handleQuickSave = async () => {
    if (!quickLinkFaculty) return;
    setQuickSaving(true);
    setQuickError(null);

    const rawSubjectIds = quickAllocatedSubjects.map((item) => item.subjectId);
    const formattedAllocatedSubjects = quickAllocatedSubjects.map(
      (item) => `${item.subjectId}::${item.division || 'All Divisions'}`
    );

    const currentAllocationsData: FacultySubjectAllocation[] = quickAllocatedSubjects
      .map((item) => {
        const s = subjects.find((sub) => sub.id === item.subjectId || sub.code === item.subjectId);
        if (!s) return null;
        return {
          id: s.id,
          code: s.code,
          name: s.name,
          semester: s.semester,
          credits: s.credits,
          type: s.type,
          division: item.division || 'All Divisions',
          divisions: [item.division || 'All Divisions'],
          courseCode: s.courseCode,
          departmentId: s.departmentId,
        };
      })
      .filter(Boolean) as FacultySubjectAllocation[];

    const updatedFac: Faculty = {
      ...quickLinkFaculty,
      allocatedSubjects: formattedAllocatedSubjects,
      currentAllocations: currentAllocationsData,
    };

    try {
      const response = await fetch(`/api/faculty/${quickLinkFaculty.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...updatedFac,
          subjectIds: rawSubjectIds,
        }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || 'Failed to update faculty subject allocations.');
      }

      const serverUpdated = await response.json();
      const finalFac = serverUpdated.id ? serverUpdated : updatedFac;
      setFacList((prev) =>
        prev.map((f) => (f.id === quickLinkFaculty.id ? finalFac : f))
      );
      if (onUpdateFaculty) onUpdateFaculty(quickLinkFaculty.id, finalFac);
      setQuickLinkFaculty(null);
    } catch (err: any) {
      setQuickError(err.message || 'Error updating linked subjects.');
    } finally {
      setQuickSaving(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    // Prevent submission if there are active division collisions
    if (activeConflicts.length > 0) {
      const first = activeConflicts[0];
      setServerError(
        `Division Collision: '${first.subject.name}' on ${first.collidingDivision} is already assigned to ${first.conflictFacultyName}. You can assign it to a different division (e.g. Div B or Div C) or adjust the existing assignment.`
      );
      return;
    }

    const deptObj = departments.find((d) => d.id === departmentId);
    const deptName = deptObj?.name || 'Department of Accounting & Finance';

    // Calculate populated joined subject allocations with division mapping
    const currentAllocationsData: FacultySubjectAllocation[] = allocatedSubjects
      .map((item) => {
        const s = subjects.find((sub) => sub.id === item.subjectId || sub.code === item.subjectId);
        if (!s) return null;
        return {
          id: s.id,
          code: s.code,
          name: s.name,
          semester: s.semester,
          credits: s.credits,
          type: s.type,
          division: item.division || 'All Divisions',
          divisions: [item.division || 'All Divisions'],
          courseCode: s.courseCode,
          departmentId: s.departmentId,
        };
      })
      .filter(Boolean) as FacultySubjectAllocation[];

    // Save formatted subject allocations string list or objects
    const rawSubjectIds = allocatedSubjects.map((item) => item.subjectId);
    const formattedAllocatedSubjects = allocatedSubjects.map(
      (item) => `${item.subjectId}::${item.division || 'All Divisions'}`
    );

    if (editingFaculty) {
      const updatedFac: Faculty = {
        ...editingFaculty,
        facultyId,
        fullName,
        designation: designation as any,
        departmentId,
        departmentName: deptName,
        qualification,
        experienceYears: Number(experienceYears),
        email,
        mobile,
        weeklyWorkloadHours: Number(weeklyWorkloadHours),
        photo,
        allocatedSubjects: formattedAllocatedSubjects,
        currentAllocations: currentAllocationsData,
      };

      try {
        const response = await fetch(`/api/faculty/${editingFaculty.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...updatedFac,
            subjectIds: rawSubjectIds,
          }),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          setServerError(errData.error || 'Failed to update faculty allocations on server.');
          return;
        }

        const serverUpdated = await response.json();
        const finalFac = serverUpdated.id ? serverUpdated : updatedFac;
        setFacList((prev) =>
          prev.map((f) => (f.id === editingFaculty.id ? finalFac : f))
        );
        if (onUpdateFaculty) onUpdateFaculty(editingFaculty.id, finalFac);
        setShowModal(false);
      } catch (err: any) {
        setServerError(err.message || 'Network error updating faculty record.');
      }
    } else {
      const newFac: Faculty = {
        id: `fac-${Date.now()}`,
        facultyId: facultyId || `FAC${Math.floor(100 + Math.random() * 900)}`,
        fullName,
        designation: designation as any,
        departmentId,
        departmentName: deptName,
        qualification,
        experienceYears: Number(experienceYears),
        email,
        mobile,
        weeklyWorkloadHours: Number(weeklyWorkloadHours),
        photo: photo || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
        allocatedSubjects: formattedAllocatedSubjects,
        currentAllocations: currentAllocationsData,
        isActive: true,
      };

      try {
        const response = await fetch('/api/faculty', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...newFac,
            subjectIds: rawSubjectIds,
          }),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          setServerError(errData.error || 'Failed to create faculty member on server.');
          return;
        }

        const serverCreated = await response.json();
        const finalCreated = serverCreated.id ? serverCreated : newFac;
        setFacList((prev) => [...prev, finalCreated]);
        if (onAddFaculty) onAddFaculty(finalCreated);
        setShowModal(false);
      } catch (err: any) {
        setServerError(err.message || 'Network error creating faculty record.');
      }
    }
  };

  // Filtered available subjects for dropdown and search
  const filteredAvailableSubjects = useMemo(() => {
    return subjects.filter((s) => {
      const q = subjectSearchQuery.toLowerCase().trim();
      if (!q) return true;
      return (
        s.name.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        (s.courseCode && s.courseCode.toLowerCase().includes(q))
      );
    });
  }, [subjects, subjectSearchQuery]);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <UserCog className="w-6 h-6 text-indigo-600" />
            <h1 className="text-xl font-bold text-slate-900">Faculty & Academic Staff Directory</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Division-aware subject allocations, parallel division faculty mapping (e.g. Prof A on Div A, Prof B on Div B), designations, and workload analytics.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() =>
              exportReportToPDF({
                title: 'OFFICIAL FACULTY & ACADEMIC STAFF DIRECTORY REPORT',
                metadata: reportMetadata,
                headers: exportHeaders,
                rows: exportRows,
              })
            }
            className="flex items-center space-x-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>PDF</span>
          </button>
          <button
            onClick={() =>
              exportReportToExcel({
                title: 'OFFICIAL FACULTY & ACADEMIC STAFF DIRECTORY REPORT',
                metadata: reportMetadata,
                headers: exportHeaders,
                rows: exportRows,
              })
            }
            className="flex items-center space-x-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Excel</span>
          </button>
          <button
            onClick={() =>
              exportReportToCSV({
                title: 'OFFICIAL FACULTY & ACADEMIC STAFF DIRECTORY REPORT',
                metadata: reportMetadata,
                headers: exportHeaders,
                rows: exportRows,
              })
            }
            className="flex items-center space-x-1.5 px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>
          <button
            onClick={() => setIsExportModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Config</span>
          </button>
          {canEdit && (
            <>
              <button
                onClick={() => setShowClassTeacherModal(true)}
                className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition"
              >
                <UserCheck className="w-4 h-4" />
                <span>Assign Class Teachers</span>
              </button>
              <button
                onClick={() => setShowBulkImportModal(true)}
                className="flex items-center space-x-1.5 px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-md transition"
              >
                <Upload className="w-4 h-4" />
                <span>Bulk Faculty CSV Import</span>
              </button>
              <button
                onClick={handleOpenAdd}
                className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Faculty</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Directory-Wide Subject Overlap Warning Banner */}
      {globalFacultyOverlaps.overlaps.length > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl text-amber-950 text-xs space-y-2 shadow-xs">
          <div className="flex items-center space-x-2 font-bold text-amber-900 text-sm">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Warning: Subject Allocation Overlap Detected ({globalFacultyOverlaps.overlaps.length})</span>
          </div>
          <p className="text-amber-800 text-[11px]">
            The following subjects have conflicting faculty assignments on overlapping divisions. Click 'Edit' on the respective faculty card to resolve the collision:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
            {globalFacultyOverlaps.overlaps.map((ov, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 rounded-xl bg-white/90 border border-amber-200 text-slate-800 text-xs"
              >
                <div className="truncate">
                  <span className="font-bold text-slate-900 block truncate">
                    {ov.subject.name} ({ov.subject.code})
                  </span>
                  <span className="text-[10px] text-amber-800 font-semibold">
                    Colliding Division: <strong>{ov.collidingDivision}</strong>
                  </span>
                </div>
                <div className="text-right text-[10px] shrink-0 pl-2">
                  <span className="font-semibold text-indigo-700 block">{ov.facultyA.fullName}</span>
                  <span className="font-semibold text-rose-700 block">& {ov.facultyB.fullName}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4 text-xs font-medium">
        <div className="flex items-center space-x-2 flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search faculty by name, designation, subject, division, or department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-slate-500 font-bold">Department Filter:</span>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg p-2 font-semibold text-slate-800 focus:outline-none"
          >
            <option value="ALL">All Departments</option>
            <option value="dept-af">Department of Accounting & Finance</option>
            <option value="dept-ba">Department of Business Analytics</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Faculty Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((fac) => {
          const overlapWarnings = globalFacultyOverlaps.facultyOverlapMap.get(fac.id);
          const hasCardOverlap = Boolean(overlapWarnings && overlapWarnings.length > 0);

          // Resolve current allocations with division metadata
          const displayedAllocations: FacultySubjectAllocation[] =
            fac.currentAllocations && fac.currentAllocations.length > 0
              ? fac.currentAllocations
              : (fac.allocatedSubjects || []).map((raw) => {
                  const p = parseAllocItem(raw);
                  const s = subjects.find((sub) => sub.id === p.subjectId || sub.code === p.subjectId);
                  return {
                    id: p.subjectId,
                    code: s ? s.code : p.subjectId,
                    name: s ? s.name : p.subjectId,
                    semester: s ? s.semester : 0,
                    credits: s ? s.credits : 0,
                    type: s ? s.type : 'Theory',
                    division: p.division || 'All Divisions',
                    courseCode: s ? s.courseCode : undefined,
                  };
                });

          return (
            <div
              key={fac.id}
              className={`bg-white rounded-2xl border shadow-sm p-5 space-y-4 flex flex-col justify-between hover:shadow-md transition duration-200 ${
                hasCardOverlap ? 'border-amber-300 ring-1 ring-amber-200' : 'border-slate-200'
              }`}
            >
              <div className="space-y-3">
                {/* Overlap Flag Tag on Card */}
                {hasCardOverlap && (
                  <div className="flex items-center space-x-1.5 px-2.5 py-1 bg-amber-50 border border-amber-300 text-amber-900 rounded-xl text-[10px] font-bold">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span className="truncate">
                      Overlap: {overlapWarnings?.map((w) => `${w.subjectName} (${w.division}) with ${w.otherName}`).join(', ')}
                    </span>
                  </div>
                )}

                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <img
                      src={fac.photo}
                      className="w-14 h-14 rounded-2xl object-cover ring-2 ring-indigo-100 shadow-sm"
                      alt=""
                    />
                    <div>
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <h3 className="text-sm font-bold text-slate-900">{fac.fullName}</h3>
                        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-mono font-bold rounded-md border border-indigo-200 shrink-0">
                          {fac.facultyId || 'FAC-N/A'}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-indigo-600">{fac.designation}</p>
                      <p className="text-[11px] text-slate-500">{fac.departmentName}</p>
                    </div>
                  </div>

                  {canEdit && (
                    <div className="flex space-x-1 shrink-0">
                      <button
                        onClick={() => openQuickLink(fac)}
                        className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg transition flex items-center space-x-1 text-xs font-bold"
                        title="Multi-Select & Link Subjects"
                      >
                        <Layers className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline text-[10px]">Link</span>
                      </button>
                      <button
                        onClick={() => handleOpenEdit(fac)}
                        className="p-1.5 bg-slate-100 hover:bg-indigo-50 text-indigo-600 rounded-lg transition"
                        title="Edit Faculty & Division Allocations"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(fac.id)}
                        className="p-1.5 bg-slate-100 hover:bg-rose-50 text-rose-600 rounded-lg transition"
                        title="Delete Faculty"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                  <p className="flex items-center space-x-2">
                    <BookOpen className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>
                      Qualification: <strong>{fac.qualification}</strong>
                    </span>
                  </p>
                  <p className="flex items-center space-x-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>
                      Experience: <strong>{fac.experienceYears} Years</strong>
                    </span>
                  </p>
                  <p className="flex items-center space-x-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-semibold text-slate-700">{fac.mobile || 'N/A'}</span>
                  </p>
                  <p className="flex items-center space-x-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{fac.email}</span>
                  </p>

                  {/* Current Allocations Tag & Detailed Badges with Division Pill */}
                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-800 flex items-center space-x-1">
                        <Layers className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Current Allocations</span>
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-[10px] font-bold text-indigo-700">
                        {displayedAllocations.length} {displayedAllocations.length === 1 ? 'Subject' : 'Subjects'}
                      </span>
                    </div>

                    {displayedAllocations.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {displayedAllocations.map((alloc, idx) => {
                          const divLabel = alloc.division || 'All Divisions';
                          const isSpecificDiv = divLabel !== 'All Divisions' && divLabel !== 'ALL';
                          const isPillCollision = overlapWarnings?.some((w) => w.code === alloc.code || w.subjectName === alloc.name);

                          return (
                            <div
                              key={`${alloc.id}-${idx}`}
                              className={`group relative inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border text-[11px] transition shadow-xs max-w-full ${
                                isPillCollision
                                  ? 'bg-amber-50 border-amber-300 text-amber-950'
                                  : 'bg-slate-50 hover:bg-indigo-50 border-slate-200 hover:border-indigo-200 text-slate-700'
                              }`}
                            >
                              {isPillCollision ? (
                                <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" title="Overlapping assignment with another faculty member" />
                              ) : (
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                              )}
                              <span className="font-semibold text-slate-800 truncate" title={alloc.name}>
                                {alloc.name}
                              </span>
                              <span className="font-mono text-[10px] px-1 py-0.2 rounded bg-white border border-slate-200 text-slate-500 font-bold shrink-0">
                                {alloc.code}
                              </span>
                              <span
                                className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                                  isPillCollision
                                    ? 'bg-amber-200 text-amber-900 border border-amber-300'
                                    : isSpecificDiv
                                    ? 'bg-purple-100 text-purple-700 border border-purple-200'
                                    : 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                                }`}
                              >
                                {divLabel}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-400 italic bg-slate-50 p-2 rounded-lg border border-dashed border-slate-200 text-center">
                        No subjects currently linked.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs flex justify-between items-center">
                <span className="font-semibold text-slate-700">Weekly Workload:</span>
                <span className="font-bold text-indigo-600">{fac.weeklyWorkloadHours} Hours / Week</span>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="col-span-full bg-white rounded-2xl p-8 border text-center text-slate-400">
            No faculty members found for selected criteria.
          </div>
        )}
      </div>

      {/* Add / Edit Faculty Modal with Division Selectors & Parallel Division Support */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3">
              <div className="flex items-center space-x-2">
                <GraduationCap className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-800">
                  {editingFaculty ? `Edit Faculty: ${editingFaculty.fullName}` : 'Add New Faculty Member'}
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Visual Error / Warning Banner */}
            {serverError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Allocation Error:</span>
                  <span>{serverError}</span>
                </div>
              </div>
            )}

            {/* Dynamic Inline Conflict / Allocation Warning Toast with Action Hint */}
            {inlineConflictToast && (
              <div
                className={`p-3.5 rounded-xl border text-xs shadow-md transition-all animate-in fade-in slide-in-from-top-2 duration-200 ${
                  inlineConflictToast.type === 'conflict'
                    ? 'bg-amber-50 border-amber-300 text-amber-950'
                    : inlineConflictToast.type === 'info'
                    ? 'bg-blue-50 border-blue-200 text-blue-950'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-950'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start space-x-2.5">
                    {inlineConflictToast.type === 'conflict' ? (
                      <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    ) : inlineConflictToast.type === 'info' ? (
                      <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    )}
                    <div className="space-y-0.5">
                      <div className="font-bold flex items-center space-x-2">
                        <span>{inlineConflictToast.title}</span>
                        {inlineConflictToast.subjectCode && (
                          <span className="font-mono text-[10px] px-1.5 py-0.2 bg-black/10 rounded font-semibold">
                            {inlineConflictToast.subjectCode}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-800 leading-relaxed font-medium">
                        {inlineConflictToast.message}
                      </p>
                      {inlineConflictToast.actionHint && (
                        <p className="text-[11px] text-amber-800 font-semibold mt-1">
                          💡 {inlineConflictToast.actionHint}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setInlineConflictToast(null)}
                    className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-black/5 shrink-0"
                    title="Dismiss Notification"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Active conflicts warning before submit */}
            {activeConflicts.length > 0 && !serverError && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Warning: Division Collision Detected</span>
                  <ul className="mt-1 list-disc list-inside space-y-0.5">
                    {activeConflicts.map((c, i) => (
                      <li key={i}>
                        <strong>{c.subject.name} ({c.subject.code})</strong> on{' '}
                        <strong className="text-amber-800">{c.collidingDivision}</strong> is already assigned to{' '}
                        <strong>{c.conflictFacultyName}</strong> ({c.conflictDesignation}).
                      </li>
                    ))}
                  </ul>
                  <span className="text-[11px] text-amber-700 mt-1.5 block font-medium">
                    💡 <strong>Tip:</strong> If multiple teachers handle this subject, change the Division to a different batch (e.g. <strong>Div B</strong> or <strong>Div C</strong>) to allow parallel division teaching!
                  </span>
                </div>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4 text-xs font-medium">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 block mb-1 font-bold">Faculty ID</label>
                  <input
                    type="text"
                    required
                    value={facultyId}
                    onChange={(e) => setFacultyId(e.target.value)}
                    placeholder="e.g. FAC101"
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono font-bold text-indigo-700"
                  />
                </div>
                <div>
                  <label className="text-slate-700 block mb-1 font-bold">Full Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Dr. Rajesh Verma"
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 block mb-1 font-bold">Designation</label>
                  <select
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none font-semibold text-slate-800"
                  >
                    {userRole === 'Admin' && (
                      <option value="Professor & HOD">Professor & HOD (Head of Department)</option>
                    )}
                    <option value="Associate Professor">Associate Professor</option>
                    <option value="Assistant Professor">Assistant Professor</option>
                    <option value="Senior Lecturer">Senior Lecturer</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-700 block mb-1 font-bold">Department</label>
                  <select
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none font-semibold text-slate-800"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 block mb-1 font-bold">Qualification</label>
                  <input
                    type="text"
                    required
                    value={qualification}
                    onChange={(e) => setQualification(e.target.value)}
                    placeholder="e.g. Ph.D. Data Science"
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-700 block mb-1 font-bold">Experience (Years)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 block mb-1 font-bold">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="faculty@cktcollege.edu.in"
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-700 block mb-1 font-bold">Mobile Number</label>
                  <input
                    type="tel"
                    required
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none font-semibold text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 block mb-1 font-bold">Workload (Hrs/Wk)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={weeklyWorkloadHours}
                    onChange={(e) => setWeeklyWorkloadHours(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-700 block mb-1 font-bold">Photo URL</label>
                  <input
                    type="text"
                    value={photo}
                    onChange={(e) => setPhoto(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Enhanced Division-Aware Multi-Select / Search-and-Add Interface */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-slate-800 font-bold block flex items-center space-x-1.5">
                      <Layers className="w-4 h-4 text-indigo-600" />
                      <span>Subject Allocations with Division Mapping ({allocatedSubjects.length} Assigned)</span>
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Allocate subjects with division-level precision. Different faculty can be assigned to different divisions of the same subject.
                    </p>
                  </div>
                </div>

                {/* Quick Add with Division Selector */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 bg-white p-2.5 rounded-xl border border-slate-200">
                  <div className="sm:col-span-6">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      1. Select Subject:
                    </label>
                    <select
                      value={selectedSubjectToAdd}
                      onChange={(e) => setSelectedSubjectToAdd(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 p-2 rounded-lg text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    >
                      <option value="">-- Choose Subject --</option>
                      {subjects.map((sub) => {
                        const existingAllocs = getOtherAllocationsForSubject(sub.id, sub.code);
                        const isAlreadySelected = allocatedSubjects.some((a) => a.subjectId === sub.id);
                        const facSummary =
                          existingAllocs.length > 0
                            ? existingAllocs.map((a) => `${a.facultyName} (${a.division})`).join(', ')
                            : 'Unassigned';

                        return (
                          <option key={sub.id} value={sub.id}>
                            {sub.name} ({sub.code}) • Sem {sub.semester} [{facSummary}] {isAlreadySelected ? '✓' : ''}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div className="sm:col-span-4">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      2. Target Division:
                    </label>
                    <select
                      value={selectedDivisionToAdd}
                      onChange={(e) => setSelectedDivisionToAdd(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 p-2 rounded-lg text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    >
                      <option value="All Divisions">All Divisions (A, B, C)</option>
                      <option value="Div A">Division A</option>
                      <option value="Div B">Division B</option>
                      <option value="Div C">Division C</option>
                      <option value="Div A + Div B">Div A + Div B (Combined)</option>
                      <option value="Div B + Div C">Div B + Div C (Combined)</option>
                      <option value="Div A + Div C">Div A + Div C (Combined)</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2 flex items-end">
                    <button
                      type="button"
                      onClick={handleAddSelectedSubject}
                      disabled={!selectedSubjectToAdd}
                      className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>

                {/* Search in Interactive Catalog */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    placeholder="Filter catalog by subject title, course code, or semester..."
                    value={subjectSearchQuery}
                    onChange={(e) => setSubjectSearchQuery(e.target.value)}
                    className="w-full bg-white border border-slate-200 pl-8 pr-3 py-1.5 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                {/* Active Linked Allocations Table with Inline Division Dropdowns */}
                {allocatedSubjects.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Active Allocations for this Faculty ({allocatedSubjects.length}):
                    </span>
                    <div className="space-y-1.5 max-h-36 overflow-y-auto p-2 bg-white rounded-xl border border-slate-200">
                      {allocatedSubjects.map((item) => {
                        const matchedSub = subjects.find((s) => s.id === item.subjectId || s.code === item.subjectId);
                        const label = matchedSub ? matchedSub.name : item.subjectId;
                        const code = matchedSub ? matchedSub.code : '';
                        const sem = matchedSub ? matchedSub.semester : 0;
                        const conflict = checkAllocationConflict(item.subjectId, item.division, code);
                        const otherTeachers = getOtherAllocationsForSubject(item.subjectId, code);

                        return (
                          <div
                            key={item.subjectId}
                            className={`flex flex-col sm:flex-row sm:items-center justify-between p-2 rounded-xl text-xs border gap-2 transition ${
                              conflict
                                ? 'bg-amber-50 border-amber-300 text-amber-950'
                                : 'bg-slate-50 border-slate-200 text-slate-800'
                            }`}
                          >
                            <div className="flex items-center space-x-2 truncate">
                              <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0" />
                              <div className="truncate">
                                <span className="font-bold text-slate-900 truncate block">{label}</span>
                                <div className="flex items-center space-x-1.5 text-[10px] text-slate-500">
                                  <span className="font-mono font-bold text-slate-700">{code}</span>
                                  <span>•</span>
                                  <span>Sem {sem}</span>
                                  {otherTeachers.length > 0 && !conflict && (
                                    <>
                                      <span>•</span>
                                      <span className="text-emerald-700 font-semibold flex items-center space-x-0.5">
                                        <Sparkles className="w-2.5 h-2.5 inline" />
                                        <span>
                                          Parallel: {otherTeachers.map((t) => `${t.facultyName} on ${t.division}`).join(', ')}
                                        </span>
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2 shrink-0 self-end sm:self-auto">
                              {conflict && (
                                <span
                                  className="px-2 py-0.5 rounded bg-amber-100 border border-amber-300 text-amber-900 text-[10px] font-bold flex items-center space-x-1"
                                  title={`Collides with ${conflict.facultyName} on ${conflict.collidingDivision}`}
                                >
                                  <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                                  <span>Collision: {conflict.collidingDivision}</span>
                                </span>
                              )}

                              {/* Inline Division Selector */}
                              <select
                                value={item.division || 'All Divisions'}
                                onChange={(e) => updateSubjectDivision(item.subjectId, e.target.value)}
                                className="bg-white border border-slate-300 text-[11px] font-bold text-slate-800 rounded-lg px-2 py-1 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                              >
                                <option value="All Divisions">All Divisions</option>
                                <option value="Div A">Div A</option>
                                <option value="Div B">Div B</option>
                                <option value="Div C">Div C</option>
                                <option value="Div A + Div B">Div A + Div B</option>
                                <option value="Div B + Div C">Div B + Div C</option>
                                <option value="Div A + Div C">Div A + Div C</option>
                              </select>

                              <button
                                type="button"
                                onClick={() => toggleSubjectAllocation(item.subjectId)}
                                className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-200/60 transition"
                                title="Remove Subject"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Available Subjects Selection Catalog */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Available Subjects Catalog ({filteredAvailableSubjects.length}):
                    </span>
                    <div className="flex items-center space-x-1.5 text-[10px]">
                      <button
                        type="button"
                        onClick={handleSelectAllSubjects}
                        className="px-2 py-0.5 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold transition"
                      >
                        Select All
                      </button>
                      <button
                        type="button"
                        onClick={handleClearAllSubjects}
                        className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold transition"
                      >
                        Clear All
                      </button>
                    </div>
                  </div>
                  <div className="max-h-40 overflow-y-auto p-1.5 bg-white border border-slate-200 rounded-xl space-y-1.5">
                    {filteredAvailableSubjects.length > 0 ? (
                      filteredAvailableSubjects.map((sub) => {
                        const isSelected = allocatedSubjects.some((a) => a.subjectId === sub.id);
                        const otherTeachers = getOtherAllocationsForSubject(sub.id, sub.code);
                        const catalogConflict = checkAllocationConflict(sub.id, selectedDivisionToAdd, sub.code);

                        return (
                          <div
                            key={sub.id}
                            onClick={() => toggleSubjectAllocation(sub.id, selectedDivisionToAdd)}
                            className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition text-xs border ${
                              isSelected
                                ? 'bg-indigo-50 border-indigo-200 text-indigo-900 font-semibold'
                                : catalogConflict
                                ? 'bg-amber-50/50 border-amber-200 text-slate-800 hover:bg-amber-100/60'
                                : 'bg-white border-slate-100 text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-center space-x-2.5 overflow-hidden">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => {}}
                                className="rounded text-indigo-600 focus:ring-indigo-500 pointer-events-none"
                              />
                              <div className="truncate">
                                <div className="flex items-center space-x-1.5 truncate">
                                  <span className="block truncate font-semibold">{sub.name}</span>
                                  {catalogConflict && (
                                    <span
                                      className="px-1.5 py-0.2 bg-amber-100 border border-amber-300 text-amber-900 text-[9px] font-bold rounded flex items-center space-x-0.5 shrink-0"
                                      title={`Conflict on ${catalogConflict.collidingDivision} with ${catalogConflict.facultyName}`}
                                    >
                                      <AlertTriangle className="w-2.5 h-2.5 text-amber-600 inline" />
                                      <span>Conflict ({catalogConflict.collidingDivision})</span>
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center space-x-1 text-[10px] text-slate-500 font-normal">
                                  <span>Sem {sub.semester}</span>
                                  <span>•</span>
                                  <span>{sub.credits} Credits</span>
                                  <span>•</span>
                                  <span>{sub.type}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center space-x-1.5 shrink-0">
                              {otherTeachers.length > 0 ? (
                                <span
                                  className={`px-2 py-0.5 rounded border text-[10px] font-medium ${
                                    catalogConflict
                                      ? 'bg-amber-100 border-amber-300 text-amber-900'
                                      : 'bg-slate-100 border-slate-200 text-slate-700'
                                  }`}
                                  title={otherTeachers.map((t) => `${t.facultyName} on ${t.division}`).join(', ')}
                                >
                                  {otherTeachers.map((t) => `${t.facultyName.split(' ')[0]} (${t.division})`).join(', ')}
                                </span>
                              ) : (
                                <span className="text-[10px] text-emerald-600 font-medium">Unassigned</span>
                              )}
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 border text-slate-600 font-bold">
                                {sub.code}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-[11px] text-slate-400 p-3 text-center">
                        No subjects match '{subjectSearchQuery}'.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-slate-700 block mb-1 font-bold">Faculty Photograph (.jpg format only)</label>
                <div className="flex items-center space-x-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="shrink-0">
                    {photo ? (
                      <img
                        src={photo}
                        alt="Faculty Preview"
                        className="w-14 h-14 rounded-xl object-cover border-2 border-indigo-300 shadow-sm"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-slate-200 border-2 border-slate-300 flex items-center justify-center text-slate-400">
                        <User className="w-7 h-7" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-[11px] text-slate-500 font-medium">
                      Select a .jpg photograph for the faculty profile.
                    </p>
                    <label className="cursor-pointer px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-sm transition inline-flex items-center space-x-1.5">
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
                              setPhoto(jpgDataUrl);
                            } catch (err) {
                              alert('Please select a valid .jpg file.');
                            }
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition shadow-sm"
                >
                  Save Faculty
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Multi-Select Subject Linker Modal */}
      {quickLinkFaculty && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl p-6 space-y-4 max-h-[90vh] flex flex-col relative animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <img
                  src={quickLinkFaculty.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}
                  className="w-12 h-12 rounded-2xl object-cover ring-2 ring-indigo-100 shadow-xs"
                  alt=""
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-base font-bold text-slate-900">
                      Link Subjects: {quickLinkFaculty.fullName}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-bold">
                      {quickAllocatedSubjects.length} Selected
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    {quickLinkFaculty.designation} • {quickLinkFaculty.departmentName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setQuickLinkFaculty(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {quickError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{quickError}</span>
              </div>
            )}

            {/* Filter and Bulk Actions Bar */}
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row gap-2 items-center justify-between">
                <div className="relative w-full sm:flex-1">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search by subject name, course code, or semester..."
                    value={quickSearch}
                    onChange={(e) => setQuickSearch(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 pl-8.5 pr-3 py-1.5 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                  <span className="text-[11px] text-slate-500 font-medium">Default Div:</span>
                  <select
                    value={quickDivision}
                    onChange={(e) => setQuickDivision(e.target.value)}
                    className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 rounded-xl px-2.5 py-1.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="All Divisions">All Divisions</option>
                    <option value="Div A">Div A</option>
                    <option value="Div B">Div B</option>
                    <option value="Div C">Div C</option>
                    <option value="Div A + Div B">Div A + Div B</option>
                    <option value="Div B + Div C">Div B + Div C</option>
                    <option value="Div A + Div C">Div A + Div C</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] font-bold text-slate-600">
                  Select subjects to link ({quickAllocatedSubjects.length} of {subjects.length} assigned):
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      const filtered = subjects.filter((s) => {
                        const q = quickSearch.toLowerCase().trim();
                        if (!q) return true;
                        return (
                          s.name.toLowerCase().includes(q) ||
                          s.code.toLowerCase().includes(q) ||
                          String(s.semester).includes(q)
                        );
                      });
                      const newItems: AllocationItem[] = filtered.map((s) => {
                        const existing = quickAllocatedSubjects.find((a) => a.subjectId === s.id || a.subjectId === s.code);
                        return existing || { subjectId: s.id, division: quickDivision };
                      });
                      setQuickAllocatedSubjects(newItems);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition"
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickAllocatedSubjects([])}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold transition"
                  >
                    Deselect All
                  </button>
                </div>
              </div>
            </div>

            {/* Multi-Select Checkbox Group List */}
            <div className="flex-1 overflow-y-auto max-h-80 p-2 bg-slate-50/50 border border-slate-200 rounded-2xl space-y-2">
              {subjects
                .filter((sub) => {
                  const q = quickSearch.toLowerCase().trim();
                  if (!q) return true;
                  return (
                    sub.name.toLowerCase().includes(q) ||
                    sub.code.toLowerCase().includes(q) ||
                    String(sub.semester).includes(q)
                  );
                })
                .map((sub) => {
                  const allocatedItem = quickAllocatedSubjects.find(
                    (a) => a.subjectId === sub.id || a.subjectId === sub.code
                  );
                  const isChecked = !!allocatedItem;
                  const currentDiv = allocatedItem?.division || quickDivision;
                  const otherTeachers = getOtherAllocationsForSubject(sub.id, sub.code);
                  const conflict = isChecked ? checkAllocationConflict(sub.id, currentDiv, sub.code) : null;

                  return (
                    <div
                      key={sub.id}
                      className={`p-2.5 rounded-xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                        isChecked
                          ? conflict
                            ? 'bg-amber-50/70 border-amber-300'
                            : 'bg-indigo-50/60 border-indigo-200'
                          : 'bg-white border-slate-200 hover:border-indigo-200 hover:bg-slate-50'
                      }`}
                    >
                      <label className="flex items-center space-x-3 cursor-pointer flex-1 min-w-0">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleQuickSubject(sub.id, quickDivision)}
                          className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-xs text-slate-900 truncate">
                              {sub.name}
                            </span>
                            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-600 font-bold shrink-0">
                              {sub.code}
                            </span>
                            {conflict && (
                              <span
                                className="px-1.5 py-0.2 bg-amber-100 border border-amber-300 text-amber-900 text-[9px] font-bold rounded flex items-center space-x-0.5 shrink-0"
                                title={`Collision with ${conflict.facultyName} on ${conflict.collidingDivision}`}
                              >
                                <AlertTriangle className="w-2.5 h-2.5 text-amber-600 inline" />
                                <span>Collision: {conflict.collidingDivision}</span>
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-1.5 text-[10px] text-slate-500 font-medium">
                            <span>Sem {sub.semester}</span>
                            <span>•</span>
                            <span>{sub.credits} Credits</span>
                            <span>•</span>
                            <span>{sub.type}</span>
                            {otherTeachers.length > 0 && (
                              <>
                                <span>•</span>
                                <span className="text-slate-600 font-semibold">
                                  Taught by: {otherTeachers.map((t) => `${t.facultyName.split(' ')[0]} (${t.division})`).join(', ')}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </label>

                      {isChecked && (
                        <div className="flex items-center space-x-2 shrink-0 self-end sm:self-auto pl-7 sm:pl-0">
                          <span className="text-[10px] text-slate-500 font-medium">Division:</span>
                          <select
                            value={currentDiv}
                            onChange={(e) => updateQuickSubjectDivision(sub.id, e.target.value)}
                            className="bg-white border border-slate-300 text-[11px] font-bold text-slate-800 rounded-lg px-2 py-1 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                          >
                            <option value="All Divisions">All Divisions</option>
                            <option value="Div A">Div A</option>
                            <option value="Div B">Div B</option>
                            <option value="Div C">Div C</option>
                            <option value="Div A + Div B">Div A + Div B</option>
                            <option value="Div B + Div C">Div B + Div C</option>
                            <option value="Div A + Div C">Div A + Div C</option>
                          </select>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <span className="text-xs text-slate-500">
                Updating database via atomic transactional PUT route.
              </span>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setQuickLinkFaculty(null)}
                  disabled={quickSaving}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleQuickSave}
                  disabled={quickSaving}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-sm disabled:opacity-50"
                >
                  {quickSaving ? (
                    <span>Saving...</span>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Save Linked Subjects ({quickAllocatedSubjects.length})</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Export Report Modal */}
      <ExportReportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        title="FACULTY DIRECTORY REPORT"
        headers={exportHeaders}
        rows={exportRows}
        defaultMetadata={reportMetadata}
      />

      {/* Class Teacher Assignment Modal */}
      {showClassTeacherModal && (
        <ClassTeacherAssignModal
          isOpen={showClassTeacherModal}
          onClose={() => setShowClassTeacherModal(false)}
          facultyList={facList}
          courses={courses}
          programs={programs}
          classTeacherAssignments={classTeacherAssignments}
          userRole={userRole}
          userName={userName}
          onAssignClassTeacher={(assignment) => {
            if (onAssignClassTeacher) onAssignClassTeacher(assignment);
            setShowClassTeacherModal(false);
          }}
          onDeleteAssignment={(id) => {
            if (onDeleteClassTeacherAssignment) onDeleteClassTeacherAssignment(id);
          }}
        />
      )}

      {/* Bulk Faculty Import Modal */}
      {showBulkImportModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-5xl p-6 space-y-4 max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => setShowBulkImportModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
            <BulkUploadModule
              importLogs={[]}
              onImportSuccess={() => {}}
              onImportFacultySuccess={(importedFacs) => {
                const fullFacs: Faculty[] = importedFacs.map((f, idx) => ({
                  id: `fac-bulk-${Date.now()}-${idx}`,
                  facultyId: f.facultyId || `FAC${100 + idx}`,
                  fullName: f.fullName || 'Faculty Member',
                  email: f.email || 'faculty@cktcollege.edu.in',
                  mobile: f.mobile || '+91 98200 00000',
                  designation: (f.designation as any) || 'Assistant Professor',
                  departmentId: f.departmentId || 'dept-af',
                  departmentName: f.departmentName || 'Department of Accounting & Finance',
                  qualification: f.qualification || 'M.Com, NET',
                  experienceYears: f.experienceYears || 5,
                  weeklyWorkloadHours: f.weeklyWorkloadHours || 16,
                  photo: f.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
                  allocatedSubjects: f.allocatedSubjects || [],
                  isActive: true,
                }));
                setFacList((prev) => [...prev, ...fullFacs]);
                if (onImportFacultySuccess) {
                  onImportFacultySuccess(importedFacs);
                }
                setShowBulkImportModal(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
