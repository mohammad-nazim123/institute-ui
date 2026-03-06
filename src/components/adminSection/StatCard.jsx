import { Box, Paper, Typography } from '@mui/material';

const StatCard = ({ title, value, color, icon }) => (
  <Paper
    sx={{
      p: 3,
      borderRadius: '20px',
      boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
      display: 'flex',
      alignItems: 'center',
      gap: 3,
    }}
  >
    <Box
      sx={{
        width: 60,
        height: 60,
        borderRadius: '16px',
        background: `linear-gradient(135deg, ${color}20 0%, ${color}10 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: color,
      }}
    >
      {icon}
    </Box>
    <Box>
      <Typography sx={{ color: '#666', fontSize: '0.85rem', mb: 0.5 }}>{title}</Typography>
      <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: '#1a1a2e' }}>{value}</Typography>
    </Box>
  </Paper>
);

export default StatCard;
