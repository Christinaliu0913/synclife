import { useEffect, useState } from "react"
import { User } from "firebase/auth";
import { collection, deleteDoc, doc, getDocs, query, setDoc, where } from "firebase/firestore";
import { db } from '../../../../../firebase'
import { useAuth } from "../../auth/authContext";
import Image from "next/image";
import { RootState } from '@/store';
import { AppDispatch } from '@/store'
import { useSelector, useDispatch } from 'react-redux';
import { Task, Project } from '@/types/types';
import { moveTaskToNewProject, removeTaskFromProject, updateTaskProject } from "@/features/tasksSlice";

interface TaskListProjectProps{
    task: Task;
}


const TaskListProjectTest:React.FC<TaskListProjectProps> = ({task}) => {

    //Store Date
    const dispatch:AppDispatch = useDispatch();
    const projects = useSelector((state: RootState) => state.tasks.projects);

    //task的project setting 
    const [taskProject, setTaskProject] = useState('');
    const [newProjectId, setNewProjectId] = useState('');
    const [newProjectTitle, setNewProjectTitle] = useState('');
    const [optionProject, setOptionProject] = useState('');
    const {currentUser} = useAuth();


    useEffect(()=> {
        if(task.projectId){
            setTaskProject(task.projectId)
            setOptionProject(task.projectId)
        }

    },[task])

    //當選擇不同的project的時候
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        if (newProjectId !== taskProject) {
            handleSelectProject();
        }
    }, [newProjectId]);
   

    //當有換project的時候
    const handleSelectProjectChange = (e:any) => {
        const selectValue = e.target.value;
        if(selectValue ==='0'){
            setOptionProject('');
            setNewProjectId('0');
            setNewProjectTitle('')
        }
        else{
            setOptionProject(selectValue);
            setNewProjectId(selectValue);
            const selectProject = projects.find(project =>project.id === optionProject)
            setNewProjectTitle(selectProject? selectProject.projectTitle:'')
        }
        
    }

     //編輯更新project的部分 
     const handleSelectProject = async() => {
        if(!currentUser) return;
        
        try{
            //狀態1 - 本身有project
            if(taskProject){
                //  狀態1.1 將此task的project移除並且把task放入沒有NoProject的資料庫
                if(newProjectId === '0'){
                    dispatch(removeTaskFromProject({task, currentUser}))
                }
                // 狀態1.2有選擇新的newProject
                else if(taskProject !== newProjectId){
                   dispatch(moveTaskToNewProject({task, newProjectId, newProjectTitle, currentUser}))
                }
                // 狀態1.3沒有變更project
                else{
                    return;
                }
            }
            else{//狀態2- 本身沒有帶project
                if(newProjectId){
                    dispatch(updateTaskProject({task,newProjectId, newProjectTitle, currentUser}))
                }
            }
        }catch(error){

        }
    }   
 
    return(
        <>
            <div className='tasklist-projectImg' >
            <Image  src="/images/Folder_light.svg" alt="task project" width={15} height={15}/>
            </div>
            
            <select 
            className="tasklist-projectSelect"
            value={optionProject}
            onChange={handleSelectProjectChange}
            >
            <option value="0"></option>
            {/* 選單內容 */}
            {projects?.map(project => (
                <option key={project.id} value={project.id} >
                    {project.projectTitle}
                </option>

            ))}
         </select>
        </>
        
    )
}

export default TaskListProjectTest;