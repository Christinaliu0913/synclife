"use client"
import ProjectListTest from './1_projectListTest';
import AddProjectTest from "./1_addProjectTest";
import { useAuth } from '../../auth/authContext';
import { useEffect } from "react";
import { useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { useDispatch } from 'react-redux';
import { fetchProjects } from '@/features/projectsSlice';
import { fetchCategories } from '@/features/categoriesSlice';





const ProjectMainTest = () => {
    const { currentUser} = useAuth();
    //Store data
    const dispatch:AppDispatch = useDispatch();
    const projects = useSelector((state:RootState) => state.projects.projects||[]);

    //先fetch這個人的資料
    useEffect(()=>{
        dispatch(fetchProjects(currentUser))
    },[currentUser,dispatch])
    
    useEffect(()=>{
        if(currentUser){
            dispatch(fetchCategories(currentUser))
        }
        
    },[currentUser,dispatch])

   
    return (
        <>

            
            {
                Array.isArray(projects) && projects.length > 0 ? (
                    projects?.map(project => (
                        <ProjectListTest
                            key={project.id}
                            project={project} //傳入project的資料
                        />
                        ))
                    ):
                    (
                        <div className='noproject-text'> 
                            Click the button to create your own project! 
                        </div>
                    )
            }
            <AddProjectTest />
            

        </>
    )


}

export default ProjectMainTest;