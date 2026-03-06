import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Box,
  Typography,
  Link,
  Divider,
  Alert,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Google as GoogleIcon,
  Email as EmailIcon,
  Lock as LockIcon,
} from '@mui/icons-material';
import { signIn } from '../apis/auth_api';
import { setToken, setRefreshToken } from '../../utils/storage';
import HeroPanel from '../HeroPanel';

/* ───────── Shared TextField Styles ───────── */
const textFieldStyles = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    backgroundColor: '#fff',
    transition: 'all 0.3s ease',
    '& fieldset': { borderColor: '#e0e0e0', transition: 'all 0.3s ease' },
    '&:hover fieldset': { borderColor: '#667eea' },
    '&.Mui-focused fieldset': {
      borderColor: '#667eea',
      boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)',
    },
  },
  '& .MuiInputLabel-root': {
    color: '#666',
    '&.Mui-focused': { color: '#667eea' },
  },
};

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await signIn(formData.email, formData.password);
      console.log("status", data.status);
      if ([200, 201].includes(data.status)) {
        await setToken(data.data.access);
        await setRefreshToken(data.data.refresh);
        // Full reload so App.jsx re-reads encrypted storage for routing
        window.location.href = '/dashboard';
      } else {
        setError('Invalid email or password. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setError('Invalid email or password. Please try again.');
    }
  };

  const handleGoogleLogin = () => {
    console.log('Google Login clicked');
    // TODO: Integrate Google OAuth for login
    navigate('/dashboard');
  };

  return (
    <Box sx={{ display: 'flex', width: '100%', height: '100vh', overflow: 'hidden' }}>
      {/* Left Hero Panel — 65% */}
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

      {/* Right Auth Panel — 35% */}
      <Box
        sx={{
          width: { xs: '100%', md: '35%' },
          minWidth: { md: '400px' },
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          background: 'linear-gradient(180deg, #f8f9fc 0%, #ffffff 100%)',
          padding: { xs: '30px', md: '40px' },
          overflowY: 'auto',
        }}
      >
        {/* Header */}
        <Box sx={{ textAlign: 'center', marginBottom: 4 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: '#1a1a2e',
              marginBottom: 1,
              fontSize: { xs: '1.75rem', md: '2rem' },
            }}
          >
            Welcome Back!
          </Typography>
          <Typography sx={{ color: '#666', fontSize: '0.95rem' }}>
            Sign in to continue your learning journey
          </Typography>
        </Box>

        {/* Login Form */}
        <Box
          component="form"
          onSubmit={handleSubmit}
          className="auth-form-enter"
          sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}
        >
          {/* Error */}
          {error && (
            <Alert severity="error" sx={{ borderRadius: '12px' }}>
              {error}
            </Alert>
          )}

          {/* Email */}
          <TextField
            name="email"
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            fullWidth
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon sx={{ color: '#667eea' }} />
                </InputAdornment>
              ),
            }}
            sx={textFieldStyles}
          />

          {/* Password */}
          <TextField
            name="password"
            label="Password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={handleInputChange}
            fullWidth
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon sx={{ color: '#667eea' }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                    {showPassword ? <VisibilityOff sx={{ color: '#999' }} /> : <Visibility sx={{ color: '#999' }} />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={textFieldStyles}
          />

          {/* Forgot Password */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
            <Link
              href="#"
              underline="hover"
              sx={{ color: '#667eea', fontSize: '0.875rem', fontWeight: 500, '&:hover': { color: '#764ba2' } }}
            >
              Forgot Password?
            </Link>
          </Box>

          {/* Submit */}
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{
              padding: '14px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              fontSize: '1rem',
              fontWeight: 600,
              textTransform: 'none',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
              transition: 'all 0.3s ease',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                boxShadow: '0 6px 20px rgba(102, 126, 234, 0.5)',
                transform: 'translateY(-2px)',
              },
            }}
          >
            Sign In
          </Button>

          {/* Divider */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, my: 1 }}>
            <Divider sx={{ flex: 1 }} />
            <Typography sx={{ color: '#999', fontSize: '0.875rem' }}>or continue with</Typography>
            <Divider sx={{ flex: 1 }} />
          </Box>

          {/* Google Login */}
          <Button
            variant="outlined"
            fullWidth
            onClick={handleGoogleLogin}
            startIcon={
              <GoogleIcon
                sx={{
                  background: 'linear-gradient(135deg, #4285F4, #EA4335, #FBBC05, #34A853)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              />
            }
            sx={{
              padding: '12px',
              borderRadius: '12px',
              borderColor: '#e0e0e0',
              color: '#333',
              fontSize: '0.95rem',
              fontWeight: 500,
              textTransform: 'none',
              transition: 'all 0.3s ease',
              '&:hover': {
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.05)',
                transform: 'translateY(-2px)',
              },
            }}
          >
            Sign in with Google
          </Button>

          {/* Switch to Signup */}
          <Box sx={{ textAlign: 'center', marginTop: 2 }}>
            <Typography sx={{ color: '#666', fontSize: '0.95rem' }}>
              Don't have an account?{' '}
              <Link
                component="button"
                type="button"
                onClick={() => navigate('/signup')}
                sx={{
                  color: '#667eea',
                  fontWeight: 600,
                  textDecoration: 'none',
                  cursor: 'pointer',
                  '&:hover': { color: '#764ba2', textDecoration: 'underline' },
                }}
              >
                Sign Up
              </Link>
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Login;
