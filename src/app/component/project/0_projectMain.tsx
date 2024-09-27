"use client"
import ProjectList from './1_projectList';
import AddProject from "./1_addProject";
import { useAuth } from '../auth/authContext';
import { useEffect } from "react";
import { useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { useDispatch } from 'react-redux';
import { fetchProjects } from '@/features/projectsSlice';
import { fetchCategories } from '@/features/categoriesSlice';





const ProjectMain = () => {
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
                        <ProjectList
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
            <AddProject />
            

        </>
    )


}

export default ProjectMain;