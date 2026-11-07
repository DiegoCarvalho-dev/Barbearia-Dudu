import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App.jsx';
import './style.css';
import './home.css';
import './story.css';
import './team.css';
import './small-sections.css';
import './services.css';
import './plans.css';
import './locations.css';
import './footer.css';
import './viewport.css';


createRoot(document.getElementById('root')).render(<App />);

if (new URLSearchParams(window.location.search).get('diagnostico') === 'viewport') {
  import('./diagnostics/viewport.js').then(({ startViewportDiagnostic }) => startViewportDiagnostic());
}
