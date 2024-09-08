import { useEffect, useState } from "react";
import { query, collection, getDocs, getDoc,doc ,updateDoc} from "firebase/firestore"
import { db } from "../../../../../firebase";
import Image from "next/image";
import { Task } from "@/types/types";
import { useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { useDispatch } from 'react-redux';
import { addTasksAsync, setTaskUpdate, updateTasksAsync } from "@/features/tasksSlice";

interface AssignMemberProps{
    taskId: string;
    projectId: string|null;
    categoryId: string|null;
    members: string[]|[];
    updatedMembers: (assignedMembers: string[], notAssignedMembers: string[]) => void;
}

const AssignMember:React.FC<AssignMemberProps> = ({taskId,projectId,categoryId,members,updatedMembers}) => {
    //Store data
    const dispatch:AppDispatch = useDispatch();
    const allTasks = useSelector((state:RootState) => state.tasks.allTasks);

    const [optionVisible, setOptionVisible] = useState(false);
    const [assignedMembers, setAssignedMembers] = useState<string[]>([]);
    const [notAssignedMembers, setNotAssignedMembers] = useState<string[]>([]);
    

    
    useEffect( ()=> {
        const fetchMember = async () => {
            try{
                //fetch task document並且獲取assigned members
                const AssignedMemberQuery = doc(db,`project/${projectId}/category/${categoryId}/task/${taskId}`);
                const queryTaskSnapshot = await getDoc(AssignedMemberQuery);
                const taskData = queryTaskSnapshot.data();
                if(taskData){
                    const assignedMembers = taskData.taskAssign || [];
                    setAssignedMembers(assignedMembers);
                    setNotAssignedMembers(members.filter(member => !assignedMembers.includes(member)))
                }


            }catch(error){

            }
        }
        fetchMember();
    },[taskId, projectId, categoryId, members,updatedMembers])


    //新增member至assign member
    const handleAssignMember = async(e:React.ChangeEvent<HTMLSelectElement>) => {
        const addMember =  e.target.value;
        if(addMember && !assignedMembers.includes(addMember)){
            const taskRefString = `project/${projectId}/category/${categoryId}/task`
            const updatedData = {taskAssign:[...assignedMembers, addMember]}
            dispatch(setTaskUpdate({taskRefString,taskId}))
            dispatch(updateTasksAsync({taskRefString,updatedData,taskId}))
            setAssignedMembers(prevtasks =>[...prevtasks,addMember])
            setNotAssignedMembers(prevtasks => prevtasks.filter(member => member !== addMember))
            setOptionVisible(false);  
            console.log('new members', allTasks) 
        }
    }

    const handleDeleteMember = async(memberToRemove:string) => {
        const taskDef = doc(db, `project/${projectId}/category/${categoryId}/task/${taskId}`);
 
            const updateMembers = assignedMembers.filter(member => member !== memberToRemove);
            const taskRefString = `project/${projectId}/category/${categoryId}/task`
            const updatedData = {taskAssign: updateMembers}
            dispatch(updateTasksAsync({taskRefString,updatedData,taskId}))
    
            setAssignedMembers(updateMembers)
            setNotAssignedMembers(prevtasks => [...prevtasks, memberToRemove]) 
            setOptionVisible(false);  
    }

    return (
        <>
            {/* 若有assignedMember就render到畫面上 */}
            
            {/* 新增member */}
            <div className="taskBlock-Assign" onClick={()=> setOptionVisible(true)}>
                <div className="taskBlock-AssignList">
                <div className="taskBlock-AssignList-Img"><Image className='task-memberImg' src="/images/projectMember.svg" alt="project status" width={20} height={20}/></div>
                    {assignedMembers ? (
                            assignedMembers.map((member, index) => (
                                <div className="taskBlock-AssignMember"
                                key={index}
                                >
                                    <span >
                                        {member}
                                    </span>
                                    <button onClick={() => handleDeleteMember(member)}>x</button>
                                </div>
                                

                            ))
                        ) : (
                            
                            <div className="taskBlock-AssignMember" >
                                None
                            </div>
                        )}
                </div>
            </div>
            {optionVisible? (
                <>
                    <select 
                        className="taskBlock-select"
                        onChange={handleAssignMember}
                    >
                        <option value="">Select a member</option>
                        {notAssignedMembers?.map((member,index)=>(
                            <option key={index} value={member}>{member}</option>
                        ))}
                    
                    </select>
                    <div className="taskBlock-overlay" onClick={()=> setOptionVisible(false)}></div>
                </>
                
            ):
            <></>

            }
            

        </>
    )

}

export default AssignMember;