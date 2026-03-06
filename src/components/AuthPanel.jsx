import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import { signUp, signIn } from './apis/api';
import Login from './auth/Login';
import Signup from './auth/Signup';

const AuthPanel = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState([]);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    rememberMe: false,
    agreeTerms: false,
  });

  const handleInputChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear errors when user starts typing
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const validateSignup = () => {
    const newErrors = [];
    const password = formData.password;

    // Password length check
    if (password.length < 5) {
      newErrors.push('Password must be at least 5 characters');
    }

    // Capital letter check
    if (!/[A-Z]/.test(password)) {
      newErrors.push('Password must contain at least one capital letter');
    }

    // Symbol check
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      newErrors.push('Password must contain at least one symbol (!@#$%^&*...)');
    }

    // Password confirmation check
    if (formData.password !== formData.confirmPassword) {
      newErrors.push('Password does not match');
    }

    // Terms checkbox check
    if (!formData.agreeTerms) {
      newErrors.push('You must agree to the Terms & Conditions');
    }

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!isLogin) {
      const validationErrors = validateSignup();
      if (validationErrors.length > 0) {
        setErrors(validationErrors);
        return;
      }
      signUp(
        formData.email,
        formData.password,
        formData.fullName,
        formData.confirmPassword
      )
        .then((data) => {
          console.log('token', data);
          navigate('/dashboard');
        })
        .catch((err) => console.error(err));
    } else {
      signIn(formData.email, formData.password)
        .then((data) => {
          console.log('token', data);
          navigate('/dashboard');
        })
        .catch((err) => console.error(err));
    }

    console.log('Form submitted:', formData);
  };

  const handleGoogleLogin = () => {
    console.log('Google login clicked');
    // Redirect to dashboard for Google login as well
    navigate('/dashboard');
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setErrors([]);
    setFormData({
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      rememberMe: false,
      agreeTerms: false,
    });
  };

  // Shared TextField styles
  const textFieldStyles = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '12px',
      backgroundColor: '#fff',
      transition: 'all 0.3s ease',
      '& fieldset': {
        borderColor: '#e0e0e0',
        transition: 'all 0.3s ease',
      },
      '&:hover fieldset': {
        borderColor: '#667eea',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#667eea',
        boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)',
      },
    },
    '& .MuiInputLabel-root': {
      color: '#666',
      '&.Mui-focused': {
        color: '#667eea',
      },
    },
  };

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        background: 'linear-gradient(180deg, #f8f9fc 0%, #ffffff 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
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
          {isLogin ? 'Welcome Back!' : 'Create Account'}
        </Typography>
        <Typography
          sx={{
            color: '#666',
            fontSize: '0.95rem',
          }}
        >
          {isLogin
            ? 'Sign in to continue your learning journey'
            : 'Join us and start your educational adventure'}
        </Typography>
      </Box>

      {/* Form */}
      {isLogin ? (
        <Login
          formData={formData}
          handleInputChange={handleInputChange}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          handleSubmit={handleSubmit}
          handleGoogleLogin={handleGoogleLogin}
          toggleAuthMode={toggleAuthMode}
          textFieldStyles={textFieldStyles}
        />
      ) : (
        <Signup
          formData={formData}
          handleInputChange={handleInputChange}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          showConfirmPassword={showConfirmPassword}
          setShowConfirmPassword={setShowConfirmPassword}
          handleSubmit={handleSubmit}
          handleGoogleLogin={handleGoogleLogin}
          toggleAuthMode={toggleAuthMode}
          errors={errors}
          textFieldStyles={textFieldStyles}
        />
      )}
    </Box>
  );
};

export default AuthPanel;
