import { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Chip,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Modal,
  TextField,
  IconButton,
} from '@mui/material';
import {
  Person as StudentIcon,
  Payment as FeeIcon,
  Payments as PaymentIcon,
  ExpandMore as ExpandMoreIcon,
  School as SchoolIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import PanelHeader from './PanelHeader';
import StatCard from './StatCard';
import { studentsData as initialStudentsData } from './data';
import { enhancedInputStyles } from './styles';
import { getStudents,updateAmount } from '../apis/students_api';

// Course gradient colors for visual distinction
const courseColors = {
  'M. Tech': {
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    light: '#f0f4ff',
    icon: '#667eea',
  },
  'B. Tech': {
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    light: '#fff0f5',
    icon: '#f5576c',
  },
  'nul l': {
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

// Modal style
const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 500,
  maxHeight: '90vh',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  bgcolor: 'background.paper',
  borderRadius: '24px',
  boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
  p: 0,
};

const StudentFeePanel = () => {
  // const [studentsData, setStudentsData] = useState(initialStudentsData);
  const [expandedPanels, setExpandedPanels] = useState({});
  const [studentData, setStudentData] = useState([]);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentFormData, setPaymentFormData] = useState({
    id: null,
    name: '',
    course: '',
    totalFee: 0,
    paidAmount: 0,
    newPayment: 0,
  });

  const institute = localStorage.getItem('institute')

  // Group students by course
  const studentsByCourse = useMemo(() => {
    const safeData = Array.isArray(studentData) ? studentData : [];
    const grouped = safeData.reduce((acc, student) => {
      const courseName = student.course_details ? student.course_details.course_name : 'null';
      if (!acc[courseName]) {
        acc[courseName] = [];
      }
      acc[courseName].push(student);
      return acc;
    }, {});

    // Sort students within each course by roll number
    Object.keys(grouped).forEach(course => {
      grouped[course].sort((a, b) => {
        const rollA = String(a.rollNo || '');
        const rollB = String(b.rollNo || '');
        return rollA.localeCompare(rollB);
      });
    });

    return grouped?grouped:{};
  }, [studentData]);

  // Calculate totals
  const totals = useMemo(() => {
    const safeData = Array.isArray(studentData) ? studentData : [];
    const totalCollection = safeData.reduce((sum, s) => sum + (s.fee_details ? s.fee_details.paid_amount : 0), 0);
    const totalFees = safeData.reduce((sum, s) => sum + (s.fee_details ? s.fee_details.total_fee_amount : 0), 0);
    const pendingAmount = totalFees - totalCollection;
    const paidStudents = safeData.filter(s => {
      const total = s.fee_details ? s.fee_details.total_fee_amount : 0;
      const paid = s.fee_details ? s.fee_details.paid_amount : 0;
      return total === paid;
    }).length;
    return { totalCollection, pendingAmount, paidStudents, totalStudents: safeData.length };
  }, [studentData]);

  const handleAccordionChange = (course) => (event, isExpanded) => {
    setExpandedPanels(prev => ({
      ...prev,
      [course]: isExpanded,
    }));
  };

  async function getAllStudentData(){
    getStudents().
    then(data=>{
       setStudentData(data.body[0].students)
          console.log("inst",data.body[0].students)
      // setStudentData(data?.body || [])
      // console.log("student data",data)
    })

  }

  useEffect(()=>{
    getAllStudentData()
  },[])

  const getColorScheme = (course) => courseColors[course] || defaultColor;

  const handleAddPaymentClick = (student) => {
    console.log('srudentpau=yment',student)
    setPaymentFormData({
      id: student.id,
      name: student.name,
      course: student.course_details?student.course_details.course_name:'null',
      totalFee: student.fee_details?student.fee_details.total_fee_amount:0,
      paidAmount: student.fee_details?student.fee_details.paid_amount:0,
      pendingAmount: student.fee_details?student.fee_details.pending_amount:0,
      newPayment: 0,
    });
    setPaymentModalOpen(true);
  };

  const handlePaymentModalClose = () => {
    setPaymentModalOpen(false);
    setPaymentFormData({
      id: null,
      name: '',
      course: '',
      totalFee: 0,
      paidAmount: 0,
      newPayment: 0,
    });
  };

  const handlePaymentFormChange = (e) => {
    const { name, value } = e.target;
    console.log("payment",name,value)
    setPaymentFormData(prev => ({
      ...prev,
      [name]: name === 'newPayment' ? parseFloat(value) || 0 : value,
    }));
  };

  const handlePaymentSave = () => {
    const newPaidAmount = paymentFormData.paidAmount + paymentFormData.newPayment;
    // Make sure we don't exceed total fee
    const finalPaidAmount = Math.min(newPaidAmount, paymentFormData.totalFee);
    const remainingPending = paymentFormData.pendingAmount - paymentFormData.newPayment;
    updateAmount(
      paymentFormData.id,finalPaidAmount,remainingPending 
    ).then(data=>{
      console.log("data",data)
      if([200,201].includes(data.status)){
        getAllStudentData()
      }
    })

    handlePaymentModalClose();
  };

  const pendingAfterPayment = paymentFormData.totalFee - (paymentFormData.paidAmount + paymentFormData.newPayment);
  const totalAfterPayment = paymentFormData.paidAmount + paymentFormData.newPayment;

  return (
    <Box>
      <PanelHeader
        title="Fee Management"
        subtitle="Track and manage student fee payments grouped by course"
        gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      />
      
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <StatCard title="Total Collection" value={`₹${totals.totalCollection.toLocaleString()}`} color="#667eea" icon={<FeeIcon />} />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard title="Pending Amount" value={`₹${totals.pendingAmount.toLocaleString()}`} color="#f5576c" icon={<PaymentIcon />} />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard title="Students Paid" value={`${totals.paidStudents}/${totals.totalStudents}`} color="#00c853" icon={<StudentIcon />} />
        </Grid>
      </Grid>

      {/* Course-wise Accordions */}
      {Object.entries(studentsByCourse).map(([course, students]) => {
        const colorScheme = getColorScheme(course);
        const coursePaid = students.reduce((sum, s) => sum + (s.fee_details ? s.fee_details.paid_amount : 0), 0);
        const courseFee = students.reduce((sum, s) => sum + (s.fee_details ? s.fee_details.total_fee_amount : 0), 0);
        console.log("fees ",course,students)
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
              <Box sx={{ flex: 1 }}>
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
                  {students.length} student{students.length !== 1 ? 's' : ''} • ₹{coursePaid.toLocaleString()} / ₹{courseFee.toLocaleString()} collected
                </Typography>
              </Box>
            </AccordionSummary>
            
            <AccordionDetails sx={{ p: 0 }}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ background: colorScheme.light }}>
                      <TableCell sx={{ fontWeight: 700, width: '10%', textAlign: 'center' }}><Typography sx={{marginLeft:'10px',fontWeight:600,fontSize:'14px'}}>Roll No</Typography></TableCell>
                      <TableCell sx={{ fontWeight: 700, width: '15%', textAlign: 'center' }}><Typography sx={{marginLeft:'10px',fontWeight:600,fontSize:'14px'}}>Student</Typography></TableCell>
                      <TableCell sx={{ fontWeight: 700, width: '15%', textAlign: 'center' }}>Total Fee</TableCell>
                      <TableCell sx={{ fontWeight: 700, width: '15%', textAlign: 'center' }}>Paid</TableCell>
                      <TableCell sx={{ fontWeight: 700, width: '15%', textAlign: 'center' }}>Pending</TableCell>
                      <TableCell sx={{ fontWeight: 700, width: '15%', textAlign: 'center' }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 700, width: '15%', textAlign: 'center' }}>Action</TableCell>
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
                          },
                        }}
                      >
                        <TableCell sx={{ textAlign: 'center',marginLeft:'10px',fontWeight:600,fontSize:'14px' }}>
                        {student.admission_details?student.admission_details.roll_number:0}
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                           <Typography sx={{marginLeft:'10px',fontWeight:600,fontSize:'14px',textAlign:'center'}}>{student.name}</Typography>
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center', fontWeight: 600 }}>
                          ₹{student.fee_details?student.fee_details.total_fee_amount.toLocaleString():0}
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center', color: '#2e7d32', fontWeight: 600 }}>
                          ₹{student.fee_details?student.fee_details.paid_amount.toLocaleString():0}
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center', color: '#c62828', fontWeight: 600 }}>
                          ₹{(student.fee_details? student.fee_details.pending_amount:0)}
                          {/* ₹{(console.log('fee details',student.fee_details? student.fee_details.total_fee_amount - student.fee_details.paid_amount:0 ))} */}
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          <Chip
                            label={student.fee_details?student.fee_details.pending_amount === 0 ? 'Paid' : 'Pending':'null'}
                            size="small"
                            sx={{
                              background: student.fee_details?student.fee_details.pending_amount === 0  
                                ? 'linear-gradient(135deg, #4caf50, #81c784)' 
                                : 'linear-gradient(135deg, #ff9800, #ffb74d)':0,
                              color: 'white',
                              fontWeight: 600,
                              boxShadow: student.fee_details?student.fee_details.pending_amount === 0 
                                ? '0 2px 8px rgba(76, 175, 80, 0.3)'
                                : '0 2px 8px rgba(255, 152, 0, 0.3)':0,
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => handleAddPaymentClick(student)}
                            disabled={student.fee_details?student.fee_details.pending_amount === 0:0}
                            sx={{
                              borderRadius: '10px',
                              textTransform: 'none',
                              fontWeight: 600,
                              background: student.fee_details?student.fee_details.pending_amount === 0 
                                ? '#e0e0e0' 
                                : colorScheme.gradient:0,
                              boxShadow: student.fee_details?student.fee_details.total_fee_amount !== student.fee_details.paid_amount
                                ? '0 4px 12px rgba(0,0,0,0.15)' 
                                : 'none':0,
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                transform: student.fee_details?student.fee_details.total_fee_amount !== student.fee_details.paid_amount ? 'translateY(-2px)' : 'none':0,
                                boxShadow: student.fee_details?student.fee_details.total_fee_amount !== student.fee_details.paid_amount 
                                  ? '0 6px 16px rgba(0,0,0,0.2)' 
                                  : 'none':0,
                              },
                            }}
                          >
                            {student.fee_details?student.fee_details.pending_amount === 0 ? 'Fully Paid' : 'Add Payment':'null'}
                          </Button>
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

      {/* Payment Modal */}
      <Modal
        open={paymentModalOpen}
        onClose={handlePaymentModalClose}
        aria-labelledby="payment-modal"
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
                <PaymentIcon sx={{ color: '#fff', fontSize: 28 }} />
              </Box>
              <Box>
                <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '1.2rem' }}>
                  Add Payment
                </Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem' }}>
                  Record fee payment for student
                </Typography>
              </Box>
            </Box>
            <IconButton onClick={handlePaymentModalClose} sx={{ color: 'white' }}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Form Fields */}
          <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 3, overflow: 'auto', flex: 1 }}>
            {/* Student Info */}
            <Box sx={{ 
              p: 2, 
              borderRadius: '12px', 
              background: 'linear-gradient(135deg, #f8f9fc 0%, #e8ecf1 100%)',
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}>
              <Avatar sx={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                width: 50,
                height: 50,
                fontWeight: 700,
              }}>
                {console.log('paymentFormData.name[0]',paymentFormData)}
              </Avatar>
              <Box>
                <Typography fontWeight={700} fontSize="1.1rem">{paymentFormData.name}</Typography>
                <Typography variant="body2" color="text.secondary">{paymentFormData.course}</Typography>
              </Box>
            </Box>

            {/* Fee Summary */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Paper sx={{ 
                flex: 1, 
                p: 2, 
                borderRadius: '12px', 
                textAlign: 'center',
                background: '#f8f9fc',
              }}>
                <Typography variant="caption" color="text.secondary">Total Fee</Typography>
                <Typography fontWeight={700} fontSize="1.2rem">₹{paymentFormData.totalFee.toLocaleString()}</Typography>
              </Paper>
              <Paper sx={{ 
                flex: 1, 
                p: 2, 
                borderRadius: '12px', 
                textAlign: 'center',
                background: '#e8f5e9',
              }}>
                <Typography variant="caption" color="text.secondary">Already Paid</Typography>
                <Typography fontWeight={700} fontSize="1.2rem" color="#2e7d32">₹{paymentFormData.paidAmount.toLocaleString()}</Typography>
              </Paper>
              <Paper sx={{ 
                flex: 1, 
                p: 2, 
                borderRadius: '12px', 
                textAlign: 'center',
                background: '#ffebee',
              }}>
                <Typography variant="caption" color="text.secondary">Pending</Typography>
                <Typography fontWeight={700} fontSize="1.2rem" color="#c62828">₹{(paymentFormData?paymentFormData.pendingAmount-paymentFormData.newPayment:0)}</Typography>
              </Paper>
            </Box>

            {/* Payment Input */}
            <TextField
              fullWidth
              label="Payment Amount"
              name="newPayment"
              type="number"
              value={paymentFormData.newPayment || ''}
              onChange={handlePaymentFormChange}
              sx={enhancedInputStyles}
              placeholder="Enter amount to pay"
              InputProps={{
                startAdornment: <Typography sx={{ mr: 1, color: '#667eea', fontWeight: 600 }}>₹</Typography>,
                inputProps: { min: 0, max: paymentFormData.newPayment }
              }}
            />

            {/* Payment Preview */}
            {paymentFormData.newPayment > 0 && (
              <Box sx={{ 
                p: 2, 
                borderRadius: '12px', 
                background: 'linear-gradient(135deg, #667eea10 0%, #764ba210 100%)',
                border: '1px dashed #667eea',
              }}>
                <Typography fontWeight={600} mb={1} color="#667eea">After Payment:</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>Total Paid:</Typography>
                  <Typography fontWeight={600} color="#2e7d32">
                    ₹{Math.min(totalAfterPayment, paymentFormData.totalFee).toLocaleString()}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>Remaining:</Typography>
                  <Typography fontWeight={600} color={pendingAfterPayment <= 0 ? '#2e7d32' : '#c62828'}>
                    ₹{Math.max(0, pendingAfterPayment).toLocaleString()}
                  </Typography>
                </Box>
                {pendingAfterPayment <= 0 && (
                  <Chip 
                    label="✓ Fee will be fully paid!" 
                    size="small" 
                    sx={{ 
                      mt: 1, 
                      background: 'linear-gradient(135deg, #4caf50, #81c784)',
                      color: 'white',
                      fontWeight: 600,
                    }} 
                  />
                )}
              </Box>
            )}

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
              <Button
                variant="outlined"
                onClick={handlePaymentModalClose}
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
                onClick={handlePaymentSave}
                disabled={paymentFormData.newPayment <= 0}
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
                  '&:disabled': {
                    background: '#e0e0e0',
                    boxShadow: 'none',
                  },
                }}
              >
                ✨ Confirm Payment
              </Button>
            </Box>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default StudentFeePanel;
