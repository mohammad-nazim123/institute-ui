import { Box } from '@mui/material';
import HeroPanel from './HeroPanel';
import AuthPanel from './AuthPanel';
import { useEffect } from 'react';

const AuthPage = () => {
  useEffect(() => {
    document.title = 'EduConnect | Login';
  }, []);

  return (
    <Box
      sx={{
        display: 'flex',
        width: '100%',
        height: '100vh',
        overflow: 'hidden',
      }}
    >
      {/* Left Hero Panel - 65% */}
      <Box
        sx={{
          width: { xs: '0%', md: '65%' },
          display: { xs: 'none', md: 'block' },
          height: '100%',
          position: 'relative',
        }}
      >
        <HeroPanel />
      </Box>

      {/* Right Auth Panel - 35% */}
      <Box
        sx={{
          width: { xs: '100%', md: '35%' },
          minWidth: { md: '400px' },
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <AuthPanel />
      </Box>
    </Box>
  );
};

export default AuthPage;
