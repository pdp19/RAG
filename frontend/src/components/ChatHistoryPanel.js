
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Slide,
  Fade,
  Typography,
  IconButton,
  Button,
  Stack,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Divider,
  Tooltip,
  useTheme,
} from '@mui/material';
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import CloseIcon from '@mui/icons-material/Close';
import ClearAllIcon from '@mui/icons-material/ClearAll';

const CHAT_HISTORY_KEY = 'rag_chat_history';

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

const formatDate = (ts) => {
  const d = new Date(ts);
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const ChatHistoryPanel = ({ open, onClose, onSelectSession }) => {
  const theme = useTheme();
  const [history, setHistory] = useState(getStoredHistory());
  const [deletingIdx, setDeletingIdx] = useState(null);

  useEffect(() => {
    setHistory(getStoredHistory());
  }, [open]);

  const handleDelete = (idx) => {
    const updated = history.filter((_, i) => i !== idx);
    setHistory(updated);
    storeHistory(updated);
  };

  const handleClearAll = () => {
    setHistory([]);
    storeHistory([]);
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
              border: `2px solid ${theme.palette.info.light}`,
              transition: 'box-shadow 0.3s, border 0.3s',
            }}
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
              aria-label="Close chat history panel"
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
              <HistoryEduIcon
                sx={{
                  fontSize: 56,
                  color: theme.palette.info.main,
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
                Chat History
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
                Review, revisit, or manage your previous chat sessions.
              </Typography>
              <Box
                sx={{
                  width: '100%',
                  flex: 1,
                  overflowY: 'auto',
                  mt: 2,
                  mb: 2,
                  px: 1,
                  maxHeight: { xs: '60vh', md: 400 },
                }}
              >
                {history.length === 0 ? (
                  <Typography
                    variant="body2"
                    sx={{
                      color: theme.palette.text.disabled,
                      textAlign: 'center',
                      mt: 6,
                      fontStyle: 'italic',
                    }}
                  >
                    No chat history yet.
                  </Typography>
                ) : (
                  <List disablePadding>
                    {history.map((session, idx) => (
                      <Fade in={true} key={session.timestamp}>
                        <Box>
                          <ListItem
                            alignItems="flex-start"
                            sx={{
                              borderRadius: 3,
                              mb: 1.5,
                              bgcolor: theme.palette.grey[50],
                              boxShadow: '0 2px 8px 0 rgba(60,60,120,0.06)',
                              borderLeft: `4px solid ${theme.palette.info.main}`,
                              transition: 'box-shadow 0.2s',
                              cursor: 'pointer',
                              '&:hover': {
                                boxShadow: '0 4px 16px 0 rgba(60,60,120,0.12)',
                                bgcolor: theme.palette.info.light,
                              },
                            }}
                            onClick={() => onSelectSession && onSelectSession(session)}
                            secondaryAction={
                              <Tooltip title="Delete session" arrow>
                                <IconButton
                                  edge="end"
                                  aria-label="delete"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDeletingIdx(idx);
                                    setTimeout(() => {
                                      handleDelete(idx);
                                      setDeletingIdx(null);
                                    }, 200);
                                  }}
                                  sx={{
                                    color: theme.palette.error.main,
                                    '&:hover': {
                                      bgcolor: theme.palette.error.light,
                                      color: theme.palette.error.dark,
                                    },
                                  }}
                                >
                                  <DeleteForeverIcon />
                                </IconButton>
                              </Tooltip>
                            }
                          >
                            <ListItemAvatar>
                              <Avatar
                                sx={{
                                  bgcolor: theme.palette.info.main,
                                  color: theme.palette.info.contrastText,
                                  width: 40,
                                  height: 40,
                                  fontSize: 24,
                                }}
                                variant="rounded"
                              >
                                <ChatBubbleOutlineIcon />
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={
                                <Typography
                                  variant="subtitle1"
                                  sx={{
                                    fontWeight: 600,
                                    color: theme.palette.text.primary,
                                    mb: 0.5,
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    maxWidth: 180,
                                  }}
                                >
                                  {session.title || 'Chat Session'}
                                </Typography>
                              }
                              secondary={
                                <Stack spacing={0.5}>
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      color: theme.palette.text.secondary,
                                      fontSize: 12,
                                    }}
                                  >
                                    {formatDate(session.timestamp)}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      color: theme.palette.text.secondary,
                                      fontSize: 13,
                                      whiteSpace: 'nowrap',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      maxWidth: 180,
                                    }}
                                  >
                                    {session.messages && session.messages.length > 0
                                      ? session.messages[0].content.slice(0, 60)
                                      : 'No messages'}
                                  </Typography>
                                </Stack>
                              }
                            />
                          </ListItem>
                          {idx < history.length - 1 && (
                            <Divider variant="inset" component="li" sx={{ ml: 7 }} />
                          )}
                        </Box>
                      </Fade>
                    ))}
                  </List>
                )}
              </Box>
              {history.length > 0 && (
                <Stack direction="row" spacing={2} sx={{ mt: 1, alignSelf: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={handleClearAll}
                    startIcon={<ClearAllIcon />}
                    sx={{
                      fontWeight: 600,
                      borderRadius: 2,
                      px: 2,
                      py: 1,
                      boxShadow: 'none',
                      textTransform: 'none',
                      fontSize: 15,
                      letterSpacing: 0.5,
                      '&:hover': {
                        bgcolor: theme.palette.error.light,
                        color: theme.palette.error.dark,
                      },
                    }}
                  >
                    Clear All
                  </Button>
                </Stack>
              )}
            </Box>
          </Paper>
        </Fade>
      </Box>
    </Slide>
  );
};

export default ChatHistoryPanel;
