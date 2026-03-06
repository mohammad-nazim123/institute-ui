import React from 'react';
import { TextField } from '@mui/material';

const InputField = React.memo(function InputField({
  label,
  name,
  value,
  onChange,
  required = false,
}) {
  console.log(label, 'rendered'); // test ke liye

  return (
    <TextField
      fullWidth
      label={label}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
    />
  );
});

export default InputField;