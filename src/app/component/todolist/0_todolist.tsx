import {  Dispatch, SetStateAction } from 'react';
import { useAuth } from '../auth/authContext'; 

import AddTask from './1_addTask';
import TaskList from './1_taskList';

import Image from 'next/image';

import TaskProjectFilter from './1_projectFilter';

interface TodoListProps{
    setIsTodlistShow: Dispatch<SetStateAction<boolean>>;
}

const TodoList:React.FC<TodoListProps> = ({setIsTodlistShow}) => {
   //user
    const {currentUser, loadingUser} = useAuth();

    return (
        <>
        <div className='list'>
            <h1>To Do List</h1>
                <div >
                <Image 
                        onClick={()=>{setIsTodlistShow(pre => !pre)}}
                        className='task-toggleImg' 
                        src="/images/toggle.svg" alt="task toggle" width={20} height={20}/>
                </div>
                <hr style={{marginRight:"10px"}} />
                <TaskProjectFilter/>
                
                {/* task List*/}
                <div >
                    <TaskList/>
                </div>
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