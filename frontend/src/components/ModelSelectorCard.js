
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Avatar,
  Fade,
  Slide,
  Stack,
  useTheme,
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import MemoryIcon from '@mui/icons-material/Memory';
import PsychologyIcon from '@mui/icons-material/Psychology';

const MODELS = [
  {
    id: 'gpt-3.5',
    name: 'GPT-3.5 Turbo',
    icon: <AutoAwesomeIcon color="primary" />,
    description:
      'OpenAI GPT-3.5 Turbo: Fast, cost-effective, and great for most general-purpose tasks.',
  },
  {
    id: 'gpt-4',
    name: 'GPT-4',
    icon: <PsychologyIcon color="secondary" />,
    description:
      'OpenAI GPT-4: More accurate, nuanced, and creative. Ideal for complex reasoning and advanced use cases.',
  },
  {
    id: 'llama2',
    name: 'Llama 2',
    icon: <MemoryIcon color="success" />,
    description:
      'Meta Llama 2: Open-source, efficient, and privacy-friendly. Great for custom and on-premise deployments.',
  },
];

const LOCAL_STORAGE_KEY = 'rag_selected_model';

const ModelSelectorCard = () => {
  const theme = useTheme();
  const [selected, setSelected] = useState(() => {
    try {
      return localStorage.getItem(LOCAL_STORAGE_KEY) || MODELS[0].id;
    } catch {
      return MODELS[0].id;
    }
  });
  const [descIn, setDescIn] = useState(true);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, selected);
    } catch {}
    setDescIn(false);
    const t = setTimeout(() => setDescIn(true), 120);
    return () => clearTimeout(t);
  }, [selected]);

  const handleChange = (e) => {
    setSelected(e.target.value);
  };

  const selectedModel = MODELS.find((m) => m.id === selected);

  return (
    <Card
      elevation={8}
      sx={{
        maxWidth: 420,
        mx: 'auto',
        mt: { xs: 2, md: 4 },
        mb: 4,
        borderRadius: 5,
        bgcolor: theme.palette.background.paper,
        boxShadow: theme.shadows[8],
        overflow: 'visible',
        position: 'relative',
      }}
      aria-label="Model selector"
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
            bgcolor: theme.palette.primary.main,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2,
            boxShadow: 4,
            transition: 'background 0.3s',
            animation: 'selectorPulse 1.5s infinite alternate',
            '@keyframes selectorPulse': {
              to: { boxShadow: `0 0 0 16px ${theme.palette.primary.light}` },
            },
          }}
        >
          {selectedModel.icon}
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
          Select Model
        </Typography>
        <FormControl
          fullWidth
          sx={{
            mt: 2,
            mb: 2,
            minWidth: 200,
            bgcolor: theme.palette.background.default,
            borderRadius: 2,
            boxShadow: 1,
          }}
        >
          <InputLabel id="model-select-label" sx={{ fontWeight: 600 }}>
            Model
          </InputLabel>
          <Select
            labelId="model-select-label"
            id="model-select"
            value={selected}
            label="Model"
            onChange={handleChange}
            sx={{
              fontWeight: 600,
              fontSize: 16,
              borderRadius: 2,
              '.MuiSelect-icon': { color: theme.palette.primary.main },
              bgcolor: theme.palette.background.paper,
              transition: 'background 0.3s',
            }}
            MenuProps={{
              PaperProps: {
                sx: {
                  borderRadius: 3,
                  boxShadow: 6,
                  mt: 1,
                  bgcolor: theme.palette.background.paper,
                },
              },
              transitionDuration: 300,
            }}
            aria-label="Select LLM model"
          >
            {MODELS.map((model) => (
              <MenuItem
                key={model.id}
                value={model.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  fontWeight: 600,
                  fontSize: 16,
                  py: 1.2,
                  px: 2,
                  borderRadius: 2,
                  transition: 'background 0.2s',
                  '&.Mui-selected': {
                    bgcolor: theme.palette.primary.light,
                    color: theme.palette.primary.contrastText,
                  },
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: theme.palette.background.default,
                    color: theme.palette.primary.main,
                    width: 32,
                    height: 32,
                    mr: 1,
                  }}
                  variant="rounded"
                >
                  {model.icon}
                </Avatar>
                {model.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Box sx={{ width: '100%', minHeight: 60, mt: 1 }}>
          <Fade in={descIn} timeout={400}>
            <Stack direction="row" alignItems="flex-start" spacing={1}>
              <Box
                sx={{
                  mt: 0.5,
                  color: theme.palette.primary.main,
                  fontSize: 22,
                  minWidth: 24,
                }}
                aria-hidden
              >
                {selectedModel.icon}
              </Box>
              <Slide in={descIn} direction="up" timeout={400}>
                <Typography
                  variant="body1"
                  sx={{
                    color: theme.palette.text.secondary,
                    fontSize: 16,
                    fontWeight: 500,
                    letterSpacing: 0.2,
                    transition: 'color 0.3s',
                  }}
                  aria-live="polite"
                >
                  {selectedModel.description}
                </Typography>
              </Slide>
            </Stack>
          </Fade>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ModelSelectorCard;
