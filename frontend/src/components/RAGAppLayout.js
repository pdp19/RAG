
import React, { useState, useEffect, useCallback } from 'react';
import { Box, Grid, Drawer, IconButton, useMediaQuery, useTheme, AppBar, Toolbar, Typography, CssBaseline, Slide } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Sidebar from './Sidebar';
import ChatPanel from './ChatPanel';
import UploadButton from './UploadButton';
import PromptTemplateEditor from './PromptTemplateEditor';

const drawerWidth = 340;

const RAGAppLayout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // State management
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [conversation, setConversation] = useState([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [promptTemplate, setPromptTemplate] = useState('');
  const [chatHistoryVersion, setChatHistoryVersion] = useState(0);

  // Fetch prompt template on mount (optional, fallback to default)
  useEffect(() => {
    fetch('/api/update-prompt', { method: 'GET' })
      .then(res => res.ok ? res.json() : { prompt_template: '' })
      .then(data => setPromptTemplate(data.prompt_template || ''))
      .catch(() => setPromptTemplate(''));
  }, []);

  // Fetch conversation when selectedChatId changes
  const fetchConversation = useCallback((chatId) => {
    if (!chatId) {
      setConversation([]);
      return;
    }
    fetch(`/api/chat-history?chat_id=${chatId}`)
      .then(res => res.ok ? res.json() : { conversation: [] })
      .then(data => setConversation(data.conversation || []))
      .catch(() => setConversation([]));
  }, []);

  useEffect(() => {
    if (selectedChatId) {
      fetchConversation(selectedChatId);
    } else {
      setConversation([]);
    }
  }, [selectedChatId, fetchConversation, chatHistoryVersion]);

  // Handlers
  const handleSelectChat = (chatId) => {
    setSelectedChatId(chatId);
    if (isMobile) setSidebarOpen(false);
  };

  const handleModelChange = (modelId) => {
    setSelectedModel(modelId);
  };

  const handleClearChatHistory = () => {
    setSelectedChatId(null);
    setConversation([]);
    setChatHistoryVersion(v => v + 1);
  };

  const handleUploadSuccess = () => {
    // Optionally, refresh context or show feedback
  };

  const handleTemplateUpdate = (newTemplate) => {
    setPromptTemplate(newTemplate);
  };

  // For editing user messages in ChatPanel
  const handleEditMessage = (idx, newContent, updatedMessages) => {
    setConversation(updatedMessages);
    // Optionally, update backend with edited message
  };

  // For sending a new message in ChatPanel
  const handleSendMessage = (msg) => {
    // Optionally, update conversation state here
  };

  // Layout
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <CssBaseline />
      {/* AppBar for mobile */}
      {isMobile && (
        <AppBar position="fixed" color="primary" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
          <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <IconButton
              color="inherit"
              edge="start"
              onClick={() => setSidebarOpen(true)}
              aria-label="open sidebar"
              size="large"
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: 1 }}>
              RAG Application
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PromptTemplateEditor
                initialTemplate={promptTemplate}
                onTemplateUpdate={handleTemplateUpdate}
                sx={{ mr: 1 }}
              />
              <UploadButton onUploadSuccess={handleUploadSuccess} />
            </Box>
          </Toolbar>
        </AppBar>
      )}

      {/* Sidebar */}
      {isMobile ? (
        <Drawer
          anchor="left"
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              bgcolor: 'background.paper',
            },
          }}
        >
          <Sidebar
            onSelectChat={handleSelectChat}
            selectedChatId={selectedChatId}
            onModelChange={handleModelChange}
            onClearChatHistory={handleClearChatHistory}
          />
        </Drawer>
      ) : (
        <Slide direction="right" in mountOnEnter unmountOnExit>
          <Box
            sx={{
              width: drawerWidth,
              flexShrink: 0,
              bgcolor: 'background.paper',
              borderRight: `1.5px solid ${theme.palette.divider}`,
              minHeight: '100vh',
              position: 'fixed',
              zIndex: 10,
            }}
          >
            <Sidebar
              onSelectChat={handleSelectChat}
              selectedChatId={selectedChatId}
              onModelChange={handleModelChange}
              onClearChatHistory={handleClearChatHistory}
            />
          </Box>
        </Slide>
      )}

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          ml: { sm: `${drawerWidth}px` },
          width: { xs: '100vw', sm: `calc(100vw - ${drawerWidth}px)` },
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          pt: isMobile ? 8 : 0,
          transition: 'margin 0.3s',
        }}
      >
        {/* Top-right controls for desktop */}
        {!isMobile && (
          <Box
            sx={{
              position: 'absolute',
              top: 24,
              right: 32,
              zIndex: 1200,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <PromptTemplateEditor
              initialTemplate={promptTemplate}
              onTemplateUpdate={handleTemplateUpdate}
            />
            <UploadButton onUploadSuccess={handleUploadSuccess} />
          </Box>
        )}

        {/* Chat Panel */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'stretch',
            justifyContent: 'center',
            minHeight: '100vh',
            pt: { xs: 2, sm: 6 },
            pb: { xs: 2, sm: 4 },
            px: { xs: 0, sm: 4 },
          }}
        >
          <ChatPanel
            conversation={conversation}
            onSendMessage={handleSendMessage}
            selectedModel={selectedModel}
            onEditMessage={handleEditMessage}
            chatId={selectedChatId}
            fetchConversation={fetchConversation}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default RAGAppLayout;
