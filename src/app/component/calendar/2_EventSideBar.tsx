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
import { addProjects, fetchProjects } from '@/features/projectsSlice';
import { settingGoogleEvents } from './gapi/2_settingGoogleEvents';
import { gapi } from 'gapi-script';
import { setAddEvent, setGoogleEvents, setUpdateEventDrug, setUpdateGoogleEvent, updateLocalEvent } from '@/features/eventsSlice';


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
    console.log('確認selected日曆haha',selectedEvent)
    console.log('select_________end',selectedEndTime)
    console.log('op',optionProject,'new',newProject)
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
            setDescription(selectedEvent.extendedProps.description || '');
            setOptionCalendar(selectedCalendar||'')
            setProject(selectedProject || '');
            setProjectId(selectedProjectId||'');
            setOptionProject(selectedProjectId || '');
            setGoogleCalendars(calendars||[]);
            setEventType(selectedEvent.extendedProps.taskType)
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
        if(selectedEventId){//如果選到既有的event的話
            //先分辨其為google還是locol event
            //googleEvent
            console.log('確認一下這例',selectedEvent.extendedProps.taskType)
            if(eventType == 'googleEvent'){
                const projectId = selectedProjectId? selectedProjectId: newProject;
                const updatedEventData  ={
                    title : title || '', 
                    start, 
                    end, 
                    checkAllDay, 
                    calendar: calendar || 'default', 
                    description, 
                    projectId: newProject, 
                    id: selectedEventId? selectedEventId : null
                };

                const updatedEvent = await addEventToGoogleCalendar(updatedEventData);

                if(updatedEvent)(
                    dispatch(setUpdateGoogleEvent(updatedEventData))
                )

            }
            //task
            else if(eventType == 'task'){
                return;
            }
            //localEvent
            else{
                const event = selectedEvent.event;
                const eventId = selectedEventId;
                const eventDef = doc(db, `event/${currentUser?.uid}/event`,selectedEventId)
                const start = selectedEvent.startStr;
                const end = selectedEvent.endStr;
                const allDay = selectedEvent.allDay;
                const updatedlocalEventData = {
                    title,
                    start,
                    end,
                    checkAllDay: allDay,
                    description: selectedEvent.extendedProps.description ||'',
                    taskStatus: 'Unstarted',
                    projectTitle: '',
                    projectId: newProject? newProject: selectedProject||'',
                    createdAt: new Date().toISOString(),
                    taskType: 'event',
                    id: selectedEvent.id,
                }
                console.log('這裡這裡',updatedlocalEventData)
                try{
                    dispatch(updateLocalEvent({eventDef,updatedlocalEventData,eventId}))
                    
                }catch(error){
                    console.log('更新localEvent時出錯????',error);
                }
            }
            onClose();

            


        }else{
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
            console.log('id',selectedEventId)
            const endTimeSet = end.slice(0,10);
            const project = projects.find((proj) => proj.id === newProject);
            const projectTitle = project ? project.projectTitle : '';
    
            try{
                //先確認有沒有連到google calendar
                const googleToken = Cookies.get('googleToken');
                if(googleToken){
                    await AddorEditProjectTask({ projectId, newProject, title, endTimeSet,calendarId,currentUser })
                    //將資料傳給google
                    const addedEvent = await addEventToGoogleCalendar(newEventData);
                    
                    if(addedEvent){
                        if(addedEvent.checkAllDay){
                            const allGoogleEvents  = [{
                            ...addedEvent,
                            id: addedEvent.id,
                            start: { date: start},
                            end: { date: end},
                            color: addedEvent.backgroundColor,
                            taskType: 'googleEvent',
                            }];
                            dispatch(setGoogleEvents(allGoogleEvents));
                        }else{
                            console.log('asldkfjalsdfj;alsdkjf', addedEvent.id)
                            const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
                            const formattedStartDateTime = new Date(start).toISOString();
                            const formattedEndDateTime = new Date(end).toISOString();
                            const allGoogleEvents  = [{
                                ...JSON.parse(JSON.stringify(addedEvent)),
                                id: addedEvent.id,
                                start: { dateTime: formattedStartDateTime, timeZone: userTimeZone },
                                end: { dateTime: formattedEndDateTime, timeZone: userTimeZone },
                                color: addedEvent.backgroundColor,
                                taskType: 'googleEvent',
                            }];
                            dispatch(setGoogleEvents(allGoogleEvents));
                        }
                        
                        
                    }
                }else{
                    console.log('without google calendar auth, save in local');
                    const newEventRef = doc(collection(db, `event/${currentUser?.uid}/event`))
                    console.log('ckckckckckckckc',start,end)
                    await setDoc(newEventRef,{
                        title: title || '',
                        start: start,
                        end: end,
                        checkAllDay: checkAllDay,
                        description: description || '',
                        taskStatus: 'Unstarted',
                        projectTitle: '',
                        projectId: optionProject || '',
                        createdAt: new Date().toISOString()
                    })
                    const localEvent = [{
                        title: title || '',
                        start: start,
                        end: end,
                        checkAllDay: checkAllDay,
                        description: description || '',
                        taskStatus: 'Unstarted',
                        projectTitle: projectTitle||'',
                        projectId: newProject? newProject : '',
                        createdAt: new Date().toISOString(),
                        taskType: 'event',
                        id: newEventRef.id,
                    }];
                    console.log('save',localEvent)
                    dispatch(setAddEvent(localEvent));
    
                }
    
    
    
                //儲存資料後關閉視窗
                onClose();
    
            }catch(error){
                console.log('新增日曆時出錯',error);
            }
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
    setOptionProjectTitle('');
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

    //RWD滑動
    const [isDragging, setIsDragging] = useState(false)
    const [offsetY, setOffsetY] = useState(0);//滑鼠與元素頂部的位置的gap
    const [initialY, setInitialY] =useState(0);//元素初始位置
    const [expand, setExpand] = useState(false);//控制展開視窗
    const THRESHOLD = 10;//設置滑動閾值

    //拖動中
    const handleMouseMove = (e:any) => {
        const sidebar = document.querySelector('.addEvent-sidebar-phone') as HTMLElement;
        if(!sidebar) return;
        const newY = e.clientY - offsetY
        if(isDragging && !expand){//未展開
            
            if(initialY - e.clientY > THRESHOLD){
                sidebar.style.height = '80%';
                sidebar.style.transform = `translateY(0)`;//固定
                setExpand(true);
            }
            else{sidebar.style.transform =`translateY(${newY-initialY}px)`}
            
            console.log('work', newY)
        }
        

    }
    const handlePutDown = (e:any) => {
        const sidebar = document.querySelector('.addEvent-sidebar-phone') as HTMLElement;
        if(expand){
            sidebar.style.height = 'auto';
            sidebar.style.transform =`translateY(0)`;
            setExpand(false);
        }else{
            sidebar.style.height = '80%';
            sidebar.style.transform = `translateY(0)`;//固定
            setExpand(true);
        }
    }
    const handleMouseUp = (e:any) => {
        setIsDragging(false);
        //解除禁止選擇
        document.body.style.userSelect = 'auto';
    }

    //開始拖動
    const handleMouseDown = (e:any) => {
        const sidebar = document.querySelector('.addEvent-sidebar-phone') as HTMLElement;
            if(sidebar){
                const rect = sidebar.getBoundingClientRect();
                setIsDragging(true);
                setOffsetY(e.clientY - rect.top);//偏移量
                setInitialY(rect.top)
                console.log('drag',rect.top)
                //禁止選擇
                document.body.style.userSelect = 'none';
            }
        
    }
    //監聽花束的事件
    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            document.addEventListener('touchmove', handleMouseMove);
            document.addEventListener('touchend', handleMouseUp);
        } else {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.removeEventListener('touchmove', handleMouseMove);
            document.removeEventListener('touchend', handleMouseUp);
        }
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.removeEventListener('touchmove', handleMouseMove);
            document.removeEventListener('touchend', handleMouseUp);
        };
    }, [isDragging]);


    //create Project
    const [createProject, setCreateProject] = useState('');

    const handleCreateNewProject = () => {
        if(!loadingUser){
            if(currentUser){
                const newDocRef = doc(collection(db, 'project'));
                const newProject:Project = {
                    id: newDocRef.id,
                    uid:currentUser.uid,
                    projectTitle: createProject,
                    projectColor: '',
                    projectStatus:'Unstarted',
                    projectMember: currentUser && currentUser.email ? [currentUser.email] : [],
                    projectDateStart: new Date().toISOString(),
                    projectDateEnd: '',
                    projectOwner:currentUser?.email ?? undefined,
                    createdAt: new Date().toISOString(),
                    projectOrder:null,
                }
                
                dispatch(addProjects({newDocRef, newProject}));
            }
        }
        setShowCreateNewProject(false);
        return;
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
                    
                

                <div style={{display:"none"}} className='sidebar-project'>
                    
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
                                    <div className='sidebar-overlay'></div>
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
                                        <input type="text" name="" id="" value={createProject} onChange={(e)=>setCreateProject(e.target.value)} placeholder='Project name'/>
                                        <div className='createProject-create' onClick={handleCreateNewProject}>Create project</div>
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
        {/* 手機調整 --------------------------------------*/}
        {sideBarVisible && (<>
            <div className={`addEvent-sidebar-phone`}  onMouseMove={handleMouseMove} onTouchMove={handleMouseMove} onMouseUp={handleMouseUp} onTouchEnd={handleMouseUp}>
            
                <div className='addEvent-sidebar-container-phone'>
                    {/* 表單 */}
                    
                    
                    <div className='sidebar-edit-phone'>
                        <button  className='sidebar-cancel' onClick={onClose}>Cancel</button>
                        <div></div>
                        <div className='sidebar-toggleBar-container' >
                            <div className={`sidebar-toggleBar ${isDragging? 'dragging': ''}`} onMouseDown={handleMouseDown} onTouchStart={handleMouseDown} onClick={handlePutDown}></div>
                        </div>
                        <div></div>
                        <button  className='sidebar-save'onClick={handleSave}  >Save</button>

                    </div>
                    
                    <div className='sidebar-title-phone'>
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
                    
                
                    <div className='sidebar-date-phone'>
                        {/* <label htmlFor="start"></label> */}
                        <input type={checkAllDay ? "date" : "datetime-local"} id='start' value={start} onChange={(e)=>setStart(e.target.value)} placeholder='start time'/>
                        <label htmlFor="end">~</label>
                        <input type={checkAllDay ? "date" : "datetime-local"} id='end' value={end} onChange={(e)=>setEnd(e.target.value)} placeholder='end time' />
                    </div>

                

                    <div className='sidebar-allday-phone'>
                        <label htmlFor="allDay">All Day</label>
                        <input type="checkbox" id='allDay' checked={checkAllDay} onChange={handleAllDayChange} placeholder='end time' />
                    </div>
                        
                    

                    <div style={{display:"none"}} className='sidebar-project-phone'>
                        
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
                    {expand?
                    <>
                        <div className='sidebar-project-phone'>
                        
                            <Image className='sidebar-projectImg' src="/images/Folder_light.svg" alt="task project" width={25} height={25}/>
                            <label htmlFor="project">Project</label>
                            <div className='sidebar-project-select-phone' onClick={()=> setShowProjectSelect(!showProjectSelect)}>
                                {optionProjectTitle? optionProjectTitle : 'Add in project' }
                                <Image className='sidebar-project-select-toggle' src="/images/toggle.svg" alt="task project" width={15} height={15}/>
                                {showProjectSelect && 
                                    (
                                        <>
                                            <div className='sidebar-overlay'></div>
                                            <div className='sidebar-project-selectItems-phone'>
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
                                        <div className='sidebar-project-createProject-phone'>
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

                        <div className='sidebar-note-phone' >
                            <input placeholder='Note' type="text" name="" id="description" value={description} onChange={(e)=> setDescription(e.target.value) }/>
                        </div>
                    </>:
                    <></>
                    }
                    

                    
                    {/*  */}
                    
                    {selectedEventId &&(
                        <div
                            className='sidebar-delete' 
                            onClick={Ondelete}>
                            <Image className='sidebar-delete' src="/images/delete.svg" alt="task project" width={20} height={20}/>
                        </div>
                    )}
                </div>
            
            </div>
        
        
        
        </>)}
        
        </>
    )
}

export default EventSideBar;