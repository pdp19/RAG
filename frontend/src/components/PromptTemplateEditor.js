
import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  TextField,
  Tooltip,
  Snackbar,
  Alert,
  useTheme,
} from '@mui/material';
import EditNoteIcon from '@mui/icons-material/EditNote';

const PromptTemplateEditor = ({
  initialTemplate = '',
  onTemplateUpdate,
  sx,
}) => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [template, setTemplate] = useState(initialTemplate);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ open: false, type: 'success', message: '' });

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setTemplate(initialTemplate);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/update-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt_template: template }),
      });
      if (!res.ok) throw new Error('Failed to update prompt template');
      setFeedback({
        open: true,
        type: 'success',
        message: 'Prompt template updated successfully!',
      });
      setOpen(false);
      if (onTemplateUpdate) onTemplateUpdate(template);
    } catch (err) {
      setFeedback({
        open: true,
        type: 'error',
        message: 'Failed to update prompt template.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleFeedbackClose = () => setFeedback((prev) => ({ ...prev, open: false }));

  return (
    <Box sx={{ display: 'inline-block', ...sx }}>
      <Tooltip title="Edit Prompt Template" arrow>
        <IconButton
          color="secondary"
          onClick={handleOpen}
          sx={{
            bgcolor: theme.palette.background.paper,
            boxShadow: 2,
            borderRadius: 2,
            '&:hover': { bgcolor: theme.palette.secondary.light },
          }}
          aria-label="Edit prompt template"
        >
          <EditNoteIcon sx={{ fontSize: 28 }} />
        </IconButton>
      </Tooltip>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        aria-labelledby="prompt-template-dialog-title"
      >
        <DialogTitle
          id="prompt-template-dialog-title"
          sx={{
            bgcolor: theme.palette.secondary.main,
            color: theme.palette.secondary.contrastText,
            fontWeight: 700,
            letterSpacing: 1,
          }}
        >
          Edit Prompt Template
        </DialogTitle>
        <DialogContent sx={{ py: 3, bgcolor: theme.palette.background.default }}>
          <TextField
            label="Prompt Template"
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
            multiline
            minRows={6}
            fullWidth
            variant="outlined"
            sx={{
              bgcolor: theme.palette.background.paper,
              borderRadius: 2,
              fontSize: 16,
              fontWeight: 500,
            }}
            inputProps={{
              'aria-label': 'Prompt template editor',
              style: { fontFamily: 'monospace', fontSize: 16 },
            }}
            disabled={saving}
          />
        </DialogContent>
        <DialogActions sx={{ bgcolor: theme.palette.background.default, pb: 2 }}>
          <Button onClick={handleClose} color="inherit" disabled={saving}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            color="secondary"
            variant="contained"
            disabled={saving || !template.trim()}
            sx={{ fontWeight: 600, minWidth: 100 }}
          >
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={feedback.open}
        autoHideDuration={4000}
        onClose={handleFeedbackClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={handleFeedbackClose}
          severity={feedback.type}
          variant="filled"
          sx={{
            width: '100%',
            fontWeight: 500,
            fontSize: 16,
            boxShadow: 2,
          }}
          aria-live="polite"
        >
          {feedback.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PromptTemplateEditor;
