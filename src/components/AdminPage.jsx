import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  IconButton,
  Modal,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  Tooltip,
  Drawer,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  School as SchoolIcon,
  Person as StudentIcon,
  Psychology as ProfessorIcon,
  ExpandLess,
  ExpandMore,
  PersonAdd as AddPersonIcon,
  List as DetailsIcon,
  Payment as FeeIcon,
  EventAvailable as AttendanceIcon,
  Payments as PaymentIcon,
  CalendarMonth as ScheduleIcon,
  ArrowBack as BackIcon,
  MenuBook as SyllabusIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { clearSession } from '../utils/storage';

// Import all panels from adminSection
import {
  AddStudentPanel,
  StudentDetailsPanel,
  StudentFeePanel,
  StudentAttendancePanel,
  SyllabusPanel,
  AddProfessorPanel,
  ProfessorDetailsPanel,
  ProfessorPaymentPanel,
  SchedulePanel,
} from './adminSection';

const AdminPage = () => {
  useEffect(() => {
    document.title = 'EduConnect | Admin';
  }, []);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const navigate = useNavigate();
  const [studentOpen, setStudentOpen] = useState(true);
  const [professorOpen, setProfessorOpen] = useState(true);
  const [activePanel, setActivePanel] = useState('student-details');
  const [mobileOpen, setMobileOpen] = useState(false);

  // User dropdown state
  const [anchorEl, setAnchorEl] = useState(null);
  const userMenuOpen = Boolean(anchorEl);

  const menuItems = {
    student: [
      { id: 'student-add', label: 'Add New Student', icon: <AddPersonIcon /> },
      { id: 'student-details', label: 'Details', icon: <DetailsIcon /> },
      { id: 'student-fee', label: 'Fee', icon: <FeeIcon /> },
      { id: 'student-attendance', label: 'Attendance', icon: <AttendanceIcon /> },
      { id: 'student-syllabus', label: 'Syllabus', icon: <SyllabusIcon /> },
      { id: 'student-schedule', label: 'Schedules', icon: <ScheduleIcon /> },
    ],
    professor: [
      { id: 'professor-add', label: 'Add New Professor', icon: <AddPersonIcon /> },
      { id: 'professor-details', label: 'Details', icon: <DetailsIcon /> },
      { id: 'professor-payment', label: 'Payment', icon: <PaymentIcon /> },
    ],
  };

  const renderPanel = () => {
    switch (activePanel) {
      case 'student-add':
        return <AddStudentPanel />;
      case 'student-details':
        return <StudentDetailsPanel />;
      case 'student-fee':
        return <StudentFeePanel />;
      case 'student-attendance':
        return <StudentAttendancePanel />;
      case 'student-syllabus':
        return <SyllabusPanel />;
      case 'student-schedule':
        return <SchedulePanel />;
      case 'professor-add':
        return <AddProfessorPanel />;
      case 'professor-details':
        return <ProfessorDetailsPanel />;
      case 'professor-payment':
        return <ProfessorPaymentPanel />;
      default:
        return <StudentDetailsPanel />;
    }
  };

  // Sidebar content extracted so it can be used in both Drawer and permanent panel
  const SidebarContent = (
    <Box
      sx={{
        width: { xs: 260, md: '100%' },
        height: '100%',
        background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '4px 0 20px rgba(0,0,0,0.1)',
      }}
    >
      {/* Header */}
      <Box sx={{ p: 3, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Box
            sx={{
              width: 45, height: 45, borderRadius: '12px',
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <SchoolIcon sx={{ color: '#fff', fontSize: 24 }} />
          </Box>
          <Box>
            <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '1.1rem' }}>Admin Panel</Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem' }}>Manage Institute</Typography>
          </Box>
        </Box>
      </Box>

      {/* Navigation Menu */}
      <List component="nav" sx={{ flex: 1, py: 2, px: 1 }}>
        {/* Student Section */}
        <ListItemButton
          onClick={() => setStudentOpen(!studentOpen)}
          sx={{ borderRadius: '12px', mb: 0.5, '&:hover': { background: 'rgba(255,255,255,0.05)' } }}
        >
          <ListItemIcon>
            <Box sx={{ width: 36, height: 36, borderRadius: '10px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <StudentIcon sx={{ color: '#fff', fontSize: 20 }} />
            </Box>
          </ListItemIcon>
          <ListItemText primary="Students" sx={{ '& .MuiTypography-root': { color: '#fff', fontWeight: 600 } }} />
          {studentOpen ? <ExpandLess sx={{ color: 'rgba(255,255,255,0.7)' }} /> : <ExpandMore sx={{ color: 'rgba(255,255,255,0.7)' }} />}
        </ListItemButton>
        <Collapse in={studentOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {menuItems.student.map((item) => (
              <ListItemButton
                key={item.id}
                onClick={() => { setActivePanel(item.id); setMobileOpen(false); }}
                sx={{ pl: 4, py: 1.5, ml: 2, borderRadius: '10px', borderLeft: activePanel === item.id ? '3px solid #667eea' : '3px solid transparent', background: activePanel === item.id ? 'rgba(102, 126, 234, 0.15)' : 'transparent', '&:hover': { background: 'rgba(255,255,255,0.05)' } }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <Box sx={{ color: activePanel === item.id ? '#667eea' : 'rgba(255,255,255,0.5)' }}>{item.icon}</Box>
                </ListItemIcon>
                <ListItemText primary={item.label} sx={{ '& .MuiTypography-root': { color: activePanel === item.id ? '#fff' : 'rgba(255,255,255,0.7)', fontSize: '0.9rem', fontWeight: activePanel === item.id ? 600 : 400 } }} />
              </ListItemButton>
            ))}
          </List>
        </Collapse>

        {/* Professor Section */}
        <ListItemButton
          onClick={() => setProfessorOpen(!professorOpen)}
          sx={{ borderRadius: '12px', mt: 1, mb: 0.5, '&:hover': { background: 'rgba(255,255,255,0.05)' } }}
        >
          <ListItemIcon>
            <Box sx={{ width: 36, height: 36, borderRadius: '10px', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ProfessorIcon sx={{ color: '#fff', fontSize: 20 }} />
            </Box>
          </ListItemIcon>
          <ListItemText primary="Professors" sx={{ '& .MuiTypography-root': { color: '#fff', fontWeight: 600 } }} />
          {professorOpen ? <ExpandLess sx={{ color: 'rgba(255,255,255,0.7)' }} /> : <ExpandMore sx={{ color: 'rgba(255,255,255,0.7)' }} />}
        </ListItemButton>
        <Collapse in={professorOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {menuItems.professor.map((item) => (
              <ListItemButton
                key={item.id}
                onClick={() => { setActivePanel(item.id); setMobileOpen(false); }}
                sx={{ pl: 4, py: 1.5, ml: 2, borderRadius: '10px', borderLeft: activePanel === item.id ? '3px solid #f5576c' : '3px solid transparent', background: activePanel === item.id ? 'rgba(245, 87, 108, 0.15)' : 'transparent', '&:hover': { background: 'rgba(255,255,255,0.05)' } }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <Box sx={{ color: activePanel === item.id ? '#f5576c' : 'rgba(255,255,255,0.5)' }}>{item.icon}</Box>
                </ListItemIcon>
                <ListItemText primary={item.label} sx={{ '& .MuiTypography-root': { color: activePanel === item.id ? '#fff' : 'rgba(255,255,255,0.7)', fontSize: '0.9rem', fontWeight: activePanel === item.id ? 600 : 400 } }} />
              </ListItemButton>
            ))}
          </List>
        </Collapse>
      </List>

      {/* Footer */}
      <Box sx={{ p: 3, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem', textAlign: 'center' }}>
          © 2026 EduConnect Admin
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box
      sx={{
        display: 'flex',
        width: '100%',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%)',
      }}
    >
      {/* Mobile Drawer */}
      <Drawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 260, border: 'none' } }}
      >
        {SidebarContent}
      </Drawer>

      {/* Desktop Sidebar */}
      <Box
        sx={{
          width: { md: '30%', lg: '20%', xl: '16%' },
          height: '100vh',
          position: 'sticky',
          top: 0,
          display: { xs: 'none', md: 'block' },
          flexShrink: 0,
        }}
      >
        {SidebarContent}
      </Box>



      <Box
        sx={{
          flex: 1,
          minHeight: '100vh',
          overflow: 'auto',
          p: { xs: 2, md: 4 },
          position: 'relative',
        }}
      >
        {/* Top bar: hamburger (mobile) + user avatar */}
        <Box sx={{ position: 'sticky', top: 0, zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: { xs: 2, md: 0 } }}>
          {/* Hamburger — mobile only */}
          <IconButton
            onClick={() => setMobileOpen(true)}
            sx={{ display: { xs: 'flex', md: 'none' }, color: '#667eea', background: 'rgba(102,126,234,0.08)', borderRadius: '12px' }}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ display: { xs: 'none', md: 'block' } }} />
        </Box>
        {/* Top-right action buttons */}
        <Box sx={{ position: { xs: 'fixed', md: 'absolute' }, top: { xs: 12, md: 18 }, right: { xs: 16, md: 28 }, zIndex: 11, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {/* User Avatar Dropdown */}
          <IconButton
            onClick={(e) => setAnchorEl(e.currentTarget)}
            sx={{
              p: 0.5,
              transition: 'all .3s ease',
              '&:hover': { transform: 'scale(1.05)' },
            }}
          >
            <Avatar
              sx={{
                width: 42,
                height: 42,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                fontWeight: 700,
                fontSize: '1rem',
                boxShadow: '0 4px 15px rgba(102,126,234,.35)',
              }}
            >
              A
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={userMenuOpen}
            onClose={() => setAnchorEl(null)}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            PaperProps={{
              sx: {
                mt: 1,
                borderRadius: '16px',
                minWidth: 220,
                boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
                overflow: 'hidden',
              },
            }}
          >
            <Box sx={{ px: 2.5, py: 2, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem' }}>Admin</Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.8rem' }}>admin@institute.com</Typography>
            </Box>
            <Divider />
            <MenuItem
              onClick={() => {
                setAnchorEl(null);
                clearSession();
                window.location.href = '/';
              }}
              sx={{
                py: 1.5,
                px: 2.5,
                gap: 1.5,
                color: '#f5576c',
                fontWeight: 600,
                transition: 'all .2s ease',
                '&:hover': {
                  background: 'rgba(245,87,108,0.08)',
                },
              }}
            >
              <LogoutIcon sx={{ fontSize: 20 }} />
              Logout
            </MenuItem>
          </Menu>
        </Box>

        {renderPanel()}
      </Box>
    </Box>
  );
};

export default AdminPage;
