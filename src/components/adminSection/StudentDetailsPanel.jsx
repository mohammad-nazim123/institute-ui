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
  LinearProgress,
} from '@mui/material';
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  School as SchoolIcon,
  Close as CloseIcon,
  Person as StudentIcon,
} from '@mui/icons-material';
import PanelHeader from './PanelHeader';
import { studentsData } from './data';
import { inputStyles, enhancedInputStyles } from './styles';
import { useLocation } from 'react-router-dom';
import { getStudents } from '../apis/students_api';


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

// Course gradient colors for visual distinction
const courseColors = {
  'Computer Science': {
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    light: '#f0f4ff',
    icon: '#667eea',
  },
  'Mathematics': {
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    light: '#fff0f5',
    icon: '#f5576c',
  },
  'Physics': {
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    light: '#f0faff',
    icon: '#4facfe',
  },
};

const defaultColor = {
  gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    light: '#f0f4ff',
    icon: '#667eea',
};

const StudentDetailsPanel = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedPanels, setExpandedPanels] = useState({});
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [studentData, setStudentData] = useState([])
  const [editFormData, setEditFormData] = useState({
    id: null,
    rollNo: '',
    enrollmentNo: '',
    fullName: '',
    dob: '',
    age: '',
    gender: '',
    course: '',
    branch: '',
    yearSemester: '',
    roomNumber: '',
    address: '',
    mobile: '',
    email: '',
    guardianName: '',
    motherName: '',
    guardianMobile: '',
    prevQualification: '',
    yearOfPassing: '',
  });

  const institute = localStorage.getItem('institute');
  const location = useLocation();

  const {id,uniqueId} = location.state || {}

  console.log("id",id)
  console.log("uniqueId",uniqueId)


  

  // Group students by course and sort by roll number
  const studentsByCourse = useMemo(() => {
    const filtered = studentData.filter(student => {
      const name = student?.name || '';
      const email = student?.contact_details?.email || '';
      const rollNo = student?.admission_details?.roll_number || '';
      const course = student?.course_details?.course_name || '';
      
      return name.toLowerCase().includes(searchQuery.toLowerCase()) ||
             email.toLowerCase().includes(searchQuery.toLowerCase()) ||
             rollNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
             course.toLowerCase().includes(searchQuery.toLowerCase());
    });

    const grouped = filtered.reduce((acc, student) => {
      const course = student?.course_details?.course_name || 'No Course Assigned';
      if (!acc[course]) {
        acc[course] = [];
      }
      acc[course].push(student);
      return acc;
    }, {});

    // Sort students within each course by roll number
    Object.keys(grouped).forEach(course => {
      grouped[course].sort((a, b) => {
        const rollNoA = a?.admission_details?.roll_number || '';
        const rollNoB = b?.admission_details?.roll_number || '';
        return rollNoA.localeCompare(rollNoB);
      });
    });

    return grouped;
  }, [
    searchQuery, studentData
  ]);


   useEffect(()=>{
      getStudents(uniqueId).then(data=>{
        const insttutite_id = institute?institute:id
        if(data.body){
          setStudentData(data.body[0].students)
        }
        console.log("data",data.body)
      })
    },[])

    useEffect(()=>{
      console.log('student',studentData)
    },[studentData])

  const handleAccordionChange = (course) => (event, isExpanded) => {
    setExpandedPanels(prev => ({
      ...prev,
      [course]: isExpanded,
    }));
  };

  const getColorScheme = (course) => courseColors[course] || defaultColor;

  const handleEditClick = (student) => {
    setEditFormData({
      id: student.id,
      rollNo: student?.admission_details?.roll_number || '',
      enrollmentNo: student?.admission_details?.enrollment_number || student?.enrollment_number || '',
      fullName: student.name || '',
      dob: student.dob || '',
      age: student.age || '',
      gender: student.gender || '',
      course: student?.course_details?.course_name || '',
      branch: student?.course_details?.branch || '',
      yearSemester: student?.course_details?.year_semester || '',
      roomNumber: student?.room_number || '',
      address: student?.contact_details?.current_address || student?.contact_details?.parmannent_address || '',
      mobile: student?.contact_details?.mobile || '',
      email: student?.contact_details?.email || '',
      guardianName: student?.contact_details?.father_name || '',
      motherName: student?.contact_details?.mother_name || '',
      guardianMobile: student?.contact_details?.parent_contact || '',
      prevQualification: student?.education_details?.qualification || '',
      yearOfPassing: student?.education_details?.passing_year || '',
    });
    setEditModalOpen(true);
  };

  const handleEditModalClose = () => {
    setEditModalOpen(false);
    setEditFormData({
      id: null,
      rollNo: '',
      enrollmentNo: '',
      fullName: '',
      dob: '',
      age: '',
      gender: '',
      course: '',
      branch: '',
      yearSemester: '',
      roomNumber: '',
      address: '',
      mobile: '',
      email: '',
      guardianName: '',
      motherName: '',
      guardianMobile: '',
      prevQualification: '',
      yearOfPassing: '',
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
    // Here you would typically make an API call to update the student
    console.log('Saving student data:', editFormData);
    handleEditModalClose();
  };

  return (
    <Box>
      <PanelHeader
        title="Student Details"
        subtitle="View and manage all registered students grouped by course"
        gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      />
      
      {/* Search Bar */}
      <Paper sx={{ borderRadius: '20px', boxShadow: '0 10px 40px rgba(0,0,0,0.08)', mb: 3, p: 3 }}>
        <TextField
          placeholder="Search by name, email, roll number, or course..."
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
          sx={{ ...inputStyles, width: '100%', maxWidth: 500 }}
        />
      </Paper>

      {/* Course-wise Accordions */}
      {Object.entries(studentsByCourse).map(([course, students], index) => {
        const colorScheme = getColorScheme(course);
        console.log('cuorse',course,students)
        
        return (
          <Accordion
            key={course}
            expanded={expandedPanels[course] ?? true}
            onChange={handleAccordionChange(course)}
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
                  {course}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: 'rgba(255,255,255,0.85)' }}
                >
                  {students.length} student{students.length !== 1 ? 's' : ''} enrolled
                </Typography>
              </Box>
            </AccordionSummary>
            
            <AccordionDetails sx={{ p: 0 }}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ background: colorScheme.light }}>
                      <TableCell sx={{ fontWeight: 700, width: '5%', textAlign: 'center' }}>#</TableCell>
                      <TableCell sx={{ fontWeight: 700, width: '10%', textAlign: 'start' }}><Typography sx={{ marginLeft: '10px',fontWeight: 700,fontSize: '14px' }}>Roll No</Typography></TableCell>
                      <TableCell sx={{ fontWeight: 700, width: '20%', textAlign: 'start' }}>Name</TableCell>
                      <TableCell sx={{ fontWeight: 700, width: '15%', textAlign: 'start' }}>Enroll No</TableCell>
                      <TableCell sx={{ fontWeight: 700, width: '15%', textAlign: 'center' }}>Mobile</TableCell>
                      <TableCell sx={{ fontWeight: 700, width: '15%', textAlign: 'center' }}>Email</TableCell>
                      <TableCell sx={{ fontWeight: 700, width: '10%', textAlign: 'center' }}>Hostel Detail</TableCell>
                      <TableCell sx={{ fontWeight: 700, width: '10%', textAlign: 'center' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {students.map((student, index) => (
                      <TableRow
                        key={student.id}
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
                        <TableCell sx={{ textAlign: 'center' }}>
                          <Typography variant="body2" fontWeight={600} color="text.secondary">
                            {index + 1}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ textAlign: 'start' }}>
                          <Typography sx={{marginLeft: '10px',fontWeight: 700,fontSize: '14px'}}>
                            {student?.admission_details?.roll_number || 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ textAlign: 'left' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'start', gap: 2 }}>
                            <Typography fontWeight={500}>{student?.name || 'Unknown'}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ textAlign: 'start' }}>
                          <Typography variant="body2" fontWeight={500}>
                            {student?.admission_details?.enrollment_number || student?.enrollment_number || 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          <Typography variant="body2" color="text.secondary">
                            {student?.contact_details?.mobile || 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          <Typography variant="body2" color="text.secondary">
                            {student?.contact_details?.email || 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          <Typography variant="body2" color="text.secondary">
                            {student?.system_details?.hostel_details || 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          <IconButton 
                            size="small" 
                            onClick={() => handleEditClick(student)}
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
      {Object.keys(studentsByCourse).length === 0 && (
        <Paper
          sx={{
            p: 4,
            textAlign: 'center',
            borderRadius: '20px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
          }}
        >
          <Typography variant="h6" color="text.secondary">
            No students found matching your search
          </Typography>
        </Paper>
      )}

      {/* Edit Student Modal */}
      <Modal
        open={editModalOpen}
        onClose={handleEditModalClose}
        aria-labelledby="edit-student-modal"
      >
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
                <StudentIcon sx={{ color: '#fff', fontSize: 28 }} />
              </Box>
              <Box>
                <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '1.2rem' }}>
                  Edit Student Details
                </Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem' }}>
                  Update student information
                </Typography>
              </Box>
            </Box>
            <IconButton onClick={handleEditModalClose} sx={{ color: 'white' }}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Form Fields */}
          <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 2.5, overflow: 'auto', flex: 1 }}>
            {/* Personal Information Section (Text Only) */}
            <Typography sx={{ 
              color: '#667eea', 
              fontWeight: 700, 
              fontSize: '0.9rem', 
              textTransform: 'uppercase',
              letterSpacing: '1px',
              mb: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}>
              <Box sx={{ width: 4, height: 20, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: 2 }} />
              Personal Information
            </Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2, bgcolor: '#f8fafc', p: 2, borderRadius: 2 }}>
              <Typography variant="body2"><strong>Name:</strong> {editFormData.fullName}</Typography>
              <Typography variant="body2"><strong>DOB:</strong> {editFormData.dob}</Typography>
              <Typography variant="body2"><strong>Enrollment No:</strong> {editFormData.enrollmentNo}</Typography>
              <Typography variant="body2"><strong>Roll No:</strong> {editFormData.rollNo}</Typography>
              <Typography variant="body2"><strong>Mobile:</strong> {editFormData.mobile}</Typography>
              <Typography variant="body2"><strong>Email:</strong> {editFormData.email}</Typography>
              <Typography variant="body2"><strong>Room No:</strong> {editFormData.roomNumber}</Typography>
            </Box>

            {/* Editable Fields Section */}
            <Typography sx={{ 
              color: '#667eea', 
              fontWeight: 700, 
              fontSize: '0.9rem', 
              textTransform: 'uppercase',
              letterSpacing: '1px',
              mt: 2,
              mb: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}>
              <Box sx={{ width: 4, height: 20, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: 2 }} />
              Update Course & Location Details
            </Typography>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField 
                fullWidth 
                label="Course" 
                name="course"
                variant="outlined" 
                sx={enhancedInputStyles}
                placeholder="Enter course"
                value={editFormData.course}
                onChange={handleEditFormChange}
              />
              <TextField 
                fullWidth 
                label="Branch" 
                name="branch"
                variant="outlined" 
                sx={enhancedInputStyles}
                placeholder="Enter branch"
                value={editFormData.branch}
                onChange={handleEditFormChange}
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField 
                fullWidth 
                label="Year / Semester" 
                name="yearSemester"
                variant="outlined" 
                sx={enhancedInputStyles}
                placeholder="e.g., 2nd Year / 3rd Sem"
                value={editFormData.yearSemester}
                onChange={handleEditFormChange}
              />
              <TextField 
                fullWidth 
                label="Room Number" 
                name="roomNumber"
                variant="outlined" 
                sx={enhancedInputStyles}
                placeholder="Enter room number"
                value={editFormData.roomNumber}
                onChange={handleEditFormChange}
              />
            </Box>

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
                onClick={handleEditSave}
                sx={{
                  borderRadius: '12px',
                  px: 4,
                  py: 1.5,
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '1rem',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5a6fd6 0%, #68439a 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 35px rgba(102, 126, 234, 0.5)',
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

export default StudentDetailsPanel;
