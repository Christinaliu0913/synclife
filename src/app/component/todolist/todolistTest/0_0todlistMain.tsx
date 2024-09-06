import TodoListTest from "./0_1todlistTest";
import "@/app/pages/test/test.scss"
import { Dispatch, SetStateAction } from 'react';




interface TodoListProps{
    setIsTodlistShow: Dispatch<SetStateAction<boolean>>;
    isTodolistShow: boolean;
}


const TodoListToggleTest:React.FC<TodoListProps> = ({setIsTodlistShow,isTodolistShow}) => {
    

    return(
       <div  className={isTodolistShow? 'todolist-toggle': 'todolist-toggle-hidden'}>

            <TodoListTest
                setIsTodlistShow={setIsTodlistShow}
            />

             <div className='tasklist-overlay'
                    onClick={()=>{setIsTodlistShow(pre => !pre)}}
                 >
            
            </div>
       </div>
        
    )

}

export default TodoListToggleTest;