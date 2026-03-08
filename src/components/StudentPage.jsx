import { useEffect, useState } from 'react';
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
  Drawer,
} from '@mui/material';
import {
  MoreVert as MoreIcon,
  School as SchoolIcon,
  CalendarMonth as CalendarIcon,
  Schedule as ScheduleIcon,
  Room as RoomIcon,
  Person as PersonIcon,
  MenuBook as SubjectIcon,
  Home as HomeIcon,
  Badge as BadgeIcon,
  Close as CloseIcon,
  AccountBalanceWallet as WalletIcon,
  QrCode2 as QrIcon,
  CheckCircle as PaidIcon,
  Warning as PendingIcon,
  ArrowBack as BackIcon,
  Logout as LogoutIcon,
  LocationOn as LocationIcon,
  Class as ClassIcon,
  Menu as MenuIcon,
} from '@mui/icons-material';
import { QRCodeSVG } from 'qrcode.react';
import { useNavigate,useLocation} from 'react-router-dom';
import { getStudent } from './apis/students_api';
import { getSchedule,getExamSchedule } from './apis/schedule_api';
import { getStudentId as getStorageStudent, setStudentId, setStudentUniqueId, clearSession } from '../utils/storage';

/* ───────── Sample Data ───────── */
const studentData = {
  name: 'John Doe',
  rollNo: 'CS001',
  enrollmentNo: 'EN2024-CS-0042',
  facultyNo: 'FAC-CS-12',
  course: 'B.Tech Computer Science',
  branch: 'Computer Science & Engineering',
  year: '3rd Year',
  photo: null,
  address: '42, Sunrise Apartments, Sector 12, Noida, U.P. — 201301',
  subjects: [
    'Data Structures & Algorithms',
    'Operating Systems',
    'Database Management',
    'Computer Networks',
    'Software Engineering',
    'Discrete Mathematics',
  ],
};

const dailySchedule = {
  Monday: [
    { time: '9:00 – 10:00', subject: 'Data Structures & Algorithms', room: 'Room 201', professor: 'Dr. Sarah Wilson' },
    { time: '10:15 – 11:15', subject: 'Operating Systems', room: 'Room 305', professor: 'Prof. James Brown' },
    { time: '11:30 – 12:30', subject: 'Computer Networks', room: 'Lab 102', professor: 'Dr. Raj Patel' },
    { time: '2:00 – 3:00', subject: 'Database Management', room: 'Room 404', professor: 'Dr. Emily Davis' },
  ],
  Tuesday: [
    { time: '9:00 – 10:00', subject: 'Software Engineering', room: 'Room 101', professor: 'Prof. Lisa Chen' },
    { time: '10:15 – 11:15', subject: 'Discrete Mathematics', room: 'Room 202', professor: 'Dr. Ahmed Khan' },
    { time: '11:30 – 1:00', subject: 'DSA Lab', room: 'Lab 301', professor: 'Dr. Sarah Wilson' },
    { time: '2:00 – 3:30', subject: 'OS Lab', room: 'Lab 302', professor: 'Prof. James Brown' },
  ],
  Wednesday: [
    { time: '9:00 – 10:00', subject: 'Data Structures & Algorithms', room: 'Room 201', professor: 'Dr. Sarah Wilson' },
    { time: '10:15 – 11:15', subject: 'Computer Networks', room: 'Room 305', professor: 'Dr. Raj Patel' },
    { time: '11:30 – 12:30', subject: 'Database Management', room: 'Room 404', professor: 'Dr. Emily Davis' },
    { time: '2:00 – 3:00', subject: 'Software Engineering', room: 'Room 101', professor: 'Prof. Lisa Chen' },
  ],
  Thursday: [
    { time: '9:00 – 10:00', subject: 'Operating Systems', room: 'Room 305', professor: 'Prof. James Brown' },
    { time: '10:15 – 11:15', subject: 'Discrete Mathematics', room: 'Room 202', professor: 'Dr. Ahmed Khan' },
    { time: '11:30 – 1:00', subject: 'CN Lab', room: 'Lab 103', professor: 'Dr. Raj Patel' },
    { time: '2:00 – 3:30', subject: 'DBMS Lab', room: 'Lab 304', professor: 'Dr. Emily Davis' },
  ],
  Friday: [
    { time: '9:00 – 10:00', subject: 'Data Structures & Algorithms', room: 'Room 201', professor: 'Dr. Sarah Wilson' },
    { time: '10:15 – 11:15', subject: 'Software Engineering', room: 'Room 101', professor: 'Prof. Lisa Chen' },
    { time: '11:30 – 12:30', subject: 'Computer Networks', room: 'Room 305', professor: 'Dr. Raj Patel' },
    { time: '2:00 – 3:00', subject: 'Discrete Mathematics', room: 'Room 202', professor: 'Dr. Ahmed Khan' },
  ],
  Saturday: [
    { time: '9:00 – 10:00', subject: 'Operating Systems', room: 'Room 305', professor: 'Prof. James Brown' },
    { time: '10:15 – 11:15', subject: 'Database Management', room: 'Room 404', professor: 'Dr. Emily Davis' },
    { time: '11:30 – 12:30', subject: 'Revision / Tutorial', room: 'Room 101', professor: 'Dr. Sarah Wilson' },
  ],
};

// const examSchedule = [
//   { date: 'Mar 15, 2026', subject: 'Data Structures & Algorithms', time: '10:00 AM – 1:00 PM', room: 'Hall A', type: 'Mid-Term' },
//   { date: 'Mar 17, 2026', subject: 'Operating Systems', time: '10:00 AM – 1:00 PM', room: 'Hall B', type: 'Mid-Term' },
//   { date: 'Mar 19, 2026', subject: 'Database Management', time: '2:00 PM – 5:00 PM', room: 'Hall A', type: 'Mid-Term' },
//   { date: 'Mar 21, 2026', subject: 'Computer Networks', time: '10:00 AM – 1:00 PM', room: 'Hall C', type: 'Mid-Term' },
//   { date: 'Mar 23, 2026', subject: 'Software Engineering', time: '2:00 PM – 5:00 PM', room: 'Hall B', type: 'Mid-Term' },
//   { date: 'Mar 25, 2026', subject: 'Discrete Mathematics', time: '10:00 AM – 1:00 PM', room: 'Hall A', type: 'Mid-Term' },
// ];

const feeDetails = {
  totalFee: 125000,
  paid: 90000,
  pending: 35000,
  breakdown: [
    { label: 'Tuition Fee', amount: 80000, status: 'Paid' },
    { label: 'Lab Fee', amount: 15000, status: 'Paid' },
    { label: 'Library Fee', amount: 5000, status: 'Pending' },
    { label: 'Exam Fee', amount: 10000, status: 'Pending' },
    { label: 'Sports Fee', amount: 5000, status: 'Paid' },
    { label: 'Development Fee', amount: 10000, status: 'Pending' },
  ],
  otherPayments: [
    { label: 'Hostel Rent', amount: 48000, status: 'Paid' },
    { label: 'Bus Transport', amount: 12000, status: 'Pending' },
  ],
};

/* ───────── Gradient palette ───────── */
const g = {
  primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  card: 'linear-gradient(135deg, rgba(102,126,234,.06) 0%, rgba(118,75,162,.06) 100%)',
  sidebar: 'linear-gradient(180deg, #667eea 0%, #764ba2 100%)',
  warm: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  teal: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  amber: 'linear-gradient(135deg, #f7971e 0%, #ffd200 100%)',
  rose: 'linear-gradient(135deg, #ee9ca7 0%, #ffdde1 100%)',
  ocean: 'linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%)',
  sunset: 'linear-gradient(135deg, #f12711 0%, #f5af19 100%)',
  mint: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
  lavender: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
  sky: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)',
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
        minWidth: 32,
        height: 32,
        borderRadius: '10px',
        background: 'rgba(102,126,234,.12)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        mt: '2px',
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
      display: 'flex',
      alignItems: 'stretch',
      borderRadius: '16px',
      overflow: 'hidden',
      boxShadow: '0 4px 20px rgba(102,126,234,.08)',
      transition: 'all .3s ease',
      animation: `fadeInUp .4s ease ${index * 0.07}s both`,
      '&:hover': {
        transform: 'translateY(-3px)',
        boxShadow: '0 8px 30px rgba(102,126,234,.18)',
      },
    }}
  >
    {/* Time accent bar */}
    <Box
      sx={{
        width: 6,
        background: g.primary,
        flexShrink: 0,
      }}
    />
    <Box sx={{ flex: 1, p: 2.5, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
      {/* Time */}
      <Box sx={{ minWidth: 130 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.3 }}>
          <ScheduleIcon sx={{ fontSize: 16, color: '#667eea' }} />
          <Typography sx={{ fontSize: '0.75rem', color: '#999', fontWeight: 500 }}>TIME</Typography>
        </Box>
        <Typography sx={{ fontWeight: 700, color: '#1a1a2e', fontSize: '0.95rem' }}>{item.time}</Typography>
      </Box>

      <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

      {/* Subject */}
      <Box sx={{ flex: 1, minWidth: 150 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.3 }}>
          <SubjectIcon sx={{ fontSize: 16, color: '#764ba2' }} />
          <Typography sx={{ fontSize: '0.75rem', color: '#999', fontWeight: 500 }}>SUBJECT</Typography>
        </Box>
        <Typography sx={{ fontWeight: 600, color: '#1a1a2e', fontSize: '0.92rem' }}>{item.subject}</Typography>
      </Box>

      {/* Room */}
      <Box sx={{ minWidth: 80 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.3 }}>
          <RoomIcon sx={{ fontSize: 16, color: '#4facfe' }} />
          <Typography sx={{ fontSize: '0.75rem', color: '#999', fontWeight: 500 }}>ROOM</Typography>
        </Box>
        <Chip
          label={item.room}
          size="small"
          sx={{
            background: 'rgba(79,172,254,.1)',
            color: '#4facfe',
            fontWeight: 600,
            fontSize: '0.8rem',
          }}
        />
      </Box>

      {/* Professor */}
      <Box sx={{ minWidth: 140 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.3 }}>
          <PersonIcon sx={{ fontSize: 16, color: '#f5576c' }} />
          <Typography sx={{ fontSize: '0.75rem', color: '#999', fontWeight: 500 }}>PROFESSOR</Typography>
        </Box>
        <Typography sx={{ fontWeight: 600, color: '#555', fontSize: '0.88rem' }}>{item.professor}</Typography>
      </Box>
    </Box>
  </Paper>
);

/* ═══════════════════ Sidebar (shared between desktop + mobile Drawer) ═══════════════════ */
const SidebarInner = ({ student, navigate, onClose }) => (
  <Box
    sx={{
      width: '100%',
      height: '100%',
      background: g.sidebar,
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden',
    }}
  >
    <Box sx={{ position: 'absolute', top: -40, right: -40, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,.07)' }} />
    <Box sx={{ position: 'absolute', bottom: '30%', left: -30, width: 90, height: 90, borderRadius: '50%', background: 'rgba(255,255,255,.05)', animation: 'float 8s ease-in-out infinite' }} />

    <Box sx={{ p: 2, pb: 0, zIndex: 1 }}>
      <IconButton
        onClick={() => { navigate('/dashboard'); onClose(); }}
        sx={{ color: 'rgba(255,255,255,.75)', background: 'rgba(255,255,255,.1)', '&:hover': { background: 'rgba(255,255,255,.2)' }, borderRadius: '12px' }}
      >
        <BackIcon />
      </IconButton>
    </Box>

    <Box sx={{ flex: 1, overflowY: 'auto', px: 3, pb: 3, zIndex: 1, '&::-webkit-scrollbar': { width: 4 }, '&::-webkit-scrollbar-thumb': { background: 'rgba(255,255,255,.25)', borderRadius: 2 } }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 1, mb: 3 }}>
        <Avatar sx={{ width: 100, height: 100, background: 'rgba(255,255,255,.18)', border: '4px solid rgba(255,255,255,.35)', fontSize: '2.2rem', fontWeight: 700, mb: 1.5, boxShadow: '0 8px 30px rgba(0,0,0,.2)' }}>
          {student.name ? student.name[0] : ''}
        </Avatar>
        <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '1.15rem', textAlign: 'center' }}>{student?.name}</Typography>
        <Chip label={student?.year} size="small" sx={{ mt: 0.8, background: 'rgba(255,255,255,.18)', color: '#fff', fontWeight: 600, fontSize: '0.78rem', backdropFilter: 'blur(6px)' }} />
      </Box>

      <InfoRow icon={<BadgeIcon sx={{ fontSize: 16, color: '#667eea' }} />} label="Roll Number" value={student.admission_details ? student.admission_details.roll_number : ''} />
      <InfoRow icon={<ClassIcon sx={{ fontSize: 16, color: '#667eea' }} />} label="Enrollment No" value={student.admission_details ? student.admission_details.enrollment_number : ''} />
      <InfoRow icon={<SchoolIcon sx={{ fontSize: 16, color: '#667eea' }} />} label="Course & Branch" value={`${student.course_details ? student.course_details.course_name : ''}\n${student.course_details ? student.course_details.branch : ''}`} />
      <InfoRow icon={<CalendarIcon sx={{ fontSize: 16, color: '#667eea' }} />} label="Current Year" value={student.admission_details ? student.admission_details.year : ''} />

      <Box sx={{ mt: 2, mb: 2 }}>
        <Typography sx={{ fontSize: '0.68rem', color: 'rgba(255,255,255,.55)', textTransform: 'uppercase', letterSpacing: '.8px', mb: 1 }}>Subjects</Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.7 }}>
          {studentData.subjects.map((s) => (
            <Chip key={s} label={s} size="small" sx={{ background: 'rgba(255,255,255,.12)', color: '#fff', fontSize: '0.72rem', fontWeight: 500, backdropFilter: 'blur(4px)', '&:hover': { background: 'rgba(255,255,255,.22)' } }} />
          ))}
        </Box>
      </Box>

      <InfoRow icon={<LocationIcon sx={{ fontSize: 16, color: '#667eea' }} />} label="Current Address" value={student.contact_details ? student.contact_details.current_address : ''} />
    </Box>

    <Typography sx={{ textAlign: 'center', color: 'rgba(255,255,255,.35)', fontSize: '0.7rem', py: 1.5, zIndex: 1 }}>
      EduConnect • Student Portal
    </Typography>
  </Box>
);

/* ═══════════════════ Main Component ═══════════════════ */
const StudentPage = () => {
  useEffect(() => {
    document.title = 'EduConnect | Student';
  }, []);

  const navigate = useNavigate();
  const [tabIdx, setTabIdx] = useState(0);
  const [moreOpen, setMoreOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [student,setStudent] = useState([]); 
  const [schedule,setSchedule] = useState([]);
  const [examSchedule,setExamSchedule] = useState([]);

  const location = useLocation();
  const { id } = location.state || {};
  const [studentId, setStoredStudentId] = useState(null);

  // Resolve encrypted student ID from storage asynchronously
  useEffect(() => {
    getStorageStudent().then(val => {
      setStoredStudentId(val);
    });
    // Persist navigation state to encrypted storage so refresh works
    if (id?.student_id) {
      setStudentId(id.student_id);
    }
  }, []);

  useEffect(() => {
    const my_id = studentId ? studentId : id?.student_id;
    console.log('my_id', my_id);
    if (!my_id) return;
    getStudent(my_id).then(data => {
      setStudentId(my_id);
      setStudent(data.body);
      console.log('data', data.body);
    });
    getSchedule().then(data => {
      if (data.status === 200 && data.body) {
        const list = Array.isArray(data.body)
          ? (data.body[0]?.weekly_schedules ?? data.body)
          : [];
        setSchedule(list);
      }
    });
    getExamSchedule().then(data => {
      if (data.status === 200 && data.body) {
        const list = Array.isArray(data.body)
          ? (data.body[0]?.exam_schedules ?? data.body)
          : [];
        setExamSchedule(list);
      }
    });
  }, [studentId]);

  
  // console.log("studentId", student,uniqueId);

   const fmtTime = (t) => {
    if (!t) return '';
    const [h, m] = t.split(':');
    const hr = parseInt(h, 10);
    const ampm = hr >= 12 ? 'PM' : 'AM';
    return `${hr % 12 || 12}:${m} ${ampm}`;
  };

  const qrData = JSON.stringify({
    name: studentData.name,
    enrollment: studentData.enrollmentNo,
    address: studentData.address,
    course: studentData.course,
    year: studentData.year,
  });

  return (
    <Box sx={{ display: 'flex', width: '100%', minHeight: '100vh', background: '#f0f2f5' }}>
      {/* ────── MOBILE DRAWER ────── */}
      <Drawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { width: 280, border: 'none' } }}
      >
        <SidebarInner student={student} navigate={navigate} onClose={() => setMobileOpen(false)} />
      </Drawer>

      {/* ────── LEFT SIDEBAR (desktop only) ────── */}
      <Box
        sx={{
          width: '20%',
          minWidth: 280,
          maxWidth: 340,
          height: '100vh',
          background: g.sidebar,
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          position: 'sticky',
          top: 0,
          overflow: 'hidden',
        }}
      >
        <SidebarInner student={student} navigate={navigate} onClose={() => {}} />
      </Box>


      {/* ────── RIGHT PANEL ────── */}
      <Box sx={{ flex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top Bar */}
        <Box
          sx={{
            px: { xs: 2, md: 4 },
            py: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#fff',
            borderBottom: '1px solid rgba(0,0,0,.06)',
            boxShadow: '0 2px 12px rgba(0,0,0,.03)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Hamburger — mobile only */}
            <IconButton
              onClick={() => setMobileOpen(true)}
              sx={{ display: { xs: 'flex', md: 'none' }, color: '#667eea', mr: 1 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography sx={{ fontWeight: 800, fontSize: { xs: '1.1rem', md: '1.35rem' }, background: g.primary, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {student?student.name:''}
            </Typography>
            <Typography sx={{ color: '#888', fontSize: '0.85rem', display: { xs: 'none', sm: 'block' } }}>
              {student.course_details?student.course_details.course_name:''}
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<MoreIcon />}
            onClick={() => setMoreOpen(true)}
            sx={{
              background: g.primary,
              borderRadius: '14px',
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              boxShadow: '0 4px 18px rgba(102,126,234,.35)',
              '&:hover': { boxShadow: '0 6px 24px rgba(102,126,234,.5)' },
            }}
          >
            More
          </Button>
        </Box>

        {/* Tabs */}
        <Box sx={{ px: { xs: 1, md: 4 }, pt: 2, background: '#fff' }}>
          <Tabs
            value={tabIdx}
            onChange={(_, v) => setTabIdx(v)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                fontSize: { xs: '0.85rem', md: '0.95rem' },
                minHeight: 48,
                color: '#888',
                '&.Mui-selected': { color: '#667eea' },
              },
              '& .MuiTabs-indicator': { background: g.primary, height: 3, borderRadius: '3px 3px 0 0' },
            }}
          >
            <Tab icon={<CalendarIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="Daily Schedule" />
            <Tab icon={<SchoolIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="Exam Schedule" />
          </Tabs>
        </Box>

        {/* Tab Content */}
        <Box sx={{ flex: 1, overflow: 'auto', px: { xs: 1.5, md: 4 }, py: 3 }}>
          {/* ── Daily Schedule Tab ── */}
          {tabIdx === 0 && (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', lg: '1fr' },
                gap: 3,
                alignItems: 'start',
              }}
            >
              {schedule.map((day) => (
                <Paper
                  key={day.id}
                  sx={{
                    borderRadius: '20px',
                    overflow: 'hidden',
                    boxShadow: '0 4px 24px rgba(102,126,234,.08)',
                    transition: 'box-shadow .3s ease, transform .3s ease',
                    '&:hover': {
                      boxShadow: '0 8px 36px rgba(102,126,234,.16)',
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  {/* Day header */}
                  <Box
                    sx={{
                      background: dayGradients[day.day] || g.primary,
                      px: 3,
                      py: 1.8,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                      <CalendarIcon sx={{ color: '#fff', fontSize: 22 }} />
                      <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '1.05rem', letterSpacing: '.3px' }}>
                        {day.day}
                      </Typography>
                    </Box>
                    <Chip
                      label={`${day.weekly_schedule_data.length} class${day.weekly_schedule_data.length !== 1 ? 'es' : ''}`}
                      size="small"
                      sx={{ background: 'rgba(255,255,255,.22)', color: '#fff', fontWeight: 600, fontSize: '0.75rem', backdropFilter: 'blur(4px)' }}
                    />
                  </Box>

                  {/* Classes inside using Table */}
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ background: 'rgba(102,126,234,.03)' }}>
                          <TableCell sx={{ fontWeight: 600, color: '#667eea', fontSize: '0.75rem', py: 1.5 }} align='start'>TIME</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: '#764ba2', fontSize: '0.75rem', py: 1.5 }} align='center'>SUBJECT</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: '#4facfe', fontSize: '0.75rem', py: 1.5 }} align='center'>ROOM</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: '#f5576c', fontSize: '0.75rem', py: 1.5 }} align='center'>PROF</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {day.weekly_schedule_data.map((item, i) => (
                          <TableRow
                            key={i}
                            sx={{
                              '&:last-child td, &:last-child th': { border: 0 },
                              transition: 'background .2s',
                              '&:hover': { background: 'rgba(102,126,234,.04)' },
                            }}
                          >
                            <TableCell sx={{ fontWeight: 700, color: '#1a1a2e', fontSize: '0.8rem', whiteSpace: 'nowrap' }} align='start'>
                              {fmtTime(item.start_time)} - {fmtTime(item.end_time)}
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600, color: '#1a1a2e', fontSize: '0.85rem' }} align='center'>
                              {item.subject}
                            </TableCell>
                            <TableCell align='center'>
                              <Chip label={item.room_number} size="small" sx={{ background: 'rgba(79,172,254,.1)', color: '#4facfe', fontWeight: 600, fontSize: '0.7rem', height: 24 }} />
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600, color: '#555', fontSize: '0.8rem' }} align='center'>
                              {item.professor}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              ))}
            </Box>
          )}

          {/* ── Exam Schedule Tab ── */}
          {tabIdx === 1 && (() => {
            const groupedExams = (examSchedule || []).reduce((acc, exam) => {
              const d = exam.date || exam.exam_date || 'Scheduled';
              if (!acc[d]) {
                acc[d] = [];
              }
              acc[d].push(exam);
              return acc;
            }, {});
            
            const gradientArray = [g.primary, g.teal, g.mint, g.amber, g.warm, g.lavender, g.rose, g.ocean];

            return (
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', lg: '1fr' },
                  gap: 3,
                  alignItems: 'start',
                }}
              >
                {Object.entries(groupedExams).length > 0 ? (
                  examSchedule.map((exam, idx) => (
                    <Paper
                      key={exam.id}
                      sx={{
                        borderRadius: '20px',
                        overflow: 'hidden',
                        boxShadow: '0 4px 24px rgba(102,126,234,.08)',
                        transition: 'box-shadow .3s ease, transform .3s ease',
                        '&:hover': {
                          boxShadow: '0 8px 36px rgba(102,126,234,.16)',
                          transform: 'translateY(-2px)',
                        },
                      }}
                    >
                      {/* Date header */}
                      <Box
                        sx={{
                          background: gradientArray[idx % gradientArray.length],
                          px: 3,
                          py: 1.8,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                          <CalendarIcon sx={{ color: '#fff', fontSize: 22 }} />
                          <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '1.05rem', letterSpacing: '.3px' }}>
                            {exam.date}
                          </Typography>
                        </Box>
                        <Chip
                          label={`${exam.exam_schedule_data.length} exam${exam.exam_schedule_data.length !== 1 ? 's' : ''}`}
                          size="small"
                          sx={{ background: 'rgba(255,255,255,.22)', color: '#fff', fontWeight: 600, fontSize: '0.75rem', backdropFilter: 'blur(4px)' }}
                        />
                      </Box>

                      {/* Exams inside using Table */}
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow sx={{ background: 'rgba(102,126,234,.03)' }}>
                              <TableCell sx={{ fontWeight: 600, color: '#667eea', fontSize: '0.75rem', py: 1.5 }} align='start'>TIME</TableCell>
                              <TableCell sx={{ fontWeight: 600, color: '#764ba2', fontSize: '0.75rem', py: 1.5 }} align='center'>SUBJECT</TableCell>
                              <TableCell sx={{ fontWeight: 600, color: '#4facfe', fontSize: '0.75rem', py: 1.5 }} align='center'>ROOM</TableCell>
                              <TableCell sx={{ fontWeight: 600, color: '#f5576c', fontSize: '0.75rem', py: 1.5 }} align='center'>TYPE</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {exam.exam_schedule_data.map((item, i) => (
                              <TableRow
                                key={i}
                                sx={{
                                  '&:last-child td, &:last-child th': { border: 0 },
                                  transition: 'background .2s',
                                  '&:hover': { background: 'rgba(102,126,234,.04)' },
                                }}
                              >
                                <TableCell sx={{ fontWeight: 700, color: '#1a1a2e', fontSize: '0.8rem', whiteSpace: 'nowrap' }} align='start'>
                                  {fmtTime(item.start_time)} - {fmtTime(item.end_time)}
                                </TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#1a1a2e', fontSize: '0.85rem' }} align='center'>
                                  {item.subject}
                                </TableCell>
                                <TableCell align='center'>
                                  <Chip label={item.room_number} size="small" sx={{ background: 'rgba(79,172,254,.1)', color: '#4facfe', fontWeight: 600, fontSize: '0.7rem', height: 24 }} />
                                </TableCell>
                                <TableCell align='center'>
                                  <Chip
                                    label={item.type || 'Exam'}
                                    size="small"
                                    sx={{
                                      background: item.type === 'Mid-Term' ? 'rgba(240,147,251,.12)' : 'rgba(102,126,234,.12)',
                                      color: item.type === 'Mid-Term' ? '#f093fb' : '#667eea',
                                      fontWeight: 600,
                                      fontSize: '0.7rem',
                                      height: 24,
                                    }}
                                  />
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Paper>
                  ))
                ) : (
                  <Paper
                    sx={{
                      p: 4,
                      textAlign: 'center',
                      borderRadius: '20px',
                      background: '#fff',
                      border: '1px solid rgba(0,0,0,.05)',
                      boxShadow: '0 4px 20px rgba(102,126,234,.05)',
                    }}
                  >
                    <SchoolIcon sx={{ fontSize: 48, color: '#ddd', mb: 2 }} />
                    <Typography sx={{ color: '#888', fontSize: '1.05rem', fontWeight: 500 }}>No exams scheduled at the moment</Typography>
                  </Paper>
                )}
              </Box>
            );
          })()}
        </Box>
      </Box>

      {/* ────── MORE MODAL ────── */}
      <Modal open={moreOpen} onClose={() => setMoreOpen(false)}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '92%', sm: 620 },
            maxHeight: '90vh',
            overflowY: 'auto',
            background: '#fff',
            borderRadius: '24px',
            boxShadow: '0 30px 80px rgba(0,0,0,.25)',
            outline: 'none',
          }}
        >
          {/* Modal Header */}
          <Box
            sx={{
              background: g.primary,
              p: 3,
              borderRadius: '24px 24px 0 0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <WalletIcon sx={{ color: '#fff', fontSize: 28 }} />
              <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '1.15rem' }}>Fee & Payment Details</Typography>
            </Box>
            <IconButton onClick={() => setMoreOpen(false)} sx={{ color: '#fff' }}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Box sx={{ p: 3 }}>
            {/* Summary Cards */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              {[
                { label: 'Total Fee', value: student.fee_details?`₹${student.fee_details.total_fee_amount}`:"₹0", bg: g.primary },
                { label: 'Paid', value: student.fee_details?`₹${student.fee_details.paid_amount}`:"₹0", bg: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
                { label: 'Pending', value: student.fee_details?`₹${student.fee_details.pending_amount}`:"₹0", bg: g.warm },
              ].map((c) => (
                <Box
                  key={c.label}
                  sx={{
                    flex: 1,
                    p: 2,
                    borderRadius: '16px',
                    background: c.bg,
                    color: '#fff',
                    textAlign: 'center',
                  }}
                >
                  <Typography sx={{ fontSize: '0.72rem', opacity: 0.85, textTransform: 'uppercase', letterSpacing: '.6px' }}>{c.label}</Typography>
                  <Typography sx={{ fontWeight: 800, fontSize: '1.25rem', mt: 0.5 }}>{c.value}</Typography>
                </Box>
              ))}
            </Box>

            {/* Fee Breakdown */}
            {/* <Typography sx={{ fontWeight: 700, color: '#1a1a2e', mb: 1.5, fontSize: '0.95rem' }}>Fee Breakdown</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
              {feeDetails.breakdown.map((item) => (
                <Box
                  key={item.label}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 1.5,
                    borderRadius: '12px',
                    background: g.card,
                    transition: 'transform .2s',
                    '&:hover': { transform: 'translateX(4px)' },
                  }}
                >
                  <Typography sx={{ fontWeight: 500, color: '#333' }}>{item.label}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography sx={{ fontWeight: 700, color: '#1a1a2e' }}>₹{item.amount.toLocaleString()}</Typography>
                    {item.status === 'Paid' ? (
                      <PaidIcon sx={{ fontSize: 18, color: '#43e97b' }} />
                    ) : (
                      <PendingIcon sx={{ fontSize: 18, color: '#f7971e' }} />
                    )}
                  </Box>
                </Box>
              ))}
            </Box> */}

            {/* Other Payments */}
            {/* <Typography sx={{ fontWeight: 700, color: '#1a1a2e', mb: 1.5, fontSize: '0.95rem' }}>Other Payments</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
              {feeDetails.otherPayments.map((item) => (
                <Box
                  key={item.label}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 1.5,
                    borderRadius: '12px',
                    background: g.card,
                    transition: 'transform .2s',
                    '&:hover': { transform: 'translateX(4px)' },
                  }}
                >
                  <Typography sx={{ fontWeight: 500, color: '#333' }}>{item.label}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography sx={{ fontWeight: 700, color: '#1a1a2e' }}>₹{item.amount.toLocaleString()}</Typography>
                    {item.status === 'Paid' ? (
                      <PaidIcon sx={{ fontSize: 18, color: '#43e97b' }} />
                    ) : (
                      <PendingIcon sx={{ fontSize: 18, color: '#f7971e' }} />
                    )}
                  </Box>
                </Box>
              ))}
            </Box> */}

            <Divider sx={{ my: 2 }} />

            {/* QR Code */}
            <Box sx={{ textAlign: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 2 }}>
                <QrIcon sx={{ color: '#667eea' }} />
                <Typography sx={{ fontWeight: 700, color: '#1a1a2e', fontSize: '0.95rem' }}>Student QR Code</Typography>
              </Box>
              <Typography sx={{ color: '#888', fontSize: '0.8rem', mb: 2 }}>
                Scan to view student details — name, enrollment, address, course & year
              </Typography>
              <Box
                sx={{
                  display: 'inline-block',
                  p: 2.5,
                  borderRadius: '20px',
                  background: '#fff',
                  border: '2px solid rgba(102,126,234,.15)',
                  boxShadow: '0 8px 30px rgba(102,126,234,.1)',
                }}
              >
                <QRCodeSVG value={qrData} size={180} level="H" includeMargin fgColor="#1a1a2e" />
              </Box>
            </Box>

            {/* Logout */}
            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Button
                startIcon={<LogoutIcon />}
                onClick={() => { clearSession(); window.location.href = '/'; }}
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

export default StudentPage;
