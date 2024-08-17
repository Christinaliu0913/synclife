import { useState } from 'react'

const TaskBlock = ({key,task,OnDelete,OnUpdate}) => {
    const [title, setTitle] = useState(task.taskTitle);
    const [status, setStatus] = useState(task.taskStatus);
    const [assign, setAssign] = useState(task.taskAssign);
    const [date, setDate] = useState(task.taskDate?.slice(0,10));
    const [description,setDescription]= useState(task.taskDescription)


    //----編輯Task的內容----
    const handleTitleBlur = () =>{
        OnUpdate(task.id, {taskTitle: title})
    }

    const handleStatus = () =>{
        OnUpdate(task.id, {taskTitle: status})
    }

    const handleDate = () =>{
        OnUpdate(task.id, {taskTitle: date})
    }
    const handleDescription = () =>{
        OnUpdate(task.id, {taskTitle: description})
    }

    return(
        <div className="task">

            <div>
                <input type="text" placeholder="title" value={title} onChange={(e)=>setTitle(e.target.value)} onBlur={handleTitleBlur}/>
            </div>
            

            <label htmlFor="status">Status</label>
            <select name="" id="" value={status} onChange={(e) => setStatus(e.target.value)} onBlur={handleStatus}>
                <option value="Unstarted">Unstarted</option>
                <option value="Processing">Processing</option>
                <option value="Done">Done</option>
            </select>


            <div>
                <label htmlFor="taskDate" >Date</label>
                <input 
                    type="date" 
                    value={date}
                    onChange = {(e) => setDate(e.target.value)}
                    onBlur = {handleDate}
                
                />
            </div>
            
            
            {/* asign這邊應該要在加入一個組件 */}
            <div>
                <label htmlFor="assign">Assign</label>
                <button>add</button>
            </div>

            
            <div>
                <label htmlFor="description">Note</label>
                <input 
                    type="text" 
                    placeholder="Note" 
                    value={description}
                    onChange = {(e) => setDescription(e.target.value)}
                    onBlur = {handleDescription}
                />
            </div>
            <button onClick={()=>OnDelete(task.id)}>delete</button>
        </div>
    )
}

export default TaskBlock;