
import Cookies from 'js-cookie';
import dynamic from 'next/dynamic';
import dayGridPlugin from '@fullcalendar/daygrid' //月、年
import timeGridPlugin from '@fullcalendar/timegrid';//週、日
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list';//列表視圖
import { useState, useEffect, useRef } from 'react'

import { collection, query, where, getDocs, doc,setDoc,updateDoc } from 'firebase/firestore';
import { db } from '../../../../firebase';
import { useAuth } from '../auth/authContext';
import { Task, Project } from '@/types/types';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { AppDispatch } from '@/store'
import { deleteLocalEvent, fetchLocalEvents, setLoading, setUpdateEventDrug, updateLocalEvent} from '@/features/eventsSlice';
import { updateTaskProject, updateTasksAsync } from '@/features/tasksSlice';
import EventSideBar from './2_EventSideBar';
import { fetchProjects } from '@/features/projectsSlice';
import { useFetchGoogleEvents } from './gapi/useFetchGoogleEvent';
import addEventToGoogleCalendar from './2_addEventToGoogleCalendaar';




const Calendar = dynamic(() => import("@fullcalendar/react"), {
    ssr: false,
  });

const CalendarComponent = () =>{
    
    //目前使用者資料
    const { currentUser } = useAuth();
    //確認token
    const token: string|undefined = Cookies.get('googleToken');
    //傳入在fullcalendar上面所點選的event or 時間段
    const [selectedEvent, setSelectedEvent] = useState<any|null>(null);
    const [selectedEventId, setSelectedEventId] =useState<string>('');
    const [selectedCalendar, setSelectedCalendar] = useState<string|null>(null)
    const [selectedEndTime, setSelectedEndTime] = useState<string|null>(null);
    const [selectedStartTime, setSelectedStartedTime] = useState<string|null>(null);
    const [selectedProject, setSelectedProject] = useState<string|null>(null);
    const [selectedProjectId, setSelectedProjectId] = useState<string|null>(null);
    const [allDay,setAllDay] = useState(false);
    const [selectedEventType, setSelectedEventType ] = useState<string>('');
    //Add/edit Event
    const [sideBarVisible, setsideBarVisible] = useState(false);
    //----------------store data目前使用者的project---------------------
    const dispatch:AppDispatch = useDispatch();
    // task
    const allTasks = useSelector((state:RootState) => state.tasks.allTasks);
    const taskLoading = useSelector((state: RootState) => state.tasks.loading);
    // project                                                                                                                                                                                                                                                                                          
    const projectLoading = useSelector((state: RootState) => state.projects.loading);
    // event
    const events = useSelector((state:RootState) => state.events.events)
    const calendars = useSelector((state:RootState) => state.events.calendars)
    const projects = useSelector((state:RootState) => state.projects.projects)
  
    //載入時確認token跟events來設置events
    useEffect(() => {
        
        dispatch(fetchLocalEvents(currentUser));
        
    }, [currentUser, allTasks]);
    //載入google events
    useFetchGoogleEvents(token, projects, dispatch);
   

    //點擊日曆時間段新增event
    const handleDateClick = (info:any)=> {
        const startTime = new Date(info.startStr);
        const endTime = new Date(info.endStr);
        resetEventData();
        setsideBarVisible(true);
        setAllDay(info.allDay)
        
        //格式化時間
        const formattedStartTime = `${startTime.getFullYear()}-${String(startTime.getMonth() + 1).padStart(2, '0')}-${String(startTime.getDate()).padStart(2, '0')}T${String(startTime.getHours()).padStart(2, '0')}:${String(startTime.getMinutes()).padStart(2, '0')}`;
        const formattedEndTime = `${endTime.getFullYear()}-${String(endTime.getMonth() + 1).padStart(2, '0')}-${String(endTime.getDate()).padStart(2, '0')}T${String(endTime.getHours()).padStart(2, '0')}:${String(endTime.getMinutes()).padStart(2, '0')}`;

        //設置選擇時間
        setSelectedStartedTime(formattedStartTime);
        setSelectedEndTime(formattedEndTime);
        
        
    }
    //重置選中的事件數據
    const resetEventData = () => {
        setSelectedEvent(null);
        setSelectedEventId('');
        setSelectedStartedTime(null);
        setSelectedEndTime(null);
        setAllDay(false);
        setSelectedEventType('');
    }

    //設置event的Render內容
    const renderEventContent = (eventInfo:any) =>{
        
        if(eventInfo.event.extendedProps.taskType ==='task'){
            return (
                <>
                <div>
                    <div style={{padding:'2px',fontSize:'13px',height:'auto',display:'flex'}}>
                        <input 
                            style={{width:'10px', height:'10px', padding:'0px'}}
                            type="checkbox"
                            checked={eventInfo.event.extendedProps.completed}
                            onChange={()=>handleTaskCheck(eventInfo.event.extendedProps.taskId,eventInfo.event.extendedProps.completed,eventInfo.event.extendedProps.projectId)}
                        />
                        <div style={{overflow:'auto',overflowX:'hidden',overflowY:'hidden'}}>
                            <span style={{width:'auto',position:'relative',color:'#6E4D31',textAlign:'right'}}>{eventInfo.event.extendedProps.projectTitle}</span>
                            <span style={{marginRight:'6px'}}> {eventInfo.event.title}  </span>
                            
                        </div>
                    </div>
                    
                </div>
                
                 </>
            )
        }
        //若是是一個普通事件，使用默認的顯示樣式
        return( 
            <div>
                <b>{eventInfo.event.title}</b><br />
                {eventInfo.event.extendedProps.calendarType?
                    (<><i>{eventInfo.event.extendedProps.calendarType}</i><br /></>):
                    (<></>)
                }
                
                <i>{eventInfo.event.extendedProps.projectTitle}</i>
            </div> 
        )
    }

    //設置taskchecked
    const handleTaskCheck = async(taskId:string,completed:boolean,projectId:string|null) => {
        try{
            const newStatus = completed ? 'Unstarted':'Done';//反轉現在狀態
            //如果有project的話
            if(projectId){
                const withProjectQuery = query(collection(db,'project'), where('projectMember','array-contains',currentUser?.email))
                const currentUserProjectSnapshot = await getDocs(withProjectQuery);
                const currentUserProject = currentUserProjectSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                } as Project));

                for(const proj of currentUserProject){
                            
                    const categoryQuery = query(collection(db,`project/${proj.id}/category`));
                    const categorySnapshot = await getDocs(categoryQuery);
                    for(const cat of categorySnapshot.docs){
                        const taskQuery = query(collection(db,`project/${proj.id}/category/${cat.id}/task`),
                            where('taskAssign', 'array-contains', currentUser?.email)
                        );
                        const taskSnapshot = await getDocs(taskQuery);
                        if(!taskSnapshot.empty){
                            const taskRefString = `project/${projectId}/category/${cat.id}/task`;
                            const updatedData = {taskStatus:newStatus}
                            dispatch(updateTasksAsync({taskRefString,updatedData,taskId}))
                        }
                    } 
                }
            }
            else{
                const taskRefString = `noProject/${currentUser?.uid}/task/`;
                const updatedData = {taskStatus:newStatus}
                dispatch(updateTasksAsync({taskRefString,updatedData,taskId}))
            }
        }catch(error){
            console.log('check Task error',error)
        }
    }
    //----------------------------------------------------------編輯event-------------------------------------------------------

    //格式化時間
    const formatDateTime = (dateTimeString: string, allDay:boolean) => {
        const date = new Date(dateTimeString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        if(allDay){
            return `${year}-${month}-${day}`;
        }else{
            return `${year}-${month}-${day}T${hours}:${minutes}`;
        }
    }


    const handleEventClick = (clickInfo: any) => {
        
        setsideBarVisible(true);
        const event = clickInfo.event;
        console.log('這是這個event',clickInfo)
        //設置事件and ID
        setSelectedEvent(event);
        setSelectedEventId(event.id)
        setSelectedEventType(event.extendedProps.taskType);
        

        setAllDay(event.allDay);
        //格式化時間
        const formattedStart = formatDateTime(event.startStr, event.allDay);
        const formattedEnd = formatDateTime(event.endStr,event.allDay);

        
        setSelectedStartedTime(formattedStart);
        setSelectedEndTime(formattedEnd);
        setSelectedProject(event.extendedProps.projectTitle)
        setSelectedProjectId(event.extendedProps.projectId);
        setSelectedCalendar(event.extendedProps.calendarType);

    }

    //拖曳更新時間
    const handleEventDrop= async( info :any) => {
        const event = info.event;
        
        const isGoogleCalendarEvents = event.extendedProps.taskType === 'googleEvent';
        const isLocalTaskEvents = event.extendedProps.taskType === 'task';
        const isLocalEvents = event.extendedProps.taskType ==='event';
        const start = event.startStr;
        const end = event.endStr;
        const allDay = event.allDay;
        console.log('ckckckckckckckc',event._def)
        const updatedEventData = {
            title: event.title,
            id: event.id,
            start: event.startStr,
            end: event.endStr,
            calendar: 'primary',
            checkAllDay:event.allDay,
            description: event.extendedProps.description ||'',
            newProject: event.extendedProps.project || 'default'
        };

        try{
            let updatedEvent = null;
            //檢查是否連到google calendar
            if( isGoogleCalendarEvents ){
                if(!token){
                    throw new Error('No Google Calendar token found.')
                }

                //更新 google calendar 上的events
                //這邊讓addEvent function 來整理邏輯（是否為新增的資料還是有帶id的event
                updatedEvent = await addEventToGoogleCalendar(updatedEventData);

                //要更新redux store的event

            }
            //如果是localEvent
            else if(isLocalEvents){ 
                const eventId = event.id;
                const eventDef = doc(db, `event/${currentUser?.uid}/event`, eventId);
                dispatch(updateLocalEvent({eventDef,updatedEventData,eventId}))
                updatedEvent = {...updatedEventData, id: eventId};
            }
            else{
                console.log('Task不可變動',event);
                return 
            }
            // 如果更新成功，将更新的事件传递给 setUpdateEvent
            if (updatedEvent) {

                //  Redux 的 setUpdateEvent
                dispatch(setUpdateEventDrug({start, end, allDay,updatedEvent}));
                console.log('以拖拉更新后的事件:', );
            }
        }catch(error){
            console.log('拖曳更新時出錯',error)
        }
    }

    //刪除event
    const handleDeleteEvent= async(eventId:string,selectedEventType:string) =>{
        if(selectedEventType === 'googleEvent'){
            // dispatch(deleteGoogleEvent({eventId}));
            setsideBarVisible(false);
   
        }
        else if (selectedEventType === 'event'){
            if(currentUser){
                const eventDef = doc(db, `event/${currentUser.uid}/event/${eventId}`);
                dispatch(deleteLocalEvent({eventDef, eventId}))
            }
        }else{
            console.log('Task不可變動',event);
                return 
        }
        
    }

    return (
        <>
         <Calendar
            plugins={[dayGridPlugin,timeGridPlugin,interactionPlugin,listPlugin]}
            initialView='timeGridWeek'//初始視圖
            //timeZone='local'
            headerToolbar={{
                left:'title',
                center:'dayGridMonth,timeGridWeek,timeGridDay,dayGridYear',
                right:'prev,next,today'
            }}
            views={{
                dayGridMonth:{
                    buttonText:'M'
                },
                timeGridWeek:{
                    buttonText:'W'
                },
                timeGridDay:{
                    buttonText:'D'
                },
                dayGridYear:{
                    buttonText:'Y'
                }
                
            }}
            //把載入的google events傳遞給FullCalendar
            events={events && events.length >0 ? events.map((event:any) => {
                const start = event.start?.date || event.start?.dateTime;
                const end =  event.end?.date || event.end?.dateTime
                if(event.taskType === 'googleEvent'){
                    return {
                        id:event.id,
                        title: event.summary || 'No Tiltle',
                        start: start,
                        end: end, 
                        projectTitle: event.projectTitle,
                        projectId: event.projectId,
                        calendarType: event.calendarType,
                        taskType:event.taskType,
                        color:event.color,

                    }
                }
                else{
                    return {
                        id:event.id,
                        title: event.title || 'No Tiltle',
                        start: event.start,
                        end: end, 
                        projectTitle: event.projectTitle,
                        projectId: event.projectId,
                        calendarType: event.calendarType,
                        taskType:event.taskType,
                        taskId:event.taskId,
                        color:event.backgroundColor,
                        completed:event.completed,
                    }
                }
                
                    
            }): []}
            editable={true}
            selectable={true}
            //dateClick={(info)=>handleDateClick(info)}
            select={(info)=>handleDateClick(info)}
            //編輯event
            eventClick={handleEventClick}
            eventDrop={handleEventDrop}
            eventContent={renderEventContent}
        
            />
            <EventSideBar
                show={sideBarVisible}
                //token={token}
                // createNewProject={createNewProject}
                //selectedDate={selectedDate}//傳遞選中的日期時間
                allDay={allDay}
               //傳遞目前的calendar有哪些，並且render到calendar option
                calendars={calendars}
                selectedEvent={selectedEvent}
                selectedEventId={selectedEventId}
                selectedEventType={selectedEventType}
                selectedStartTime={selectedStartTime}
                selectedEndTime={selectedEndTime}
                selectedCalendar={selectedCalendar}
                selectedProject={selectedProject}
                selectedProjectId={selectedProjectId}
                sideBarVisible = {sideBarVisible}
                setsideBarVisible={setsideBarVisible}
                Ondelete={ () => {
                    if(selectedEventId && selectedEventType){
                        handleDeleteEvent(selectedEventId, selectedEventType);
                    }
                    }}
                
            />
        </>
       

       
        
    )
}

export default CalendarComponent;

                    