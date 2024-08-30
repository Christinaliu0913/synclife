import { useEffect, useState } from "react";
import { query, collection, getDocs, getDoc,doc ,updateDoc} from "firebase/firestore"
import { db } from "../../../../../firebase";
import Image from "next/image";

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

interface AssignMemberProps{
    taskId: string|null;
    projectId: string|null;
    categoryId: string|null;
    members: string[]|[];
    updatedMembers: (assignedMembers: string[], notAssignedMembers: string[]) => void;
}

const AssignMember:React.FC<AssignMemberProps> = ({taskId,projectId,categoryId,members,updatedMembers}) => {
    const [optionVisible, setOptionVisible] = useState(false);
    const [assignedMembers, setAssignedMembers] = useState<string[]>([]);
    const [notAssignedMembers, setNotAssignedMembers] = useState<string[]>([]);
    console.log('ckckckc',members)

    
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
            const taskRef = doc(db, `project/${projectId}/category/${categoryId}/task/${taskId}`);
            try{
                await updateDoc(taskRef, {
                    taskAssign:[...assignedMembers, addMember]
                } );
                setAssignedMembers(prevtasks =>[...prevtasks,addMember])
                setNotAssignedMembers(prevtasks => prevtasks.filter(member => member !== addMember))
            }catch(error){
                console.error("新增assign member時出錯",error);
            }
            setOptionVisible(false);   
        }
    }

    const handleDeleteMember = async(memberToRemove:string) => {
        const taskDef = doc(db, `project/${projectId}/category/${categoryId}/task/${taskId}`);
        try{
            const updateMembers = assignedMembers.filter(member => member !== memberToRemove);
            await updateDoc(taskDef, {
                taskAssign: updateMembers
            } );
            setAssignedMembers(updateMembers)
            setNotAssignedMembers(prevtasks => [...prevtasks, memberToRemove]) 
        }catch(error){
            console.error("新增assign member時出錯",error);
        }
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
                <select onChange={handleAssignMember}>
                    <option value="">Select a member</option>
                    {notAssignedMembers?.map((member,index)=>(
                        <option key={index} value={member}>{member}</option>
                    ))}
                
                </select>
            ):
            <></>

            }
            

        </>
    )

}

export default AssignMember;