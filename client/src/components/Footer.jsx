import React from 'react';
import { Phone, Code2 } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="zotech-footer no-print">
      <div className="brand" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Code2 size={15} style={{ color: '#38bdf8' }} />
        <span>تم التصميم والتطوير بواسطة <strong>ZoTech</strong></span>
      </div>

      <div className="contact-links">
        <a
          href="https://instagram.com/zo__tech"
          target="_blank"
          rel="noopener noreferrer"
          title="تابعنا على انستجرام"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
          </svg>
          <span>Instagram: <strong>zo__tech</strong></span>
        </a>

        <span style={{ color: '#475569' }}>|</span>

        <a
          href="https://wa.me/201275984405"
          target="_blank"
          rel="noopener noreferrer"
          title="تواصل معنا عبر واتساب"
        >
          <Phone size={13} />
          <span>WhatsApp: <strong className="num-mono">01275984405</strong></span>
        </a>
      </div>
    </footer>
  );
}
