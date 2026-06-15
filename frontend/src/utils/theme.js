import { createTheme } from '@mui/material/styles';

export const getTheme = (mode = 'light') => createTheme({
  palette: {
    mode,
    primary: {
      main: '#5B4CF5',
      light: '#7B6FF8',
      dark: '#3D2ECC',
      contrastText: '#fff'
    },
    secondary: {
      main: '#9B59FF',
      light: '#B47DFF',
      dark: '#7030FF'
    },
    success: { main: '#22C55E', light: '#4ADE80' },
    warning: { main: '#F59E0B', light: '#FCD34D' },
    error: { main: '#EF4444', light: '#FCA5A5' },
    info: { main: '#3B82F6', light: '#93C5FD' },
    background: {
      default: mode === 'light' ? '#F4F6FB' : '#0F1117',
      paper: mode === 'light' ? '#FFFFFF' : '#1A1D27'
    },
    text: {
      primary: mode === 'light' ? '#1A1D2E' : '#F0F2FF',
      secondary: mode === 'light' ? '#6B7280' : '#9CA3AF'
    },
    divider: mode === 'light' ? '#E5E7EB' : '#2D3147'
  },
  typography: {
    fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
    h1: { fontWeight: 800, letterSpacing: '-0.03em' },
    h2: { fontWeight: 700, letterSpacing: '-0.02em' },
    h3: { fontWeight: 700, letterSpacing: '-0.015em' },
    h4: { fontWeight: 600, letterSpacing: '-0.01em' },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    body1: { lineHeight: 1.65 },
    button: { fontWeight: 600, textTransform: 'none', letterSpacing: '0.01em' }
  },
  shape: { borderRadius: 12 },
  shadows: [
    'none',
    '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
    '0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -1px rgba(0,0,0,0.04)',
    '0 10px 15px -3px rgba(0,0,0,0.07), 0 4px 6px -2px rgba(0,0,0,0.04)',
    '0 20px 25px -5px rgba(0,0,0,0.08), 0 10px 10px -5px rgba(0,0,0,0.02)',
    ...Array(20).fill('0 25px 50px -12px rgba(0,0,0,0.15)')
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: '8px 20px',
          fontSize: '0.875rem',
          boxShadow: 'none',
          '&:hover': { boxShadow: 'none' }
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #5B4CF5 0%, #9B59FF 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #4A3DE0 0%, #8845F0 100%)',
            transform: 'translateY(-1px)',
            boxShadow: '0 8px 20px rgba(91,76,245,0.35)'
          },
          transition: 'all 0.2s ease'
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
          border: mode === 'light' ? '1px solid rgba(0,0,0,0.05)' : '1px solid rgba(255,255,255,0.06)'
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: { borderRadius: 16 }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
            '& fieldset': { borderColor: 'rgba(0,0,0,0.1)' }
          }
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 8, fontWeight: 600, fontSize: '0.75rem' }
      }
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-root': {
            fontWeight: 700,
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: '#6B7280',
            background: mode === 'light' ? '#F9FAFB' : '#1E2130',
            borderBottom: '2px solid',
            borderColor: mode === 'light' ? '#E5E7EB' : '#2D3147'
          }
        }
      }
    }
  }
});
