import { useEffect, useRef, useState } from 'react'
import AssignMember from './member/taskAssign_Member';
import Image from 'next/image';

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

const getStatusColor = (status: string): string => {
    switch(status){
        case "Unstarted":
            return "#5b95ad" ;
        case "Processing":
            return "#C07767";
        case "Done":
            return "#5B5B5B"
        default:
            return 'none';
    }
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
    const [description,setDescription]= useState(task.taskDescription);

    //status color
    const [taskStatusColor, setTaskStatusColor] = useState(getStatusColor(task.taskStatus))
    //Note 
    const textAreaRef = useRef<HTMLTextAreaElement |null>(null);
    const [isFocus, setIsFocus] = useState(false);
    //visible
    const [isTaskDeleteVisible, setIsTaskDeleteVisible] = useState(false)
    //調整textarea高度
    useEffect(()=>{
        adjustNoteHeight();
    },[description])

    //-------------編輯Task的內容----------
    const handleTitleBlur = () =>{
        OnUpdate(task.id, {taskTitle: title})
    }

    const handleStatus = () =>{
        OnUpdate(task.id, {taskStatus: status})
    }

    //轉換狀態顏色
    const handleTaskStatusColor = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setStatus(value)
        setTaskStatusColor(getStatusColor(value))

    }

    const handleDate = () =>{
        OnUpdate(task.id, {taskDate: date})
    }

    const handleDescription = () =>{
        OnUpdate(task.id, {taskDescription: description})
    }
    //調整Note的大小
    const adjustNoteHeight = () => {
        if(textAreaRef.current){
            textAreaRef.current.style.height = 'auto';
            textAreaRef.current.style.height = textAreaRef.current.scrollHeight +'px';
        }
        
    }
    const adjustNoteHeightClose = () => {
        if(textAreaRef.current){
            textAreaRef.current.style.height = '30px';
        }
        
    }

    return(
        <div className="taskBlock">

            <div className='taskTitle'>
                <input type="text" placeholder="Title" value={title} onChange={(e)=>setTitle(e.target.value)} onBlur={handleTitleBlur}/>
                <button onClick={()=>{setIsTaskDeleteVisible(prev=> !prev)}}>
                    ⋮
                    {isTaskDeleteVisible?
                    (<>
                        <div className="category-delete-block" onClick={()=>OnDelete(task.id)}>
                            <Image  src="/images/delete.svg" alt="project delete" width={20} height={20}/>
                        </div>
                        <div className="categoryt-overlay"></div>
                    </>):
                    <></>
                    }
                </button>
            </div>
            
            <div className='taskStatus'>
                <label className='taskStatus-color' htmlFor="status" style={{backgroundColor:taskStatusColor}}></label>
                <select className="taskStatus-select" name="" id="" value={status} onChange={handleTaskStatusColor} onBlur={handleStatus}>
                    <option value="Unstarted">  Unstarted</option>
                    <option value="Processing">  Processing</option>
                    <option value="Done">  Done</option>
            </select>

            </div>
            

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
                <textarea 
                    ref={textAreaRef}
                    className={`taskNote ${isFocus ? 'expand' : 'collapsed'}`}
                    placeholder="Note" 
                    value={description}
                    style={{fontSize:'12px'}}
                    onChange = {(e) => {
                        setDescription(e.target.value);
                        adjustNoteHeight();
                     }}
                    onBlur = {(e)=>{
                        setIsFocus(false);
                        OnUpdate(task.id, {taskDescription: e.target.value});
                        adjustNoteHeightClose();
                    }}
                    onFocus={()=>{
                        adjustNoteHeight();
                        setIsFocus(true)
                    }}
                />
            </div>
            {/* <button className='taskDelete' onClick={()=>OnDelete(task.id)}>Delete</button> */}
        </div>
    )
}

export default TaskBlock;