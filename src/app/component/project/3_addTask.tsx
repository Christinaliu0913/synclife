import { auth, db } from '../../../../firebase';
import { collection, doc, setDoc} from 'firebase/firestore';
import { useAuth } from '../auth/authContext';
import Image from 'next/image';
import { Dispatch, SetStateAction } from 'react';

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
    createdAt: string;  
}


interface AddTaskProps {
    categoryId: string;
    setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
    tasks: Task[];
    projectId: string;
}


const AddTask: React.FC<AddTaskProps> = ({categoryId,setTasks,tasks,projectId}) => {
    const {currentUser,loadingUser} = useAuth();
    const taskTitle = '';
    const taskStatus = 'Unstarted';
    const taskAssign:string[] = [];
    const taskNotAssign = ['']
    const taskDescription = '';
    const taskDate = new Date().toISOString();//應該直接設置今天
    const taskOwner: string | null = currentUser?.email ?? null; 
    const calendarId = '';
    
    console.log('checasdfasdfadfilllll',projectId)
    

    //新增一個Task
    const handleAddTask = async() => {
        if(!loadingUser){
            if(currentUser){
                const newDocRef = doc(collection(db, `project/${projectId}/category/${categoryId}/task`));
                const newTask:Task = {
                    id: newDocRef.id,
                        taskTitle,
                        taskStatus,
                        taskAssign,
                        taskNotAssign,
                        taskDate,
                        taskDescription,
                        taskOwner,
                        calendarId,
                        createdAt: new Date().toISOString(),
                        projectId: projectId
                }
                await setDoc(newDocRef, newTask)
                console.log('已新增一個task了', newDocRef.id,`project/${projectId}/category/${categoryId}/task`)

                setTasks(tasks => (tasks ? [newTask,...tasks] : [newTask]));
            }
            console.log('no currentUser')
        }
    };

    return (
        <>
            <button onClick={handleAddTask}>
                + Task
            </button>
        </>
    )
}

export default AddTask;