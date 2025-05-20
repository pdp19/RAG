
import React, { useState } from 'react';
import { Box, useTheme, Fade, Slide, Tooltip, IconButton } from '@mui/material';
import Sidebar from './VerticalTabBar';
import ChatPanel from './ChatPanel';
import DocumentUploadPanel from './DocumentUploadPanel';
import ModelSelectorPanel from './ModelSelectorPanel';
import ChatHistoryPanel from './ChatHistoryPanel';
import AccountPanel from './AccountPanel';
import DescriptionIcon from '@mui/icons-material/Description';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const TAB_CONFIG = [
  {
    key: 'upload',
    label: 'Documents',
    icon: <DescriptionIcon />,
    panel: DocumentUploadPanel,
  },
  {
    key: 'model',
    label: 'Model',
    icon: <SettingsSuggestIcon />,
    panel: ModelSelectorPanel,
  },
  {
    key: 'history',
    label: 'History',
    icon: <HistoryEduIcon />,
    panel: ChatHistoryPanel,
  },
  {
    key: 'account',
    label: 'Account',
    icon: <AccountCircleIcon />,
    panel: AccountPanel,
  },
];

const PANEL_WIDTH = { xs: '100vw', sm: 400, md: 420 };

const RAGAppSplitLayout = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(null);

  // Overlay panel for the selected tab
  const renderPanel = () => {
    if (!activeTab) return null;
    const tab = TAB_CONFIG.find((t) => t.key === activeTab);
    if (!tab) return null;
    const PanelComponent = tab.panel;
    return (
      <Slide direction="right" in={!!activeTab} mountOnEnter unmountOnExit>
        <Box
          sx={{
            position: 'fixed',
            top: { xs: 0, md: 0 },
            left: {
              xs: 0,
              sm: 'calc(70px + 0px)',
              md: 'calc(110px + 0px)',
            },
            zIndex: 1400,
            width: PANEL_WIDTH,
            maxWidth: PANEL_WIDTH,
            height: '100vh',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'flex-start',
            pointerEvents: 'auto',
            boxShadow: {
              xs: '0 8px 32px 0 rgba(60,60,120,0.10)',
              md: '-8px 0 32px 0 rgba(60,60,120,0.10)',
            },
            bgcolor: theme.palette.background.paper,
            borderLeft: `2px solid ${theme.palette.divider}`,
            borderRadius: 0,
          }}
        >
          <Fade in={!!activeTab}>
            <Box sx={{ width: '100%', height: '100%' }}>
              <PanelComponent open={!!activeTab} onClose={() => setActiveTab(null)} />
            </Box>
          </Fade>
        </Box>
      </Slide>
    );
  };

  // Responsive widths for tab bar and chat panel
  const tabBarWidth = { xs: 70, sm: 90, md: 110 };

  return (
    <Box
      sx={{
        width: '100vw',
        height: '100vh',
        bgcolor: theme.palette.background.default,
        display: 'flex',
        flexDirection: 'row',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Vertical Tab Bar */}
      <Box
        sx={{
          width: tabBarWidth,
          minWidth: tabBarWidth,
          height: '100vh',
          bgcolor: theme.palette.background.paper,
          boxShadow: '2px 0 16px 0 rgba(60,60,120,0.08)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          pt: { xs: 2, md: 4 },
          zIndex: 1300,
          borderRight: 'none',
          m: 0,
          p: 0,
          transition: 'background 0.2s, box-shadow 0.2s',
        }}
      >
        {TAB_CONFIG.map((tab) => (
          <Tooltip key={tab.key} title={tab.label} placement="right" arrow>
            <IconButton
              onClick={() => setActiveTab(tab.key)}
              sx={{
                my: 2,
                bgcolor: activeTab === tab.key
                  ? theme.palette.primary.light
                  : theme.palette.background.default,
                color: activeTab === tab.key
                  ? theme.palette.primary.main
                  : theme.palette.text.secondary,
                borderRadius: 3,
                width: 56,
                height: 56,
                boxShadow: activeTab === tab.key
                  ? '0 4px 16px 0 rgba(60,60,120,0.10)'
                  : 'none',
                border: activeTab === tab.key
                  ? `2px solid ${theme.palette.primary.main}`
                  : `2px solid transparent`,
                transition: 'all 0.2s',
                '&:hover': {
                  bgcolor: theme.palette.primary.light,
                  color: theme.palette.primary.main,
                },
              }}
              aria-label={tab.label}
            >
              {tab.icon}
            </IconButton>
          </Tooltip>
        ))}
      </Box>

      {/* Chat Panel (always visible, seamlessly connected) */}
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: theme.palette.background.paper,
          position: 'relative',
          zIndex: 1200,
          borderLeft: 'none',
          borderRadius: 0,
          m: 0,
          p: 0,
          boxShadow: 'none',
          transition: 'background 0.2s, box-shadow 0.2s',
        }}
      >
        <ChatPanel />
      </Box>

      {/* Overlay Panel */}
      {renderPanel()}
    </Box>
  );
};

export default RAGAppSplitLayout;
