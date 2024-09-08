
import { useSelector, useDispatch } from 'react-redux';
import { updateTasksAsync, deleteTasksAsync, fetchTasks } from '@/features/tasksSlice';
import { RootState } from '@/store';
import { AppDispatch } from '@/store'
import { Task } from "@/types/types";
import TaskListProjectTest from './2_taskListProjectTest';
import TaskListDateTest from './2_taskListDateTest';
import TaskListTitleTest from './2_taskListTitleTest';
import { useEffect } from 'react';
import { di } from 'node_modules/@fullcalendar/core/internal-common';
import { useAuth } from '../../auth/authContext';
import { current } from '@reduxjs/toolkit';
import { Root } from 'postcss';



const TaskListTest = () => {
    //Store data
    const dispatch:AppDispatch = useDispatch();
    const { currentUser } = useAuth();
    

   
    useEffect(()=>{
        if(currentUser){
            dispatch(fetchTasks(currentUser));
        }

    },[currentUser, dispatch])

    const allTasks = useSelector((state:RootState) => state.tasks.allTasks);
    const tasks = useSelector((state: RootState) => state.tasks.tasks || []);
    const loading = useSelector((state: RootState) => state.tasks.loading);
   
    console.log('有跑這裡嗎？！！！！！！',tasks)
    
    const handleUpdateTask = (taskRefString:string, updatedData:Partial<Task>, taskId:string) => {
        dispatch(updateTasksAsync({taskRefString, updatedData, taskId}));
    } 

    const handleDeleteTasks = (taskRefString:string, taskId:string) => {
        dispatch(deleteTasksAsync({taskRefString, taskId}));
    }

    if(loading){
        return <div> Loading tasks...</div>
    }
    return(
        
        <div>
        {tasks?.map(task =>(
            
            <div className='list-task' key={task.id}>
                <TaskListTitleTest
                    key={`title-${task.id}`}
                    task={task}
                    onUpdate = {handleUpdateTask}
                />
                

                <TaskListProjectTest
                    key={`project-${task.id}`}
                    task={task}
                />
                
                <TaskListDateTest
                    key={`date-${task.id}`}
                    task={task}
                    onUpdate = {handleUpdateTask}
                    onDelete = {handleDeleteTasks}
                
                />
                
            </div>
            
            

        ))}
        </div>
    );
}
export default TaskListTest;