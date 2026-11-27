import React from 'react';
import { createRoot } from 'react-dom/client';
import DialogBox from './ui/DialogBox.jsx';
import Hud from './ui/Hud.jsx';
import './main.js';

createRoot(document.getElementById('root')).render(
    <>
        <Hud />
        <DialogBox />
    </>
);