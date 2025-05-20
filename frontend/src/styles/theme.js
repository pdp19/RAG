import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    background: {
      default: '#f9f9f9', // Light grey background for a clean, minimalistic feel
      paper: '#ffffff',   // White background for cards and modals
    },
    primary: {
      main: '#2e7d32',     // Deep green for primary actions (natural and professional)
      contrastText: '#fff' // White text for contrast
    },
    secondary: {
      main: '#ffd54f',     // Gold for secondary actions (elegant and sophisticated)
      contrastText: '#fff' // White text for contrast
    },
    error: {
      main: '#d32f2f',     // Red for error states (clear visibility)
    },
    text: {
      primary: '#212121',  // Dark charcoal for primary text
      secondary: '#757575', // Medium grey for secondary text
    },
    action: {
      active: '#2e7d32',    // Active state for icons in deep green
    },
  },
  typography: {
    fontFamily: `'Open Sans', sans-serif`, // Modern sans-serif font for a clean look
    h1: {
      fontWeight: 700,
      fontSize: '3rem',
      color: '#2e7d32',   // Deep green for main headings
    },
    h2: {
      fontWeight: 600,
      fontSize: '2.5rem',
      color: '#2e7d32',   // Deep green for secondary headings
    },
    h3: {
      fontWeight: 500,
      fontSize: '2rem',
      color: '#ffd54f',   // Gold for tertiary headings
    },
    body1: {
      fontSize: '1rem',
      color: '#212121', // Dark charcoal for body text
    },
    body2: {
      fontSize: '0.875rem',
      color: '#757575', // Medium grey for smaller body text
    },
    button: {
      textTransform: 'none', // Normal case for button text
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px', // Rounded corners for a modern look
          padding: '12px 20px',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0px 6px 18px rgba(0, 0, 0, 0.1)', // Soft shadow on hover
            transform: 'scale(1.05)', // Slight scaling effect on hover
          },
        },
        containedPrimary: {
          backgroundColor: '#2e7d32', // Deep green for primary button
          '&:hover': {
            backgroundColor: '#1b5e20', // Darker green on hover
          },
        },
        containedSecondary: {
          backgroundColor: '#ffd54f', // Gold for secondary button
          '&:hover': {
            backgroundColor: '#ffb300', // Darker gold on hover
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '12px', // Rounded corners for cards
          boxShadow: '0px 6px 18px rgba(0, 0, 0, 0.1)', // Soft shadow for depth
          padding: '20px',
          backgroundColor: '#ffffff', // Clean white background
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiInputBase-root': {
            borderRadius: '10px', // Rounded text fields
            backgroundColor: '#fafafa', // Light grey background for text fields
            color: '#212121', // Dark text inside text fields
          },
        },
      },
    },
    MuiTable: {
      styleOverrides: {
        root: {
          '& th': {
            backgroundColor: '#f1f1f1', // Light gray for table headers
            color: '#212121', // Dark gray for header text
            fontWeight: 600,
          },
          '& td': {
            color: '#757575', // Medium grey for table data
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#2e7d32', // Deep green for the app bar
          boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)', // Soft shadow for app bar
        },
      },
    },
  },
  shape: {
    borderRadius: 8, // Consistent rounded corners
  },
  shadows: [
    'none',
    '0px 6px 18px rgba(0, 0, 0, 0.1)', // Light shadow for components
    // Additional shadows as needed
  ],
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
    },
  },
});

export default theme;
