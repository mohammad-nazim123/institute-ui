import { useState, useMemo, Fragment, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Chip,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  LinearProgress,
  IconButton,
  Collapse,
  Tooltip,
  Divider,
  CircularProgress,
  Skeleton,
} from '@mui/material';
import {
  Download as DownloadIcon,
  CalendarMonth as CalendarIcon,
  DateRange as YearIcon,
  Person as PersonIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as PresentIcon,
  School as SchoolIcon,
  Cancel as AbsentIcon,
  TrendingUp as TrendingUpIcon,
  Groups as GroupsIcon,
  EventAvailable as EventAvailableIcon,
  EventBusy as EventBusyIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import PanelHeader from './PanelHeader';
import { monthNames } from './data';
import { getSyllabus, getStudents, getStudentAttendanceByMonth } from '../apis/attendance_apis';
import { getInstitute } from '../../utils/storage';

// Dynamic color palette for courses
const PALETTE = [
  { gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', light: 'rgba(102,126,234,0.08)', glow: 'rgba(102,126,234,0.3)', color: '#667eea', secondary: '#764ba2' },
  { gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', light: 'rgba(240,147,251,0.08)', glow: 'rgba(240,147,251,0.3)', color: '#f093fb', secondary: '#f5576c' },
  { gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', light: 'rgba(79,172,254,0.08)', glow: 'rgba(79,172,254,0.3)', color: '#4facfe', secondary: '#00f2fe' },
  { gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', light: 'rgba(67,233,123,0.08)', glow: 'rgba(67,233,123,0.3)', color: '#43e97b', secondary: '#38f9d7' },
  { gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', light: 'rgba(250,112,154,0.08)', glow: 'rgba(250,112,154,0.3)', color: '#fa709a', secondary: '#fee140' },
  { gradient: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)', light: 'rgba(161,140,209,0.08)', glow: 'rgba(161,140,209,0.3)', color: '#a18cd1', secondary: '#fbc2eb' },
];

const getTheme = (idx) => PALETTE[idx % PALETTE.length];

// Stat card
const StatCard = ({ icon, label, value, color, gradient, loading }) => (
  <Paper sx={{
    p: 2.5, borderRadius: '16px',
    background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.3)',
    boxShadow: `0 8px 32px ${color}20`,
    transition: 'all 0.4s cubic-bezier(0.4,0,0.2,1)',
    '&:hover': { transform: 'translateY(-6px) scale(1.02)', boxShadow: `0 16px 48px ${color}30` },
    display: 'flex', alignItems: 'center', gap: 2, flex: 1, minWidth: 180,
  }}>
    <Box sx={{ width: 52, height: 52, borderRadius: '14px', background: gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 6px 20px ${color}40` }}>
      {icon}
    </Box>
    <Box>
      <Typography variant="body2" sx={{ color: '#888', fontWeight: 500, fontSize: '0.78rem', letterSpacing: '0.5px', textTransform: 'uppercase' }}>{label}</Typography>
      {loading
        ? <Skeleton width={50} height={32} />
        : <Typography variant="h5" sx={{ fontWeight: 800, background: gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{value}</Typography>
      }
    </Box>
  </Paper>
);

// Percentage bar
const AttendanceBar = ({ percentage }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 180 }}>
    <Box sx={{ flex: 1, position: 'relative' }}>
      <LinearProgress variant="determinate" value={Math.min(percentage, 100)} sx={{
        height: 10, borderRadius: 5, backgroundColor: '#f0f0f0',
        '& .MuiLinearProgress-bar': {
          borderRadius: 5,
          background: percentage >= 75
            ? 'linear-gradient(90deg, #43a047, #66bb6a)'
            : percentage >= 50
              ? 'linear-gradient(90deg, #ff9800, #ffb74d)'
              : 'linear-gradient(90deg, #e53935, #ef5350)',
          boxShadow: percentage >= 75
            ? '0 2px 10px rgba(67,160,71,0.4)'
            : percentage >= 50
              ? '0 2px 10px rgba(255,152,0,0.4)'
              : '0 2px 10px rgba(229,57,53,0.4)',
        },
      }} />
    </Box>
    <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: percentage >= 75 ? '#2e7d32' : percentage >= 50 ? '#e65100' : '#c62828', minWidth: 45 }}>
      {percentage}%
    </Typography>
  </Box>
);

// Short day names
const shortDayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Color-coded daily calendar
const HorizontalCalendar = ({ attendanceMap, month, year, theme }) => {
  // month is 0-indexed
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const calendarDays = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const dateObj = new Date(year, month, day);
    const dow = dateObj.getDay();
    const isSunday = dow === 0;
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const status = attendanceMap[dateStr]; // 'present' | 'absent' | undefined
    calendarDays.push({ day, dateStr, dayName: shortDayNames[dow], isSunday, status });
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '5px', py: 1.5, px: 0.5 }}>
        {calendarDays.map(({ day, dateStr, dayName, isSunday, status }) => {
          const isPresent = status === 'Present';
          const isAbsent = status === 'Absent';
          const isRecorded = isPresent || isAbsent;
          const tooltipText = isSunday
            ? `${dateStr} — Sunday (Leave)`
            : isPresent ? `${dateStr} — Present ✓`
              : isAbsent ? `${dateStr} — Absent ✗`
                : `${dateStr} — No Record`;

          return (
            <Tooltip key={dateStr} title={tooltipText} arrow>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.3, width: 36 }}>
                <Typography sx={{
                  fontSize: '0.55rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2px', lineHeight: 1,
                  color: isSunday ? '#e65100' : '#999',
                }}>
                  {dayName}
                </Typography>
                <Box sx={{
                  width: 34, height: 34, borderRadius: '8px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: '0.75rem', cursor: 'default',
                  transition: 'all 0.25s ease',
                  background: isSunday
                    ? 'linear-gradient(135deg,#fff3e0,#ffe0b2)'
                    : isPresent
                      ? 'linear-gradient(135deg,#e8f5e9,#c8e6c9)'
                      : isAbsent
                        ? 'linear-gradient(135deg,#ffebee,#ffcdd2)'
                        : '#fafafa',
                  color: isSunday ? '#e65100' : isPresent ? '#2e7d32' : isAbsent ? '#c62828' : '#bbb',
                  border: isSunday
                    ? '1.5px solid #ffcc80'
                    : isPresent
                      ? '1.5px solid #a5d6a7'
                      : isAbsent
                        ? '1.5px solid #ef9a9a'
                        : '1px dashed #ddd',
                  '&:hover': {
                    transform: 'scale(1.12)',
                    boxShadow: isSunday
                      ? '0 4px 14px rgba(230,81,0,0.2)'
                      : isPresent
                        ? '0 4px 14px rgba(46,125,50,0.3)'
                        : isAbsent
                          ? '0 4px 14px rgba(198,40,40,0.3)'
                          : 'none',
                  },
                }}>
                  {day}
                </Box>
              </Box>
            </Tooltip>
          );
        })}
      </Box>
      {/* Color legend */}
      <Box sx={{ display: 'flex', gap: 2, mt: 1, px: 0.5, flexWrap: 'wrap' }}>
        {[
          { color: '#2e7d32', bg: 'linear-gradient(135deg,#e8f5e9,#c8e6c9)', label: 'Present' },
          { color: '#c62828', bg: 'linear-gradient(135deg,#ffebee,#ffcdd2)', label: 'Absent' },
          { color: '#e65100', bg: 'linear-gradient(135deg,#fff3e0,#ffe0b2)', label: 'Sunday' },
          { color: '#bbb', bg: '#fafafa', label: 'No Record' },
        ].map(({ color, bg, label }) => (
          <Box key={label} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 14, height: 14, borderRadius: '4px', background: bg, border: `1px solid ${color}40` }} />
            <Typography sx={{ fontSize: '0.7rem', color: '#777', fontWeight: 500 }}>{label}</Typography>
          </Box>
        ))}
      </Box>
      <Box sx={{ height: 4, borderRadius: '0 0 8px 8px', background: `linear-gradient(90deg,${theme.color}33 0%,${theme.color} 50%,${theme.color}33 100%)`, mt: 1.5, mx: 1 }} />
    </Box>
  );
};

// ══════════════════════════════════════════════
//           STUDENT ATTENDANCE PANEL
// ══════════════════════════════════════════════
const StudentAttendancePanel = () => {
  const now = new Date();
  const [selectedCourseIdx, setSelectedCourseIdx] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth()); // 0-indexed
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [expandedStudent, setExpandedStudent] = useState(null);
  const [downloadAnchor, setDownloadAnchor] = useState(null);
  const [studentDialogOpen, setStudentDialogOpen] = useState(false);
  const [selectedStudentForDownload, setSelectedStudentForDownload] = useState('');
  const [downloadType, setDownloadType] = useState('monthly');

  // API data
  const [courses, setCourses] = useState([]);
  const [allStudents, setAllStudents] = useState([]); // flat list from API
  const [attendanceCache, setAttendanceCache] = useState({}); // { "studentId_YYYY-MM": [{date,status,...}] }
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [loadingAttendance, setLoadingAttendance] = useState(false);

  const institute = getInstitute();

  // ── Month string helper ──
  const monthStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}`;

  // ── Active theme ──
  const theme = getTheme(selectedCourseIdx);

  // ── Load courses ──
  useEffect(() => {
    getSyllabus().then((res) => {
      if ([200, 201].includes(res.status) && res.body?.[0]?.courses) {
        setCourses(res.body[0].courses);
      }
    });
  }, []);

  // ── Load students ──
  useEffect(() => {
    setLoadingStudents(true);
    getStudents().then((res) => {
      if ([200, 201].includes(res.status)) {
        // API returns [{students:[...],...}] or {students:[...]}
        const raw = Array.isArray(res.body) ? res.body : [res.body];
        const flat = raw.flatMap((item) => item.students || []);
        setAllStudents(flat);
      }
      setLoadingStudents(false);
    }).catch(() => setLoadingStudents(false));
  }, []);

  // ── Students for currently selected course ──
  const activeCourse = courses[selectedCourseIdx];
  const courseStudents = useMemo(() => {
    if (!activeCourse) return allStudents;
    return allStudents.filter((s) => {
      const courseName = activeCourse.name?.toLowerCase();
      // Match against course_assignment (set by admin), or course_details fields
      const ca = s.course_assignment;
      const cd = s.course_details;
      return (
        ca?.course_name?.toLowerCase() === courseName ||
        ca?.course_id === activeCourse.id ||
        String(ca?.course_id) === String(activeCourse.id) ||
        cd?.branch?.toLowerCase() === courseName ||
        cd?.course_name?.toLowerCase() === courseName
      );
    });
  }, [allStudents, activeCourse]);

  // ── Load attendance for all students in current course for current month ──
  const fetchAttendanceForCourse = useCallback(async (students, month) => {
    setLoadingAttendance(true);
    const toFetch = students.filter((s) => !attendanceCache[`${s.id}_${month}`]);
    await Promise.all(toFetch.map(async (s) => {
      try {
        const res = await getStudentAttendanceByMonth(s.id, month);
        if ([200, 201].includes(res.status)) {
          setAttendanceCache((prev) => ({ ...prev, [`${s.id}_${month}`]: Array.isArray(res.body) ? res.body : [] }));
        } else {
          setAttendanceCache((prev) => ({ ...prev, [`${s.id}_${month}`]: [] }));
        }
      } catch {
        setAttendanceCache((prev) => ({ ...prev, [`${s.id}_${month}`]: [] }));
      }
    }));
    setLoadingAttendance(false);
  }, [attendanceCache]);

  useEffect(() => {
    if (courseStudents.length > 0) {
      fetchAttendanceForCourse(courseStudents, monthStr);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseStudents, monthStr]);

  // ── Get attendance records for a student ──
  const getStudentRecords = (studentId) => attendanceCache[`${studentId}_${monthStr}`] || [];

  // ── Normalize API status: boolean true/false → "Present"/"Absent" ──
  const normalizeStatus = (status) => {
    if (status === true || status === 'true' || status === 'Present') return 'Present';
    if (status === false || status === 'false' || status === 'Absent') return 'Absent';
    return undefined;
  };

  // ── Build date→status map from records ──
  const buildAttendanceMap = (records) => {
    const map = {};
    records.forEach((r) => {
      if (r.date) map[r.date] = normalizeStatus(r.status);
    });
    return map;
  };

  // ── Compute stats from records ──
  const computeStats = (records) => {
    const present = records.filter((r) => normalizeStatus(r.status) === 'Present').length;
    const absent  = records.filter((r) => normalizeStatus(r.status) === 'Absent').length;
    const total = present + absent;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
    return { present, absent, total, percentage };
  };

  // ── Course-level summary stats ──
  const courseStats = useMemo(() => {
    let totalPresent = 0;
    let totalAbsent = 0;
    courseStudents.forEach((s) => {
      const records = getStudentRecords(s.id);
      const st = computeStats(records);
      totalPresent += st.present;
      totalAbsent += st.absent;
    });
    const totalDays = totalPresent + totalAbsent;
    const avgPercentage = totalDays > 0 ? Math.round((totalPresent / totalDays) * 100) : 0;
    return { totalPresent, totalAbsent, avgPercentage, studentCount: courseStudents.length };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseStudents, attendanceCache, monthStr]);

  // ── CSV download ──
  const downloadCSV = (rows, filename) => {
    const header = 'Roll No,Student Name,Course,Present,Absent,Attendance %\n';
    const csvRows = rows.map((r) => `${r.rollNo},"${r.name}","${r.course}",${r.present},${r.absent},${r.percentage}%`).join('\n');
    const blob = new Blob([header + csvRows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getStudentName = (s) => s.name || `${s.first_name || ''} ${s.last_name || ''}`.trim() || 'Unknown';
  const getStudentRoll = (s) => s.admission_details?.roll_number || s.roll_number || s.rollNo || '—';
  const getStudentCourse = (s) => s.course_assignment?.course_name || activeCourse?.name || '—';

  const handleDownloadMonthly = () => {
    const rows = courseStudents.map((s) => {
      const { present, absent, percentage } = computeStats(getStudentRecords(s.id));
      return { rollNo: getStudentRoll(s), name: getStudentName(s), course: getStudentCourse(s), present, absent, percentage };
    });
    downloadCSV(rows, `${activeCourse?.name || 'Course'}_${monthNames[selectedMonth]}_${selectedYear}_Attendance.csv`);
    setDownloadAnchor(null);
  };

  const handleDownloadYearly = () => {
    // Only available data (current cache won't have all months — download what we have)
    const rows = courseStudents.map((s) => {
      const allRecords = Object.entries(attendanceCache)
        .filter(([key]) => key.startsWith(`${s.id}_${selectedYear}`))
        .flatMap(([, recs]) => recs);
      const { present, absent, percentage } = computeStats(allRecords);
      return { rollNo: getStudentRoll(s), name: getStudentName(s), course: getStudentCourse(s), present, absent, percentage };
    });
    downloadCSV(rows, `${activeCourse?.name || 'Course'}_${selectedYear}_Yearly_Attendance.csv`);
    setDownloadAnchor(null);
  };

  const handleOpenStudentDialog = () => {
    setDownloadAnchor(null);
    setStudentDialogOpen(true);
    setSelectedStudentForDownload('');
    setDownloadType('monthly');
  };

  const handleDownloadStudentReport = () => {
    if (!selectedStudentForDownload) return;
    const student = allStudents.find((s) => String(s.id) === String(selectedStudentForDownload));
    if (!student) return;
    const records = getStudentRecords(student.id);
    const { present, absent, percentage } = computeStats(records);
    const rows = [{ rollNo: getStudentRoll(student), name: getStudentName(student), course: getStudentCourse(student), present, absent, percentage }];
    const suffix = downloadType === 'monthly' ? `${monthNames[selectedMonth]}_${selectedYear}` : `${selectedYear}_Yearly`;
    downloadCSV(rows, `${getStudentName(student)}_${suffix}_Attendance.csv`);
    setStudentDialogOpen(false);
  };

  // ── Refresh attendance for current view ──
  const handleRefresh = () => {
    // Clear cache for this month so it re-fetches
    const keysToRemove = courseStudents.map((s) => `${s.id}_${monthStr}`);
    setAttendanceCache((prev) => {
      const updated = { ...prev };
      keysToRemove.forEach((k) => delete updated[k]);
      return updated;
    });
  };

  return (
    <Box>
      <PanelHeader
        title="Student Attendance"
        subtitle="Track and download attendance records organized by course"
        gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      />

      {/* ── Course Selector ── */}
      <Paper sx={{ borderRadius: '18px', mb: 3, p: 2.5, boxShadow: '0 6px 28px rgba(0,0,0,0.07)', display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ width: 44, height: 44, borderRadius: '12px', background: theme.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 16px ${theme.glow}` }}>
          <SchoolIcon sx={{ color: '#fff', fontSize: 22 }} />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="body2" sx={{ color: '#999', fontWeight: 500, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', mb: 0.3 }}>
            Select Course
          </Typography>
          <FormControl fullWidth size="small">
            <Select
              value={selectedCourseIdx}
              onChange={(e) => { setSelectedCourseIdx(e.target.value); setExpandedStudent(null); }}
              displayEmpty
              sx={{
                borderRadius: '12px', fontWeight: 700, fontSize: '1rem', background: theme.light,
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'transparent' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: theme.color },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: theme.color, borderWidth: '2px' },
              }}
              renderValue={(idx) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', background: getTheme(idx).gradient, boxShadow: `0 2px 8px ${getTheme(idx).glow}` }} />
                  {courses[idx]?.name || 'All Students'}
                </Box>
              )}
            >
              {courses.map((c, idx) => (
                <MenuItem key={c.id} value={idx} sx={{ py: 1.5, px: 2, borderRadius: '8px', mx: 1, my: 0.3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', background: getTheme(idx).gradient }} />
                    <Typography fontWeight={600}>{c.name}</Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* ── Stats Cards ── */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
        <StatCard icon={<GroupsIcon sx={{ color: '#fff', fontSize: 26 }} />} label="Students" value={courseStats.studentCount} color={theme.color} gradient={theme.gradient} loading={loadingStudents} />
        <StatCard icon={<EventAvailableIcon sx={{ color: '#fff', fontSize: 26 }} />} label="Total Present" value={courseStats.totalPresent} color="#43a047" gradient="linear-gradient(135deg,#43a047,#66bb6a)" loading={loadingAttendance} />
        <StatCard icon={<EventBusyIcon sx={{ color: '#fff', fontSize: 26 }} />} label="Total Absent" value={courseStats.totalAbsent} color="#e53935" gradient="linear-gradient(135deg,#e53935,#ef5350)" loading={loadingAttendance} />
        <StatCard icon={<TrendingUpIcon sx={{ color: '#fff', fontSize: 26 }} />} label="Avg Attendance" value={`${courseStats.avgPercentage}%`} color={theme.color} gradient={theme.gradient} loading={loadingAttendance} />
      </Box>

      {/* ── Controls Bar ── */}
      <Paper sx={{ borderRadius: '16px', mb: 3, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel sx={{ fontWeight: 500 }}>Month</InputLabel>
            <Select value={selectedMonth} label="Month" onChange={(e) => setSelectedMonth(e.target.value)} sx={{ borderRadius: '12px', '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: theme.color }, '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: theme.color } }}>
              {monthNames.map((name, idx) => (
                <MenuItem key={idx} value={idx}>{name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 100 }}>
            <InputLabel sx={{ fontWeight: 500 }}>Year</InputLabel>
            <Select value={selectedYear} label="Year" onChange={(e) => setSelectedYear(e.target.value)} sx={{ borderRadius: '12px', '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: theme.color }, '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: theme.color } }}>
              {[2024, 2025, 2026, 2027].map((yr) => (
                <MenuItem key={yr} value={yr}>{yr}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Tooltip title="Refresh attendance">
            <IconButton onClick={handleRefresh} sx={{ color: theme.color, border: `1.5px solid ${theme.color}30`, borderRadius: '10px' }}>
              {loadingAttendance ? <CircularProgress size={18} sx={{ color: theme.color }} /> : <RefreshIcon />}
            </IconButton>
          </Tooltip>
        </Box>

        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={(e) => setDownloadAnchor(e.currentTarget)}
          sx={{
            background: theme.gradient, borderRadius: '12px', textTransform: 'none', fontWeight: 700,
            px: 3, py: 1.2, fontSize: '0.9rem', boxShadow: `0 6px 20px ${theme.glow}`,
            '&:hover': { transform: 'translateY(-2px)', boxShadow: `0 10px 30px ${theme.glow}` },
          }}
        >
          Download Report
        </Button>

        <Menu anchorEl={downloadAnchor} open={Boolean(downloadAnchor)} onClose={() => setDownloadAnchor(null)}
          PaperProps={{ sx: { borderRadius: '14px', boxShadow: '0 12px 40px rgba(0,0,0,0.12)', minWidth: 240, overflow: 'hidden' } }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }} anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}>
          <MenuItem onClick={handleDownloadMonthly} sx={{ py: 1.5, px: 2.5, '&:hover': { background: theme.light } }}>
            <ListItemIcon><CalendarIcon sx={{ color: theme.color }} /></ListItemIcon>
            <ListItemText primary={<Typography fontWeight={600}>Monthly Report</Typography>} secondary={`${monthNames[selectedMonth]} ${selectedYear}`} />
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleDownloadYearly} sx={{ py: 1.5, px: 2.5, '&:hover': { background: theme.light } }}>
            <ListItemIcon><YearIcon sx={{ color: theme.secondary }} /></ListItemIcon>
            <ListItemText primary={<Typography fontWeight={600}>Yearly Report</Typography>} secondary={`Full Year ${selectedYear}`} />
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleOpenStudentDialog} sx={{ py: 1.5, px: 2.5, '&:hover': { background: theme.light } }}>
            <ListItemIcon><PersonIcon sx={{ color: '#ff6f00' }} /></ListItemIcon>
            <ListItemText primary={<Typography fontWeight={600}>Student Report</Typography>} secondary="Individual student download" />
          </MenuItem>
        </Menu>
      </Paper>

      {/* ── Attendance Table ── */}
      <Paper sx={{ borderRadius: '20px', boxShadow: '0 10px 40px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
        <Box sx={{ p: 2.5, background: theme.gradient, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700 }}>
            {activeCourse?.name || 'All Students'} — {monthNames[selectedMonth]} {selectedYear}
          </Typography>
          {loadingAttendance && <CircularProgress size={18} sx={{ color: 'rgba(255,255,255,0.8)' }} />}
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ background: `linear-gradient(135deg, ${theme.light} 0%, #f8f9fc 100%)` }}>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#444', py: 2 }}>Student</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#444', py: 2 }}>Roll No</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#444', py: 2 }}>Present</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#444', py: 2 }}>Absent</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#444', py: 2, minWidth: 200 }}>Attendance %</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#444', py: 2 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#444', py: 2 }} align="center">Details</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loadingStudents
                ? Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 7 }).map((__, j) => (
                      <TableCell key={j}><Skeleton height={36} /></TableCell>
                    ))}
                  </TableRow>
                ))
                : courseStudents.length === 0
                  ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                        <Typography color="text.secondary" fontWeight={500}>
                          No students found for this course.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )
                  : courseStudents.map((student) => {
                    const records = getStudentRecords(student.id);
                    const stats = computeStats(records);
                    const attendanceMap = buildAttendanceMap(records);
                    const isExpanded = expandedStudent === student.id;
                    const name = getStudentName(student);
                    const rollNo = getStudentRoll(student);
                    const courseName = getStudentCourse(student);

                    return (
                      <Fragment key={student.id}>
                        <TableRow
                          sx={{
                            transition: 'background 0.3s ease', cursor: 'pointer',
                            '&:hover': { background: theme.light },
                            ...(isExpanded && { background: theme.light }),
                          }}
                          onClick={() => setExpandedStudent(isExpanded ? null : student.id)}
                        >
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Avatar sx={{ width: 40, height: 40, background: theme.gradient, fontWeight: 700, fontSize: '0.95rem', boxShadow: `0 4px 12px ${theme.glow}` }}>
                                {name[0]?.toUpperCase() || '?'}
                              </Avatar>
                              <Box>
                                <Typography fontWeight={600} sx={{ fontSize: '0.9rem' }}>{name}</Typography>
                                <Typography variant="caption" sx={{ color: '#999' }}>{courseName}</Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip label={rollNo} size="small" sx={{ fontWeight: 600, fontSize: '0.75rem', background: '#f0f0f0', border: '1px solid #e0e0e0' }} />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <PresentIcon sx={{ color: '#43a047', fontSize: 18 }} />
                              <Typography fontWeight={700} sx={{ color: '#2e7d32' }}>{stats.present}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <AbsentIcon sx={{ color: '#e53935', fontSize: 18 }} />
                              <Typography fontWeight={700} sx={{ color: '#c62828' }}>{stats.absent}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <AttendanceBar percentage={stats.percentage} />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={stats.percentage >= 75 ? 'Good' : stats.percentage >= 50 ? 'Warning' : stats.total === 0 ? 'No Data' : 'Critical'}
                              size="small"
                              sx={{
                                fontWeight: 700, fontSize: '0.72rem',
                                background: stats.percentage >= 75
                                  ? 'linear-gradient(135deg,#e8f5e9,#c8e6c9)'
                                  : stats.percentage >= 50
                                    ? 'linear-gradient(135deg,#fff3e0,#ffe0b2)'
                                    : stats.total === 0
                                      ? '#f5f5f5'
                                      : 'linear-gradient(135deg,#ffebee,#ffcdd2)',
                                color: stats.percentage >= 75 ? '#2e7d32' : stats.percentage >= 50 ? '#e65100' : stats.total === 0 ? '#999' : '#c62828',
                                border: stats.percentage >= 75 ? '1px solid #a5d6a7' : stats.percentage >= 50 ? '1px solid #ffcc80' : stats.total === 0 ? '1px dashed #ddd' : '1px solid #ef9a9a',
                              }}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <IconButton size="small" sx={{ color: theme.color, transition: 'all 0.3s ease', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                              <ExpandMoreIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>

                        {/* ── Expanded Row ── */}
                        <TableRow key={`${student.id}-expand`}>
                          <TableCell colSpan={7} sx={{ py: 0, border: isExpanded ? undefined : 'none' }}>
                            <Collapse in={isExpanded} timeout={400}>
                              <Box sx={{ py: 3, px: 2, background: 'linear-gradient(135deg,#fafbff,#f5f7ff)', borderRadius: '12px', my: 1 }}>
                                <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>

                                  {/* Daily Calendar */}
                                  <Box sx={{ flex: 1, minWidth: 280 }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#555' }}>
                                      📅 Daily Attendance — {monthNames[selectedMonth]} {selectedYear}
                                    </Typography>
                                    {loadingAttendance
                                      ? <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 2 }}>
                                        <CircularProgress size={20} />
                                        <Typography variant="body2" color="text.secondary">Loading attendance…</Typography>
                                      </Box>
                                      : <HorizontalCalendar attendanceMap={attendanceMap} month={selectedMonth} year={selectedYear} theme={theme} />
                                    }
                                  </Box>

                                  {/* Student Info + Monthly Summary */}
                                  <Box sx={{ minWidth: 220 }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: '#555' }}>
                                      📊 Monthly Summary
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <PresentIcon sx={{ color: '#43a047', fontSize: 20 }} />
                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                          Present: <strong style={{ color: '#2e7d32' }}>{stats.present}</strong>
                                        </Typography>
                                      </Box>
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <AbsentIcon sx={{ color: '#e53935', fontSize: 20 }} />
                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                          Absent: <strong style={{ color: '#c62828' }}>{stats.absent}</strong>
                                        </Typography>
                                      </Box>
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <TrendingUpIcon sx={{ color: theme.color, fontSize: 20 }} />
                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                          Attendance: <strong>{stats.percentage}%</strong>
                                        </Typography>
                                      </Box>
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <SchoolIcon sx={{ color: '#888', fontSize: 18 }} />
                                        <Typography variant="body2" sx={{ fontWeight: 500, color: '#666' }}>
                                          Total Working Days: <strong>{stats.total}</strong>
                                        </Typography>
                                      </Box>
                                    </Box>

                                    {/* Student extra info */}
                                    <Divider sx={{ my: 2 }} />
                                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#555', fontSize: '0.78rem', textTransform: 'uppercase' }}>
                                      Student Info
                                    </Typography>
                                    {[
                                      ['Roll No', rollNo],
                                      ['Course', courseName],
                                      ['Email', student.contact_details?.email || student.email || '—'],
                                      ['Mobile', student.contact_details?.mobile || student.mobile || '—'],
                                    ].map(([label, val]) => (
                                      <Box key={label} sx={{ display: 'flex', gap: 1, mb: 0.5 }}>
                                        <Typography variant="caption" sx={{ color: '#999', width: 60, flexShrink: 0 }}>{label}</Typography>
                                        <Typography variant="caption" sx={{ fontWeight: 600, color: '#444' }}>{val}</Typography>
                                      </Box>
                                    ))}
                                  </Box>
                                </Box>
                              </Box>
                            </Collapse>
                          </TableCell>
                        </TableRow>
                      </Fragment>
                    );
                  })
              }
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* ── Student Download Dialog ── */}
      <Dialog open={studentDialogOpen} onClose={() => setStudentDialogOpen(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: '20px', overflow: 'hidden' } }}>
        <Box sx={{ background: theme.gradient, p: 0.5 }} />
        <DialogTitle sx={{ fontWeight: 700, pt: 3 }}>Download Student Report</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Select a student and report type to download their attendance report.
          </Typography>
          <FormControl fullWidth sx={{ mb: 2.5 }}>
            <InputLabel>Select Student</InputLabel>
            <Select value={selectedStudentForDownload} label="Select Student" onChange={(e) => setSelectedStudentForDownload(e.target.value)} sx={{ borderRadius: '12px' }}>
              {courseStudents.map((s) => (
                <MenuItem key={s.id} value={String(s.id)}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ width: 28, height: 28, fontSize: '0.75rem', background: theme.gradient }}>
                      {getStudentName(s)[0]?.toUpperCase()}
                    </Avatar>
                    {getStudentName(s)}
                    <Chip label={getStudentRoll(s)} size="small" sx={{ fontSize: '0.7rem', ml: 'auto' }} />
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Report Type</InputLabel>
            <Select value={downloadType} label="Report Type" onChange={(e) => setDownloadType(e.target.value)} sx={{ borderRadius: '12px' }}>
              <MenuItem value="monthly">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalendarIcon sx={{ color: theme.color, fontSize: 20 }} />
                  Monthly — {monthNames[selectedMonth]} {selectedYear}
                </Box>
              </MenuItem>
              <MenuItem value="yearly">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <YearIcon sx={{ color: theme.secondary, fontSize: 20 }} />
                  Yearly — {selectedYear}
                </Box>
              </MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setStudentDialogOpen(false)} sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600, color: '#888' }}>
            Cancel
          </Button>
          <Button variant="contained" startIcon={<DownloadIcon />} onClick={handleDownloadStudentReport}
            disabled={!selectedStudentForDownload}
            sx={{ background: theme.gradient, borderRadius: '12px', textTransform: 'none', fontWeight: 700, px: 3, boxShadow: `0 4px 16px ${theme.glow}`, '&:hover': { transform: 'translateY(-1px)' } }}>
            Download
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StudentAttendancePanel;
