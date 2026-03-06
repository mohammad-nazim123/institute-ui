import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Card,
  CardContent,
  Avatar,
  Grid,
} from '@mui/material';
import {
  CheckCircle as PresentIcon,
  Cancel as AbsentIcon,
} from '@mui/icons-material';
import PanelHeader from './PanelHeader';
import { studentsData } from './data';
import { inputStyles } from './styles';

const TakeAttendancePanel = () => {
  const [attendance, setAttendance] = useState(
    studentsData.map((s) => ({ ...s, present: false }))
  );

  const toggleAttendance = (id) => {
    setAttendance(attendance.map((s) =>
      s.id === id ? { ...s, present: !s.present } : s
    ));
  };

  return (
    <Box>
      <PanelHeader
        title="Take Attendance"
        subtitle="Professors can mark student attendance here"
        gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
      />
      <Paper sx={{ borderRadius: '20px', boxShadow: '0 10px 40px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
        <Box sx={{ p: 3, borderBottom: '1px solid #eee', display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            select
            label="Select Course"
            size="small"
            defaultValue=""
            sx={{ ...inputStyles, width: 200 }}
            SelectProps={{ native: true }}
          >
            <option value="">All Courses</option>
            <option value="cs">Computer Science</option>
            <option value="math">Mathematics</option>
            <option value="physics">Physics</option>
          </TextField>
          <TextField
            type="date"
            size="small"
            defaultValue={new Date().toISOString().split('T')[0]}
            sx={{ ...inputStyles, width: 180 }}
          />
          <Box sx={{ flex: 1 }} />
          <Button
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              borderRadius: '10px',
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Submit Attendance
          </Button>
        </Box>
        <Box sx={{ p: 3 }}>
          <Grid container spacing={2}>
            {attendance.map((student) => (
              <Grid item xs={12} sm={6} md={4} key={student.id}>
                <Card
                  onClick={() => toggleAttendance(student.id)}
                  sx={{
                    borderRadius: '16px',
                    cursor: 'pointer',
                    border: student.present ? '2px solid #2e7d32' : '2px solid #eee',
                    background: student.present ? 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)' : '#fff',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                    },
                  }}
                >
                  <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar
                      sx={{
                        background: student.present
                          ? 'linear-gradient(135deg, #2e7d32 0%, #43a047 100%)'
                          : 'linear-gradient(135deg, #9e9e9e 0%, #bdbdbd 100%)',
                      }}
                    >
                      {student.name[0]}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography fontWeight={600}>{student.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {student.course}
                      </Typography>
                    </Box>
                    {student.present ? (
                      <PresentIcon sx={{ color: '#2e7d32', fontSize: 28 }} />
                    ) : (
                      <AbsentIcon sx={{ color: '#ccc', fontSize: 28 }} />
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
};

export default TakeAttendancePanel;
