import React from 'react';
import { renderToString } from 'react-dom/server';

console.log('Loading components...');

try {
  const HomeModule = require('./app/page.tsx');
  const Home = HomeModule.default;
  console.log('Home component loaded successfully. Attempting to render...');
  const htmlHome = renderToString(React.createElement(Home));
  console.log('Home Render success! HTML length:', htmlHome.length);
} catch (error) {
  console.error('Home Render crashed:');
  console.error(error);
}

try {
  const NotFoundModule = require('./app/not-found.tsx');
  const NotFound = NotFoundModule.default;
  console.log('NotFound component loaded successfully. Attempting to render...');
  const htmlNF = renderToString(React.createElement(NotFound));
  console.log('NotFound Render success! HTML length:', htmlNF.length);
} catch (error) {
  console.error('NotFound Render crashed:');
  console.error(error);
}
