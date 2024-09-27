"use client"
import {useEffect, useState} from 'react';
import { collection, query, where, getDocs, doc,updateDoc, deleteDoc,getDoc } from 'firebase/firestore';
import AddCategory from "./2_addCategory";
import { db } from '../../../../firebase';
import CategoryContent from './2_categoryContent'
import MemberList from './member/member_List'
import Image from 'next/image';
import { Category, Project } from '@/types/types';
import 'flatpickr/dist/themes/material_green.css'

import { useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { useDispatch } from 'react-redux';
import CategoryContentTest from './2_categoryContent';
import { deleteCategories, fetchCategories, updateCategories } from '@/features/categoriesSlice';
import AddCategoryTest from './2_addCategory';
import { deleteProjects, updateProjects } from '@/features/projectsSlice';
import { updateTasksAsync } from '@/features/tasksSlice';
import { useAuth } from '../auth/authContext';

interface ProjectListProps {
    project: Project;
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

const ProjectList: React.FC<ProjectListProps>  = ({project}) => {
    //----------------store data目前使用者的project---------------------
    const dispatch:AppDispatch = useDispatch();
    // task
    const categories = useSelector((state:RootState) => state.categories.categories);
    const loading = useSelector((state:RootState) => state.categories.loading);
 
    const { currentUser } = useAuth();
    //Store data
    
    

    //category 資料
    const [projectCategories, setProjectCategories] = useState<Category[]>([])

    //set project資料 
    const projectId = project.id
    const [title, setTitle] = useState(project.projectTitle);
    const [status, setStatus] = useState(project.projectStatus);
    const [statusColor, setStatusColor] = useState(getStatusColor(project.projectStatus));
    //set members資料
    const members= Array.isArray(project.projectMember) ? project.projectMember : [project.projectMember]; 
    const [assignedMembers, setAssignedMembers] = useState<string[]>([]);
    const [notAssignedMembers, setNotAssignedMembers] = useState<string[]>([]);
    //set date資料
    const [startDate, setStartDate] = useState(typeof project.projectDateStart === 'string' ? project.projectDateStart.slice(0, 10) : '');
    const [endDate, setEndDate] = useState(typeof project.projectDateEnd === 'string' ? project.projectDateEnd.slice(0, 10) : '');
    
   
    //members 資料
    const [showMemberInput, setShowMemberInput] = useState(false)
    const [newMember, setNewMember] = useState('');

    //Visible
    const [isDeleteVisible, setIsDeleteVisible] = useState(false);
    const [isContentVisible,setIsContentVisible] = useState<boolean>(false);

   
    //fetch category
    useEffect(() => {
        const filteredCategories = categories.filter(category =>
            category.projectId === projectId 
        )
        setProjectCategories(filteredCategories)
        
    },[categories,loading,projectId,dispatch])

    //----------------------- member 處理----------------------------

    //新增會員權限
    const handleAddMember = async() => {
        if(newMember && !members.includes(newMember) ){
                const projectDef = doc (db, 'project',projectId);
                const updatedMembers = [...members, newMember];
                const updatedData = {projectMember: updatedMembers}
                dispatch(updateProjects({projectDef,updatedData,projectId}))
                setNewMember('');
                setShowMemberInput(false);
        }
    }

    //刪除會員並且把所有有包含這個Member的task中的assign member給移除
    const handleDeleteMember = async(memberToRemove:string) => {
        try{
            const updatedMembers = members.filter(member => member !== memberToRemove)
            const projectDef = doc (db, 'project',projectId);
            const updatedData = {projectMember: updatedMembers}
            dispatch(updateProjects({projectDef,updatedData,projectId}))
            
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
                const taskId = task.id
                if(taskData && taskData.taskAssign.includes(memberToRemove)){

                    const updatedTaskAssign = taskData.taskAssign.filter((member:string)=> member !== memberToRemove);
                    const taskRefString = `project/${project.id}/category/${task.categoryId}/task`;
                    const updatedData = {taskAssign: updatedTaskAssign};

                    dispatch(updateTasksAsync({taskRefString,updatedData,taskId}))
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
    

    //--------------------------編輯project內容---------------------------
     //刪除project
     const onDeleteProject = async() => {
        const projectDef = doc(db, 'project', projectId);
        dispatch(deleteProjects({projectDef, projectId}))
       
    };
    //更新project的內容
    const handleUpdateProject = async(updatedData:Partial<Project>) => {
        const projectDef = doc(db, 'project', projectId);
        dispatch(updateProjects({projectDef, updatedData, projectId}))
    };
    
    //轉換狀態顏色
    const handleStatusColor = (e:React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setStatus(value)
        setStatusColor(getStatusColor(value))
    }
    //-------------------------切換狀態-------------------------------

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
                        <input 
                            className='project-title' 
                            placeholder='Title' 
                            value={title} 
                            onChange={(e)=>setTitle(e.target.value)} 
                            onBlur = {(e) => handleUpdateProject({projectTitle: e.target.value})}
                        ></input>
                        
                        
                        
                        {/* Status */}

                        <div className='project-status'>
                            <label className="project-status-color" htmlFor="status"  style={{backgroundColor:statusColor}}></label>
                            <select id="status" 
                                value={status} 
                                onChange={handleStatusColor} 
                                onBlur = {(e) => handleUpdateProject({projectStatus: e.target.value})}
                                >
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
                                onBlur = {(e) => handleUpdateProject({projectDateStart: e.target.value})}
                            />
                            ~
                            <input 
                                type="date" 
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                onBlur = {(e) => handleUpdateProject({projectDateEnd: e.target.value})}
                            />
                        </div>
                        
                        <div className='project-delete' onClick={() => setIsDeleteVisible(prev => !prev)}>⋮ 
                            {isDeleteVisible?
                            <>
                                <div className='project-delete-block' onClick={onDeleteProject}>
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
                            />
                        </div>
                        <div className='project-content-taskblock'>
                            {projectCategories.map(category => (
                                    <CategoryContent
                                    key={category.id}
                                    category={category}
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