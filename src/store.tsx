import { configureStore } from '@reduxjs/toolkit'
import tasksReducer from './features/tasksSlice';

export const store = configureStore({
    reducer:{
        tasks: tasksReducer,
    },
})

export type RootState = ReturnType<typeof store.getState>
//從store中獲取dispatch的類型
export type AppDispatch = typeof store.dispatch;