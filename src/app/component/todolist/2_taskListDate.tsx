import { useState } from "react";
import { useAuth } from "../auth/authContext";
import { collection, doc, getDoc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { db } from '../../../../firebase'
import Image from "next/image";
import { Task } from '@/types/types'



interface TaskListDateProps{
    task: Task;
    onUpdate: (taskRef: string, updatedData: Partial<Task>,taskId: string) => void;
    onDelete: (taskRefString: string, taskId: string) => void;
}


const TaskListDate:React.FC<TaskListDateProps> = ({task,onUpdate,onDelete}) => {
    const {currentUser} = useAuth();
    const [date, setDate] = useState(task.taskDate.slice(0,10));
    const projectId = task.projectId
    const [isDeleteVisible, setDeleteVisible] = useState(false);

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

    const handleDeleteTask = async() => {
        if(!currentUser){
            return;
        }
        try{
            //如果有帶project的話
            
            if(projectId){
                const categoryQuery = query(collection(db,`project/${projectId}/category`));
                const categorySnapshot = await getDocs(categoryQuery);
                for (const categoryDoc of categorySnapshot.docs){
                    const taskQuery = query(collection(db, `project/${projectId}/category/${categoryDoc.id}/task`),
                    where('id','==', task.id)
                );
                    const taskSnapshot =await getDocs(taskQuery);
                if(!taskSnapshot.empty){
                    const taskRefString =`project/${projectId}/category/${categoryDoc.id}/task/${task.id}`
                    onDelete(taskRefString,task.id);
                }
                }

           }else{
                const taskRefString = `noProject/${currentUser.uid}/task/${task.id}`;
                onDelete(taskRefString,task.id);
           }
        }catch(error){
            console.log('更新task title時出錯',error)
        }
    }
    return (
        <>
            <div className="tasklist-date-container">
                <input 
                    className="tasklist-date"
                    type="date"  
                    value={date} 
                    onChange={(e) => setDate(e.target.value)}
                    onBlur={()=>handleBlur({taskDate: date})}
                />
            </div>
            
            
        </>
    )
}

export default TaskListDate;
