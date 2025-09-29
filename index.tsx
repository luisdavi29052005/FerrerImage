/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// @ts-ignore
tailwind.config = {
  theme: {
    extend: {
      colors: {
        'vintage-paper': '#f4f1e9',
        'brand-brown': '#6d5d4b',
        'brand-blue': '#5a7d9a',
        'brand-orange': '#d97706',
        'brand-red': '#b91c1c',
      },
      fontFamily: {
        'display': ['"Playfair Display"', 'serif'],
        'body': ['Lato', 'sans-serif'],
        'marker': ['"Permanent Marker"', 'cursive'],
        'handwriting': ['Caveat', 'cursive'],
      },
      backgroundImage: {
        'paper-texture': `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.08'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }
    },
  },
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);