import React from 'react';
import { Box, Container, Paper, Button, Divider, Typography, useTheme } from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { People as PeopleIcon, PersonAdd as PersonAddIcon, Home as HomeIcon } from '@mui/icons-material';

const EmployeeLayout = ({ children }) => {
  const theme = useTheme();
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 6 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ 
          fontWeight: 700, 
          color: theme.palette.primary.main,
          mb: 2
        }}>
          Employee Management
        </Typography>
        
        <Paper elevation={2} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button
              component={RouterLink}
              to="/employees"
              startIcon={<PeopleIcon />}
              variant={isActive('/employees') ? 'contained' : 'outlined'}
              sx={{
                textTransform: 'none',
                borderRadius: 2,
                px: 3,
                py: 1,
                ...(isActive('/employees') && {
                  bgcolor: theme.palette.primary.main,
                  color: 'white',
                  '&:hover': {
                    bgcolor: theme.palette.primary.dark,
                  },
                }),
              }}
            >
              All Employees
            </Button>
            
            <Button
              component={RouterLink}
              to="/employees/onboard"
              startIcon={<PersonAddIcon />}
              variant={isActive('/employees/onboard') ? 'contained' : 'outlined'}
              color="success"
              sx={{
                textTransform: 'none',
                borderRadius: 2,
                px: 3,
                py: 1,
                ...(isActive('/employees/onboard') && {
                  bgcolor: theme.palette.success.main,
                  color: 'white',
                  '&:hover': {
                    bgcolor: theme.palette.success.dark,
                  },
                }),
              }}
            >
              Onboard New Employee
            </Button>
            
            <Button
              component={RouterLink}
              to="/home"
              startIcon={<HomeIcon />}
              variant="outlined"
              color="inherit"
              sx={{
                textTransform: 'none',
                borderRadius: 2,
                px: 3,
                py: 1,
                ml: 'auto',
                borderColor: theme.palette.divider,
                '&:hover': {
                  borderColor: theme.palette.text.primary,
                },
              }}
            >
              Back to Home
            </Button>
          </Box>
        </Paper>
      </Box>
      
      <Paper 
        elevation={2} 
        sx={{ 
          p: { xs: 2, md: 4 },
          borderRadius: 2,
          minHeight: '60vh',
          backgroundColor: theme.palette.background.paper,
        }}
      >
        {children}
      </Paper>
    </Container>
  );
};

export default EmployeeLayout;
