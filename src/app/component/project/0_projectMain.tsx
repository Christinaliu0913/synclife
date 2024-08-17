"use client"

import ProjectList from "@/app/component/project/1_projectList";
import AddProject from "./1_addProject";
import { useAuth } from '../auth/authContext';
import { useEffect, useState } from "react";
import { auth, db } from '../../../../firebase';
import { collection, query, where, getDocs, doc,updateDoc, deleteDoc } from 'firebase/firestore';

const ProjectMain = () => {
    const { currentUser,loadingUser } = useAuth();
    const [ projects, setProjects ] = useState<any[]| null>([]);

    //先fetch這個人的資料
    useEffect(()=>{
        const fetchProjects = async () => {
            console.log('loadingUser:', loadingUser);
            console.log('currentUser:', currentUser);
            if(!loadingUser && currentUser){
                try{
                    const q = query(collection(db, 'project'), where('projectMember','array-contains',currentUser.email));
                    const querySnapshot = await getDocs(q);
                    const currentUserProjects = querySnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));
                    if(currentUserProjects){
                        setProjects(currentUserProjects);
                        console.log('這個人的project有', currentUserProjects);
                        currentUserProjects.forEach(project=>{
                            console.log('project ID check', project.id);
                        })
                    }else{
                        console.log('這個人沒有project')
                    }
                }catch(error){
                    console.log('獲取項目出錯',error);
                }
            }
        }
        fetchProjects();
        

    },[currentUser,loadingUser])
    
    //刪除project
    const onDeleteProject = async(projectId:string) => {
        try{
            const projectDef = doc(db, 'project', projectId);
            await deleteDoc(projectDef);
            setProjects(prevProjects =>(prevProjects ?? []).filter(project=>project.id !==  projectId))
        }catch(error){
            console.log('刪除project內容時錯誤',error);
        }
    };
   
    //更新project的內容
    const handleUpdateProject = async(projectId:string, updatedData:any) => {
        try{
            const projectDef = doc(db, 'project', projectId);
            await updateDoc(projectDef, updatedData);
            // !!!!--------> 這邊要處理沒有preProjects的邏輯
            setProjects(prevProjects => (prevProjects ?? []).map(project => 
                project.id === projectId ? { ...project, ...updatedData } : project
            ));

        }catch(error){
            console.log('更新project內容的時候錯誤',error);
        }

    }

    //刪除project

    return (
        <>
        
            {projects?.map(project => (
                <ProjectList 
                    key={project.id}
                    project={project}//傳入project的資料
                    OnDelete={()=>onDeleteProject(project.id)}
                    OnUpdate={handleUpdateProject}
                />
            ))}
            
            <AddProject setProjects={setProjects} projects={projects} />
            

        </>
    )



}

export default ProjectMain;