
import React, { useState, useRef } from 'react';
import {
  Box,
  Paper,
  Slide,
  Fade,
  Typography,
  IconButton,
  Button,
  Avatar,
  TextField,
  Stack,
  MenuItem,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import CloseIcon from '@mui/icons-material/Close';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import LogoutIcon from '@mui/icons-material/Logout';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';

const ACCOUNT_KEY = 'rag_account_profile';

const getStoredProfile = () => {
  try {
    return (
      JSON.parse(localStorage.getItem(ACCOUNT_KEY)) || {
        name: '',
        avatar: '',
        theme: 'system',
      }
    );
  } catch {
    return { name: '', avatar: '', theme: 'system' };
  }
};

const storeProfile = (profile) => {
  localStorage.setItem(ACCOUNT_KEY, JSON.stringify(profile));
};

const AccountPanel = ({ open, onClose }) => {
  const theme = useTheme();
  const [profile, setProfile] = useState(getStoredProfile());
  const [editName, setEditName] = useState(profile.name);
  const [editTheme, setEditTheme] = useState(profile.theme);
  const [editAvatar, setEditAvatar] = useState(profile.avatar);
  const [showReset, setShowReset] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const fileInputRef = useRef();

  const handleSave = () => {
    const updated = { ...profile, name: editName, theme: editTheme, avatar: editAvatar };
    setProfile(updated);
    storeProfile(updated);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setEditAvatar(ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleReset = () => {
    localStorage.clear();
    setProfile({ name: '', avatar: '', theme: 'system' });
    setEditName('');
    setEditAvatar('');
    setEditTheme('system');
    setShowReset(false);
    if (onClose) onClose();
  };

  const handleLogout = () => {
    // For demo: just clear profile and close
    setProfile({ name: '', avatar: '', theme: 'system' });
    setEditName('');
    setEditAvatar('');
    setEditTheme('system');
    setShowLogout(false);
    if (onClose) onClose();
  };

  return (
    <Slide direction="right" in={open} mountOnEnter unmountOnExit>
      <Box
        sx={{
          position: 'fixed',
          top: { xs: 0, md: 32 },
          left: { xs: 0, md: 110 },
          zIndex: 1300,
          width: { xs: '100vw', sm: 400, md: 420 },
          maxWidth: { xs: '100vw', sm: 420 },
          height: { xs: '100vh', md: 'calc(100vh - 64px)' },
          bgcolor: 'transparent',
          display: 'flex',
          alignItems: { xs: 'flex-start', md: 'center' },
          justifyContent: 'flex-start',
        }}
      >
        <Fade in={open}>
          <Paper
            elevation={18}
            sx={{
              borderRadius: 5,
              p: { xs: 2, md: 4 },
              m: { xs: 0, md: 2 },
              width: { xs: '100vw', sm: 380, md: 400 },
              maxWidth: { xs: '100vw', sm: 400 },
              minHeight: { xs: '100vh', md: 420 },
              maxHeight: { xs: '100vh', md: 700 },
              boxShadow: '0 8px 32px 0 rgba(60,60,120,0.18)',
              bgcolor: theme.palette.background.paper,
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              overflow: 'hidden',
              border: `2px solid ${theme.palette.secondary.light}`,
              transition: 'box-shadow 0.3s, border 0.3s',
            }}
          >
            <IconButton
              onClick={onClose}
              sx={{
                position: 'absolute',
                top: 12,
                right: 12,
                color: theme.palette.grey[500],
                zIndex: 2,
                '&:hover': { color: theme.palette.error.main },
              }}
              aria-label="Close account panel"
            >
              <CloseIcon />
            </IconButton>
            <Box
              sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-start',
                mt: 2,
              }}
            >
              <Avatar
                src={editAvatar}
                sx={{
                  width: 72,
                  height: 72,
                  bgcolor: theme.palette.secondary.main,
                  color: theme.palette.secondary.contrastText,
                  fontSize: 48,
                  mb: 1,
                  boxShadow: '0 2px 8px 0 rgba(60,60,120,0.10)',
                  border: `3px solid ${theme.palette.secondary.light}`,
                  cursor: 'pointer',
                  transition: 'box-shadow 0.2s',
                  '&:hover': { boxShadow: '0 4px 16px 0 rgba(60,60,120,0.18)' },
                }}
                onClick={() => fileInputRef.current.click()}
              >
                {!editAvatar && <AccountCircleIcon fontSize="inherit" />}
              </Avatar>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleAvatarChange}
              />
              <IconButton
                onClick={() => fileInputRef.current.click()}
                sx={{
                  position: 'absolute',
                  top: 70,
                  left: 'calc(50% + 20px)',
                  bgcolor: theme.palette.secondary.light,
                  color: theme.palette.secondary.dark,
                  border: `2px solid ${theme.palette.background.paper}`,
                  boxShadow: 2,
                  '&:hover': { bgcolor: theme.palette.secondary.main, color: '#fff' },
                  zIndex: 1,
                }}
                size="small"
                aria-label="Change avatar"
              >
                <PhotoCamera fontSize="small" />
              </IconButton>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  color: theme.palette.text.primary,
                  mb: 1,
                  letterSpacing: 1,
                  mt: 2,
                }}
              >
                Account
              </Typography>
              <Stack spacing={2} sx={{ width: '100%', mt: 2, px: 1 }}>
                <TextField
                  label="Name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  variant="outlined"
                  fullWidth
                  sx={{
                    bgcolor: theme.palette.background.default,
                    borderRadius: 2,
                  }}
                  inputProps={{ maxLength: 32 }}
                />
                <TextField
                  select
                  label="Theme"
                  value={editTheme}
                  onChange={(e) => setEditTheme(e.target.value)}
                  variant="outlined"
                  fullWidth
                  sx={{
                    bgcolor: theme.palette.background.default,
                    borderRadius: 2,
                  }}
                  InputProps={{
                    startAdornment:
                      editTheme === 'dark' ? (
                        <DarkModeIcon sx={{ mr: 1, color: theme.palette.secondary.main }} />
                      ) : editTheme === 'light' ? (
                        <LightModeIcon sx={{ mr: 1, color: theme.palette.warning.main }} />
                      ) : null,
                  }}
                >
                  <MenuItem value="system">
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      System Default
                    </Typography>
                  </MenuItem>
                  <MenuItem value="light">
                    <LightModeIcon sx={{ mr: 1, color: theme.palette.warning.main }} />
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      Light
                    </Typography>
                  </MenuItem>
                  <MenuItem value="dark">
                    <DarkModeIcon sx={{ mr: 1, color: theme.palette.secondary.main }} />
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      Dark
                    </Typography>
                  </MenuItem>
                </TextField>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={handleSave}
                  sx={{
                    fontWeight: 700,
                    borderRadius: 2,
                    py: 1.2,
                    fontSize: 16,
                    letterSpacing: 0.5,
                    boxShadow: '0 2px 8px 0 rgba(60,60,120,0.10)',
                  }}
                >
                  Save Changes
                </Button>
              </Stack>
              <Stack
                direction="row"
                spacing={2}
                sx={{ mt: 4, width: '100%', justifyContent: 'center' }}
              >
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteForeverIcon />}
                  onClick={() => setShowReset(true)}
                  sx={{
                    fontWeight: 600,
                    borderRadius: 2,
                    px: 2,
                    py: 1,
                    textTransform: 'none',
                    fontSize: 15,
                    letterSpacing: 0.5,
                    '&:hover': {
                      bgcolor: theme.palette.error.light,
                      color: theme.palette.error.dark,
                    },
                  }}
                >
                  Reset All Data
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  startIcon={<LogoutIcon />}
                  onClick={() => setShowLogout(true)}
                  sx={{
                    fontWeight: 600,
                    borderRadius: 2,
                    px: 2,
                    py: 1,
                    textTransform: 'none',
                    fontSize: 15,
                    letterSpacing: 0.5,
                    '&:hover': {
                      bgcolor: theme.palette.secondary.light,
                      color: theme.palette.secondary.dark,
                    },
                  }}
                >
                  Logout
                </Button>
              </Stack>
            </Box>
            {/* Reset Dialog */}
            <Dialog open={showReset} onClose={() => setShowReset(false)}>
              <DialogTitle>Reset All Data?</DialogTitle>
              <DialogContent>
                <Typography>
                  This will clear all your documents, chat history, and profile settings. Are you sure?
                </Typography>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setShowReset(false)} color="primary">
                  Cancel
                </Button>
                <Button onClick={handleReset} color="error" variant="contained">
                  Reset
                </Button>
              </DialogActions>
            </Dialog>
            {/* Logout Dialog */}
            <Dialog open={showLogout} onClose={() => setShowLogout(false)}>
              <DialogTitle>Logout?</DialogTitle>
              <DialogContent>
                <Typography>
                  This will clear your profile for demo purposes. Continue?
                </Typography>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setShowLogout(false)} color="primary">
                  Cancel
                </Button>
                <Button onClick={handleLogout} color="secondary" variant="contained">
                  Logout
                </Button>
              </DialogActions>
            </Dialog>
          </Paper>
        </Fade>
      </Box>
    </Slide>
  );
};

export default AccountPanel;
