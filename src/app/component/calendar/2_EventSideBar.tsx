"use client"
import {use, useEffect, useRef, useState} from 'react';
import addEventToGoogleCalendar from './2_addNewEvent';
import { gapi } from 'gapi-script';
import readEvent from './3_readEvent';
import ProjectOption from './4_projectOption';
import { collection, query, where, getDocs, doc,updateDoc, deleteDoc } from 'firebase/firestore';
import { auth, db } from '../../../../firebase';
import { useAuth } from '../auth/authContext';
import AddorEditProjectTask from './3_addprojectTask';
import Image from 'next/image';

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

interface EventSideBarProps{
    show: boolean;
    createNewProject: (project:string)=> void 
    setEvents: React.Dispatch<React.SetStateAction<any[]>>;
    events: any[]|null;//當前事件的列表
    tasks:any;
    allDay:boolean;
    calendars: any[]|null;
    //selectedDate: string | null;
    selectedEvent: any|null;
    selectedEventId: string;
    selectedStartTime: string | null;
    selectedEndTime: string | null;
    selectedCalendar: string |null;
    selectedProject: string | null;
    selectedProjectId: string | null;
    sideBarVisible:boolean;
    setsideBarVisible: React.Dispatch<React.SetStateAction<boolean>>;
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
    newProject: string|null;
}






const EventSideBar:React.FC<EventSideBarProps> = ({
    show, 
    createNewProject,
    setEvents,
    events,
    tasks,
    allDay,
    calendars,
    selectedEvent,
    selectedEventId,
    selectedStartTime,
    selectedEndTime,
    selectedCalendar,
    selectedProject,
    selectedProjectId,
    sideBarVisible,
    setsideBarVisible,
    Ondelete
    }) => {
    //要新增使用者目前滑鼠所點到的位置

    const [clientPosition, setClientPosition] = useState({x:0, y:0});
    //所選到的event資料
    const [calendarId, setCalendarId] = useState('')
    const [title, setTitle] = useState('');
    const [start, setStart] = useState('');
    const [end, setEnd] = useState('');
    const [checkAllDay, setCheckAllDay] = useState(true);
    
    const [description, setDescription] = useState('')
    //calendar
    const [calendar, setCalendar] = useState('');
    const [newCalendar, setNewCalendar] = useState('')
    const [optionCalendar, setOptionCalendar] = useState('') 
    //Project
    const [project, setProject] = useState('')
    const [newProject, setNewProject] = useState<string|null>('');
    const [projectId, setProjectId] = useState('');
    const [optionProject, setOptionProject] = useState('');
    //目前使用者資料
    const { currentUser,loadingUser } = useAuth();
    //googleCalendar List
    const [googleCalendars, setGoogleCalendars] = useState<any[]|null>([])
    //Project資料
    const [projects, setProjects] = useState<Project[]>([]);
    console.log('確認selected日曆',selectedEvent)
    //處理選到evnet的資訊
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(()=>{
        //確認選到event的內容
        if(selectedEvent){
            //如果有選到event的id的話
            setCalendarId(selectedEventId)
            setTitle(selectedEvent.title || null);
            setStart(selectedStartTime || '');
            setEnd(selectedEndTime || '');
            setCheckAllDay(allDay);
            setCalendar("primary");
            setDescription(selectedEvent.description || '');
            setOptionCalendar(selectedCalendar||'')
            setProject(selectedProject || '');
            setProjectId(selectedProjectId||'');
            setOptionProject(selectedProjectId || '');
            setGoogleCalendars(calendars||[]);
        //如果沒有的話設定選到的時間
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
        console.log('project;alksdjf', project)
    },[selectedEvent,selectedStartTime,selectedEndTime,allDay])

    //先fetc h這個人的project
    useEffect(()=>{
        const fetchProjects = async () => {
            if(!loadingUser && currentUser){
                try{
                    const q = query(collection(db, 'project'), where('projectMember','array-contains',currentUser.email));
                    const querySnapshot = await getDocs(q);
                    const currentUserProjects = querySnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    } as Project));
                    if(currentUserProjects){
                        setProjects(currentUserProjects);
                        console.log('這個人的project有', currentUserProjects);
                        
                    }else{
                        console.log('這個人沒有project')
                    }
                }catch(error){
                    console.log('獲取項目出錯',error);
                }
            }
        }
        fetchProjects();
    },[currentUser,loadingUser])

    //新增到google calendar上
    const handleSave = async() => {
        const newEventData : EventData ={
            title : title || '', 
            start, 
            end, 
            checkAllDay, 
            calendar: calendar || 'default', 
            description, 
            newProject, 
            id: selectedEventId? selectedEventId : null
        };
        const endTimeSet = end.slice(0,10);
        console.log('newEventData',newEventData);
        

        try{
            console.log('cat創立',project)

            await AddorEditProjectTask({ projectId, newProject, title, endTimeSet,calendarId,currentUser })
            //將資料傳給google
            const addedEvent = await addEventToGoogleCalendar(newEventData);
            
            if(addedEvent){
                const renewEvents = await readEvent(currentUser,tasks);
                if(renewEvents){
                    setEvents(renewEvents);
                }else{
                    console.log('新增或編輯新實踐時更新資料錯誤')
                }

                //！！！！！！！！要修改這曆有關要怎麼把project也跟新進去！！！
                
            }
            

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

     //關閉sidebar
     const onClose = () => {
        setsideBarVisible(false)
        //清除表單資料
        clearSideBar();
      } 
      //清理sidebar的東西
    const clearSideBar = () => {
    setTitle('');
    setStart('');
    setEnd('');
    setCalendar('');
    setDescription('');
    setProject('');
    setProjectId('');
    setOptionCalendar('');
    }
   

    return (
        <>
        {/* 點擊才會show */}
        {sideBarVisible && (
            <div className={`addEvent-sidebar `}>
            
            <div className='addEvent-sidebar-container'>
                {/* 表單 */}
                <div className='sidebar-title'>
                    <label htmlFor="title"></label>
                    <input  type="text" id='title' value={title} onChange={(e)=>setTitle(e.target.value)} placeholder='Tilte'/>
                </div>
                
               
                <div className='sidebar-date'>
                    <label htmlFor="start">Start time</label>
                    <input type={checkAllDay ? "date" : "datetime-local"} id='start' value={start} onChange={(e)=>setStart(e.target.value)} placeholder='start time'/>
                </div>

                <div className='sidebar-date'>
                    <label htmlFor="end">End time</label>
                    <input type={checkAllDay ? "date" : "datetime-local"} id='end' value={end} onChange={(e)=>setEnd(e.target.value)} placeholder='end time' />
                </div>

                <div className='sidebar-allday'>
                    <label htmlFor="allDay">All Day</label>
                    <input type="checkbox" id='allDay' checked={checkAllDay} onChange={handleAllDayChange} placeholder='end time' />
                </div>


                {/* <div>
                    <label htmlFor="calendar">Calendar</label>
                    <select id="calendar" 
                        value={optionCalendar} 
                        onChange={(e)=>{
                            if(e.target.value === '0')
                            setCalendar(e.target.value);
                            setOptionCalendar(e.target.value)
                        }} >
                        
                        <option value="primary">test</option>
                        <option value="0">None</option>
                        {googleCalendars?.map(calendar => (
                        <option value={calendar.summary} key={calendar.id}>{calendar.summary}</option>
                        ))

                        }
                        
                
                    </select>
                </div> */}
                    
                <div className='sidebar-note' >
                    <input placeholder='Note' type="text" name="" id="description" value={description} onChange={(e)=> setDescription(e.target.value) }/>
                </div>

                <div className='sidebar-project'>
                    
                    <Image className='sidebar-projectImg' src="/images/Folder_light.svg" alt="task project" width={25} height={25}/>
                    <label htmlFor="project">Project</label>
                    <select id="project" 
                            value={optionProject} 
                            onChange={(e)=>{
                                if(e.target.value === '0'){
                                    setOptionProject('')
                                    setNewProject(null)
                                    
                                }
                                else{
                                    setNewProject(e.target.value)
                                    setOptionProject(e.target.value)
                                    console.log('changeck',optionProject)
                                }
                                console.log('changeck',optionProject)
                                console.log('finalck',optionProject)
                            }} >
                        <option value="0">None</option>
                        {projects?.map(project => (
                        <ProjectOption
                            key={project.id}
                            project={project}
                        />   
                        )
                        )}

                        
                        <button>add new project</button>
                    </select>
                </div>
                {/*  */}
                <button  className='sidebar-cancel' onClick={onClose}>Cancel</button>
                <button  className='sidebar-save'onClick={handleSave} >Save</button>
                {selectedEventId &&(
                    <div
                        className='sidebar-delete' 
                        onClick={Ondelete}>
                        <Image className='sidebar-delete' src="/images/trash.svg" alt="task project" width={20} height={20}/>
                    </div>
                )}
            </div>
            <div className='sidebar-overlay' onClick={onClose}></div>
        </div>

        )}
        
        </>
    )
}

export default EventSideBar;