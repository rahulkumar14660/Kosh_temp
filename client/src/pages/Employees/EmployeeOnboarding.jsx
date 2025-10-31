import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Box,
  Button,
  Container,
  Step,
  StepLabel,
  Stepper,
  Typography,
  Paper,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Divider,
  IconButton,
  Avatar,
} from '@mui/material';
import {
  Person as PersonIcon,
  Work as WorkIcon,
  ContactMail as ContactIcon,
  CloudUpload as CloudUploadIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import axios from 'axios';

const steps = ['Personal Information', 'Employment Details'];

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const validationSchema = [
  Yup.object({
    firstName: Yup.string().required('First name is required'),
    lastName: Yup.string().required('Last name is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    phone: Yup.string().required('Phone is required'),
    dateOfBirth: Yup.date().required('Date of birth is required'),
    gender: Yup.string().required('Gender is required'),
    address: Yup.string().required('Address is required'),
    city: Yup.string().required('City is required'),
    state: Yup.string().required('State is required'),
    country: Yup.string().required('Country is required'),
    postalCode: Yup.string().required('Postal code is required'),
  }),
  Yup.object({
    employmentType: Yup.string().required('Employment type is required'),
    joiningDate: Yup.date().required('Joining date is required'),
    department: Yup.string().required('Department is required'),
    designation: Yup.string().required('Designation is required'),
    manager: Yup.string().required('Manager is required'),
    team: Yup.string().required('Team is required'),
    workLocation: Yup.string().required('Work location is required'),
    salary: Yup.number().required('Salary is required').positive('Must be positive'),
  }),
];

const EmployeeOnboarding = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: null,
      gender: '',
      address: '',
      city: '',
      state: '',
      country: '',
      postalCode: '',

      employmentType: 'Full-time',
      joiningDate: null,
      department: '',
      designation: '',
      manager: '',
      team: '',
      workLocation: '',
      salary: '',
    },
    validationSchema: validationSchema[activeStep],
    onSubmit: async (values, { setSubmitting }) => {
      if (activeStep === steps.length - 1) {
        try {
          const formData = new FormData();

          Object.entries(values).forEach(([key, value]) => {
            if (value instanceof Date) {
              formData.append(key, value.toISOString());
            } else if (value !== null && value !== undefined) {
              formData.append(key, value);
            }
          });

          if (avatar) {
            formData.append('avatar', avatar);
          }
          const apiUrl = import.meta.env.VITE_API_URL;
          
          const response = await axios.post(
            `${apiUrl}/api/v1/user/register/employee`, 
            formData,
            {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
              withCredentials: true, 
            }
          );

          toast.success('Employee onboarded successfully!');
          navigate('/employees');
        } catch (error) {
          console.error('Error submitting form:', error);
          setError(error.response?.data?.message || 'Error submitting form');
          toast.error(error.response?.data?.message || 'Error submitting form');
        } finally {
          setSubmitting(false);
        }
      } else {
        setActiveStep((prevStep) => prevStep + 1);
        setSubmitting(false);
      }
    },
  });

  const handleBack = () => {
    setError('');
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
              <Box sx={{ position: 'relative' }}>
                <Avatar
                  src={avatarPreview}
                  sx={{ width: 120, height: 120, cursor: 'pointer' }}
                  onClick={() => document.getElementById('avatar-upload').click()}
                >
                  <PersonIcon sx={{ fontSize: 60 }} />
                </Avatar>
                <VisuallyHiddenInput
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                />
                <IconButton
                  color="primary"
                  aria-label="upload picture"
                  component="span"
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    backgroundColor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    },
                  }}
                  onClick={() => document.getElementById('avatar-upload').click()}
                >
                  <CloudUploadIcon />
                </IconButton>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="firstName"
                name="firstName"
                label="First Name"
                value={formik.values.firstName}
                onChange={formik.handleChange}
                error={formik.touched.firstName && Boolean(formik.errors.firstName)}
                helperText={formik.touched.firstName && formik.errors.firstName}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="lastName"
                name="lastName"
                label="Last Name"
                value={formik.values.lastName}
                onChange={formik.handleChange}
                error={formik.touched.lastName && Boolean(formik.errors.lastName)}
                helperText={formik.touched.lastName && formik.errors.lastName}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="email"
                name="email"
                label="Email"
                type="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="phone"
                name="phone"
                label="Phone Number"
                value={formik.values.phone}
                onChange={formik.handleChange}
                error={formik.touched.phone && Boolean(formik.errors.phone)}
                helperText={formik.touched.phone && formik.errors.phone}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Date of Birth"
                  value={formik.values.dateOfBirth}
                  onChange={(date) => formik.setFieldValue('dateOfBirth', date)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      error={formik.touched.dateOfBirth && Boolean(formik.errors.dateOfBirth)}
                      helperText={formik.touched.dateOfBirth && formik.errors.dateOfBirth}
                    />
                  )}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={formik.touched.gender && Boolean(formik.errors.gender)}>
                <InputLabel id="gender-label">Gender</InputLabel>
                <Select
                  labelId="gender-label"
                  id="gender"
                  name="gender"
                  value={formik.values.gender}
                  label="Gender"
                  onChange={formik.handleChange}
                >
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                  <MenuItem value="Prefer not to say">Prefer not to say</MenuItem>
                </Select>
                {formik.touched.gender && formik.errors.gender && (
                  <FormHelperText>{formik.errors.gender}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                id="address"
                name="address"
                label="Address"
                multiline
                rows={2}
                value={formik.values.address}
                onChange={formik.handleChange}
                error={formik.touched.address && Boolean(formik.errors.address)}
                helperText={formik.touched.address && formik.errors.address}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                id="city"
                name="city"
                label="City"
                value={formik.values.city}
                onChange={formik.handleChange}
                error={formik.touched.city && Boolean(formik.errors.city)}
                helperText={formik.touched.city && formik.errors.city}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                id="state"
                name="state"
                label="State/Province"
                value={formik.values.state}
                onChange={formik.handleChange}
                error={formik.touched.state && Boolean(formik.errors.state)}
                helperText={formik.touched.state && formik.errors.state}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                id="country"
                name="country"
                label="Country"
                value={formik.values.country}
                onChange={formik.handleChange}
                error={formik.touched.country && Boolean(formik.errors.country)}
                helperText={formik.touched.country && formik.errors.country}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="postalCode"
                name="postalCode"
                label="Postal Code"
                value={formik.values.postalCode}
                onChange={formik.handleChange}
                error={formik.touched.postalCode && Boolean(formik.errors.postalCode)}
                helperText={formik.touched.postalCode && formik.errors.postalCode}
              />
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={formik.touched.employmentType && Boolean(formik.errors.employmentType)}>
                <InputLabel id="employment-type-label">Employment Type</InputLabel>
                <Select
                  labelId="employment-type-label"
                  id="employmentType"
                  name="employmentType"
                  value={formik.values.employmentType}
                  label="Employment Type"
                  onChange={formik.handleChange}
                >
                  <MenuItem value="Full-time">Full-time</MenuItem>
                  <MenuItem value="Part-time">Part-time</MenuItem>
                  <MenuItem value="Contract">Contract</MenuItem>
                  <MenuItem value="Internship">Internship</MenuItem>
                </Select>
                {formik.touched.employmentType && formik.errors.employmentType && (
                  <FormHelperText>{formik.errors.employmentType}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Joining Date"
                  value={formik.values.joiningDate}
                  onChange={(date) => formik.setFieldValue('joiningDate', date)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      error={formik.touched.joiningDate && Boolean(formik.errors.joiningDate)}
                      helperText={formik.touched.joiningDate && formik.errors.joiningDate}
                    />
                  )}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={formik.touched.department && Boolean(formik.errors.department)}>
                <InputLabel id="department-label">Department</InputLabel>
                <Select
                  labelId="department-label"
                  id="department"
                  name="department"
                  value={formik.values.department}
                  label="Department"
                  onChange={formik.handleChange}
                >
                  <MenuItem value="Engineering">Engineering</MenuItem>
                  <MenuItem value="HR">Human Resources</MenuItem>
                  <MenuItem value="Finance">Finance</MenuItem>
                  <MenuItem value="Marketing">Marketing</MenuItem>
                  <MenuItem value="Sales">Sales</MenuItem>
                  <MenuItem value="Operations">Operations</MenuItem>
                  <MenuItem value="IT">IT</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
                {formik.touched.department && formik.errors.department && (
                  <FormHelperText>{formik.errors.department}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="designation"
                name="designation"
                label="Designation"
                value={formik.values.designation}
                onChange={formik.handleChange}
                error={formik.touched.designation && Boolean(formik.errors.designation)}
                helperText={formik.touched.designation && formik.errors.designation}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="manager"
                name="manager"
                label="Manager"
                value={formik.values.manager}
                onChange={formik.handleChange}
                error={formik.touched.manager && Boolean(formik.errors.manager)}
                helperText={formik.touched.manager && formik.errors.manager}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="team"
                name="team"
                label="Team"
                value={formik.values.team}
                onChange={formik.handleChange}
                error={formik.touched.team && Boolean(formik.errors.team)}
                helperText={formik.touched.team && formik.errors.team}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="workLocation"
                name="workLocation"
                label="Work Location"
                value={formik.values.workLocation}
                onChange={formik.handleChange}
                error={formik.touched.workLocation && Boolean(formik.errors.workLocation)}
                helperText={formik.touched.workLocation && formik.errors.workLocation}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="salary"
                name="salary"
                label="Salary (Annual)"
                type="number"
                value={formik.values.salary}
                onChange={formik.handleChange}
                error={formik.touched.salary && Boolean(formik.errors.salary)}
                helperText={formik.touched.salary && formik.errors.salary}
                InputProps={{
                  startAdornment: <span style={{ marginRight: 8 }}>$</span>,
                }}
              />
            </Grid>
          </Grid>
        );
      default:
        return 'Unknown step';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          New Employee Onboarding
        </Typography>
      </Box>

      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box component="form" onSubmit={formik.handleSubmit} noValidate>
          {renderStepContent(activeStep)}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              variant="outlined"
              startIcon={<ArrowBackIcon />}
            >
              Back
            </Button>

            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={formik.isSubmitting}
            >
              {activeStep === steps.length - 1 ? 'Submit' : 'Next'}
            </Button>
          </Box>
            {error && <p style={{ color: 'red', textAlign: 'right', margin: '15px 0 0 0'}}>{error}</p>}
        </Box>
      </Paper>
    </Container>
  );
};

export default EmployeeOnboarding;
