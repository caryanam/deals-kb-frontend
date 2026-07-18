import React from 'react';
import AppRoutes from './routes/AppRoutes';
import { ToastContainer } from 'react-toastify';
import ScrollToTopButton from './components/common/ScrollToTopButton';
import 'react-toastify/dist/ReactToastify.css';
import './styles/globals.css';

function App() {
  return (
    <div className="app-container">
      <AppRoutes />
      <ScrollToTopButton />
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
    </div>
  );
}

export default App;
