import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Avatar,
  Chip,
  Grid,
  Modal,
  Checkbox,
  FormControlLabel,
  Divider,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Person as StudentIcon,
  List as DetailsIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MenuBook as SyllabusIcon,
  Add as AddIcon,
  Download as DownloadIcon,
  Close as CloseIcon,
  School as SchoolIcon,
  AssignmentTurnedIn as AssignIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import StatCard from './StatCard';
import { enhancedInputStyles } from './styles';
import { getSyllabus, createSyllabus, assignSubject, getStudentSubjects } from '../apis/syllabus_api';
import { getStudents } from '../apis/students_api';
import { getInstitute } from '../../utils/storage';

// Course theme definitions
const courseThemes = {
  // 'Computer Science': {
  //   gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  //   light: 'rgba(102, 126, 234, 0.06)',
  //   glow: 'rgba(102, 126, 234, 0.25)',
  //   color: '#667eea',
  //   border: 'rgba(102, 126, 234, 0.15)',
  //   chipBg: 'rgba(102, 126, 234, 0.1)',
  //   icon: '💻',
  // },
  // 'Mathematics': {
  //   gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  //   light: 'rgba(245, 87, 108, 0.06)',
  //   glow: 'rgba(245, 87, 108, 0.25)',
  //   color: '#f5576c',
  //   border: 'rgba(245, 87, 108, 0.15)',
  //   chipBg: 'rgba(245, 87, 108, 0.1)',
  //   icon: '📐',
  // },
  // 'Physics': {
  //   gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  //   light: 'rgba(79, 172, 254, 0.06)',
  //   glow: 'rgba(79, 172, 254, 0.25)',
  //   color: '#4facfe',
  //   border: 'rgba(79, 172, 254, 0.15)',
  //   chipBg: 'rgba(79, 172, 254, 0.1)',
  //   icon: '⚛️',
  // },
};

const defaultTheme = {
 gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    light: 'rgba(102, 126, 234, 0.06)',
    glow: 'rgba(102, 126, 234, 0.25)',
    color: '#667eea',
    border: 'rgba(102, 126, 234, 0.15)',
    chipBg: 'rgba(102, 126, 234, 0.1)',
};

const getTheme = (courseName) => courseThemes[courseName] || defaultTheme;

// Modal style
const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 500,
  maxHeight: '90vh',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  bgcolor: '#fff',
  borderRadius: '24px',
  boxShadow: '0 25px 80px rgba(0,0,0,0.2)',
  p: 0,
};

const SyllabusPanel = () => {
  const [selectedCourse, setSelectedCourse] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [courses, setCourses] = useState([]);

  // Real students from API
  const [allStudents, setAllStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  // Assignment saving state
  const [savingStudentId, setSavingStudentId] = useState(null);
  const [assignFeedback, setAssignFeedback] = useState({}); // { [studentId]: 'success'|'error' }

  // Individual assign modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [tempSelectedSubjects, setTempSelectedSubjects] = useState([]); // array of subject IDs

  // Assignment state: { [studentId]: [subjectId, ...] } — sourced from API
  const [studentAssignments, setStudentAssignments] = useState({});

  // Loading state for assignment modal
  const [loadingAssignments, setLoadingAssignments] = useState(false);

  const institute = getInstitute();

  function getAllCourse(){
    getSyllabus().then(data => {
      if (data.body?.[0]?.courses) {
        setCourses(data.body[0].courses);
      }
    });
  }

  function getAllStudents(){
    setLoadingStudents(true);
    getStudents().then(res => {
      if ([200, 201].includes(res.status)) {
        const raw = Array.isArray(res.body) ? res.body : [res.body];
        const flat = raw.flatMap(item => item.students || []);
        setAllStudents(flat);
      }
      setLoadingStudents(false);
    }).catch(() => setLoadingStudents(false));
  }

  useEffect(() => {
    getAllCourse();
    getAllStudents();
  }, []);

  // Syllabus data persisted
  const defaultSyllabus = [
    {
      id: 1,
      course: 'Computer Science',
      subjects: [
        { name: 'Data Structures', units: 5, status: 'Active' },
        { name: 'Algorithms', units: 4, status: 'Active' },
        { name: 'Database Systems', units: 4, status: 'Active' },
        { name: 'Operating Systems', units: 5, status: 'Draft' },
      ],
    },
    {
      id: 2,
      course: 'Mathematics',
      subjects: [
        { name: 'Calculus', units: 6, status: 'Active' },
        { name: 'Linear Algebra', units: 4, status: 'Active' },
        { name: 'Statistics', units: 5, status: 'Active' },
      ],
    },
    {
      id: 3,
      course: 'Physics',
      subjects: [
        { name: 'Mechanics', units: 5, status: 'Active' },
        { name: 'Thermodynamics', units: 4, status: 'Active' },
        { name: 'Electromagnetism', units: 6, status: 'Draft' },
      ],
    },
  ];

  const [syllabusData, setSyllabusData] = useState(() => {
    try {
      const saved = localStorage.getItem('educonnect_syllabus_data');
      return saved ? JSON.parse(saved) : defaultSyllabus;
    } catch { return defaultSyllabus; }
  });

  // No longer persisting to localStorage — assignments come from API


  // Add Subject modal state
  const [addSubjectOpen, setAddSubjectOpen] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectUnits, setNewSubjectUnits] = useState('');
  const [newSubjectCourse, setNewSubjectCourse] = useState('');
  const [newCourseName, setNewCourseName] = useState('');
  const [isNewCourse, setIsNewCourse] = useState(false);

  // Bulk assign state
  const [bulkAssignSubjects, setBulkAssignSubjects] = useState([]);

  // Computed values
  const allCourseNames = useMemo(() => [...new Set(syllabusData.map(c => c.course))], [syllabusData]);
  const totalSubjects = useMemo(() => syllabusData.reduce((sum, c) => sum + c.subjects.length, 0), [syllabusData]);
  const draftCount = useMemo(() => syllabusData.reduce((sum, c) => sum + c.subjects.filter(s => s.status === 'Draft').length, 0), [syllabusData]);

  const filteredSyllabus = useMemo(() => {
    if (!selectedCourse) return syllabusData;
    return syllabusData.filter(c => c.course === selectedCourse);
  }, [syllabusData, selectedCourse]);

  const getSubjectsForCourse = (courseName) => {
    const course = syllabusData.find(c => c.course === courseName);
    return course ? course.subjects : [];
  };

  // Normalize API response items to { subject, unit } shape
  const normalizeSubjects = (arr) =>
    arr.map(s => ({ subject: s.subject ?? s.name ?? '', unit: String(s.unit ?? s.units ?? '') }))
       .filter(s => s.subject);

  // Open modal: pre-load existing assigned subjects from API
  const handleOpenModal = async (student) => {
    setSelectedStudent(student);
    setModalOpen(true);
    setLoadingAssignments(true);
    try {
      const res = await getStudentSubjects(student.id);
      if ([200, 201].includes(res.status) && res.body) {
        const raw = Array.isArray(res.body) ? res.body : (res.body.subjects ?? res.body.subjects_assigned ?? []);
        const normalized = normalizeSubjects(raw);
        setTempSelectedSubjects(normalized);
        setStudentAssignments(prev => ({ ...prev, [student.id]: normalized }));
      } else {
        setTempSelectedSubjects(studentAssignments[student.id] ?? []);
      }
    } catch {
      setTempSelectedSubjects(studentAssignments[student.id] ?? []);
    } finally {
      setLoadingAssignments(false);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedStudent(null);
    setTempSelectedSubjects([]);
  };

  // Toggle by subject name — stores { subject: name, unit } objects
  const handleSubjectToggle = (subjectName, unit) => {
    setTempSelectedSubjects(prev =>
      prev.some(s => s.subject === subjectName)
        ? prev.filter(s => s.subject !== subjectName)
        : [...prev, { subject: subjectName, unit: String(unit ?? '') }]
    );
  };

  const handleSaveAssignments = async () => {
    if (!selectedStudent) return;
    const studentId = selectedStudent.id;
    setSavingStudentId(studentId);
    try {
      // Ensure clean { subject, unit } shape before sending
      const payload = tempSelectedSubjects.map(s => ({
        subject: s.subject,
        unit: String(s.unit ?? '')
      }));
      const res = await assignSubject(studentId, payload);
      if ([200, 201].includes(res.status)) {
        setStudentAssignments(prev => ({ ...prev, [studentId]: payload }));
        setAssignFeedback(prev => ({ ...prev, [studentId]: 'success' }));
      } else {
        setAssignFeedback(prev => ({ ...prev, [studentId]: 'error' }));
      }
    } catch {
      setAssignFeedback(prev => ({ ...prev, [studentId]: 'error' }));
    } finally {
      setSavingStudentId(null);
      setTimeout(() => setAssignFeedback(prev => { const n={...prev}; delete n[studentId]; return n; }), 3000);
    }
    handleCloseModal();
  };

  // Returns [{subject, unit},...] cached for a student
  const getAssignedSubjects = (studentId) => studentAssignments[studentId] ?? [];

  // For display: resolve to subject name strings
  const getAssignedSubjectObjects = (studentId) => getAssignedSubjects(studentId);

  // Helper: get student name
  const getStudentName = (s) => s.name || `${s.first_name || ''} ${s.last_name || ''}`.trim() || 'Unknown';
  const getStudentRoll = (s) => s.admission_details?.roll_number || s.roll_number || s.rollNo || '—';
  const getStudentEmail = (s) => s.contact_details?.email || s.email || '—';

  // Helper: get subjects for a course from API data
  const getSubjectsForCourseFromAPI = (courseName) => {
    const course = courses.find(c => c.name === courseName);
    return course ? course.subjects : [];
  };

  // Add Subject modal handlers
  const handleOpenAddSubject = () => {
    setNewSubjectName('');
    setNewSubjectUnits('');
    setNewSubjectCourse(syllabusData.length > 0 ? syllabusData[0].course : '');
    setNewCourseName('');
    setIsNewCourse(false);
    setAddSubjectOpen(true);
  };

  const handleCloseAddSubject = () => setAddSubjectOpen(false);

  const handleSaveNewSubject = async () => {
    const subjectName = newSubjectName.trim();
    if (!subjectName) return;
    const units = parseInt(newSubjectUnits) || 1;
    const courseName = isNewCourse ? newCourseName.trim() : newSubjectCourse;
    if (!courseName) return;
    await createSyllabus(courseName,subjectName,units,institute)
    .then((data)=>{
      if(data.status === 201){
        getAllCourse()
        // toast.success('Subject created successfully')
      }else{
        // toast.error('Failed to create subject')
      }
    })
    // setSyllabusData((prev) => {
    //   const existing = prev.find((c) => c.course === courseName);
    //   if (existing) {
    //     return prev.map((c) =>
    //       c.course === courseName
    //         ? { ...c, subjects: [...c.subjects, { name: subjectName, units, status: 'Active' }] }
    //         : c
    //     );
    //   } else {
    //     return [
    //       ...prev,
    //       {
    //         id: prev.length + 1,
    //         course: courseName,
    //         subjects: [{ name: subjectName, units, status: 'Active' }],
    //       },
    //     ];
    //   }
    // });
    // setAddSubjectOpen(false);
  };

  // Bulk assign by subject name+unit
  const handleBulkSubjectToggle = (subjectName, unit) => {
    setBulkAssignSubjects(prev =>
      prev.some(s => s.subject === subjectName)
        ? prev.filter(s => s.subject !== subjectName)
        : [...prev, { subject: subjectName, unit: String(unit ?? '') }]
    );
  };

  const [bulkSaving, setBulkSaving] = useState(false);
  const [bulkFeedback, setBulkFeedback] = useState(null);

  const handleBulkAssign = async () => {
    if (!selectedCourse || bulkAssignSubjects.length === 0) return;
    const courseStudents = studentsForSelectedCourse;
    setBulkSaving(true);
    let successCount = 0;
    await Promise.all(courseStudents.map(async (student) => {
      try {
        const existing = studentAssignments[student.id] ?? [];
        // Merge by subject name, avoid duplicates
        const mergedMap = {};
        [...existing, ...bulkAssignSubjects].forEach(s => { mergedMap[s.subject] = s; });
        const merged = Object.values(mergedMap);
        const res = await assignSubject(student.id, merged);
        if ([200, 201].includes(res.status)) {
          setStudentAssignments(prev => ({ ...prev, [student.id]: merged }));
          successCount++;
        }
      } catch { /* silent */ }
    }));
    setBulkSaving(false);
    setBulkFeedback(successCount === courseStudents.length ? 'success' : 'partial');
    setBulkAssignSubjects([]);
    setTimeout(() => setBulkFeedback(null), 4000);
  };

  // Students filtered by selected course using real API data
  const studentsForSelectedCourse = useMemo(() => {
    if (!selectedCourse) return [];
    const courseName = selectedCourse.toLowerCase();
    return allStudents.filter(s => {
      const ca = s.course_assignment;
      const cd = s.course_details;
      return (
        ca?.course_name?.toLowerCase() === courseName ||
        ca?.course_id === courses.find(c => c.name === selectedCourse)?.id ||
        cd?.branch?.toLowerCase() === courseName ||
        cd?.course_name?.toLowerCase() === courseName
      );
    });
  }, [allStudents, selectedCourse, courses]);

  // Pre-load assigned subjects for every student in the selected course
  useEffect(() => {
    if (studentsForSelectedCourse.length === 0) return;
    studentsForSelectedCourse.forEach(async (student) => {
      try {
        const res = await getStudentSubjects(student.id);
        if ([200, 201].includes(res.status) && res.body) {
          const raw = Array.isArray(res.body) ? res.body : (res.body.subjects ?? res.body.subjects_assigned ?? []);
          const normalized = normalizeSubjects(raw);
          setStudentAssignments(prev => ({ ...prev, [student.id]: normalized }));
        }
      } catch { /* silent */ }
    });
  }, [studentsForSelectedCourse]);

  // Delete subject handler
  const handleDeleteSubject = (courseName, subjectName) => {
    setSyllabusData(prev =>
      prev.map(c =>
        c.course === courseName
          ? { ...c, subjects: c.subjects.filter(s => s.name !== subjectName) }
          : c
      ).filter(c => c.subjects.length > 0)
    );
  };

  return (
    <Box>
      {/* ═══════════════════ GRADIENT HEADER ═══════════════════ */}
      <Paper
        sx={{
          p: 0,
          borderRadius: '24px',
          boxShadow: '0 20px 60px rgba(102, 126, 234, 0.15)',
          overflow: 'hidden',
          mb: 3,
        }}
      >
        <Box
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            p: 3,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: -30,
              right: -30,
              width: 120,
              height: 120,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.08)',
            },
          }}
        >
          <Box
            sx={{
              width: 50,
              height: 50,
              borderRadius: '14px',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <SyllabusIcon sx={{ color: '#fff', fontSize: 28 }} />
          </Box>
          <Box sx={{ zIndex: 1 }}>
            <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '1.2rem' }}>
              Syllabus Management
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem' }}>
              Manage course syllabus and assign subjects to students
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* ═══════════════════ EYE-CATCHING COURSE SELECTOR ═══════════════════ */}
      <Paper
        sx={{
          borderRadius: '20px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
          mb: 3,
          p: 3,
          overflow: 'hidden',
        }}
      >
        <Typography sx={{ fontWeight: 700, fontSize: '1rem', mb: 2, color: '#333', display: 'flex', alignItems: 'center', gap: 1 }}>
          <SchoolIcon sx={{ color: '#667eea', fontSize: 22 }} />
          Select Course
        </Typography>
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          {/* All Courses chip */}
          <Chip
            label="All Courses"
            icon={<SyllabusIcon sx={{ fontSize: 18 }} />}
            onClick={() => { setSelectedCourse(''); setBulkAssignSubjects([]); }}
            sx={{
              px: 1.5,
              py: 2.8,
              borderRadius: '14px',
              fontSize: '0.9rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              background: !selectedCourse
                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                : '#f5f7fa',
              color: !selectedCourse ? '#fff' : '#666',
              boxShadow: !selectedCourse
                ? '0 6px 20px rgba(102, 126, 234, 0.4)'
                : '0 2px 8px rgba(0,0,0,0.06)',
              border: !selectedCourse ? 'none' : '1.5px solid #e0e0e0',
              '& .MuiChip-icon': {
                color: !selectedCourse ? '#fff' : '#999',
              },
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: !selectedCourse
                  ? '0 8px 25px rgba(102, 126, 234, 0.5)'
                  : '0 6px 18px rgba(0,0,0,0.12)',
              },
            }}
          />

          {/* Course chips */}
          {courses.map(courseName => {
            const theme = getTheme(courseName.name);
            // console.log("mapped course",courseName);
            const isActive = selectedCourse === courseName.name;
            const subjectCount = courseName.subjects.length;

            return (
              <Chip
                key={courseName.name}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span>{theme.icon}</span>
                    <span>{courseName.name}</span>
                    <Box
                      sx={{
                        background: isActive ? 'rgba(255,255,255,0.3)' : theme.chipBg,
                        borderRadius: '8px',
                        px: 0.8,
                        py: 0.1,
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        color: isActive ? '#fff' : theme.color,
                      }}
                    >
                      {subjectCount}
                    </Box>
                  </Box>
                }
                onClick={() => {
                  setSelectedCourse(isActive ? '' : courseName.name);
                  setBulkAssignSubjects([]);
                }}
                sx={{
                  px: 1.5,
                  py: 2.8,
                  borderRadius: '14px',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  background: isActive ? theme.gradient : '#f5f7fa',
                  color: isActive ? '#fff' : '#555',
                  boxShadow: isActive
                    ? `0 6px 20px ${theme.glow}`
                    : '0 2px 8px rgba(0,0,0,0.06)',
                  border: isActive ? 'none' : `1.5px solid ${theme.border}`,
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: `0 8px 25px ${theme.glow}`,
                    background: isActive ? theme.gradient : theme.light,
                  },
                }}
              />
            );
          })}
        </Box>
      </Paper>

      {/* ═══════════════════ STATS ROW ═══════════════════ */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <StatCard title="Total Courses" value={String(courses.length)} color="#667eea" icon={<SyllabusIcon />} />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard title="Total Subjects" value={String(courses.map(course=>course.subjects.length).reduce((a,b)=>a+b,0))} color="#00c853" icon={<DetailsIcon />} />
        </Grid>
        {/* <Grid item xs={12} md={4}>
          <StatCard title="Draft Syllabus" value={String(draftCount)} color="#ff9800" icon={<EditIcon />} />
        </Grid> */}
      </Grid>

      {/* ═══════════════════ TABS ═══════════════════ */}
      <Paper
        sx={{
          borderRadius: '20px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
          overflow: 'hidden',
          mb: 3,
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          sx={{
            background: '#f8f9fc',
            px: 2,
            pt: 1,
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.95rem',
              borderRadius: '12px 12px 0 0',
              minHeight: 48,
              transition: 'all 0.3s ease',
              color: '#888',
              '&.Mui-selected': {
                color: '#667eea',
                background: '#fff',
              },
            },
            '& .MuiTabs-indicator': {
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              height: 3,
              borderRadius: '3px 3px 0 0',
            },
          }}
        >
          <Tab label="📚  View Syllabus" />
          <Tab label="⚙️  Manage Courses & Subjects" />
          <Tab label="📋  Assign Subjects" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {/* ─────────── TAB 0: View Syllabus ─────────── */}
          {activeTab === 0 && (
            <Box>
              {courses.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <Typography variant="h6" color="text.secondary">
                    No courses found
                  </Typography>
                </Box>
              ) : (
                <Grid container spacing={3}>
                  {courses.map((course) => {
                    const theme = getTheme(course.name);
                    return (
                      <Grid item size={{ xs: 12, sm: 12, md: 12, lg: 6, xl: 6 }} key={course.id}>
                        <Paper
                          sx={{
                            borderRadius: '16px',
                            overflow: 'hidden',
                            border: `1.5px solid ${theme.border}`,
                            boxShadow: `0 6px 24px ${theme.glow}`,
                            // height:'100%',
                            // position:'relative'
                          }}
                        >
                          {/* Course Header */}
                          <Box
                            sx={{
                              background: theme.gradient,
                              p: 2.5,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              position: 'relative',
                              overflow: 'visible',
                              height:'100%',
                              borderTopLeftRadius:'16px',
                              borderTopRightRadius:'16px',
                              '&::before': {
                                content: '""',
                                position: 'absolute',
                                top: -20,
                                right: -20,
                                width: 80,
                                height: 80,
                                borderRadius: '50%',
                                background: 'rgba(255,255,255,0.08)',
                              },
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, zIndex: 1 }}>
                              <Box
                                sx={{
                                  width: 45,
                                  height: 45,
                                  borderRadius: '12px',
                                  background: 'rgba(255,255,255,0.2)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '1.3rem',
                                }}
                              >
                                {theme.icon}
                              </Box>
                              <Box>
                                <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '1.1rem' }}>
                                  {course.name}
                                </Typography>
                                <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem' }}>
                                  {course.subjects.length} Subjects
                                </Typography>
                              </Box>
                            </Box>
                            {/* <Button
                              variant="contained"
                              size="small"
                              startIcon={<DownloadIcon />}
                              sx={{
                                background: 'rgba(255,255,255,0.2)',
                                borderRadius: '10px',
                                textTransform: 'none',
                                fontWeight: 600,
                                zIndex: 1,
                                '&:hover': { background: 'rgba(255,255,255,0.3)' },
                              }}
                            >
                              Download PDF
                            </Button> */}
                          </Box>

                          {/* Subjects Table */}
                          <TableContainer sx={{height:'422px',overflowY:'auto'}}>
                            <Table>
                              <TableHead>
                                <TableRow sx={{ background: theme.light }}>
                                  <TableCell sx={{ fontWeight: 700, width: '40%' }}>Subject Name</TableCell>
                                  <TableCell sx={{ fontWeight: 700, width: '20%', textAlign: 'center' }}>Units</TableCell>
                                  {/* <TableCell sx={{ fontWeight: 700, width: '20%', textAlign: 'center' }}>Status</TableCell> */}
                                  <TableCell sx={{ fontWeight: 700, width: '20%', textAlign: 'center' }}>Actions</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {course.subjects.map((subject, idx) => (
                                  <TableRow
                                    key={idx}
                                    hover
                                    sx={{
                                      transition: 'all 0.2s ease',
                                      animation: `fadeIn 0.3s ease ${idx * 0.05}s both`,
                                      '@keyframes fadeIn': {
                                        from: { opacity: 0, transform: 'translateY(8px)' },
                                        to: { opacity: 1, transform: 'translateY(0)' },
                                      },
                                      '&:hover': {
                                        background: `${theme.light} !important`,
                                      },
                                    }}
                                  >
                                    <TableCell>
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Box
                                          sx={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: '10px',
                                            background: theme.chipBg,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: theme.color,
                                          }}
                                          
                                        >
                                          <SyllabusIcon fontSize="small" />
                                        </Box>
                                        <Typography sx={{fontWeight:600,fontSize:'13px'}}>{subject.name}</Typography>
                                      </Box>
                                    </TableCell>
                                    <TableCell sx={{ textAlign: 'center' }}>
                                      <Chip
                                        label={`${subject.unit} Units`}
                                        size="small"
                                        sx={{ background: '#e3f2fd', color: '#1565c0', fontWeight: 600 }}
                                      />
                                    </TableCell>
                                    {/* <TableCell sx={{ textAlign: 'center' }}>
                                      <Chip
                                        label={subject.status}
                                        size="small"
                                        sx={{
                                          background: subject.status === 'Active'
                                            ? 'linear-gradient(135deg, #4caf50, #81c784)'
                                            : 'linear-gradient(135deg, #ff9800, #ffb74d)',
                                          color: 'white',
                                          fontWeight: 600,
                                          boxShadow: subject.status === 'Active'
                                            ? '0 2px 8px rgba(76,175,80,0.3)'
                                            : '0 2px 8px rgba(255,152,0,0.3)',
                                        }}
                                      />
                                    </TableCell> */}
                                    <TableCell sx={{ textAlign: 'center' }}>
                                      <IconButton size="small" sx={{ color: theme.color }}>
                                        <EditIcon />
                                      </IconButton>
                                      {/* <IconButton size="small" sx={{ color: '#1565c0' }}>
                                        <DownloadIcon />
                                      </IconButton> */}
                                      <IconButton
                                        size="small"
                                        sx={{ color: '#f44336' }}
                                        onClick={() => handleDeleteSubject(course.course, subject.name)}
                                      >
                                        <DeleteIcon />
                                      </IconButton>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </Paper>
                      </Grid>
                    );
                  })}
                </Grid>
              )}
            </Box>
          )}

          {/* ─────────── TAB 1: Manage Courses & Subjects ─────────── */}
          {activeTab === 1 && (
            <Box>
              {/* Action bar */}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mb: 3 }}>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleOpenAddSubject}
                  sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '12px',
                    textTransform: 'none',
                    fontWeight: 600,
                    px: 3,
                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)',
                    },
                  }}
                >
                  Add New Subject / Course
                </Button>
              </Box>

              {/* All courses listed */}
              {courses.map((course) => {
                const theme = getTheme(course.name);
                const studentCount = allStudents.filter(s => s.course_assignment?.course_name === course.name).length;

                return (
                  <Paper
                    key={course.id}
                    sx={{
                      borderRadius: '16px',
                      overflow: 'hidden',
                      mb: 3,
                      border: `1.5px solid ${theme.border}`,
                      boxShadow: `0 6px 24px ${theme.glow}`,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: `0 10px 36px ${theme.glow}`,
                        transform: 'translateY(-1px)',
                      },
                    }}
                  >
                    {/* Course header */}
                    <Box
                      sx={{
                        background: theme.gradient,
                        px: 3,
                        py: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        position: 'relative',
                        overflow: 'hidden',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: -20,
                          right: -20,
                          width: 80,
                          height: 80,
                          borderRadius: '50%',
                          background: 'rgba(255,255,255,0.08)',
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, zIndex: 1 }}>
                        <Typography sx={{ fontSize: '1.5rem' }}>{theme.icon}</Typography>
                        <Box>
                          <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '1.05rem' }}>
                            {course.name}
                          </Typography>
                          <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.8rem' }}>
                            {course.subjects.length} subjects • {studentCount} students
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    {/* Subjects list */}
                    <Box sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                        {course.subjects.map((subject, idx) => (
                          <Chip
                            key={idx}
                            label={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <SyllabusIcon sx={{ fontSize: 14 }} />
                                <span>{subject.name}</span>
                                <span style={{ opacity: 0.6 }}>({subject.unit}u)</span>
                              </Box>
                            }
                            onDelete={() => handleDeleteSubject(course.course, subject.name)}
                            sx={{
                              borderRadius: '10px',
                              px: 1,
                              py: 2.2,
                              fontSize: '0.85rem',
                              fontWeight: 500,
                              background: '#fff',
                              border: `1.5px solid ${theme.border}`,
                              color: '#444',
                              transition: 'all 0.2s ease',
                              '& .MuiChip-deleteIcon': {
                                color: '#ccc',
                                transition: 'color 0.2s ease',
                                '&:hover': { color: '#f44336' },
                              },
                              '&:hover': {
                                borderColor: theme.color,
                                background: theme.light,
                                boxShadow: `0 4px 12px ${theme.glow}`,
                              },
                            }}
                          />
                        ))}

                        {/* Add subject button inline */}
                        <Chip
                          icon={<AddIcon sx={{ fontSize: 16 }} />}
                          label="Add Subject"
                          onClick={() => {
                            setNewSubjectCourse(course.name);
                            setIsNewCourse(false);
                            setNewSubjectName('');
                            setNewSubjectUnits('');
                            setAddSubjectOpen(true);
                          }}
                          sx={{
                            borderRadius: '10px',
                            px: 1,
                            py: 2.2,
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            border: `1.5px dashed ${theme.color}`,
                            background: 'transparent',
                            color: theme.color,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              background: theme.chipBg,
                              borderStyle: 'solid',
                            },
                          }}
                        />
                      </Box>
                    </Box>
                  </Paper>
                );
              })}
            </Box>
          )}

          {/* ─────────── TAB 2: Assign Subjects ─────────── */}
          {activeTab === 2 && (
            <Box>
              {!selectedCourse ? (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <SchoolIcon sx={{ fontSize: 72, color: '#ddd', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" sx={{ mb: 1, fontWeight: 700 }}>
                    Select a Course First
                  </Typography>
                  <Typography color="text.secondary" fontSize="0.9rem">
                    Pick a course from the selector above to assign subjects to its students
                  </Typography>
                </Box>
              ) : (
                <Box>
                  {/* ── Bulk feedback banner ── */}
                  {bulkFeedback && (
                    <Box sx={{
                      mb: 2, p: 1.8, borderRadius: '12px', display: 'flex', alignItems: 'center', gap: 1.5,
                      background: bulkFeedback === 'success' ? 'rgba(67,233,123,0.08)' : 'rgba(255,152,0,0.08)',
                      border: `1.5px solid ${bulkFeedback === 'success' ? 'rgba(67,233,123,0.25)' : 'rgba(255,152,0,0.25)'}`,
                    }}>
                      <Typography sx={{ fontWeight: 700, color: bulkFeedback === 'success' ? '#27ae60' : '#e67e22', fontSize: '0.9rem' }}>
                        {bulkFeedback === 'success' ? '✅ Subjects assigned to all students successfully!' : '⚠️ Some assignments may have failed. Please check and retry.'}
                      </Typography>
                    </Box>
                  )}

                  {/* ── Bulk Assign Section ── */}
                  <Paper sx={{
                    borderRadius: '16px', overflow: 'hidden', mb: 3,
                    border: `1.5px solid ${defaultTheme.border}`,
                    boxShadow: `0 6px 24px ${defaultTheme.glow}`,
                  }}>
                    <Box sx={{
                      background: defaultTheme.gradient, px: 3, py: 2,
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <AssignIcon sx={{ color: '#fff', fontSize: 24 }} />
                        <Box>
                          <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '1rem' }}>
                            Bulk Assign — Entire Class
                          </Typography>
                          <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.8rem' }}>
                            {studentsForSelectedCourse.length} students in {selectedCourse}
                          </Typography>
                        </Box>
                      </Box>
                      <Button
                        variant="contained" size="small" startIcon={bulkSaving ? null : <CheckIcon />}
                        disabled={bulkAssignSubjects.length === 0 || bulkSaving}
                        onClick={handleBulkAssign}
                        sx={{
                          background: 'rgba(255,255,255,0.25)', borderRadius: '10px',
                          textTransform: 'none', fontWeight: 700, color: '#fff', px: 3,
                          '&:hover': { background: 'rgba(255,255,255,0.35)' },
                          '&:disabled': { color: 'rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.1)' },
                        }}
                      >
                        {bulkSaving ? 'Saving…' : `Assign to All (${studentsForSelectedCourse.length})`}
                      </Button>
                    </Box>

                    <Box sx={{ p: 3 }}>
                      <Typography sx={{ fontWeight: 600, mb: 2, color: '#555', fontSize: '0.9rem' }}>
                        Select subjects to assign to the entire class:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                        {getSubjectsForCourseFromAPI(selectedCourse).length === 0 ? (
                          <Typography sx={{ color: '#bbb', fontStyle: 'italic', fontSize: '0.85rem' }}>No subjects defined for this course yet. Add subjects in the "Manage" tab first.</Typography>
                        ) : (
                          getSubjectsForCourseFromAPI(selectedCourse).map((subject) => {
                            const isChecked = bulkAssignSubjects.some(s => s.subject === subject.name);
                            return (
                              <Chip
                                key={subject.id ?? subject.name}
                                icon={
                                  <Checkbox checked={isChecked} size="small" sx={{ p: 0, color: defaultTheme.color, '&.Mui-checked': { color: defaultTheme.color } }} />
                                }
                                label={`${subject.name} (${subject.unit ?? subject.units ?? 0}u)`}
                                onClick={() => handleBulkSubjectToggle(subject.name, subject.unit ?? subject.units ?? '')}
                                sx={{
                                  borderRadius: '10px', px: 1, py: 2.5, fontSize: '0.85rem',
                                  fontWeight: isChecked ? 700 : 500,
                                  background: isChecked ? defaultTheme.chipBg : '#f8f9fc',
                                  border: `1.5px solid ${isChecked ? defaultTheme.color : '#e0e0e0'}`,
                                  color: isChecked ? defaultTheme.color : '#555', cursor: 'pointer',
                                  transition: 'all 0.2s ease',
                                  '&:hover': { background: defaultTheme.chipBg, borderColor: defaultTheme.color },
                                }}
                              />
                            );
                          })
                        )}
                      </Box>
                      {bulkAssignSubjects.length > 0 && (
                        <Typography sx={{ mt: 2, fontSize: '0.85rem', color: defaultTheme.color, fontWeight: 600 }}>
                          ✨ {bulkAssignSubjects.length} subject(s) will be assigned to {studentsForSelectedCourse.length} students
                        </Typography>
                      )}
                    </Box>
                  </Paper>

                  {/* ── Individual Student Cards ── */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                    <StudentIcon sx={{ color: defaultTheme.color, fontSize: 22 }} />
                    <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#333' }}>
                      Individual Assignments — {selectedCourse}
                    </Typography>
                    {loadingStudents && <Typography variant="caption" sx={{ color: '#999' }}>Loading students…</Typography>}
                  </Box>

                  {studentsForSelectedCourse.length === 0 && !loadingStudents ? (
                    <Box sx={{ textAlign: 'center', py: 5 }}>
                      <Typography color="text.secondary">No students found for this course.</Typography>
                    </Box>
                  ) : (
                    <Grid container spacing={2}>
                      {studentsForSelectedCourse.map((student) => {
                        const courseName = student.course_assignment?.course_name ||
                          student.course_details?.branch ||
                          student.course_details?.course_name ||
                          selectedCourse;
                        const assignedSubjects = getAssignedSubjectObjects(student.id);
                        const feedback = assignFeedback[student.id];
                        const studentName = getStudentName(student);
                        const studentRoll = getStudentRoll(student);
                        const studentEmail = getStudentEmail(student);

                        return (
                          <Grid item xs={12} sm={6} md={4} key={student.id}>
                            <Paper elevation={0} sx={{
                              p: 2.5, borderRadius: '16px', background: '#fff',
                              border: feedback === 'success'
                                ? '1.5px solid #43e97b'
                                : feedback === 'error'
                                  ? '1.5px solid #f5576c'
                                  : `1px solid ${defaultTheme.border}`,
                              transition: 'all 0.3s ease',
                              boxShadow: feedback === 'success'
                                ? '0 4px 20px rgba(67,233,123,0.2)'
                                : feedback === 'error'
                                  ? '0 4px 20px rgba(245,87,108,0.2)'
                                  : 'none',
                              '&:hover': {
                                boxShadow: `0 8px 24px ${defaultTheme.glow}`,
                                transform: 'translateY(-3px)',
                                borderColor: defaultTheme.color,
                              },
                            }}>
                              {/* Student info */}
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                                <Avatar sx={{ width: 44, height: 44, background: defaultTheme.gradient, fontWeight: 700, fontSize: '1rem' }}>
                                  {studentName[0]?.toUpperCase() || '?'}
                                </Avatar>
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                  <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#333', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {studentName}
                                  </Typography>
                                  <Typography sx={{ fontSize: '0.72rem', color: '#999', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {studentRoll} · {studentEmail}
                                  </Typography>
                                </Box>
                              </Box>

                              {/* Feedback badge */}
                              {feedback && (
                                <Box sx={{
                                  mb: 1, px: 1.5, py: 0.5, borderRadius: '8px',
                                  background: feedback === 'success' ? 'rgba(67,233,123,0.1)' : 'rgba(245,87,108,0.1)',
                                  display: 'inline-block',
                                }}>
                                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 700,
                                    color: feedback === 'success' ? '#27ae60' : '#e74c3c' }}>
                                    {feedback === 'success' ? '✅ Saved!' : '❌ Failed'}
                                  </Typography>
                                </Box>
                              )}

                              {/* Assigned subjects display */}
                              <Box sx={{ mb: 2, minHeight: 28 }}>
                                {assignedSubjects.length > 0 ? (
                                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {assignedSubjects.slice(0, 3).map((subj) => (
                                      <Chip key={subj.subject} label={subj.subject} size="small" sx={{
                                        background: defaultTheme.chipBg, color: defaultTheme.color,
                                        fontSize: '0.65rem', fontWeight: 600, height: 22,
                                      }} />
                                    ))}
                                    {assignedSubjects.length > 3 && (
                                      <Chip label={`+${assignedSubjects.length - 3}`} size="small" sx={{
                                        background: defaultTheme.color, color: '#fff',
                                        fontSize: '0.65rem', fontWeight: 700, height: 22,
                                      }} />
                                    )}
                                  </Box>
                                ) : (
                                  <Typography sx={{ color: '#bbb', fontSize: '0.78rem', fontStyle: 'italic' }}>
                                    No subjects assigned yet
                                  </Typography>
                                )}
                              </Box>

                              {/* Assign button */}
                              <Button fullWidth variant="outlined" size="small"
                                startIcon={savingStudentId === student.id ? null : <AssignIcon />}
                                disabled={savingStudentId === student.id}
                                onClick={() => handleOpenModal(student)}
                                sx={{
                                  borderRadius: '10px', textTransform: 'none', fontWeight: 600, fontSize: '0.8rem',
                                  borderColor: defaultTheme.color, color: defaultTheme.color, py: 0.8,
                                  '&:hover': { borderColor: defaultTheme.color, background: defaultTheme.chipBg },
                                }}
                              >
                                {savingStudentId === student.id ? 'Saving…' : 'Assign Subjects'}
                              </Button>
                            </Paper>
                          </Grid>
                        );
                      })}
                    </Grid>
                  )}
                </Box>
              )}
            </Box>
          )}
        </Box>
      </Paper>

      {/* ═══════════════════ ADD SUBJECT MODAL ═══════════════════ */}
      <Modal open={addSubjectOpen} onClose={handleCloseAddSubject}>
        <Box sx={modalStyle}>
          {/* Modal Header */}
          <Box
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              p: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: -20,
                right: -20,
                width: 100,
                height: 100,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.08)',
              },
            }}
          >
            <Box sx={{ zIndex: 1 }}>
              <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '1.2rem' }}>
                ✨ Add New Subject
              </Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem', mt: 0.5 }}>
                Add a subject to an existing or new course
              </Typography>
            </Box>
            <IconButton onClick={handleCloseAddSubject} sx={{ color: 'white', zIndex: 1 }}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Modal Content */}
          <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {/* Course selection */}
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography sx={{ fontWeight: 600, fontSize: '0.9rem', color: '#333' }}>Course</Typography>
                <Button
                  size="small"
                  onClick={() => { setIsNewCourse(!isNewCourse); setNewCourseName(''); }}
                  sx={{ textTransform: 'none', fontSize: '0.78rem', color: '#667eea', fontWeight: 600 }}
                >
                  {isNewCourse ? '← Choose Existing' : '+ Create New Course'}
                </Button>
              </Box>
              {isNewCourse ? (
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Enter new course name"
                  value={newCourseName}
                  onChange={(e) => setNewCourseName(e.target.value)}
                  sx={enhancedInputStyles}
                />
              ) : (
                <TextField
                  fullWidth
                  select
                  size="small"
                  value={newSubjectCourse}
                  onChange={(e) => setNewSubjectCourse(e.target.value)}
                  SelectProps={{ native: true }}
                  sx={enhancedInputStyles}
                >
                  {syllabusData.map((c) => (
                    <option key={c.id} value={c.course}>{c.course}</option>
                  ))}
                </TextField>
              )}
            </Box>

            {/* Subject name */}
            <Box>
              <Typography sx={{ fontWeight: 600, fontSize: '0.9rem', color: '#333', mb: 1 }}>
                Subject Name
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="e.g. Machine Learning"
                value={newSubjectName}
                onChange={(e) => setNewSubjectName(e.target.value)}
                sx={enhancedInputStyles}
              />
            </Box>

            {/* Units */}
            <Box>
              <Typography sx={{ fontWeight: 600, fontSize: '0.9rem', color: '#333', mb: 1 }}>
                Number of Units
              </Typography>
              <TextField
                fullWidth
                size="small"
                type="number"
                placeholder="e.g. 4"
                value={newSubjectUnits}
                onChange={(e) => setNewSubjectUnits(e.target.value)}
                inputProps={{ min: 1, max: 20 }}
                sx={enhancedInputStyles}
              />
            </Box>
          </Box>

          {/* Modal Footer */}
          <Box sx={{ p: 3, pt: 0, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={handleCloseAddSubject}
              sx={{
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 600,
                borderColor: '#667eea',
                color: '#667eea',
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: '#764ba2',
                  bgcolor: 'rgba(102, 126, 234, 0.05)',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSaveNewSubject}
              disabled={!newSubjectName.trim() || (isNewCourse ? !newCourseName.trim() : !newSubjectCourse)}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 700,
                px: 4,
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)',
                },
                '&.Mui-disabled': { background: '#ccc', color: '#fff' },
              }}
            >
              ✨ Add Subject
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* ═══════════════════ INDIVIDUAL ASSIGN MODAL ═══════════════════ */}
      <Modal open={modalOpen} onClose={handleCloseModal}>
        <Box sx={modalStyle}>
          {/* Modal Header */}
          <Box
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              p: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  width: 50,
                  height: 50,
                  borderRadius: '14px',
                  background: 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AssignIcon sx={{ color: '#fff', fontSize: 28 }} />
              </Box>
              <Box>
                <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '1.2rem' }}>
                  Assign Subjects
                </Typography>
                {selectedStudent && (
                  <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem' }}>
                    {getStudentName(selectedStudent)} · {selectedStudent.course_assignment?.course_name || selectedCourse}
                  </Typography>
                )}
              </Box>
            </Box>
            <IconButton onClick={handleCloseModal} sx={{ color: 'white' }}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Modal Content */}
          <Box sx={{ p: 3, overflow: 'auto', flex: 1 }}>
            <Typography sx={{ fontWeight: 600, mb: 2, color: '#333' }}>
              Select subjects to assign:
            </Typography>

            <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
              {loadingAssignments && (
                <Typography sx={{ color: '#999', fontStyle: 'italic', textAlign: 'center', py: 2, fontSize: '0.85rem' }}>
                  Loading current assignments…
                </Typography>
              )}
              {!loadingAssignments && selectedStudent && getSubjectsForCourseFromAPI(
                selectedStudent.course_assignment?.course_name ||
                selectedStudent.course_details?.branch ||
                selectedStudent.course_details?.course_name ||
                selectedCourse
              ).length === 0 && (
                <Typography sx={{ color: '#999', fontStyle: 'italic', textAlign: 'center', py: 3 }}>
                  No subjects available for this course. Add subjects in the Manage tab first.
                </Typography>
              )}
              {!loadingAssignments && selectedStudent && getSubjectsForCourseFromAPI(
                selectedStudent.course_assignment?.course_name ||
                selectedStudent.course_details?.branch ||
                selectedStudent.course_details?.course_name ||
                selectedCourse
              ).map((subject, idx) => {
                const subjectList = getSubjectsForCourseFromAPI(
                  selectedStudent.course_assignment?.course_name ||
                  selectedStudent.course_details?.branch ||
                  selectedStudent.course_details?.course_name ||
                  selectedCourse
                );
                return (
                <Box key={subject.id ?? subject.name}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={tempSelectedSubjects.some(s => s.subject === subject.name)}
                        onChange={() => handleSubjectToggle(subject.name, subject.unit ?? subject.units ?? '')}
                        sx={{ color: '#667eea', '&.Mui-checked': { color: '#667eea' } }}
                      />
                    }
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography>{subject.name}</Typography>
                        <Chip label={`${subject.unit ?? subject.units ?? 0} Units`} size="small"
                          sx={{ background: '#e3f2fd', color: '#1565c0', fontSize: '0.7rem', height: 20 }} />
                      </Box>
                    }
                    sx={{ width: '100%', m: 0, py: 1, px: 1, borderRadius: '8px', '&:hover': { background: 'rgba(102,126,234,0.05)' } }}
                  />
                  {idx < subjectList.length - 1 && <Divider />}
                </Box>
                );
              })}
            </Box>
          </Box>

          {/* Modal Footer */}
          <Box sx={{ p: 3, pt: 0, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={handleCloseModal}
              sx={{
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 600,
                borderColor: '#667eea',
                color: '#667eea',
                '&:hover': {
                  borderColor: '#764ba2',
                  bgcolor: 'rgba(102, 126, 234, 0.05)',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSaveAssignments}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 700,
                px: 4,
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)',
                },
              }}
            >
              ✨ Save
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default SyllabusPanel;
