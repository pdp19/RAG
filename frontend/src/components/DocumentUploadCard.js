
import React, { useRef, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Fade,
  Stack,
  Tooltip,
  useTheme,
  Slide,
} from '@mui/material';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DescriptionIcon from '@mui/icons-material/Description';
import ArticleIcon from '@mui/icons-material/Article';

// Helper: get file icon by extension
const getFileIcon = (ext) => {
  switch (ext) {
    case 'pdf':
      return <PictureAsPdfIcon color="error" />;
    case 'doc':
    case 'docx':
      return <DescriptionIcon color="primary" />;
    case 'txt':
      return <ArticleIcon color="success" />;
    default:
      return <InsertDriveFileIcon color="action" />;
  }
};

// Helper: get extension
const getExtension = (name) => {
  const parts = name.split('.');
  return parts.length > 1 ? parts.pop().toLowerCase() : '';
};

// Helper: parse file content
const parseFile = async (file) => {
  const ext = getExtension(file.name);
  if (ext === 'pdf') {
    // Dynamically import pdfjs
    const pdfjsLib = await import('pdfjs-dist/build/pdf');
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let text = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((item) => item.str).join(' ') + '\n';
    }
    return text;
  } else if (ext === 'docx') {
    // Dynamically import mammoth
    const mammoth = await import('mammoth');
    const arrayBuffer = await file.arrayBuffer();
    const { value } = await mammoth.convertToHtml({ arrayBuffer });
    // Strip HTML tags for plain text
    const div = document.createElement('div');
    div.innerHTML = value;
    return div.textContent || '';
  } else if (ext === 'txt') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  } else {
    throw new Error('Unsupported file type');
  }
};

const LOCAL_STORAGE_KEY = 'rag_uploaded_docs';

const DocumentUploadCard = () => {
  const theme = useTheme();
  const fileInputRef = useRef();
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [docs, setDocs] = useState(() => {
    // Load from localStorage if available
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [error, setError] = useState('');

  // Save docs to localStorage
  const persistDocs = (newDocs) => {
    setDocs(newDocs);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newDocs));
  };

  // Handle file selection
  const handleFiles = async (fileList) => {
    setError('');
    setUploading(true);
    const files = Array.from(fileList);
    const newDocs = [];
    for (const file of files) {
      const ext = getExtension(file.name);
      if (!['pdf', 'docx', 'txt'].includes(ext)) {
        setError(`Unsupported file type: ${file.name}`);
        continue;
      }
      try {
        const text = await parseFile(file);
        newDocs.push({
          id: `${file.name}-${Date.now()}`,
          name: file.name,
          ext,
          size: file.size,
          text,
          uploadedAt: new Date().toISOString(),
        });
      } catch (e) {
        setError(`Failed to parse ${file.name}`);
      }
    }
    if (newDocs.length) {
      const updated = [...docs, ...newDocs];
      persistDocs(updated);
    }
    setUploading(false);
  };

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };
  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  // Click to upload
  const handleCardClick = () => {
    if (!uploading) fileInputRef.current.click();
  };
  const handleInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
      e.target.value = '';
    }
  };

  // Remove a document
  const handleRemove = (id) => {
    const updated = docs.filter((doc) => doc.id !== id);
    persistDocs(updated);
  };

  // Clear all
  const handleClearAll = () => {
    persistDocs([]);
  };

  return (
    <Card
      elevation={8}
      sx={{
        maxWidth: 480,
        mx: 'auto',
        mt: { xs: 2, md: 4 },
        mb: 4,
        borderRadius: 5,
        bgcolor: dragActive
          ? theme.palette.secondary.light
          : theme.palette.background.paper,
        boxShadow: dragActive
          ? `0 0 0 4px ${theme.palette.secondary.main}33`
          : theme.shadows[8],
        transition: 'box-shadow 0.3s, background 0.3s',
        position: 'relative',
        overflow: 'visible',
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      tabIndex={0}
      aria-label="Upload documents"
    >
      <CardContent
        sx={{
          p: { xs: 3, md: 4 },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Fade in>
          <Box
            sx={{
              width: 80,
              height: 80,
              bgcolor: theme.palette.secondary.main,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2,
              boxShadow: 4,
              transition: 'background 0.3s',
              animation: dragActive
                ? 'pulse 1s infinite alternate'
                : 'none',
              '@keyframes pulse': {
                to: { boxShadow: `0 0 0 12px ${theme.palette.secondary.light}` },
              },
            }}
          >
            <CloudUploadIcon
              sx={{
                color: theme.palette.secondary.contrastText,
                fontSize: 40,
                transition: 'transform 0.3s',
                transform: dragActive ? 'scale(1.15)' : 'scale(1)',
              }}
              aria-label="Upload"
            />
          </Box>
        </Fade>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            color: theme.palette.text.primary,
            mb: 1,
            textAlign: 'center',
            letterSpacing: 1,
          }}
        >
          Upload Documents
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: theme.palette.text.secondary,
            mb: 2,
            textAlign: 'center',
            fontSize: 16,
          }}
        >
          Drag & drop PDF, DOCX, or TXT files here, or{' '}
          <Button
            variant="text"
            color="secondary"
            onClick={handleCardClick}
            sx={{ fontWeight: 600, textTransform: 'none', px: 0 }}
            aria-label="Browse files"
            disabled={uploading}
          >
            browse
          </Button>
        </Typography>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.txt"
          multiple
          style={{ display: 'none' }}
          onChange={handleInputChange}
          aria-label="File input"
        />
        {error && (
          <Typography
            variant="body2"
            color="error"
            sx={{ mt: 1, mb: 1, textAlign: 'center' }}
            role="alert"
          >
            {error}
          </Typography>
        )}
        <Box sx={{ width: '100%', mt: 2 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 600,
                color: theme.palette.text.secondary,
                letterSpacing: 0.5,
              }}
            >
              Uploaded Files
            </Typography>
            <Tooltip title="Clear all documents" arrow>
              <span>
                <IconButton
                  onClick={handleClearAll}
                  color="error"
                  disabled={docs.length === 0}
                  aria-label="Clear all documents"
                  size="small"
                  sx={{
                    bgcolor: docs.length === 0 ? 'grey.200' : 'error.light',
                    '&:hover': { bgcolor: 'error.main', color: 'white' },
                    transition: 'background 0.2s',
                  }}
                >
                  <ClearAllIcon />
                </IconButton>
              </span>
            </Tooltip>
          </Stack>
          <List dense sx={{ maxHeight: 180, overflowY: 'auto', pr: 1 }}>
            {docs.length === 0 && (
              <Typography
                variant="body2"
                sx={{
                  color: theme.palette.text.disabled,
                  textAlign: 'center',
                  mt: 2,
                  fontStyle: 'italic',
                }}
              >
                No documents uploaded yet.
              </Typography>
            )}
            {docs.map((doc, idx) => (
              <Slide
                key={doc.id}
                direction="up"
                in
                mountOnEnter
                unmountOnExit
                timeout={400 + idx * 80}
              >
                <ListItem
                  secondaryAction={
                    <Tooltip title="Remove document" arrow>
                      <IconButton
                        edge="end"
                        aria-label={`Remove ${doc.name}`}
                        onClick={() => handleRemove(doc.id)}
                        color="error"
                        sx={{
                          bgcolor: 'error.light',
                          '&:hover': { bgcolor: 'error.main', color: 'white' },
                          transition: 'background 0.2s',
                        }}
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  }
                  sx={{
                    borderRadius: 2,
                    mb: 1,
                    bgcolor: theme.palette.background.default,
                    boxShadow: 1,
                    transition: 'box-shadow 0.2s, background 0.2s',
                    '&:hover': {
                      boxShadow: 4,
                      bgcolor: theme.palette.action.hover,
                    },
                  }}
                >
                  <ListItemAvatar>
                    <Avatar
                      sx={{
                        bgcolor: theme.palette.secondary.light,
                        color: theme.palette.secondary.main,
                        width: 36,
                        height: 36,
                        mr: 1,
                      }}
                      variant="rounded"
                    >
                      {getFileIcon(doc.ext)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography
                        variant="body1"
                        sx={{
                          fontWeight: 600,
                          color: theme.palette.text.primary,
                          fontSize: 15,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: { xs: 120, sm: 200 },
                        }}
                        title={doc.name}
                      >
                        {doc.name}
                      </Typography>
                    }
                    secondary={
                      <Typography
                        variant="caption"
                        sx={{
                          color: theme.palette.text.secondary,
                          fontSize: 12,
                        }}
                      >
                        {`${(doc.size / 1024).toFixed(1)} KB`}
                      </Typography>
                    }
                  />
                </ListItem>
              </Slide>
            ))}
          </List>
        </Box>
      </CardContent>
      {/* Animated overlay for drag */}
      <Fade in={dragActive}>
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            bgcolor: `${theme.palette.secondary.light}CC`,
            borderRadius: 5,
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            transition: 'background 0.3s',
          }}
        >
          <Typography
            variant="h4"
            sx={{
              color: theme.palette.secondary.dark,
              fontWeight: 800,
              letterSpacing: 2,
              textShadow: '0 2px 8px #fff8',
            }}
          >
            Drop files to upload
          </Typography>
        </Box>
      </Fade>
    </Card>
  );
};

export default DocumentUploadCard;
