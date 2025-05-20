
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Slide,
  Fade,
  Typography,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Avatar,
  useTheme,
  Stack,
} from '@mui/material';
import MemoryIcon from '@mui/icons-material/Memory';
import CloseIcon from '@mui/icons-material/Close';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import PsychologyAltIcon from '@mui/icons-material/PsychologyAlt';

const MODELS = [
  {
    value: 'gpt-3.5',
    label: 'GPT-3.5',
    icon: <AutoAwesomeIcon />,
    color: 'primary',
  },
  {
    value: 'gpt-4',
    label: 'GPT-4',
    icon: <RocketLaunchIcon />,
    color: 'success',
  },
  {
    value: 'llama2',
    label: 'Llama 2',
    icon: <PsychologyAltIcon />,
    color: 'info',
  },
];

const storeModel = (model) => {
  localStorage.setItem('rag_selected_model', model);
};

const getStoredModel = () => {
  return localStorage.getItem('rag_selected_model') || MODELS[0].value;
};

const ModelSelectorPanel = ({ open, onClose }) => {
  const theme = useTheme();
  const [selected, setSelected] = useState(getStoredModel());

  useEffect(() => {
    setSelected(getStoredModel());
  }, [open]);

  useEffect(() => {
    storeModel(selected);
  }, [selected]);

  const handleChange = (e) => {
    setSelected(e.target.value);
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
              minHeight: { xs: '100vh', md: 340 },
              maxHeight: { xs: '100vh', md: 420 },
              boxShadow: '0 8px 32px 0 rgba(60,60,120,0.18)',
              bgcolor: theme.palette.background.paper,
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              overflow: 'hidden',
              border: `2px solid ${theme.palette.success.light}`,
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
              aria-label="Close model selector panel"
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
              <MemoryIcon
                sx={{
                  fontSize: 56,
                  color: theme.palette.success.main,
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
                Select Model
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
                Choose a language model for your RAG experience.
              </Typography>
              <FormControl
                fullWidth
                sx={{
                  mb: 3,
                  mt: 1,
                  background: theme.palette.background.default,
                  borderRadius: 2,
                  boxShadow: '0 2px 8px 0 rgba(60,60,120,0.06)',
                }}
              >
                <InputLabel id="model-select-label" sx={{ fontWeight: 600 }}>
                  Model
                </InputLabel>
                <Select
                  labelId="model-select-label"
                  value={selected}
                  label="Model"
                  onChange={handleChange}
                  sx={{
                    fontWeight: 600,
                    fontSize: 18,
                    borderRadius: 2,
                    py: 1,
                    px: 2,
                    '& .MuiSelect-icon': { color: theme.palette.success.main },
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        borderRadius: 3,
                        boxShadow: '0 4px 24px 0 rgba(60,60,120,0.12)',
                        mt: 1,
                      },
                    },
                  }}
                  renderValue={(value) => {
                    const model = MODELS.find((m) => m.value === value);
                    return (
                      <Stack direction="row" alignItems="center" spacing={1.5}>
                        <Avatar
                          sx={{
                            bgcolor: theme.palette[model.color].main,
                            color: theme.palette[model.color].contrastText,
                            width: 32,
                            height: 32,
                            mr: 1,
                          }}
                          variant="rounded"
                        >
                          {model.icon}
                        </Avatar>
                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight: 600,
                            color: theme.palette[model.color].main,
                            fontSize: 18,
                          }}
                        >
                          {model.label}
                        </Typography>
                      </Stack>
                    );
                  }}
                >
                  {MODELS.map((model) => (
                    <MenuItem
                      key={model.value}
                      value={model.value}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        fontWeight: 600,
                        fontSize: 17,
                        color: theme.palette[model.color].main,
                        borderRadius: 2,
                        py: 1.2,
                        px: 2,
                        '&.Mui-selected': {
                          bgcolor: theme.palette[model.color].light,
                          color: theme.palette[model.color].dark,
                        },
                        '&:hover': {
                          bgcolor: theme.palette[model.color].light,
                        },
                      }}
                    >
                      <Avatar
                        sx={{
                          bgcolor: theme.palette[model.color].main,
                          color: theme.palette[model.color].contrastText,
                          width: 32,
                          height: 32,
                          mr: 1,
                        }}
                        variant="rounded"
                      >
                        {model.icon}
                      </Avatar>
                      <Typography
                        variant="body1"
                        sx={{
                          fontWeight: 600,
                          color: theme.palette[model.color].main,
                          fontSize: 18,
                        }}
                      >
                        {model.label}
                      </Typography>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Paper>
        </Fade>
      </Box>
    </Slide>
  );
};

export default ModelSelectorPanel;
