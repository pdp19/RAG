
import React, { useState } from 'react';
import {
  Box,
  useTheme,
  Fade,
  Slide,
} from '@mui/material';
import VerticalTabBar from './VerticalTabBar';
import ChatPanel from './ChatPanel';
import DocumentUploadPanel from './DocumentUploadPanel';
import ModelSelectorPanel from './ModelSelectorPanel';
import ChatHistoryPanel from './ChatHistoryPanel';
import AccountPanel from './AccountPanel';
import SystemPromptEditorCard from './SystemPromptEditorCard';

const TAB_CONFIG = [
  {
    key: 'upload',
    label: 'Documents',
    panel: DocumentUploadPanel,
    borderColor: 'primary.main',
  },
  {
    key: 'model',
    label: 'Model',
    panel: ModelSelectorPanel,
    borderColor: 'success.main',
  },
  {
    key: 'history',
    label: 'History',
    panel: ChatHistoryPanel,
    borderColor: 'info.main',
  },
  {
    key: 'systemPrompt',
    label: 'System Prompt',
    panel: SystemPromptEditorCard,
    borderColor: 'warning.main',
  },
  {
    key: 'account',
    label: 'Account',
    panel: AccountPanel,
    borderColor: 'secondary.main',
  },
];

const PANEL_WIDTH = { xs: '100vw', sm: 400, md: 420 };

const RAGAppSplitLayout = () => {
  const theme = useTheme();
  const [activeTabIdx, setActiveTabIdx] = useState(null);

  // Only render the panel for the active tab, no empty/extra boxes
  const renderPanel = () => {
    if (activeTabIdx === null) return null;
    const tab = TAB_CONFIG[activeTabIdx];
    const PanelComponent = tab.panel;
    return (
      <Slide direction="right" in={activeTabIdx !== null} mountOnEnter unmountOnExit>
        <Box
          sx={{
            position: 'fixed',
            top: { xs: 32, md: 48 },
            left: {
              xs: 0,
              sm: 'calc(70px + 0px)',
              md: 'calc(110px + 0px)',
            },
            zIndex: 1400,
            width: PANEL_WIDTH,
            maxWidth: PANEL_WIDTH,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'flex-start',
            pointerEvents: 'auto',
            boxShadow: {
              xs: '0 8px 32px 0 rgba(60,60,120,0.10)',
              md: '-8px 0 32px 0 rgba(60,60,120,0.10)',
            },
            bgcolor: 'transparent',
            border: 'none',
            borderRadius: 0,
            height: 'auto',
            minHeight: 'unset',
          }}
        >
          <Fade in={activeTabIdx !== null}>
            <Box
              sx={{
                width: { xs: '100vw', sm: 400, md: 420 },
                maxWidth: { xs: '100vw', sm: 420 },
                bgcolor: theme.palette.background.paper,
                border: `3px solid ${theme.palette[tab.borderColor.split('.')[0]].main}`,
                borderRadius: 4,
                boxShadow: 8,
                p: { xs: 2, md: 3 },
                mt: 0,
                mb: 0,
                mx: 'auto',
                my: 2,
                minHeight: 120,
                maxHeight: { xs: '90vh', md: 600 },
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'stretch',
                position: 'relative',
              }}
            >
              <PanelComponent open={activeTabIdx !== null} onClose={() => setActiveTabIdx(null)} />
            </Box>
          </Fade>
        </Box>
      </Slide>
    );
  };

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
      <VerticalTabBar selected={activeTabIdx} onChange={setActiveTabIdx} />

      {/* Main Content: Only Chat Panel */}
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
