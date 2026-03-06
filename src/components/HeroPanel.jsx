import { Box, Typography } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

const HeroPanel = () => {
  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        background: 'linear-gradient(-45deg, #667eea, #764ba2, #6B73FF, #000DFF)',
        backgroundSize: '400% 400%',
        animation: 'gradientShift 15s ease infinite',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Floating elements */}
      <div className="floating-element" />
      <div className="floating-element" />
      <div className="floating-element" />
      <div className="floating-element" />

      {/* Main content card */}
      <Box
        className="glass-card"
        sx={{
          padding: { xs: '40px', md: '60px' },
          textAlign: 'center',
          maxWidth: '600px',
          zIndex: 1,
          position: 'relative',
        }}
      >
        {/* Institute Icon */}
        <Box
          sx={{
            width: 120,
            height: 120,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.1) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 30px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
            animation: 'pulse 3s ease-in-out infinite',
          }}
        >
          <SchoolIcon sx={{ fontSize: 60, color: '#fff' }} />
        </Box>

        <Typography
          variant="h2"
          sx={{
            color: '#fff',
            fontWeight: 800,
            fontSize: { xs: '2rem', md: '3rem' },
            marginBottom: 2,
            textShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
            letterSpacing: '-1px',
          }}
        >
          EduConnect
        </Typography>

        <Typography
          variant="h5"
          sx={{
            color: 'rgba(255, 255, 255, 0.9)',
            fontWeight: 400,
            fontSize: { xs: '1rem', md: '1.25rem' },
            marginBottom: 4,
            lineHeight: 1.6,
          }}
        >
          Empowering Education, Connecting Futures
        </Typography>

        {/* Feature cards */}
        <Box
          sx={{
            display: 'flex',
            gap: 3,
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginTop: 4,
          }}
        >
          <FeatureCard
            icon={<AutoStoriesIcon sx={{ fontSize: 32, color: '#fff' }} />}
            title="Learn"
            description="Access world-class courses"
          />
          <FeatureCard
            icon={<SchoolIcon sx={{ fontSize: 32, color: '#fff' }} />}
            title="Grow"
            description="Develop new skills"
          />
          <FeatureCard
            icon={<EmojiEventsIcon sx={{ fontSize: 32, color: '#fff' }} />}
            title="Achieve"
            description="Earn certifications"
          />
        </Box>
      </Box>

      {/* Bottom gradient overlay */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '200px',
          background: 'linear-gradient(to top, rgba(0,0,0,0.3) 0%, transparent 100%)',
          pointerEvents: 'none',
        }}
      />
    </Box>
  );
};

const FeatureCard = ({ icon, title, description }) => (
  <Box
    sx={{
      padding: '20px',
      background: 'rgba(255, 255, 255, 0.1)',
      borderRadius: '16px',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      minWidth: '140px',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
      '&:hover': {
        transform: 'translateY(-5px)',
        background: 'rgba(255, 255, 255, 0.2)',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
      },
    }}
  >
    {icon}
    <Typography
      sx={{
        color: '#fff',
        fontWeight: 600,
        fontSize: '1rem',
        marginTop: 1,
      }}
    >
      {title}
    </Typography>
    <Typography
      sx={{
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: '0.75rem',
        marginTop: 0.5,
      }}
    >
      {description}
    </Typography>
  </Box>
);

export default HeroPanel;
