import React from 'react';

export function Arrow({ diagonal = false }) {
  return <span aria-hidden="true" className="arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" focusable="false"><path d={diagonal ? 'M5 19 19 5M8 5h11v11' : 'M5 5l14 14M8 19h11V8'} /></svg></span>;
}

export function WhatsAppIcon() {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20.4 11.8a8.4 8.4 0 0 1-12.5 7.3L3.6 20.3l1.2-4.1a8.4 8.4 0 1 1 15.6-4.4Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><path d="M8.5 7.7c.2-.4.4-.4.7-.4h.3c.1 0 .3 0 .4.4l.6 1.4c.1.2.1.4 0 .5l-.5.6c-.1.1-.2.2-.1.4.3.6.8 1.1 1.3 1.6.6.5 1.2.9 1.9 1.2.2.1.3.1.4-.1l.7-.8c.1-.2.3-.2.5-.1l1.4.7c.2.1.4.2.4.4 0 .2-.1 1-.7 1.4-.5.4-1.1.5-1.7.3-1.1-.3-2.4-.9-3.8-2.2-1.1-1-2-2.3-2.3-3.5-.2-.7 0-1.3.5-1.8Z" fill="currentColor"/></svg>;
}

export function BarberPole() {
  return <svg className="brand-pole" viewBox="0 0 28 50" fill="none" aria-hidden="true"><path d="M9 7V5a5 5 0 0 1 10 0v2M9 43v2a5 5 0 0 0 10 0v-2M6 9h16M6 41h16M9 9h10a2 2 0 0 1 2 2v28a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V11a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.5"/><path d="m8 21 12-10v7L8 28v-7Zm0 12 12-10v7L8 40v-7Z" fill="#b92732"/><path d="M8 21 20 11M8 28l12-10M8 33l12-10M8 40l12-10" stroke="currentColor" strokeWidth=".8"/></svg>;
}

export function ServiceIcon({ type }) {
  return <svg className="service-icon" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {type === 'hair' && <><circle cx="15" cy="48" r="8"/><circle cx="49" cy="48" r="8"/><path d="M20.5 42 52 9 35 37M43.5 42 12 9l17 28"/><circle cx="32" cy="31" r="1.5" fill="currentColor" stroke="none"/></>}
    {type === 'beard' && <><path d="M12 16 46 23l-2 8-34-7 2-8ZM43 30c5 1 9 4 9 8 0 7-10 12-26 17l-12 3c-5 1-7-1-7-3 0-3 3-4 8-6l11-5c7-3 12-7 13-13"/><path d="M14 18l28 6M45 35h.1"/></>}
    {type === 'care' && <><path d="M13 28v-6C13 12 21 7 32 7s19 5 19 15v6M13 28l1 11c1 9 8 14 18 18 10-4 17-9 18-18l1-11"/><path d="M14 23c8 1 14-2 18-7 5 5 11 8 18 7M21 31c2 2 5 2 7 0m8 0c2 2 5 2 7 0M23 42c3-2 6-2 9 0 3-2 6-2 9 0-1 5-4 8-9 9-5-1-8-4-9-9Z"/></>}
  </svg>;
}
