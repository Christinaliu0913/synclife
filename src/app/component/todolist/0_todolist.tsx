import {  Dispatch, SetStateAction } from 'react';
import { useAuth } from '../auth/authContext'; 

import AddTask from './1_addTask';
import TaskList from './1_taskList';

import Image from 'next/image';

import TaskProjectFilter from './1_projectFilter';

import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import dynamic from 'next/dynamic';
import TaskListTest from './0_atestTaskList';


interface TodoListProps{
    setIsTodolistShow: Dispatch<SetStateAction<boolean>>;
}
const DndProviderNoSSR = dynamic(() => import('react-dnd').then( mod => mod.DndProvider), {ssr: false}); 

const TodoList:React.FC<TodoListProps> = ({setIsTodolistShow}) => {
   //user
    const {currentUser, loadingUser} = useAuth();

    return (
        <>
        <div className='list'>
            <h1>To Do List</h1>
                <div >
                <Image 
                        onClick={()=>{setIsTodolistShow(pre => !pre)}}
                        className='task-toggleImg' 
                        src="/images/toggle.svg" alt="task toggle" width={20} height={20}/>
                </div>
                <hr style={{marginRight:"10px"}} />
                <TaskProjectFilter/>
                
                {/* task List*/}
                    <DndProviderNoSSR backend={HTML5Backend}>
                        <div >
                            <TaskListTest/>
                        </div>
                    </DndProviderNoSSR>
                
                <hr style={{marginRight:"10px"}} />
                {/* 新增task */}
                    <AddTask
                        currentUser = {currentUser}
                        loadingUser = {loadingUser}
                        
                    />
                
         </div>
        
            
        
        </>
    )

}

export default TodoList;