import { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, TextField, Button, Tabs, Tab, Chip, Divider,
  FormControl, InputLabel, Select, MenuItem, Grid,
} from '@mui/material';
import {
  Person as PersonIcon,
  ContactPhone as ContactIcon,
  School as AcademicIcon,
  MenuBook as CourseIcon,
  Description as DocIcon,
  Category as OtherIcon,
  AdminPanelSettings as AdminIcon,
  Assignment as AdmissionIcon,
  AccountBalance as FeeIcon,
  Storage as SystemIcon,
  VerifiedUser as VerifyIcon,
  Visibility as ReviewIcon,
  CloudUpload as UploadIcon,
  CheckCircle as SuccessIcon,
  Cancel as ErrorIcon,
  ArrowForward as NextIcon,
  ArrowBack as BackIcon,
  AutoAwesome as SparkleIcon,
} from '@mui/icons-material';
import { addStudent, getStudents } from '../apis/students_api';
import { getSyllabus } from '../apis/syllabus_api';
import { getInstitute } from '../../utils/storage';

/* ───── Gradients ───── */
const g = {
  primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  warm: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  accent: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  green: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  dark: 'linear-gradient(135deg, #0c0c1d 0%, #1a1a2e 100%)',
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
      boxShadow: '0 4px 20px rgba(102,126,234,.1)',
      transform: 'translateY(-1px)',
    },
    '&:hover fieldset': { borderColor: '#667eea' },
    '&.Mui-focused': {
      background: '#fff',
      boxShadow: '0 6px 28px rgba(102,126,234,.18)',
      transform: 'translateY(-1px)',
    },
    '&.Mui-focused fieldset': { borderColor: '#667eea', borderWidth: '2px' },
  },
  '& .MuiInputLabel-root': { fontWeight: 500, fontSize: '0.88rem' },
  '& .MuiInputLabel-root.Mui-focused': { color: '#667eea', fontWeight: 600 },
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
    boxShadow: '0 4px 20px rgba(102,126,234,.1)',
    transform: 'translateY(-1px)',
  },
  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#667eea' },
  '&.Mui-focused': {
    background: '#fff',
    boxShadow: '0 6px 28px rgba(102,126,234,.18)',
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#667eea', borderWidth: '2px' },
};

/* ───── Keyframes ───── */
const fadeInUpKeyframes = `
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.04); }
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
        mt: 0.4, transition: 'width .4s ease',
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
        borderColor: value ? '#667eea' : '#d0d5e0',
        color: value ? '#667eea' : '#888',
        textTransform: 'none', py: 1.6, justifyContent: 'flex-start', fontWeight: 600,
        background: value ? 'rgba(102,126,234,.04)' : 'rgba(248,249,252,.6)',
        transition: 'all .35s cubic-bezier(.4,0,.2,1)',
        '&:hover': {
          borderColor: '#667eea', background: 'rgba(102,126,234,.06)',
          transform: 'translateY(-2px)', boxShadow: '0 4px 16px rgba(102,126,234,.12)',
        },
      }}
    >
      {value || 'Choose file...'}
      <input type="file" hidden onChange={(e) => onChange(name, e.target.files[0]?.name || '')} />
    </Button>
  </Box>
);

/* ───── Review row ───── */
const ReviewRow = ({ label, value, idx = 0 }) => (
  <Box sx={{
    display: 'flex', py: 1.4, px: 1.5, borderRadius: '10px',
    background: idx % 2 === 0 ? 'rgba(102,126,234,.02)' : 'transparent',
    transition: 'all .2s ease',
    '&:hover': { background: 'rgba(102,126,234,.06)', transform: 'translateX(4px)' },
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
        background: i <= current ? g.primary : 'rgba(102,126,234,.15)',
        transition: 'all .4s cubic-bezier(.4,0,.2,1)',
      }} />
    ))}
    <Typography sx={{ fontSize: '0.72rem', color: '#999', fontWeight: 600, ml: 0.5 }}>
      {current + 1}/{total}
    </Typography>
  </Box>
);

/* ═══════════════════════════════════════════ */
/*           ADD STUDENT PANEL                */
/* ═══════════════════════════════════════════ */
const AddStudentPanel = () => {
  const [tabIdx, setTabIdx] = useState(0);
  const [submissionStatus, setSubmissionStatus] = useState('idle');

    const generateStudentId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-#@!';
  let id = '';
  for (let i = 0; i < 15; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
};

// console.log("institute",institute)
  /* ── Student Part ── */
  const [student, setStudent] = useState({
    name: '', age: '', dob: '', gender: '', nationality: '', identity: '',
    father_name: '', mother_name: '', parent_contact: '',
    mobile: '', email: '', permannent_address: '', current_address: '',
    qualification: '', institute_name: '', passing_year: '', marks_obtained: '',
    courseName: '', branch: '', mode: '',
    photo: '', signature: '', markSheets: '', idProof: '', transferCert: '', passportVisa: '',
    category: '',
  });

  /* ── Admin Part ── */
  const [admin, setAdmin] = useState({
    enrollmentNumber: '', rollNumber: '', admissionDate: '', academicYear: '',
    finalCourse: '', yearSemester: '', section: '',
    totalFee: '', paidAmount: '', pendingAmount: '',
    studentId: generateStudentId(), loginEmail: '', loginPassword: '', libraryMap: '', hostelMap: '',
    docVerification: '',
  });

  const handleStudent = (field) => (e) => setStudent((p) => ({ ...p, [field]: e.target.value }));
  const handleAdmin = (field) => (e) => setAdmin((p) => ({ ...p, [field]: e.target.value }));
  const handleFile = (field, val) => setStudent((p) => ({ ...p, [field]: val }));

  // Load courses from API
  const [courses, setCourses] = useState([]);
  useEffect(() => {
    getSyllabus().then(res => {
      if (res.body?.[0]?.courses) setCourses(res.body[0].courses);
    }).catch(() => {});
  }, []);

  const handleSubmit = async () => {
  const [institute] = await Promise.all([getInstitute()]);

    // Restructure flat form data into nested format expected by the backend
    const payload = {
      institute: institute,
      name: student.name,
        age: student.age ? parseInt(student.age) : 0,
        dob: student.dob || null,
        gender: student.gender,
        nationality: student.nationality,
        identity: student.identity,
        category: student.category,
        contact_details: {
          email: student.email,
          parmannent_address: student.permannent_address,
          current_address: student.current_address,
          mobile: student.mobile,
          father_name: student.father_name,
          mother_name: student.mother_name,
          parent_contact: student.parent_contact,
        },
        education_details: {
          qualification: student.qualification,
          passing_year: student.passing_year ? parseInt(student.passing_year) : 0,
          instutute_name: student.institute_name,
          marks_obtained: student.marks_obtained,
        },
        course_details: {
          course_name: student.courseName,
          branch: student.branch,
          session_mode: student.mode,
        },
        admission_details:{
          enrollment_number: admin.enrollmentNumber,
          roll_number: admin.rollNumber,
          admission_date: admin.admissionDate,
          academic_year: admin.academicYear,
          // student_status: admin.studentStatus,
        },
        course_assignment:{
          course_name: admin.finalCourse,
          year: admin.yearSemester,
          batch: admin.section,
        },
        fee_details:{
          total_fee_amount: admin.totalFee,
          paid_amount: admin.paidAmount,
          pending_amount: admin.pendingAmount,
          // other_amount: admin.scholarship
        },
        system_details:{
          student_personal_id: admin.studentId,
          // login_email: admin.loginEmail,
          // login_password: admin.loginPassword,
          library_card_number: admin.libraryMap,
          hostel_details: admin.hostelMap,
          verification_status: admin.docVerification,
          // transport_map: admin.transportMap,
        },
    };

    console.log('Payload:', payload,institute);
    setSubmissionStatus('idle');
    addStudent(payload)
    .then(data=>{
      console.log('Response:', data.status,data.body);
      if([201,200].includes(data.status)){
        setSubmissionStatus('success');
      setTimeout(() => setSubmissionStatus('idle'), 10000); 
      }else{
       setSubmissionStatus('error');
      setTimeout(() => setSubmissionStatus('idle'), 10000); 
      }
      
    })
    // .catch(error=>{
    //   console.log(error);
    //   setSubmissionStatus('error');
    //   setTimeout(() => setSubmissionStatus('idle'), 10000);
    // });
  };



  /* ── Build review sections ── */
  const reviewSections = [
    { title: 'Personal Details', icon: PersonIcon, gradient: g.primary, rows: [
      ['Full Name', student.name],['Age', student.age], ['Date of Birth', student.dob], ['Gender', student.gender],
      ['Nationality', student.nationality], ['Aadhaar / Passport', student.identity],
    ]},
    { title: 'Contact Details', icon: ContactIcon, gradient: 'linear-gradient(135deg,#4facfe,#00f2fe)', rows: [
      ['Father Name', student.father_name], ['Mother Name', student.mother_name],
      ['Parent Contact', student.parent_contact],
      ['Mobile', student.mobile], ['Email', student.email],
      ['Permanent Address', student.permannent_address], ['Current Address', student.current_address],
    ]},
    { title: 'Academic Details', icon: AcademicIcon, gradient: 'linear-gradient(135deg,#43e97b,#38f9d7)', rows: [
      ['Previous Qualification', student.qualification], ['institute_name / University', student.institute_name],
      ['Year of Passing', student.passing_year], ['Marks / Grade', student.marks_obtained],
    ]},
    { title: 'Course Preferences', icon: CourseIcon, gradient: 'linear-gradient(135deg,#fa709a,#fee140)', rows: [
      ['Course Name', student.courseName], ['Branch / Specialization', student.branch],
      ['Mode', student.mode],
    ]},
    { title: 'Documents', icon: DocIcon, gradient: 'linear-gradient(135deg,#a18cd1,#fbc2eb)', rows: [
      ['Photo', student.photo], ['Signature', student.signature],
      ['Mark Sheets', student.markSheets], ['ID Proof', student.idProof],
      ['Transfer / Migration Cert', student.transferCert], ['Passport & Visa', student.passportVisa],
    ]},
    { title: 'Other', icon: OtherIcon, gradient: 'linear-gradient(135deg,#ffecd2,#fcb69f)', rows: [
      ['Category', student.category],
    ]},
    { title: 'Admission Details', icon: AdmissionIcon, gradient: g.primary, rows: [
      ['Enrollment Number', admin.enrollmentNumber], ['Roll Number', admin.rollNumber],
      ['Admission Date', admin.admissionDate], ['Academic Year', admin.academicYear],
    ]},
    { title: 'Course Assignment', icon: CourseIcon, gradient: g.accent, rows: [
      ['Final Course & Branch', admin.finalCourse], ['Year / Semester', admin.yearSemester],
      ['Section / Batch', admin.section],
    ]},
    { title: 'Fee Details', icon: FeeIcon, gradient: 'linear-gradient(135deg,#43e97b,#38f9d7)', rows: [
      ['Total Fee', admin.totalFee], ['Paid Amount', admin.paidAmount],
      ['Pending Amount', admin.pendingAmount],
    ]},
    { title: 'System Data', icon: SystemIcon, gradient: 'linear-gradient(135deg,#fa709a,#fee140)', rows: [
      ['Student ID', admin.studentId], ['Login Email', admin.loginEmail],
      ['Library Mapping', admin.libraryMap], ['Hostel Mapping', admin.hostelMap],
      // ['Transport Mapping', admin.transportMap],
    ]},
    { title: 'Verification', icon: VerifyIcon, gradient: g.warm, rows: [
      ['Document Verification', admin.docVerification],
    ]},
  ];

  return (
    <Box>
      {/* Inject animations */}
      <style>{fadeInUpKeyframes}</style>

      <Paper sx={{
        borderRadius: '28px', overflow: 'hidden',
        boxShadow: '0 24px 80px rgba(102,126,234,.12), 0 0 0 1px rgba(102,126,234,.06)',
        border: '1px solid rgba(102,126,234,.08)',
      }}>
        {/* ── Header ── */}
        <Box sx={{
          background: g.dark, p: 3.5, display: 'flex', alignItems: 'center', gap: 2.5,
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Decorative circles */}
          <Box sx={{ position: 'absolute', right: -30, top: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(102,126,234,.08)' }} />
          <Box sx={{ position: 'absolute', right: 60, bottom: -20, width: 80, height: 80, borderRadius: '50%', background: 'rgba(118,75,162,.06)' }} />
          <Box sx={{
            width: 56, height: 56, borderRadius: '16px', background: g.primary,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(102,126,234,.35)',
            animation: 'fadeInUp .5s ease both',
          }}>
            <PersonIcon sx={{ color: '#fff', fontSize: 28 }} />
          </Box>
          <Box sx={{ animation: 'fadeInUp .5s ease .1s both', flex: 1 }}>
            <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: '1.35rem', letterSpacing: '-.3px' }}>
              Student Registration
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,.55)', fontSize: '0.85rem', fontWeight: 500, mt: 0.3 }}>
              Complete all sections to register a new student
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
            background: '#fafbff',
            borderBottom: '2px solid rgba(102,126,234,.06)',
            '& .MuiTab-root': {
              textTransform: 'none', fontWeight: 600, fontSize: '0.92rem', py: 2.2,
              transition: 'all .3s ease',
              '&:hover': { background: 'rgba(102,126,234,.04)' },
            },
            '& .Mui-selected': { color: '#667eea', fontWeight: 700 },
            '& .MuiTabs-indicator': {
              background: g.primary, height: 3.5, borderRadius: '3px 3px 0 0',
              boxShadow: '0 -2px 8px rgba(102,126,234,.3)',
            },
          }}
        >
          <Tab icon={<PersonIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="Student Details" />
          <Tab icon={<AdminIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="Admin Details" />
          <Tab icon={<ReviewIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="Review All" />
        </Tabs>

        {/* ══════════ TAB 1 : STUDENT DETAILS ══════════ */}
        {tabIdx === 0 && (
          <Box sx={{ p: 4, animation: 'fadeInUp .4s ease both' }}>
            {/* Personal Details */}
            <SectionTitle icon={PersonIcon} label="Personal Details" gradient={g.primary} delay={0} />
            <Paper elevation={0} sx={{ p: 2.5, borderRadius: '18px', border: '1px solid rgba(102,126,234,.08)', background: 'rgba(102,126,234,.015)', mb: 1 }}>
              <Grid container spacing={2.5} direction={'row'}>
                <Grid item size={{xs:1,md:2}}><TextField fullWidth label="Full Name" value={student.name} onChange={handleStudent('name')} required sx={inputSx} /></Grid>
                <Grid item size={{xs:1,md:2}}><TextField fullWidth label="Date of Birth" type="date" InputLabelProps={{ shrink: true }} value={student.dob} onChange={handleStudent('dob')} required sx={inputSx} /></Grid>
                <Grid item size={{xs:1,md:2}}><TextField fullWidth label="Age" value={student.age} onChange={handleStudent('age')} required sx={inputSx} /></Grid>
                <Grid item size={{xs:1,md:2}}>
                  <FormControl fullWidth>
                    <InputLabel>Gender</InputLabel>
                    <Select value={student.gender} label="Gender" onChange={handleStudent('gender')} sx={selectSx}>
                      <MenuItem value="Male">Male</MenuItem>
                      <MenuItem value="Female">Female</MenuItem>
                      <MenuItem value="Other">Other</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item size={{xs:1,md:2}}><TextField fullWidth label="Nationality" value={student.nationality} onChange={handleStudent('nationality')} sx={inputSx} placeholder="e.g. Indian" /></Grid>
                <Grid item size={{xs:1,md:2}}><TextField fullWidth label="Aadhaar / Passport No." value={student.identity} onChange={handleStudent('identity')} sx={inputSx} placeholder="For international: passport number" /></Grid>
              </Grid>
            </Paper>

            {/* Contact Details */}
            <SectionTitle icon={ContactIcon} label="Contact Details" gradient="linear-gradient(135deg,#4facfe,#00f2fe)" delay={0.05} />
            <Paper elevation={0} sx={{ p: 2.5, borderRadius: '18px', border: '1px solid rgba(79,172,254,.08)', background: 'rgba(79,172,254,.015)', mb: 1 }}>
              <Grid container spacing={2.5}>
                <Grid item size={{xs:12,md:2}}><TextField fullWidth label="Father Name" value={student.father_name} onChange={handleStudent('father_name')} required sx={inputSx} /></Grid>
                <Grid item size={{xs:12,md:2}}><TextField fullWidth label="Mother Name" value={student.mother_name} onChange={handleStudent('mother_name')} required sx={inputSx} /></Grid>
                <Grid item size={{xs:12,md:2}}><TextField fullWidth label="Parent Contact" value={student.parent_contact} onChange={handleStudent('parent_contact')} sx={inputSx} placeholder="Parent phone number" /></Grid>
                <Grid item size={{xs:12,md:2}}><TextField fullWidth label="Mobile Number" value={student.mobile} onChange={handleStudent('mobile')} required sx={inputSx} placeholder="10-digit mobile" /></Grid>
                <Grid item size={{xs:12,md:3}}><TextField fullWidth label="Email" type="email" value={student.email} onChange={handleStudent('email')} sx={inputSx} placeholder="student@example.com" /></Grid>
                <Grid item size={{xs:12,md:2}}><TextField fullWidth label="Permanent Address" multiline rows={2} value={student.permannent_address} onChange={handleStudent('permannent_address')} sx={inputSx} /></Grid>
                <Grid item size={{xs:12,md:2}}><TextField fullWidth label="Current Address" multiline rows={2} value={student.current_address} onChange={handleStudent('current_address')} sx={inputSx} /></Grid>
              </Grid>
            </Paper>

            {/* Academic Details */}
            <SectionTitle icon={AcademicIcon} label="Academic Details" gradient="linear-gradient(135deg,#43e97b,#38f9d7)" delay={0.1} />
            <Paper elevation={0} sx={{ p: 2.5, borderRadius: '18px', border: '1px solid rgba(67,233,123,.08)', background: 'rgba(67,233,123,.015)', mb: 1 }}>
              <Grid container spacing={2.5}>
                <Grid item size={{xs:12,md:2}}>
                  <FormControl fullWidth>
                    <InputLabel>Previous Qualification</InputLabel>
                    <Select value={student.qualification} label="Previous Qualification" onChange={handleStudent('qualification')} sx={selectSx}>
                      <MenuItem value="10th">10th</MenuItem>
                      <MenuItem value="12th">12th</MenuItem>
                      <MenuItem value="Diploma">Diploma</MenuItem>
                      <MenuItem value="UG">UG (Under Graduate)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item size={{xs:12,md:2}}><TextField fullWidth label="institute_name / University" value={student.institute_name} onChange={handleStudent('institute_name')} sx={inputSx} placeholder="e.g. CBSE, State institute_name" /></Grid>
                <Grid item size={{xs:12,md:2}}><TextField fullWidth label="Year of Passing" type="number" value={student.passing_year} onChange={handleStudent('passing_year')} sx={inputSx} placeholder="e.g. 2025" /></Grid>
                <Grid item size={{xs:12,md:2}}><TextField fullWidth label="Marks / Grade" value={student.marks_obtained} onChange={handleStudent('marks_obtained')} sx={inputSx} placeholder="e.g. 85% or 8.5 CGPA" /></Grid>
              </Grid>
            </Paper>

            {/* Course Preferences */}
            <SectionTitle icon={CourseIcon} label="Course Preferences" gradient="linear-gradient(135deg,#fa709a,#fee140)" delay={0.15} />
            <Paper elevation={0} sx={{ p: 2.5, borderRadius: '18px', border: '1px solid rgba(250,112,154,.08)', background: 'rgba(250,112,154,.015)', mb: 1 }}>
              <Grid container spacing={2.5}>
                <Grid item size={{xs:12,md:2}}>
                  <FormControl fullWidth>
                    <InputLabel>Course Name</InputLabel>
                    <Select value={student.courseName} label="Course Name" onChange={handleStudent('courseName')} sx={selectSx}>
                      <MenuItem value="B.Tech">B.Tech</MenuItem>
                      <MenuItem value="M.Tech">M.Tech</MenuItem>
                      <MenuItem value="BCA">BCA</MenuItem>
                      <MenuItem value="MCA">MCA</MenuItem>
                      <MenuItem value="B.Sc">B.Sc</MenuItem>
                      <MenuItem value="M.Sc">M.Sc</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item size={{xs:12,md:2}}>
                  <FormControl fullWidth>
                    <InputLabel>Branch / Specialization</InputLabel>
                    <Select value={student.branch} label="Branch / Specialization" onChange={handleStudent('branch')} sx={selectSx}>
                      {courses.length > 0
                        ? courses.map(c => <MenuItem key={c.id ?? c.name} value={c.name}>{c.name}</MenuItem>)
                        : [
                          <MenuItem key="cs" value="Computer Science">Computer Science</MenuItem>,
                          <MenuItem key="it" value="Information Technology">Information Technology</MenuItem>,
                          <MenuItem key="ec" value="Electronics">Electronics</MenuItem>,
                          <MenuItem key="me" value="Mechanical">Mechanical</MenuItem>,
                          <MenuItem key="cv" value="Civil">Civil</MenuItem>,
                        ]
                      }
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item size={{xs:12,md:2}}>
                  <FormControl fullWidth>
                    <InputLabel>Mode</InputLabel>
                    <Select value={student.mode} label="Mode" onChange={handleStudent('mode')} sx={selectSx}>
                      <MenuItem value="Regular">Regular</MenuItem>
                      <MenuItem value="Lateral">Lateral</MenuItem>
                      <MenuItem value="International">International</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Paper>

            {/* Documents Upload */}
            <SectionTitle icon={DocIcon} label="Documents Upload" gradient="linear-gradient(135deg,#a18cd1,#fbc2eb)" delay={0.2} />
            <Paper elevation={0} sx={{ p: 2.5, borderRadius: '18px', border: '1px solid rgba(161,140,209,.08)', background: 'rgba(161,140,209,.015)', mb: 1 }}>
              <Grid container spacing={2.5}>
                <Grid item size={{xs:12,md:2}}><FileField label="Photo" name="photo" value={student.photo} onChange={handleFile} /></Grid>
                <Grid item size={{xs:12,md:2}}><FileField label="Signature" name="signature" value={student.signature} onChange={handleFile} /></Grid>
                <Grid item size={{xs:12,md:2}}><FileField label="Mark Sheets" name="markSheets" value={student.markSheets} onChange={handleFile} /></Grid>
                <Grid item size={{xs:12,md:2}}><FileField label="ID Proof" name="idProof" value={student.idProof} onChange={handleFile} /></Grid>
                <Grid item size={{xs:12,md:2}}><FileField label="Transfer / Migration Certificate" name="transferCert" value={student.transferCert} onChange={handleFile} /></Grid>
                <Grid item size={{xs:12,md:2}}><FileField label="Passport & Visa (if international)" name="passportVisa" value={student.passportVisa} onChange={handleFile} /></Grid>
              </Grid>
            </Paper>

            {/* Other */}
            <SectionTitle icon={OtherIcon} label="Other" gradient="linear-gradient(135deg,#ffecd2,#fcb69f)" delay={0.25} />
            <Paper elevation={0} sx={{ p: 2.5, borderRadius: '18px', border: '1px solid rgba(252,182,159,.08)', background: 'rgba(252,182,159,.015)', mb: 1 }}>
              <Grid container spacing={2.5}>
                <Grid item size={{xs:12,md:2}}>
                  <FormControl fullWidth>
                    <InputLabel>Category</InputLabel>
                    <Select value={student.category} label="Category" onChange={handleStudent('category')} sx={selectSx}>
                      <MenuItem value="General">General</MenuItem>
                      <MenuItem value="SC">SC</MenuItem>
                      <MenuItem value="ST">ST</MenuItem>
                      <MenuItem value="OBC">OBC</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Paper>

            {/* Next button */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4, animation: 'fadeInUp .5s ease .3s both' }}>
              <Button variant="contained" onClick={() => setTabIdx(1)} endIcon={<NextIcon />}
                sx={{
                  borderRadius: '14px', background: g.primary, textTransform: 'none', fontWeight: 700,
                  px: 5, py: 1.5, fontSize: '0.95rem',
                  boxShadow: '0 8px 24px rgba(102,126,234,.35)',
                  '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 12px 32px rgba(102,126,234,.5)' },
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
            {/* Admission Details */}
            <SectionTitle icon={AdmissionIcon} label="Admission Details" gradient={g.primary} delay={0} />
            <Paper elevation={0} sx={{ p: 2.5, borderRadius: '18px', border: '1px solid rgba(102,126,234,.08)', background: 'rgba(102,126,234,.015)', mb: 1 }}>
              <Grid container spacing={2.5}>
                <Grid item size={{xs:12,md:2}}><TextField fullWidth label="Enrollment Number" value={admin.enrollmentNumber} onChange={handleAdmin('enrollmentNumber')} sx={inputSx} placeholder="e.g. EN2026-CS-0001" /></Grid>
                <Grid item size={{xs:12,md:2}}><TextField fullWidth label="Roll Number" value={admin.rollNumber} onChange={handleAdmin('rollNumber')} sx={inputSx} placeholder="e.g. CS001" /></Grid>
                <Grid item size={{xs:12,md:2}}><TextField fullWidth label="Admission Date" type="date" InputLabelProps={{ shrink: true }} value={admin.admissionDate} onChange={handleAdmin('admissionDate')} sx={inputSx} /></Grid>
                <Grid item size={{xs:12,md:2}}><TextField fullWidth label="Academic Year" value={admin.academicYear} onChange={handleAdmin('academicYear')} sx={inputSx} placeholder="e.g. 2026-2027" /></Grid>
              </Grid>
            </Paper>

            {/* Course Assignment */}
            <SectionTitle icon={CourseIcon} label="Course Assignment" gradient={g.accent} delay={0.05} />
            <Paper elevation={0} sx={{ p: 2.5, borderRadius: '18px', border: '1px solid rgba(79,172,254,.08)', background: 'rgba(79,172,254,.015)', mb: 1 }}>
              <Grid container spacing={2.5}>
                <Grid item size={{xs:12,md:2}}>
                  <FormControl fullWidth>
                    <InputLabel>Final Course &amp; Branch</InputLabel>
                    <Select value={admin.finalCourse} label="Final Course & Branch" onChange={handleAdmin('finalCourse')} sx={selectSx}>
                      {courses.length > 0
                        ? courses.map(c => <MenuItem key={c.id ?? c.name} value={c.name}>{c.name}</MenuItem>)
                        : <MenuItem value=""><em>No courses loaded</em></MenuItem>
                      }
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item size={{xs:12,md:2}}><TextField fullWidth label="Year / Semester" value={admin.yearSemester} onChange={handleAdmin('yearSemester')} sx={inputSx} placeholder="e.g. 1st Year / Sem 1" /></Grid>
                <Grid item size={{xs:12,md:2}}><TextField fullWidth label="Section / Batch" value={admin.section} onChange={handleAdmin('section')} sx={inputSx} placeholder="e.g. Section A / Batch 2026" /></Grid>
              </Grid>
            </Paper>

            {/* Fee Details */}
            <SectionTitle icon={FeeIcon} label="Fee Details" gradient="linear-gradient(135deg,#43e97b,#38f9d7)" delay={0.1} />
            <Paper elevation={0} sx={{ p: 2.5, borderRadius: '18px', border: '1px solid rgba(67,233,123,.08)', background: 'rgba(67,233,123,.015)', mb: 1 }}>
              <Grid container spacing={2.5}>
                <Grid item size={{xs:12,md:2}}><TextField fullWidth label="Total Fee (₹)" type="number" value={admin.totalFee} onChange={handleAdmin('totalFee')} sx={inputSx} /></Grid>
                <Grid item size={{xs:12,md:2}}><TextField fullWidth label="Paid Amount (₹)" type="number" value={admin.paidAmount} onChange={handleAdmin('paidAmount')} sx={inputSx} /></Grid>
                <Grid item size={{xs:12,md:2}}><TextField fullWidth label="Pending Amount (₹)" type="number" value={admin.pendingAmount} onChange={handleAdmin('pendingAmount')} sx={inputSx} /></Grid>
              </Grid>
            </Paper>

            {/* System Data */}
            <SectionTitle icon={SystemIcon} label="System Data" gradient="linear-gradient(135deg,#fa709a,#fee140)" delay={0.15} />
            <Paper elevation={0} sx={{ p: 2.5, borderRadius: '18px', border: '1px solid rgba(250,112,154,.08)', background: 'rgba(250,112,154,.015)', mb: 1 }}>
              <Grid container spacing={2.5}>
                {/* <Grid item size={{xs:12,md:2}}><TextField fullWidth label="Student ID" value={admin.studentId} onChange={handleAdmin('studentId')}  placeholder="Auto-generated" /></Grid> */}
                <Grid item size={{xs:12,md:3}}>
                  <TextField fullWidth label="Student ID (16-char)" value={admin.studentId} onChange={handleAdmin('studentId')} placeholder="Auto-generated"
                    sx={inputSx}
                    InputProps={{
                      endAdornment: (
                        <Button size="small" onClick={() => setAdmin((p) => ({ ...p, studentId: generateStudentId() }))}
                          sx={{ textTransform: 'none', color: '#f5576c', fontWeight: 700, fontSize: '0.75rem', minWidth: 'auto', borderRadius: '8px', '&:hover': { background: 'rgba(245,87,108,.08)' } }}>
                          Regenerate
                        </Button>
                      ),
                    }}
                  />
                </Grid>
                {/* <Grid item size={{xs:12,md:2}}><TextField fullWidth label="Login Email" value={admin.loginEmail} onChange={handleAdmin('loginEmail')}  /></Grid> */}
                {/* <Grid item size={{xs:12,md:2}}><TextField fullWidth label="Login Password" type="password" value={admin.loginPassword} onChange={handleAdmin('loginPassword')}  /></Grid> */}
                <Grid item size={{xs:12,md:2}}><TextField fullWidth label="Library Mapping" value={admin.libraryMap} onChange={handleAdmin('libraryMap')} sx={inputSx} placeholder="Library card no." /></Grid>
                <Grid item size={{xs:12,md:2}}><TextField fullWidth label="Hostel Mapping" value={admin.hostelMap} onChange={handleAdmin('hostelMap')} sx={inputSx} placeholder="Room no. / Block" /></Grid>
              </Grid>
            </Paper>

            {/* Verification */}
            <SectionTitle icon={VerifyIcon} label="Verification" gradient={g.warm} delay={0.2} />
            <Paper elevation={0} sx={{ p: 2.5, borderRadius: '18px', border: '1px solid rgba(240,147,251,.08)', background: 'rgba(240,147,251,.015)', mb: 1 }}>
              <Grid container spacing={2.5}>
                <Grid item size={{xs:12,md:2}}>
                  <FormControl fullWidth>
                    <InputLabel>Document Verification Status</InputLabel>
                    <Select value={admin.docVerification} label="Document Verification Status" onChange={handleAdmin('docVerification')} sx={selectSx}>
                      <MenuItem value="Pending">Pending</MenuItem>
                      <MenuItem value="Verified">Verified</MenuItem>
                      <MenuItem value="Rejected">Rejected</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Paper>

            {/* Navigation buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4, animation: 'fadeInUp .5s ease .25s both' }}>
              <Button variant="outlined" onClick={() => setTabIdx(0)} startIcon={<BackIcon />}
                sx={{
                  borderRadius: '14px', borderColor: '#667eea', borderWidth: 2, color: '#667eea',
                  textTransform: 'none', fontWeight: 700, px: 4, py: 1.4,
                  '&:hover': { borderColor: '#764ba2', color: '#764ba2', background: 'rgba(102,126,234,.04)', transform: 'translateX(-3px)' },
                  transition: 'all .35s cubic-bezier(.4,0,.2,1)',
                }}>
                Back to Student
              </Button>
              <Button variant="contained" onClick={() => setTabIdx(2)} endIcon={<NextIcon />}
                sx={{
                  borderRadius: '14px', background: g.primary, textTransform: 'none', fontWeight: 700,
                  px: 5, py: 1.5, fontSize: '0.95rem',
                  boxShadow: '0 8px 24px rgba(102,126,234,.35)',
                  '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 12px 32px rgba(102,126,234,.5)' },
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
                <Typography sx={{ color: '#27ae60', fontWeight: 700, fontSize: '0.95rem' }}>Data added successfully 🎉</Typography>
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
                <Typography sx={{ color: '#d83b3bff', fontWeight: 600, fontSize: '0.95rem' }}>Failed to add student data</Typography>
              </Box>
            )}

            <Typography sx={{
              fontWeight: 800, fontSize: '1.15rem', color: '#1a1a2e', mb: 3,
              display: 'flex', alignItems: 'center', gap: 1,
            }}>
              <ReviewIcon sx={{ fontSize: 22, color: '#667eea' }} />
              Review All Details Before Submission
            </Typography>

            {reviewSections.map((sec, idx) => (
              <Paper key={idx} sx={{
                mb: 2.5, borderRadius: '18px', overflow: 'hidden',
                boxShadow: '0 2px 16px rgba(102,126,234,.06)',
                border: '1px solid rgba(102,126,234,.06)',
                transition: 'all .3s ease',
                animation: `fadeInUp .4s ease ${idx * 0.04}s both`,
                '&:hover': { boxShadow: '0 6px 24px rgba(102,126,234,.1)', transform: 'translateY(-2px)' },
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

            {/* Navigation + Submit */}
            <Box sx={{
              display: 'flex', justifyContent: 'space-between', mt: 4,
              animation: 'fadeInUp .5s ease .2s both',
            }}>
              <Button variant="outlined" onClick={() => setTabIdx(1)} startIcon={<BackIcon />}
                sx={{
                  borderRadius: '14px', borderColor: '#667eea', borderWidth: 2, color: '#667eea',
                  textTransform: 'none', fontWeight: 700, px: 4, py: 1.4,
                  '&:hover': { borderColor: '#764ba2', color: '#764ba2', background: 'rgba(102,126,234,.04)', transform: 'translateX(-3px)' },
                  transition: 'all .35s cubic-bezier(.4,0,.2,1)',
                }}>
                Back to Admin
              </Button>
              <Button variant="contained" size="large" onClick={handleSubmit} startIcon={<SparkleIcon />}
                sx={{
                  borderRadius: '16px', background: g.primary, textTransform: 'none',
                  fontWeight: 800, fontSize: '1.05rem', px: 6, py: 1.6, letterSpacing: '.3px',
                  boxShadow: '0 10px 30px rgba(102,126,234,.4)',
                  transition: 'all .35s cubic-bezier(.4,0,.2,1)',
                  '&:hover': { transform: 'translateY(-3px) scale(1.01)', boxShadow: '0 14px 40px rgba(102,126,234,.5)' },
                }}>
                Register Student
              </Button>
            </Box>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default AddStudentPanel;
