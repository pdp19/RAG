
import React, { useRef, useState } from 'react';
import {
  Box,
  IconButton,
  Tooltip,
  CircularProgress,
  Snackbar,
  Alert,
  LinearProgress,
  useTheme,
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';

const UploadButton = ({ onUploadSuccess }) => {
  const theme = useTheme();
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [feedback, setFeedback] = useState({ open: false, type: 'success', message: '' });

  const handleButtonClick = () => {
    if (!uploading) fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append('file', file);

    // Use XMLHttpRequest for progress
    const xhr = new window.XMLHttpRequest();
    xhr.open('POST', '/api/upload-doc', true);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        setProgress(Math.round((event.loaded * 100) / event.total));
      }
    };

    xhr.onload = () => {
      setUploading(false);
      setProgress(0);
      if (xhr.status === 200 || xhr.status === 201) {
        setFeedback({
          open: true,
          type: 'success',
          message: 'Document uploaded successfully!',
        });
        if (onUploadSuccess) onUploadSuccess(JSON.parse(xhr.responseText));
      } else {
        setFeedback({
          open: true,
          type: 'error',
          message:
            xhr.responseText
              ? JSON.parse(xhr.responseText).error || 'Upload failed.'
              : 'Upload failed.',
        });
      }
      e.target.value = '';
    };

    xhr.onerror = () => {
      setUploading(false);
      setProgress(0);
      setFeedback({
        open: true,
        type: 'error',
        message: 'Network error during upload.',
      });
      e.target.value = '';
    };

    xhr.send(formData);
  };

  const handleCloseFeedback = () => {
    setFeedback((prev) => ({ ...prev, open: false }));
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        top: { xs: 12, sm: 24 },
        right: { xs: 12, sm: 32 },
        zIndex: 1200,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
      }}
    >
      <Tooltip title="Upload Document" arrow>
        <span>
          <IconButton
            color="primary"
            aria-label="Upload document"
            onClick={handleButtonClick}
            disabled={uploading}
            sx={{
              bgcolor: theme.palette.background.paper,
              boxShadow: 3,
              borderRadius: 2,
              width: 56,
              height: 56,
              '&:hover': {
                bgcolor: theme.palette.primary.light,
              },
            }}
            size="large"
          >
            {uploading ? (
              <CircularProgress size={32} color="primary" />
            ) : (
              <UploadFileIcon sx={{ fontSize: 32 }} />
            )}
          </IconButton>
        </span>
      </Tooltip>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.txt,.md,.rtf,.odt"
        style={{ display: 'none' }}
        onChange={handleFileChange}
        aria-label="Select document to upload"
      />
      {uploading && (
        <Box sx={{ width: 180, mt: 1 }}>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 8,
              borderRadius: 2,
              bgcolor: theme.palette.grey[200],
              '& .MuiLinearProgress-bar': {
                bgcolor: theme.palette.primary.main,
              },
            }}
            aria-label="Upload progress"
          />
        </Box>
      )}
      <Snackbar
        open={feedback.open}
        autoHideDuration={4000}
        onClose={handleCloseFeedback}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseFeedback}
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

export default UploadButton;
