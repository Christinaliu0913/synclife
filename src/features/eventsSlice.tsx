//import { Event } from "@/types/types";
import { createSlice, createAction, createAsyncThunk } from "@reduxjs/toolkit";
import { User } from "firebase/auth";
import Cookies from 'js-cookie';
import { gapi } from 'gapi-script';

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
    loading: boolean;
}
const initialState: EventsState = {
    events: [],
    loading: false
}


//fetch google events
export const fetchGoogleEvents = createAsyncThunk('events/fetchGoogleEvents',
    async( _ ,{rejectWithValue}) => {
        const token = Cookies.get('googleToken');
        if(!token) return rejectWithValue('No token found');

        //取得google calendar授權並初始化
        try{
            //確保異步處理
            await new Promise((resolve, reject) => {
                gapi.load('client', {
                    callback: resolve,
                    onerror: () => reject('GAPI client loading error')
                });
            });
            
            //設置 Google token
            gapi.client.setToken({access_token:token});
            //初始化client端

            await gapi.client.init({
                discoveryDocs:["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"],
            });

            //讀取事件
            const allGoogleEvents = await readGoogleEvents();//回傳google的events
            return allGoogleEvents;

        }catch(error){
            console.error('Error fetching Google evnets', error);
            return rejectWithValue(error);
        }

        async function readGoogleEvents(){
            const calendarList = await gapi.client.calendar.calendarList.list()
            //calendars 日曆列表（之後可能會用到）
            const calendars = calendarList.result.items || [];

            let allGoogleEvents: any[] = [];
            for(const calendar of calendars){
                if(calendar.accessRole === 'owner' || calendar.accessRole ==='writer'){
                    const eventResponse = await gapi.client.calendar.events.list({
                        calendarId: calendar.id,
                        timeMin: '2024-01-01T00:00:00Z',
                        showDeleted: false,
                        singleEvents: true,
                        orderBy: 'startTime',
                    });
                    const events = eventResponse.result.items || [];
                    //加color到event中
                    const colorEvents = events.map((event: any) => ({
                        ...event,
                        color: calendar.backgroundColor
                    }))
                    
                    allGoogleEvents = [...allGoogleEvents,...colorEvents];
                }
            };
            return allGoogleEvents;
         } 
    }
);


//fetch fetch local events
export const fetchLocalEvents = createAsyncThunk('events/fetchLocalEvents',
    async() => {

    }
)

//fetch task events
export const fetchTasksEvents = createAsyncThunk('events/fetchTasksEvents',
    async() => {
        
    }
)

//add event
export const addEvent = createAsyncThunk('events/addEvent',
    async() => {

    }
)

const eventsSlice = createSlice({
    name: "events",
    initialState,
    reducers:{},
    extraReducers: (builder) => {
        builder
            //fetch Google event
            .addCase(fetchGoogleEvents.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchGoogleEvents.fulfilled, (state, action) => {
                state.events = action.payload ;
                state.loading = false;
            })
            .addCase(fetchGoogleEvents.rejected, (state, action) => {
                state.loading = false
            })
    }
})

export default eventsSlice.reducer;