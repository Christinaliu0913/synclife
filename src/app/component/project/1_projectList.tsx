import {useEffect, useState} from 'react';
import { collection, query, where, getDocs, doc,updateDoc, deleteDoc,getDoc } from 'firebase/firestore';
import AddCategory from "./2_addCategory";
import { db } from '../../../../firebase';
import CategoryContent from './2_categoryContent'
import MemberList from './member/member_List'
import Image from 'next/image';

import 'flatpickr/dist/themes/material_green.css'

interface Project {
    id: string;
    uid: string;
    projectTitle: string;
    projectStatus: string;
    projectMember: string[];
    projectDateStart: string;
    projectDateEnd: string;
    projectOwner: string | undefined;
    createdAt: string;
}

interface ProjectListProps {
    project: Project;
    OnDelete: () => void;
    OnUpdate: (id: string, updatedData: Partial<Project>) => void;
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

const ProjectList: React.FC<ProjectListProps>  = ({project,OnDelete,OnUpdate}) => {
    //set project資料 
    const [title, setTitle] = useState(project.projectTitle);
    const [status, setStatus] = useState(project.projectStatus);
    const [statusColor, setStatusColor] = useState(getStatusColor(project.projectStatus));
    //set members資料
    const [members, setMembers] = useState(Array.isArray(project.projectMember) ? project.projectMember : [project.projectMember]); 
    const [assignedMembers, setAssignedMembers] = useState<string[]>([]);
    const [notAssignedMembers, setNotAssignedMembers] = useState<string[]>([]);
    //set date資料
    const [startDate, setStartDate] = useState(typeof project.projectDateStart === 'string' ? project.projectDateStart.slice(0, 10) : '');
    const [endDate, setEndDate] = useState(typeof project.projectDateEnd === 'string' ? project.projectDateEnd.slice(0, 10) : '');
    //category 資料
    const [categories, setCategories] = useState<any[]>([]); 
   
    //members 資料
    const [showMemberInput, setShowMemberInput] = useState(false)
    const [newMember, setNewMember] = useState('');

    //Visible
    const [isDeleteVisible, setIsDeleteVisible] = useState(false);


    
    //fetch category的資料
    useEffect(()=>{
        const fetchCategories = async () => {
            try{
                const q = query(collection(db,`project/${project.id}/category`));
                const querySnapshot = await getDocs(q);
                const fetchedCategories = querySnapshot.docs.map(doc =>({
                    id:doc.id,
                    ...doc.data()
                }));
                if(fetchedCategories){
                    setCategories(fetchedCategories);
                    console.log('fetchedCategories',fetchedCategories)
                }else{
                    console.log('這個project沒有categories');
                }
            }catch(error){
                console.log('獲取category出錯',error)
            }

        } 
        fetchCategories()
    },[project.id])
        //----------------------- member 處理----------------------------
    

    //新增會員權限
    const handleAddMember = async() => {
        if(newMember && !members.includes(newMember) ){
            try{
                const newMemberRef = doc (db, 'project',project.id);
                const updatedMembers = [...members, newMember];
                await updateDoc(newMemberRef, {
                    projectMember: updatedMembers
                });

                setMembers(updatedMembers);
                setNewMember('');
                setShowMemberInput(false);
            } catch(error){
                console.log('新增成員時出錯',error);
            }
           
            

        }
    }

    //刪除會員並且把所有有包含這個Member的task中的assign member給移除
    const handleDeleteMember = async(memberToRemove:string) => {
        try{
            const updatedMembers = members.filter(member => member !== memberToRemove)
            const newMemberRef = doc (db, 'project',project.id);
            await updateDoc(newMemberRef, {
                projectMember: updatedMembers
            });
            setMembers(updatedMembers);//更新local端

            //獲取這個project的所有task
            const categorySnapshot = await getDocs(collection(db, `project/${project.id}/category`));
            let tasks:any[] = [];
            for (const categoryDoc of categorySnapshot.docs){
                const categoryId = categoryDoc.id;
                const taskSnapshot = await getDocs(collection(db,`project/${project.id}/category/${categoryId}/task`));
                taskSnapshot.forEach(taskDoc => {
                    tasks.push({taskId:taskDoc.id, categoryId});
                })

            }

            //從每個任務的taskAssign 列表中移除該成員
            for(const task of tasks){
                const taskRef = doc(db,`project/${project.id}/category/${task.categoryId}/task/${task.taskId}`)
                const taskDoc = await getDoc(taskRef);
                const taskData = taskDoc.data();
                if(taskData && taskData.taskAssign.includes(memberToRemove)){
                    const updatedTaskAssign = taskData.taskAssign.filter((member:string)=> member !== memberToRemove);
                    await updateDoc(taskRef,{
                        taskAssign: updatedTaskAssign
                    });
                    console.log('成功刪除taskassign成員', updatedTaskAssign)
                    setAssignedMembers(updatedTaskAssign);
                    setNotAssignedMembers(updatedMembers.filter(member => !updatedTaskAssign.includes(member))) 
                    
                }

            }

        }catch(error){
            console.log('刪除成員時出錯',error);
        }
    }
    //更新任務成員狀態
    const handleMembersChange = (newAssignedMembers: string[], newNotAssignedMembers: string[]) => {
        setAssignedMembers(newAssignedMembers);
        setNotAssignedMembers(newNotAssignedMembers);
    }
    //-----Category-------
    //刪除Category
    const onDeleteCategory = async(categoryId:string) => {
        try{
            const categoryDef = doc(db, `project/${project.id}/category/${categoryId}`);
            await deleteDoc(categoryDef);
            setCategories(prevCategories => prevCategories.filter(category => category.id !== categoryId))
        }catch(error){
            console.log('刪除category時錯誤',error)
        }
    }

    //即時儲存更新category
    const handleUpdateCategory = async(categoryId:string, updatedData:any) =>{
        try{
            const categoryDef = doc(db, `project/${project.id}/category/${categoryId}`);
            await updateDoc(categoryDef, updatedData);
            setCategories(prevCategories => prevCategories.map(category =>
                category.id === categoryId ? { ...category, ...updatedData } : category
            ));
        }catch(error){
            console.log('更新category時錯誤',error);
        }

    }


    //--------------------------編輯project內容---------------------------
    //編輯標題
    const handleTitleBlur = () =>  {
        OnUpdate(project.id, {projectTitle: title})
        console.log('確認project ID',project.id)
    }
    //編輯狀態
    const handleStatus = () => {
        OnUpdate(project.id, {projectStatus: status})
    }
    //轉換狀態顏色
    const handleStatusColor = (e:React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setStatus(value)
        setStatusColor(getStatusColor(value))
    }
   
    //編輯開始日程
    const handleStartDate = () =>{
        OnUpdate(project.id, {projectDateStart: startDate})
    }
    //編輯結束日期
    const handleEndDate = () => {
        OnUpdate(project.id, {projectDateEnd: endDate})
    }
    //-------------------------切換狀態-------------------------------
    const [isContentVisible,setIsContentVisible] = useState<boolean>(false);
    const toggleContent = () => {
        setIsContentVisible(!isContentVisible);
    }
    return (
        <>
            <div className='project'>
                <div className='project-list'>
                    <div className='project-list-box'>

                        {/* Title */}
                        
                        <button className='project-toggleBut'
                            onClick={toggleContent}
                        >
                            <Image 
                                className={`project-toggleImg ${isContentVisible? 'rotate':''}`} 
                                src="/images/toggle.svg" alt="project toggle" width={20} height={20}/>
                        </button>
                        <input className='project-title' placeholder='Title' value={title} onChange={(e)=>setTitle(e.target.value)} onBlur={handleTitleBlur}></input>
                        
                        
                        
                        {/* Status */}

                        <div className='project-status'>
                            <label className="project-status-color" htmlFor="status"  style={{backgroundColor:statusColor}}></label>
                            <select id="status" value={status} onChange={handleStatusColor} onBlur={handleStatus}>
                                <option value="Unstarted">Unstarted</option>
                                <option value="Processing">Processing</option>
                                <option value="Done">Done</option>
                            </select>
                        </div>
                        


                        <div className='project-member'>
                            <Image className='project-memberImg' src="/images/projectMember.svg" alt="project status" width={20} height={20}/>
                            <div className='project-memberTitle'>member</div>
                            <div className='project-memberList'>
                                {Array.isArray(members) && members.map((member) => (
                                    <MemberList
                                        key={member} // 使用 member 作为 key 因为 member 是字符串
                                        member={member}
                                        OnDelete={() => handleDeleteMember(member)}
                                    />
                                ))}
                            </div>
                            
                            <button className='project-memberAdd' onClick={()=> setShowMemberInput(true)}>
                                <Image className='project-memberAdd' src="/images/add.svg" alt="project memberAdd" width={20} height={20}/>
                            </button>
                        </div>
                        {/* 加入新成員視窗 showMemberInput */}

                        {showMemberInput&&
                            (
                                <>
                                <div className='overlay' onClick={() => setShowMemberInput(false)}></div>
                                <div className='project-addMemberBar'>
                                    <div className='addMemberBar-box'>
                                        <div>Enter email to join your members</div>
                                        <div>
                                            <input type="text" placeholder='Member email' value={newMember} onChange={(e) => setNewMember(e.target.value)}/>
                                        </div>
                                            <button className='addMemberBar-add' onClick={handleAddMember}>Add</button>
                                            <button className='addMemberBar-close' onClick={() => setShowMemberInput(false)}>x</button>
                                    </div>

                                </div>
                                </>
                            )
                        }
                  
                        {/* Date */}
                        <div className='project-date'>
                            <input 
                                type = "date" 
                                value = {startDate}
                                onChange = {(e) => setStartDate(e.target.value)}
                                onBlur = {handleStartDate}
                            />
                            ~
                            <input 
                                type="date" 
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                onBlur = {handleEndDate}    
                            />
                        </div>
                        
                        <div className='project-delete' onClick={() => setIsDeleteVisible(prev => !prev)}>⋮ 
                            {isDeleteVisible?
                            <>
                                <div className='project-delete-block' onClick={OnDelete}>
                                <Image  src="/images/delete.svg" alt="project delete" width={20} height={20}/>
                                </div>
                                <div className="overlay"></div>
                            </>
                            :
                            <></>
                            }

                        </div>
                        
                        
                    </div>

                    

                </div>
                <div className={`project-content ${isContentVisible? 'visible': 'hidden'}`}>
                    <div className='project-content-box'>
                        <div className='project-content-addCat'>
                            <AddCategory
                                projectId={project.id}
                                setCategories={setCategories}
                                categories={categories}
                            />
                        </div>
                        <div className='project-content-taskblock'>
                            {categories?.map(category => (
                                        <CategoryContent 
                                        key={category.id}
                                        category={category}
                                        OnDelete={()=>onDeleteCategory(category.id)}
                                        OnUpdate={handleUpdateCategory}
                                        members={members}
                                        updatedMembers={handleMembersChange}
                                    />
                                    ))}
                        </div>
                                
                            
                         
                        
                    </div>
                    
              
                    
                    
                </div>
            </div>
           
            
           
        </>


    )




}

export default ProjectList;