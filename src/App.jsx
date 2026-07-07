import React from 'react';
import AppRoutes from './routes/AppRoutes';
import ScrollToHash from './components/common/ScrollToHash';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './styles/globals.css';

function App() {
  return (
    <div className="app-container">
      <ScrollToHash />
      <AppRoutes />
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
    </div>
  );
}

export default App;
