import { Box, Typography } from '@mui/material';

const PanelHeader = ({ title, subtitle, gradient }) => (
  <Box sx={{ mb: 4 }}>
    <Typography
      variant="h4"
      sx={{
        fontWeight: 800,
        background: gradient,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        mb: 1,
      }}
    >
      {title}
    </Typography>
    <Typography sx={{ color: '#666', fontSize: '1rem' }}>{subtitle}</Typography>
  </Box>
);

export default PanelHeader;
