
import Cookies from 'js-cookie';
import dynamic from 'next/dynamic';
import dayGridPlugin from '@fullcalendar/daygrid' //月、年
import timeGridPlugin from '@fullcalendar/timegrid';//週、日
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list';//列表視圖
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../auth/authContext';
import { gapi } from 'gapi-script';
import { discovery } from 'googleapis/build/src/apis/discovery';
import useGoogleCalendarAPI from '../calendar/1_useGoogleCalendarAPI';
import EventSideBar from './2_EventSideBar';
import { info } from 'console';
import { CalendarApi } from '@fullcalendar/core';
import FullCalendar from '@fullcalendar/react';
import addEventToGoogleCalendar from './2_addNewEvent';
import readEvent from './3_readEvent';

const Calendar = dynamic(() => import("@fullcalendar/react"), {
    ssr: false,
  });

const CalendarComponentTest = () =>{
    //events
    const googleEvents = useGoogleCalendarAPI();
    const [events, setEvents] = useState<any[]|null>([]);
    //Add/edit Event
    const [sideBarVisible, setsideBarVisible] = useState(false);
    //傳入在fullcalendar上面所點選的event or 時間段
    const [selectedEvent, setSelectedEvent] = useState<any|null>(null);
    const [selectedEventId, setSelectedEventId] =useState<string|null>(null);
    const [selectedEndTime, setSelectedEndTime] = useState<string|null>(null);
    const [selectedStartTime, setSelectedStartedTime] = useState<string|null>(null);
    const [allDay,setAllDay] = useState(false);
    //確認token
    const token = Cookies.get('googleToken')


    //載入時確認token跟events來設置events
    useEffect(() => {
        console.log('有跑這裡？？？？？')
            if (googleEvents.length > 0 && JSON.stringify(events) !== JSON.stringify(googleEvents)) {
                setEvents(googleEvents); // 当googleEvents获取到数据时，更新events
                console.log('ckckc')
            }

    }, [googleEvents]);

    useEffect(()=> {
        setEvents(googleEvents);
    },[setEvents])
   

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
        setSelectedEventId(null);
        setSelectedStartedTime(null);
        setSelectedEndTime(null);
        setAllDay(false);

    }
    //更新日曆新事件
    const handleUpdateEvent = (addedEvent:any) => {
        setEvents((events)=> (events? [...events,addedEvent]:[addedEvent]))  
    }

    const handleEventsSet = () => {
        setEvents(events)
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

        //設置事件and ID
        setSelectedEvent(event);
        setSelectedEventId(event.id)
        console.log('確認有沒有ｉｄ',event.id)

        setAllDay(event.allDay);
        //格式化時間
        const formattedStart = formatDateTime(event.startStr, event.allDay);
        const formattedEnd = formatDateTime(event.endStr,event.allDay);

        
        setSelectedStartedTime(formattedStart);
        setSelectedEndTime(formattedEnd);


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
            project: event.extendedProps.project || 'default'
        };
        try{
            const updatedEvent = await addEventToGoogleCalendar(updatedEventData);
            if(updatedEvent){
                const renewEvents = await readEvent();
                setEvents(renewEvents);
                console.log('a;lskdfja;sdf');
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


    const createNewProject = () =>{
        
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
                return {
                    id:event.id,
                    title: event.summary || 'No Tiltle',
                    start: start,
                    end: end, 
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
        
            />
            <EventSideBar
                show={sideBarVisible}
                onClose={()=>setsideBarVisible(false)}
                createNewProject={createNewProject}
                //selectedDate={selectedDate}//傳遞選中的日期時間
                setEvents={setEvents}
                events={events}//傳遞目前的event
                allDay={allDay}
                selectedEvent={selectedEvent}
                selectedEventId={selectedEventId}
                selectedStartTime={selectedStartTime}
                selectedEndTime={selectedEndTime}
                Ondelete={ () => {
                    if(selectedEventId){
                        handleDeleteEvent(selectedEventId);
                    }
                    }}
                
            />
        </>
       

       
        
    )
}

export default CalendarComponentTest;

                    

