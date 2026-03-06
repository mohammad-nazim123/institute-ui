// Shared styles for admin panels

export const inputStyles = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    '&:hover fieldset': { borderColor: '#667eea' },
    '&.Mui-focused fieldset': { borderColor: '#667eea' },
  },
};

export const enhancedInputStyles = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    background: '#f8f9fc',
    transition: 'all 0.3s ease',
    '&:hover': {
      background: '#fff',
      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.1)',
    },
    '&:hover fieldset': { borderColor: '#667eea' },
    '&.Mui-focused': {
      background: '#fff',
      boxShadow: '0 4px 20px rgba(102, 126, 234, 0.15)',
    },
    '&.Mui-focused fieldset': { borderColor: '#667eea', borderWidth: '2px' },
  },
  '& .MuiInputLabel-root': {
    fontWeight: 500,
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: '#667eea',
  },
};
