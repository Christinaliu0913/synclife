"use client"
import {use, useEffect, useRef, useState} from 'react';
import addEventToGoogleCalendar from './2_addNewEvent';

interface EventSideBarProps{
    show: boolean;
    onClose: ()=> void;
    createNewProject: (project:string)=> void 
    setEvents: React.Dispatch<React.SetStateAction<any[]|null>>;
    events: any[]|null;//當前事件的列表
    allDay:boolean;
    //selectedDate: string | null;
    selectedEvent: any|null;
    selectedEventId: string|null;
    selectedStartTime: string | null;
    selectedEndTime: string | null;
    OnUpdate:(addedEvent:any)=> void;
    Ondelete:(addedEvent:any)=> void;
}

interface EventData {
    title: string;
    id: string|null;
    start: string;
    end: string;
    checkAllDay: boolean;
    calendar: string;
    description: string;
    project: string;
}

const EventSideBar:React.FC<EventSideBarProps> = ({
    show, 
    onClose,
    createNewProject,
    setEvents,
    events,
    allDay,
    selectedEvent,
    selectedEventId,
    selectedStartTime,
    selectedEndTime,
    OnUpdate,
    Ondelete
    }) => {
    //要新增使用者目前滑鼠所點到的位置
    
    
    const [title, setTitle] = useState('');
    const [start, setStart] = useState('');
    const [end, setEnd] = useState('');
    const [checkAllDay, setCheckAllDay] = useState(true);
    const [calendar, setCalendar] = useState('default');
    const [description, setDescription] = useState('')
    const [project, setProject] = useState('')
 
    const [clientPosition, setClientPosition] = useState({x:0, y:0});

    useEffect(()=>{
        if(selectedEvent){
            
            setTitle(selectedEvent.title || null);
            setStart(selectedStartTime || '');
            setEnd(selectedEndTime || '');
            setCheckAllDay(allDay);
            setCalendar("primary");
            setDescription(selectedEvent.description || '');
            setProject(selectedEvent.project || 'default');

        }else if(selectedStartTime){
            let endDateTime = selectedEndTime ? selectedEndTime : selectedStartTime;
            setCheckAllDay(allDay);
            setTitle('');
            if(allDay){
                const formattedStart = selectedStartTime.slice(0,10);
                const formattedEnd = endDateTime.slice(0,10);
                
                setStart(formattedStart);
                setEnd(formattedEnd);

            }else{//如果不是allday
                setStart(selectedStartTime);
                setEnd(endDateTime);
            }
        
        }
    },[selectedEvent,selectedStartTime,selectedEndTime,allDay])

    //新增到google calendar上
    const handleSave = async() => {
        const newEventData : EventData ={title, start, end, checkAllDay, calendar, description, project, id: selectedEventId? selectedEventId:null};
        console.log('newEventData',newEventData)
        try{

            const addedEvent = await addEventToGoogleCalendar(newEventData);//將資料傳給google

            if(addedEvent){
               // setEvents((events)=> (events? [...events,addedEvent]:[addedEvent]))
                OnUpdate(addedEvent);
            }

            //清除表單資料
            setTitle('');
            setStart('');
            setEnd('');
            setCalendar('');
            setDescription('');

            //儲存資料後關閉視窗
            onClose();

        }catch(error){
            console.log('新增日曆時出錯',error);
        }

    };

   const handleAllDayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCheckAllDay(e.target.checked);
        //如果為true就強制只保留日期部分
        if(e.target.checked){
            setStart(start.slice(0,10));//只保留日期部分
            setEnd(end.slice(0,10));
        }
   }

  

    return (
        <>
        {/* 點擊才會show */}
        <div className={`addEvent-sidebar ${show ? 'show':''}`}>
        <div className='addEvent-sidebar-container'>
            {/* 表單 */}
            <div>
                <label htmlFor="title">Title</label>
                <input type="text" id='title' value={title} onChange={(e)=>setTitle(e.target.value)} placeholder='tilte'/>
            </div>
            
            <div>
                <label htmlFor="allDay">All Day</label>
                <input type="checkbox" id='allDay' checked={allDay} onChange={handleAllDayChange} placeholder='end time' />
            </div>

            <div>
                <label htmlFor="start">Start time</label>
                <input type={checkAllDay ? "date" : "datetime-local"} id='start' value={start} onChange={(e)=>setStart(e.target.value)} placeholder='start time'/>
            </div>

            <div>
                <label htmlFor="end">End time</label>
                <input type={checkAllDay ? "date" : "datetime-local"} id='end' value={end} onChange={(e)=>setEnd(e.target.value)} placeholder='end time' />
            </div>

            

            <div>
                <label htmlFor="calendar">Calendar</label>
                <select id="calendar" value={calendar} onChange={(e)=>setCalendar(e.target.value)} >
                    <option value="primary">test</option>
                    {/* 我這邊要另外做一個option的選項fetch */}
                </select>
            </div>
                
            <div>
                <label htmlFor="description">Note</label>
                <input type="text" name="" id="description" value={description} onChange={(e)=> setDescription(e.target.value) }/>
            </div>

            <div>
                <label htmlFor="project">Project</label>
                <select id="project" value={project} onChange={(e)=>setCalendar(e.target.value)} >
                    <option value="default">test</option>
                    <option value="addNewProject">Add new project</option>
                    {/* 我這邊要另外做一個option的選項fetch */}
                </select>
            </div>
            {/*  */}
            <button onClick={onClose}>Cancel</button>
            <button onClick={handleSave} >Save</button>
            {selectedEventId &&(
                <button onClick={Ondelete}>Delete</button>
            )}
        </div>
        </div>
        </>
    )
}

export default EventSideBar;