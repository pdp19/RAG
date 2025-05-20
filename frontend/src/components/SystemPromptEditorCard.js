
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Stack,
  Snackbar,
  Alert,
  useTheme,
} from '@mui/material';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';
import SaveIcon from '@mui/icons-material/Save';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import CancelIcon from '@mui/icons-material/Cancel';

const LOCAL_STORAGE_KEY = 'rag_system_prompt';
const DEFAULT_PROMPT = 'You are a helpful AI assistant.';

const SystemPromptPanel = ({ open, onClose }) => {
  const theme = useTheme();
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [originalPrompt, setOriginalPrompt] = useState(DEFAULT_PROMPT);
  const [editing, setEditing] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY) || DEFAULT_PROMPT;
      setPrompt(saved);
      setOriginalPrompt(saved);
      setEditing(false);
    } catch {
      setPrompt(DEFAULT_PROMPT);
      setOriginalPrompt(DEFAULT_PROMPT);
      setEditing(false);
    }
  }, [open]);

  const handleChange = (e) => {
    setPrompt(e.target.value);
    setEditing(true);
  };

  const handleSave = () => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, prompt);
      setOriginalPrompt(prompt);
      setEditing(false);
      setSnackbar({ open: true, message: 'System prompt saved successfully!', severity: 'success' });
      if (onClose) onClose();
    } catch {
      setSnackbar({ open: true, message: 'Failed to save prompt.', severity: 'error' });
    }
  };

  const handleReset = () => {
    setPrompt(DEFAULT_PROMPT);
    setEditing(true);
    setSnackbar({ open: true, message: 'Prompt reset to default.', severity: 'info' });
  };

  const handleCancel = () => {
    setPrompt(originalPrompt);
    setEditing(false);
    setSnackbar({ open: true, message: 'Changes discarded.', severity: 'info' });
  };

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  return (
    <Box sx={{ width: '100%' }}>
      <Card
        elevation={8}
        sx={{
          width: '100%',
          borderRadius: 4,
          bgcolor: theme.palette.background.paper,
          border: `2.5px solid ${theme.palette.warning.main}`,
          boxShadow: '0 4px 24px 0 rgba(60,60,120,0.10)',
          transition: 'border 0.2s, box-shadow 0.2s',
          position: 'relative',
        }}
        aria-label="System prompt editor"
      >
        <CardContent
          sx={{
            p: { xs: 2, md: 4 },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              mb: 1,
              gap: 1,
            }}
          >
            <SettingsSuggestIcon
              sx={{
                color: theme.palette.warning.main,
                fontSize: 38,
              }}
              aria-label="System prompt"
            />
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                color: theme.palette.text.primary,
                letterSpacing: 0.5,
              }}
            >
              System Prompt
            </Typography>
          </Box>
          <TextField
            label="System Prompt"
            value={prompt}
            onChange={handleChange}
            multiline
            minRows={5}
            maxRows={10}
            fullWidth
            variant="outlined"
            sx={{
              bgcolor: theme.palette.background.default,
              borderRadius: 2,
              fontSize: 16,
              fontWeight: 500,
              mb: 1,
              '& .MuiInputLabel-root': {
                fontWeight: 600,
                color: theme.palette.warning.main,
              },
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                fontWeight: 500,
                fontSize: 16,
              },
            }}
            inputProps={{
              'aria-label': 'System prompt editor',
              style: { fontFamily: 'monospace', fontSize: 16 },
            }}
          />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 1, width: '100%' }}>
            <Button
              variant="contained"
              color="warning"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={!editing}
              sx={{
                fontWeight: 600,
                minWidth: 100,
                boxShadow: 2,
                textTransform: 'none',
              }}
              aria-label="Save system prompt"
            >
              Save
            </Button>
            <Button
              variant="outlined"
              color="warning"
              startIcon={<RestartAltIcon />}
              onClick={handleReset}
              disabled={prompt === DEFAULT_PROMPT}
              sx={{
                fontWeight: 600,
                minWidth: 100,
                textTransform: 'none',
              }}
              aria-label="Reset system prompt"
            >
              Reset
            </Button>
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<CancelIcon />}
              onClick={handleCancel}
              disabled={!editing}
              sx={{
                fontWeight: 600,
                minWidth: 100,
                textTransform: 'none',
                borderColor: theme.palette.grey[400],
                color: theme.palette.text.secondary,
                '&:hover': {
                  borderColor: theme.palette.grey[600],
                  background: theme.palette.action.hover,
                },
              }}
              aria-label="Cancel system prompt changes"
            >
              Cancel
            </Button>
          </Stack>
          <Typography
            variant="body2"
            sx={{
              color: theme.palette.text.secondary,
              mt: 2,
              textAlign: 'center',
              fontStyle: 'italic',
              fontSize: 15,
              letterSpacing: 0.2,
            }}
            aria-live="polite"
          >
            This prompt will be prepended to every user query in the chat.
          </Typography>
        </CardContent>
      </Card>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={2500}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%', fontWeight: 500, fontSize: 15 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SystemPromptPanel;
