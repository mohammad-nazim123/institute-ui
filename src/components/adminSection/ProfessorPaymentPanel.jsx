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
  InputAdornment,
} from '@mui/material';
import {
  Psychology as ProfessorIcon,
  Payment as FeeIcon,
  Payments as PaymentIcon,
  ExpandMore as ExpandMoreIcon,
  School as SchoolIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import StatCard from './StatCard';
import { professorsData as initialProfessorsData } from './data';
import { enhancedInputStyles } from './styles';
import { getProfessors } from '../apis/professors_api';
import { addPayments,getPayments } from '../apis/payments_apis';

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

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const ProfessorPaymentPanel = () => {
  const [professorsData, setProfessorsData] = useState(initialProfessorsData);
  const [expandedPanels, setExpandedPanels] = useState({});
  const [selectedPayment, setSelectedPayment] = useState({ profId: null, month: null });
  const [searchQuery, setSearchQuery] = useState('');
  const [allProfessors, setAllProfessors] = useState([]);
  const [allPayments, setAllPayments] = useState([]);

  // Group professors by department
  const professorsByDept = useMemo(() => {
    // Filter by search query first
    const filteredProps = allProfessors.filter(prof => {
      console.log("lowerQuery",prof)
      if (!searchQuery) return true;
      const lowerQuery = searchQuery.toLowerCase();
      return (
        prof.name.toLowerCase().includes(lowerQuery) ||
        prof.experience.department.toLowerCase().includes(lowerQuery) ||
        prof.email.toLowerCase().includes(lowerQuery)
      );
    });

    const grouped = filteredProps.reduce((acc, prof) => {
      if (!acc[prof.experience.department]) {
        acc[prof.experience.department] = [];
      }
      acc[prof.experience.department].push(prof);
      return acc;
    }, {});

    // Sort professors within each department by name
    Object.keys(grouped).forEach(dept => {
      grouped[dept].sort((a, b) => a.name.localeCompare(b.name));
    });

    return grouped;
  }, [allProfessors, searchQuery]);

  // Calculate totals
  const totals = useMemo(() => {
    let totalSalaries = 0;
    let totalPaid = 0;
    allProfessors.forEach(p => {
       totalSalaries += p.salary * 12; // Annual
       totalPaid += p.salary * (p.paidMonths ? p.paidMonths.length : 0);
    });
    const pendingAmount = totalSalaries - totalPaid;
    const fullyPaidProfessors = professorsData.filter(p => p.paidMonths && p.paidMonths.length === 12).length;
    return { totalSalaries, totalPaid, pendingAmount, paidProfessors: fullyPaidProfessors, totalProfessors: professorsData.length };
  }, [allProfessors]);

  const handleAccordionChange = (dept) => (event, isExpanded) => {
    setExpandedPanels(prev => ({
      ...prev,
      [dept]: isExpanded,
    }));
  };

  const getColorScheme = (dept) => defaultColor;

  const handlePaymentClick = (profId) => {
    if (selectedPayment.profId === profId && selectedPayment.month) {
      console.log("profId",selectedPayment)
      
      const targetProf = allProfessors.find(p => p.id === profId);
      const salary = targetProf?.admin_employement?.salary || 0;
      addPayments(profId, selectedPayment.month, new Date().toISOString().split('T')[0], salary, 'paid');

      setProfessorsData(prev => prev.map(p => {
        if (p.id === profId) {
          const updatedMonths = [...(p.paidMonths || [])];
          if (!updatedMonths.includes(selectedPayment.month)) {
            updatedMonths.push(selectedPayment.month);
          }
          return { ...p, paidMonths: updatedMonths };
        }
        return p;
      }));

      setAllProfessors(prev => prev.map(p => {
        if (p.id === profId) {
          const updatedMonths = [...(p.paidMonths || [])];
          if (!updatedMonths.includes(selectedPayment.month)) {
            updatedMonths.push(selectedPayment.month);
          }
          return { ...p, paidMonths: updatedMonths };
        }
        return p;
      }));

      setAllPayments(prev => [...prev, {
        professor: profId,
        month_year: selectedPayment.month,
        payment_status: 'paid',
        payment_amount: salary,
      }]);

      setSelectedPayment({ profId: null, month: null });
    }
  };

  function getAllProfessor(){
    getProfessors().then(res => {
      if(res.status === 200){
        console.log("all professors",res.data[0].professors)
        setAllProfessors(res.data[0].professors);
      }
    })
  }

  function getAllPayments(){
    getPayments().then(res => {
      if(res.status === 200){
        if(res.body.length > 0){
          console.log("all payments",res.body[0].professors_payments)
          setAllPayments(res?.body[0].professors_payments);
        }
      }
    })
  }

  useEffect(()=>{
    getAllProfessor();
    getAllPayments();
  },[])

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
            justifyContent: 'space-between',
            gap: 2,
            flexWrap: 'wrap',
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
                Professor Payments
              </Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem' }}>
                Track and manage professor salary payments grouped by department
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ width: { xs: '100%', md: '300px' } }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search professor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'rgba(255,255,255,0.8)' }} />
                  </InputAdornment>
                ),
                sx: { 
                    bgcolor: 'rgba(255,255,255,0.15)',
                    borderRadius: '12px',
                    color: '#fff',
                    '& input::placeholder': { color: 'rgba(255,255,255,0.7)', opacity: 1 },
                    '& fieldset': { border: 'none' },
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                        bgcolor: 'rgba(255,255,255,0.25)',
                    },
                    '&.Mui-focused': {
                        bgcolor: 'rgba(255,255,255,0.3)',
                        boxShadow: '0 0 0 2px rgba(255,255,255,0.5)',
                    }
                }
              }}
            />
          </Box>
        </Box>
      </Paper>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* <Grid item xs={12} md={4}>
          <StatCard title="Total Salaries" value={`₹${totals.totalSalaries.toLocaleString()}`} color="#f5576c" icon={<PaymentIcon />} />
        </Grid> */}
        {/* <Grid item xs={12} md={4}>
          <StatCard title="Paid Amount" value={`₹${totals.totalPaid.toLocaleString()}`} color="#00c853" icon={<FeeIcon />} />
        </Grid> */}
        {/* <Grid item xs={12} md={4}>
          <StatCard title="Pending" value={`₹${totals.pendingAmount.toLocaleString()}`} color="#ff9800" icon={<ProfessorIcon />} />
        </Grid> */}
      </Grid>

      {/* Department-wise Accordions */}
      {Object.entries(professorsByDept).map(([dept, professors]) => {
        if (professors.length === 0) return null;
        const colorScheme = getColorScheme(dept);
        console.log("proff",professors,dept)
        const deptPaid = professors.reduce((sum, p) => sum + (p.admin_employement.salary * (p.paidMonths ? p.paidMonths.length : 0)), 0);
        const deptSalary = professors.reduce((sum, p) => sum + (p.admin_employement.salary * 12), 0);

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
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="h6"
                  sx={{ color: 'white', fontWeight: 700 }}
                >
                  {dept}
                </Typography>
                {/* <Typography
                  variant="body2"
                  sx={{ color: 'rgba(255,255,255,0.85)' }}
                >
                  {professors.length} professor{professors.length !== 1 ? 's' : ''} • ₹{deptPaid.toLocaleString()} / ₹{deptSalary.toLocaleString()} paid
                </Typography> */}
              </Box>
            </AccordionSummary>

            <AccordionDetails sx={{ p: 0 }}>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ background: colorScheme.light }}>
                      <TableCell sx={{ fontWeight: 700, width: '20%', textAlign: 'start' }}><Typography sx={{fontWeight:700,fontSize:14,marginLeft:'10px'}}>Professor</Typography></TableCell>
                      <TableCell sx={{ fontWeight: 700, width: '10%', textAlign: 'start' }}>Salary</TableCell>
                      <TableCell sx={{ fontWeight: 700, width: '65%', textAlign: 'center' }}>Months</TableCell>
                      <TableCell sx={{ fontWeight: 700, width: '5%', textAlign: 'center' }}>Action</TableCell>
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
                          },
                        }}
                      >
                        <TableCell sx={{ textAlign: 'start' }} align='start'>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'start',marginLeft:'10px' }}>
                            <Box>
                              <Typography fontWeight={600}>{prof.name}</Typography>
                              {/* <Typography variant="caption" color="text.secondary">{prof.department}</Typography> */}
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ textAlign: 'start', fontWeight: 600 }}>
                          ₹{prof.admin_employement?prof.admin_employement.salary.toLocaleString():"0"}
                        </TableCell>
                        
                        <TableCell sx={{ textAlign: 'left', py: 1.5 }}>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {months.map((m, index) => {
                              const currentYear = new Date().getFullYear();
                              const formattedMonth = `${currentYear}-${String(index + 1).padStart(2, '0')}`;
                              
                              const apiPaid = allPayments.some(payment => 
                                (payment.professor === prof.id || payment.professor?.id === prof.id) && 
                                payment.month_year === formattedMonth && 
                                payment.payment_status?.toLowerCase() === 'paid'
                              );
                              
                              const isPaid = apiPaid || prof.paidMonths?.includes(formattedMonth) || prof.paidMonths?.includes(m);
                              const isSelected = selectedPayment.profId === prof.id && selectedPayment.month === formattedMonth;
                              return (
                                <Chip
                                  key={m}
                                  label={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                      {m}
                                      {isPaid && <CheckCircleIcon sx={{ fontSize: 16 }} />}
                                    </Box>
                                  }
                                  onClick={!isPaid ? () => setSelectedPayment({ profId: prof.id, month: formattedMonth }) : undefined}
                                  sx={{
                                    cursor: isPaid ? 'default' : 'pointer',
                                    fontWeight: 600,
                                    border: isPaid ? 'none' : isSelected ? `2px solid #f5576c` : '1px solid #e0e0e0',
                                    background: isPaid ? 'rgba(76, 175, 80, 0.1)' : isSelected ? 'rgba(245, 87, 108, 0.1)' : 'transparent',
                                    color: isPaid ? '#2e7d32' : isSelected ? '#f5576c' : 'text.secondary',
                                    transition: 'all 0.2s',
                                    '&:hover': !isPaid ? { border: `2px solid #f5576c`, background: 'rgba(245, 87, 108, 0.05)', color: '#f5576c' } : {},
                                  }}
                                />
                              );
                            })}
                          </Box>
                        </TableCell>

                        <TableCell sx={{ textAlign: 'center' }}>
                          <Button
                            size="small"
                            variant="contained"
                            disabled={selectedPayment.profId !== prof.id}
                            onClick={() => handlePaymentClick(prof.id)}
                            sx={{
                              borderRadius: '8px',
                              textTransform: 'none',
                              fontWeight: 600,
                              background: colorScheme.gradient,
                              minWidth: '70px',
                              '&:hover': {
                                transform: 'translateY(-1px)',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                              },
                              '&.Mui-disabled': {
                                background: '#e0e0e0',
                                color: '#9e9e9e'
                              }
                            }}
                          >
                            Pay
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
    </Box>
  );
};

export default ProfessorPaymentPanel;
