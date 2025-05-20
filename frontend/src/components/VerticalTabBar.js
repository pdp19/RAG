
import React, { useState } from 'react';
import {
  Box,
  Paper,
  Tooltip,
  useTheme,
  Slide,
  Avatar,
  Typography,
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import MemoryIcon from '@mui/icons-material/Memory';
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const TABS = [
  {
    label: 'Upload',
    icon: <UploadFileIcon fontSize="large" />,
    color: 'primary',
  },
  {
    label: 'Model',
    icon: <MemoryIcon fontSize="large" />,
    color: 'success',
  },
  {
    label: 'History',
    icon: <HistoryEduIcon fontSize="large" />,
    color: 'info',
  },
  {
    label: 'Account',
    icon: <AccountCircleIcon fontSize="large" />,
    color: 'secondary',
  },
];

const VerticalTabBar = ({ selected, onChange }) => {
  const theme = useTheme();
  const [hovered, setHovered] = useState(null);

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 1201,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        height: '100vh',
        width: { xs: 70, sm: 90, md: 110 },
        minWidth: { xs: 70, sm: 90, md: 110 },
        pointerEvents: 'auto',
        bgcolor: theme.palette.background.paper,
        boxShadow: '2px 0 16px 0 rgba(60,60,120,0.08)',
        borderRight: `2px solid ${theme.palette.divider}`,
        m: 0,
        p: 0,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          bgcolor: theme.palette.background.paper,
          borderRadius: 0,
          boxShadow: 'none',
          px: 0,
          py: 0,
          width: '100%',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: { xs: 'flex-start', md: 'flex-start' },
          gap: 0,
          position: 'relative',
          m: 0,
          p: 0,
          border: 'none',
        }}
      >
        <Box sx={{ height: { xs: 16, md: 32 } }} />
        {TABS.map((tab, idx) => (
          <Tooltip
            key={tab.label}
            title={tab.label}
            placement={window.innerWidth < 600 ? 'top' : 'right'}
            arrow
          >
            <Box
              sx={{
                my: 1.5,
                width: 60,
                height: 60,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 3,
                boxShadow:
                  selected === idx
                    ? `0 0 0 4px ${theme.palette[tab.color].light}`
                    : hovered === idx
                    ? `0 0 0 2px ${theme.palette[tab.color].main}`
                    : 'none',
                bgcolor:
                  selected === idx
                    ? theme.palette[tab.color].main
                    : theme.palette.background.default,
                color:
                  selected === idx
                    ? theme.palette[tab.color].contrastText
                    : theme.palette.text.secondary,
                cursor: 'pointer',
                transition:
                  'box-shadow 0.25s, background 0.25s, color 0.25s, transform 0.2s',
                transform:
                  selected === idx
                    ? 'scale(1.08)'
                    : hovered === idx
                    ? 'scale(1.04)'
                    : 'scale(1)',
                '&:hover': {
                  bgcolor: theme.palette[tab.color].light,
                  color: theme.palette[tab.color].contrastText,
                  boxShadow: `0 0 0 4px ${theme.palette[tab.color].main}`,
                },
                m: 0,
                p: 0,
              }}
              onClick={() => onChange(idx)}
              onMouseEnter={() => setHovered(idx)}
              onMouseLeave={() => setHovered(null)}
              aria-label={tab.label}
              tabIndex={0}
              role="button"
            >
              <Avatar
                sx={{
                  bgcolor: 'transparent',
                  color:
                    selected === idx
                      ? theme.palette[tab.color].contrastText
                      : theme.palette[tab.color].main,
                  width: 40,
                  height: 40,
                  fontSize: 32,
                  boxShadow: 'none',
                  transition: 'color 0.2s',
                }}
                variant="rounded"
              >
                {tab.icon}
              </Avatar>
            </Box>
          </Tooltip>
        ))}
        <Box sx={{ flexGrow: 1 }} />
        <Slide in={selected !== null} direction="right" mountOnEnter unmountOnExit>
          <Box
            sx={{
              mb: 3,
              display: { xs: 'none', md: 'block' },
              textAlign: 'center',
              color: theme.palette.text.disabled,
              fontSize: 13,
              fontWeight: 500,
              letterSpacing: 0.5,
              opacity: 0.7,
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 700 }}>
              NAVIGATE
            </Typography>
          </Box>
        </Slide>
      </Paper>
    </Box>
  );
};

export default VerticalTabBar;
