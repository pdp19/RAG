
import React, { useRef, useState, useEffect } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Button,
  Paper,
  Slide,
  Fade,
  Stack,
  useTheme,
  CircularProgress,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import CloseIcon from '@mui/icons-material/Close';
import { styled } from '@mui/material/styles';
import * as pdfjsLib from 'pdfjs-dist/build/pdf';
import mammoth from 'mammoth';

// PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc =
  `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const ACCEPTED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
];

const FileInput = styled('input')({
  display: 'none',
});

const getFileExtension = (name) => name.split('.').pop().toLowerCase();

const parsePDF = async (file) => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let text = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((item) => item.str).join(' ') + '\n';
  }
  return text;
};

const parseDOCX = async (file) => {
  const arrayBuffer = await file.arrayBuffer();
  const { value } = await mammoth.extractRawText({ arrayBuffer });
  return value;
};

const parseTXT = async (file) => {
  return await file.text();
};

const parseFile = async (file) => {
  const ext = getFileExtension(file.name);
  if (file.type === 'application/pdf' || ext === 'pdf') {
    return await parsePDF(file);
  }
  if (
    file.type ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    ext === 'docx'
  ) {
    return await parseDOCX(file);
  }
  if (file.type === 'text/plain' || ext === 'txt') {
    return await parseTXT(file);
  }
  throw new Error('Unsupported file type');
};

const storeDocuments = (docs) => {
  localStorage.setItem('rag_documents', JSON.stringify(docs));
};

const getStoredDocuments = () => {
  try {
    return JSON.parse(localStorage.getItem('rag_documents')) || [];
  } catch {
    return [];
  }
};

const DocumentUploadPanel = ({ open, onClose }) => {
  const theme = useTheme();
  const fileInputRef = useRef();
  const [dragActive, setDragActive] = useState(false);
  const [documents, setDocuments] = useState(getStoredDocuments());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedDocs, setSelectedDocs] = useState([]);

  useEffect(() => {
    setSelectedDocs([]);
  }, [open]);

  const handleFiles = async (files) => {
    setError('');
    setLoading(true);
    const newDocs = [];
    for (let file of files) {
      if (!ACCEPTED_TYPES.includes(file.type) && !['pdf', 'docx', 'txt'].includes(getFileExtension(file.name))) {
        setError('Unsupported file type.');
        setLoading(false);
        return;
      }
      try {
        const content = await parseFile(file);
        newDocs.push({
          name: file.name,
          type: file.type,
          size: file.size,
          content: content.slice(0, 100000), // limit for localStorage
          uploadedAt: Date.now(),
        });
      } catch (e) {
        setError('Failed to parse file: ' + file.name);
        setLoading(false);
        return;
      }
    }
    const updatedDocs = [...documents, ...newDocs];
    setDocuments(updatedDocs);
    storeDocuments(updatedDocs);
    setLoading(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleRemove = (idx) => {
    const updatedDocs = documents.filter((_, i) => i !== idx);
    setDocuments(updatedDocs);
    storeDocuments(updatedDocs);
    setSelectedDocs((prev) => prev.filter((i) => i !== idx));
  };

  const handleClearAll = () => {
    setDocuments([]);
    storeDocuments([]);
    setSelectedDocs([]);
  };

  const handleSelect = (idx) => {
    setSelectedDocs((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const handleSelectAll = () => {
    setSelectedDocs(documents.map((_, idx) => idx));
  };

  const handleDeselectAll = () => {
    setSelectedDocs([]);
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
              minHeight: { xs: '100vh', md: 520 },
              maxHeight: { xs: '100vh', md: 700 },
              boxShadow: '0 8px 32px 0 rgba(60,60,120,0.18)',
              bgcolor: theme.palette.background.paper,
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              overflow: 'hidden',
              border: `2px solid ${theme.palette.primary.light}`,
              transition: 'box-shadow 0.3s, border 0.3s',
            }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
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
              aria-label="Close upload panel"
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
              <CloudUploadIcon
                sx={{
                  fontSize: 56,
                  color: dragActive
                    ? theme.palette.primary.main
                    : theme.palette.primary.light,
                  mb: 1,
                  transition: 'color 0.2s',
                }}
              />
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  color: theme.palette.text.primary,
                  mb: 1,
                  letterSpacing: 1,
                }}
              >
                Upload Documents
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: theme.palette.text.secondary,
                  mb: 2,
                  textAlign: 'center',
                  maxWidth: 320,
                }}
              >
                Drag & drop PDF, DOCX, or TXT files here, or{' '}
                <Button
                  variant="text"
                  onClick={() => fileInputRef.current.click()}
                  sx={{
                    color: theme.palette.primary.main,
                    fontWeight: 600,
                    textTransform: 'none',
                    fontSize: 16,
                    px: 0.5,
                  }}
                >
                  browse
                </Button>
                to select files.
              </Typography>
              <FileInput
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.txt"
                multiple
                onChange={handleFileInput}
              />
              {loading && (
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 2 }}>
                  <CircularProgress size={24} color="primary" />
                  <Typography variant="body2" color="primary">
                    Parsing document...
                  </Typography>
                </Stack>
              )}
              {error && (
                <Typography
                  variant="body2"
                  color="error"
                  sx={{ mt: 2, fontWeight: 500, textAlign: 'center' }}
                >
                  {error}
                </Typography>
              )}
              <Box sx={{ width: '100%', mt: 3 }}>
                {documents.length > 0 && (
                  <Stack spacing={2}>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 600,
                        color: theme.palette.primary.main,
                        mb: 1,
                        letterSpacing: 0.5,
                      }}
                    >
                      Uploaded Documents
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                      <Button
                        variant="outlined"
                        color="primary"
                        size="small"
                        onClick={handleSelectAll}
                        sx={{
                          fontWeight: 600,
                          borderRadius: 2,
                          px: 2,
                          py: 0.5,
                          textTransform: 'none',
                          fontSize: 14,
                          letterSpacing: 0.5,
                        }}
                        disabled={selectedDocs.length === documents.length}
                      >
                        Select All
                      </Button>
                      <Button
                        variant="outlined"
                        color="primary"
                        size="small"
                        onClick={handleDeselectAll}
                        sx={{
                          fontWeight: 600,
                          borderRadius: 2,
                          px: 2,
                          py: 0.5,
                          textTransform: 'none',
                          fontSize: 14,
                          letterSpacing: 0.5,
                        }}
                        disabled={selectedDocs.length === 0}
                      >
                        Deselect All
                      </Button>
                    </Stack>
                    <Box
                      sx={{
                        maxHeight: 180,
                        overflowY: 'auto',
                        pr: 1,
                        mb: 1,
                      }}
                    >
                      {documents.map((doc, idx) => (
                        <Paper
                          key={doc.name + doc.uploadedAt}
                          elevation={2}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            p: 1.5,
                            mb: 1,
                            borderRadius: 3,
                            bgcolor: theme.palette.grey[50],
                            boxShadow: '0 2px 8px 0 rgba(60,60,120,0.06)',
                            borderLeft: `4px solid ${theme.palette.primary.main}`,
                            transition: 'box-shadow 0.2s',
                          }}
                        >
                          <Checkbox
                            checked={selectedDocs.includes(idx)}
                            onChange={() => handleSelect(idx)}
                            color="primary"
                            sx={{ mr: 1 }}
                            inputProps={{ 'aria-label': `Select document ${doc.name}` }}
                          />
                          <InsertDriveFileIcon
                            sx={{
                              color: theme.palette.primary.main,
                              fontSize: 32,
                              mr: 1.5,
                            }}
                          />
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography
                              variant="body1"
                              sx={{
                                fontWeight: 600,
                                color: theme.palette.text.primary,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                maxWidth: 140,
                              }}
                            >
                              {doc.name}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                color: theme.palette.text.secondary,
                                fontSize: 12,
                              }}
                            >
                              {Math.round(doc.size / 1024)} KB
                            </Typography>
                          </Box>
                          <IconButton
                            aria-label="Remove document"
                            onClick={() => handleRemove(idx)}
                            sx={{
                              color: theme.palette.error.main,
                              ml: 1,
                              '&:hover': {
                                bgcolor: theme.palette.error.light,
                                color: theme.palette.error.dark,
                              },
                            }}
                          >
                            <DeleteForeverIcon />
                          </IconButton>
                        </Paper>
                      ))}
                    </Box>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={handleClearAll}
                      sx={{
                        fontWeight: 600,
                        borderRadius: 2,
                        px: 2,
                        py: 1,
                        alignSelf: 'flex-end',
                        boxShadow: 'none',
                        textTransform: 'none',
                        fontSize: 15,
                        letterSpacing: 0.5,
                        '&:hover': {
                          bgcolor: theme.palette.error.light,
                          color: theme.palette.error.dark,
                        },
                      }}
                      startIcon={<DeleteForeverIcon />}
                    >
                      Clear All
                    </Button>
                  </Stack>
                )}
              </Box>
            </Box>
          </Paper>
        </Fade>
      </Box>
    </Slide>
  );
};

export default DocumentUploadPanel;
