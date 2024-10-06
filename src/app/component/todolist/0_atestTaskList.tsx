
// import { useSelector, useDispatch } from 'react-redux';
// import { updateTasksAsync, deleteTasksAsync, fetchTasks } from '@/features/tasksSlice';
// import { RootState } from '@/store';
// import { AppDispatch } from '@/store'
// import { Task } from "@/types/types";
// import TaskListProject from './2_taskListProject';
// import TaskListDate from './2_taskListDate';
// import TaskListTitle from './2_taskListTitle';
// import { useEffect } from 'react';
// import { di } from 'node_modules/@fullcalendar/core/internal-common';
// import { useAuth } from '../auth/authContext';
// import { current } from '@reduxjs/toolkit';
// import { Root } from 'postcss';
// import { fetchProjects } from '@/features/projectsSlice';
// import { useDrop } from 'react-dnd';



// const TaskListTest = () => {
//     //Store data
//     const dispatch:AppDispatch = useDispatch();
//     const { currentUser } = useAuth();
    

   
//     useEffect(()=>{
//         if(currentUser){
//             dispatch(fetchProjects(currentUser)).then(()=>{
//                 dispatch(fetchTasks(currentUser));
//             })
//         }

//     },[currentUser, dispatch])

//     const allTasks = useSelector((state:RootState) => state.tasks.allTasks);
//     const tasks = useSelector((state: RootState) => state.tasks.tasks || []);
//     const loading = useSelector((state: RootState) => state.tasks.loading);
   
//     //drag and Drop
//     const [{isOver}, drop] = useDrop(() => ({
//         accept: 'tasks',
//         drop:(item) => changeTasksOrder(item.id),
//         collect: (monitor) => ({
//             isOver: !! monitor.isOver(),
//         })
//     }))
//     const changeTasksOrder =  (order) => {
//         const taskOrder 
//     }
//     //新增與刪除task
//     const handleUpdateTask = (taskRefString:string, updatedData:Partial<Task>, taskId:string) => {
//         dispatch(updateTasksAsync({taskRefString, updatedData, taskId}));
//     } 

//     const handleDeleteTasks = (taskRefString:string, taskId:string) => {
//         dispatch(deleteTasksAsync({taskRefString, taskId}));
//     }

//     if(loading){
//         return <div> <p>Loading tasks...</p><div className='loading-spinner'></div></div>
//     }
//     return(
        
//         <div>
//         {tasks?.map(task =>(
            
//             <div className='list-task' key={task.id}>
//                 <TaskListTitle
//                     key={`title-${task.id}`}
//                     task={task}
//                     onUpdate = {handleUpdateTask}
//                 />
                

//                 <TaskListProject
//                     key={`project-${task.id}`}
//                     task={task}
//                 />
                
//                 <TaskListDate
//                     key={`date-${task.id}`}
//                     task={task}
//                     onUpdate = {handleUpdateTask}
//                     onDelete = {handleDeleteTasks}
                
//                 />
                
//             </div>
            
            

//         ))}
//         </div>
//     );
// }
// export default TaskListTest;