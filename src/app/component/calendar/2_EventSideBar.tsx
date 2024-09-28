"use client"
import {use, useEffect, useRef, useState} from 'react';
import addEventToGoogleCalendar from './2_addEventToGoogleCalendaar';
import ProjectOption from './4_projectOption';
import { collection, query, where, getDocs, doc,updateDoc, deleteDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../../../firebase';
import { useAuth } from '../auth/authContext';
import AddorEditProjectTask from './3_addprojectTask';
import Image from 'next/image';
import { Project, Event } from '@/types/types';
import Cookies from 'js-cookie';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { AppDispatch } from '@/store'
import { fetchProjects } from '@/features/projectsSlice';


interface EventSideBarProps{
    show: boolean;
    //token:string |undefined;
    allDay:boolean;
    calendars: any[]|null;
    //selectedDate: string | null;
    selectedEvent: any|null;
    selectedEventId: string;
    selectedEventType: string;
    selectedStartTime: string | null;
    selectedEndTime: string | null;
    selectedCalendar: string |null;
    selectedProject: string | null;
    selectedProjectId: string | null;
    sideBarVisible:boolean;
    setsideBarVisible: React.Dispatch<React.SetStateAction<boolean>>;
    Ondelete:(addedEvent:any)=> void;
}



const EventSideBar:React.FC<EventSideBarProps> = ({
    show, 
    //token,
    allDay,
    calendars,
    selectedEvent,
    selectedEventId,
    selectedEventType,
    selectedStartTime,
    selectedEndTime,
    selectedCalendar,
    selectedProject,
    selectedProjectId,
    sideBarVisible,
    setsideBarVisible,
    Ondelete
    }) => {

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
    const [optionProjectTitle, setOptionProjectTitle] = useState('');
    //目前使用者資料
    const { currentUser,loadingUser } = useAuth();
    //googleCalendar List
    const [googleCalendars, setGoogleCalendars] = useState<any[]|null>([])
    //Project資料

    //type
    const [eventType, setEventType] = useState(''); 

    //visible
    const [isEventDeleteVisible, setIsEventDeleteVisible] = useState(false)
    const [showProjectSelect, setShowProjectSelect] = useState(false)
    const [showNewProject, setShowNewProject] = useState(false)
    const [showCreateNewProject, setShowCreateNewProject] = useState(false)
    console.log('確認selected日曆',selectedEvent)
    
    //----------------store data目前使用者的project---------------------
    const dispatch:AppDispatch = useDispatch();
    // task
    const allTasks = useSelector((state:RootState) => state.tasks.allTasks);
    const taskLoading = useSelector((state: RootState) => state.tasks.loading);
    // project
    const projects = useSelector((state: RootState) => state.projects.projects);
    const projectLoading = useSelector((state: RootState) => state.projects.loading);
    // event
    const events = useSelector((state:RootState) => state.events.events)
  
    useEffect(() => {
        dispatch(fetchProjects(currentUser));
    }, [dispatch,allTasks]);


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
            setEventType(selectedEvent.taskType)
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

    },[selectedEvent,selectedStartTime,selectedEndTime,allDay])


    //新增到google calendar上
    const handleSave = async() => {
        const newEventData : Event ={
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
        

        try{
            //先確認有沒有連到google calendar
            const googleToken = Cookies.get('googleToken');
            if(googleToken){
                await AddorEditProjectTask({ projectId, newProject, title, endTimeSet,calendarId,currentUser })
                //將資料傳給google
                const addedEvent = await addEventToGoogleCalendar(newEventData);

                // if(addedEvent){
                //     dispatch(fetchGoogleEvents(token))
                // }
            }else{
                console.log('without google calendar auth, save in local');
                const newEventRef = doc(collection(db, `event/${currentUser?.uid}/event`))
                await setDoc(newEventRef,{
                    title: title || '',
                    start: start,
                    end: end,
                    checkAllDay: checkAllDay,
                    description: description || '',
                    taskStatus: 'Unstarted',
                    projectTitle: '',
                    projectId: newProject || '',
                    createdAt: new Date().toISOString()
                })
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
    const onCloseProjectCreate = () => {
        setShowCreateNewProject(false)

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
    setNewProject('');
    setOptionProject('');
    }
   
    //adding or change project
    const handleOptionClick = (project: Project | null) => {
        if(project !==null){
            setNewProject(project.id);
            setOptionProject(project.id);
            setOptionProjectTitle(project.projectTitle);
        }
        else{
            setOptionProject('');
            setNewProject(null);
        }
    }
    //Adding New project
    const handleAddNewProject = () => {
        setShowCreateNewProject(!showCreateNewProject)

    }
    return (
        <>
        {/* 點擊才會show */}
        {sideBarVisible && (
            <div className={`addEvent-sidebar`}>
            
            <div className='addEvent-sidebar-container'>
                {/* 表單 */}
                <div className='sidebar-title'>
                    <label htmlFor="title"></label>
                    <input  type="text" id='title' value={title} onChange={(e)=>setTitle(e.target.value)} placeholder='Title'/>
                    <button className="sidebar-delete1"onClick={()=>{setIsEventDeleteVisible(prev=> !prev)}}>
                    ⋮
                    {isEventDeleteVisible?
                    (<>
                        <div className="sidebar-delete-block" onClick={Ondelete}>
                            <Image  src="/images/delete.svg" alt="project delete" width={20} height={20}/>
                        </div>
                        {/* <div className="sidebar-delete-overlay" onClick={()=>{setIsEventDeleteVisible(false)}}></div> */}
                    </>):
                    <></>
                    }
                </button>
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
                            }}
                            onClick={()=> setShowNewProject(!showNewProject)}
                            >
                        <option value="0">None</option>
                        {Array.isArray(projects) ?
                            (projects?.map(project => (
                                <ProjectOption
                                    key={project.id}
                                    project={project}
                                />   )
                            ))
                            :
                            (
                                <>
                                <option >no projects</option>
                                </>
                            )
                        
                        }

                        
                        
                    </select>
                  
                    
                    
                </div>
                <div className='sidebar-project'>
                    
                    <Image className='sidebar-projectImg' src="/images/Folder_light.svg" alt="task project" width={25} height={25}/>
                    <label htmlFor="project">Project</label>
                    <div className='sidebar-project-select' onClick={()=> setShowProjectSelect(!showProjectSelect)}>
                        {optionProjectTitle? optionProjectTitle : 'Add in project' }
                        <Image className='sidebar-project-select-toggle' src="/images/toggle.svg" alt="task project" width={15} height={15}/>
                        {showProjectSelect && 
                            (
                                <>
                                    {/* <div className='sidebar-overlay'></div> */}
                                    <div className='sidebar-project-selectItems'>
                                        <button onClick={()=> handleAddNewProject()}><Image src="/images/add.svg" alt="task project" width={15} height={15}/>Add new project</button>
                                        <div  className="sidebar-project-selectItem" onClick={() => handleOptionClick(null)}> no project </div>
                                        {Array.isArray(projects) ?
                                            (projects?.map(project => (
                                                <div key={project.id} className="sidebar-project-selectItem" onClick={() => handleOptionClick(project) } ><p>{project.projectTitle}</p></div> )
                                            ))
                                            :
                                            (
                                                <>
                                                <div className="sidebar-project-selectItem">no projects</div>
                                                </>
                                            )
                                        
                                        }
                                        
                                    </div>   
                                    
                                </>
                            )
                        }
                    
                    </div>
                    
                    {showCreateNewProject &&
                        (
                            <>
                                <div className='sidebar-project-createProject'>
                                    <div className='sidebar-project-createProject-box'>
                                        <div>
                                            Create new project
                                        </div>
                                        <input type="text" name="" id="" placeholder='Project name'/>
                                        <div className='createProject-create'>Create project</div>
                                        <button onClick={onCloseProjectCreate} className='createProject-close'>x</button>
                                    </div>
                                </div>
                                <div onClick={onCloseProjectCreate} className='sidebar-overlay'>

                                </div>
                            </>
                            
                        )
                    }
                    
                </div>

                <div className='sidebar-note' >
                    <input placeholder='Note' type="text" name="" id="description" value={description} onChange={(e)=> setDescription(e.target.value) }/>
                </div>

                
                {/*  */}
                <button  className='sidebar-cancel' onClick={onClose}>Cancel</button>
                <button  className='sidebar-save'onClick={handleSave} >Save</button>
                {selectedEventId &&(
                    <div
                        className='sidebar-delete' 
                        onClick={Ondelete}>
                        <Image className='sidebar-delete' src="/images/delete.svg" alt="task project" width={20} height={20}/>
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