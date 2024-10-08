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
import { stat } from 'fs';





const ProjectMain = () => {
    const { currentUser} = useAuth();
    //Store data
    const dispatch:AppDispatch = useDispatch();
    const projects = useSelector((state:RootState) => state.projects.projects||[]);
    const projectLoading = useSelector((state:RootState) => state.projects.loading);

    //先fetch這個人的資料
    useEffect(()=>{
        dispatch(fetchProjects(currentUser)).then(()=>{
            dispatch(fetchCategories(currentUser));
        })
    },[currentUser,dispatch])
    

   
    return (
        <>
            { projectLoading ? 
                (
                    <div className='loading'> 
                            <p>Loading Projects...</p><div className = 'loading-spinner'></div>
                    </div>
                )
                :
                (
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
                    </>
                )
            }
            
            
            <AddProject />
            

        </>
    )


}

export default ProjectMain;