import React from 'react';
import './globals.css';

export const metadata = {
  title      : 'Bini.js App',
  description: 'Modern React application built with Bini.js',
  keywords   : ['Bini.js', 'React', 'Vite'],
  themeColor : '#00CFFF',
  manifest   : '/site.webmanifest',
  openGraph: {
    title      : 'Bini.js App',
    description: 'Modern React application built with Bini.js',
    images     : [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card   : 'summary_large_image',
    title  : 'Bini.js App',
    creator: '@binidu01',
    images : ['/og-image.png'],
  },
  icons: {
    icon : [{ url: '/favicon.ico', type: 'image/x-icon' }],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <React.Fragment>{children}</React.Fragment>;
}
