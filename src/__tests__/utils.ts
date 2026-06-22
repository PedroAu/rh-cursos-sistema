import React from 'react';
import { render as rtlRender, RenderOptions } from '@testing-library/react';

// Mock providers wrapper if needed
// For now, just wrapping with a simple Fragment
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return React.createElement(React.Fragment, null, children);
};

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => rtlRender(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
