import { useState } from 'react'
import AssignMember from './member/taskAssign_Member';

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
    createdAt: string;  
}

interface TaskBlockProps {
    task: Task;
    OnDelete: (taskId: string) => void;
    OnUpdate: (taskId: string, updatedTask: Partial<Task>) => void;
    categoryId: string|null;
    members: string[]|[];
    updatedMembers: (assignedMembers: string[], notAssignedMembers: string[]) => void;
}


const TaskBlock:React.FC<TaskBlockProps> = ({task,OnDelete,OnUpdate,categoryId,members,updatedMembers}) => {
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
        OnUpdate(task.id, {taskStatus: status})
    }

    const handleDate = () =>{
        OnUpdate(task.id, {taskDate: date})
    }
    const handleDescription = () =>{
        OnUpdate(task.id, {taskDescription: description})
    }

    return(
        <div className="taskBlock">

            <div>
                <input type="text" placeholder="Title" value={title} onChange={(e)=>setTitle(e.target.value)} onBlur={handleTitleBlur}/>
            </div>
            

            <label htmlFor="status"></label>
            <select name="" id="" value={status} onChange={(e) => setStatus(e.target.value)} onBlur={handleStatus}>
                <option value="Unstarted">  Unstarted</option>
                <option value="Processing">  Processing</option>
                <option value="Done">  Done</option>
            </select>


            <div>
                <label htmlFor="taskDate" ></label>
                <input 
                    type="date" 
                    value={date}
                    onChange = {(e) => setDate(e.target.value)}
                    onBlur = {handleDate}
                
                />
            </div>
            
            
            {/* asign這邊應該要在加入一個組件 */}
            <AssignMember
                taskId = {task.id}
                projectId = {task.projectId}
                categoryId = {categoryId}
                members={members}
                updatedMembers={updatedMembers}
            />
            
            <div>
                <label htmlFor="description"></label>
                <input 
                    className='taskNote'
                    type="text" 
                    placeholder="Note" 
                    value={description}
                    onChange = {(e) => setDescription(e.target.value)}
                    onBlur = {handleDescription}
                />
            </div>
            <button className='taskDelete' onClick={()=>OnDelete(task.id)}>Delete</button>
        </div>
    )
}

export default TaskBlock;