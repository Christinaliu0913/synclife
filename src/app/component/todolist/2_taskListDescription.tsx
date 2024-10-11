import { Task } from "@/types/types";
import { collection, getDocs, query, updateDoc, where } from "firebase/firestore";
import { useRef, useState } from "react";
import { db } from '../../../../firebase'
import { useAuth } from "../auth/authContext"; 
import Image from "next/image";

interface TaskListDescriptionProps{
    task: Task;
    onUpdate: (taskRef: string, updatedData: Partial<Task>,taskId: string) => void;
    onDelete: (taskRefString: string, taskId: string) => void;
}


const TaskListDescription:React.FC<TaskListDescriptionProps> = ({task,onUpdate}) => {
    const {currentUser} = useAuth();
    const [description, setDescription] = useState(task.taskDescription);
    const [projectId, setProjectId] =useState(task.projectId)
    const [isChecked, setIsChecked] = useState(task.taskStatus === 'Done');

    //輸入時的的狀態
    const [isFocus, setIsFocus] = useState(false)
    const textAreaRef = useRef<HTMLTextAreaElement | null>(null);

    const handleBlur = async(updateData: Partial<Task>) => {
        if(!currentUser){
            return;
        }
        try{
            //如果有帶project的話
            if(projectId){
                const categoryQuery = query(collection(db,`project/${projectId}/category`));
                const categorySnapshot = await getDocs(categoryQuery);
                console.log('Task found, upd123ing:', updateData,'PJ',projectId);
                for (const categoryDoc of categorySnapshot.docs){
                    const taskQuery = query(collection(db, `project/${projectId}/category/${categoryDoc.id}/task`),
                    where('id','==', task.id)
                );
                    const taskSnapshot =await getDocs(taskQuery);
                if(!taskSnapshot.empty){
                    const taskRefString =`project/${projectId}/category/${categoryDoc.id}/task`
                    onUpdate(taskRefString,updateData,task.id);
                }
                }
           }else{
                const taskRefString = `noProject/${currentUser.uid}/task`;
                console.log('Updating task with no project:', taskRefString, updateData);
                onUpdate(taskRefString, updateData, task.id);
           }
        }catch(error){
            console.log('更新task title時出錯',error)
        }
       
    }
    //設置Note輸入時的大小
    const adjustNoteHeight = () => {
        if(textAreaRef.current){
            textAreaRef.current.style.height ='auto';
            textAreaRef.current.style.height = textAreaRef.current.scrollHeight + 'px';
        }
    }
    const adjustNoteHeightClose = () =>{
        if(textAreaRef.current){
            textAreaRef.current.style.height = '100px';
        }
    }

    return (
        <><div className="tasklis-description-container">
                <div className="tasklist-description-Img">
                    <Image src='/images/description.svg' alt="descripton" width={10} height={10} style={{marginRight:'3px'}} ></Image>
                </div>
                
                <textarea 
                    ref={textAreaRef}
                    className={`tasklist-description ${isFocus? 'expand': 'collapsed'}`}
                    placeholder='Note....'
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)}
                    onBlur={(e)=>{
                        handleBlur({taskDescription: description})
                        setIsFocus(false);
                        adjustNoteHeightClose();
                    }}
                    onFocus={()=>{
                        setIsFocus(true)
                        adjustNoteHeight();
                    }}
                />
            </div>
        </>
    )
}

export default TaskListDescription;