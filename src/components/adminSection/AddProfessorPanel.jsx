import { useState } from 'react';
import {
  Box, Typography, Paper, TextField, Button, Tabs, Tab, Chip, Divider,
  FormControl, InputLabel, Select, MenuItem, Grid, IconButton,
} from '@mui/material';
import {
  Person as PersonIcon,
  ContactPhone as ContactIcon,
  School as AcademicIcon,
  MenuBook as CourseIcon,
  Description as DocIcon,
  Category as OtherIcon,
  AdminPanelSettings as AdminIcon,
  Work as WorkIcon,
  AccountBalance as FeeIcon,
  Storage as SystemIcon,
  VerifiedUser as VerifyIcon,
  Visibility as ReviewIcon,
  CloudUpload as UploadIcon,
  CheckCircle as SuccessIcon,
  Cancel as ErrorIcon,
  Psychology as ProfessorIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  LocationOn as LocationIcon,
  Badge as BadgeIcon,
  CalendarMonth as CalendarIcon,
  Science as ResearchIcon,
  ArrowForward as NextIcon,
  ArrowBack as BackIcon,
  AutoAwesome as SparkleIcon,
} from '@mui/icons-material';

import { addProfessor } from '../apis/professors_api';
import { getInstitute } from '../../utils/storage';
/* ───── Gradients ───── */
const g = {
  primary: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  warm: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  accent: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  green: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  purple: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
  orange: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
  dark: 'linear-gradient(135deg, #1a0a1e 0%, #2d1135 100%)',
};

/* ───── Global input styles ───── */
const inputSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '14px',
    background: 'rgba(248,249,252,.8)',
    backdropFilter: 'blur(8px)',
    transition: 'all .35s cubic-bezier(.4,0,.2,1)',
    fontSize: '0.92rem',
    '&:hover': {
      background: '#fff',
      boxShadow: '0 4px 20px rgba(245,87,108,.08)',
      transform: 'translateY(-1px)',
    },
    '&:hover fieldset': { borderColor: '#f5576c' },
    '&.Mui-focused': {
      background: '#fff',
      boxShadow: '0 6px 28px rgba(245,87,108,.15)',
      transform: 'translateY(-1px)',
    },
    '&.Mui-focused fieldset': { borderColor: '#f5576c', borderWidth: '2px' },
  },
  '& .MuiInputLabel-root': { fontWeight: 500, fontSize: '0.88rem' },
  '& .MuiInputLabel-root.Mui-focused': { color: '#f5576c', fontWeight: 600 },
};

/* ───── Select styles ───── */
const selectSx = {
  borderRadius: '14px',
  background: 'rgba(248,249,252,.8)',
  backdropFilter: 'blur(8px)',
  transition: 'all .35s cubic-bezier(.4,0,.2,1)',
  fontSize: '0.92rem',
  '&:hover': {
    background: '#fff',
    boxShadow: '0 4px 20px rgba(245,87,108,.08)',
    transform: 'translateY(-1px)',
  },
  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#f5576c' },
  '&.Mui-focused': {
    background: '#fff',
    boxShadow: '0 6px 28px rgba(245,87,108,.15)',
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#f5576c', borderWidth: '2px' },
};

/* ───── Keyframes ───── */
const fadeInUpKeyframes = `
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}
`;

/* ───── Section heading ───── */
const SectionTitle = ({ icon: Icon, label, gradient, delay = 0 }) => (
  <Box sx={{
    display: 'flex', alignItems: 'center', gap: 1.5, mt: 3.5, mb: 2,
    animation: `fadeInUp .5s ease ${delay}s both`,
  }}>
    <Box sx={{
      width: 40, height: 40, borderRadius: '12px', background: gradient || g.primary,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: '0 4px 14px rgba(0,0,0,.12)',
      transition: 'transform .3s ease',
      '&:hover': { transform: 'scale(1.08) rotate(-3deg)' },
    }}>
      <Icon sx={{ color: '#fff', fontSize: 20 }} />
    </Box>
    <Box>
      <Typography sx={{ fontWeight: 800, fontSize: '1.02rem', color: '#1a1a2e', letterSpacing: '.2px' }}>
        {label}
      </Typography>
      <Box sx={{
        height: 3, width: 40, borderRadius: '2px', background: gradient || g.primary,
        mt: 0.4,
      }} />
    </Box>
  </Box>
);

/* ───── File upload button ───── */
const FileField = ({ label, name, value, onChange }) => (
  <Box sx={{ animation: 'fadeInUp .4s ease both' }}>
    <Typography sx={{ fontSize: '0.82rem', color: '#666', mb: 0.8, fontWeight: 600 }}>{label}</Typography>
    <Button
      variant="outlined"
      component="label"
      fullWidth
      startIcon={<UploadIcon />}
      sx={{
        borderRadius: '14px', borderStyle: 'dashed', borderWidth: '2px',
        borderColor: value ? '#f5576c' : '#d0d5e0',
        color: value ? '#f5576c' : '#888',
        textTransform: 'none', py: 1.6, justifyContent: 'flex-start', fontWeight: 600,
        background: value ? 'rgba(245,87,108,.04)' : 'rgba(248,249,252,.6)',
        transition: 'all .35s cubic-bezier(.4,0,.2,1)',
        '&:hover': {
          borderColor: '#f5576c', background: 'rgba(245,87,108,.06)',
          transform: 'translateY(-2px)', boxShadow: '0 4px 16px rgba(245,87,108,.12)',
        },
      }}
    >
      {value ? value : 'Choose file...'}
      <input type="file" hidden onChange={(e) => onChange(name, e.target.files[0]?.name || '')} />
    </Button>
  </Box>
);

/* ───── Review row ───── */
const ReviewRow = ({ label, value, idx = 0 }) => (
  <Box sx={{
    display: 'flex', py: 1.4, px: 1.5, borderRadius: '10px',
    background: idx % 2 === 0 ? 'rgba(245,87,108,.02)' : 'transparent',
    transition: 'all .2s ease',
    '&:hover': { background: 'rgba(245,87,108,.06)', transform: 'translateX(4px)' },
  }}>
    <Typography sx={{ width: '40%', fontSize: '0.85rem', color: '#888', fontWeight: 500 }}>{label}</Typography>
    <Typography sx={{ flex: 1, fontSize: '0.88rem', color: '#1a1a2e', fontWeight: 600 }}>
      {value || <span style={{ color: '#d0d5e0', fontWeight: 400, fontStyle: 'italic' }}>Not provided</span>}
    </Typography>
  </Box>
);

/* ───── Step progress dots ───── */
const StepProgress = ({ current, total = 3 }) => (
  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
    {Array.from({ length: total }).map((_, i) => (
      <Box key={i} sx={{
        width: i <= current ? 28 : 10, height: 5, borderRadius: '3px',
        background: i <= current ? g.primary : 'rgba(245,87,108,.15)',
        transition: 'all .4s cubic-bezier(.4,0,.2,1)',
      }} />
    ))}
    <Typography sx={{ fontSize: '0.72rem', color: 'rgba(255,255,255,.5)', fontWeight: 600, ml: 0.5 }}>
      {current + 1}/{total}
    </Typography>
  </Box>
);

/* ───── Generate 16-char Employee ID ───── */
const generateEmployeeId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-#@!';
  let id = '';
  for (let i = 0; i < 15; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
};

/* ═══════════════════════════════════════════ */
/*         ADD PROFESSOR PANEL                */
/* ═══════════════════════════════════════════ */
const AddProfessorPanel = () => {
  const [tabIdx, setTabIdx] = useState(0);
  const [submissionStatus, setSubmissionStatus] = useState('idle');

  /* ── Professor / Teaching Part ── */
  const [professor, setProfessor] = useState({
    name: '', father_name: '', mother_name: '',age: '', date_of_birth: '', gender: '',
    profilePhoto: '', phone_number: '', email: '',
    identity_number: '', marital_status: '',
    current_address: '', permanent_address: '', city: '', state: '', country: '',
    designation: '', department: '', teaching_subject: '',teaching_experience: '',
    degree: '',interest: '',
  });

  /* ── Academic qualifications (dynamic rows) ── */
  const emptyQualification = {
    degree: '', specialization: '', institution: '', year_of_passing: '',
    percentage: '', certificate: '',
  };
  const [qualifications, setQualifications] = useState([{ ...emptyQualification }]);

  /* ── Admin Part ── */
  const [admin, setAdmin] = useState({
    personal_id: generateEmployeeId(), employeeId: '',
    date_of_joining: '', employement_type: '', working_hours: '',
    salary: '',
    assigned_course: '', assigned_section: '', assigned_year: '', session: '',
  });

  const handleProfessor = (field) => (e) => setProfessor((p) => ({ ...p, [field]: e.target.value }));
  const handleAdmin = (field) => (e) => setAdmin((p) => ({ ...p, [field]: e.target.value }));
  const handleFile = (field, val) => setProfessor((p) => ({ ...p, [field]: val }));

  // const institute = localStorage.getItem('institute');

  /* ── Qualification row helpers ── */
  const handleQualChange = (idx, field) => (e) => {
    setQualifications((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: e.target.value };
      return updated;
    });
  };
  const handleQualFile = (idx, field, val) => {
    setQualifications((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: val };
      return updated;
    });
  };
  const addQualification = () => setQualifications((prev) => [...prev, { ...emptyQualification }]);
  const removeQualification = (idx) => setQualifications((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = async () => {
    const [institute] = await Promise.all([getInstitute()]);
    
    const payload = {
      institute:institute,
      name:professor.name,
      father_name:professor.father_name,
      mother_name:professor.mother_name,
      date_of_birth:professor.date_of_birth,
      gender:professor.gender,
      phone_number:professor.phone_number,
      email:professor.email,
      indentity_number:professor.identity_number,
      marital_status:professor.marital_status,
      age:professor.age,
      address:{
        current_address:professor.current_address,
        permanent_address:professor.permanent_address,
        city:professor.city,
        state:professor.state,
        country:professor.country,
        },
      qualification: qualifications.map((q) => ({
          degree: q.degree,
          specialization: q.specialization,
          institution: q.institution,
          year_of_passing: q.year_of_passing,
          percentage: q.percentage,
        })),
      experience:{
        designation:professor.designation,
        department:professor.department,
        teaching_subject:professor.teaching_subject,
        teaching_experience:professor.teaching_experience,
        interest:professor.interest,
        },
      admin_employement:{
        personal_id:admin.personal_id,
        employee_id:admin.employeeId,
        date_of_joining:admin.date_of_joining,
        employement_type:admin.employement_type,
        working_hours:admin.working_hours,
        salary:admin.salary,
        },
      class_assigned:{
        assigned_course:admin.assigned_course,
        assigned_section:admin.assigned_section,
        assigned_year:admin.assigned_year,
        session:admin.session,
            },
    };
    addProfessor(payload).then(data=>{
      console.log("data",data)
    });
    console.log('Professor Payload:', payload);
    setSubmissionStatus('success');
    setTimeout(() => setSubmissionStatus('idle'), 10000);
  };

  /* ── Build review sections ── */
  const reviewSections = [
    { title: 'Personal Information', icon: PersonIcon, gradient: g.primary, rows: [
      ['Full Name', professor.name], ['Father Name', professor.father_name], ['Mother Name', professor.mother_name],
      ['Age', professor.age], ['Date of Birth', professor.date_of_birth], ['Gender', professor.gender],
      ['Mobile Number', professor.phone_number], ['Personal Email', professor.email],
      ['Aadhaar / National ID', professor.identity_number],
      ['Marital Status', professor.marital_status],
    ]},
    { title: 'Address Details', icon: LocationIcon, gradient: g.accent, rows: [
      ['Current Address', professor.current_address], ['Permanent Address', professor.permanent_address],
      ['City', professor.city], ['State', professor.state], ['Country', professor.country],
    ]},
    ...qualifications.map((q, i) => ({
      title: `Qualification ${i + 1}`, icon: AcademicIcon, gradient: g.green, rows: [
        ['Degree', q.degree], ['Specialization', q.specialization],
        ['University / College', q.institution], ['Year of Passing', q.year_of_passing],
        ['Percentage / CGPA', q.percentage], ['Certificate', q.certificate],
      ],
    })),
    { title: 'Professional / Teaching Details', icon: WorkIcon, gradient: g.warm, rows: [
      ['Designation', professor.designation], ['Department', professor.department],
      ['Subjects Teaching', professor.teaching_subject],
      ['Total Teaching Experience', professor.teaching_experience],
      ['Research Area / Interests', professor.interest],
    ]},
    { title: 'Employment Details', icon: BadgeIcon, gradient: g.primary, rows: [
      ['Personal ID', admin.personal_id], ['Employee ID', admin.employeeId], ['Date of Joining', admin.date_of_joining],
      ['Employment Type', admin.employement_type], ['Working Hours / Shift', admin.working_hours],
      ['Salary / Pay Scale', admin.salary],
    ]},
    { title: 'Class / Course Assignment', icon: CourseIcon, gradient: g.purple, rows: [
      ['Courses Assigned', admin.assigned_course], ['Classes / Sections', admin.assigned_section],
      ['Semester / Year', admin.assigned_year], ['Academic Session', admin.session],
    ]},
  ];

  return (
    <Box>
      {/* Inject animations */}
      <style>{fadeInUpKeyframes}</style>

      <Paper sx={{
        borderRadius: '28px', overflow: 'hidden',
        boxShadow: '0 24px 80px rgba(245,87,108,.1), 0 0 0 1px rgba(245,87,108,.06)',
        border: '1px solid rgba(245,87,108,.06)',
      }}>
        {/* ── Header ── */}
        <Box sx={{
          background: g.dark, p: 3.5, display: 'flex', alignItems: 'center', gap: 2.5,
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Decorative circles */}
          <Box sx={{ position: 'absolute', right: -30, top: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(245,87,108,.08)' }} />
          <Box sx={{ position: 'absolute', right: 60, bottom: -20, width: 80, height: 80, borderRadius: '50%', background: 'rgba(240,147,251,.06)' }} />
          <Box sx={{
            width: 56, height: 56, borderRadius: '16px', background: g.primary,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(245,87,108,.35)',
            animation: 'fadeInUp .5s ease both',
          }}>
            <ProfessorIcon sx={{ color: '#fff', fontSize: 28 }} />
          </Box>
          <Box sx={{ animation: 'fadeInUp .5s ease .1s both', flex: 1 }}>
            <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: '1.35rem', letterSpacing: '-.3px' }}>
              Professor Registration
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,.55)', fontSize: '0.85rem', fontWeight: 500, mt: 0.3 }}>
              Complete all sections to register a new professor
            </Typography>
          </Box>
          <StepProgress current={tabIdx} />
        </Box>

        {/* ── Tabs ── */}
        <Tabs
          value={tabIdx}
          onChange={(_, v) => setTabIdx(v)}
          variant="fullWidth"
          sx={{
            background: '#fffafb',
            borderBottom: '2px solid rgba(245,87,108,.06)',
            '& .MuiTab-root': {
              textTransform: 'none', fontWeight: 600, fontSize: '0.92rem', py: 2.2,
              transition: 'all .3s ease',
              '&:hover': { background: 'rgba(245,87,108,.04)' },
            },
            '& .Mui-selected': { color: '#f5576c', fontWeight: 700 },
            '& .MuiTabs-indicator': {
              background: g.primary, height: 3.5, borderRadius: '3px 3px 0 0',
              boxShadow: '0 -2px 8px rgba(245,87,108,.3)',
            },
          }}
        >
          <Tab icon={<ProfessorIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="Professor Details" />
          <Tab icon={<AdminIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="Admin Details" />
          <Tab icon={<ReviewIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="Review All" />
        </Tabs>

        {/* ══════════ TAB 1 : PROFESSOR DETAILS ══════════ */}
        {tabIdx === 0 && (
          <Box sx={{ p: 4, animation: 'fadeInUp .4s ease both' }}>

            {/* ── Personal Information ── */}
            <SectionTitle icon={PersonIcon} label="Personal Information" gradient={g.primary} delay={0} />
            <Paper elevation={0} sx={{ p: 2.5, borderRadius: '18px', border: '1px solid rgba(245,87,108,.08)', background: 'rgba(245,87,108,.015)', mb: 1 }}>
              <Grid container spacing={2.5}>
                <Grid item size={{xs:12,md:2}}><TextField fullWidth label="Full Name" value={professor.name} onChange={handleProfessor('name')} required placeholder="Enter full name" sx={inputSx} /></Grid>
                <Grid item size={{xs:12,md:2}}><TextField fullWidth label="Father Name" value={professor.father_name} onChange={handleProfessor('father_name')} required sx={inputSx} /></Grid>
                <Grid item size={{xs:12,md:2}}><TextField fullWidth label="Mother Name" value={professor.mother_name} onChange={handleProfessor('mother_name')} required sx={inputSx} /></Grid>
                <Grid item size={{xs:12,md:2}}><TextField fullWidth label="Age" type='number' value={professor.age} onChange={handleProfessor('age')} required sx={inputSx} /></Grid>
                <Grid item size={{xs:12,md:2}}><TextField fullWidth label="Date of Birth" type="date" InputLabelProps={{ shrink: true }} value={professor.date_of_birth} onChange={handleProfessor('date_of_birth')} required sx={inputSx} /></Grid>
                <Grid item size={{xs:12,md:2}}>
                  <FormControl fullWidth>
                    <InputLabel>Gender</InputLabel>
                    <Select value={professor.gender} label="Gender" onChange={handleProfessor('gender')} sx={selectSx}>
                      <MenuItem value="Male">Male</MenuItem>
                      <MenuItem value="Female">Female</MenuItem>
                      <MenuItem value="Other">Other</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item size={{xs:12,md:2}}><TextField fullWidth label="Mobile Number" value={professor.phone_number} onChange={handleProfessor('phone_number')} required placeholder="10-digit mobile" sx={inputSx} /></Grid>
                <Grid item size={{xs:12,md:2}}><TextField fullWidth label="Personal Email" type="email" value={professor.email} onChange={handleProfessor('email')} placeholder="personal@email.com" sx={inputSx} /></Grid>
                <Grid item size={{xs:12,md:2}}><TextField fullWidth label="Aadhaar / National ID" value={professor.identity_number} onChange={handleProfessor('identity_number')} placeholder="Optional" sx={inputSx} /></Grid>
                <Grid item size={{xs:12,md:2}}>
                  <FormControl fullWidth>
                    <InputLabel>Marital Status</InputLabel>
                    <Select value={professor.marital_status} label="Marital Status" onChange={handleProfessor('marital_status')} sx={selectSx}>
                      <MenuItem value="Single">Single</MenuItem>
                      <MenuItem value="Married">Married</MenuItem>
                      <MenuItem value="Divorced">Divorced</MenuItem>
                      <MenuItem value="Widowed">Widowed</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Paper>

            {/* ── Address Details ── */}
            <SectionTitle icon={LocationIcon} label="Address Details" gradient={g.accent} delay={0.05} />
            <Paper elevation={0} sx={{ p: 2.5, borderRadius: '18px', border: '1px solid rgba(79,172,254,.08)', background: 'rgba(79,172,254,.015)', mb: 1 }}>
              <Grid container spacing={2.5}>
                <Grid item size={{xs:12,md:3}}><TextField fullWidth label="Current Address" multiline rows={1} value={professor.current_address} onChange={handleProfessor('current_address')} sx={inputSx} /></Grid>
                <Grid item size={{xs:12,md:3}}><TextField fullWidth label="Permanent Address" multiline rows={1} value={professor.permanent_address} onChange={handleProfessor('permanent_address')} sx={inputSx} /></Grid>
                <Grid item size={{xs:12,md:2}}><TextField fullWidth label="City" value={professor.city} onChange={handleProfessor('city')} sx={inputSx} /></Grid>
                <Grid item size={{xs:12,md:2}}><TextField fullWidth label="State" value={professor.state} onChange={handleProfessor('state')} sx={inputSx} /></Grid>
                <Grid item size={{xs:12,md:2}}><TextField fullWidth label="Country" value={professor.country} onChange={handleProfessor('country')} placeholder="e.g. India" sx={inputSx} /></Grid>
              </Grid>
            </Paper>

            {/* ── Academic Qualifications (Dynamic) ── */}
            <SectionTitle icon={AcademicIcon} label="Academic Qualifications" gradient={g.green} delay={0.1} />
            {qualifications.map((qual, idx) => (
              <Paper key={idx} elevation={0} sx={{
                mb: 2, p: 2.5, borderRadius: '18px',
                border: '1px solid rgba(67,233,123,.12)',
                background: 'rgba(67,233,123,.02)',
                transition: 'all .3s ease',
                animation: `fadeInUp .4s ease ${idx * 0.05}s both`,
                '&:hover': { boxShadow: '0 4px 20px rgba(67,233,123,.1)' },
              }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Chip label={`Qualification ${idx + 1}`} size="small"
                    sx={{ background: g.green, color: '#fff', fontWeight: 700, fontSize: '0.78rem', borderRadius: '8px', px: 0.5 }} />
                  {qualifications.length > 1 && (
                    <IconButton size="small" onClick={() => removeQualification(idx)}
                      sx={{
                        color: '#f5576c', background: 'rgba(245,87,108,.06)', borderRadius: '10px',
                        '&:hover': { background: 'rgba(245,87,108,.15)', transform: 'scale(1.1)' },
                        transition: 'all .3s ease',
                      }}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>
                <Grid container spacing={2.5}>
                  <Grid item size={{xs:12,md:2}}>
                    <FormControl fullWidth>
                      <InputLabel>Degree</InputLabel>
                      <Select value={qual.degree} label="Degree" onChange={handleQualChange(idx, 'degree')} sx={selectSx}>
                        <MenuItem value="BSc">BSc</MenuItem>
                        <MenuItem value="MSc">MSc</MenuItem>
                        <MenuItem value="BTech">BTech</MenuItem>
                        <MenuItem value="MTech">MTech</MenuItem>
                        <MenuItem value="PhD">PhD</MenuItem>
                        <MenuItem value="MBA">MBA</MenuItem>
                        <MenuItem value="MCA">MCA</MenuItem>
                        <MenuItem value="BCA">BCA</MenuItem>
                        <MenuItem value="BEd">BEd</MenuItem>
                        <MenuItem value="MEd">MEd</MenuItem>
                        <MenuItem value="Other">Other</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item size={{xs:12,md:2}}><TextField fullWidth label="Specialization / Subject" value={qual.specialization} onChange={handleQualChange(idx, 'specialization')} placeholder="e.g. Computer Science" sx={inputSx} /></Grid>
                  <Grid item size={{xs:12,md:2}}><TextField fullWidth label="University / College" value={qual.institution} onChange={handleQualChange(idx, 'institution')} placeholder="e.g. IIT Delhi" sx={inputSx} /></Grid>
                  <Grid item size={{xs:12,md:2}}><TextField fullWidth label="Year of Passing" type="number" value={qual.year_of_passing} onChange={handleQualChange(idx, 'year_of_passing')} placeholder="e.g. 2020" sx={inputSx} /></Grid>
                  <Grid item size={{xs:12,md:2}}><TextField fullWidth label="Percentage / CGPA" value={qual.percentage} onChange={handleQualChange(idx, 'percentage')} placeholder="e.g. 85% or 8.5" sx={inputSx} /></Grid>
                </Grid>
              </Paper>
            ))}
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={addQualification}
              sx={{
                borderRadius: '14px', borderColor: '#43e97b', borderWidth: 2, color: '#2d8a56',
                textTransform: 'none', fontWeight: 700, mb: 2, py: 1.2,
                '&:hover': { borderColor: '#38f9d7', background: 'rgba(67,233,123,.05)', transform: 'translateY(-2px)' },
                transition: 'all .3s ease',
              }}
            >
              Add Another Qualification
            </Button>

            {/* ── Professional / Teaching Details ── */}
            <SectionTitle icon={WorkIcon} label="Professional / Teaching Details" gradient={g.warm} delay={0.15} />
            <Paper elevation={0} sx={{ p: 2.5, borderRadius: '18px', border: '1px solid rgba(250,112,154,.08)', background: 'rgba(250,112,154,.015)', mb: 1 }}>
              <Grid container spacing={2.5}>
                <Grid item size={{xs:12,md:2}}>
                  <FormControl fullWidth>
                    <InputLabel>Designation</InputLabel>
                    <Select value={professor.designation} label="Designation" onChange={handleProfessor('designation')} sx={selectSx}>
                      <MenuItem value="Assistant Professor">Assistant Professor</MenuItem>
                      <MenuItem value="Associate Professor">Associate Professor</MenuItem>
                      <MenuItem value="Professor">Professor</MenuItem>
                      <MenuItem value="Visiting Faculty">Visiting Faculty</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item size={{xs:12,md:2}}>
                  <FormControl fullWidth>
                    <InputLabel>Department</InputLabel>
                    <Select value={professor.department} label="Department" onChange={handleProfessor('department')} sx={selectSx}>
                      <MenuItem value="Computer Science">Computer Science</MenuItem>
                      <MenuItem value="Information Technology">Information Technology</MenuItem>
                      <MenuItem value="Electronics">Electronics</MenuItem>
                      <MenuItem value="Mechanical">Mechanical</MenuItem>
                      <MenuItem value="Civil">Civil</MenuItem>
                      <MenuItem value="Mathematics">Mathematics</MenuItem>
                      <MenuItem value="Physics">Physics</MenuItem>
                      <MenuItem value="Chemistry">Chemistry</MenuItem>
                      <MenuItem value="English">English</MenuItem>
                      <MenuItem value="Management">Management</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item size={{xs:12,md:2}}><TextField fullWidth label="Subjects Teaching" value={professor.teaching_subject} onChange={handleProfessor('teaching_subject')} placeholder="e.g. DSA, DBMS, OS" sx={inputSx} /></Grid>
                <Grid item size={{xs:12,md:2}}><TextField fullWidth label="Total Teaching Experience" value={professor.teaching_experience} onChange={handleProfessor('teaching_experience')} placeholder="e.g. 5 years 3 months" sx={inputSx} /></Grid>
                <Grid item size={{xs:12,md:3}}><TextField fullWidth label="Interests" multiline rows={1} value={professor.interest} onChange={handleProfessor('interest')} placeholder="e.g. Machine Learning, AI" sx={inputSx} /></Grid>
              </Grid>
            </Paper>

            {/* Next button */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4, animation: 'fadeInUp .5s ease .2s both' }}>
              <Button variant="contained" onClick={() => setTabIdx(1)} endIcon={<NextIcon />}
                sx={{
                  borderRadius: '14px', background: g.primary, textTransform: 'none', fontWeight: 700,
                  px: 5, py: 1.5, fontSize: '0.95rem',
                  boxShadow: '0 8px 24px rgba(245,87,108,.35)',
                  '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 12px 32px rgba(245,87,108,.5)' },
                  transition: 'all .35s cubic-bezier(.4,0,.2,1)',
                }}>
                Next — Admin Details
              </Button>
            </Box>
          </Box>
        )}

        {/* ══════════ TAB 2 : ADMIN DETAILS ══════════ */}
        {tabIdx === 1 && (
          <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 0, animation: 'fadeInUp .4s ease both' }}>

            {/* ── Employment Details ── */}
            <SectionTitle icon={BadgeIcon} label="Employment Details" gradient={g.primary} delay={0} />
            <Paper elevation={0} sx={{ p: 2.5, borderRadius: '18px', border: '1px solid rgba(245,87,108,.08)', background: 'rgba(245,87,108,.015)', mb: 1 }}>
              <Grid container spacing={2.5}>
                <Grid item size={{xs:12,md:3}}>
                  <TextField fullWidth label="Personal ID (16-char)" value={admin.personal_id} onChange={handleAdmin('personal_id')} placeholder="Auto-generated"
                    sx={inputSx}
                    InputProps={{
                      endAdornment: (
                        <Button size="small" onClick={() => setAdmin((p) => ({ ...p, personal_id: generateEmployeeId() }))}
                          sx={{ textTransform: 'none', color: '#f5576c', fontWeight: 700, fontSize: '0.75rem', minWidth: 'auto', borderRadius: '8px', '&:hover': { background: 'rgba(245,87,108,.08)' } }}>
                          Regenerate
                        </Button>
                      ),
                    }}
                  />
                </Grid>
                <Grid item size={{xs:12,md:2}}><TextField fullWidth label="Employee ID" value={admin.employeeId} onChange={handleAdmin('employeeId')} required sx={inputSx} /></Grid>
                <Grid item size={{xs:12,md:2}}><TextField fullWidth label="Date of Joining" type="date" InputLabelProps={{ shrink: true }} value={admin.date_of_joining} onChange={handleAdmin('date_of_joining')} sx={inputSx} /></Grid>
                <Grid item size={{xs:12,md:2}}>
                  <FormControl fullWidth>
                    <InputLabel>Employment Type</InputLabel>
                    <Select value={admin.employement_type} label="Employment Type" onChange={handleAdmin('employement_type')} sx={selectSx}>
                      <MenuItem value="Permanent">Permanent</MenuItem>
                      <MenuItem value="Contract">Contract</MenuItem>
                      <MenuItem value="Guest Faculty">Guest Faculty</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item size={{xs:12,md:2}}><TextField fullWidth label="Working Hours / Shift" value={admin.working_hours} onChange={handleAdmin('working_hours')} placeholder="e.g. 9 AM – 5 PM" sx={inputSx} /></Grid>
                <Grid item size={{xs:12,md:2}}>
                  <TextField fullWidth label="Salary / Pay Scale (₹)" value={admin.salary} onChange={handleAdmin('salary')} placeholder="e.g. 75000"
                    sx={inputSx}
                    InputProps={{
                      startAdornment: <Typography sx={{ mr: 1, color: '#f5576c', fontWeight: 700 }}>₹</Typography>,
                    }}
                  />
                </Grid>
              </Grid>
            </Paper>

            {/* ── Class / Course Assignment ── */}
            <SectionTitle icon={CourseIcon} label="Class / Course Assignment" gradient={g.purple} delay={0.05} />
            <Paper elevation={0} sx={{ p: 2.5, borderRadius: '18px', border: '1px solid rgba(161,140,209,.08)', background: 'rgba(161,140,209,.015)', mb: 1 }}>
              <Grid container spacing={2.5}>
                <Grid item size={{xs:12,md:3}}><TextField fullWidth label="Courses Assigned" value={admin.assigned_course} onChange={handleAdmin('assigned_course')} placeholder="e.g. B.Tech CS, MCA" sx={inputSx} /></Grid>
                <Grid item size={{xs:12,md:2}}><TextField fullWidth label="Classes / Sections" value={admin.assigned_section} onChange={handleAdmin('assigned_section')} placeholder="e.g. CS-A, CS-B" sx={inputSx} /></Grid>
                <Grid item size={{xs:12,md:2}}><TextField fullWidth label="Semester / Year" value={admin.assigned_year} onChange={handleAdmin('assigned_year')} placeholder="e.g. Sem 3 / 2nd Year" sx={inputSx} /></Grid>
                <Grid item size={{xs:12,md:2}}><TextField fullWidth label="Academic Session" value={admin.session} onChange={handleAdmin('session')} placeholder="e.g. 2026-2027" sx={inputSx} /></Grid>
              </Grid>
            </Paper>

            {/* Navigation buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4, animation: 'fadeInUp .5s ease .15s both' }}>
              <Button variant="outlined" onClick={() => setTabIdx(0)} startIcon={<BackIcon />}
                sx={{
                  borderRadius: '14px', borderColor: '#f5576c', borderWidth: 2, color: '#f5576c',
                  textTransform: 'none', fontWeight: 700, px: 4, py: 1.4,
                  '&:hover': { borderColor: '#f093fb', color: '#f093fb', background: 'rgba(245,87,108,.04)', transform: 'translateX(-3px)' },
                  transition: 'all .35s cubic-bezier(.4,0,.2,1)',
                }}>
                Back to Professor Details
              </Button>
              <Button variant="contained" onClick={() => setTabIdx(2)} endIcon={<NextIcon />}
                sx={{
                  borderRadius: '14px', background: g.primary, textTransform: 'none', fontWeight: 700,
                  px: 5, py: 1.5, fontSize: '0.95rem',
                  boxShadow: '0 8px 24px rgba(245,87,108,.35)',
                  '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 12px 32px rgba(245,87,108,.5)' },
                  transition: 'all .35s cubic-bezier(.4,0,.2,1)',
                }}>
                Review All
              </Button>
            </Box>
          </Box>
        )}

        {/* ══════════ TAB 3 : REVIEW ALL ══════════ */}
        {tabIdx === 2 && (
          <Box sx={{ p: 4, animation: 'fadeInUp .4s ease both' }}>
            {submissionStatus === 'success' && (
              <Box sx={{
                mb: 3, p: 2.5, borderRadius: '16px',
                background: 'linear-gradient(135deg, rgba(67,233,123,.08), rgba(56,249,215,.06))',
                border: '1.5px solid rgba(67,233,123,.2)',
                display: 'flex', alignItems: 'center', gap: 1.5,
                animation: 'fadeInUp .4s ease both',
              }}>
                <SuccessIcon sx={{ color: '#2ecc71', fontSize: 26 }} />
                <Typography sx={{ color: '#27ae60', fontWeight: 700, fontSize: '0.95rem' }}>Professor registered successfully! 🎉</Typography>
              </Box>
            )}
            {submissionStatus === 'error' && (
              <Box sx={{
                mb: 3, p: 2.5, borderRadius: '16px',
                background: 'rgba(227, 74, 74, 0.06)',
                border: '1.5px solid rgba(227,74,74,.15)',
                display: 'flex', alignItems: 'center', gap: 1.5,
                animation: 'fadeInUp .4s ease both',
              }}>
                <ErrorIcon sx={{ color: '#d83b3bff' }} />
                <Typography sx={{ color: '#d83b3bff', fontWeight: 600, fontSize: '0.95rem' }}>Failed to register professor</Typography>
              </Box>
            )}

            <Typography sx={{
              fontWeight: 800, fontSize: '1.15rem', color: '#1a1a2e', mb: 3,
              display: 'flex', alignItems: 'center', gap: 1,
            }}>
              <ReviewIcon sx={{ fontSize: 22, color: '#f5576c' }} />
              Review All Details Before Submission
            </Typography>

            {reviewSections.map((sec, idx) => (
              <Paper key={idx} sx={{
                mb: 2.5, borderRadius: '18px', overflow: 'hidden',
                boxShadow: '0 2px 16px rgba(245,87,108,.06)',
                border: '1px solid rgba(245,87,108,.06)',
                transition: 'all .3s ease',
                animation: `fadeInUp .4s ease ${idx * 0.04}s both`,
                '&:hover': { boxShadow: '0 6px 24px rgba(245,87,108,.1)', transform: 'translateY(-2px)' },
              }}>
                <Box sx={{
                  background: sec.gradient, px: 2.5, py: 1.6,
                  display: 'flex', alignItems: 'center', gap: 1.2,
                }}>
                  <sec.icon sx={{ color: '#fff', fontSize: 20 }} />
                  <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '0.92rem', letterSpacing: '.2px' }}>{sec.title}</Typography>
                </Box>
                <Box sx={{ px: 2, py: 1 }}>
                  {sec.rows.map(([label, value], i) => (
                    <ReviewRow key={i} label={label} value={value} idx={i} />
                  ))}
                </Box>
              </Paper>
            ))}

            {/* Profile Photo Review */}
            {professor.profilePhoto && (
              <Paper sx={{
                mb: 2.5, borderRadius: '18px', overflow: 'hidden',
                boxShadow: '0 2px 16px rgba(245,87,108,.06)',
                border: '1px solid rgba(245,87,108,.06)',
              }}>
                <Box sx={{ background: g.orange, px: 2.5, py: 1.6, display: 'flex', alignItems: 'center', gap: 1.2 }}>
                  <DocIcon sx={{ color: '#fff', fontSize: 20 }} />
                  <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '0.92rem' }}>Uploaded Documents</Typography>
                </Box>
                <Box sx={{ px: 2, py: 1 }}>
                  <ReviewRow label="Profile Photo" value={professor.profilePhoto} idx={0} />
                </Box>
              </Paper>
            )}

            {/* Navigation + Submit */}
            <Box sx={{
              display: 'flex', justifyContent: 'space-between', mt: 4,
              animation: 'fadeInUp .5s ease .2s both',
            }}>
              <Button variant="outlined" onClick={() => setTabIdx(1)} startIcon={<BackIcon />}
                sx={{
                  borderRadius: '14px', borderColor: '#f5576c', borderWidth: 2, color: '#f5576c',
                  textTransform: 'none', fontWeight: 700, px: 4, py: 1.4,
                  '&:hover': { borderColor: '#f093fb', color: '#f093fb', background: 'rgba(245,87,108,.04)', transform: 'translateX(-3px)' },
                  transition: 'all .35s cubic-bezier(.4,0,.2,1)',
                }}>
                Back to Admin
              </Button>
              <Button variant="contained" size="large" onClick={handleSubmit} startIcon={<SparkleIcon />}
                sx={{
                  borderRadius: '16px', background: g.primary, textTransform: 'none',
                  fontWeight: 800, fontSize: '1.05rem', px: 6, py: 1.6, letterSpacing: '.3px',
                  boxShadow: '0 10px 30px rgba(245,87,108,.4)',
                  transition: 'all .35s cubic-bezier(.4,0,.2,1)',
                  '&:hover': { transform: 'translateY(-3px) scale(1.01)', boxShadow: '0 14px 40px rgba(245,87,108,.5)' },
                }}>
                Register Professor
              </Button>
            </Box>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default AddProfessorPanel;
