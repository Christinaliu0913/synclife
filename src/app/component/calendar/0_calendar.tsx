
import Cookies from 'js-cookie';
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid' //月、年
import timeGridPlugin from '@fullcalendar/timegrid';//週、日
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list';//列表視圖
import { useState, useEffect } from 'react'
import { useAuth } from '../auth/authContext';
import { gapi } from 'gapi-script';
import { discovery } from 'googleapis/build/src/apis/discovery';
import useGoogleCalendarAPI from '../calendar/1_useGoogleCalendarAPI';
import EventSideBar from './EventSideBar';
import { info } from 'console';

const Calendar = () =>{
    const googleEvents = useGoogleCalendarAPI();
    const [events, setEvents] = useState<any[]|null>([]);
    
    const [sideBarVisible, setsideBarVisible] = useState(false);
    //傳入在fullcalendar上面所點選的時間段
    const [selectedDate, setSelectedDate] = useState<string|null>(null);
    const [selectedEndTime, setSelectedEndTime] = useState<string|null>(null);
    const [selectedStartTime, setSelectedStartedTime] = useState<string|null>(null);
    const [allDay,setAllDay] = useState(false);


    useEffect(() => {
        const test = () => {
            if (googleEvents.length > 0) {
                setEvents(googleEvents); // 当googleEvents获取到数据时，更新events
            }
        }
        test();
        
    }, [googleEvents]);
    
    const handleDateClick = (info:any)=> {
        setsideBarVisible(true);
        setAllDay(info.allDay)
        //setSelectedDate(info.dateStr);//獲取日期時間
        setSelectedStartedTime(info.startStr);
        setSelectedEndTime(info.endStr);
        console.log('startDay',info.startStr)
        console.log('testtest',info.endStr)
        console.log('全天測試',info.allDay)
        //console.log('setSelectedDate',info.dateStr)
        
    }
    const createNewProject = () =>{
        
    }
    const handleSibebarClose = ()=>{
        setsideBarVisible(false)
        setSelectedDate(null)
    }

    

    return (
        <>
         <FullCalendar
            plugins={[dayGridPlugin,timeGridPlugin,interactionPlugin,listPlugin]}
            initialView='timeGridWeek'//初始視圖
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
            events={events?.map((event:any) => {
                const start = event.start?.date || event.start?.dateTime;
                const end =  event.end?.date || event.end?.dateTime
                return {
                    title: event.summary || 'No Tiltle',
                    start: start,
                    end: end}
            })}//把載入的google events傳遞給FullCalendar
            editable={true}
            selectable={true}
            //dateClick={(info)=>handleDateClick(info)}
            select={(info)=>handleDateClick(info)}
            />
            <EventSideBar
                show={sideBarVisible}
                onClose={()=>setsideBarVisible(false)}
                createNewProject={createNewProject}
                //selectedDate={selectedDate}//傳遞選中的日期時間
                setEvents={setEvents}
                events={events}//傳遞目前的event
                allDay={allDay}
                selectedStartTime={selectedStartTime}
                selectedEndTime={selectedEndTime}
                
            />
        </>
       

       
        
    )
}

export default Calendar;

                    

