import {  Dispatch, SetStateAction } from 'react';
import { useAuth } from '../../auth/authContext'; 

import AddTaskTest from './1_addTaskTest';
import TaskListTest from './1_taskListTest';

import Image from 'next/image';

import TaskProjectFilterTest from './1_projectFilterTest';

interface TodoListProps{
    setIsTodlistShow: Dispatch<SetStateAction<boolean>>;
}

const TodoListTest:React.FC<TodoListProps> = ({setIsTodlistShow}) => {
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
                <TaskProjectFilterTest/>
                
                {/* task List*/}
                <div >
                    <TaskListTest/>
                </div>
                <hr style={{marginRight:"10px"}} />
                {/* 新增task */}
                    <AddTaskTest
                        currentUser = {currentUser}
                        loadingUser = {loadingUser}
                    />
                
         </div>
        
            
        
        </>
    )

}

export default TodoListTest;