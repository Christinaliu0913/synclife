import { Task } from "@/types/types";
import { useState } from "react";
import Image from "next/image";
import { useAuth } from "../auth/authContext";
import { collection, doc, getDoc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { db } from '../../../../firebase'

interface TaskListDeleteProps{
    task: Task;
    onUpdate: (taskRef: string, updatedData: Partial<Task>,taskId: string) => void;
    onDelete: (taskRefString: string, taskId: string) => void;
}


const TaskListDelete:React.FC<TaskListDeleteProps> = ({task,onUpdate,onDelete}) => {
    const {currentUser} = useAuth();
    const projectId = task.projectId
    const [isDeleteVisible, setDeleteVisible] = useState(false);
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
    return(

        <>
        <div
                className="tasklist-delete"
                onClick={()=> setDeleteVisible(pre=> !pre)}
                
            >⋮
            {isDeleteVisible?(
                <>
                    <div className="tasklist-delete-block" onClick={handleDeleteTask}>
                        <Image  src="/images/delete.svg" alt="project delete" width={20} height={20}/>
                    </div>
                    <div className="tasklist-overlay"></div>
                </>
                
            )
            :<></>}
            </div>
        </>
    )

}


export default TaskListDelete;