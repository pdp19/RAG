
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  Fade,
  Slide,
  Stack,
  useTheme,
} from '@mui/material';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import SaveIcon from '@mui/icons-material/Save';

const LOCAL_STORAGE_KEY = 'rag_system_prompt';
const DEFAULT_PROMPT = 'You are a helpful AI assistant.';

const SystemPromptEditorCard = () => {
  const theme = useTheme();
  const [prompt, setPrompt] = useState(() => {
    try {
      return localStorage.getItem(LOCAL_STORAGE_KEY) || DEFAULT_PROMPT;
    } catch {
      return DEFAULT_PROMPT;
    }
  });
  const [editing, setEditing] = useState(false);
  const [savedPrompt, setSavedPrompt] = useState(prompt);
  const [fadeIn, setFadeIn] = useState(true);

  useEffect(() => {
    setSavedPrompt(prompt);
  }, []);

  const handleChange = (e) => {
    setPrompt(e.target.value);
    setEditing(true);
  };

  const handleSave = () => {
    localStorage.setItem(LOCAL_STORAGE_KEY, prompt);
    setSavedPrompt(prompt);
    setEditing(false);
    setFadeIn(false);
    setTimeout(() => setFadeIn(true), 120);
  };

  const handleReset = () => {
    setPrompt(DEFAULT_PROMPT);
    setEditing(true);
    setFadeIn(false);
    setTimeout(() => setFadeIn(true), 120);
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
        bgcolor: theme.palette.background.paper,
        boxShadow: theme.shadows[8],
        overflow: 'visible',
        position: 'relative',
      }}
      aria-label="System prompt editor"
    >
      <CardContent
        sx={{
          p: { xs: 3, md: 4 },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
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
            animation: 'promptPulse 1.5s infinite alternate',
            '@keyframes promptPulse': {
              to: { boxShadow: `0 0 0 16px ${theme.palette.secondary.light}` },
            },
          }}
        >
          <SettingsSuggestIcon
            sx={{
              color: theme.palette.secondary.contrastText,
              fontSize: 40,
            }}
            aria-label="System prompt"
          />
        </Box>
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
          System Prompt
        </Typography>
        <Fade in={fadeIn} timeout={400}>
          <Box sx={{ width: '100%', mt: 2 }}>
            <TextField
              label="System Prompt"
              value={prompt}
              onChange={handleChange}
              multiline
              minRows={3}
              maxRows={6}
              fullWidth
              variant="outlined"
              sx={{
                bgcolor: theme.palette.background.default,
                borderRadius: 2,
                fontSize: 16,
                fontWeight: 500,
                mb: 2,
                '& .MuiInputLabel-root': {
                  fontWeight: 600,
                  color: theme.palette.secondary.main,
                },
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  fontWeight: 500,
                  fontSize: 16,
                },
              }}
              inputProps={{
                'aria-label': 'System prompt editor',
                style: { fontFamily: 'monospace', fontSize: 16 },
              }}
            />
          </Box>
        </Fade>
        <Slide in={fadeIn} direction="up" timeout={400}>
          <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={!editing}
              sx={{
                fontWeight: 600,
                minWidth: 100,
                boxShadow: 2,
                textTransform: 'none',
              }}
              aria-label="Save system prompt"
            >
              Save
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<RestartAltIcon />}
              onClick={handleReset}
              disabled={prompt === DEFAULT_PROMPT}
              sx={{
                fontWeight: 600,
                minWidth: 100,
                textTransform: 'none',
              }}
              aria-label="Reset system prompt"
            >
              Reset
            </Button>
          </Stack>
        </Slide>
        <Fade in={fadeIn} timeout={400}>
          <Typography
            variant="body2"
            sx={{
              color: theme.palette.text.secondary,
              mt: 2,
              textAlign: 'center',
              fontStyle: 'italic',
              fontSize: 15,
              letterSpacing: 0.2,
            }}
            aria-live="polite"
          >
            This prompt will be prepended to every user query in the chat.
          </Typography>
        </Fade>
      </CardContent>
    </Card>
  );
};

export default SystemPromptEditorCard;
