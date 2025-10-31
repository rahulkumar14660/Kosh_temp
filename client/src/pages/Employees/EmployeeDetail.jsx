import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Avatar,
  Button,
  Divider,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  Chip,
  CircularProgress,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField
} from '@mui/material';
import {
  Edit as EditIcon,
  ArrowBack as ArrowBackIcon,
  PictureAsPdf as PdfIcon,
  Image as ImageIcon,
  Upload as UploadIcon,
  Download as DownloadIcon,
  Work as WorkIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Cake as CakeIcon,
  Home as HomeIcon,
  Badge as BadgeIcon,
  Business as BusinessIcon,
  AssignmentInd as AssignmentIndIcon,
  VerifiedUser as VerifiedUserIcon,
  EventAvailable as EventAvailableIcon,
  EventBusy as EventBusyIcon,
  Check as CheckIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
const EmployeeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [statusAnchorEl, setStatusAnchorEl] = useState(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [statusNotes, setStatusNotes] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const apiUrl = import.meta.env.VITE_API_URL;
  const { refreshAuthContext } = useContext(AuthContext);
  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const response = await axios.get(
          `${apiUrl}/api/v1/user/employees/${id}`,
          { withCredentials: true }
        );
        setEmployee(response.data.data);
      } catch (error) {
        console.error('Error fetching employee:', error);
        toast.error('Failed to load employee details');
        navigate('/employees');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchEmployee();
    }
  }, [id, navigate, apiUrl, refreshAuthContext]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('document', file);
    formData.append('documentType', 'resume');
    formData.append('name', file.name);

    try {
      setUploading(true);
      const response = await axios.post(
        `${apiUrl}/api/v1/user/employees/${id}/documents`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true
        }
      );

      setEmployee({
        ...employee,
        documents: [...(employee.documents || []), response.data.data]
      });

      toast.success('Document uploaded successfully');
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error(error.response?.data?.message || 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const statusOptions = [
    { value: 'Active', label: 'Active', color: 'success' },
    { value: 'On Leave', label: 'On Leave', color: 'warning' },
    { value: 'Suspended', label: 'Suspended', color: 'error' },
    { value: 'Terminated', label: 'Terminated', color: 'error' },
    { value: 'Resigned', label: 'Resigned', color: 'default' },
  ];

  const getStatusColor = (status) => {
    return statusOptions.find(opt => opt.value === status)?.color || 'default';
  };

  const handleStatusClick = (event) => {
    event.currentTarget.blur();
    setStatusAnchorEl(event.currentTarget);
  };

  const handleStatusClose = () => {
    setStatusAnchorEl(null);
  };

  const handleStatusSelect = (status) => {
    setSelectedStatus(status);
    setStatusDialogOpen(true);
    handleStatusClose();
  };

  const handleStatusDialogClose = () => {
    if (!updatingStatus) {
      setStatusDialogOpen(false);
      setStatusNotes('');
      setSelectedStatus('');
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedStatus) return;
    try {
      setUpdatingStatus(true);
      const requestData = {
        status: selectedStatus
      };

      if (['Terminated', 'Resigned'].includes(selectedStatus)) {
        if (!statusNotes) {
          toast.error('Please provide a reason for ' + selectedStatus.toLowerCase());
          setUpdatingStatus(false);
          return;
        }
        requestData.exitReason = statusNotes;
        requestData.lastWorkingDay = new Date().toISOString();
      }

      const response = await axios.patch(
        `${apiUrl}/api/v1/user/employees/${id}/status`,
        requestData,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data && response.data.success) {
        const updatedEmployee = {
          ...employee,
          status: selectedStatus
        };

        if (['Terminated', 'Resigned'].includes(selectedStatus)) {
          updatedEmployee.dateOfLeaving = new Date().toISOString();
          updatedEmployee.exitReason = statusNotes;
          updatedEmployee.lastWorkingDay = new Date().toISOString();
        }

        setEmployee(updatedEmployee);

        toast.success(response.data.message || 'Employee status updated successfully');
        setStatusDialogOpen(false);
        setStatusNotes('');
        setSelectedStatus('');
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error updating status:', error);

      if (error.response) {
        const errorMessage = error.response.data?.message || 'Failed to update status';
        toast.error(errorMessage);
      } else if (error.request) {
        console.error('No response received:', error.request);
        toast.error('No response from server. Please check your connection.');
      } else {
        console.error('Error setting up request:', error.message);
        toast.error(error.message || 'An error occurred while updating status');
      }
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  if (!employee) {
    return (
      <Box p={3}>
        <Typography variant="h6">Employee not found</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1400, mx: 'auto' }}>
      <Box
        display="flex"
        flexDirection={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        mb={4}
        gap={2}
      >
        <Box display="flex" alignItems="center" width="100%">
          <Tooltip title="Go back">
            <IconButton
              onClick={() => navigate("/employees")}
              sx={{
                mr: 2,
                backgroundColor: 'action.hover',
                '&:hover': {
                  backgroundColor: 'action.selected',
                }
              }}
            >
              <ArrowBackIcon />
            </IconButton>
          </Tooltip>
          <Typography variant="h4" component="h1" sx={{
            fontWeight: 600,
            background: 'linear-gradient(45deg, #1976d2 30%, #21CBF3 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mr: 2
          }}>
            Employee Details
          </Typography>
        </Box>
        <Box
          display="flex"
          gap={2}
          width={{ xs: '100%', sm: 'auto' }}
          mt={{ xs: 2, sm: 0 }}
          ml={{ sm: 'auto' }}
        >
          <Button
            variant="outlined"
            color="primary"
            startIcon={<EditIcon />}
            component={Link}
            to={`/employees/edit/${id}`}
            sx={{
              textTransform: 'none',
              fontWeight: 500,
              px: 3,
              '&:hover': {
                transform: 'translateY(-1px)',
                boxShadow: 1,
              },
              transition: 'all 0.2s ease-in-out',
            }}
          >
            Edit Profile
          </Button>
        </Box>
      </Box>

      <Paper
        elevation={3}
        sx={{
          p: { xs: 2, md: 4 },
          mb: 4,
          borderRadius: 2,
          background: 'linear-gradient(to bottom right, #ffffff 0%, #f8f9fa 100%)',
          border: '1px solid rgba(0, 0, 0, 0.04)',
        }}
      >
        <Box
          display="flex"
          flexDirection={{ xs: 'column', sm: 'row' }}
          alignItems={{ xs: 'center', sm: 'flex-start' }}
          mb={4}
          gap={3}
        >
          <Avatar
            src={employee.avatar?.url}
            alt={employee.name}
            sx={{
              width: 120,
              height: 120,
              border: '4px solid #fff',
              boxShadow: 3,
              '&:hover': {
                transform: 'scale(1.03)',
                transition: 'transform 0.3s ease-in-out',
              }
            }}
          />
          <Box sx={{ textAlign: { xs: 'center', sm: 'left' }, mt: { xs: 2, sm: 0 } }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                mb: 0.5,
                background: 'linear-gradient(45deg, #2c3e50 30%, #3498db 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: { xs: '1.8rem', sm: '2.125rem' }
              }}
            >
              {employee.name}
            </Typography>
            <Typography
              variant="h6"
              color="primary"
              sx={{
                fontWeight: 500,
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: { xs: 'center', sm: 'flex-start' },
                gap: 1
              }}
            >
              <WorkIcon fontSize="small" />
              {employee.designation || 'No designation'}
            </Typography>
            <Box display="flex" alignItems="center" flexWrap="wrap" gap={2} justifyContent={{ xs: 'center', sm: 'flex-start' }}>
              <Box>
                <Chip
                  label={employee.status || 'Inactive'}
                  color={getStatusColor(employee.status)}
                  size="medium"
                  variant="filled"
                  onClick={handleStatusClick}
                  sx={{
                    cursor: 'pointer',
                    fontWeight: 600,
                    px: 1,
                    '&:hover': {
                      transform: 'translateY(-1px)',
                      boxShadow: 2,
                    },
                    transition: 'all 0.2s ease-in-out',
                  }}
                />
                <Menu
                  anchorEl={statusAnchorEl}
                  open={Boolean(statusAnchorEl)}
                  onClose={handleStatusClose}
                  PaperProps={{
                    style: {
                      marginTop: '8px',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                    }
                  }}
                >
                  {statusOptions.map((option) => (
                    <MenuItem
                      key={option.value}
                      onClick={() => handleStatusSelect(option.value)}
                      disabled={option.value === employee.status}
                      sx={{
                        '&:hover': {
                          backgroundColor: 'action.hover',
                        },
                        '&.Mui-disabled': {
                          opacity: 0.7,
                          backgroundColor: 'transparent',
                        }
                      }}
                    >
                      <Box display="flex" alignItems="center" width="100%">
                        <Box
                          sx={{
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            bgcolor: `${option.color}.main`,
                            mr: 2,
                            flexShrink: 0
                          }}
                        />
                        <Typography variant="body2" sx={{ fontWeight: option.value === employee.status ? 600 : 400 }}>
                          {option.label}
                        </Typography>
                        {option.value === employee.status && (
                          <CheckIcon
                            color="primary"
                            sx={{
                              ml: 'auto',
                              fontSize: '1rem'
                            }}
                          />
                        )}
                      </Box>
                    </MenuItem>
                  ))}
                </Menu>
              </Box>
              {employee.employeeId && (
                <Box
                  display="flex"
                  alignItems="center"
                  sx={{
                    backgroundColor: 'action.hover',
                    px: 2,
                    py: 0.5,
                    borderRadius: 1,
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                  }}
                >
                  <BadgeIcon fontSize="small" color="action" sx={{ mr: 1, opacity: 0.7 }} />
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                    ID: {employee.employeeId}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Box>

        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          sx={{
            mb: 3,
            '& .MuiTabs-indicator': {
              height: 4,
              borderRadius: '4px 4px 0 0',
            },
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.95rem',
              minWidth: 'auto',
              px: 3,
              '&.Mui-selected': {
                color: 'primary.main',
              },
            },
          }}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
        >
          <Tab
            label="Personal Information"
            icon={<PersonIcon fontSize="small" sx={{ mb: 0, mr: 1 }} />}
            iconPosition="start"
          />
          <Tab
            label="Job Details"
            icon={<WorkIcon fontSize="small" sx={{ mb: 0, mr: 1 }} />}
            iconPosition="start"
          />
          <Tab
            label="Documents"
            icon={<ImageIcon fontSize="small" sx={{ mb: 0, mr: 1 }} />}
            iconPosition="start"
          />
        </Tabs>

        <Divider sx={{
          mb: 3,
          borderColor: 'divider',
          '&::before, &::after': {
            borderColor: 'divider',
          },
          '&.MuiDivider-root': {
            '&::before, &::after': {
              borderTop: 'thin solid rgba(0, 0, 0, 0.06)',
            },
          },
        }} />

        {tabValue === 0 && (
          <Grid container spacing={3}>
            <Grid columns={{ md: 6 }}>
              <Box
                sx={{
                  p: 3,
                  mb: 3,
                  borderRadius: 2,
                  backgroundColor: 'background.paper',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  border: '1px solid rgba(0, 0, 0, 0.04)',
                  '&:hover': {
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    transform: 'translateY(-2px)',
                    transition: 'all 0.2s ease-in-out',
                  }
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 600,
                    mb: 2,
                    color: 'text.primary',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}
                >
                  <EmailIcon fontSize="small" color="primary" />
                  CONTACT INFORMATION
                </Typography>
                <Box mb={2.5}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EmailIcon fontSize="inherit" color="action" sx={{ opacity: 0.7, fontSize: '1rem' }} />
                    Email
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500, ml: 3.5 }}>
                    {employee.email || 'N/A'}
                  </Typography>
                </Box>
                <Box mb={2.5}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PhoneIcon fontSize="inherit" color="action" sx={{ opacity: 0.7, fontSize: '1rem' }} />
                    Phone
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500, ml: 3.5 }}>
                    {employee.phone || 'N/A'}
                  </Typography>
                </Box>
              </Box>

              <Box
                sx={{
                  p: 3,
                  borderRadius: 2,
                  backgroundColor: 'background.paper',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  border: '1px solid rgba(0, 0, 0, 0.04)',
                  '&:hover': {
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    transform: 'translateY(-2px)',
                    transition: 'all 0.2s ease-in-out',
                  }
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 600,
                    mb: 2,
                    color: 'text.primary',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}
                >
                  <WorkIcon fontSize="small" color="primary" />
                  EMPLOYMENT DETAILS
                </Typography>
                <Box mb={2}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    Date of Joining
                  </Typography>
                  <Box sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    px: 0.5,
                    py: 0.5,
                    borderRadius: 1,
                    fontWeight: 500,
                    fontSize: '0.9rem'
                  }}>
                    {employee.joiningDate ? new Date(employee.joiningDate).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : 'N/A'}
                  </Box>
                </Box>
                {employee.dateOfLeaving && (
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Date of Leaving
                    </Typography>
                    <Box sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      backgroundColor: 'error.light',
                      color: 'error.dark',
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 1,
                      fontWeight: 500,
                      fontSize: '0.9rem'
                    }}>
                      {new Date(employee.dateOfLeaving).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </Box>
                  </Box>
                )}
              </Box>
            </Grid>

            <Grid columns={{ md: 6 }}>
              <Box
                sx={{
                  p: 3,
                  mb: 3,
                  borderRadius: 2,
                  backgroundColor: 'background.paper',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  border: '1px solid rgba(0, 0, 0, 0.04)',
                  '&:hover': {
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    transform: 'translateY(-2px)',
                    transition: 'all 0.2s ease-in-out',
                  }
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 600,
                    mb: 2,
                    color: 'text.primary',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}
                >
                  <PersonIcon fontSize="small" color="primary" />
                  PERSONAL DETAILS
                </Typography>
                <Box mb={2.5}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CakeIcon fontSize="inherit" color="action" sx={{ opacity: 0.7, fontSize: '1rem' }} />
                    Date of Birth
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500, ml: 3.5 }}>
                    {employee.dateOfBirth
                      ? new Date(employee.dateOfBirth).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })
                      : 'N/A'}
                  </Typography>
                </Box>
                <Box mb={2.5}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    Gender
                  </Typography>
                  <Chip
                    label={employee.gender || 'N/A'}
                    size="small"
                    variant="outlined"
                    sx={{
                      backgroundColor: 'action.hover',
                      borderColor: 'divider',
                      color: 'text.secondary',
                      fontWeight: 500,
                      px: 1,
                      '& .MuiChip-label': {
                        px: 1,
                      }
                    }}
                  />
                </Box>
              </Box>

              <Box
                sx={{
                  p: 3,
                  borderRadius: 2,
                  backgroundColor: 'background.paper',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  border: '1px solid rgba(0, 0, 0, 0.04)',
                  '&:hover': {
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    transform: 'translateY(-2px)',
                    transition: 'all 0.2s ease-in-out',
                  }
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 600,
                    mb: 2,
                    color: 'text.primary',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}
                >
                  <PhoneIcon fontSize="small" color="primary" />
                  EMERGENCY CONTACT
                </Typography>
                <Box>
                  <Typography
                    variant="body1"
                    component="div"
                    sx={{
                      fontWeight: 500,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      mb: 0.5
                    }}
                  >
                    {employee.emergencyContact?.name || 'N/A'}
                    {employee.emergencyContact?.relation && (
                      <Chip
                        label={employee.emergencyContact.relation}
                        size="small"
                        color="secondary"
                        sx={{
                          height: 20,
                          fontSize: '0.7rem',
                          '& .MuiChip-label': {
                            px: 0.5,
                          }
                        }}
                      />
                    )}
                  </Typography>
                  {employee.emergencyContact?.phone && (
                    <Box
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        color: 'success.dark',
                        px: 0.5,
                        py: 0.5,
                        borderRadius: 1,
                        fontWeight: 500,
                        fontSize: '0.9rem',
                        mt: 1
                      }}
                    >
                      <PhoneIcon fontSize="small" sx={{ mr: 0.5, fontSize: '1rem' }} />
                      {employee.emergencyContact.phone}
                    </Box>
                  )}
                </Box>
              </Box>
            </Grid>
            <Grid columns={{ md: 6 }}>
              <Box
                sx={{
                  p: 3,
                  mb: 3,
                  borderRadius: 2,
                  backgroundColor: 'background.paper',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  border: '1px solid rgba(0, 0, 0, 0.04)',
                  '&:hover': {
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    transform: 'translateY(-2px)',
                    transition: 'all 0.2s ease-in-out',
                  }
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 600,
                    mb: 2,
                    color: 'text.primary',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}
                >
                  <HomeIcon fontSize="small" color="primary" />
                  ADDRESS
                </Typography>

                <Box mb={2.5}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    Street
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {employee?.address?.street || 'N/A'}
                  </Typography>
                </Box>
                <Box mb={2.5}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    City
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {employee?.address?.city || 'N/A'}
                  </Typography>
                </Box>
                <Box mb={2.5}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    State
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {employee?.address?.state || 'N/A'}
                  </Typography>
                </Box>
                <Box mb={2}>
                  <Typography variant="body2" color="textSecondary">Country</Typography>
                  <Typography>{employee?.address?.country || 'N/A'}</Typography>
                </Box>
                <Box mb={2}>
                  <Typography variant="body2" color="textSecondary">Postal Code</Typography>
                  <Typography>{employee?.address?.postalCode || 'N/A'}</Typography>
                </Box>
              </Box>

            </Grid>
          </Grid>
        )}

        {tabValue === 1 && (
          <Grid container spacing={3}>
            <Grid columns={{ md: 6 }}>
              <Box
                sx={{
                  p: 3,
                  mb: 3,
                  borderRadius: 2,
                  backgroundColor: 'background.paper',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  border: '1px solid rgba(0, 0, 0, 0.04)',
                  '&:hover': {
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    transform: 'translateY(-2px)',
                    transition: 'all 0.2s ease-in-out',
                  }
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 600,
                    mb: 3,
                    color: 'text.primary',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    pb: 1.5
                  }}
                >
                  <WorkIcon fontSize="small" color="primary" />
                  JOB INFORMATION
                </Typography>

                <Box mb={3}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <BadgeIcon fontSize="inherit" color="action" sx={{ opacity: 0.7, fontSize: '1rem' }} />
                    Employee ID
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500, ml: 3.5 }}>
                    {employee?.employeeId || 'N/A'}
                  </Typography>
                </Box>

                <Box mb={3}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <WorkIcon fontSize="inherit" color="action" sx={{ opacity: 0.7, fontSize: '1rem' }} />
                    Designation
                  </Typography>
                  <Box
                    sx={{
                      display: 'inline-block',
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 1,
                      fontSize: '0.9rem',
                      ml: 2
                    }}
                  >
                    {employee.designation || 'N/A'}
                  </Box>
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <BusinessIcon fontSize="inherit" color="action" sx={{ opacity: 0.7, fontSize: '1rem' }} />
                    Department
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500, ml: 3.5 }}>
                    {employee.department || 'N/A'}
                  </Typography>
                </Box>
              </Box>
            </Grid>

            <Grid columns={{ md: 6 }}>
              <Box
                sx={{
                  p: 3,
                  mb: 3,
                  borderRadius: 2,
                  backgroundColor: 'background.paper',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  border: '1px solid rgba(0, 0, 0, 0.04)',
                  '&:hover': {
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    transform: 'translateY(-2px)',
                    transition: 'all 0.2s ease-in-out',
                  }
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 600,
                    mb: 3,
                    color: 'text.primary',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    pb: 1.5
                  }}
                >
                  <AssignmentIndIcon fontSize="small" color="primary" />
                  EMPLOYMENT DETAILS
                </Typography>

                <Box mb={3}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <VerifiedUserIcon fontSize="inherit" color="action" sx={{ opacity: 0.7, fontSize: '1rem' }} />
                    Employment Status
                  </Typography>
                  <Box sx={{ ml: 3.5 }}>
                    <Chip
                      label={employee.status || 'Inactive'}
                      color={getStatusColor(employee.status)}
                      variant="filled"
                      onClick={handleStatusClick}
                      sx={{
                        cursor: 'pointer',
                        fontWeight: 600,
                        px: 1,
                        '&:hover': {
                          boxShadow: 2,
                          transform: 'translateY(-1px)',
                        },
                        transition: 'all 0.2s ease-in-out',
                      }}
                    />
                    <Menu
                      anchorEl={statusAnchorEl}
                      open={Boolean(statusAnchorEl)}
                      onClose={handleStatusClose}
                      PaperProps={{
                        style: {
                          marginTop: '8px',
                          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                        }
                      }}
                    >
                      {statusOptions.map((option) => (
                        <MenuItem
                          key={option.value}
                          onClick={() => handleStatusSelect(option.value)}
                          disabled={option.value === employee.status}
                          sx={{
                            '&:hover': {
                              backgroundColor: 'action.hover',
                            },
                            '&.Mui-disabled': {
                              opacity: 0.7,
                              backgroundColor: 'transparent',
                            }
                          }}
                        >
                          <Box display="flex" alignItems="center" width="100%">
                            <Box
                              sx={{
                                width: 10,
                                height: 10,
                                borderRadius: '50%',
                                bgcolor: `${option.color}.main`,
                                mr: 2,
                                flexShrink: 0
                              }}
                            />
                            <Typography variant="body2" sx={{ fontWeight: option.value === employee.status ? 600 : 400 }}>
                              {option.label}
                            </Typography>
                            {option.value === employee.status && (
                              <CheckIcon
                                color="primary"
                                sx={{
                                  ml: 'auto',
                                  fontSize: '1rem'
                                }}
                              />
                            )}
                          </Box>
                        </MenuItem>
                      ))}
                    </Menu>
                  </Box>
                </Box>

                <Box mb={employee.dateOfLeaving ? 3 : 0}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EventAvailableIcon fontSize="inherit" color="action" sx={{ opacity: 0.7, fontSize: '1rem' }} />
                    Date of Joining
                  </Typography>
                  <Box sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 1,
                    fontWeight: 500,
                    fontSize: '0.9rem',
                    ml: 2
                  }}>
                    {employee.joiningDate
                      ? new Date(employee.joiningDate).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })
                      : 'N/A'}
                  </Box>
                </Box>

                {employee.dateOfLeaving && (
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <EventBusyIcon fontSize="inherit" color="action" sx={{ opacity: 0.7, fontSize: '1rem' }} />
                      Date of Leaving
                    </Typography>
                    <Box sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      backgroundColor: 'error.light',
                      color: 'error.dark',
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 1,
                      fontWeight: 500,
                      fontSize: '0.9rem',
                      ml: 3.5
                    }}>
                      {new Date(employee.dateOfLeaving).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </Box>
                  </Box>
                )}

              </Box>

            </Grid>
            <Grid columns={{ md: 6 }}>
              <Box
                sx={{
                  p: 3,
                  mb: 3,
                  borderRadius: 2,
                  backgroundColor: 'background.paper',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  border: '1px solid rgba(0, 0, 0, 0.04)',
                  '&:hover': {
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    transform: 'translateY(-2px)',
                    transition: 'all 0.2s ease-in-out',
                  }
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 600,
                    mb: 3,
                    color: 'text.primary',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    pb: 1.5
                  }}
                >
                  <AssignmentIndIcon fontSize="small" color="primary" />
                  TEAM DETAILS
                </Typography>
                <Box mt={1.5} ml={3.5}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}
                  >
                    Manager ID
                  </Typography>
                  <Box
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      backgroundColor: 'grey.100',
                      color: 'text.primary',
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 1,
                      fontWeight: 500,
                      fontSize: '0.9rem',
                    }}
                  >
                    {employee.manager || 'N/A'}
                  </Box>
                </Box>

                <Box mt={1.5} ml={3.5}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}
                  >
                    Team Name
                  </Typography>
                  <Box
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      backgroundColor: 'grey.100',
                      color: 'text.primary',
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 1,
                      fontWeight: 500,
                      fontSize: '0.9rem',
                    }}
                  >
                    {employee.team || 'N/A'}
                  </Box>
                </Box>
              </Box>

            </Grid>
          </Grid>
        )}

        {tabValue === 2 && (
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="subtitle1">Documents</Typography>
              
                <input
                  accept="application/pdf,image/*"
                  style={{ display: 'none' }}
                  id="document-upload"
                  type="file"
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
                <label htmlFor="document-upload">
                  <Button
                    variant="contained"
                    color="primary"
                    component="span"
                    startIcon={<UploadIcon />}
                    disabled={uploading}
                  >
                    {uploading ? 'Uploading...' : 'Upload Document'}
                  </Button>
                </label>
            
            </Box>

            {employee.documents && employee.documents.length > 0 ? (
              <Box>
                {employee.documents.map((doc) => (
                  <Box
                    key={doc._id}
                    display="flex"
                    alignItems="center"
                    p={2}
                    mb={2}
                    border={1}
                    borderColor="divider"
                    borderRadius={1}
                  >
                    <ImageIcon color="error" sx={{ mr: 2 }} />
                    <Box flexGrow={1}>
                      <Typography variant="body1">{doc.name || 'Document'}</Typography>
                      <Typography variant="caption" color="textSecondary">
                        {new Date(doc.uploadedAt).toLocaleDateString('en-IN')}
                      </Typography>
                    </Box>
                    <Tooltip title="Download">
                      <IconButton
                        component="a"
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                      >
                        <DownloadIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                ))}
              </Box>
            ) : (
              <Box textAlign="center" py={4}>
                <ImageIcon color="disabled" sx={{ fontSize: 48, mb: 1 }} />
                <Typography variant="body1" color="textSecondary">
                  No documents uploaded yet
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </Paper>

      <Dialog
        open={statusDialogOpen}
        onClose={handleStatusDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Update Employee Status</DialogTitle>
        <DialogContent>
          <DialogContentText>
            You are about to update this employee's status to:
            <Box component="span" fontWeight="bold" ml={1}>
              {selectedStatus}
            </Box>
          </DialogContentText>

          {(selectedStatus === 'Terminated' || selectedStatus === 'Resigned') && (
            <Box mt={3}>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                Please provide a reason for {selectedStatus.toLowerCase()}:
              </Typography>
              <TextField
                autoFocus
                margin="normal"
                label="Reason"
                type="text"
                fullWidth
                variant="outlined"
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
                multiline
                rows={3}
                error={!statusNotes}
                helperText={!statusNotes ? 'This field is required' : ''}
              />
              <Box mt={2}>
                <Typography variant="caption" color="textSecondary">
                  Last working day will be set to today's date.
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            onClick={handleStatusDialogClose}
            disabled={updatingStatus}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button
            onClick={handleStatusUpdate}
            color="primary"
            variant="contained"
            disabled={updatingStatus || (['Terminated', 'Resigned'].includes(selectedStatus) && !statusNotes)}
            startIcon={updatingStatus ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {updatingStatus ? 'Updating...' : 'Update Status'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmployeeDetail;
