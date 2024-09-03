
import { useState, useEffect } from 'react';
import useGoogleCalendarAPI from './calendar/1_useGoogleCalendarAPI';
import { useAuth } from './auth/authContext';
import { db } from '../../../firebase';
import { collection, deleteDoc, doc, getDocs, query,updateDoc,where } from 'firebase/firestore';

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
}

const MainPage = () => {
    //設置Auth
    const {currentUser, loadingUser} = useAuth();
    //googleEvents
    const {googleEvents, googleCalendars} = useGoogleCalendarAPI();
    //設置整體的evnets(firebase的event跟)
    const [events ,setEvents ] = useState<any[]>([]);
    const [tasks, setTasks ] = useState([]);
    const [projects, setProjects ] = useState([]);

    
    // -------------------------Google events Fetch
    useEffect(()=> {
       if(googleEvents.length > 0 ){
        setEvents(prev => prev? [...prev, ...googleEvents] : googleEvents)
       } 
    }, [googleCalendars])


    // --------------------------task fetch

    // google event fetch
    // firebase events fetch 
        //sidebar event create-> firebases events setting 



    return (
        <>
        {/* calendar */}
        {/* task toggle */}
        
        
        
        
        
        </>
    )
}