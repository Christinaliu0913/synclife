import { useState } from "react"
import { useAuth } from '../auth/authContext';
import { db } from '../../../../firebase';
import { collection, doc, setDoc} from 'firebase/firestore';
import { User } from "firebase/auth";

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

interface TaskProps{
    currentUser: User|null;
    loadingUser: boolean;
    setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}

const AddTask:React.FC<TaskProps> = ({currentUser,loadingUser,setTasks}) => {

    const [title,setTitle] = useState('')
    const taskStatus = 'unstarted';
    const taskAssign = [''] ;
    const taskNotAssign = ['']
    const taskDescription = '';
    //const taskDate = new Date().toISOString().slice(0,10);//應該直接設置今天
    const taskDate = ''
    const taskOwner: string | null = currentUser?.email ?? null; 
    const calendarId = '';
    const projectId = '';
    const projectTitle = '';
    const handleAddTask = async() => {
        if(!loadingUser){
            if(currentUser){
                const newDocRef = doc(collection(db,`noProject/${currentUser.uid}/task`));
                const newTask:Task = {
                    id: newDocRef.id,
                        taskTitle:title,
                        taskStatus,
                        taskAssign,
                        taskNotAssign,
                        taskDate,
                        taskDescription,
                        taskOwner,
                        calendarId,
                        createdAt: new Date().toISOString(),
                        projectId,
                        projectTitle
                }
                await setDoc(newDocRef, newTask)

                setTasks((tasks)=> (tasks?[...tasks,newTask]:[newTask]));
                setTitle('');
            }
        }
    }
    return (
        <>
        <input className="tasklist-addTask-input" type="text" placeholder='To do ....' value={title} onChange={(e)=> setTitle(e.target.value)}/>
        <button className="tasklist-addTask" onClick={handleAddTask} >Add Task</button>
        </>
    );

}
export default AddTask;