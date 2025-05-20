
import React, { useRef, useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  TextField,
  IconButton,
  Button,
  Stack,
  Avatar,
  Fade,
  Slide,
  Tooltip,
  useTheme,
  InputAdornment,
  Menu,
  MenuItem,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import PersonIcon from '@mui/icons-material/Person';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

const DOCS_KEY = 'rag_uploaded_docs';
const PROMPT_KEY = 'rag_system_prompt';
const MODEL_KEY = 'rag_selected_model';
const CHAT_KEY = 'rag_chat_history';

const getDocs = () => {
  try {
    const stored = localStorage.getItem(DOCS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};
const getPrompt = () => {
  try {
    return localStorage.getItem(PROMPT_KEY) || 'You are a helpful AI assistant.';
  } catch {
    return 'You are a helpful AI assistant.';
  }
};
const getModel = () => {
  try {
    return localStorage.getItem(MODEL_KEY) || 'gpt-3.5';
  } catch {
    return 'gpt-3.5';
  }
};
const getChat = () => {
  try {
    const stored = localStorage.getItem(CHAT_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveChat = (chat) => {
  localStorage.setItem(CHAT_KEY, JSON.stringify(chat));
};

const getRelevantChunks = (docs, query) => {
  // Simple keyword match: return up to 2 docs with most keyword overlap
  if (!query.trim()) return [];
  const keywords = query
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 2);
  const scored = docs
    .map((doc) => {
      const docWords = doc.text.toLowerCase().split(/\s+/);
      const score = keywords.reduce(
        (acc, k) => acc + docWords.filter((w) => w.includes(k)).length,
        0
      );
      return { ...doc, score };
    })
    .filter((d) => d.score > 0)
    .sort((a, b) => b.score - a.score);
  return scored.slice(0, 2);
};

const mockModelResponse = (prompt, query, docs, model) => {
  // Compose a mock response using prompt, query, and relevant doc chunks
  if (!docs.length) {
    return (
      "I'm sorry, I couldn't find relevant information in your uploaded documents. " +
      "But here's my best attempt to answer your question:\n\n" +
      prompt +
      '\n\n' +
      'Q: ' +
      query +
      '\nA: [This is a mock response. Please upload documents for better answers.]'
    );
  }
  let answer = '';
  docs.forEach((doc, idx) => {
    answer += `From "${doc.name}":\n`;
    // Show a snippet of the doc text containing the first keyword
    const firstKeyword = query
      .toLowerCase()
      .split(/\s+/)
      .find((w) => w.length > 2 && doc.text.toLowerCase().includes(w));
    if (firstKeyword) {
      const idxFound = doc.text.toLowerCase().indexOf(firstKeyword);
      const snippet = doc.text.substring(
        Math.max(0, idxFound - 40),
        Math.min(doc.text.length, idxFound + 80)
      );
      answer += `...${snippet}...\n\n`;
    } else {
      answer += doc.text.substring(0, 120) + '...\n\n';
    }
  });
  return (
    prompt +
    '\n\n' +
    'Q: ' +
    query +
    '\nA: ' +
    answer +
    '[This is a mock response based on your uploaded documents.]'
  );
};

const ChatPanel = () => {
  const theme = useTheme();
  const [chat, setChat] = useState(getChat());
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [editIdx, setEditIdx] = useState(null);
  const [editText, setEditText] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuIdx, setMenuIdx] = useState(null);
  const chatEndRef = useRef();

  // Scroll to bottom on new message
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chat]);

  // Save chat to localStorage
  useEffect(() => {
    saveChat(chat);
  }, [chat]);

  const handleSend = async () => {
    if (!input.trim()) return;
    setSending(true);
    const docs = getDocs();
    const prompt = getPrompt();
    const model = getModel();
    const relevant = getRelevantChunks(docs, input);
    const userMsg = {
      role: 'user',
      content: input,
      ts: Date.now(),
    };
    setChat((prev) => [...prev, userMsg]);
    setInput('');
    setTimeout(() => {
      const modelMsg = {
        role: 'model',
        content: mockModelResponse(prompt, input, relevant, model),
        ts: Date.now() + 1,
      };
      setChat((prev) => [...prev, modelMsg]);
      setSending(false);
    }, 800 + Math.random() * 600);
  };

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleEdit = (idx) => {
    setEditIdx(idx);
    setEditText(chat[idx].content);
  };

  const handleEditSave = (idx) => {
    const updated = [...chat];
    updated[idx].content = editText;
    setChat(updated);
    setEditIdx(null);
    setEditText('');
  };

  const handleEditCancel = () => {
    setEditIdx(null);
    setEditText('');
  };

  const handleDelete = (idx) => {
    const updated = chat.filter((_, i) => i !== idx);
    setChat(updated);
    setEditIdx(null);
    setEditText('');
  };

  const handleMenuOpen = (event, idx) => {
    setAnchorEl(event.currentTarget);
    setMenuIdx(idx);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuIdx(null);
  };

  const handleClearAll = () => {
    setChat([]);
    setEditIdx(null);
    setEditText('');
  };

  return (
    <Card
      elevation={10}
      sx={{
        maxWidth: 700,
        mx: 'auto',
        mt: { xs: 2, md: 4 },
        mb: 4,
        borderRadius: 5,
        bgcolor: theme.palette.background.paper,
        boxShadow: theme.shadows[10],
        display: 'flex',
        flexDirection: 'column',
        minHeight: 500,
        height: { xs: '70vh', md: '70vh' },
        position: 'relative',
      }}
      aria-label="Chat panel"
    >
      <CardContent
        sx={{
          p: { xs: 2, md: 4 },
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <Stack
          spacing={2}
          sx={{
            flex: 1,
            overflowY: 'auto',
            pr: 1,
            mb: 2,
            maxHeight: { xs: '45vh', md: '50vh' },
            minHeight: 200,
            '&::-webkit-scrollbar': {
              width: 8,
              background: theme.palette.background.default,
            },
            '&::-webkit-scrollbar-thumb': {
              background: theme.palette.action.hover,
              borderRadius: 4,
            },
          }}
        >
          {chat.length === 0 && (
            <Fade in>
              <Box
                sx={{
                  textAlign: 'center',
                  color: theme.palette.text.disabled,
                  mt: 6,
                  fontStyle: 'italic',
                  fontSize: 18,
                }}
              >
                Start chatting! Ask a question about your uploaded documents.
              </Box>
            </Fade>
          )}
          {chat.map((msg, idx) => {
            const isUser = msg.role === 'user';
            const isEditing = editIdx === idx;
            return (
              <Slide
                key={msg.ts}
                direction={isUser ? 'right' : 'left'}
                in
                mountOnEnter
                unmountOnExit
                timeout={400 + idx * 60}
              >
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: isUser ? 'row-reverse' : 'row',
                    alignItems: 'flex-end',
                    gap: 2,
                    mb: 0.5,
                  }}
                >
                  <Avatar
                    sx={{
                      bgcolor: isUser
                        ? theme.palette.primary.main
                        : theme.palette.secondary.main,
                      color: 'white',
                      width: 40,
                      height: 40,
                      boxShadow: 2,
                    }}
                    aria-label={isUser ? 'User' : 'Model'}
                  >
                    {isUser ? <PersonIcon /> : <SmartToyIcon />}
                  </Avatar>
                  <Box
                    sx={{
                      maxWidth: { xs: '70vw', md: 420 },
                      minWidth: 60,
                      px: 2,
                      py: 1.5,
                      borderRadius: 3,
                      bgcolor: isUser
                        ? theme.palette.primary.light
                        : theme.palette.secondary.light,
                      color: isUser
                        ? theme.palette.primary.contrastText
                        : theme.palette.secondary.contrastText,
                      boxShadow: 3,
                      fontSize: 16,
                      fontWeight: 500,
                      wordBreak: 'break-word',
                      position: 'relative',
                      transition: 'background 0.3s',
                    }}
                  >
                    {isEditing ? (
                      <Box>
                        <TextField
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          multiline
                          minRows={1}
                          maxRows={6}
                          fullWidth
                          variant="standard"
                          sx={{
                            bgcolor: 'white',
                            borderRadius: 1,
                            fontSize: 16,
                            fontWeight: 500,
                            mb: 1,
                          }}
                          inputProps={{
                            'aria-label': 'Edit message',
                            style: { fontFamily: 'inherit', fontSize: 16 },
                          }}
                        />
                        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                          <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            startIcon={<SaveIcon />}
                            onClick={() => handleEditSave(idx)}
                            sx={{ fontWeight: 600, textTransform: 'none' }}
                          >
                            Save
                          </Button>
                          <Button
                            variant="outlined"
                            color="inherit"
                            size="small"
                            startIcon={<CancelIcon />}
                            onClick={handleEditCancel}
                            sx={{ fontWeight: 600, textTransform: 'none' }}
                          >
                            Cancel
                          </Button>
                        </Stack>
                      </Box>
                    ) : (
                      <Box>
                        <Typography
                          variant="body1"
                          sx={{
                            whiteSpace: 'pre-line',
                            fontSize: 16,
                            fontWeight: 500,
                          }}
                        >
                          {msg.content}
                        </Typography>
                        {isUser && (
                          <Box sx={{ position: 'absolute', top: 2, right: 2 }}>
                            <Tooltip title="Edit" arrow>
                              <IconButton
                                size="small"
                                onClick={() => handleEdit(idx)}
                                sx={{
                                  color: theme.palette.primary.dark,
                                  mr: 0.5,
                                }}
                                aria-label="Edit message"
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete" arrow>
                              <IconButton
                                size="small"
                                onClick={() => handleDelete(idx)}
                                sx={{
                                  color: theme.palette.error.main,
                                }}
                                aria-label="Delete message"
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        )}
                      </Box>
                    )}
                  </Box>
                </Box>
              </Slide>
            );
          })}
          <div ref={chatEndRef} />
        </Stack>
        <Box
          sx={{
            mt: 2,
            display: 'flex',
            alignItems: 'flex-end',
            gap: 2,
            width: '100%',
            position: 'relative',
          }}
        >
          <TextField
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder="Type your question..."
            multiline
            minRows={1}
            maxRows={4}
            fullWidth
            variant="outlined"
            sx={{
              bgcolor: theme.palette.background.default,
              borderRadius: 2,
              fontSize: 16,
              fontWeight: 500,
              boxShadow: 1,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                fontWeight: 500,
                fontSize: 16,
              },
            }}
            inputProps={{
              'aria-label': 'Type your question',
              style: { fontFamily: 'inherit', fontSize: 16 },
            }}
            disabled={sending}
            endAdornment={
              <InputAdornment position="end">
                <Tooltip title="Send" arrow>
                  <span>
                    <IconButton
                      color="primary"
                      onClick={handleSend}
                      disabled={sending || !input.trim()}
                      aria-label="Send message"
                      sx={{
                        bgcolor: theme.palette.primary.light,
                        color: theme.palette.primary.contrastText,
                        '&:hover': {
                          bgcolor: theme.palette.primary.main,
                          color: 'white',
                        },
                        transition: 'background 0.2s',
                        ml: 1,
                      }}
                    >
                      <SendIcon />
                    </IconButton>
                  </span>
                </Tooltip>
              </InputAdornment>
            }
          />
          <Tooltip title="Clear chat" arrow>
            <span>
              <IconButton
                color="error"
                onClick={handleClearAll}
                disabled={chat.length === 0}
                aria-label="Clear chat"
                sx={{
                  bgcolor: chat.length === 0 ? 'grey.200' : 'error.light',
                  '&:hover': { bgcolor: 'error.main', color: 'white' },
                  transition: 'background 0.2s',
                  ml: 1,
                }}
              >
                <DeleteIcon />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ChatPanel;
