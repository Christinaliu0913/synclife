"use client";

import { AuthProvider } from './component/auth/authContext';
import AuthCheck from './component/auth/authCheck';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { DndProvider} from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
        <AuthProvider>
          <AuthCheck>{children}</AuthCheck>
        </AuthProvider>
    </Provider>
  );
}