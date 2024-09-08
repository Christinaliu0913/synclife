import { auth, db } from '../../../../../firebase';
import { collection, doc, setDoc} from 'firebase/firestore';
import { useAuth } from '../../auth/authContext';
import { Dispatch, SetStateAction } from 'react';
import { useDispatch } from 'react-redux';
import { Task } from '@/types/types';
import { addTasksAsync } from '@/features/tasksSlice';
import { AppDispatch } from '@/store'
import { useSelector } from "react-redux";
import { RootState } from '@/store';

interface AddTaskProps {
    categoryId: string;
    setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
    tasks: Task[];
    projectId: string;
}


const AddTaskTest: React.FC<AddTaskProps> = ({categoryId,setTasks,tasks,projectId}) => {
    //store data
    const dispatch:AppDispatch = useDispatch();

    const {currentUser,loadingUser} = useAuth();
    const taskTitle = '';
    const taskStatus = 'Unstarted';
    const taskAssign:string[] = [];
    const taskNotAssign = ['']
    const taskDescription = '';
    const taskDate = new Date().toISOString();//應該直接設置今天
    const taskOwner: string | null = currentUser?.email ?? null; 
    const calendarId = '';
    
    
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
                        categoryId: categoryId,
                        projectTitle:'',
                        projectId: projectId
                }
                dispatch(addTasksAsync({newDocRef, newTask}))
                console.log('addNewTask!!!!!!!!!!!!!!',newTask)
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

export default AddTaskTest;