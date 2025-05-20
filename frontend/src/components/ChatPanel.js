
import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Button,
  Stack,
  Avatar,
  CircularProgress,
  Paper,
  InputAdornment,
  Tooltip,
  Fade,
  useTheme,
  Slide,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import PersonIcon from '@mui/icons-material/Person';
import SmartToyIcon from '@mui/icons-material/SmartToy';

const CHAT_HISTORY_KEY = 'rag_chat_history';
const DOCS_KEY = 'rag_documents';
const MODEL_KEY = 'rag_selected_model';
const SYSTEM_PROMPT_KEY = 'rag_system_prompt';

const getStoredDocuments = () => {
  try {
    return JSON.parse(localStorage.getItem(DOCS_KEY)) || [];
  } catch {
    return [];
  }
};

const getStoredModel = () => {
  return localStorage.getItem(MODEL_KEY) || 'gpt-3.5';
};

const getStoredSystemPrompt = () => {
  return localStorage.getItem(SYSTEM_PROMPT_KEY) || '';
};

const getStoredHistory = () => {
  try {
    return JSON.parse(localStorage.getItem(CHAT_HISTORY_KEY)) || [];
  } catch {
    return [];
  }
};

const storeHistory = (history) => {
  localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(history));
};

const storeSession = (session) => {
  const history = getStoredHistory();
  history.push(session);
  storeHistory(history);
};

const ChatPanel = ({
  chatId,
  selectedModel: propSelectedModel,
  systemPrompt: propSystemPrompt,
  onEditMessage,
  fetchConversation,
  style,
}) => {
  const theme = useTheme();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState('');
  const [editingIdx, setEditingIdx] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [documents, setDocuments] = useState(getStoredDocuments());
  const [selectedModel, setSelectedModel] = useState(propSelectedModel || getStoredModel());
  const [systemPrompt, setSystemPrompt] = useState(propSystemPrompt || getStoredSystemPrompt());
  const chatEndRef = useRef(null);

  // Always scroll to bottom on new message
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, streaming]);

  // Load documents, model, and system prompt from localStorage if changed
  useEffect(() => {
    setDocuments(getStoredDocuments());
  }, []);

  useEffect(() => {
    setSelectedModel(propSelectedModel || getStoredModel());
  }, [propSelectedModel]);

  useEffect(() => {
    setSystemPrompt(propSystemPrompt || getStoredSystemPrompt());
  }, [propSystemPrompt]);

  // Load chat history for this session if chatId changes
  useEffect(() => {
    if (chatId) {
      const history = getStoredHistory();
      const session = history.find((s) => s.id === chatId);
      setMessages(session ? session.messages : []);
    }
  }, [chatId]);

  // Save chat session to history on message change
  useEffect(() => {
    if (messages.length > 0) {
      const session = {
        id: chatId || `session-${Date.now()}`,
        title: messages[0]?.content?.slice(0, 32) || 'Chat Session',
        timestamp: messages[0]?.timestamp || Date.now(),
        messages,
      };
      // Remove duplicate session by id
      const history = getStoredHistory().filter((s) => s.id !== session.id);
      history.push(session);
      storeHistory(history);
    }
  }, [messages, chatId]);

  // Simulate LLM response using document retrieval and system prompt
  const getLLMResponse = async (userMsg) => {
    // Simple keyword search in uploaded docs
    const docs = getStoredDocuments();
    let found = '';
    if (docs.length > 0) {
      for (let doc of docs) {
        if (doc.content && userMsg) {
          const idx = doc.content.toLowerCase().indexOf(userMsg.toLowerCase().split(' ')[0]);
          if (idx !== -1) {
            found = doc.content.slice(idx, idx + 200) + (doc.content.length > idx + 200 ? '...' : '');
            break;
          }
        }
      }
    }
    // Compose response
    let response = '';
    if (systemPrompt) {
      response += `(${systemPrompt})\n\n`;
    }
    if (found) {
      response += `Here's what I found in your documents:\n${found}`;
    } else {
      response += "I'm sorry, I couldn't find relevant information in your uploaded documents.";
    }
    // Add a model signature
    response += `\n\n[Model: ${selectedModel}]`;
    return response;
  };

  // Send message handler
  const handleSend = async () => {
    if (!input.trim() || loading) return;
    setLoading(true);
    setError('');
    const userMsg = {
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setStreaming(true);

    try {
      // Simulate streaming LLM response
      const fullResponse = await getLLMResponse(input);
      let responseMsg = {
        role: 'llm',
        content: '',
        timestamp: new Date().toISOString(),
      };
      let i = 0;
      const streamInterval = setInterval(() => {
        i += 10;
        responseMsg.content = fullResponse.slice(0, i);
        setMessages((prev) => {
          if (prev[prev.length - 1]?.role === 'llm') {
            return [...prev.slice(0, -1), { ...responseMsg }];
          }
          return [...prev, { ...responseMsg }];
        });
        if (i >= fullResponse.length) {
          clearInterval(streamInterval);
          setStreaming(false);
          setLoading(false);
        }
      }, 15);
    } catch (err) {
      setError('Failed to get response from LLM.');
      setLoading(false);
      setStreaming(false);
    }
  };

  // Edit message handlers
  const handleEdit = (idx) => {
    setEditingIdx(idx);
    setEditValue(messages[idx].content);
  };

  const handleEditSave = async (idx) => {
    if (!editValue.trim()) return;
    const updatedMessages = messages.map((msg, i) =>
      i === idx ? { ...msg, content: editValue } : msg
    );
    setMessages(updatedMessages);
    setEditingIdx(null);
    setEditValue('');
    if (onEditMessage) onEditMessage(idx, editValue, updatedMessages);
    if (fetchConversation) fetchConversation(chatId);
  };

  const handleEditCancel = () => {
    setEditingIdx(null);
    setEditValue('');
  };

  // Handle Enter key for sending or saving edits
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (editingIdx !== null) {
        handleEditSave(editingIdx);
      } else {
        handleSend();
      }
    }
  };

  // Responsive, always-visible chat panel layout, seamlessly connected to tab bar
  return (
    <Box
      sx={{
        position: 'fixed',
        left: { xs: 0, sm: 70, md: 110 },
        top: 0,
        height: '100vh',
        width: {
          xs: '100vw',
          sm: 'calc(100vw - 70px)',
          md: 'calc(100vw - 110px)',
        },
        bgcolor: theme.palette.background.paper,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: 'none',
        zIndex: 1200,
        borderLeft: 'none',
        borderRadius: 0,
        m: 0,
        p: 0,
        transition: 'left 0.2s, width 0.2s, background 0.2s',
        overflow: 'auto',
      }}
      aria-label="Chat Panel"
    >
      <Box
        sx={{
          width: {
            xs: '98vw',
            sm: '80vw',
            md: '60vw',
            lg: '54vw',
            xl: '50vw',
          },
          maxWidth: 720,
          minWidth: { xs: '98vw', sm: 400, md: 420 },
          mx: 'auto',
          my: { xs: 1, sm: 3 },
          height: {
            xs: 'calc(100vh - 16px)',
            sm: 'calc(100vh - 48px)',
            md: 'calc(100vh - 64px)',
          },
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          alignItems: 'center',
          borderRadius: 5,
          boxShadow: '0 8px 32px 0 rgba(60,60,120,0.13), 0 1.5px 8px 0 rgba(60,60,120,0.08)',
          bgcolor: `linear-gradient(135deg, ${theme.palette.background.paper} 80%, ${theme.palette.primary.light} 100%)`,
          background: `linear-gradient(135deg, ${theme.palette.background.paper} 80%, ${theme.palette.primary.light} 100%)`,
          border: `1.5px solid ${theme.palette.divider}`,
          p: { xs: 0.5, sm: 2 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Conversation */}
        <Box
          sx={{
            flex: 1,
            width: '100%',
            overflowY: 'auto',
            pb: 2,
            pt: 1,
            px: { xs: 1, sm: 3 },
            maxHeight: { xs: 'calc(100vh - 180px)', sm: 'calc(100vh - 220px)' },
            transition: 'background 0.3s',
            scrollbarWidth: 'thin',
            '&::-webkit-scrollbar': {
              width: 6,
              background: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              background: theme.palette.action.hover,
              borderRadius: 3,
            },
          }}
          aria-label="Conversation"
        >
          {messages.length === 0 ? (
            <Stack alignItems="center" justifyContent="center" sx={{ mt: 8 }}>
              <Typography variant="body1" color="text.secondary">
                Start a conversation with your LLM!
              </Typography>
            </Stack>
          ) : (
            <Stack spacing={2}>
              {messages.map((msg, idx) => (
                <Slide
                  in
                  direction={msg.role === 'user' ? 'left' : 'right'}
                  timeout={400}
                  key={idx}
                  mountOnEnter
                  unmountOnExit={false}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                      alignItems: 'flex-end',
                      width: '100%',
                    }}
                  >
                    <Avatar
                      sx={{
                        bgcolor:
                          msg.role === 'user'
                            ? theme.palette.primary.main
                            : theme.palette.secondary.main,
                        color: 'primary.contrastText',
                        width: 40,
                        height: 40,
                        ml: msg.role === 'user' ? 2 : 0,
                        mr: msg.role === 'llm' ? 2 : 0,
                        boxShadow: 2,
                        border: `2.5px solid ${
                          msg.role === 'user'
                            ? theme.palette.primary.light
                            : theme.palette.secondary.light
                        }`,
                      }}
                      aria-label={msg.role === 'user' ? 'User' : 'LLM'}
                    >
                      {msg.role === 'user' ? <PersonIcon /> : <SmartToyIcon />}
                    </Avatar>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        borderRadius: 4,
                        maxWidth: { xs: '80vw', sm: 420 },
                        minWidth: 80,
                        bgcolor:
                          msg.role === 'user'
                            ? 'linear-gradient(120deg, #e3f2fd 60%, #bbdefb 100%)'
                            : 'linear-gradient(120deg, #f3e5f5 60%, #ce93d8 100%)',
                        color: 'text.primary',
                        position: 'relative',
                        boxShadow:
                          msg.role === 'user'
                            ? '0 2px 12px 0 rgba(33,150,243,0.10)'
                            : '0 2px 12px 0 rgba(156,39,176,0.10)',
                        border: msg.role === 'user'
                          ? `1.5px solid ${theme.palette.primary.main}`
                          : `1.5px solid ${theme.palette.secondary.main}`,
                        transition: 'box-shadow 0.2s, border 0.2s',
                        wordBreak: 'break-word',
                        whiteSpace: 'pre-line',
                        fontWeight: msg.role === 'user' ? 500 : 400,
                        fontSize: 16,
                        mb: 0.5,
                        mt: 0.5,
                        ml: msg.role === 'user' ? 0 : 1.5,
                        mr: msg.role === 'user' ? 1.5 : 0,
                        minHeight: 44,
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <Stack direction="row" alignItems="center" spacing={1} sx={{ width: '100%' }}>
                        {editingIdx === idx ? (
                          <>
                            <TextField
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              size="small"
                              multiline
                              fullWidth
                              variant="outlined"
                              sx={{
                                bgcolor: 'background.paper',
                                borderRadius: 2,
                              }}
                              onKeyDown={handleKeyDown}
                              inputProps={{
                                'aria-label': 'Edit message',
                              }}
                            />
                            <Tooltip title="Save">
                              <IconButton
                                color="success"
                                onClick={() => handleEditSave(idx)}
                                sx={{ ml: 1 }}
                                aria-label="Save edit"
                              >
                                <SaveIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Cancel">
                              <IconButton
                                color="error"
                                onClick={handleEditCancel}
                                sx={{ ml: 1 }}
                                aria-label="Cancel edit"
                              >
                                <CancelIcon />
                              </IconButton>
                            </Tooltip>
                          </>
                        ) : (
                          <>
                            <Typography
                              variant="body1"
                              sx={{
                                wordBreak: 'break-word',
                                whiteSpace: 'pre-line',
                                fontWeight: msg.role === 'user' ? 500 : 400,
                                fontSize: 16,
                                flex: 1,
                              }}
                            >
                              {msg.content}
                            </Typography>
                            {msg.role === 'user' && (
                              <Tooltip title="Edit message">
                                <IconButton
                                  size="small"
                                  onClick={() => handleEdit(idx)}
                                  sx={{
                                    ml: 1,
                                    color: 'grey.600',
                                    '&:hover': { color: 'primary.main' },
                                  }}
                                  aria-label="Edit message"
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                          </>
                        )}
                      </Stack>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          position: 'absolute',
                          bottom: 6,
                          right: 12,
                          fontSize: 11,
                          opacity: 0.7,
                        }}
                      >
                        {msg.timestamp
                          ? new Date(msg.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : ''}
                      </Typography>
                    </Paper>
                  </Box>
                </Slide>
              ))}
              {streaming && (
                <Box sx={{ display: 'flex', alignItems: 'center', pl: 6 }}>
                  <CircularProgress size={22} sx={{ mr: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    LLM is typing...
                  </Typography>
                </Box>
              )}
              <div ref={chatEndRef} />
            </Stack>
          )}
        </Box>

        {/* Error Message */}
        {error && (
          <Box sx={{ mb: 1, px: { xs: 1, sm: 4 } }}>
            <Typography variant="body2" color="error" aria-live="polite">
              {error}
            </Typography>
          </Box>
        )}

        {/* Input Area */}
        <Box
          sx={{
            width: '100%',
            px: { xs: 1, sm: 3 },
            py: 2,
            bgcolor: 'background.default',
            borderTop: '1.5px solid',
            borderColor: 'divider',
            position: 'sticky',
            bottom: 0,
            zIndex: 2,
            borderBottomLeftRadius: 20,
            borderBottomRightRadius: 20,
            boxShadow: '0 2px 12px 0 rgba(60,60,120,0.04)',
            mt: 1,
          }}
        >
          <Stack direction="row" spacing={2} alignItems="flex-end">
            <TextField
              value={editingIdx !== null ? editValue : input}
              onChange={(e) =>
                editingIdx !== null
                  ? setEditValue(e.target.value)
                  : setInput(e.target.value)
              }
              onKeyDown={handleKeyDown}
              placeholder="Type your question..."
              multiline
              minRows={1}
              maxRows={4}
              fullWidth
              variant="outlined"
              size="medium"
              disabled={loading || streaming}
              sx={{
                bgcolor: 'background.paper',
                borderRadius: 3,
                fontSize: 16,
                boxShadow: 1,
                border: `1.5px solid ${theme.palette.primary.light}`,
                transition: 'border 0.2s, box-shadow 0.2s',
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                },
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    {editingIdx === null && (
                      <Tooltip title="Send">
                        <span>
                          <IconButton
                            color="primary"
                            onClick={handleSend}
                            disabled={
                              !input.trim() || loading || streaming
                            }
                            aria-label="Send message"
                            size="large"
                            sx={{
                              bgcolor: theme.palette.primary.main,
                              color: theme.palette.primary.contrastText,
                              borderRadius: 2,
                              boxShadow: '0 2px 8px 0 rgba(33,150,243,0.10)',
                              ml: 1,
                              '&:hover': {
                                bgcolor: theme.palette.primary.dark,
                              },
                              transition: 'background 0.2s, color 0.2s',
                            }}
                          >
                            {loading ? (
                              <CircularProgress size={22} />
                            ) : (
                              <SendIcon />
                            )}
                          </IconButton>
                        </span>
                      </Tooltip>
                    )}
                  </InputAdornment>
                ),
                'aria-label': 'Chat input',
              }}
            />
            {/* For editing, show Save/Cancel buttons */}
            {editingIdx !== null && (
              <Stack direction="row" spacing={1}>
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => handleEditSave(editingIdx)}
                  disabled={!editValue.trim()}
                  startIcon={<SaveIcon />}
                  aria-label="Save edit"
                  sx={{
                    borderRadius: 2,
                    fontWeight: 600,
                  }}
                >
                  Save
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleEditCancel}
                  startIcon={<CancelIcon />}
                  aria-label="Cancel edit"
                  sx={{
                    borderRadius: 2,
                    fontWeight: 600,
                  }}
                >
                  Cancel
                </Button>
              </Stack>
            )}
          </Stack>
        </Box>
      </Box>
    </Box>
  );
};

export default ChatPanel;
