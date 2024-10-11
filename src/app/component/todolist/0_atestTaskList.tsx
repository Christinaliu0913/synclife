
import { useSelector, useDispatch } from 'react-redux';
import { updateTasksAsync, deleteTasksAsync, fetchTasks, updateTaskOrderAsync } from '@/features/tasksSlice';
import { RootState } from '@/store';
import { AppDispatch } from '@/store'
import { Task } from "@/types/types";
import TaskListProject from './2_taskListProject';
import TaskListDate from './2_taskListDate';
import TaskListTitle from './2_taskListTitle';
import { useEffect, useState } from 'react';
import { di } from 'node_modules/@fullcalendar/core/internal-common';
import { useAuth } from '../auth/authContext';
import { current } from '@reduxjs/toolkit';
import { Root } from 'postcss';
import { fetchProjects } from '@/features/projectsSlice';
import { useDrop } from 'react-dnd';
import TaskCard from './0_atestTaskCard';
import { fetchCategories } from '@/features/categoriesSlice';
import Image from 'next/image';


const TaskListTest = () => {
    //Store data
    const dispatch:AppDispatch = useDispatch();
    const { currentUser } = useAuth();

    //監聽點擊task
    const [activeTaskId, setActiveTaskId] = useState<string|null>(null);
    //是否顯示description
    
    useEffect(()=>{
        if(currentUser){
            dispatch(fetchProjects(currentUser)).then(()=>{
                dispatch(fetchCategories(currentUser)).then(()=> {
                    dispatch(fetchTasks(currentUser));
                });
            })
        }

    },[currentUser, dispatch])

    const allTasks = useSelector((state:RootState) => state.tasks.allTasks);
    const tasks = useSelector((state: RootState) => state.tasks.tasks || []);
    const loading = useSelector((state: RootState) => state.tasks.loading);
    //確認有沒有被select
    const selectedProject = useSelector((state: RootState) => state.tasks.selectedProject);
    //處理拖拽的任務
    const moveTask = (fromIndex: number, toIndex:number) => {
        const updatedTasks = [...allTasks];
        const [movedTask] = updatedTasks.splice(fromIndex, 1);
        updatedTasks.splice(toIndex, 0, movedTask);//插入目標位置
        //重新設定每個任務的順序屬性->依照順序重新設定order
        const reorderedTasks = updatedTasks.map((task, index) => ({
            ...task,
            order: index+1
        }))
        console.log('movetask', reorderedTasks)
        dispatch(updateTaskOrderAsync({reorderedTasks, currentUser, selectedProject}));

    }


    //新增與刪除task
    const handleUpdateTask = (taskRefString:string, updatedData:Partial<Task>, taskId:string) => {
        dispatch(updateTasksAsync({taskRefString, updatedData, taskId}));
    } 

    const handleDeleteTasks = (taskRefString:string, taskId:string) => {
        dispatch(deleteTasksAsync({taskRefString, taskId}));
    }
    //展開任務處理
    const handleExpandTask = (taskId: string|null) => {
        setActiveTaskId((preTaskId) => (preTaskId === taskId ? null: taskId))
    }
    //處理loading
    if(loading){
        return <div> <p>Loading tasks...</p><div className='loading-spinner'></div></div>
    }
    return(
        
        <div className='list-task-container'>
           
        {tasks?.map((task,index) =>(
            <TaskCard
                key={task.id}
                index={index}
                task={task}
                moveTask={moveTask}
                onUpdate={handleUpdateTask}
                onDelete={handleDeleteTasks}
                activeTaskId={activeTaskId}
                onExpand={handleExpandTask}
            />
            
            
            

        ))}
        </div>
    );
}
export default TaskListTest;