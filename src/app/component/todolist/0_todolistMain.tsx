import { useState } from "react";
import TodoList from "./0_todolist";
import "../../pages/test/test.scss"
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
    projectTitle: string;
    createdAt: string;  
}

interface TodoListProps{
    setIsTodlistShow: Dispatch<SetStateAction<boolean>>;
    isTodolistShow: boolean;
    tasks: Task[]|[];
    setTasks: Dispatch<SetStateAction<Task[]|[]>>;
}


const TodoListToggle:React.FC<TodoListProps> = ({tasks,setTasks,setIsTodlistShow,isTodolistShow}) => {
    

    return(
       <div  className={isTodolistShow? 'todolist-toggle': 'todolist-toggle-hidden'}>
            <TodoList 
                setIsTodlistShow={setIsTodlistShow}
                tasks = {tasks}
                setTasks = {setTasks}
            />
             <div className='tasklist-overlay'
                    onClick={()=>{setIsTodlistShow(pre => !pre)}}
                 >
            
        </div>
       </div>
        
    )

}

export default TodoListToggle;