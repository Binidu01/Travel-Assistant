import React from 'react';
import './globals.css';

// metadata is read by bini-router at build time and injected into index.html.
// It is automatically stripped from the browser bundle — never ships to the client.
export const metadata = {
  title      : 'Sri Lanka Travel Assistant',
  description: 'Find hotels, compare prices and plan your trip across Sri Lanka — AI‑powered.',
  keywords   : ['Bini.js', 'Sri Lanka', 'hotels', 'travel', 'React', 'Vite'],
  themeColor : '#00CFFF',
  manifest   : '/site.webmanifest',
  openGraph: {
    title      : 'Sri Lanka Travel Assistant',
    description: 'Find hotels, compare prices and plan your trip across Sri Lanka — AI‑powered.',
    images     : [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card   : 'summary_large_image',
    title  : 'Sri Lanka Travel Assistant',
    creator: '@binidu01',
    images : ['/og-image.png'],
  },
  icons: {
    icon : [{ url: '/favicon.ico', type: 'image/x-icon' }],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
  },
};

// Root layout — wraps every page.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <React.Fragment>{children}</React.Fragment>;
}
