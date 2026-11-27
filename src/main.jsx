import React from 'react';
import { createRoot } from 'react-dom/client';
import DialogBox from './ui/DialogBox.jsx';
import './main.js'; // inicia o Phaser

createRoot(document.getElementById('root')).render(<DialogBox />);