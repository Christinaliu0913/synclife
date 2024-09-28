import TodoList from "./0_todolist";
import "@/app/pages/test/test.scss"
import { Dispatch, SetStateAction } from 'react';




interface TodoListProps{
    setIsTodlistShow: Dispatch<SetStateAction<boolean>>;
    isTodolistShow: boolean;
}


const TodoListToggle:React.FC<TodoListProps> = ({setIsTodlistShow,isTodolistShow}) => {
    

    return(
       <div  className={isTodolistShow? 'todolist-toggle': 'todolist-toggle-hidden'}>

            <TodoList
                setIsTodlistShow={setIsTodlistShow}
            />

             <div className='tasklist-overlay'
                    onClick={()=>{setIsTodlistShow(pre => !pre)}}
                 >
            
            </div>
       </div>
        
    )

}

export default TodoListToggle;