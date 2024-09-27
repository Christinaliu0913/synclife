import { configureStore } from '@reduxjs/toolkit'
import tasksReducer from './features/tasksSlice';
import projectReducer from './features/projectsSlice'
import categoryReducer from './features/categoriesSlice'
import eventsSlice from './features/eventsSlice';

export const store = configureStore({
    reducer:{
        events: eventsSlice,
        projects: projectReducer,
        categories: categoryReducer,
        tasks: tasksReducer,
    },
})

export type RootState = ReturnType<typeof store.getState>
//從store中獲取dispatch的類型
export type AppDispatch = typeof store.dispatch;