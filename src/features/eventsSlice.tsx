//import { Event } from "@/types/types";
import { createSlice, createAction, createAsyncThunk, current } from "@reduxjs/toolkit";
import { db } from '../../firebase'
import { User } from "firebase/auth";
import Cookies from 'js-cookie';
import { gapi } from 'gapi-script';
import { collection, deleteDoc, DocumentData, DocumentReference, getDocs, query, updateDoc, where } from "firebase/firestore";
import { RootState } from "@/store"; 
import { docs } from "googleapis/build/src/apis/docs";
import { EventTask, Task,Project } from "@/types/types";
import addEventToGoogleCalendar from "@/app/component/calendar/2_addNewEvent";
import { deleteTasksAsync,fetchTasks } from "./tasksSlice";
import { useAuth } from "@/app/component/auth/authContext";
import { fetchProjects } from "./projectsSlice";


interface Event {
    title: string;
    id: string|null;
    start: string;
    end: string;
    checkAllDay: boolean;
    calendar: string;
    description: string;
    newProject: string|null;
}

interface EventsState{
    events: Event[];
    calendars : [];
    loading: boolean;
}
const initialState: EventsState = {
    events: [],
    calendars : [],
    loading: false
}




//fetch fetch local events
export const fetchLocalEvents = createAsyncThunk('events/fetchLocalEvents',
    async(currentUser: User|null,{getState, dispatch}) => {
        if(!currentUser) return console.log('wrong');
        //Redux store
        let state = getState() as RootState;
        let allTasks: Task[] = state.tasks.allTasks;
        let projects: Project[] = state.projects.projects;
         // 檢查並載入 projects
        if (!Array.isArray(projects)) {
            await dispatch(fetchProjects(currentUser)).unwrap();
            state = getState() as RootState;
            projects = state.projects.projects;
        }
        //本地端組數
        let localEvents: any[] = [];

        //firebase(event)
        try{
            const eventQuery = query(collection(db, `event/${currentUser.uid}/event`))
            const eventSnapshot = await getDocs(eventQuery);
            const currentUserEvents = eventSnapshot.docs.map(doc => {
                const project = projects?.find(pro => pro.id === doc.data().projectId);
                return{
                    id:doc.id,
                    ...doc.data(),
                    taskType: 'event',
                    projectTitle: project? project.projectTitle : null
                }
                }
            )
            localEvents.push(...currentUserEvents);
        }catch(error){
            console.error('fail to fetch events', error)
        }
        

        //redux store(tasks)
        const taskEvents:EventTask[] = allTasks.map(doc => ({
            ...doc,
            title: doc.taskTitle,
            start:doc.taskDate,
            end:doc.taskDate,
            taskType:'task',
            allDay: true,
            backgroundColor: doc.taskStatus === 'Done' ? '#d2c4b995' : '#C07767',
            calendarType: '',
            completed: doc.taskStatus === 'Done'? true:false,
        }))

        localEvents.push(...taskEvents);
        console.log('Loaded events',localEvents)
        return localEvents;
    }   
);



//update Google event
export const updateGoogleEvent = createAsyncThunk('events/updateGoogleEvent',
    async(updatedEvent) => {

    }
)
//update local event
export const updateLocalEvent = createAsyncThunk('events/addlocalEvent',
    async({eventDef,updatedEventData,eventId}:{eventDef:DocumentReference<DocumentData>,updatedEventData:{},eventId:string}) => {
        try{
            await updateDoc(eventDef, updatedEventData as DocumentData)
        }catch(error){
            console.log('更新localEvent時錯誤',error);
        }
        return {eventId, updatedEventData}
    }
)


//add Google event
// export const addGoogleEvent = createAsyncThunk('events/addGoogleEvent',
//     async(eventData: Event, { rejectWithValue }) => {
//         const token = Cookies.get('googleToken');
//         if(!token) return rejectWithValue('No google calendar token found');
//         try{
//             const updatedEvent = await addEventToGoogleCalendar(eventData);
//             return updatedEvent;
//         }catch(error){
//             console.error('Fail to add Google Calendar event', error);
//             return rejectWithValue(error);
//         }
//     }
// );

//delete local event
export const deleteLocalEvent =createAsyncThunk('events/deleteLocalEvent',
    async({eventDef, eventId}:{eventDef:DocumentReference<DocumentData>,eventId:string}) => {
        try{
            await deleteDoc(eventDef);
            return eventId;
        }
        catch(error){
            console.error('刪除本地端event時出錯',error);
        }
        
        
    }
)
const eventsSlice = createSlice({
    name: "events",
    initialState,
    reducers:{
        setEvents(state, action) {
            state.events = action.payload ? [...state.events, ...action.payload] : state.events;
            state.loading = false;
          },
          setCalendars(state, action) {
            state.calendars = action.payload || state.calendars;
          },
          setLoading(state, action) {
            state.loading = action.payload;
          },
    },
    extraReducers: (builder) => {
        builder
            //fetch Local events
            .addCase(fetchLocalEvents.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchLocalEvents.fulfilled, (state, action) => {
                state.events = action.payload? [...state.events, ...action.payload]: state.events;
                state.loading = false;
                console.log('event task ckckckc',action.payload)
            })
            //Add Google Events
            // .addCase(addGoogleEvent.pending, (state) => {
            //     state.loading = true;
            // })
            // .addCase(addGoogleEvent.fulfilled, (state, action) => {
            //     state.events = action.payload ? [...state.events, action.payload] : state.events;
            //     state.loading = false;
            // })
            // .addCase(addGoogleEvent.rejected, (state) => {
            //     state.loading = false;
            // })
            //Delete Local Events
            .addCase(deleteLocalEvent.pending, (state) => {
                state.loading = true;
            })
            .addCase(deleteLocalEvent.fulfilled, (state, action) => {
                state.events =state.events.filter(event => event.id !== action.payload )
            })
    }
})

export default eventsSlice.reducer;
export const { setEvents, setCalendars, setLoading } = eventsSlice.actions;