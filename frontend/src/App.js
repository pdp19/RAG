import React from 'react';
import RAGAppSplitLayout from './components/RAGAppSplitLayout';
import { Routes, Route } from 'react-router-dom';

const App = () => {

  return (
      <Routes>
        <Route path="/" element={<RAGAppSplitLayout />} />
      </Routes>
  );
};

export default App;