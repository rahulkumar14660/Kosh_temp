import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Grid,
  Avatar,
  IconButton,
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText
} from '@mui/material';
import { ArrowBack, CloudUpload, Refresh } from '@mui/icons-material';
import { AuthContext } from '../../context/AuthContext';

const EditProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [employee, setEmployee] = useState(null);
  const apiUrl = import.meta.env.VITE_API_URL;
  const {isAdmin, user} = useContext(AuthContext);
  const [error, setError] = useState('');

  const validationSchema = Yup.object({
    name: Yup.string().required('Name is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    phone: Yup.string().matches(/^[0-9]{10}$/, 'Phone number must be 10 digits'),
    designation: Yup.string(),
    department: Yup.string(),
    employmentType: Yup.string().oneOf(['Full-time', 'Part-time', 'Contract', 'Intern']),
    joiningDate: Yup.date(),
    manager: Yup.string(),
    team: Yup.string(),
    dateOfBirth: Yup.date(),
    gender: Yup.string().oneOf(['Male', 'Female', 'Other', 'Prefer not to say']),
    address: Yup.object({
      street: Yup.string(),
      city: Yup.string(),
      state: Yup.string(),
      country: Yup.string(),
      postalCode: Yup.string()
    }),
    emergencyContact: Yup.object({
      name: Yup.string(),
      relation: Yup.string(),
      phone: Yup.string().matches(/^[0-9]{10}$/, 'Phone number must be 10 digits')
    })
  });

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const response = await axios.get(
          `${apiUrl}/api/v1/user/employees/${id}`,
          { withCredentials: true }
        );
        setEmployee(response.data.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching employee:', error);
        setError('Failed to load employee details');
        toast.error('Failed to load employee details');
        navigate('/employees');
      }
    };

    if (id) {
      fetchEmployee();
    }
  }, [id, navigate, apiUrl]);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setSubmitting(true);

      const formData = new FormData();

      Object.keys(values).forEach(key => {
        if (key === 'emergencyContact' || key === 'address' || key === 'avatar' || key === 'avatarPreview') return;

        if (values[key] !== null && values[key] !== undefined) {
          formData.append(key, values[key]);
        }
      });

      if (values.address) {
        Object.keys(values.address).forEach(addrKey => {
          if (values.address[addrKey] !== null && values.address[addrKey] !== undefined) {
            formData.append(`address.${addrKey}`, values.address[addrKey]);
          }
        });
      }

      if (values.emergencyContact) {
        Object.keys(values.emergencyContact).forEach(ecKey => {
          if (values.emergencyContact[ecKey] !== null && values.emergencyContact[ecKey] !== undefined) {
            formData.append(`emergencyContact.${ecKey}`, values.emergencyContact[ecKey]);
          }
        });
      }

      if (values.avatar instanceof File) {
        formData.append('avatar', values.avatar);
      }

      const response = await axios.patch(
        `${apiUrl}/api/v1/user/employees/${id}`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true
        }
      );

      toast.success('Profile updated successfully');
      navigate(`/employees/${id}`);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error.response?.data?.message || 'Failed to update profile');
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileChange = (event, setFieldValue) => {
    const file = event.currentTarget.files[0];
    if (file) {
      setFieldValue('avatar', file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFieldValue('avatarPreview', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      phone: '',
      designation: '',
      department: '',
      address: {
        street: '',
        city: '',
        state: '',
        country: '',
        postalCode: ''
      },
      emergencyContact: {
        name: '',
        relation: '',
        phone: ''
      },
      avatar: null,
      avatarPreview: '',
      employmentType: '',
      joiningDate: '',
      manager: '',
      team: '',
      dateOfBirth: '',
      gender: '',
      role: '',
    },
    validationSchema,
    onSubmit: handleSubmit,
    enableReinitialize: true
  });

  useEffect(() => {
    if (employee) {
      formik.setValues({
        name: employee.name || '',
        email: employee.email || '',
        phone: employee.phone || '',
        designation: employee.designation || '',
        department: employee.department || '',
        address: {
          street: employee.address?.street || '',
          city: employee.address?.city || '',
          state: employee.address?.state || '',
          country: employee.address?.country || '',
          postalCode: employee.address?.postalCode || ''
        },

        emergencyContact: {
          name: employee.emergencyContact?.name || '',
          relation: employee.emergencyContact?.relation || '',
          phone: employee.emergencyContact?.phone || ''
        },
        avatar: null,
        avatarPreview: employee.avatar?.url || '',
        employmentType: employee.employmentType || '',
        joiningDate: employee.joiningDate || '',
        manager: employee.manager || '',
        team: employee.team || '',
        dateOfBirth: employee.dateOfBirth || '',
        gender: employee.gender || '',
        role: employee.role || '',
      });
    }
  }, [employee]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: { xs: 2, md: 4 },
        maxWidth: 1400,
        mx: 'auto',
        bgcolor: 'background.default',
        minHeight: '100vh',
      }}
    >
      <Box
        display="flex"
        alignItems="center"
        mb={4}
        sx={{
          position: 'relative',
          '&:after': {
            content: '""',
            position: 'absolute',
            bottom: -8,
            left: 0,
            width: '100%',
            height: '1px',
            bgcolor: 'divider',
          },
        }}
      >
        <IconButton
          onClick={() => navigate(-1)}
          sx={{
            mr: 2,
            color: 'primary.main',
            bgcolor: 'action.hover',
            '&:hover': {
              bgcolor: 'action.selected',
            },
          }}
        >
          <ArrowBack />
        </IconButton>
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontWeight: 600,
            color: 'text.primary',
            letterSpacing: '0.5px',
          }}
        >
          Edit Profile
        </Typography>
      </Box>

      <Paper
        elevation={3}
        sx={{
          p: { xs: 2, md: 4 },
          mb: 3,
          borderRadius: 2,
          overflow: 'hidden',
          boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 8px 30px 0 rgba(0,0,0,0.1)',
          },
        }}
      >
        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={3}>
            <Grid columns={{ md: 4 }}>
              <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                mb={4}
                sx={{
                  position: 'relative',
                  '&:hover .MuiAvatar-root': {
                    transform: 'scale(1.03)',
                    boxShadow: '0 4px 20px 0 rgba(0,0,0,0.1)',
                  }
                }}
              >
                <Avatar
                  src={formik.values.avatarPreview}
                  alt={formik.values.name}
                  sx={{
                    width: 150,
                    height: 150,
                    mb: 2,
                    border: '3px solid',
                    borderColor: 'primary.main',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 2px 10px 0 rgba(0,0,0,0.05)',
                  }}
                />
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="avatar-upload"
                  type="file"
                  onChange={(event) => handleFileChange(event, formik.setFieldValue)}
                />
                <label htmlFor="avatar-upload">
                  <Button
                    variant="contained"
                    component="span"
                    startIcon={<CloudUpload />}
                    size="small"
                    sx={{
                      mb: 1,
                      textTransform: 'none',
                      fontWeight: 500,
                      borderRadius: 1,
                      px: 2,
                      py: 0.8,
                      bgcolor: 'primary.main',
                      '&:hover': {
                        bgcolor: 'primary.dark',
                        transform: 'translateY(-1px)',
                      },
                      transition: 'all 0.2s ease',
                    }}
                  >
                    Change Photo
                  </Button>
                </label>
                {formik.values.avatarPreview && (
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    startIcon={<Refresh />}
                    onClick={() => {
                      formik.setFieldValue('avatar', null);
                      formik.setFieldValue('avatarPreview', employee.avatar?.url || '');
                    }}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 500,
                      borderRadius: 1,
                      px: 2,
                      py: 0.8,
                      mt: 0.5,
                      '&:hover': {
                        bgcolor: 'error.lighter',
                        transform: 'translateY(-1px)',
                      },
                      transition: 'all 0.2s ease',
                    }}
                  >
                    Reset
                  </Button>
                )}
                <Typography variant="caption" color="textSecondary" mt={1}>
                  JPG, GIF or PNG. Max size of 2MB
                </Typography>
              </Box>

              <Divider sx={{ my: 3 }} />


            </Grid>

            <Grid columns={{ md: 8 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  mb: 3,
                  '&:before, &:after': {
                    content: '""',
                    flex: 1,
                    height: '1px',
                    bgcolor: 'divider',
                  },
                }}
              >
                <Typography
                  variant="h6"
                  component="h2"
                  sx={{
                    mx: 2,
                    fontWeight: 600,
                    color: 'primary.main',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Personal Information
                </Typography>
              </Box>

              <Grid container spacing={2}>
                <Grid columns={{ sm: 6 }}>
                  <TextField
                    fullWidth
                    id="name"
                    name="name"
                    label="Full Name"
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.name && Boolean(formik.errors.name)}
                    helperText={formik.touched.name && formik.errors.name}
                    margin="normal"
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 1,
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'primary.light',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderWidth: '1px',
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: 'text.secondary',
                        '&.Mui-focused': {
                          color: 'primary.main',
                        },
                      },
                    }}
                  />
                </Grid>
                <Grid columns={{ sm: 6 }}>
                  <TextField
                    fullWidth
                    id="email"
                    name="email"
                    label="Email"
                    type="email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.email && Boolean(formik.errors.email)}
                    helperText={formik.touched.email && formik.errors.email}
                    margin="normal"
                    disabled
                  />
                </Grid>
                <Grid columns={{ sm: 6 }}>
                  <TextField
                    fullWidth
                    id="phone"
                    name="phone"
                    label="Phone Number"
                    value={formik.values.phone}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.phone && Boolean(formik.errors.phone)}
                    helperText={formik.touched.phone && formik.errors.phone}
                    margin="normal"
                  />
                </Grid>
                <Grid columns={{ sm: 6 }}>
                  <TextField
                    fullWidth
                    id="designation"
                    name="designation"
                    label="Designation"
                    value={formik.values.designation}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.designation && Boolean(formik.errors.designation)}
                    helperText={formik.touched.designation && formik.errors.designation}
                    margin="normal"
                  />
                </Grid>
                <Grid columns={{ sm: 6 }}>
                  <TextField
                    fullWidth
                    id="department"
                    name="department"
                    label="Department"
                    value={formik.values.department}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.department && Boolean(formik.errors.department)}
                    helperText={formik.touched.department && formik.errors.department}
                    margin="normal"
                  />
                </Grid>
                <Grid columns={{ sm: 6 }}>
                  <TextField
                    fullWidth
                    id="address.street"
                    name="address.street"
                    label="Street"
                    value={formik.values.address.street}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.address?.street && Boolean(formik.errors.address?.street)}
                    helperText={formik.touched.address?.street && formik.errors.address?.street}
                    margin="normal"
                  />
                </Grid>

                <Grid columns={{ sm: 6 }}>
                  <TextField
                    fullWidth
                    id="address.city"
                    name="address.city"
                    label="City"
                    value={formik.values.address.city}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.address?.city && Boolean(formik.errors.address?.city)}
                    helperText={formik.touched.address?.city && formik.errors.address?.city}
                    margin="normal"
                  />
                </Grid>

                <Grid columns={{ sm: 6 }}>
                  <TextField
                    fullWidth
                    id="address.state"
                    name="address.state"
                    label="State"
                    value={formik.values.address.state}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.address?.state && Boolean(formik.errors.address?.state)}
                    helperText={formik.touched.address?.state && formik.errors.address?.state}
                    margin="normal"
                  />
                </Grid>

                <Grid columns={{ sm: 6 }}>
                  <TextField
                    fullWidth
                    id="address.country"
                    name="address.country"
                    label="Country"
                    value={formik.values.address.country}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.address?.country && Boolean(formik.errors.address?.country)}
                    helperText={formik.touched.address?.country && formik.errors.address?.country}
                    margin="normal"
                  />
                </Grid>

                <Grid columns={{ sm: 6 }}>
                  <TextField
                    fullWidth
                    id="address.postalCode"
                    name="address.postalCode"
                    label="Postal Code"
                    value={formik.values.address.postalCode}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.address?.postalCode && Boolean(formik.errors.address?.postalCode)}
                    helperText={formik.touched.address?.postalCode && formik.errors.address?.postalCode}
                    margin="normal"
                  />
                </Grid>

              </Grid>

              <Box
                sx={{
                  my: 4,
                  height: '1px',
                  bgcolor: 'divider',
                  position: 'relative',
                  '&:before': {
                    content: '""',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    bgcolor: 'background.paper',
                    px: 2,
                    color: 'text.secondary',
                    fontSize: '0.75rem',
                    letterSpacing: '0.5px',
                  }
                }}
              />

              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  mb: 3,
                  '&:before, &:after': {
                    content: '""',
                    flex: 1,
                    height: '1px',
                    bgcolor: 'divider',
                  },
                }}
              >
                <Typography
                  variant="h6"
                  component="h2"
                  sx={{
                    mx: 2,
                    fontWeight: 600,
                    color: 'error.main',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Emergency Contact
                </Typography>
              </Box>

              <Grid container spacing={2}>
                <Grid columns={{ sm: 6 }}>
                  <TextField
                    fullWidth
                    id="emergencyContact.name"
                    name="emergencyContact.name"
                    label="Contact Name"
                    value={formik.values.emergencyContact.name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.emergencyContact?.name && Boolean(formik.errors.emergencyContact?.name)}
                    helperText={formik.touched.emergencyContact?.name && formik.errors.emergencyContact?.name}
                    margin="normal"
                  />
                </Grid>
                <Grid columns={{ sm: 6 }}>
                  <TextField
                    fullWidth
                    id="emergencyContact.relation"
                    name="emergencyContact.relation"
                    label="Relationship"
                    value={formik.values.emergencyContact.relation}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.emergencyContact?.relation && Boolean(formik.errors.emergencyContact?.relation)}
                    helperText={formik.touched.emergencyContact?.relation && formik.errors.emergencyContact?.relation}
                    margin="normal"
                  />
                </Grid>
                <Grid columns={{ sm: 6 }}>
                  <TextField
                    fullWidth
                    id="emergencyContact.phone"
                    name="emergencyContact.phone"
                    label="Phone Number"
                    value={formik.values.emergencyContact.phone}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.emergencyContact?.phone && Boolean(formik.errors.emergencyContact?.phone)}
                    helperText={formik.touched.emergencyContact?.phone && formik.errors.emergencyContact?.phone}
                    margin="normal"
                  />
                </Grid>
              </Grid>
              <Box
                sx={{
                  my: 4,
                  height: '1px',
                  bgcolor: 'divider',
                  position: 'relative',
                  '&:before': {
                    content: '""',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    bgcolor: 'background.paper',
                    px: 2,
                    color: 'text.secondary',
                    fontSize: '0.75rem',
                    letterSpacing: '0.5px',
                  }
                }}
              />

              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  mb: 3,
                  '&:before, &:after': {
                    content: '""',
                    flex: 1,
                    height: '1px',
                    bgcolor: 'divider',
                  },
                }}
              >
                <Typography
                  variant="h6"
                  component="h2"
                  sx={{
                    mx: 2,
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                  }}
                >
                  Employment Details
                </Typography>
              </Box>

              <Grid container spacing={2}>
                <Grid columns={{ sm: 6 }}>
                  <FormControl
                    fullWidth
                    error={formik.touched.employmentType && Boolean(formik.errors.employmentType)}
                  >
                    <InputLabel>Employment Type</InputLabel>
                    <Select
                      id="employmentType"
                      name="employmentType"
                      value={formik.values.employmentType || ""}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      label="Employment Type"
                    >
                      <MenuItem value="">Select</MenuItem>
                      <MenuItem value="Full-time">Full-time</MenuItem>
                      <MenuItem value="Part-time">Part-time</MenuItem>
                      <MenuItem value="Contract">Contract</MenuItem>
                      <MenuItem value="Intern">Intern</MenuItem>
                    </Select>
                    <FormHelperText>
                      {formik.touched.employmentType && formik.errors.employmentType}
                    </FormHelperText>
                  </FormControl>
                </Grid>

                <Grid columns={{ sm: 6 }}>
                  <TextField
                    fullWidth
                    id="joiningDate"
                    name="joiningDate"
                    label="Joining Date"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={formik.values.joiningDate?.split("T")[0] || ""}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.joiningDate && Boolean(formik.errors.joiningDate)}
                    helperText={formik.touched.joiningDate && formik.errors.joiningDate}
                  />
                </Grid>

                <Grid columns={{ sm: 6 }}>
                  <TextField
                    fullWidth
                    id="manager"
                    name="manager"
                    label="Manager Id"
                    value={formik.values.manager}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.manager && Boolean(formik.errors.manager)}
                    helperText={formik.touched.manager && formik.errors.manager}
                  />
                </Grid>

                <Grid columns={{ sm: 6 }}>
                  <TextField
                    fullWidth
                    id="team"
                    name="team"
                    label="Team"
                    value={formik.values.team}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.team && Boolean(formik.errors.team)}
                    helperText={formik.touched.team && formik.errors.team}
                  />
                </Grid>

                <Grid columns={{ sm: 6 }}>
                  <TextField
                    fullWidth
                    id="dateOfBirth"
                    name="dateOfBirth"
                    label="Date of Birth"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={formik.values.dateOfBirth?.split("T")[0] || ""}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.dateOfBirth && Boolean(formik.errors.dateOfBirth)}
                    helperText={formik.touched.dateOfBirth && formik.errors.dateOfBirth}
                  />
                </Grid>


                <Grid columns={{ sm: 6 }}>
                  <FormControl
                    fullWidth
                    error={formik.touched.gender && Boolean(formik.errors.gender)}
                  >
                    <InputLabel>Gender</InputLabel>
                    <Select
                      id="gender"
                      name="gender"
                      value={formik.values.gender}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      label="Gender"
                    >
                      <MenuItem value="">Select</MenuItem>
                      <MenuItem value="Male">Male</MenuItem>
                      <MenuItem value="Female">Female</MenuItem>
                      <MenuItem value="Other">Other</MenuItem>
                      <MenuItem value="Prefer not to say">Prefer not to say</MenuItem>
                    </Select>
                    <FormHelperText>
                      {formik.touched.gender && formik.errors.gender}
                    </FormHelperText>
                  </FormControl>
                </Grid>
                {isAdmin(user, ["Admin"]) &&
                  <Grid columns={{ sm: 6 }}>
                    <FormControl
                      fullWidth
                      error={formik.touched.role && Boolean(formik.errors.role)}
                    >
                      <InputLabel>Role</InputLabel>
                      <Select
                        id="role"
                        name="role"
                        value={formik.values.role}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        label="Role"
                      >
                        <MenuItem value="">Select</MenuItem>
                        <MenuItem value="Admin">Admin</MenuItem>
                        <MenuItem value="HR">HR</MenuItem>
                        <MenuItem value="Librarian">Librarian</MenuItem>
                        <MenuItem value="Asset Manager">Asset Manager</MenuItem>
                        <MenuItem value="Employee">Employee</MenuItem>
                      </Select>
                      <FormHelperText>
                        {formik.touched.role && formik.errors.role}
                      </FormHelperText>
                    </FormControl>
                  </Grid>

                }
              </Grid>


              <Box
                mt={6}
                display="flex"
                justifyContent="flex-end"
                sx={{
                  position: 'sticky',
                  bottom: 24,
                  zIndex: 10,
                  pt: 2,
                  pb: 2,
                  bgcolor: 'background.paper',
                  borderRadius: 1,
                  boxShadow: '0 -2px 10px 0 rgba(0,0,0,0.05)',
                  px: 3,
                  mx: -3,
                  mb: -3,
                }}
              >
                <Button
                  variant="outlined"
                  onClick={() => navigate(-1)}
                  sx={{
                    mr: 2,
                    px: 3,
                    py: 1,
                    borderRadius: 1,
                    textTransform: 'none',
                    fontWeight: 500,
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={formik.isSubmitting || !formik.dirty}
                  sx={{
                    px: 4,
                    py: 1,
                    borderRadius: 1,
                    textTransform: 'none',
                    fontWeight: 500,
                    boxShadow: 'none',
                    '&:hover': {
                      boxShadow: '0 4px 12px 0 rgba(25, 118, 210, 0.3)',
                      transform: 'translateY(-1px)',
                    },
                    '&:active': {
                      boxShadow: 'none',
                      transform: 'none',
                    },
                    transition: 'all 0.2s ease',
                    minWidth: 120,
                  }}
                >
                  {formik.isSubmitting ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </Box>
                  {error && <p style={{ color: 'red', textAlign: 'right', transform: 'translateX(-30px)' }}>{error}</p>}
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default EditProfile;
