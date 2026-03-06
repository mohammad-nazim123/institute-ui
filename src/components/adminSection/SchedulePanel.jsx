import { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, Tabs, Tab, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Button, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, MenuItem, Select, FormControl, InputLabel, Chip, Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CalendarMonth as CalendarIcon,
  Schedule as TimeIcon,
  MenuBook as SubjectIcon,
  Room as RoomIcon,
  Person as ProfessorIcon,
  School as ClassIcon,
  Event as ExamIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import PanelHeader from './PanelHeader';
import { createSchedule, getSchedule, createExamSchedule, getExamSchedule } from '../apis/schedule_api';
import {getProfessors} from '../apis/professors_api';
import {getSyllabus} from '../apis/syllabus_api';
import {getStudents} from '../apis/students_api';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { renderTimeViewClock } from '@mui/x-date-pickers/timeViewRenderers';
import dayjs from 'dayjs';
import { getInstitute } from '../../utils/storage';

/* ──────────── gradient palette ──────────── */
const g = {
  primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  accent: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  warm: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
};

const dayGradients = {
  Monday: 'linear-gradient(135deg,#667eea,#764ba2)',
  Tuesday: 'linear-gradient(135deg,#4facfe,#00f2fe)',
  Wednesday: 'linear-gradient(135deg,#43e97b,#38f9d7)',
  Thursday: 'linear-gradient(135deg,#fa709a,#fee140)',
  Friday: 'linear-gradient(135deg,#f093fb,#f5576c)',
  Saturday: 'linear-gradient(135deg,#a18cd1,#fbc2eb)',
};

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const examTypes = ['Mid-Term', 'End-Term', 'Quiz', 'Practical', 'Viva'];
const rooms = ['Room 101', 'Room 201', 'Room 202', 'Room 305', 'Room 404', 'Lab 102', 'Lab 103', 'Lab 301', 'Lab 302', 'Lab 304', 'Hall A', 'Hall B', 'Hall C'];
const subjects = ['Data Structures & Algorithms', 'Operating Systems', 'Database Management', 'Computer Networks', 'Software Engineering', 'Discrete Mathematics'];
const professors = ['Dr. Sarah Wilson', 'Prof. James Brown', 'Dr. Emily Davis', 'Dr. Raj Patel', 'Prof. Lisa Chen', 'Dr. Ahmed Khan'];
const classes = ['B.Tech CS 3A', 'B.Tech CS 3B', 'B.Tech IT 2A', 'M.Tech CS 1A', 'BCA 2A'];

/* ──────────── initial sample data ──────────── */
// const initDaily = [
//   { id: 1, day: 'Monday', startTime: '09:00', endTime: '10:00', subject: 'Data Structures & Algorithms', room: 'Room 201', professor: 'Dr. Sarah Wilson', class: 'B.Tech CS 3A' },
//   { id: 2, day: 'Monday', startTime: '10:15', endTime: '11:15', subject: 'Operating Systems', room: 'Room 305', professor: 'Prof. James Brown', class: 'B.Tech CS 3A' },
//   { id: 3, day: 'Monday', startTime: '11:30', endTime: '12:30', subject: 'Computer Networks', room: 'Lab 102', professor: 'Dr. Raj Patel', class: 'B.Tech CS 3A' },
//   { id: 4, day: 'Tuesday', startTime: '09:00', endTime: '10:00', subject: 'Software Engineering', room: 'Room 101', professor: 'Prof. Lisa Chen', class: 'B.Tech CS 3A' },
//   { id: 5, day: 'Tuesday', startTime: '10:15', endTime: '11:15', subject: 'Discrete Mathematics', room: 'Room 202', professor: 'Dr. Ahmed Khan', class: 'B.Tech CS 3A' },
//   { id: 6, day: 'Wednesday', startTime: '09:00', endTime: '10:00', subject: 'Database Management', room: 'Room 404', professor: 'Dr. Emily Davis', class: 'B.Tech IT 2A' },
//   { id: 7, day: 'Thursday', startTime: '09:00', endTime: '10:00', subject: 'Operating Systems', room: 'Room 305', professor: 'Prof. James Brown', class: 'B.Tech IT 2A' },
//   { id: 8, day: 'Friday', startTime: '09:00', endTime: '10:00', subject: 'Data Structures & Algorithms', room: 'Room 201', professor: 'Dr. Sarah Wilson', class: 'B.Tech CS 3B' },
//   { id: 9, day: 'Saturday', startTime: '09:00', endTime: '10:00', subject: 'Revision / Tutorial', room: 'Room 101', professor: 'Dr. Sarah Wilson', class: 'B.Tech CS 3A' },
// ];

// const initExam = [
//   { id: 1, date: '2026-03-15', subject: 'Data Structures & Algorithms', startTime: '10:00', endTime: '13:00', room: 'Hall A', type: 'Mid-Term', class: 'B.Tech CS 3A' },
//   { id: 2, date: '2026-03-17', subject: 'Operating Systems', startTime: '10:00', endTime: '13:00', room: 'Hall B', type: 'Mid-Term', class: 'B.Tech CS 3A' },
//   { id: 3, date: '2026-03-19', subject: 'Database Management', startTime: '14:00', endTime: '17:00', room: 'Hall A', type: 'Mid-Term', class: 'B.Tech IT 2A' },
//   { id: 4, date: '2026-03-21', subject: 'Computer Networks', startTime: '10:00', endTime: '13:00', room: 'Hall C', type: 'End-Term', class: 'B.Tech CS 3B' },
// ];

/* ──────────── shared styles ──────────── */
const inputSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    background: '#f8f9fc',
    transition: 'all .3s ease',
    '&:hover': { background: '#fff', boxShadow: '0 4px 12px rgba(102,126,234,.1)' },
    '&:hover fieldset': { borderColor: '#667eea' },
    '&.Mui-focused': { background: '#fff', boxShadow: '0 4px 20px rgba(102,126,234,.15)' },
    '&.Mui-focused fieldset': { borderColor: '#667eea', borderWidth: '2px' },
  },
  '& .MuiInputLabel-root.Mui-focused': { color: '#667eea' },
};

const headerCellSx = {
  fontWeight: 700,
  color: '#fff',
  fontSize: '0.82rem',
  textTransform: 'uppercase',
  letterSpacing: '.4px',
  borderBottom: 'none',
  alignItems:'center',
  justifyContent:'center',
  width:'18%',
  py: 1.8,
};

const bodyCellSx = {
  fontSize: '0.88rem',
  color: '#333',
  py: 1.6,
  borderBottom: '1px solid rgba(102,126,234,.07)',
  alignItems:'center',
  justifyContent:'center',
  width:'18%',
};

/* ────────────────────────────────────────── */
/*             SCHEDULE  PANEL               */
/* ────────────────────────────────────────── */
const SchedulePanel = () => {
  const [tabIdx, setTabIdx] = useState(0);

  /* ── daily state ── */
  const [dailyRows, setDailyRows] = useState([]);
  const [dailyModal, setDailyModal] = useState(false);
  const [dailyEdit, setDailyEdit] = useState(null); // null = add, obj = edit
  const [dailyForm, setDailyForm] = useState({ day: '', start_time: '', end_time: '', subject: '', room_number: '', professor: '', classes: '' });

  /* ── exam state ── */
  const [examRows, setExamRows] = useState([]);
  const [examModal, setExamModal] = useState(false);
  const [examEdit, setExamEdit] = useState(null);
  const [examForm, setExamForm] = useState({ date: '', subject: '', start_time: '', end_time: '', room_number: '', type: '', class: '' });

  const [professorList, setProfessorList] = useState([]);
  const [syllabusList, setSyllabusList] = useState([]);
  const [studentList, setStudentList] = useState([]);
  const [scheduleList, setScheduleList] = useState([]);
  const [examScheduleList, setExamScheduleList] = useState([]);


  /* ── helpers ── */
  // const nextDailyId = () => (dailyRows.length ? Math.max(...dailyRows.map((r) => r.id)) + 1 : 1);
  // const nextExamId = () => (examRows.length ? Math.max(...examRows.map((r) => r.id)) + 1 : 1);

  function getWeeklyScheduleData(){
     getSchedule().then((res) => {
      setScheduleList(res.body[0].weekly_schedules)
      console.log("schedule",res.body[0].weekly_schedules);
    })
  }

  function getExamScheduleData(){
    getExamSchedule().then((res) => {
      setExamScheduleList(res.body[0].exam_schedules)
      console.log("exam schedule",res.body);
    })
  }

  const fmtTime = (t) => {
    if (!t) return '';
    const [h, m] = t.split(':');
    const hr = parseInt(h, 10);
    const ampm = hr >= 12 ? 'PM' : 'AM';
    return `${hr % 12 || 12}:${m} ${ampm}`;
  };

  /* ── daily CRUD ── */
  const openDailyAdd = () => {
    setDailyEdit(null);
    setDailyForm({ day: '', start_time: '', end_time: '', subject: '', room_number: '', professor: '', classes: '' });
    setDailyModal(true);
  };
  const openDailyEdit = (row) => {
    setDailyEdit(row);
    setDailyForm({ ...row });
    setDailyModal(true);
  };
  const saveDaily = async () => {
  const [institute] = await Promise.all([getInstitute()]);

  console.log("institute",institute,getInstitute())

    const weeklySchedule = {
      institute:institute,
      day: dailyForm.day,
      weekly_schedule_data: [
        {
          start_time: dailyForm.start_time,
          end_time: dailyForm.end_time,
          subject: dailyForm.subject,
          room_number: dailyForm.room_number,
          professor: dailyForm.professor,
          classes: dailyForm.classes,
        }
      ]
    }
    createSchedule(weeklySchedule)
    .then((res) => {
      if([200,201].includes(res.status)){
        getWeeklyScheduleData();
      }
      // console.log("res",res.body);
    })
    .catch((err) => {
      console.log("err",err);
    });

    // if (dailyEdit) {
    //   setDailyRows((prev) => prev.map((r) => (r.id === dailyEdit.id ? { ...dailyForm, id: dailyEdit.id } : r)));
    // } else {
    //   setDailyRows((prev) => [...prev, { ...dailyForm, id: nextDailyId() }]);
    // }
    // setDailyModal(false);
  };
  // const deleteDaily = (id) => setDailyRows((prev) => prev.filter((r) => r.id !== id));
  function deleteDaily(id){

  }

  /* ── exam CRUD ── */
  const openExamAdd = () => {
    setExamEdit(null);
    setExamForm({ exam_date: '', subject: '', start_time: '', end_time: '', room_number: '', type: '', classes: '' });
    setExamModal(true);
  };
  const openExamEdit = (row) => {
    setExamEdit(row);
    setExamForm({ ...row });
    setExamModal(true);
  };
  const saveExam = async () => {
    const [institute] = await Promise.all([getInstitute()]);
    console.log("exam form",examForm);
    const examSchedule = {
      institute:institute,
      date: examForm.exam_date,
      exam_schedule_data: [
        {
          start_time: examForm.start_time,
          end_time: examForm.end_time,
          subject: examForm.subject,
          room_number: examForm.room_number,
          type: examForm.type,
          classes: examForm.classes,
        }
      ]
    }
    createExamSchedule(examSchedule)
    .then((res) => {
      if([200,201].includes(res.status)){
        getExamScheduleData();
      }
      // console.log("res",res.body);
    })
    .catch((err) => {
      console.log("err",err);
    });

    // if (examEdit) {
    //   setExamRows((prev) => prev.map((r) => (r.id === examEdit.id ? { ...examForm, id: examEdit.id } : r)));
    // } else {
    //   setExamRows((prev) => [...prev, { ...examForm, id: nextExamId() }]);
    // }
    // setExamModal(false);
  };
  const deleteExam = (id) => setExamRows((prev) => prev.filter((r) => r.id !== id));

  /* ── group daily by day for display ── */
  // const grouped = {};
  // days.forEach((d) => (grouped[d] = []));
  // dailyRows.forEach((r) => { if (grouped[r.day]) grouped[r.day].push(r); });

  function getAllData(){
    getProfessors().then((res) => {
      setProfessorList(res.data[0].professors)
      console.log("professorsschedule",res.data[0].professors);
    })
    getSyllabus().then((res) => {
      setSyllabusList(res.body[0].courses)
      console.log("syllabusschedule",res.body[0].courses);
    })
    getStudents().then((res) => {
      // setStudentList(res.body)
      console.log("studentsschedule",res.body);
    })
  }


  useEffect(()=>{
    getWeeklyScheduleData();
    getExamScheduleData();
    getAllData();
  },[])
  /* ──────────── render ──────────── */
  return (
    <Box>
      <PanelHeader
        title="Schedule Management"
        subtitle="Create and manage daily & exam schedules for students and professors"
        gradient={g.primary}
      />

      {/* Tabs */}
      <Paper sx={{ borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 24px rgba(102,126,234,.08)', mb: 3 }}>
        <Tabs
          value={tabIdx}
          onChange={(_, v) => setTabIdx(v)}
          sx={{
            background: '#fff',
            '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontSize: '0.95rem', py: 2 },
            '& .Mui-selected': { color: '#667eea' },
            '& .MuiTabs-indicator': { background: g.primary, height: 3, borderRadius: '3px 3px 0 0' },
          }}
        >
          <Tab icon={<CalendarIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="Daily Schedule" />
          <Tab icon={<ExamIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="Exam Schedule" />
        </Tabs>
      </Paper>

      {/* ════════════ DAILY TAB ════════════ */}
      {tabIdx === 0 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={openDailyAdd}
              sx={{
                borderRadius: '12px',
                background: g.primary,
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
                py: 1.2,
                boxShadow: '0 4px 15px rgba(102,126,234,.35)',
                '&:hover': { boxShadow: '0 6px 20px rgba(102,126,234,.5)', transform: 'translateY(-2px)' },
                transition: 'all .3s ease',
              }}
            >
              Add Class
            </Button>
          </Box>

          {/* Day-wise panels */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {scheduleList.map((day, dayIdx) => {
              // const dayClasses = scheduleList.filter(data => data.day === day.day);
              // console.log("day",day)
              // if (dayClasses.length === 0) return null;
              
              return (
                <Paper
                  key={day.day}
                  sx={{
                    borderRadius: '18px',
                    overflow: 'hidden',
                    boxShadow: '0 4px 24px rgba(102,126,234,.06)',
                    animation: `fadeInUp .4s ease ${dayIdx * 0.05}s both`,
                    transition: 'box-shadow .3s',
                    '&:hover': { boxShadow: '0 8px 36px rgba(102,126,234,.14)' },
                    '@keyframes fadeInUp': {
                      from: { opacity: 0, transform: 'translateY(20px)' },
                      to: { opacity: 1, transform: 'translateY(0)' }
                    }
                  }}
                >
                  <Box sx={{ background: dayGradients[day.day] || g.primary, px: 3, py: 1.6, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                      <CalendarIcon sx={{ color: '#fff', fontSize: 22 }} />
                      <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '1.05rem', letterSpacing: '.3px' }}>{day.day}</Typography>
                    </Box>
                    <Chip
                      label={`${day.weekly_schedule_data.length} class${day.weekly_schedule_data.length !== 1 ? 'es' : ''}`}
                      size="small"
                      sx={{ background: 'rgba(255,255,255,.22)', color: '#fff', fontWeight: 600, fontSize: '0.75rem', backdropFilter: 'blur(4px)' }}
                    />
                  </Box>

                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ background: 'rgba(102,126,234,.05)' }}>
                          <TableCell sx={{ ...headerCellSx, color: '#667eea' }} align="center">Time</TableCell>
                          <TableCell sx={{ ...headerCellSx, color: '#667eea' }} align="center">Subject</TableCell>
                          <TableCell sx={{ ...headerCellSx, color: '#667eea' }} align="center">Room</TableCell>
                          <TableCell sx={{ ...headerCellSx, color: '#667eea' }} align="center">Professor</TableCell>
                          <TableCell sx={{ ...headerCellSx, color: '#667eea' }} align="center">Class</TableCell>
                          <TableCell sx={{ ...headerCellSx, color: '#667eea', textAlign: 'center' }} align="center">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {day.weekly_schedule_data.map((data) => (
                          <TableRow key={data.id} sx={{ '&:hover': { background: 'rgba(102,126,234,.03)' }, transition: 'background .2s' }}>
                            <TableCell sx={bodyCellSx} align="center">
                              <Chip
                               label={`${fmtTime(data.start_time)} – ${fmtTime(data.end_time)}`}
                               size="small"
                                sx={{ background: 'rgba(102,126,234,.08)', color: '#667eea', fontWeight: 600, fontSize: '0.78rem' }} />
                            </TableCell>
                            <TableCell sx={{ ...bodyCellSx, fontWeight: 600 }} align="center">{data.subject}</TableCell>
                            <TableCell sx={bodyCellSx} align="center">
                              <Chip label={data.room_number} size="small" sx={{ background: 'rgba(79,172,254,.1)', color: '#4facfe', fontWeight: 600, fontSize: '0.78rem' }} />
                            </TableCell>
                            <TableCell sx={bodyCellSx} align="center">{data.professor}</TableCell>
                            <TableCell sx={bodyCellSx} align="center">
                              <Chip label={data.classes} size="small" sx={{ background: 'rgba(245,87,108,.08)', color: '#f5576c', fontWeight: 600, fontSize: '0.78rem' }} />
                            </TableCell>
                            <TableCell sx={{ ...bodyCellSx, textAlign: 'center' }} align="center">
                              <Tooltip title="Edit"><IconButton size="small" onClick={() => openDailyEdit(data)} sx={{ color: '#667eea', mr: 0.5 }}><EditIcon fontSize="small" /></IconButton></Tooltip>
                              <Tooltip title="Delete"><IconButton size="small" onClick={() => deleteDaily(data.id)} sx={{ color: '#f5576c' }}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              );
            })}
          </Box>
        </Box>
      )}

      {/* ════════════ EXAM TAB ════════════ */}
      {tabIdx === 1 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={openExamAdd}
              sx={{
                borderRadius: '12px',
                background: g.warm,
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
                py: 1.2,
                boxShadow: '0 4px 15px rgba(245,87,108,.35)',
                '&:hover': { boxShadow: '0 6px 20px rgba(245,87,108,.5)', transform: 'translateY(-2px)' },
                transition: 'all .3s ease',
              }}
            >
              Add Exam
            </Button>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {examScheduleList.map(data => {
              // const dayExams = examScheduleList.filter(e => e.exam_date === dateStr);
              // if (dayExams.length === 0) return null;
              
              // const formattedDate = new Date(dateStr + 'T00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
              
              return (
                <Paper
                  key={data.id}
                  sx={{
                    borderRadius: '18px',
                    overflow: 'hidden',
                    boxShadow: '0 4px 24px rgba(102,126,234,.06)',
                    animation: `fadeInUp .4s ease ${data.date * 0.05}s both`,
                    transition: 'box-shadow .3s',
                    '&:hover': { boxShadow: '0 8px 36px rgba(102,126,234,.14)' },
                    '@keyframes fadeInUp': {
                      from: { opacity: 0, transform: 'translateY(20px)' },
                      to: { opacity: 1, transform: 'translateY(0)' }
                    }
                  }}
                >
                  <Box sx={{ background: g.warm, px: 3, py: 1.6, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                      <ExamIcon sx={{ color: '#fff', fontSize: 22 }} />
                      <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '1.05rem', letterSpacing: '.3px' }}>{data.date}</Typography>
                    </Box>
                    <Chip
                      label={`${data.exam_schedule_data.length} exam${data.exam_schedule_data.length !== 1 ? 's' : ''}`}
                      size="small"
                      sx={{ background: 'rgba(255,255,255,.22)', color: '#fff', fontWeight: 600, fontSize: '0.75rem', backdropFilter: 'blur(4px)' }}
                    />
                  </Box>

                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ background: 'rgba(245,87,108,.05)' }}>
                          <TableCell sx={{ ...headerCellSx, color: '#f5576c' }} align='center'>Time</TableCell>
                          <TableCell sx={{ ...headerCellSx, color: '#f5576c' }} align='center'>Subject</TableCell>
                          <TableCell sx={{ ...headerCellSx, color: '#f5576c' }} align='center'>Room</TableCell>
                          <TableCell sx={{ ...headerCellSx, color: '#f5576c' }} align='center'>Type</TableCell>
                          <TableCell sx={{ ...headerCellSx, color: '#f5576c' }} align='center'>Class</TableCell>
                          <TableCell sx={{ ...headerCellSx, color: '#f5576c', textAlign: 'center' }}>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {data.exam_schedule_data.map((row) => (
                          <TableRow key={row.id} sx={{ '&:hover': { background: 'rgba(245,87,108,.03)' }, transition: 'background .2s' }}>
                            <TableCell align='center' sx={bodyCellSx}>
                              <Chip label={`${fmtTime(row.start_time)} – ${fmtTime(row.end_time)}`} size="small"
                                sx={{ background: 'rgba(245,87,108,.08)', color: '#f5576c', fontWeight: 600, fontSize: '0.78rem' }} />
                            </TableCell>
                            <TableCell align='center' sx={{ ...bodyCellSx, fontWeight: 600 }}>{row.subject}</TableCell>
                            <TableCell align='center' sx={bodyCellSx}>
                              <Chip label={row.room_number} size="small" sx={{ background: 'rgba(79,172,254,.1)', color: '#4facfe', fontWeight: 600, fontSize: '0.78rem' }} />
                            </TableCell>
                            <TableCell align='center' sx={bodyCellSx}>
                              <Chip label={row.type} size="small" sx={{
                                background: row.type === 'Mid-Term' ? 'rgba(102,126,234,.08)' : row.type === 'End-Term' ? 'rgba(245,87,108,.08)' : 'rgba(67,233,123,.08)',
                                color: row.type === 'Mid-Term' ? '#667eea' : row.type === 'End-Term' ? '#f5576c' : '#38b000',
                                fontWeight: 600, fontSize: '0.78rem',
                              }} />
                            </TableCell>
                            <TableCell align='center' sx={bodyCellSx}>
                              <Chip label={row.classes} size="small" sx={{ background: 'rgba(161,140,209,.1)', color: '#764ba2', fontWeight: 600, fontSize: '0.78rem' }} />
                            </TableCell>
                            <TableCell align='center' sx={{ ...bodyCellSx, textAlign: 'center' }}>
                              <Tooltip title="Edit"><IconButton size="small" onClick={() => openExamEdit(row)} sx={{ color: '#667eea', mr: 0.5 }}><EditIcon fontSize="small" /></IconButton></Tooltip>
                              <Tooltip title="Delete"><IconButton size="small" onClick={() => deleteExam(row.id)} sx={{ color: '#f5576c' }}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              );
            })}
          </Box>
        </Box>
      )}

      {/* ════════════ DAILY MODAL ════════════ */}
      <Dialog
        open={dailyModal}
        onClose={() => setDailyModal(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: '20px', overflow: 'hidden' } }}
      >
        <DialogTitle sx={{ background: g.primary, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 3, py: 2 }}>
          <Typography sx={{ fontWeight: 700, fontSize: '1.15rem' }}>{dailyEdit ? 'Edit Class' : 'Add New Class'}</Typography>
          <IconButton onClick={() => setDailyModal(false)} sx={{ color: '#fff' }}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 3, px: 3, display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
          <FormControl fullWidth sx={inputSx}>
            <InputLabel>Day</InputLabel>
            <Select value={dailyForm.day} label="Day" onChange={(e) => setDailyForm({ ...dailyForm, day: e.target.value })}>
              {days.map((d) => <MenuItem key={d} value={d}>{d}</MenuItem>)}
            </Select>
          </FormControl>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <TimePicker
                label="Start Time"
                viewRenderers={{ hours: renderTimeViewClock, minutes: renderTimeViewClock, seconds: renderTimeViewClock }}
                value={dailyForm.start_time ? dayjs(`2026-01-01T${dailyForm.start_time}`) : null}
                onChange={(val) => setDailyForm({ ...dailyForm, start_time: val ? val.format('HH:mm') : '' })}
                slotProps={{ textField: { fullWidth: true, sx: inputSx, size: 'small' } }}
              />
              <TimePicker
                label="End Time"
                viewRenderers={{ hours: renderTimeViewClock, minutes: renderTimeViewClock, seconds: renderTimeViewClock }}
                value={dailyForm.end_time ? dayjs(`2026-01-01T${dailyForm.end_time}`) : null}
                onChange={(val) => setDailyForm({ ...dailyForm, end_time: val ? val.format('HH:mm') : '' })}
                slotProps={{ textField: { fullWidth: true, sx: inputSx, size: 'small' } }}
              />
            </LocalizationProvider>
          </Box>
          <FormControl fullWidth sx={inputSx}>
            <InputLabel>Subject</InputLabel>
            <Select value={dailyForm.subject} label="Subject" onChange={(e) => setDailyForm({ ...dailyForm, subject: e.target.value })}>
              {syllabusList.map((s) => s.subjects.map((sub) => <MenuItem key={sub.id} value={sub.name}>{sub.name}</MenuItem>))}
            </Select>
          </FormControl>
          <FormControl fullWidth sx={inputSx}>
            <InputLabel>Room</InputLabel>
            <Select value={dailyForm.room_number} label="Room" onChange={(e) => setDailyForm({ ...dailyForm, room_number: e.target.value })}>
              {rooms.map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl fullWidth sx={inputSx}>
            <InputLabel>Professor</InputLabel>
            <Select value={dailyForm.professor} label="Professor" onChange={(e) => setDailyForm({ ...dailyForm, professor: e.target.value })}>
              {professorList.map((p) => <MenuItem key={p.id} value={p.name}>{p.name}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl fullWidth sx={inputSx}>
            <InputLabel>Class</InputLabel>
            <Select value={dailyForm.classes} label="Class" onChange={(e) => setDailyForm({ ...dailyForm, classes: e.target.value })}>
              {classes.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setDailyModal(false)} sx={{ borderRadius: '10px', textTransform: 'none', color: '#666' }}>Cancel</Button>
          <Button variant="contained" onClick={saveDaily}
            sx={{ borderRadius: '10px', background: g.primary, textTransform: 'none', fontWeight: 600, px: 4, '&:hover': { boxShadow: '0 4px 15px rgba(102,126,234,.4)' } }}>
            {dailyEdit ? 'Update' : 'Add Class'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ════════════ EXAM MODAL ════════════ */}
      <Dialog
        open={examModal}
        onClose={() => setExamModal(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: '20px', overflow: 'hidden' } }}
      >
        <DialogTitle sx={{ background: g.warm, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 3, py: 2 }}>
          <Typography sx={{ fontWeight: 700, fontSize: '1.15rem' }}>{examEdit ? 'Edit Exam' : 'Add New Exam'}</Typography>
          <IconButton onClick={() => setExamModal(false)} sx={{ color: '#fff' }}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 3, px: 3, display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
          <TextField label="Date" type="date" fullWidth value={examForm.exam_date} onChange={(e) => setExamForm({ ...examForm, exam_date: e.target.value })}
            InputLabelProps={{ shrink: true }} sx={inputSx} />
          <FormControl fullWidth sx={inputSx}>
            <InputLabel>Subject</InputLabel>
            <Select value={examForm.subject} label="Subject" onChange={(e) => setExamForm({ ...examForm, subject: e.target.value })}>
              {/* {subjects.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)} */}
              {syllabusList.map((s) => s.subjects.map((sub) => <MenuItem key={sub.id} value={sub.name}>{sub.name}</MenuItem>))}
            </Select>
          </FormControl>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <TimePicker
                label="Start Time"
                viewRenderers={{ hours: renderTimeViewClock, minutes: renderTimeViewClock, seconds: renderTimeViewClock }}
                value={examForm.start_time ? dayjs(`2026-01-01T${examForm.start_time}`) : null}
                onChange={(val) => setExamForm({ ...examForm, start_time: val ? val.format('HH:mm') : '' })}
                slotProps={{ textField: { fullWidth: true, sx: inputSx, size: 'small' } }}
              />
              <TimePicker
                label="End Time"
                viewRenderers={{ hours: renderTimeViewClock, minutes: renderTimeViewClock, seconds: renderTimeViewClock }}
                value={examForm.end_time ? dayjs(`2026-01-01T${examForm.end_time}`) : null}
                onChange={(val) => setExamForm({ ...examForm, end_time: val ? val.format('HH:mm') : '' })}
                slotProps={{ textField: { fullWidth: true, sx: inputSx, size: 'small' } }}
              />
            </LocalizationProvider>
          </Box>
          <FormControl fullWidth sx={inputSx}>
            <InputLabel>Room</InputLabel>
            <Select value={examForm.room_number} label="Room" onChange={(e) => setExamForm({ ...examForm, room_number: e.target.value })}>
              {rooms.map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl fullWidth sx={inputSx}>
            <InputLabel>Type</InputLabel>
            <Select value={examForm.type} label="Type" onChange={(e) => setExamForm({ ...examForm, type: e.target.value })}>
              {examTypes.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl fullWidth sx={inputSx}>
            <InputLabel>Class</InputLabel>
            <Select value={examForm.classes} label="Class" onChange={(e) => setExamForm({ ...examForm, classes: e.target.value })}>
              {classes.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setExamModal(false)} sx={{ borderRadius: '10px', textTransform: 'none', color: '#666' }}>Cancel</Button>
          <Button variant="contained" onClick={saveExam}
            sx={{ borderRadius: '10px', background: g.warm, textTransform: 'none', fontWeight: 600, px: 4, '&:hover': { boxShadow: '0 4px 15px rgba(245,87,108,.4)' } }}>
            {examEdit ? 'Update' : 'Add Exam'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SchedulePanel;
