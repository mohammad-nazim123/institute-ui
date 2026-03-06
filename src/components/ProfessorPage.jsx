import { useState,useEffect } from 'react';
import {
  Box,
  Typography,
  Avatar,
  Chip,
  Tabs,
  Tab,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Modal,
  IconButton,
  Divider,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Switch,
} from '@mui/material';
import {
  MoreVert as MoreIcon,
  School as SchoolIcon,
  CalendarMonth as CalendarIcon,
  Schedule as ScheduleIcon,
  Room as RoomIcon,
  Person as PersonIcon,
  MenuBook as SubjectIcon,
  Close as CloseIcon,
  AccountBalanceWallet as WalletIcon,
  QrCode2 as QrIcon,
  CheckCircle as PaidIcon,
  Warning as PendingIcon,
  ArrowBack as BackIcon,
  Logout as LogoutIcon,
  Badge as BadgeIcon,
  Business as DeptIcon,
  WorkHistory as ExpIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  HowToReg as AttendanceIcon,
  EventNote as ExamDutyIcon,
  Save as SaveIcon,
  Star as StarIcon,
  BeachAccess as HolidayIcon,
} from '@mui/icons-material';
import { useNavigate,useLocation } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
// import { useNavigate, useLocation } from 'react-router-dom';
import { getProfessor,getStudents,markAttendance,getAttendance,getSchedule,getExamSchedule,getPayments } from './apis/professors_api';
// import { useEffect } from 'react';
import { getProfessorDbId, setProfessorDbId, local, clearSession } from '../utils/storage';

/* ───────── Sample Data ───────── */
const professorData = {
  name: 'Dr. Sarah Wilson',
  employeeId: 'EMP-CS-2018-042',
  facultyId: 'FAC-CS-12',
  department: 'Computer Science & Engineering',
  designation: 'Associate Professor',
  experience: '8 Years',
  phone: '9876543210',
  email: 'sarah.wilson@edu.com',
  address: '12 Tech Park, Koramangala, Bangalore — 560034',
  photo: null,
  subjects: [
    'Data Structures & Algorithms',
    'Machine Learning',
    'Artificial Intelligence',
    'Python Programming',
  ],
};

const classOptions = [
  { label: 'B.Tech CS — 3rd Year — Section A', value: 'btcs3a' },
  { label: 'B.Tech CS — 2nd Year — Section B', value: 'btcs2b' },
  { label: 'B.Tech CS — 1st Year — Section A', value: 'btcs1a' },
];

const branchOptions = ['Computer Science', 'Mechanical Engineering', 'Civil Engineering', 'Electrical Engineering', 'Information Technology'];

const semesterOptions = ['1st Semester', '2nd Semester', '3rd Semester', '4th Semester', '5th Semester', '6th Semester', '7th Semester', '8th Semester'];

const mockStudents = [
  { id: 1, rollNo: 'CS001', name: 'John Doe', present: true },
  { id: 2, rollNo: 'CS002', name: 'Alice Brown', present: true },
  { id: 3, rollNo: 'CS003', name: 'Bob Wilson', present: false },
  { id: 4, rollNo: 'CS004', name: 'Jane Smith', present: true },
  { id: 5, rollNo: 'CS005', name: 'Charlie Davis', present: true },
  { id: 6, rollNo: 'CS006', name: 'Diana Lee', present: false },
  { id: 7, rollNo: 'CS007', name: 'Mike Johnson', present: true },
  { id: 8, rollNo: 'CS008', name: 'Emma Taylor', present: true },
  { id: 9, rollNo: 'CS009', name: 'Frank Miller', present: true },
  { id: 10, rollNo: 'CS010', name: 'Grace Kim', present: false },
];

const dailySchedule = {
  Monday: [
    { time: '9:00 – 10:00', subject: 'Data Structures & Algorithms', room: 'Room 201', class: 'B.Tech CS 3A' },
    { time: '11:00 – 12:00', subject: 'Machine Learning', room: 'Room 305', class: 'B.Tech CS 3A' },
    { time: '2:00 – 3:30', subject: 'DSA Lab', room: 'Lab 301', class: 'B.Tech CS 3A' },
  ],
  Tuesday: [
    { time: '9:00 – 10:00', subject: 'Artificial Intelligence', room: 'Room 402', class: 'B.Tech CS 2B' },
    { time: '10:15 – 11:15', subject: 'Python Programming', room: 'Lab 102', class: 'B.Tech CS 1A' },
    { time: '2:00 – 3:00', subject: 'Data Structures & Algorithms', room: 'Room 201', class: 'B.Tech CS 3A' },
  ],
  Wednesday: [
    { time: '9:00 – 10:00', subject: 'Machine Learning', room: 'Room 305', class: 'B.Tech CS 3A' },
    { time: '11:30 – 1:00', subject: 'ML Lab', room: 'Lab 303', class: 'B.Tech CS 3A' },
    { time: '2:00 – 3:00', subject: 'Python Programming', room: 'Lab 102', class: 'B.Tech CS 1A' },
  ],
  Thursday: [
    { time: '9:00 – 10:00', subject: 'Artificial Intelligence', room: 'Room 402', class: 'B.Tech CS 2B' },
    { time: '10:15 – 11:15', subject: 'Data Structures & Algorithms', room: 'Room 201', class: 'B.Tech CS 3A' },
    { time: '2:00 – 3:30', subject: 'AI Lab', room: 'Lab 304', class: 'B.Tech CS 2B' },
  ],
  Friday: [
    { time: '9:00 – 10:00', subject: 'Machine Learning', room: 'Room 305', class: 'B.Tech CS 3A' },
    { time: '10:15 – 11:15', subject: 'Python Programming', room: 'Lab 102', class: 'B.Tech CS 1A' },
    { time: '11:30 – 12:30', subject: 'Data Structures & Algorithms', room: 'Room 201', class: 'B.Tech CS 3A' },
  ],
  Saturday: [
    { time: '9:00 – 10:00', subject: 'Revision / Tutorial', room: 'Room 101', class: 'B.Tech CS 3A' },
    { time: '10:15 – 11:15', subject: 'Artificial Intelligence', room: 'Room 402', class: 'B.Tech CS 2B' },
  ],
};

const examDuties = [
  { date: 'Mar 15, 2026', exam: 'DSA — Mid-Term', time: '10:00 AM – 1:00 PM', room: 'Hall A', role: 'Invigilator' },
  { date: 'Mar 19, 2026', exam: 'DBMS — Mid-Term', time: '2:00 PM – 5:00 PM', room: 'Hall B', role: 'Invigilator' },
  { date: 'Mar 23, 2026', exam: 'Software Eng — Mid-Term', time: '2:00 PM – 5:00 PM', room: 'Hall C', role: 'Flying Squad' },
];

const salaryDetails = {
  basic: 55000,
  hra: 22000,
  da: 11000,
  specialAllowance: 8000,
  grossSalary: 96000,
  deductions: {
    pf: 6600,
    tax: 8500,
    professionalTax: 200,
  },
  totalDeductions: 15300,
  netSalary: 80700,
  payments: [
    { month: 'January 2026', amount: 80700, status: 'Paid' },
    { month: 'February 2026', amount: 80700, status: 'Pending' },
  ],
};

/* ───────── Gradients ───────── */
const g = {
  primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  card: 'linear-gradient(135deg, rgba(102,126,234,.06) 0%, rgba(118,75,162,.06) 100%)',
  sidebar: 'linear-gradient(180deg, #667eea 0%, #764ba2 100%)',
  warm: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  green: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  amber: 'linear-gradient(135deg, #f7971e 0%, #ffd200 100%)',
  teal: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  mint: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
  lavender: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
};

const dayGradients = {
  Monday: g.primary,
  Tuesday: g.teal,
  Wednesday: g.mint,
  Thursday: g.amber,
  Friday: g.warm,
  Saturday: g.lavender,
};

/* ───────── Helpers ───────── */
const InfoRow = ({ icon, label, value }) => (
  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1.8 }}>
    <Box
      sx={{
        minWidth: 32, height: 32, borderRadius: '10px',
        background: 'rgba(102,126,234,.12)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', mt: '2px',
      }}
    >
      {icon}
    </Box>
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Typography sx={{ fontSize: '0.68rem', color: 'rgba(255,255,255,.55)', textTransform: 'uppercase', letterSpacing: '.8px', lineHeight: 1 }}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: '0.88rem', color: '#fff', fontWeight: 600, mt: 0.3, wordBreak: 'break-word' }}>
        {value}
      </Typography>
    </Box>
  </Box>
);

const ScheduleCard = ({ item, index }) => (
  <Paper
    sx={{
      display: 'flex', alignItems: 'stretch', borderRadius: '16px', overflow: 'hidden',
      boxShadow: '0 4px 20px rgba(102,126,234,.08)',
      transition: 'all .3s ease',
      animation: `fadeInUp .4s ease ${index * 0.07}s both`,
      '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 8px 30px rgba(102,126,234,.18)' },
    }}
  >
    <Box sx={{ width: 6, background: g.primary, flexShrink: 0 }} />
    <Box sx={{ flex: 1, p: 2.5, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
      <Box sx={{ minWidth: 130 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.3 }}>
          <ScheduleIcon sx={{ fontSize: 16, color: '#667eea' }} />
          <Typography sx={{ fontSize: '0.75rem', color: '#999', fontWeight: 500 }}>TIME</Typography>
        </Box>
        <Typography sx={{ fontWeight: 700, color: '#1a1a2e', fontSize: '0.95rem' }}>{item.time}</Typography>
      </Box>
      <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
      <Box sx={{ flex: 1, minWidth: 150 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.3 }}>
          <SubjectIcon sx={{ fontSize: 16, color: '#764ba2' }} />
          <Typography sx={{ fontSize: '0.75rem', color: '#999', fontWeight: 500 }}>SUBJECT</Typography>
        </Box>
        <Typography sx={{ fontWeight: 600, color: '#1a1a2e', fontSize: '0.92rem' }}>{item.subject}</Typography>
      </Box>
      <Box sx={{ minWidth: 80 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.3 }}>
          <RoomIcon sx={{ fontSize: 16, color: '#4facfe' }} />
          <Typography sx={{ fontSize: '0.75rem', color: '#999', fontWeight: 500 }}>ROOM</Typography>
        </Box>
        <Chip label={item.room} size="small" sx={{ background: 'rgba(79,172,254,.1)', color: '#4facfe', fontWeight: 600, fontSize: '0.8rem' }} />
      </Box>
      <Box sx={{ minWidth: 120 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.3 }}>
          <SchoolIcon sx={{ fontSize: 16, color: '#f5576c' }} />
          <Typography sx={{ fontSize: '0.75rem', color: '#999', fontWeight: 500 }}>CLASS</Typography>
        </Box>
        <Typography sx={{ fontWeight: 600, color: '#555', fontSize: '0.88rem' }}>{item.class}</Typography>
      </Box>
    </Box>
  </Paper>
);

/* ═══════════════════ Main Component ═══════════════════ */
const ProfessorPage = () => {
  useEffect(() => {
    document.title = 'EduConnect | Professor';
  }, []);

  const navigate = useNavigate();
  const [tabIdx, setTabIdx] = useState(0);

  const [moreOpen, setMoreOpen] = useState(false);
  const [professorDetails, setProfessorDetails] = useState(null);
  const [storedProfId, setStoredProfId] = useState(null);

  const location = useLocation();
  const { id, prof_key } = location.state || {};

  // Resolve encrypted professor ID from storage once on mount
  useEffect(() => {
    getProfessorDbId().then(val => setStoredProfId(val));
  }, []);

  const [studentsData,setStudentsData] = useState([])
  const [weeklySchedule,setWeeklySchedule] = useState([])
  const [examScheduleData,setExamScheduleData] = useState([])
  const [paymentData,setPaymentData] = useState([])
  const [paymentYear,setPaymentYear] = useState(new Date().getFullYear())
  // Use local date (not UTC) so IST users always see the correct date
  const localDateStr = (d = new Date()) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const todayStr = localDateStr();
  const [attendanceDate, setAttendanceDate] = useState(todayStr);
  const [editAttOpen, setEditAttOpen] = useState(false);
  const [editPickerDate, setEditPickerDate] = useState(todayStr);

  async function getStudentData(dateOverride) {
    const targetDate = dateOverride ?? attendanceDate;
    try {
      const res = await getStudents();
      const fetchedStudents = res.body[0]?.students ?? [];

      // Fetch attendance for every student in parallel
      const attendanceResults = await Promise.all(
        fetchedStudents.map((s) => getAttendance(s.id))
      );

      // Merge present flag into each student for the target date
      const merged = fetchedStudents.map((s, idx) => {
        const records = attendanceResults[idx]?.body ?? [];
        const record = Array.isArray(records)
          ? records.find((r) => r.date === targetDate)
          : null;
        return {
          ...s,
          present: record ? (record.status ?? record.is_present ?? false) : false,
        };
      });

      setStudentsData(merged);
    } catch (err) {
      console.error('Failed to load students/attendance:', err);
    }
  }


  function getWeeklySchedule(){
    getSchedule().then((res) => {
      setWeeklySchedule(res.body[0].weekly_schedules);
    })
  }

  function getExamScheduleData(){
    getExamSchedule().then((res) => {
      setExamScheduleData(res.body[0]?.exam_schedules ?? []);
    })
  }

  function fetchPayments(){
    getPayments().then((res) => {
      const raw = res.body;
      // API returns [{professors_payments: [...]}]
      const list = Array.isArray(raw)
        ? (raw[0]?.professors_payments ?? raw[0]?.payments ?? raw)
        : (raw?.professors_payments ?? raw?.payments ?? []);
      setPaymentData(list);
      console.log('payments list', list);
    }).catch((err) => console.error('payments error', err));
  }

  useEffect(() => {
    // Determine the correct ID field based on typical django responses
    const profId = id ? id : storedProfId;
    getWeeklySchedule();
    getExamScheduleData();
    fetchPayments();
    getStudentData();
    if (profId) {
      getProfessor(profId).then(data => {
        console.log("dataprof", data);
        setProfessorDetails(data.body);
        setProfessorDbId(profId);
      });
    }
  }, [storedProfId]);

  // Re-fetch attendance whenever the selected date changes
  useEffect(() => { getStudentData(attendanceDate); }, [attendanceDate]);

  console.log("professorDetails",professorDetails)

  // Attendance state
  const [attClass, setAttClass] = useState(() => local.get('att_class') || '');
  const [attBranch, setAttBranch] = useState(() => local.get('att_branch') || '');
  const [attSemester, setAttSemester] = useState(() => local.get('att_semester') || '');
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [students, setStudents] = useState(mockStudents);
  const [submitted, setSubmitted] = useState(false);

  // Calendar / Holiday state
  const calNow = new Date();
  const [selectedYear, setSelectedYear] = useState(calNow.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(calNow.getMonth());
  const [holidays, setHolidays] = useState([]);
  const [holidayMode, setHolidayMode] = useState(false);

  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const monthDays = Array.from({ length: daysInMonth }, (_, i) => {
    const d = new Date(selectedYear, selectedMonth, i + 1);
    return { day: i + 1, date: d, weekday: d.getDay() };
  });

  const toggleHoliday = (day) => {
    if (!holidayMode) return;
    const dateKey = `${selectedYear}-${selectedMonth}-${day}`;
    setHolidays(prev => prev.includes(dateKey) ? prev.filter(k => k !== dateKey) : [...prev, dateKey]);
  };
  const weekDayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthLabels = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const yearOptions = Array.from({ length: 11 }, (_, i) => calNow.getFullYear() - 5 + i);

  const toggleStudent = (id) => {
    setStudentsData((prev) => prev.map((s) =>
      s.id === id ? { ...s, present: !s.present } : s
    ));
    setSubmitted(false);
  };

  const [submitting, setSubmitting] = useState(false);

  const handleSaveSettings = () => {
    local.set('att_class', attClass);
    local.set('att_branch', attBranch);
    local.set('att_semester', attSemester);
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2500);
  };

  const handleSubmit = () => {
    if (submitting || studentsData.length === 0) return;
    setSubmitting(true);
    const payload = {
      date: attendanceDate,
      attendance: studentsData.map((s) => ({
        student_id: s.id,
        status: s.present ? true : false,
        class_name: s.course_details?.course_name ?? '',
        branch: s.course_details?.branch ?? '',
        year_semester: s.admission_details?.academic_year ?? '',
        marked_by: professorDetails?.id,
      })),
    };
    console.log('batch attendance payload', payload);
    markAttendance(payload)
      .then((res) => {
        console.log('attendance submitted', res);
        setSubmitted(true);
      })
      .catch((err) => console.error('attendance error', err))
      .finally(() => setSubmitting(false));
  };

  const now = new Date();
  const formattedDay = now.toLocaleDateString('en-US', { weekday: 'long' });
  const formattedDate = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  // const presentCount = studentsData.filter((s) => s.present).length;

  const qrData = JSON.stringify({
    name: professorData.name,
    facultyId: professorData.facultyId,
    department: professorData.department,
    subjects: professorData.subjects,
  });

  return (
    <Box sx={{ display: 'flex', width: '100%', height: '100vh', overflow: 'hidden', background: '#f0f2f5' }}>
      {/* ────── LEFT SIDEBAR (20%) ────── */}
      <Box
        sx={{
          width: '20%', minWidth: 280, maxWidth: 340, height: '100%',
          background: g.sidebar,
          display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden',
        }}
      >
        <Box sx={{ position: 'absolute', top: -40, right: -40, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,.07)' }} />
        <Box sx={{ position: 'absolute', bottom: '30%', left: -30, width: 90, height: 90, borderRadius: '50%', background: 'rgba(255,255,255,.05)', animation: 'float 8s ease-in-out infinite' }} />

        {/* Back */}
        {/* <Box sx={{ p: 2, pb: 0, zIndex: 1 }}>
          <IconButton
            onClick={() => navigate('/dashboard')}
            sx={{
              color: 'rgba(255,255,255,.75)', background: 'rgba(255,255,255,.1)',
              '&:hover': { background: 'rgba(255,255,255,.2)' }, borderRadius: '12px',
            }}
          >students
            <BackIcon />
          </IconButton>
        </Box> */}

        {/* Scrollable */}
        <Box sx={{ flex: 1, overflowY: 'auto', px: 3, pb: 3, zIndex: 1, '&::-webkit-scrollbar': { width: 4 }, '&::-webkit-scrollbar-thumb': { background: 'rgba(255,255,255,.25)', borderRadius: 2 } }}>
          {/* Avatar */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 1, mb: 3 }}>
            <Avatar
              sx={{
                width: 100, height: 100, background: 'rgba(255,255,255,.18)',
                border: '4px solid rgba(255,255,255,.35)', fontSize: '2.2rem', fontWeight: 700,
                mb: 1.5, boxShadow: '0 8px 30px rgba(0,0,0,.2)',
              }}
            >
              {professorDetails?professorDetails.name[0]:''}
            </Avatar>
            {/* <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '1.15rem', textAlign: 'center' }}>
              {professorDetails?professorDetails.name:''}
            </Typography> */}
            <Chip
              label={professorDetails?professorDetails.experience.designation:''}
              size="small"
              sx={{ mt: 0.8, background: 'rgba(255,255,255,.18)', color: '#fff', fontWeight: 600, fontSize: '0.78rem', backdropFilter: 'blur(6px)' }}
            />
          </Box>

          <InfoRow icon={<BadgeIcon sx={{ fontSize: 16, color: '#667eea' }} />} label="Employee / Faculty ID" value={`${professorDetails?professorDetails.admin_employement.employee_id:''}`} />
          <InfoRow icon={<DeptIcon sx={{ fontSize: 16, color: '#667eea' }} />} label="Department" value={professorDetails?professorDetails.experience.department:''} />
          <InfoRow icon={<StarIcon sx={{ fontSize: 16, color: '#667eea' }} />} label="Designation" value={professorDetails?professorDetails.experience.designation:''} />
          <InfoRow icon={<ExpIcon sx={{ fontSize: 16, color: '#667eea' }} />} label="Experience" value={professorDetails?professorDetails.experience.teaching_experience:''} />
          <InfoRow icon={<PhoneIcon sx={{ fontSize: 16, color: '#667eea' }} />} label="Phone" value={professorDetails?professorDetails.phone_number:''} />
          <InfoRow icon={<EmailIcon sx={{ fontSize: 16, color: '#667eea' }} />} label="Email" value={professorDetails?professorDetails.email:''} />
          <InfoRow icon={<LocationIcon sx={{ fontSize: 16, color: '#667eea' }} />} label="Address" value={professorDetails?professorDetails.address.current_address:''} />

          {/* Subjects */}
          <Box sx={{ mt: 2, mb: 2 }}>
            <Typography sx={{ fontSize: '0.68rem', color: 'rgba(255,255,255,.55)', textTransform: 'uppercase', letterSpacing: '.8px', mb: 1 }}>
              Subjects Handled
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.7 }}>
              {professorData.subjects.map((s) => (
                <Chip key={s} label={s} size="small" sx={{ background: 'rgba(255,255,255,.12)', color: '#fff', fontSize: '0.72rem', fontWeight: 500, backdropFilter: 'blur(4px)', '&:hover': { background: 'rgba(255,255,255,.22)' } }} />
              ))}
            </Box>
          </Box>
        </Box>

        <Typography sx={{ textAlign: 'center', color: 'rgba(255,255,255,.35)', fontSize: '0.7rem', py: 1.5, zIndex: 1 }}>
          EduConnect • Faculty Portal
        </Typography>
      </Box>

      {/* ────── RIGHT PANEL (80%) ────── */}
      <Box sx={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top Bar */}
        <Box
          sx={{
            px: 4, py: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: '#fff', borderBottom: '1px solid rgba(0,0,0,.06)', boxShadow: '0 2px 12px rgba(0,0,0,.03)',
          }}
        >
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: '1.35rem', background: g.primary, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {professorDetails?professorDetails.name:''}
            </Typography>
            <Typography sx={{ color: '#888', fontSize: '0.85rem' }}>
              {professorDetails?professorDetails.experience.department:''} — {professorDetails?professorDetails.experience.designation:''}
            </Typography>
          </Box>
          <Button
            variant="contained" startIcon={<MoreIcon />}
            onClick={() => setMoreOpen(true)}
            sx={{
              background: g.primary, borderRadius: '14px', textTransform: 'none', fontWeight: 600, px: 3,
              boxShadow: '0 4px 18px rgba(102,126,234,.35)',
              '&:hover': { boxShadow: '0 6px 24px rgba(102,126,234,.5)' },
            }}
          >
            More
          </Button>
        </Box>

        {/* Tabs */}
        <Box sx={{ px: 4, pt: 2, background: '#fff' }}>
          <Tabs
            value={tabIdx} onChange={(_, v) => setTabIdx(v)}
            sx={{
              '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontSize: '0.95rem', minHeight: 48, color: '#888', '&.Mui-selected': { color: '#667eea' } },
              '& .MuiTabs-indicator': { background: g.primary, height: 3, borderRadius: '3px 3px 0 0' },
            }}
          >
            <Tab icon={<AttendanceIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="Take Attendance" />
            <Tab icon={<CalendarIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="Schedule" />
            <Tab icon={<ExamDutyIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="Exam Duties" />
            <Tab icon={<HolidayIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="Calendar" />
          </Tabs>
        </Box>

        {/* Tab Content */}
        <Box sx={{ flex: 1, overflow: 'auto', px: 4, py: 3 }}>
          {/* ── Take Attendance ── */}
          {tabIdx === 0 && (
            <Box>
              {/* Date + Day Banner */}
              {/* <Box sx={{ mb: 3, p: 2.5, borderRadius: '16px', background: g.primary, display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 4px 18px rgba(102,126,234,.25)' }}>
                <Box>
                  <Typography sx={{ fontSize: '0.7rem', color: 'rgba(255,255,255,.7)', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', mb: 0.3 }}>Today's Attendance</Typography>
                  <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', lineHeight: 1.1 }}>{formattedDay}</Typography>
                  <Typography sx={{ fontSize: '0.9rem', color: 'rgba(255,255,255,.8)', fontWeight: 500, mt: 0.3 }}>{formattedDate}</Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  {attClass && <Chip label={`Class: ${classOptions.find(c => c.value === attClass)?.label || attClass}`} size="small" sx={{ mb: 0.5, display: 'block', background: 'rgba(255,255,255,.2)', color: '#fff', fontWeight: 600 }} />}
                  {attBranch && <Chip label={`Branch: ${attBranch}`} size="small" sx={{ mb: 0.5, display: 'block', background: 'rgba(255,255,255,.2)', color: '#fff', fontWeight: 600 }} />}
                  {attSemester && <Chip label={`Sem: ${attSemester}`} size="small" sx={{ display: 'block', background: 'rgba(255,255,255,.2)', color: '#fff', fontWeight: 600 }} />}
                </Box>
              </Box> */}

              {/* Filters */}
              <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
                <FormControl sx={{ minWidth: 250 }}>
                  <InputLabel sx={{ '&.Mui-focused': { color: '#667eea' } }}>Select Class</InputLabel>
                  <Select
                    value={attClass} label="Select Class" onChange={(e) => setAttClass(e.target.value)}
                    sx={{ borderRadius: '14px', background: '#fff', '& .MuiOutlinedInput-notchedOutline': { borderColor: '#ddd' }, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#667eea' }, '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#667eea' } }}
                  >
                    {classOptions.map((c) => <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>)}
                  </Select>
                </FormControl>
                <FormControl sx={{ minWidth: 220 }}>
                  <InputLabel sx={{ '&.Mui-focused': { color: '#667eea' } }}>Select Branch</InputLabel>
                  <Select
                    value={attBranch} label="Select Branch" onChange={(e) => setAttBranch(e.target.value)}
                    sx={{ borderRadius: '14px', background: '#fff', '& .MuiOutlinedInput-notchedOutline': { borderColor: '#ddd' }, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#667eea' }, '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#667eea' } }}
                  >
                    {branchOptions.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                  </Select>
                </FormControl>
                <FormControl sx={{ minWidth: 200 }}>
                  <InputLabel sx={{ '&.Mui-focused': { color: '#667eea' } }}>Select Semester</InputLabel>
                  <Select
                    value={attSemester} label="Select Semester" onChange={(e) => setAttSemester(e.target.value)}
                    sx={{ borderRadius: '14px', background: '#fff', '& .MuiOutlinedInput-notchedOutline': { borderColor: '#ddd' }, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#667eea' }, '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#667eea' } }}
                  >
                    {semesterOptions.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                  </Select>
                </FormControl>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSaveSettings}
                  disabled={!attClass || !attBranch || !attSemester}
                  sx={{
                    background: settingsSaved ? 'linear-gradient(135deg,#43e97b,#38f9d7)' : g.primary,
                    borderRadius: '14px', textTransform: 'none', fontWeight: 600, px: 3, py: 1.7,
                    boxShadow: '0 4px 14px rgba(102,126,234,.3)',
                    transition: 'background .4s',
                    '&:hover': { boxShadow: '0 6px 20px rgba(102,126,234,.5)' },
                  }}
                >
                  {settingsSaved ? 'Saved ✓' : 'Save Settings'}
                </Button>
              </Box>

              {/* Attendance date banner */}
              <Box sx={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                mb: 3, p: 1.6, borderRadius: '14px',
                background: attendanceDate === todayStr ? g.primary : g.amber,
                color: '#fff',
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalendarIcon sx={{ fontSize: 22 }} />
                  <Box>
                    <Typography sx={{ fontSize: '0.68rem', opacity: .8, textTransform: 'uppercase', letterSpacing: '.6px' }}>Attendance For</Typography>
                    <Typography sx={{ fontWeight: 800, fontSize: '1rem' }}>
                      {new Date(attendanceDate + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}
                    </Typography>
                  </Box>
                </Box>
                {attendanceDate !== todayStr && (
                  <Button
                    size="small"
                    onClick={() => setAttendanceDate(todayStr)}
                    sx={{ color: '#fff', background: 'rgba(255,255,255,.2)', borderRadius: '10px', textTransform: 'none', fontWeight: 700, fontSize: '0.72rem', px: 1.5, '&:hover': { background: 'rgba(255,255,255,.35)' } }}
                  >
                    Reset to Today
                  </Button>
                )}
              </Box>

              {/* Student list — card style */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {/* Header row */}
                <Box sx={{
                  display: 'flex', alignItems: 'center', px: 2.5, py: 1.5,
                  borderRadius: '14px', background: g.primary,
                  boxShadow: '0 4px 18px rgba(102,126,234,.25)',
                }}>
                  <Typography sx={{ width: 40, color: 'rgba(255,255,255,.8)', fontWeight: 700, fontSize: '0.78rem' }}>#</Typography>
                  <Typography sx={{ width: 70, color: 'rgba(255,255,255,.8)', fontWeight: 700, fontSize: '0.78rem' }}>Roll</Typography>
                  <Typography sx={{ flex: 1, color: 'rgba(255,255,255,.8)', fontWeight: 700, fontSize: '0.78rem' }}>Student</Typography>
                  <Typography sx={{ width: 200, textAlign: 'center', color: 'rgba(255,255,255,.8)', fontWeight: 700, fontSize: '0.78rem' }}>Mark Attendance</Typography>
                </Box>

                {/* Student cards */}
                {studentsData.map((s, i) => (
                  <Paper
                    key={s.id}
                    elevation={0}
                    sx={{
                      display: 'flex', alignItems: 'center', px: 2.5, py: 1.8,
                      borderRadius: '16px',
                      border: `2px solid ${s.present ? 'rgba(67,233,123,.35)' : 'rgba(0,0,0,.06)'}`,
                      background: s.present
                        ? 'linear-gradient(135deg, rgba(67,233,123,.06) 0%, rgba(56,249,215,.04) 100%)'
                        : '#fff',
                      transition: 'all .35s cubic-bezier(.4,0,.2,1)',
                      animation: `fadeInUp .35s ease ${i * 0.04}s both`,
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: s.present
                          ? '0 8px 28px rgba(67,233,123,.18)'
                          : '0 8px 28px rgba(102,126,234,.12)',
                      },
                    }}
                  >
                    {/* # */}
                    <Typography sx={{ width: 40, fontWeight: 600, color: '#aaa', fontSize: '0.85rem' }}>{i + 1}</Typography>

                    {/* Avatar */}
                    {/* <Avatar
                      sx={{
                        width: 38, height: 38, mr: 1.5,
                        fontSize: '0.85rem', fontWeight: 700,
                        background: s.present ? g.green : 'linear-gradient(135deg,#e0e0e0,#bdbdbd)',
                        color: s.present ? '#fff' : '#666',
                        transition: 'all .35s ease',
                        boxShadow: s.present ? '0 4px 14px rgba(67,233,123,.3)' : 'none',
                      }}
                    >
                      {s.name ? s.name.charAt(0).toUpperCase() : '?'}
                    </Avatar> */}

                    {/* Roll */}
                    <Typography sx={{ width: 70, fontWeight: 700, color: '#1a1a2e', fontSize: '0.85rem', fontFamily: 'monospace' }}>{s.admission_details.roll_number}</Typography>

                    {/* Name */}
                    <Typography sx={{ flex: 1, fontWeight: 600, color: '#333', fontSize: '0.92rem' }}>{s.name}</Typography>

                    {/* Present / Absent buttons */}
                    <Box sx={{ width: 200, display: 'flex', gap: 1, justifyContent: 'center' }}>
                      <Button
                        size="small"
                        onClick={() => toggleStudent(s.id)}
                        startIcon={<PaidIcon sx={{ fontSize: '16px !important' }} />}
                        sx={{
                          borderRadius: '12px', textTransform: 'none', fontWeight: 700, fontSize: '0.78rem',
                          px: 2, py: 0.8, minWidth: 90,
                          background: s.present ? g.green : 'transparent',
                          color: s.present ? '#fff' : '#aaa',
                          border: s.present ? 'none' : '2px solid #e0e0e0',
                          boxShadow: s.present ? '0 4px 14px rgba(67,233,123,.35)' : 'none',
                          transition: 'all .3s cubic-bezier(.4,0,.2,1)',
                          '&:hover': {
                            background: s.present ? g.green : 'rgba(67,233,123,.08)',
                            borderColor: s.present ? 'transparent' : '#43e97b',
                            color: s.present ? '#fff' : '#43e97b',
                            transform: 'scale(1.04)',
                          },
                        }}
                      >
                        Present
                      </Button>
                      <Button
                        size="small"
                        onClick={() => toggleStudent(s.id)}
                        startIcon={<PendingIcon sx={{ fontSize: '16px !important' }} />}
                        sx={{
                          borderRadius: '12px', textTransform: 'none', fontWeight: 700, fontSize: '0.78rem',
                          px: 2, py: 0.8, minWidth: 90,
                          background: !s.present ? g.warm : 'transparent',
                          color: !s.present ? '#fff' : '#aaa',
                          border: !s.present ? 'none' : '2px solid #e0e0e0',
                          boxShadow: !s.present ? '0 4px 14px rgba(245,87,108,.3)' : 'none',
                          transition: 'all .3s cubic-bezier(.4,0,.2,1)',
                          '&:hover': {
                            background: !s.present ? g.warm : 'rgba(245,87,108,.08)',
                            borderColor: !s.present ? 'transparent' : '#f5576c',
                            color: !s.present ? '#fff' : '#f5576c',
                            transform: 'scale(1.04)',
                          },
                        }}
                      >
                        Absent
                      </Button>
                    </Box>
                  </Paper>
                ))}
              </Box>

              {/* Submit */}
              <Box sx={{ mt: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Button
                  variant="contained" startIcon={submitting ? null : <SaveIcon />}
                  onClick={handleSubmit}
                  disabled={submitting || studentsData.length === 0}
                  sx={{
                    background: g.primary, borderRadius: '14px', textTransform: 'none', fontWeight: 600, px: 4, py: 1.5,
                    boxShadow: '0 4px 18px rgba(102,126,234,.35)',
                    '&:hover': { boxShadow: '0 6px 24px rgba(102,126,234,.5)' },
                    minWidth: 200,
                  }}
                >
                  {submitting ? 'Submitting…' : `Submit Attendance (${studentsData.length} students)`}
                </Button>
                {submitted && !submitting && (
                  <Chip icon={<PaidIcon />} label="Attendance submitted successfully!" sx={{ background: 'rgba(67,233,123,.12)', color: '#2ecc71', fontWeight: 600 }} />
                )}
              </Box>
            </Box>
          )}

          {/* ── Schedule Tab ── */}
          {tabIdx === 1 && (() => {
            const fmtTime = (t) => {
              if (!t) return '';
              const [h, m] = t.split(':');
              const hr = parseInt(h, 10);
              const ampm = hr >= 12 ? 'PM' : 'AM';
              return `${hr % 12 || 12}:${m} ${ampm}`;
            };
            return (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {weeklySchedule.length === 0 && (
                  <Box sx={{ textAlign: 'center', py: 8 }}>
                    <CalendarIcon sx={{ fontSize: 56, color: '#ddd', mb: 2 }} />
                    <Typography sx={{ color: '#aaa', fontSize: '1rem', fontWeight: 500 }}>No schedule available</Typography>
                  </Box>
                )}
                {weeklySchedule.map((day, dayIdx) => (
                  <Paper
                    key={day.id ?? dayIdx}
                    sx={{
                      borderRadius: '20px',
                      overflow: 'hidden',
                      boxShadow: '0 4px 24px rgba(102,126,234,.08)',
                      animation: `fadeInUp .4s ease ${dayIdx * 0.06}s both`,
                      transition: 'box-shadow .3s ease',
                      '&:hover': { boxShadow: '0 8px 36px rgba(102,126,234,.16)' },
                    }}
                  >
                    {/* Day header */}
                    <Box
                      sx={{
                        background: dayGradients[day.day] || g.primary,
                        px: 3, py: 1.8,
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                        <CalendarIcon sx={{ color: '#fff', fontSize: 22 }} />
                        <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '1.05rem', letterSpacing: '.3px' }}>
                          {day.day}
                        </Typography>
                      </Box>
                      <Chip
                        label={`${day.weekly_schedule_data?.length ?? 0} class${(day.weekly_schedule_data?.length ?? 0) !== 1 ? 'es' : ''}`}
                        size="small"
                        sx={{ background: 'rgba(255,255,255,.22)', color: '#fff', fontWeight: 600, fontSize: '0.75rem', backdropFilter: 'blur(4px)' }}
                      />
                    </Box>

                    {/* Classes inside */}
                    <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      {(day.weekly_schedule_data ?? []).length === 0 && (
                        <Typography sx={{ color: '#bbb', fontSize: '0.85rem', textAlign: 'center', py: 1 }}>No classes</Typography>
                      )}
                      {(day.weekly_schedule_data ?? []).map((item, i) => (
                        <Box
                          key={i}
                          sx={{
                            display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap',
                            p: 2, borderRadius: '14px',
                            background: 'rgba(102,126,234,.03)',
                            border: '1px solid rgba(102,126,234,.07)',
                            transition: 'all .25s ease',
                            '&:hover': { background: 'rgba(102,126,234,.06)', transform: 'translateX(4px)' },
                          }}
                        >
                          {/* Time */}
                          <Box sx={{ minWidth: 140 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, mb: 0.2 }}>
                              <ScheduleIcon sx={{ fontSize: 14, color: '#667eea' }} />
                              <Typography sx={{ fontSize: '0.7rem', color: '#aaa', fontWeight: 500 }}>TIME</Typography>
                            </Box>
                            <Typography sx={{ fontWeight: 700, color: '#1a1a2e', fontSize: '0.9rem' }}>
                              {fmtTime(item.start_time)} – {fmtTime(item.end_time)}
                            </Typography>
                          </Box>

                          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

                          {/* Subject */}
                          <Box sx={{ flex: 1, minWidth: 140 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, mb: 0.2 }}>
                              <SubjectIcon sx={{ fontSize: 14, color: '#764ba2' }} />
                              <Typography sx={{ fontSize: '0.7rem', color: '#aaa', fontWeight: 500 }}>SUBJECT</Typography>
                            </Box>
                            <Typography sx={{ fontWeight: 600, color: '#1a1a2e', fontSize: '0.88rem' }}>{item.subject}</Typography>
                          </Box>

                          {/* Room */}
                          <Box sx={{ minWidth: 70 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, mb: 0.2 }}>
                              <RoomIcon sx={{ fontSize: 14, color: '#4facfe' }} />
                              <Typography sx={{ fontSize: '0.7rem', color: '#aaa', fontWeight: 500 }}>ROOM</Typography>
                            </Box>
                            <Chip label={item.room_number} size="small" sx={{ background: 'rgba(79,172,254,.1)', color: '#4facfe', fontWeight: 600, fontSize: '0.78rem' }} />
                          </Box>

                          {/* Class */}
                          {item.class_name && (
                            <Box sx={{ minWidth: 100 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, mb: 0.2 }}>
                                <SchoolIcon sx={{ fontSize: 14, color: '#f5576c' }} />
                                <Typography sx={{ fontSize: '0.7rem', color: '#aaa', fontWeight: 500 }}>CLASS</Typography>
                              </Box>
                              <Typography sx={{ fontWeight: 600, color: '#555', fontSize: '0.85rem' }}>{item.class_name}</Typography>
                            </Box>
                          )}
                        </Box>
                      ))}
                    </Box>
                  </Paper>
                ))}
              </Box>
            );
          })()}


          {/* ── Exam Duties Tab ── */}
          {tabIdx === 2 && (() => {
            const fmtTime = (t) => {
              if (!t) return '';
              const [h, m] = t.split(':');
              const hr = parseInt(h, 10);
              const ampm = hr >= 12 ? 'PM' : 'AM';
              return `${hr % 12 || 12}:${m} ${ampm}`;
            };
            const gradientArray = [g.primary, g.teal, g.mint, g.amber, g.warm, g.lavender];
            return (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {examScheduleData.length === 0 && (
                  <Box sx={{ textAlign: 'center', py: 8 }}>
                    <ExamDutyIcon sx={{ fontSize: 56, color: '#ddd', mb: 2 }} />
                    <Typography sx={{ color: '#aaa', fontSize: '1rem', fontWeight: 500 }}>No exam duties scheduled</Typography>
                  </Box>
                )}
                {examScheduleData.map((examDay, idx) => (
                  <Paper
                    key={examDay.id ?? idx}
                    sx={{
                      borderRadius: '20px', overflow: 'hidden',
                      boxShadow: '0 4px 24px rgba(102,126,234,.08)',
                      animation: `fadeInUp .4s ease ${idx * 0.06}s both`,
                      transition: 'box-shadow .3s ease',
                      '&:hover': { boxShadow: '0 8px 36px rgba(102,126,234,.16)' },
                    }}
                  >
                    {/* Date header */}
                    <Box sx={{
                      background: gradientArray[idx % gradientArray.length],
                      px: 3, py: 1.8,
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                        <ExamDutyIcon sx={{ color: '#fff', fontSize: 22 }} />
                        <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '1.05rem', letterSpacing: '.3px' }}>
                          {examDay.date}
                        </Typography>
                      </Box>
                      <Chip
                        label={`${examDay.exam_schedule_data?.length ?? 0} exam${(examDay.exam_schedule_data?.length ?? 0) !== 1 ? 's' : ''}`}
                        size="small"
                        sx={{ background: 'rgba(255,255,255,.22)', color: '#fff', fontWeight: 600, fontSize: '0.75rem', backdropFilter: 'blur(4px)' }}
                      />
                    </Box>

                    {/* Exams inside */}
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow sx={{ background: 'rgba(102,126,234,.03)' }}>
                            <TableCell sx={{ fontWeight: 600, color: '#667eea', fontSize: '0.75rem', py: 1.5 }}>TIME</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: '#764ba2', fontSize: '0.75rem', py: 1.5 }} align="center">SUBJECT</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: '#4facfe', fontSize: '0.75rem', py: 1.5 }} align="center">ROOM</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: '#f5576c', fontSize: '0.75rem', py: 1.5 }} align="center">TYPE</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {(examDay.exam_schedule_data ?? []).map((item, i) => (
                            <TableRow
                              key={i}
                              sx={{
                                '&:last-child td': { border: 0 },
                                transition: 'background .2s',
                                '&:hover': { background: 'rgba(102,126,234,.04)' },
                                '&:nth-of-type(even)': { background: '#fafbff' },
                              }}
                            >
                              <TableCell sx={{ fontWeight: 700, color: '#1a1a2e', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                                {fmtTime(item.start_time)} – {fmtTime(item.end_time)}
                              </TableCell>
                              <TableCell sx={{ fontWeight: 600, color: '#1a1a2e', fontSize: '0.85rem' }} align="center">
                                {item.subject}
                              </TableCell>
                              <TableCell align="center">
                                <Chip label={item.room_number} size="small" sx={{ background: 'rgba(79,172,254,.1)', color: '#4facfe', fontWeight: 600, fontSize: '0.7rem', height: 24 }} />
                              </TableCell>
                              <TableCell align="center">
                                <Chip
                                  label={item.type || 'Exam'}
                                  size="small"
                                  sx={{
                                    background: item.type === 'Mid-Term' ? 'rgba(240,147,251,.12)' : 'rgba(102,126,234,.12)',
                                    color: item.type === 'Mid-Term' ? '#c044e0' : '#667eea',
                                    fontWeight: 600, fontSize: '0.7rem', height: 24,
                                  }}
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>
                ))}
              </Box>
            );
          })()}

          {/* ── Calendar Tab ── */}
          {tabIdx === 3 && (
            <Box>
              {/* Header */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <FormControl sx={{ minWidth: 140 }} size="small">
                    <Select
                      value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}
                      sx={{ borderRadius: '12px', background: '#fff', fontWeight: 600, color: g.primary, '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(102,126,234,.3)' } }}
                    >
                      {monthLabels.map((m, i) => <MenuItem key={i} value={i}>{m}</MenuItem>)}
                    </Select>
                  </FormControl>
                  <FormControl sx={{ minWidth: 100 }} size="small">
                    <Select
                      value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}
                      sx={{ borderRadius: '12px', background: '#fff', fontWeight: 600, color: g.primary, '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(102,126,234,.3)' } }}
                    >
                      {yearOptions.map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Typography sx={{ color: '#888', fontSize: '0.85rem', fontWeight: 500 }}>
                    {holidays.filter(h => h.startsWith(`${selectedYear}-${selectedMonth}-`)).length} holiday(s)
                  </Typography>
                  <Button
                    variant={holidayMode ? 'contained' : 'outlined'}
                    startIcon={<HolidayIcon />}
                    onClick={() => setHolidayMode(m => !m)}
                    sx={{
                      borderRadius: '14px', textTransform: 'none', fontWeight: 700, px: 2.5, py: 1,
                      background: holidayMode ? g.amber : 'transparent',
                      borderColor: '#f7971e',
                      color: holidayMode ? '#fff' : '#f7971e',
                      boxShadow: holidayMode ? '0 4px 18px rgba(247,151,30,.4)' : 'none',
                      '&:hover': { background: holidayMode ? g.amber : 'rgba(247,151,30,.08)', borderColor: '#f7971e' },
                      transition: 'all .3s ease',
                    }}
                  >
                    {holidayMode ? '✓ Holiday ON' : 'Mark Holiday'}
                  </Button>

                  {/* ── Edit Attendance button ── */}
                  <Button
                    variant="outlined"
                    startIcon={<CalendarIcon />}
                    onClick={() => { setEditPickerDate(attendanceDate); setEditAttOpen(true); }}
                    sx={{
                      borderRadius: '14px', textTransform: 'none', fontWeight: 700, px: 2.5, py: 1,
                      borderColor: '#667eea', color: '#667eea',
                      '&:hover': { background: 'rgba(102,126,234,.08)', borderColor: '#667eea' },
                      transition: 'all .3s ease',
                    }}
                  >
                    Edit Attendance
                  </Button>

                  {/* ── Date picker modal ── */}
                  <Modal open={editAttOpen} onClose={() => setEditAttOpen(false)}>
                    <Box sx={{
                      position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
                      background: '#fff', borderRadius: '20px', p: 3.5, minWidth: 320,
                      boxShadow: '0 24px 60px rgba(0,0,0,.2)', outline: 'none',
                    }}>
                      <Typography sx={{ fontWeight: 700, fontSize: '1.05rem', color: '#1a1a2e', mb: 2 }}>
                        Select Attendance Date
                      </Typography>
                      <input
                        type="date"
                        value={editPickerDate}
                        max={todayStr}
                        onChange={(e) => setEditPickerDate(e.target.value)}
                        style={{
                          width: '100%', padding: '10px 14px', borderRadius: '12px',
                          border: '2px solid rgba(102,126,234,.3)', fontSize: '1rem',
                          fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
                          color: '#1a1a2e',
                        }}
                      />
                      <Box sx={{ display: 'flex', gap: 1.5, mt: 2.5, justifyContent: 'flex-end' }}>
                        <Button
                          onClick={() => setEditAttOpen(false)}
                          sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 600, color: '#888' }}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="contained"
                          disabled={!editPickerDate}
                          onClick={() => {
                            setAttendanceDate(editPickerDate);
                            setEditAttOpen(false);
                            setTabIdx(0);
                          }}
                          sx={{
                            borderRadius: '12px', textTransform: 'none', fontWeight: 700,
                            background: g.primary, boxShadow: '0 4px 14px rgba(102,126,234,.35)',
                            '&:hover': { background: g.primary },
                          }}
                        >
                          OK — View Attendance
                        </Button>
                      </Box>
                    </Box>
                  </Modal>
                </Box>
              </Box>

              {/* Legend */}
              <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                {[
                  { label: 'Working Day', color: g.green },
                  { label: 'Sunday', color: 'linear-gradient(135deg,#f5576c,#f093fb)' },
                  { label: 'Holiday', color: g.amber },
                  { label: 'Today', color: g.primary },
                ].map(l => (
                  <Box key={l.label} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 14, height: 14, borderRadius: '4px', background: l.color }} />
                    <Typography sx={{ fontSize: '0.78rem', color: '#666', fontWeight: 500 }}>{l.label}</Typography>
                  </Box>
                ))}
              </Box>

              {/* Weekday header */}
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, mb: 1 }}>
                {weekDayLabels.map(d => (
                  <Box key={d} sx={{ textAlign: 'center', py: 0.8 }}>
                    <Typography sx={{
                      fontWeight: 700, fontSize: '0.75rem', letterSpacing: '.5px',
                      color: d === 'Sun' ? '#f5576c' : '#667eea',
                      textTransform: 'uppercase',
                    }}>{d}</Typography>
                  </Box>
                ))}
              </Box>

              {/* Empty offset cells for first day of month */}
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1 }}>
                {Array.from({ length: monthDays[0].weekday }).map((_, i) => (
                  <Box key={`empty-${i}`} />
                ))}

                {monthDays.map(({ day, date, weekday }) => {
                  const isToday = day === calNow.getDate() && selectedMonth === calNow.getMonth() && selectedYear === calNow.getFullYear();
                  const isSunday = weekday === 0;
                  const dateKey = `${selectedYear}-${selectedMonth}-${day}`;
                  const isHoliday = holidays.includes(dateKey);
                  let bg = g.green;
                  let shadowColor = 'rgba(67,233,123,.35)';
                  if (isSunday) { bg = 'linear-gradient(135deg,#f5576c,#f093fb)'; shadowColor = 'rgba(245,87,108,.3)'; }
                  if (isHoliday) { bg = g.amber; shadowColor = 'rgba(247,151,30,.4)'; }
                  if (isToday) { bg = g.primary; shadowColor = 'rgba(102,126,234,.45)'; }

                  return (
                    <Box
                      key={day}
                      onClick={() => toggleHoliday(day)}
                      sx={{
                        borderRadius: '14px',
                        background: bg,
                        p: 1.5,
                        textAlign: 'center',
                        boxShadow: `0 4px 14px ${shadowColor}`,
                        cursor: holidayMode && !isSunday ? 'pointer' : 'default',
                        transition: 'all .3s cubic-bezier(.4,0,.2,1)',
                        animation: `fadeInUp .3s ease ${(day - 1) * 0.015}s both`,
                        '&:hover': holidayMode && !isSunday ? {
                          transform: 'scale(1.08)',
                          boxShadow: `0 8px 24px ${shadowColor}`,
                        } : {},
                      }}
                    >
                      <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: '#fff', lineHeight: 1 }}>{day}</Typography>
                      <Typography sx={{ fontSize: '0.62rem', color: 'rgba(255,255,255,.8)', fontWeight: 500, mt: 0.3 }}>
                        {weekDayLabels[weekday]}
                      </Typography>
                      {isHoliday && !isSunday && (
                        <Typography sx={{ fontSize: '0.6rem', color: 'rgba(255,255,255,.9)', fontWeight: 700, mt: 0.3, letterSpacing: '.3px' }}>HOLIDAY</Typography>
                      )}
                      {isToday && (
                        <Box sx={{ width: 5, height: 5, borderRadius: '50%', background: '#fff', mx: 'auto', mt: 0.5 }} />
                      )}
                    </Box>
                  );
                })}
              </Box>
            </Box>
          )}
        </Box>
      </Box>

      {/* ────── MORE MODAL ────── */}
      <Modal open={moreOpen} onClose={() => setMoreOpen(false)}>
        <Box
          sx={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            width: { xs: '92%', sm: 620 }, maxHeight: '90vh', overflowY: 'auto',
            background: '#fff', borderRadius: '24px', boxShadow: '0 30px 80px rgba(0,0,0,.25)', outline: 'none',
          }}
        >
          {/* Header */}
          <Box sx={{ background: g.primary, p: 3, borderRadius: '24px 24px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <WalletIcon sx={{ color: '#fff', fontSize: 28 }} />
              <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '1.15rem' }}>Salary & Payment Details</Typography>
            </Box>
            <IconButton onClick={() => setMoreOpen(false)} sx={{ color: '#fff' }}><CloseIcon /></IconButton>
          </Box>

          <Box sx={{ p: 3 }}>
            {/* ── Top: Salary + Total Paid ── */}
            {(() => {
              const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
              // Filter payments for THIS professor only, then build month lookup
              const profId = professorDetails?.id;
              const paidMap = {};
              paymentData.forEach(p => {
                // Only match this professor's payments
                const pProfId = p.professor?.id ?? p.professor;
                if (profId && pProfId !== profId) return;
                const raw = String(p.month_year ?? p.month ?? '');
                if (!raw.startsWith(String(paymentYear))) return;
                const parts = raw.split('-');
                const mIdx = parseInt(parts[1] ?? '0', 10) - 1;
                const isPaid = String(p.payment_status ?? '').toLowerCase() === 'paid';
                if (isPaid) paidMap[mIdx] = p;
              });
              const totalPaid = Object.values(paidMap).reduce(
                (sum, p) => sum + Number(p.payment_amount ?? p.amount ?? 0), 0
              );

              return (
                <>
                  <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                    <Box sx={{ flex: 1, p: 2.5, borderRadius: '16px', background: g.primary, color: '#fff', textAlign: 'center' }}>
                      <Typography sx={{ fontSize: '0.7rem', opacity: .8, textTransform: 'uppercase', letterSpacing: '.7px' }}>Base Salary</Typography>
                      <Typography sx={{ fontWeight: 800, fontSize: '1.4rem', mt: 0.5 }}>
                        ₹{Number(professorDetails?.admin_employement?.salary ?? 0).toLocaleString()}
                      </Typography>
                      <Typography sx={{ fontSize: '0.72rem', opacity: .7, mt: 0.3 }}>per month</Typography>
                    </Box>
                    <Box sx={{ flex: 1, p: 2.5, borderRadius: '16px', background: g.green, color: '#000', textAlign: 'center' }}>
                      <Typography sx={{ fontSize: '0.7rem', opacity: .8, textTransform: 'uppercase', letterSpacing: '.7px' }}>Total Paid ({paymentYear})</Typography>
                      <Typography sx={{ fontWeight: 800, fontSize: '1.4rem', mt: 0.5 }}>
                        ₹{totalPaid.toLocaleString()}
                      </Typography>
                      <Typography sx={{ fontSize: '0.72rem', opacity: .7, mt: 0.3 }}>{Object.keys(paidMap).length} of 12 months</Typography>
                    </Box>
                  </Box>

                  {/* ── Year Selector ── */}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography sx={{ fontWeight: 700, color: '#1a1a2e', fontSize: '0.95rem' }}>Payment History</Typography>
                    <FormControl size="small" sx={{ minWidth: 110 }}>
                      <Select
                        value={paymentYear}
                        onChange={(e) => setPaymentYear(e.target.value)}
                        sx={{ borderRadius: '12px', fontWeight: 600, '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(102,126,234,.3)' } }}
                      >
                        {Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i).map(y => (
                          <MenuItem key={y} value={y}>{y}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>

                  {/* ── All 12 Months ── */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2, mb: 2 }}>
                    {monthNames.map((mName, mIdx) => {
                      const paidRecord = paidMap[mIdx];
                      const isPaid = !!paidRecord;
                      const amount = isPaid ? Number(paidRecord.payment_amount ?? paidRecord.amount ?? 0) : 0;
                      return (
                        <Box
                          key={mIdx}
                          sx={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            p: 1.8, borderRadius: '14px',
                            background: isPaid ? 'rgba(67,233,123,.06)' : 'rgba(247,151,30,.04)',
                            border: `1.5px solid ${isPaid ? 'rgba(67,233,123,.25)' : 'rgba(200,200,200,.4)'}`,
                            transition: 'all .25s ease',
                            '&:hover': { transform: 'translateX(4px)' },
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box sx={{
                              width: 36, height: 36, borderRadius: '10px',
                              background: isPaid ? g.green : 'linear-gradient(135deg, #bdc3c7 0%, #95a5a6 100%)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              flexShrink: 0,
                            }}>
                              {isPaid
                                ? <PaidIcon sx={{ fontSize: 18, color: '#fff' }} />
                                : <PendingIcon sx={{ fontSize: 18, color: '#fff' }} />}
                            </Box>
                            <Box>
                              <Typography sx={{ fontWeight: 700, color: '#1a1a2e', fontSize: '0.9rem' }}>{mName}</Typography>
                              <Chip
                                label={isPaid ? 'Paid' : 'Unpaid'}
                                size="small"
                                sx={{
                                  height: 20, fontSize: '0.65rem', fontWeight: 700,
                                  background: isPaid ? 'rgba(67,233,123,.15)' : 'rgba(200,200,200,.2)',
                                  color: isPaid ? '#27ae60' : '#999',
                                  mt: 0.3,
                                }}
                              />
                            </Box>
                          </Box>
                          <Typography sx={{ fontWeight: 800, color: isPaid ? '#1a1a2e' : '#ccc', fontSize: '1rem' }}>
                            {isPaid ? `₹${amount.toLocaleString()}` : '—'}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Box>
                </>
              );
            })()}

            <Divider sx={{ my: 2 }} />

            {/* QR */}
            <Box sx={{ textAlign: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 2 }}>
                <QrIcon sx={{ color: '#667eea' }} />
                <Typography sx={{ fontWeight: 700, color: '#1a1a2e', fontSize: '0.95rem' }}>Faculty QR Code</Typography>
              </Box>
              <Typography sx={{ color: '#888', fontSize: '0.8rem', mb: 2 }}>
                Scan to view faculty details — name, ID, department & subjects
              </Typography>
              <Box sx={{ display: 'inline-block', p: 2.5, borderRadius: '20px', background: '#fff', border: '2px solid rgba(102,126,234,.15)', boxShadow: '0 8px 30px rgba(102,126,234,.1)' }}>
                <QRCodeSVG value={qrData} size={180} level="H" includeMargin fgColor="#1a1a2e" />
              </Box>
            </Box>

            {/* Logout */}
            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Button
                startIcon={<LogoutIcon />}
                onClick={() => { 
                  clearSession();
                  window.location.href = '/';
                }}
                sx={{
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #f5576c 0%, #ff6b6b 100%)',
                  color: '#fff',
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.82rem',
                  px: 3,
                  py: 0.8,
                  boxShadow: '0 4px 15px rgba(245,87,108,.3)',
                  transition: 'all .3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 20px rgba(245,87,108,.5)',
                    background: 'linear-gradient(135deg, #ff6b6b 0%, #f5576c 100%)',
                  },
                }}
              >
                Logout
              </Button>
            </Box>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default ProfessorPage;
