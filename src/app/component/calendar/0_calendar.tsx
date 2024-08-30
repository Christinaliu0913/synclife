
import Cookies from 'js-cookie';
import dynamic from 'next/dynamic';
import dayGridPlugin from '@fullcalendar/daygrid' //月、年
import timeGridPlugin from '@fullcalendar/timegrid';//週、日
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list';//列表視圖
import resourceTimelinePlugin from '@fullcalendar/resource-timeline';
import { useState, useEffect, useRef } from 'react'
import { gapi } from 'gapi-script';
import useGoogleCalendarAPI from '../calendar/1_useGoogleCalendarAPI';
import EventSideBar from './2_EventSideBar';
import addEventToGoogleCalendar from './2_addNewEvent';
import readEvent from './3_readEvent';
import { collection, query, where, getDocs, doc,setDoc,updateDoc } from 'firebase/firestore';
import { db } from '../../../../firebase';
import Project from '@/app/pages/page';
import { google } from 'googleapis';
import { useAuth } from '../auth/authContext';
import { calendar } from 'googleapis/build/src/apis/calendar';
import { start } from 'repl';
import { info } from 'console';


interface Project {
    id: string;
    uid: string;
    projectTitle: string;
    projectStatus: string;
    projectMember: string[];
    projectDateStart: string;
    projectDateEnd: string;
    projectOwner: string | undefined;
    createdAt: string;
}


interface Task {
    id: string;
    taskTitle: string;
    taskStatus: string;
    taskAssign: string[]|[];
    taskNotAssign: string[]|[];
    taskDate: string;
    taskDescription: string;
    taskOwner: string | null;
    calendarId: string;
    projectId: string;
    projectTitle: string;
    createdAt: string;  
    completed: boolean;
}




const Calendar = dynamic(() => import("@fullcalendar/react"), {
    ssr: false,
  });

const CalendarComponent = () =>{
    //events
    const {googleEvents, googleCalendars} = useGoogleCalendarAPI();
    const [events, setEvents] = useState<any[]>([]);
    // task
    const [tasks, setTasks] = useState<any[]>([])
    const [projects, setProjects] = useState<Project[]>([]);
    //設置googleCalendar的list

    //Add/edit Event
    const [sideBarVisible, setsideBarVisible] = useState(false);
    //目前使用者資料
    const { currentUser,loadingUser } = useAuth();
    //傳入在fullcalendar上面所點選的event or 時間段
    const [selectedEvent, setSelectedEvent] = useState<any|null>(null);
    const [selectedEventId, setSelectedEventId] =useState<string>('');
    const [selectedCalendar, setSelectedCalendar] = useState<string|null>(null)
    const [selectedEndTime, setSelectedEndTime] = useState<string|null>(null);
    const [selectedStartTime, setSelectedStartedTime] = useState<string|null>(null);
    const [selectedProject, setSelectedProject] = useState<string|null>(null);
    const [selectedProjectId, setSelectedProjectId] = useState<string|null>(null);
    const [allDay,setAllDay] = useState(false);
    //確認token
    const token = Cookies.get('googleToken')

   
    
  
    //載入時確認token跟events來設置events
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        
            const checkProjectForEvents = async() => {

                if(currentUser){
                    //先撈目前使用者的Project
                    const projectQuery = query(collection(db, 'project'),where('projectMember', 'array-contains',currentUser.email));
                    const projectSnapshot = await getDocs(projectQuery);

                    const projectWithAccess = projectSnapshot.docs.map(doc => ({
                        id: doc.id,
                        title: doc.data().projectTitle,
                        ...doc.data()
                    }));
                

                    //確認每個event的內容
                    const updatedEvents = await Promise.all(
                        googleEvents.map(async event => {
                            let projectId = '';//默認沒有projectId
                            const calendarType = event.organizer.displayName
                            let projectTitle = '';
                            //console.log('eventId',event.id)
                            //在項目中看有沒有這個calendar.id的task
                            for(const proj of projectWithAccess){
                                const categoryQuery = query(collection(db, `project/${proj.id}/category`));
                                const categorySnapshot = await getDocs(categoryQuery);

                                for(const categoryDoc of categorySnapshot.docs){
                                    const taskQuery = query
                                        (collection(db, `project/${proj.id}/category/${categoryDoc.id}/task`),
                                        where('calendarId', '==', event.id)
                                    );
                                    const taskSnapshot = await getDocs(taskQuery);

                                    if(!taskSnapshot.empty){
                                        //console.log(' !!!!!!!!有taskproject',taskSnapshot)
                                        const taskData = taskSnapshot.docs[0].data();
                                        projectId = taskData.projectId || projectId;
                                        projectTitle = proj.title ||'';
                                        //console.log('!!!!!!!!專案名稱',projectTitle)
                                    }
                                    //console.log(' non taskproject',taskSnapshot)
                                }
                                
                                
                            }  
                            return {
                                ...event,
                                taskType: "event",
                                projectTitle,
                                projectId,
                                calendarType,
                            };
                        }));
                
            //--------task------------------------------------------
                        //沒有在project裡的task
                    const q = query(collection(db, `noProject/${currentUser.uid}/task`))
                    const noProjetTaskSnapshot = await getDocs(q);
                    const noProjectTask = noProjetTaskSnapshot.docs.map(doc =>({
                        id: doc.id,
                        title: doc.data().taskTitle,
                        start: doc.data().taskDate,
                        end: doc.data().taskDate,
                        allDay: true,
                        backgroundColor: doc.data().taskStatus === 'Done' ? '#d3d3d3' : '#ffcc00',
                        taskId: doc.data().id,
                        taskType:'task',//標註其為任務
                        projectTitle: doc.data().projectTitle,
                        projectId: doc.data().projectId,
                        calendarType: '',
                        completed: doc.data().taskStatus === 'Done'? true:false,
                    })) ;
                    if(noProjectTask){
                        setTasks(pre => pre? [...pre, ...noProjectTask]: noProjectTask)
                    }
                    //在project且被assigned的task
                    const withProjectQuery = query(collection(db,'project'), where('projectMember','array-contains',currentUser.email))
                    const currentUserProjectSnapshot = await getDocs(withProjectQuery);
                    const currentUserProject = currentUserProjectSnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    } as Project));
                    setProjects(currentUserProject)

                    const fetchwithProjectTasks = async()=>{
                        for(const proj of currentUserProject){
                            
                            const categoryQuery = query(collection(db,`project/${proj.id}/category`));
                            const categorySnapshot = await getDocs(categoryQuery);
                            for(const cat of categorySnapshot.docs){
                                const taskQuery = query(collection(db,`project/${proj.id}/category/${cat.id}/task`),
                                    where('taskAssign', 'array-contains', currentUser.email)
                                );
                                const taskSnapshot = await getDocs(taskQuery);
                                if(!taskSnapshot.empty){
                                    const taskData = taskSnapshot.docs.map(doc => ({
                                      
                                        id: doc.id,
                                        title: doc.data().taskTitle,
                                        start: doc.data().taskDate,
                                        end: doc.data().taskDate,
                                        allDay: true,
                                        backgroundColor: doc.data().taskStatus === 'Done' ? '#d3d3d3' : '#ffcc00',
                                        taskId: doc.data().id,
                                        taskType:'task',//標註其為任務
                                        projectTitle: doc.data().projectTitle,
                                        projectId: doc.data().projectId,
                                        calendarType: '',
                                        completed: doc.data().taskStatus === 'Done' ? true:false,
                                    }))
                                    const taskDataWithProTitle = taskData.map(task => ({...task,
                                        projectTitle: proj.projectTitle}))
                                    if(taskDataWithProTitle){
                                        console.log('projectproject', proj.projectTitle)
                                        setTasks(pre => pre?[...pre, ...taskDataWithProTitle]:taskDataWithProTitle)
                                        return taskDataWithProTitle
                                    }
                                }
                                
                            }
                        }
                    }
                    const withProjectTasks = await fetchwithProjectTasks()
                    setEvents([...updatedEvents,...(noProjectTask||[]),...(withProjectTasks||[])]);
                }
            }
            if (googleEvents.length > 0 && JSON.stringify(events) !== JSON.stringify(googleEvents)) {
                setEvents(googleEvents);
                checkProjectForEvents(); 
                console.log('ckckc')
            }
            
    }, [googleEvents]);

    
    console.log('tasktask',tasks)
    console.log('這個人的tasks',events)
    //點擊日曆時間段新增event
    const handleDateClick = (info:any)=> {
        resetEventData();
        setsideBarVisible(true);
        setAllDay(info.allDay)

        const startTime = new Date(info.startStr);
        const endTime = new Date(info.endStr);
        
        //格式化時間
        const formattedStartTime = `${startTime.getFullYear()}-${String(startTime.getMonth() + 1).padStart(2, '0')}-${String(startTime.getDate()).padStart(2, '0')}T${String(startTime.getHours()).padStart(2, '0')}:${String(startTime.getMinutes()).padStart(2, '0')}`;
        const formattedEndTime = `${endTime.getFullYear()}-${String(endTime.getMonth() + 1).padStart(2, '0')}-${String(endTime.getDate()).padStart(2, '0')}T${String(endTime.getHours()).padStart(2, '0')}:${String(endTime.getMinutes()).padStart(2, '0')}`;
        console.log('格式化時間',formattedStartTime)
        console.log('格式化時間end',formattedEndTime)
        //設置選擇時間
        
        console.log('標題確認',selectedEvent)
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

    }
    //
    const handleEventsSet = () => {
        setEvents(events)
    }

    //設置event的Render內容
    const renderEventContent = (eventInfo:any) =>{
        
        if(eventInfo.event.extendedProps.taskType ==='task'){
            return (
                <div style={{backgroundColor:eventInfo.backgroundColor, padding:'5px'}}>
                    <input 
                        type="checkbox"
                        checked={eventInfo.event.extendedProps.completed}
                        onChange={()=>handleTaskCheck(eventInfo.event.extendedProps.taskId,eventInfo.event.extendedProps.completed,eventInfo.event.extendedProps.projectId)}
                    />
                    <span>{eventInfo.event.title}  </span>
                    <i>{eventInfo.event.extendedProps.projectTitle}</i>

                </div>

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
                            const taskRef = doc(db,`project/${projectId}/category/${cat.id}/task/${taskId}`);
                            await updateDoc(taskRef,{
                                taskStatus:newStatus
                            });
                            //更新本地端
                            setTasks(prevTasks => prevTasks?.map(task =>
                                task.id === taskId ? {...task, completed: !completed, taskStatus: newStatus}: task
                            ))
                            setEvents(prevEvents => prevEvents?.map(event=>
                                event.id === taskId ? {...event, compelted:!completed, taskStatus: newStatus} :event
                            ))
                        }
                    } 
                }
            }
            else{
                const taskRef = doc(db,`noProject/${currentUser?.uid}/task/${taskId}`);
                await updateDoc(taskRef,{
                    taskStatus:newStatus
                });
                //更新本地端
                setTasks(prevTasks => prevTasks?.map(task =>
                    task.id === taskId ? {...task, completed: !completed, taskStatus: newStatus}: task
                ))
                setEvents(prevEvents => prevEvents?.map(event=>
                    event.id === taskId ? {...event, compelted:!completed, taskStatus: newStatus} :event
                ))
            }
        }catch(error){
            console.log('check Task error',error)
        }
    }
    //----編輯event-----
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
        

        setAllDay(event.allDay);
        //格式化時間
        const formattedStart = formatDateTime(event.startStr, event.allDay);
        const formattedEnd = formatDateTime(event.endStr,event.allDay);

        
        setSelectedStartedTime(formattedStart);
        setSelectedEndTime(formattedEnd);
        setSelectedProject(event.projectTitle)
        setSelectedProjectId(event.extendedProps.projectId);
        setSelectedCalendar(event.extendedProps.calendarType);

    }

    //拖曳更新時間
    const handleEventDrop= async( info :any) => {
        const event = info.event;
        
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
            const updatedEvent = await addEventToGoogleCalendar(updatedEventData);
            if(updatedEvent){
                const renewEvents = await readEvent(currentUser,tasks);
                if(renewEvents){
                    setEvents(renewEvents);
                }else{
                    console.log('拖曳更新時沒有讀取到資料')
                }
                
                
            }
        }catch(error){
            console.log('拖曳更新時出錯',error)
        }
        
    }

    //刪除event
    const handleDeleteEvent= async(eventId:string) =>{
        try{
            await gapi.client.calendar.events.delete({
                calendarId: 'primary',
                eventId: eventId,
            });

            //更新本地端
            setEvents(events => events?.filter(event=>event.id !== eventId)||[]);
            setsideBarVisible(false);
        }catch(error){
            console.error('刪除事件時出錯',error)
        }
    }


    
    const createNewProject = () => {

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
                if(event.taskType === 'event'){
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
            //新增資料更新時可以即時更新-->待處理
            eventsSet={handleEventsSet}
            eventContent={renderEventContent}
        
            />
            <EventSideBar
                show={sideBarVisible}
                createNewProject={createNewProject}
                //selectedDate={selectedDate}//傳遞選中的日期時間
                setEvents={setEvents}
                events={events}//傳遞目前的event
                tasks={tasks}
                allDay={allDay}
                calendars={googleCalendars}//傳遞目前的calendar有哪些，並且render到calendar option
                selectedEvent={selectedEvent}
                selectedEventId={selectedEventId}
                selectedStartTime={selectedStartTime}
                selectedEndTime={selectedEndTime}
                selectedCalendar={selectedCalendar}
                selectedProject={selectedProject}
                selectedProjectId={selectedProjectId}
                sideBarVisible = {sideBarVisible}
                setsideBarVisible={setsideBarVisible}
                Ondelete={ () => {
                    if(selectedEventId){
                        handleDeleteEvent(selectedEventId);
                    }
                    }}
                
            />
        </>
       

       
        
    )
}

export default CalendarComponent;

                    