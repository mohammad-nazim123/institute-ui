import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Box,
  Typography,
  Checkbox,
  FormControlLabel,
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
import { signUp } from '../apis/auth_api';
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

const Signup = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState([]);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  });

  const handleInputChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors.length > 0) setErrors([]);
  };

  const validate = () => {
    const errs = [];
    if (formData.password.length < 8) errs.push('Password must be at least 8 characters');
    if (!/[A-Z]/.test(formData.password)) errs.push('Password must contain at least one capital letter');
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password))
      errs.push('Password must contain at least one symbol (!@#$%^&*...)');
    if (formData.password !== formData.confirmPassword) errs.push('Password does not match');
    if (!formData.agreeTerms) errs.push('You must agree to the Terms & Conditions');
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }
    try {
      const data = await signUp(formData.email, formData.password, formData.confirmPassword);
      console.log('signup token', data.data?.access, data.data?.refresh);
      if ([200, 201].includes(data.status)) {
        await setToken(data.data.access);
        await setRefreshToken(data.data.refresh);
        // Full reload so App.jsx re-reads encrypted storage for routing
        window.location.href = '/dashboard';
      }
    } catch (err) {
      console.error(err);
      setErrors(['Something went wrong. Please try again.']);
    }
  };

  const handleGoogleSignup = () => {
    console.log('Google Signup clicked');
    // TODO: Integrate Google OAuth for signup
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
            Create Account
          </Typography>
          <Typography sx={{ color: '#666', fontSize: '0.95rem' }}>
            Join us and start your educational adventure
          </Typography>
        </Box>

        {/* Signup Form */}
        <Box
          component="form"
          // onSubmit={handleSubmit}
          className="auth-form-enter"
          sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}
        >
          {/* Validation Errors */}
          {errors.length > 0 && (
            <Alert severity="error" sx={{ borderRadius: '12px', '& .MuiAlert-message': { width: '100%' } }}>
              <Box component="ul" sx={{ margin: 0, paddingLeft: 2 }}>
                {errors.map((error, index) => (
                  <li key={index} style={{ marginBottom: index < errors.length - 1 ? '4px' : 0 }}>
                    {error}
                  </li>
                ))}
              </Box>
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

          {/* Confirm Password */}
          <TextField
            name="confirmPassword"
            label="Confirm Password"
            type={showConfirmPassword ? 'text' : 'password'}
            value={formData.confirmPassword}
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
                  <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end" size="small">
                    {showConfirmPassword ? <VisibilityOff sx={{ color: '#999' }} /> : <Visibility sx={{ color: '#999' }} />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={textFieldStyles}
          />

          {/* Terms */}
          <FormControlLabel
            sx={{ alignItems: 'flex-start', margin: 0 }}
            control={
              <Checkbox
                name="agreeTerms"
                checked={formData.agreeTerms}
                onChange={handleInputChange}
                sx={{ color: '#667eea', '&.Mui-checked': { color: '#667eea' }, paddingTop: 0 }}
              />
            }
            label={
              <Typography sx={{ fontSize: '0.875rem', color: '#666' }}>
                I agree to the{' '}
                <Link href="#" sx={{ color: '#667eea', fontWeight: 500 }}>
                  Terms & Conditions
                </Link>
                <Typography component="span" sx={{ color: '#d32f2f', ml: 0.5 }}>*</Typography>
              </Typography>
            }
          />

          {/* Submit */}
          <Button
            type="submit"
            variant="contained"
            fullWidth
            onClick={handleSubmit}
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
            Create Account
          </Button>

          {/* Divider */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, my: 1 }}>
            <Divider sx={{ flex: 1 }} />
            <Typography sx={{ color: '#999', fontSize: '0.875rem' }}>or continue with</Typography>
            <Divider sx={{ flex: 1 }} />
          </Box>

          {/* Google Signup */}
          <Button
            variant="outlined"
            fullWidth
            onClick={handleGoogleSignup}
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
            Sign up with Google
          </Button>

          {/* Switch to Login */}
          <Box sx={{ textAlign: 'center', marginTop: 2 }}>
            <Typography sx={{ color: '#666', fontSize: '0.95rem' }}>
              Already have an account?{' '}
              <Link
                component="button"
                type="button"
                onClick={() => navigate('/')}
                sx={{
                  color: '#667eea',
                  fontWeight: 600,
                  textDecoration: 'none',
                  cursor: 'pointer',
                  '&:hover': { color: '#764ba2', textDecoration: 'underline' },
                }}
              >
                Sign In
              </Link>
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Signup;
