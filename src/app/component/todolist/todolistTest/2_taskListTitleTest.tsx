import { collection, doc, getDoc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from '../../../../../firebase'
import { useAuth } from "../../auth/authContext"; 
import { Task } from "@/types/types";


interface TaskListTitleProps{
    task: Task;
    onUpdate: (taskRef: string, updatedData: Partial<Task>,taskId: string) => void;
}

const TaskListTitleTest:React.FC<TaskListTitleProps> = ({task,onUpdate}) => {
    const {currentUser} = useAuth();
    const [title, setTitle] = useState(task.taskTitle);
    const [projectId, setProjectId] =useState(task.projectId)
    const [isChecked, setIsChecked] = useState(task.taskStatus === 'Done');



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

    const handleCheckboxChange = () => {
        const newStatus = isChecked? "Unstarted": "Done";
        setIsChecked(!isChecked);
        handleBlur({taskStatus:newStatus})
    }

    return (
        <><div className="tasklist-title-container">
                <div className="tasklist-check-container">
                    <input 
                        className="tasklist-check"
                        id={task.id}
                        type="checkbox"
                        checked={isChecked}
                        onChange={handleCheckboxChange}
                    />
                    <label htmlFor={task.id}></label>
                </div>
                
                <input 
                    className="tasklist-title"
                    type="text" 
                    placeholder='To do ....'
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)}
                    onBlur={()=>{handleBlur({taskTitle: title})}}
                />
            </div>
        </>
    )
}

export default TaskListTitleTest;