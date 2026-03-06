import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Select,
  Paper,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Modal,
  TextField,
  Button,
  Divider,
} from '@mui/material';
import {
  School as SchoolIcon,
  Person as StudentIcon,
  Psychology as ProfessorIcon,
  AdminPanelSettings as AdminIcon,
  Business as InstituteIcon,
  Logout as LogoutIcon,
  Close as CloseIcon,
  Email as EmailIcon,
  Fingerprint as FingerprintIcon,
  Login as LoginIcon,
} from '@mui/icons-material';
import { useNavigate, } from 'react-router-dom';
import { signOut } from './apis/auth_api';
import { getInstitutes } from './apis/institutes_api';
import { getStudentId } from './apis/students_api';
import { getProfessorId } from './apis/professors_api';
import { getVarifiedInstitutes } from './apis/institutes_api';
import {
  setInstitute,
  setStudentId,
  setStudentUniqueId,
  setProfessorId,
  setProfessorDbId,
  setProfessorKey,
  setAdminKey,
  clearSession
} from '../utils/storage';

// Sample institutes data
// const institutesList = [
//   { name: 'Harvard University', id: 1 },
//   { name: 'Stanford University', id: 2 },
//   { name: 'MIT', id: 3 },
//   { name: 'Oxford University', id: 4 },
//   { name: 'Cambridge University', id: 5 },
//   { name: 'IIT Delhi', id: 6 },
//   { name: 'IIT Bombay', id: 7 },
// ];


const Dashboard = () => {
  useEffect(() => {
    document.title = 'EduConnect | Dashboard';
  }, []);

  const navigate = useNavigate();
  const [institutesList, setInstitutesList] = useState([]);
  const [selectedInstitute, setSelectedInstitute] = useState('');

  // Student login modal state
  const [studentModalOpen, setStudentModalOpen] = useState(false);
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [uniqueId, setUniqueId] = useState('');
  const [fieldError, setFieldError] = useState('');

  // Professor login modal state
  const [professorModalOpen, setProfessorModalOpen] = useState(false);
  const [profEmailOrPhone, setProfEmailOrPhone] = useState('');
  const [profUniqueId, setProfUniqueId] = useState('');
  const [profFieldError, setProfFieldError] = useState('');

  // Admin login modal state
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [adminInstitute, setAdminInstitute] = useState('');
  const [adminUniqueId, setAdminUniqueId] = useState('');
  const [adminFieldError, setAdminFieldError] = useState('');

  const handleRoleClick = (role) => {
    console.log(`Navigating to ${role} panel`);
    setSelectedInstitute('');
    if (role.toLowerCase() === 'student') {
      setEmailOrPhone('');
      setUniqueId('');
      setFieldError('');
      setStudentModalOpen(true);
    } else if (role.toLowerCase() === 'professor') {
      setProfEmailOrPhone('');
      setProfUniqueId('');
      setProfFieldError('');
      setProfessorModalOpen(true);
    } else if (role.toLowerCase() === 'admin') {
      setAdminInstitute('');
      setAdminUniqueId('');
      setAdminFieldError('');
      setAdminModalOpen(true);
    } else {
      navigate(`/${role.toLowerCase()}`);
    }
  };

  const handleStudentLogin = () => {
    if (!selectedInstitute || !emailOrPhone.trim() || !uniqueId.trim()) {
      setFieldError('Please fill in all fields before continuing.');
      return;
    }
    const inst = institutesList.find((i) => i.name === selectedInstitute);
    if (inst) {
      setInstitute(inst.id); // async write — also pass inst.id directly below
    }
    // Pass inst.id directly so the API call doesn't race with the async storage write
    getStudentId(emailOrPhone, uniqueId, inst?.id).then(data => {
      if ([200, 201].includes(data.status)) {
        setFieldError('');
        setStudentUniqueId(uniqueId);          // personal auth key → X-Personal-Key
        setStudentId(data.body.student_id);    // DB id → profile fetch
        setStudentModalOpen(false);
        navigate('/student', { state: { id: data.body, uniqueId: uniqueId } });
      } else {
        setFieldError(data.body.message);
      }
    });
  };

  const handleProfessorLogin = () => {
    if (!selectedInstitute || !profEmailOrPhone.trim() || !profUniqueId.trim()) {
      setProfFieldError('Please fill in all fields before continuing.');
      return;
    }
    const inst = institutesList.find((i) => i.name === selectedInstitute);
    if (inst) {
      setInstitute(inst.id);
    }

    getProfessorId(profEmailOrPhone, profUniqueId,selectedInstitute).then(data => {
      if ([200, 201].includes(data.status)) {
        setProfFieldError('');
        setProfessorId(data.body.id);   // marks role for App.jsx routing
        setProfessorDbId(data.body.id);
        setProfessorKey(data.body.admin_employement.personal_id);
        setProfessorModalOpen(false);
        navigate('/professor', 
          { state: { id: data.body.id, uniqueId: profUniqueId } }
        );
      } else {
        setProfFieldError(data.body.message || 'Validation failed');
      }
    });
  };

  const handleAdminLogin = () => {
    if (!adminInstitute.trim() || !adminUniqueId.trim()) {
      setAdminFieldError('Please fill in both fields before continuing.');
      return;
    }

    if (adminUniqueId.length !== 32) {
      setAdminFieldError('Incorrect Admin ID.');
      return;
    }

    getVarifiedInstitutes(adminInstitute,adminUniqueId).then(data => {
      if([200,201].includes(data.status) ){
        console.log("admin_data",data.body.id);
        setAdminKey(adminUniqueId);
        setInstitute(parseInt(data.body.id));
        setAdminFieldError('');
        setAdminModalOpen(false);
        navigate('/admin', 
          { state: { id: data.body,uniqueId:adminUniqueId } }
        );
      }else{
        setAdminFieldError(data.body.message);
      }
    });

    // setAdminFieldError('');
    // institutesList.map(list=>{
    //   if(list.name === adminInstitute){
    //     setAdminModalOpen(false);
    //     // console.log("institute", list.id);
    //     navigate('/admin', 
    //       // { state: 
    //       //   { institute: adminInstitute, uniqueId: adminUniqueId } 
    //       // }
    //     );
        // setInstitute(list.id);
    //     // console.log("institute", adminInstitute);
    //   }else{
    //     setAdminFieldError('Institute not found');
    //   }
    // })
    // navigate('/admin',
    //    { state: { institute: adminInstitute, uniqueId: adminUniqueId } }
    //   );
  };

  useEffect(() => {
    getInstitutes().then(data => {
      setInstitutesList(data.body);
      // console.log("data", data.body);
    });
  }, []);


  return (
    <Box
      sx={{
        display: 'flex',
        width: '100%',
        height: '100vh',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%)',
      }}
    >
      {/* Left Panel - 25% */}
      <Box
        sx={{
          width: { xs: '100%', md: '15%' },
          minWidth: { md: '320px' },
          height: '100%',
          background: 'linear-gradient(180deg, #667eea 0%, #764ba2 100%)',
          padding: 4,
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Floating elements for visual appeal */}
        <Box
          sx={{
            position: 'absolute',
            top: '10%',
            right: '-20px',
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)',
            animation: 'float 6s ease-in-out infinite',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: '20%',
            left: '-30px',
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.08)',
            animation: 'float 8s ease-in-out infinite',
          }}
        />

        {/* Header */}
        <Box sx={{ mb: 4, zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Box
              sx={{
                width: 50,
                height: 50,
                borderRadius: '12px',
                background: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <SchoolIcon sx={{ color: '#fff', fontSize: 28 }} />
            </Box>
            <Typography
              variant="h5"
              sx={{
                color: '#fff',
                fontWeight: 700,
                letterSpacing: '-0.5px',
              }}
            >
              EduConnect
            </Typography>
          </Box>
        </Box>

        {/* Bottom decoration */}
        <Box sx={{ flexGrow: 1 }} />
        <Typography
          sx={{
            color: 'rgba(255,255,255,0.5)',
            fontSize: '0.75rem',
            textAlign: 'center',
            zIndex: 1,
          }}
        >
          © 2026 EduConnect. All rights reserved.
        </Typography>
      </Box>

      {/* Right Panel - 75% */}
      <Box
        sx={{
          width: { xs: '100%', md: '85%' },
          height: '100%',
          padding: { xs: 3, md: 6 },
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {/* Logout */}
        <IconButton
          onClick={() => { 
            signOut();
            clearSession();
            window.location.href = '/';
          }}
          sx={{
            position: 'absolute',
            top: 24,
            right: 24,
            background: 'linear-gradient(135deg, #f5576c 0%, #ff6b6b 100%)',
            color: '#fff',
            width: 42,
            height: 42,
            boxShadow: '0 4px 15px rgba(245,87,108,.35)',
            transition: 'all .3s ease',
            '&:hover': {
              transform: 'scale(1.1)',
              boxShadow: '0 6px 25px rgba(245,87,108,.55)',
              background: 'linear-gradient(135deg, #ff6b6b 0%, #f5576c 100%)',
            },
          }}
        >
          <LogoutIcon sx={{ fontSize: 20 }} />
        </IconButton>
        {/* Header */}
        <Box sx={{ mb: 6, textAlign: 'center' }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 2,
            }}
          >
            Welcome to Dashboard
          </Typography>
          <Typography sx={{ color: '#666', fontSize: '1.1rem' }}>
            Choose your role to continue
          </Typography>
        </Box>

        {/* Role Cards */}
        <Box
          sx={{
            display: 'flex',
            gap: 4,
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          <RoleCard
            title="Student"
            description="Access courses, assignments, and track your progress"
            icon={<StudentIcon sx={{ fontSize: 48 }} />}
            gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            onClick={() => handleRoleClick('student')}
          />
          <RoleCard
            title="Professor"
            description="Manage courses, grade assignments, and monitor students"
            icon={<ProfessorIcon sx={{ fontSize: 48 }} />}
            gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
            onClick={() => handleRoleClick('professor')}
          />
          <RoleCard
            title="Admin"
            description="Oversee institute operations and manage users"
            icon={<AdminIcon sx={{ fontSize: 48 }} />}
            gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
            onClick={() => handleRoleClick('admin')}
          />
        </Box>
      </Box>

      {/* ────── Student Login Modal ────── */}
      <Modal open={studentModalOpen} onClose={() => setStudentModalOpen(false)}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '90%', sm: 460 },
            background: '#fff',
            borderRadius: '24px',
            boxShadow: '0 30px 80px rgba(0,0,0,0.22)',
            outline: 'none',
            overflow: 'hidden',
          }}
        >
          {/* Modal Header */}
          <Box
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              px: 3,
              py: 2.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: '12px',
                  background: 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <StudentIcon sx={{ color: '#fff', fontSize: 24 }} />
              </Box>
              <Box>
                <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '1.1rem', lineHeight: 1.2 }}>
                  Student Login
                </Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.72)', fontSize: '0.78rem' }}>
                  Enter your credentials to continue
                </Typography>
              </Box>
            </Box>
            <IconButton
              onClick={() => setStudentModalOpen(false)}
              sx={{
                color: 'rgba(255,255,255,0.8)',
                background: 'rgba(255,255,255,0.12)',
                '&:hover': { background: 'rgba(255,255,255,0.22)' },
                borderRadius: '10px',
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Modal Body */}
          <Box sx={{ p: 3.5 }}>
            {/* Institute field */}
            <Box sx={{ mb: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <InstituteIcon sx={{ fontSize: 18, color: '#667eea' }} />
                <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#444' }}>
                  Select Institute
                </Typography>
              </Box>
              <FormControl fullWidth size="small">
                <Select
                  value={selectedInstitute}
                  onChange={(e) => { setSelectedInstitute(e.target.value); setFieldError(''); }}
                  displayEmpty
                  sx={{
                    borderRadius: '12px',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(0,0,0,0.23)',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#667eea',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#667eea',
                    },
                  }}
                  renderValue={(selected) => {
                    if (!selected) {
                      return <Typography color="textSecondary">Choose your institute</Typography>;
                    }
                    return selected;
                  }}
                >
                  <MenuItem disabled value="">
                    <em>Choose your institute</em>
                  </MenuItem>
                  {institutesList.map((inst) => (
                    <MenuItem key={inst.id} value={inst.name}>
                      {inst.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Email / Phone field */}
            <Box sx={{ mb: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <EmailIcon sx={{ fontSize: 18, color: '#667eea' }} />
                <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#444' }}>
                  Email / Phone Number
                </Typography>
              </Box>
              <TextField
                fullWidth
                placeholder="e.g. student@email.com or +91-9876543210"
                value={emailOrPhone}
                onChange={(e) => { setEmailOrPhone(e.target.value); setFieldError(''); }}
                variant="outlined"
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    '&:hover fieldset': { borderColor: '#667eea' },
                    '&.Mui-focused fieldset': { borderColor: '#667eea' },
                  },
                }}
              />
            </Box>

            {/* Unique ID field */}
            <Box sx={{ mb: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <FingerprintIcon sx={{ fontSize: 18, color: '#764ba2' }} />
                <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#444' }}>
                  Unique Student ID
                </Typography>
              </Box>
              <TextField
                fullWidth
                placeholder="e.g. STU-2024-00123"
                value={uniqueId}
                onChange={(e) => { setUniqueId(e.target.value); setFieldError(''); }}
                variant="outlined"
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    '&:hover fieldset': { borderColor: '#764ba2' },
                    '&.Mui-focused fieldset': { borderColor: '#764ba2' },
                  },
                }}
              />
            </Box>

            {/* Validation error */}
            {fieldError && (
              <Typography
                sx={{
                  fontSize: '0.8rem',
                  color: '#f5576c',
                  mb: 2,
                  px: 1,
                  py: 0.8,
                  borderRadius: '8px',
                  background: 'rgba(245,87,108,0.08)',
                }}
              >
                {fieldError}
              </Typography>
            )}

            <Divider sx={{ mb: 2.5 }} />

            {/* Action buttons */}
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => setStudentModalOpen(false)}
                sx={{
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 600,
                  borderColor: 'rgba(102,126,234,0.4)',
                  color: '#667eea',
                  py: 1.2,
                  '&:hover': {
                    borderColor: '#667eea',
                    background: 'rgba(102,126,234,0.05)',
                  },
                }}
              >
                Cancel
              </Button>
              <Button
                fullWidth
                variant="contained"
                startIcon={<LoginIcon />}
                onClick={handleStudentLogin}
                sx={{
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 700,
                  py: 1.2,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  boxShadow: '0 6px 20px rgba(102,126,234,0.4)',
                  '&:hover': {
                    boxShadow: '0 8px 28px rgba(102,126,234,0.55)',
                    background: 'linear-gradient(135deg, #7b8ff5 0%, #8a5cb5 100%)',
                  },
                }}
              >
                Continue
              </Button>
            </Box>
          </Box>
        </Box>
      </Modal>

      {/* ────── Professor Login Modal ────── */}
      <Modal open={professorModalOpen} onClose={() => setProfessorModalOpen(false)}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '90%', sm: 460 },
            background: '#fff',
            borderRadius: '24px',
            boxShadow: '0 30px 80px rgba(0,0,0,0.22)',
            outline: 'none',
            overflow: 'hidden',
          }}
        >
          {/* Modal Header */}
          <Box
            sx={{
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              px: 3,
              py: 2.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: '12px',
                  background: 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ProfessorIcon sx={{ color: '#fff', fontSize: 24 }} />
              </Box>
              <Box>
                <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '1.1rem', lineHeight: 1.2 }}>
                  Professor Login
                </Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.72)', fontSize: '0.78rem' }}>
                  Enter your credentials to continue
                </Typography>
              </Box>
            </Box>
            <IconButton
              onClick={() => setProfessorModalOpen(false)}
              sx={{
                color: 'rgba(255,255,255,0.8)',
                background: 'rgba(255,255,255,0.12)',
                '&:hover': { background: 'rgba(255,255,255,0.22)' },
                borderRadius: '10px',
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Modal Body */}
          <Box sx={{ p: 3.5 }}>
            {/* Institute field */}
            <Box sx={{ mb: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <InstituteIcon sx={{ fontSize: 18, color: '#f093fb' }} />
                <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#444' }}>
                  Select Institute
                </Typography>
              </Box>
              <FormControl fullWidth size="small">
                <Select
                  value={selectedInstitute}
                  onChange={(e) => { setSelectedInstitute(e.target.value); setProfFieldError(''); }}
                  displayEmpty
                  sx={{
                    borderRadius: '12px',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(0,0,0,0.23)',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#f093fb',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#f093fb',
                    },
                  }}
                  renderValue={(selected) => {
                    if (!selected) {
                      return <Typography color="textSecondary">Choose your institute</Typography>;
                    }
                    return selected;
                  }}
                >
                  <MenuItem disabled value="">
                    <em>Choose your institute</em>
                  </MenuItem>
                  {institutesList.map((inst) => (
                    <MenuItem key={inst.id} value={inst.name}>
                      {inst.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Email / Phone field */}
            <Box sx={{ mb: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <EmailIcon sx={{ fontSize: 18, color: '#f093fb' }} />
                <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#444' }}>
                  Email / Phone Number
                </Typography>
              </Box>
              <TextField
                fullWidth
                placeholder="e.g. professor@email.com or +91-9876543210"
                value={profEmailOrPhone}
                onChange={(e) => { setProfEmailOrPhone(e.target.value); setProfFieldError(''); }}
                variant="outlined"
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    '&:hover fieldset': { borderColor: '#f093fb' },
                    '&.Mui-focused fieldset': { borderColor: '#f093fb' },
                  },
                }}
              />
            </Box>

            {/* Unique ID field */}
            <Box sx={{ mb: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <FingerprintIcon sx={{ fontSize: 18, color: '#f5576c' }} />
                <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#444' }}>
                  Unique Professor ID
                </Typography>
              </Box>
              <TextField
                fullWidth
                placeholder="e.g. PROF-2024-00456"
                value={profUniqueId}
                onChange={(e) => { setProfUniqueId(e.target.value); setProfFieldError(''); }}
                variant="outlined"
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    '&:hover fieldset': { borderColor: '#f5576c' },
                    '&.Mui-focused fieldset': { borderColor: '#f5576c' },
                  },
                }}
              />
            </Box>

            {/* Validation error */}
            {profFieldError && (
              <Typography
                sx={{
                  fontSize: '0.8rem',
                  color: '#f5576c',
                  mb: 2,
                  px: 1,
                  py: 0.8,
                  borderRadius: '8px',
                  background: 'rgba(245,87,108,0.08)',
                }}
              >
                {profFieldError}
              </Typography>
            )}

            <Divider sx={{ mb: 2.5 }} />

            {/* Action buttons */}
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => setProfessorModalOpen(false)}
                sx={{
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 600,
                  borderColor: 'rgba(240,147,251,0.4)',
                  color: '#f093fb',
                  py: 1.2,
                  '&:hover': {
                    borderColor: '#f093fb',
                    background: 'rgba(240,147,251,0.05)',
                  },
                }}
              >
                Cancel
              </Button>
              <Button
                fullWidth
                variant="contained"
                startIcon={<LoginIcon />}
                onClick={handleProfessorLogin}
                sx={{
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 700,
                  py: 1.2,
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  boxShadow: '0 6px 20px rgba(240,147,251,0.4)',
                  '&:hover': {
                    boxShadow: '0 8px 28px rgba(240,147,251,0.55)',
                    background: 'linear-gradient(135deg, #f5a6fc 0%, #f7706e 100%)',
                  },
                }}
              >
                Continue
              </Button>
            </Box>
          </Box>
        </Box>
      </Modal>

      {/* ────── Admin Login Modal ────── */}
      <Modal open={adminModalOpen} onClose={() => setAdminModalOpen(false)}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '90%', sm: 460 },
            background: '#fff',
            borderRadius: '24px',
            boxShadow: '0 30px 80px rgba(0,0,0,0.22)',
            outline: 'none',
            overflow: 'hidden',
          }}
        >
          {/* Modal Header */}
          <Box
            sx={{
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              px: 3,
              py: 2.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: '12px',
                  background: 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AdminIcon sx={{ color: '#fff', fontSize: 24 }} />
              </Box>
              <Box>
                <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '1.1rem', lineHeight: 1.2 }}>
                  Admin Login
                </Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.72)', fontSize: '0.78rem' }}>
                  Enter your credentials to continue
                </Typography>
              </Box>
            </Box>
            <IconButton
              onClick={() => setAdminModalOpen(false)}
              sx={{
                color: 'rgba(255,255,255,0.8)',
                background: 'rgba(255,255,255,0.12)',
                '&:hover': { background: 'rgba(255,255,255,0.22)' },
                borderRadius: '10px',
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Modal Body */}
          <Box sx={{ p: 3.5 }}>
            {/* Institute Name field */}
            <Box sx={{ mb: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <InstituteIcon sx={{ fontSize: 18, color: '#4facfe' }} />
                <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#444' }}>
                  Institute Name
                </Typography>
              </Box>
              <TextField
                fullWidth
                placeholder="e.g. EduConnect University"
                value={adminInstitute}
                onChange={(e) => { setAdminInstitute(e.target.value); setAdminFieldError(''); }}
                variant="outlined"
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    '&:hover fieldset': { borderColor: '#4facfe' },
                    '&.Mui-focused fieldset': { borderColor: '#4facfe' },
                  },
                }}
              />
            </Box>

            {/* Admin Unique ID field */}
            <Box sx={{ mb: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <FingerprintIcon sx={{ fontSize: 18, color: '#00f2fe' }} />
                <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#444' }}>
                  32 Digit Admin ID
                </Typography>
              </Box>
              <TextField
                fullWidth
                placeholder="Enter your 32-digit Admin ID"
                value={adminUniqueId}
                onChange={(e) => { setAdminUniqueId(e.target.value); setAdminFieldError(''); }}
                variant="outlined"
                size="small"
                // inputProps={{ maxLength: 33 }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    '&:hover fieldset': { borderColor: '#00f2fe' },
                    '&.Mui-focused fieldset': { borderColor: '#00f2fe' },
                  },
                }}
              />
            </Box>

            {/* Validation error */}
            {adminFieldError && (
              <Typography
                sx={{
                  fontSize: '0.8rem',
                  color: '#f5576c',
                  mb: 2,
                  px: 1,
                  py: 0.8,
                  borderRadius: '8px',
                  background: 'rgba(245,87,108,0.08)',
                }}
              >
                {adminFieldError}
              </Typography>
            )}

            <Divider sx={{ mb: 2.5 }} />

            {/* Action buttons */}
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => setAdminModalOpen(false)}
                sx={{
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 600,
                  borderColor: 'rgba(79,172,254,0.4)',
                  color: '#4facfe',
                  py: 1.2,
                  '&:hover': {
                    borderColor: '#4facfe',
                    background: 'rgba(79,172,254,0.05)',
                  },
                }}
              >
                Cancel
              </Button>
              <Button
                fullWidth
                variant="contained"
                startIcon={<LoginIcon />}
                onClick={handleAdminLogin}
                sx={{
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 700,
                  py: 1.2,
                  background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                  boxShadow: '0 6px 20px rgba(79,172,254,0.4)',
                  '&:hover': {
                    boxShadow: '0 8px 28px rgba(79,172,254,0.55)',
                    background: 'linear-gradient(135deg, #5fc3fe 0%, #17f5fe 100%)',
                  },
                }}
              >
                Continue
              </Button>
            </Box>

            {/* Contact Us text */}
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography sx={{ fontSize: '0.88rem', color: '#666', fontWeight: 500 }}>
                Dont have id -{' '}
                <Box
                  component="span"
                  sx={{
                    color: '#4facfe',
                    fontWeight: 700,
                    cursor: 'pointer',
                    '&:hover': { textDecoration: 'underline' },
                  }}
                  onClick={() => window.location.href = 'mailto:contact@educonnect.com'}
                >
                  contact us
                </Box>
              </Typography>
            </Box>

          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

const RoleCard = ({ title, description, icon, gradient, onClick }) => (
  <Paper
    onClick={onClick}
    sx={{
      width: '280px',
      padding: 4,
      borderRadius: '24px',
      cursor: 'pointer',
      position: 'relative',
      overflow: 'hidden',
      background: '#fff',
      boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
      transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      '&:hover': {
        transform: 'translateY(-12px) scale(1.02)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
        '& .role-icon-bg': {
          transform: 'scale(1.1)',
        },
        '& .role-icon': {
          transform: 'scale(1.1)',
        },
      },
    }}
  >
    {/* Background decoration */}
    <Box
      className="role-icon-bg"
      sx={{
        position: 'absolute',
        top: '-30px',
        right: '-30px',
        width: '120px',
        height: '120px',
        borderRadius: '50%',
        background: gradient,
        opacity: 0.15,
        transition: 'transform 0.4s ease',
      }}
    />

    {/* Icon */}
    <Box
      className="role-icon"
      sx={{
        width: 80,
        height: 80,
        borderRadius: '20px',
        background: gradient,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        mb: 3,
        transition: 'transform 0.4s ease',
        boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
      }}
    >
      {icon}
    </Box>

    {/* Content */}
    <Typography
      variant="h5"
      sx={{
        fontWeight: 700,
        color: '#1a1a2e',
        mb: 1,
      }}
    >
      {title}
    </Typography>
    <Typography
      sx={{
        color: '#666',
        fontSize: '0.9rem',
        lineHeight: 1.6,
      }}
    >
      {description}
    </Typography>

    {/* Arrow indicator */}
    <Box
      sx={{
        mt: 3,
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        color: '#667eea',
        fontWeight: 600,
        fontSize: '0.9rem',
      }}
    >
      Continue
      <Box
        component="span"
        sx={{
          display: 'inline-block',
          transition: 'transform 0.3s ease',
          '&:hover': {
            transform: 'translateX(5px)',
          },
        }}
      >
        →
      </Box>
    </Box>
  </Paper>
);

export default Dashboard;
