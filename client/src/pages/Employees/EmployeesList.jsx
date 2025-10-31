import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  IconButton,
  Tooltip,
  Avatar,
  CircularProgress,
  Chip,
  TextField,
  InputAdornment,
  useTheme
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import EmployeeLayout from '../../components/EmployeeLayout';
import { AuthContext } from '../../context/AuthContext';
const EmployeesList = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const navigate = useNavigate();
  const { refreshAuthContext } = useContext(AuthContext);
  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL;
    const fetchEmployees = async () => {
      try {
        setLoading(true);

        const response = await axios.get(`${apiUrl}/api/v1/user/employees`, {
          withCredentials: true,
        });



        if (response.data && response.data.success) {
          setEmployees(response.data.data || []);
        } else {
          toast.error(response.data?.message || 'Failed to load employees');
          setEmployees([]);
        }
      } catch (error) {
        if (error.response) {
          if (error.response.status === 401) {
            navigate('/login');
            toast.error('Session expired. Please login again.');
          } else {
            toast.error(error.response.data?.message || 'Failed to load employees');
          }
        } else {
          toast.error('Failed to load employees. Please check your connection.');
        }
        setEmployees([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [navigate, refreshAuthContext]);

  const handleDeleteClick = (employee) => {
    setSelectedEmployee(employee);
    setDeleteDialogOpen(true);
    handleDeleteConfirm()
  };

  const handleDeleteConfirm = async () => {
    if (!selectedEmployee) return;

    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      await axios.delete(`${apiUrl}/api/v1/user/employees/${selectedEmployee._id}`, {
        withCredentials: true,
      });

      toast.success('Employee deleted successfully');
      setEmployees(employees.filter(emp => emp._id !== selectedEmployee._id));
    } catch (error) {
      console.error('Error deleting employee:', error);
      toast.error('Failed to delete employee');
    } finally {
      setDeleteDialogOpen(false);
      setSelectedEmployee(null);
    }
  };

  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.employeeId?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || employee.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleRefresh = () => {
    window.location.reload();
  };

  if (loading) {
    return (
      <EmployeeLayout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
          <CircularProgress />
        </Box>
      </EmployeeLayout>
    );
  }

  return (
    <EmployeeLayout>
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, mb: 3 }}>
          <TextField
            placeholder="Search employees..."
            variant="outlined"
            size="small"
            fullWidth
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              sx: {
                backgroundColor: theme.palette.background.paper,
                borderRadius: 2,
                maxWidth: 400
              }
            }}
          />

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              size="small"
              sx={{
                textTransform: 'none',
                borderRadius: 2,
                borderColor: theme.palette.divider,
                color: theme.palette.text.secondary
              }}
            >
              Refresh
            </Button>
          </Box>

          <Button
            component={RouterLink}
            to="/employees/onboard"
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            sx={{
              ml: 'auto',
              textTransform: 'none',
              borderRadius: 2,
              px: 3,
              py: 1,
              whiteSpace: 'nowrap'
            }}
          >
            Add Employee
          </Button>
        </Box>

        <Paper elevation={0} sx={{ overflow: 'hidden', border: `1px solid ${theme.palette.divider}` }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: theme.palette.grey[50] }}>
                <TableCell sx={{ fontWeight: 600, color: theme.palette.text.secondary }}>EMPLOYEE</TableCell>
                <TableCell sx={{ fontWeight: 600, color: theme.palette.text.secondary }}>EMAIL</TableCell>
                <TableCell sx={{ fontWeight: 600, color: theme.palette.text.secondary }}>DEPARTMENT</TableCell>
                <TableCell sx={{ fontWeight: 600, color: theme.palette.text.secondary }}>STATUS</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, color: theme.palette.text.secondary }}>ACTIONS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredEmployees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
                      <Typography variant="h6" color="textSecondary" gutterBottom>
                        {loading ? 'Loading employees...' : 'No employees found'}
                      </Typography>
                      {!loading && searchTerm && (
                        <Typography variant="body2" color="textSecondary">
                          No results found for "{searchTerm}". Try a different search term.
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                filteredEmployees.map((employee) => (
                  <TableRow
                    key={employee._id}
                    hover
                    sx={{
                      '&:hover': {
                        backgroundColor: theme.palette.action.hover,
                        '& .action-buttons': {
                          opacity: 1,
                        }
                      },
                      '&:last-child td': { borderBottom: 0 }
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                          src={employee.avatar?.url}
                          alt={employee.name}
                          sx={{
                            width: 40,
                            height: 40,
                            bgcolor: theme.palette.primary.main,
                            color: 'white',
                            fontSize: '1rem',
                            fontWeight: 600
                          }}
                        >
                          {employee.name?.charAt(0) || 'U'}
                        </Avatar>
                        <Box>
                          <Typography
                            variant="subtitle2"
                            sx={{
                              fontWeight: 600,
                              color: theme.palette.text.primary,
                              '&:hover': {
                                color: theme.palette.primary.main,
                                textDecoration: 'underline',
                                cursor: 'pointer'
                              }
                            }}
                            onClick={() => navigate(`/employees/${employee._id}`)}
                          >
                            {employee.name || 'Unnamed Employee'}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {employee.employeeId || 'ID: N/A'}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {employee.email || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {employee.department || 'N/A'}
                      </Typography>
                      {employee.designation && (
                        <Typography variant="caption" color="textSecondary">
                          {employee.designation}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={employee.status || 'Active'}
                        size="small"
                        color={
                          employee.status === 'Active' ? 'success' :
                            employee.status === 'On Leave' ? 'warning' :
                              employee.status === 'Inactive' ? 'error' : 'default'
                        }
                        sx={{
                          fontWeight: 500,
                          textTransform: 'capitalize',
                          minWidth: 90,
                          justifyContent: 'center',
                          borderRadius: 1,
                          fontSize: '0.75rem'
                        }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Box
                        className="action-buttons"
                        sx={{
                          display: 'flex',
                          gap: 0.5,
                          justifyContent: 'flex-end',
                          opacity: { xs: 1, md: 0.7 },
                          transition: 'opacity 0.2s',
                          '&:hover': {
                            opacity: 1
                          }
                        }}
                      >
                        <Tooltip title="View details">
                          <IconButton
                            size="small"
                            component={RouterLink}
                            to={`/employees/${employee._id}`}
                            sx={{
                              color: theme.palette.primary.main,
                              backgroundColor: theme.palette.primary.light + '22',
                              '&:hover': {
                                backgroundColor: theme.palette.primary.light + '44',
                              }
                            }}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            component={RouterLink}
                            to={`/employees/edit/${employee._id}`}
                            sx={{
                              color: theme.palette.info.main,
                              backgroundColor: theme.palette.info.light + '22',
                              '&:hover': {
                                backgroundColor: theme.palette.info.light + '44',
                              }
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteClick(employee)}
                            sx={{
                              color: theme.palette.error.main,
                              backgroundColor: theme.palette.error.light + '22',
                              '&:hover': {
                                backgroundColor: theme.palette.error.light + '44',
                              }
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Paper>
      </Box>
    </EmployeeLayout>
  );
};


export default EmployeesList;
