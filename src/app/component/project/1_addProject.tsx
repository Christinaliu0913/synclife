import { Dispatch, SetStateAction } from 'react';
import { useState } from 'react'
import { auth, db } from '../../../../firebase';
import { collection, doc, setDoc} from 'firebase/firestore';
import { useAuth } from '../auth/authContext';
import Image from "next/image";


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

interface AddProjectProps {
setProjects: Dispatch<SetStateAction<Project[]>>;
projects: Project[];
}

const AddProject: React.FC<AddProjectProps> = ({setProjects,projects}) => {
    
    const {currentUser,loadingUser} = useAuth();
    const projectTitle = '';
    const projectStatus = 'unstarted';
    const projectMember: string[] = currentUser && currentUser.email ? [currentUser.email] : [];
    const projectDateStart = new Date().toISOString();//應該直接設置今天
    const projectDateEnd = '';
    const projectOwner: string | undefined = currentUser?.email ?? undefined;

    
    

    //新增一個project
    const handleAddProject = async() =>{
        if(!loadingUser){
            if(currentUser){
                const newDocRef = doc(collection(db, 'project'));
                const newProject = {
                    uid:
                        currentUser.uid,
                        projectTitle,
                        projectStatus,
                        projectMember,
                        projectDateStart,
                        projectDateEnd,
                        projectOwner,
                        createdAt: new Date().toISOString()
                }
                await setDoc(newDocRef, newProject)
                console.log('已新增一個Project了', newDocRef.id)

                setProjects([...projects, { id: newDocRef.id, ...newProject }]);
                
            }
            console.log('no currentUser')
        }
        return;
    }

    
    
    return(
        <> 
            <button className='project-addProject' onClick={handleAddProject}>
                <Image src="/images/add.png" alt="Add Task" width={20} height={20} />
                Add Project
            </button>

        </>
    )   


}

export default AddProject;