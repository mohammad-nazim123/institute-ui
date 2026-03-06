import { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Avatar,
  Chip,
  InputAdornment,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Modal,
  Button,
} from '@mui/material';
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  School as SchoolIcon,
  Close as CloseIcon,
  Psychology as ProfessorIcon,
} from '@mui/icons-material';
import { professorsData } from './data';
import { enhancedInputStyles } from './styles';
import { getProfessors } from '../apis/professors_api';

// Professor-themed enhanced input styles
const profInputStyles = {
  ...enhancedInputStyles,
  '& .MuiOutlinedInput-root': {
    ...enhancedInputStyles['& .MuiOutlinedInput-root'],
    '&:hover fieldset': { borderColor: '#f5576c' },
    '&.Mui-focused fieldset': { borderColor: '#f5576c', borderWidth: '2px' },
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: '#f5576c',
  },
};

// Modal style
const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 650,
  maxHeight: '90vh',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  bgcolor: 'background.paper',
  borderRadius: '24px',
  boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
  p: 0,
};

// Department gradient colors
const deptColors = {
  'Computer Science': {
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    light: '#fff0f5',
    icon: '#f5576c',
  },
  'Mathematics': {
    gradient: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    light: '#f5f0ff',
    icon: '#a18cd1',
  },
  'Physics': {
    gradient: 'linear-gradient(135deg, #fad0c4 0%, #ffd1ff 100%)',
    light: '#fff5fa',
    icon: '#e091c0',
  },
};

const defaultColor = {
  gradient: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    light: '#f5f0ff',
    icon: '#a18cd1',
};

const ProfessorDetailsPanel = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedPanels, setExpandedPanels] = useState({});
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [professorsList, setProfessorsList] = useState([]);
  const [editFormData, setEditFormData] = useState({
    id: null,
    fullName: '',
    dob: '',
    gender: '',
    phone: '',
    email: '',
    address: '',
    department: '',
    qualification: '',
    specialization: '',
    salary: '',
  });

  // Group professors by department
  const professorsByDept = useMemo(() => {
    const filtered = professorsList.filter(prof => {
      const nameMatch = prof.name?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
      const emailMatch = prof.email?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
      const deptMatch = prof.experience?.department?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
      return nameMatch || emailMatch || deptMatch;
    });

    const grouped = filtered.reduce((acc, prof) => {
      const dept = prof.experience?.department || 'Unassigned';
      if (!acc[dept]) {
        acc[dept] = [];
      }
      acc[dept].push(prof);
      return acc;
    }, {});

    // Sort professors within each department by name
    Object.keys(grouped).forEach(dept => {
      grouped[dept].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    });
    console.log('grouped', grouped);

    return grouped;
  }, [searchQuery, professorsList]);

     async function getAllprofessor(){
    await getProfessors().then(res => {
      if (res.status === 200) {
        setProfessorsList(res.data[0].professors);
        console.log("professorsList",res.data[0].professors)
      }
    });

  }

  useEffect(()=>{
    // console.log("professorsList",professorsList)
  },[professorsList])

  useEffect(() => {
    getAllprofessor();
  }, []);

  const handleAccordionChange = (dept) => (event, isExpanded) => {
    setExpandedPanels(prev => ({
      ...prev,
      [dept]: isExpanded,
    }));
  };

  const getColorScheme = (dept) => defaultColor;

  const handleEditClick = (prof) => {
    setEditFormData({
      id: prof.id,
      fullName: prof.name,
      dob: prof.dob || '',
      gender: prof.gender || '',
      phone: prof.phone || '',
      email: prof.email,
      address: prof.address || '',
      department: prof.department || '',
      qualification: prof.qualification || '',
      specialization: prof.specialization || '',
      salary: prof.salary || '',
    });
    setEditModalOpen(true);
  };

  const handleEditModalClose = () => {
    setEditModalOpen(false);
    setEditFormData({
      id: null,
      fullName: '',
      dob: '',
      gender: '',
      phone: '',
      email: '',
      address: '',
      department: '',
      qualification: '',
      specialization: '',
      salary: '',
    });
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditSave = () => {
    console.log('Saving professor data:', editFormData);
    handleEditModalClose();
  };

  const sectionTitleSx = {
    color: '#f5576c',
    fontWeight: 700,
    fontSize: '0.9rem',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    mb: 1,
    display: 'flex',
    alignItems: 'center',
    gap: 1,
  };

  const sectionBar = (
    <Box sx={{ width: 4, height: 20, background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', borderRadius: 2 }} />
  );



  return (
    <Box>
      {/* Header */}
      <Paper
        sx={{
          p: 0,
          borderRadius: '24px',
          boxShadow: '0 20px 60px rgba(240, 147, 251, 0.15)',
          overflow: 'hidden',
          mb: 3,
        }}
      >
        <Box
          sx={{
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            p: 3,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
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
            <ProfessorIcon sx={{ color: '#fff', fontSize: 28 }} />
          </Box>
          <Box>
            <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '1.2rem' }}>
              Professor Details
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem' }}>
              View and manage all registered professors grouped by department
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Search Bar */}
      <Paper sx={{ borderRadius: '20px', boxShadow: '0 10px 40px rgba(0,0,0,0.08)', mb: 3, p: 3 }}>
        <TextField
          placeholder="Search by name, email, or department..."
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#999' }} />
              </InputAdornment>
            ),
          }}
          sx={{
            ...profInputStyles,
            width: '100%',
            maxWidth: 500,
          }}
        />
      </Paper>

      {/* Department-wise Accordions */}
      {Object.entries(professorsByDept).map(([dept, professors]) => {
        const colorScheme = getColorScheme(dept);
        console.log("professors",professors,dept)

        return (
          <Accordion
            key={dept}
            expanded={expandedPanels[dept] ?? true}
            onChange={handleAccordionChange(dept)}
            sx={{
              mb: 2,
              borderRadius: '16px !important',
              boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
              overflow: 'hidden',
              '&:before': { display: 'none' },
              '&.Mui-expanded': { margin: '0 0 16px 0' },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}
              sx={{
                background: colorScheme.gradient,
                minHeight: '64px',
                '&.Mui-expanded': { minHeight: '64px' },
                '& .MuiAccordionSummary-content': {
                  alignItems: 'center',
                  gap: 2,
                },
              }}
            >
              <SchoolIcon sx={{ color: 'white', fontSize: 28 }} />
              <Box>
                <Typography
                  variant="h6"
                  sx={{ color: 'white', fontWeight: 700 }}
                >
                  {dept}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: 'rgba(255,255,255,0.85)' }}
                >
                  {professors.length} professor{professors.length !== 1 ? 's' : ''}
                </Typography>
              </Box>
            </AccordionSummary>

            <AccordionDetails sx={{ p: 0 }}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ background: colorScheme.light }}>
                      <TableCell sx={{ fontWeight: 700, width: '25%', textAlign: 'left' }}>Professor</TableCell>
                      <TableCell sx={{ fontWeight: 700, width: '20%', textAlign: 'center' }}>Email</TableCell>
                      <TableCell sx={{ fontWeight: 700, width: '20%', textAlign: 'center' }}>Qualifications</TableCell>
                      <TableCell sx={{ fontWeight: 700, width: '15%', textAlign: 'center' }}>Salary</TableCell>
                      <TableCell sx={{ fontWeight: 700, width: '20%', textAlign: 'center' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {professors.map((prof, index) => (
                      <TableRow
                        key={prof.id}
                        hover
                        sx={{
                          transition: 'all 0.3s ease',
                          animation: `fadeIn 0.4s ease ${index * 0.05}s both`,
                          '@keyframes fadeIn': {
                            from: { opacity: 0, transform: 'translateY(10px)' },
                            to: { opacity: 1, transform: 'translateY(0)' },
                          },
                          '&:hover': {
                            background: `${colorScheme.light} !important`,
                            transform: 'scale(1.01)',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                          },
                        }}
                      >
                        <TableCell sx={{ textAlign: 'left' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            {/* <Avatar
                              sx={{
                                background: colorScheme.gradient,
                                width: 40,
                                height: 40,
                                boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
                                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                                fontWeight: 600,
                                '&:hover': {
                                  transform: 'scale(1.1) rotate(5deg)',
                                  boxShadow: '0 6px 20px rgba(0,0,0,0.25)',
                                },
                              }}
                            >
                              {prof.name[0]}
                            </Avatar> */}
                            <Typography fontWeight={500}>{prof.name}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          <Typography variant="body2" color="text.secondary">
                            {prof.email}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          <Chip
                            label={Array.isArray(prof.qualification) && prof.qualification.length > 0 ?
                              //  prof.qualification[0].degree : 
                               prof.qualification.map((item) => item.degree).join(', '):
                               ''}
                            size="small"
                            sx={{
                              background: colorScheme.gradient,
                              color: 'white',
                              fontWeight: 600,
                              fontSize: '0.7rem',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center', fontWeight: 600 }}>
                          ₹{prof.admin_employement?prof.admin_employement.salary.toLocaleString():0}
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          <IconButton
                            size="small"
                            onClick={() => handleEditClick(prof)}
                            sx={{
                              color: colorScheme.icon,
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                background: `${colorScheme.icon}15`,
                                transform: 'scale(1.2)',
                              },
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            sx={{
                              color: '#f44336',
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                background: 'rgba(244, 67, 54, 0.1)',
                                transform: 'scale(1.2)',
                              },
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </AccordionDetails>
          </Accordion>
        );
      })}

      {/* No results message */}
      {Object.keys(professorsByDept).length === 0 && (
        <Paper
          sx={{
            p: 4,
            textAlign: 'center',
            borderRadius: '20px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
          }}
        >
          <Typography variant="h6" color="text.secondary">
            No professors found matching your search
          </Typography>
        </Paper>
      )}

      {/* Edit Professor Modal */}
      <Modal
        open={editModalOpen}
        onClose={handleEditModalClose}
        aria-labelledby="edit-professor-modal"
      >
        <Box sx={modalStyle}>
          {/* Modal Header */}
          <Box
            sx={{
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
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
                <ProfessorIcon sx={{ color: '#fff', fontSize: 28 }} />
              </Box>
              <Box>
                <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '1.2rem' }}>
                  Edit Professor Details
                </Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem' }}>
                  Update professor information
                </Typography>
              </Box>
            </Box>
            <IconButton onClick={handleEditModalClose} sx={{ color: 'white' }}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Form Fields */}
          <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 2.5, overflow: 'auto', flex: 1 }}>
            {/* Personal Information Section */}
            <Typography sx={sectionTitleSx}>
              {sectionBar}
              Personal Information
            </Typography>

            <TextField
              fullWidth
              label="Full Name"
              name="fullName"
              variant="outlined"
              sx={profInputStyles}
              placeholder="Enter professor's full name"
              value={editFormData.fullName}
              onChange={handleEditFormChange}
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="Date of Birth"
                name="dob"
                type="date"
                InputLabelProps={{ shrink: true }}
                variant="outlined"
                sx={profInputStyles}
                value={editFormData.dob}
                onChange={handleEditFormChange}
              />
              <TextField
                fullWidth
                label="Gender"
                name="gender"
                select
                SelectProps={{ native: true }}
                variant="outlined"
                sx={profInputStyles}
                InputLabelProps={{ shrink: true }}
                value={editFormData.gender}
                onChange={handleEditFormChange}
              >
                <option value="">-- Select --</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </TextField>
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="Phone Number"
                name="phone"
                variant="outlined"
                sx={profInputStyles}
                placeholder="10-digit mobile number"
                value={editFormData.phone}
                onChange={handleEditFormChange}
              />
              <TextField
                fullWidth
                label="Email ID"
                name="email"
                type="email"
                variant="outlined"
                sx={profInputStyles}
                placeholder="professor@example.com"
                value={editFormData.email}
                onChange={handleEditFormChange}
              />
            </Box>

            <TextField
              fullWidth
              label="Current Address"
              name="address"
              multiline
              rows={2}
              variant="outlined"
              sx={profInputStyles}
              placeholder="Enter complete address"
              value={editFormData.address}
              onChange={handleEditFormChange}
            />

            {/* Professional Information Section */}
            <Typography sx={{ ...sectionTitleSx, mt: 2 }}>
              {sectionBar}
              Professional Information
            </Typography>

            <TextField
              fullWidth
              label="Department"
              name="department"
              select
              SelectProps={{ native: true }}
              variant="outlined"
              sx={profInputStyles}
              InputLabelProps={{ shrink: true }}
              value={editFormData.department}
              onChange={handleEditFormChange}
            >
              <option value="">-- Select Department --</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Physics">Physics</option>
            </TextField>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="Qualification"
                name="qualification"
                variant="outlined"
                sx={profInputStyles}
                placeholder="e.g., Ph.D. in Computer Science"
                value={editFormData.qualification}
                onChange={handleEditFormChange}
              />
              <TextField
                fullWidth
                label="Specialization"
                name="specialization"
                variant="outlined"
                sx={profInputStyles}
                placeholder="e.g., Machine Learning"
                value={editFormData.specialization}
                onChange={handleEditFormChange}
              />
            </Box>

            {/* Salary Information Section */}
            <Typography sx={{ ...sectionTitleSx, mt: 2 }}>
              {sectionBar}
              Salary Information
            </Typography>

            <TextField
              fullWidth
              label="Monthly Salary"
              name="salary"
              type="number"
              variant="outlined"
              sx={profInputStyles}
              placeholder="Enter monthly salary"
              value={editFormData.salary}
              onChange={handleEditFormChange}
              InputProps={{
                startAdornment: <Typography sx={{ mr: 1, color: '#f5576c', fontWeight: 600 }}>₹</Typography>,
                inputProps: { min: 0 },
              }}
            />

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
              <Button
                variant="outlined"
                onClick={handleEditModalClose}
                sx={{
                  borderRadius: '12px',
                  px: 4,
                  py: 1.5,
                  textTransform: 'none',
                  fontWeight: 600,
                  borderColor: '#f5576c',
                  color: '#f5576c',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: '#f093fb',
                    bgcolor: 'rgba(245, 87, 108, 0.05)',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleEditSave}
                sx={{
                  borderRadius: '12px',
                  px: 4,
                  py: 1.5,
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '1rem',
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  boxShadow: '0 8px 25px rgba(245, 87, 108, 0.4)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #e080ea 0%, #e04a5e 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 35px rgba(245, 87, 108, 0.5)',
                  },
                }}
              >
                ✨ Save Changes
              </Button>
            </Box>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default ProfessorDetailsPanel;
