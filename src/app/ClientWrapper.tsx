"use client";

import { AuthProvider } from './component/auth/authContext';
import AuthCheck from './component/auth/authCheck';
import { Provider } from 'react-redux';
import { store } from '@/store';

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthProvider>
        <AuthCheck>{children}</AuthCheck>
      </AuthProvider>
    </Provider>
  );
}