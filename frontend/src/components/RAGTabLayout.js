
import React, { useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Card,
  CardContent,
  Typography,
  Fade,
  Slide,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  useTheme,
  Stack,
  Tooltip,
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import MemoryIcon from '@mui/icons-material/Memory';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';
import ChatIcon from '@mui/icons-material/Chat';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import DocumentUploadCard from './DocumentUploadCard';
import ModelSelectorCard from './ModelSelectorCard';
import SystemPromptEditorCard from './SystemPromptEditorCard';
import ChatPanel from './ChatPanel';

const TABS = [
  {
    label: 'Upload',
    icon: <UploadFileIcon />,
    component: <DocumentUploadCard />,
    color: 'primary',
  },
  {
    label: 'Model',
    icon: <MemoryIcon />,
    component: <ModelSelectorCard />,
    color: 'success',
  },
  {
    label: 'Prompt',
    icon: <SettingsSuggestIcon />,
    component: <SystemPromptEditorCard />,
    color: 'secondary',
  },
  {
    label: 'Chat',
    icon: <ChatIcon />,
    component: <ChatPanel />,
    color: 'info',
  },
];

const LOCAL_KEYS = [
  'rag_uploaded_docs',
  'rag_system_prompt',
  'rag_selected_model',
  'rag_chat_history',
];

const RAGTabLayout = () => {
  const theme = useTheme();
  const [tab, setTab] = useState(0);
  const [resetOpen, setResetOpen] = useState(false);
  const [resetAnim, setResetAnim] = useState(false);

  const handleTabChange = (_, newValue) => {
    setTab(newValue);
  };

  const handleResetOpen = () => setResetOpen(true);
  const handleResetClose = () => setResetOpen(false);

  const handleResetAll = () => {
    LOCAL_KEYS.forEach((k) => localStorage.removeItem(k));
    setResetAnim(true);
    setTimeout(() => setResetAnim(false), 1200);
    setResetOpen(false);
    window.location.reload();
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.secondary.light} 100%)`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        py: { xs: 2, md: 6 },
        px: { xs: 0, md: 2 },
        transition: 'background 0.5s',
      }}
    >
      <Card
        elevation={12}
        sx={{
          width: { xs: '98vw', sm: 500, md: 600, lg: 700 },
          minHeight: { xs: 420, md: 520 },
          borderRadius: 6,
          boxShadow: theme.shadows[12],
          mx: 'auto',
          mt: { xs: 1, md: 4 },
          mb: 6,
          overflow: 'visible',
          position: 'relative',
          bgcolor: theme.palette.background.paper,
          transition: 'box-shadow 0.3s, background 0.3s',
        }}
      >
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            pt: 3,
            pb: 1,
            px: { xs: 1, md: 4 },
            bgcolor: 'transparent',
          }}
        >
          <Tabs
            value={tab}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{
              mb: 2,
              borderRadius: 4,
              bgcolor: theme.palette.background.default,
              boxShadow: 2,
              minHeight: 56,
              '& .MuiTabs-indicator': {
                height: 5,
                borderRadius: 3,
                bgcolor: theme.palette.primary.main,
                transition: 'background 0.3s',
              },
            }}
            aria-label="RAG main navigation tabs"
          >
            {TABS.map((t, idx) => (
              <Tab
                key={t.label}
                icon={t.icon}
                label={
                  <Typography
                    sx={{
                      fontWeight: 700,
                      fontSize: 16,
                      color:
                        tab === idx
                          ? theme.palette[t.color].main
                          : theme.palette.text.secondary,
                      letterSpacing: 0.5,
                    }}
                  >
                    {t.label}
                  </Typography>
                }
                sx={{
                  minHeight: 56,
                  py: 1.5,
                  px: 2,
                  borderRadius: 3,
                  mx: 0.5,
                  transition: 'background 0.2s, color 0.2s',
                  bgcolor:
                    tab === idx
                      ? theme.palette.action.selected
                      : 'transparent',
                  '&.Mui-selected': {
                    bgcolor: theme.palette.action.selected,
                  },
                }}
                aria-label={t.label}
              />
            ))}
          </Tabs>
        </Box>
        <Box
          sx={{
            px: { xs: 1, md: 4 },
            pb: 4,
            pt: 1,
            minHeight: { xs: 320, md: 400 },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Fade in timeout={500}>
            <Box sx={{ width: '100%' }}>
              <Slide
                in
                direction="up"
                timeout={500}
                mountOnEnter
                unmountOnExit
                key={tab}
              >
                <Box sx={{ width: '100%' }}>{TABS[tab].component}</Box>
              </Slide>
            </Box>
          </Fade>
        </Box>
      </Card>
      <Tooltip title="Reset all data" arrow>
        <Fab
          color="error"
          aria-label="reset"
          onClick={handleResetOpen}
          sx={{
            position: 'fixed',
            bottom: { xs: 24, md: 40 },
            right: { xs: 24, md: 60 },
            zIndex: 2000,
            boxShadow: 6,
            animation: resetAnim
              ? 'resetPulse 1.2s cubic-bezier(.4,2,.6,1) infinite alternate'
              : 'none',
            '@keyframes resetPulse': {
              to: { boxShadow: `0 0 0 16px ${theme.palette.error.light}` },
            },
          }}
        >
          <DeleteSweepIcon fontSize="large" />
        </Fab>
      </Tooltip>
      <Dialog
        open={resetOpen}
        onClose={handleResetClose}
        aria-labelledby="reset-dialog-title"
        aria-describedby="reset-dialog-description"
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle id="reset-dialog-title" sx={{ fontWeight: 700 }}>
          Reset All Data?
        </DialogTitle>
        <DialogContent>
          <Typography id="reset-dialog-description" sx={{ mb: 2 }}>
            This will permanently clear all uploaded documents, chat history, system prompt, and model selection. Are you sure you want to continue?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleResetClose} color="primary" variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={handleResetAll}
            color="error"
            variant="contained"
            sx={{ fontWeight: 700 }}
          >
            Reset All
          </Button>
        </DialogActions>
      </Dialog>
      <Box
        sx={{
          mt: 4,
          mb: 2,
          textAlign: 'center',
          color: theme.palette.text.disabled,
          fontSize: 15,
          fontStyle: 'italic',
        }}
      >
        Retrieval-Augmented Generation (RAG) Demo &mdash; All data is stored in your browser.
      </Box>
    </Box>
  );
};

export default RAGTabLayout;
