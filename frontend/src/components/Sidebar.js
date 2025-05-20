
import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemAvatar,
  Avatar,
  IconButton,
  Divider,
  Stack,
  Tooltip,
  CircularProgress,
  Button,
  useTheme,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import HistoryIcon from '@mui/icons-material/History';
import ModelTrainingIcon from '@mui/icons-material/ModelTraining';

const Sidebar = ({
  onSelectChat,
  selectedChatId,
  onModelChange,
  onClearChatHistory,
}) => {
  const theme = useTheme();
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const [loadingChats, setLoadingChats] = useState(false);
  const [clearingChats, setClearingChats] = useState(false);
  const [error, setError] = useState('');

  // Fetch models on mount
  useEffect(() => {
    setLoadingModels(true);
    fetch('/api/models')
      .then((res) => res.json())
      .then((data) => {
        setModels(data.models || []);
        if (data.models && data.models.length > 0) {
          setSelectedModel(data.models[0].id);
          // Optionally, select the first model by default
          fetch('/api/select-model', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ model_id: data.models[0].id }),
          });
        }
      })
      .catch(() => setError('Failed to load models'))
      .finally(() => setLoadingModels(false));
  }, []);

  // Fetch chat history on mount and after clearing
  const fetchChatHistory = () => {
    setLoadingChats(true);
    fetch('/api/chat-history')
      .then((res) => res.json())
      .then((data) => setChatHistory(data.history || []))
      .catch(() => setError('Failed to load chat history'))
      .finally(() => setLoadingChats(false));
  };

  useEffect(() => {
    fetchChatHistory();
  }, []);

  // Handle model selection
  const handleModelChange = (event) => {
    const modelId = event.target.value;
    setSelectedModel(modelId);
    fetch('/api/select-model', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model_id: modelId }),
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        if (onModelChange) onModelChange(modelId);
      })
      .catch(() => setError('Failed to select model'));
  };

  // Handle chat selection
  const handleChatClick = (chatId) => {
    if (onSelectChat) onSelectChat(chatId);
  };

  // Handle clear chat history
  const handleClearChatHistory = () => {
    setClearingChats(true);
    fetch('/api/chat-history', { method: 'DELETE' })
      .then((res) => {
        if (!res.ok) throw new Error();
        setChatHistory([]);
        if (onClearChatHistory) onClearChatHistory();
      })
      .catch(() => setError('Failed to clear chat history'))
      .finally(() => setClearingChats(false));
  };

  return (
    <Box
      sx={{
        width: { xs: '100vw', sm: 340 },
        minWidth: { sm: 280 },
        maxWidth: 400,
        height: '100vh',
        bgcolor: theme.palette.background.paper,
        borderRight: `1.5px solid ${theme.palette.divider}`,
        display: 'flex',
        flexDirection: 'column',
        position: { xs: 'relative', sm: 'fixed' },
        zIndex: 10,
        boxShadow: { sm: 3 },
        p: 0,
      }}
      aria-label="Sidebar"
    >
      {/* Header */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{
          px: 3,
          py: 2,
          bgcolor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <HistoryIcon fontSize="large" />
          <Typography variant="h6" fontWeight={700} sx={{ letterSpacing: 1 }}>
            Chat History
          </Typography>
        </Stack>
        <Tooltip title="Clear Chat History">
          <span>
            <IconButton
              aria-label="clear chat history"
              onClick={handleClearChatHistory}
              disabled={clearingChats || loadingChats}
              sx={{
                color: theme.palette.primary.contrastText,
                '&:hover': { color: theme.palette.error.main },
              }}
            >
              {clearingChats ? <CircularProgress size={22} color="inherit" /> : <DeleteIcon />}
            </IconButton>
          </span>
        </Tooltip>
      </Stack>

      {/* Model Selection */}
      <Box sx={{ px: 3, pt: 2, pb: 1 }}>
        <FormControl fullWidth variant="outlined" size="small">
          <InputLabel id="model-select-label">
            <ModelTrainingIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Model
          </InputLabel>
          <Select
            labelId="model-select-label"
            id="model-select"
            value={selectedModel}
            label="Model"
            onChange={handleModelChange}
            disabled={loadingModels}
            sx={{
              bgcolor: theme.palette.background.default,
              fontWeight: 500,
              borderRadius: 2,
            }}
            MenuProps={{
              PaperProps: {
                sx: {
                  maxHeight: 300,
                },
              },
            }}
            inputProps={{
              'aria-label': 'Select LLM Model',
            }}
          >
            {loadingModels ? (
              <MenuItem value="">
                <CircularProgress size={20} sx={{ mr: 2 }} />
                Loading...
              </MenuItem>
            ) : (
              models.map((model) => (
                <MenuItem key={model.id} value={model.id}>
                  {model.name || model.id}
                </MenuItem>
              ))
            )}
          </Select>
        </FormControl>
      </Box>

      <Divider sx={{ my: 1 }} />

      {/* Chat History List */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          px: 1,
          pb: 2,
        }}
        aria-label="Chat History List"
      >
        {loadingChats ? (
          <Stack alignItems="center" justifyContent="center" sx={{ mt: 6 }}>
            <CircularProgress />
            <Typography variant="body2" sx={{ mt: 2 }}>
              Loading chat history...
            </Typography>
          </Stack>
        ) : chatHistory.length === 0 ? (
          <Stack alignItems="center" justifyContent="center" sx={{ mt: 6 }}>
            <Typography variant="body2" color="text.secondary">
              No chat history yet.
            </Typography>
          </Stack>
        ) : (
          <List dense>
            {chatHistory.map((chat) => (
              <ListItem
                key={chat.id}
                disablePadding
                sx={{
                  mb: 1,
                  borderRadius: 2,
                  bgcolor:
                    selectedChatId === chat.id
                      ? theme.palette.action.selected
                      : 'transparent',
                  boxShadow:
                    selectedChatId === chat.id
                      ? 2
                      : 'none',
                  transition: 'background 0.2s',
                }}
                secondaryAction={
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ minWidth: 60, textAlign: 'right', pr: 1 }}
                  >
                    {chat.timestamp
                      ? new Date(chat.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : ''}
                  </Typography>
                }
              >
                <ListItemButton
                  onClick={() => handleChatClick(chat.id)}
                  selected={selectedChatId === chat.id}
                  sx={{
                    borderRadius: 2,
                    py: 1.2,
                    px: 2,
                  }}
                  aria-label={`Open chat from ${chat.timestamp ? new Date(chat.timestamp).toLocaleString() : 'unknown time'}`}
                >
                  <ListItemAvatar>
                    <Avatar
                      sx={{
                        bgcolor: theme.palette.secondary.light,
                        color: theme.palette.secondary.contrastText,
                        width: 36,
                        height: 36,
                        fontWeight: 700,
                        fontSize: 18,
                      }}
                    >
                      {chat.title
                        ? chat.title[0].toUpperCase()
                        : <HistoryIcon fontSize="small" />}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography
                        variant="subtitle1"
                        fontWeight={selectedChatId === chat.id ? 700 : 500}
                        noWrap
                        sx={{
                          color:
                            selectedChatId === chat.id
                              ? theme.palette.primary.main
                              : theme.palette.text.primary,
                        }}
                      >
                        {chat.title || 'Untitled Chat'}
                      </Typography>
                    }
                    secondary={
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        noWrap
                        sx={{ maxWidth: 180 }}
                      >
                        {chat.preview || ''}
                      </Typography>
                    }
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}
      </Box>

      {/* Error Snackbar */}
      {error && (
        <Box sx={{ px: 3, pb: 2 }}>
          <Typography variant="body2" color="error" aria-live="polite">
            {error}
          </Typography>
        </Box>
      )}

      {/* Footer */}
      <Box
        sx={{
          px: 3,
          py: 1.5,
          bgcolor: theme.palette.background.default,
          borderTop: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: 'block', textAlign: 'center' }}
        >
          &copy; {new Date().getFullYear()} RAG App
        </Typography>
      </Box>
    </Box>
  );
};

export default Sidebar;
