import TodoList from "./0_todolist";
import "@/app/pages/test/test.scss"
import { Dispatch, SetStateAction } from 'react';




interface TodoListProps{
    setIsTodolistShow: Dispatch<SetStateAction<boolean>>;
    isTodolistShow: boolean;
}


const TodoListToggle:React.FC<TodoListProps> = ({setIsTodolistShow,isTodolistShow}) => {
    

    return(
       <div  className={isTodolistShow? 'todolist-toggle': 'todolist-toggle-hidden'}>

            <TodoList
                setIsTodolistShow={setIsTodolistShow}
            />

             <div className='tasklist-overlay'
                    onClick={()=>{setIsTodolistShow(pre => !pre)}}
                 >
            
            </div>
       </div>
        
    )

}

export default TodoListToggle;