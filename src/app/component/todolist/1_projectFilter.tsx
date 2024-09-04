import Image from "next/image"

import {  useState } from "react";


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
    projectTitle: string;
    createdAt: string;  
}

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


interface TaskProjectFilterProps{
    setTasks: React.Dispatch<React.SetStateAction<Task[]>>;  
    projects: Project[];
    allTasks: Task[];
    setSelectedProject: React.Dispatch<React.SetStateAction<string>>;
    selectedProject: string;
}


const TaskProjectFilter:React.FC<TaskProjectFilterProps> = ({projects,setTasks,allTasks,setSelectedProject,selectedProject}) =>{


    const handleSelectProjectFilter = (e:React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setSelectedProject(value);
        if (value === ""){
            setTasks(allTasks)
        }else{
            setTasks(allTasks.filter(tasks => tasks.projectId === value))
        }
        ;

    }

    return (
        <>
            <div className="tasklist-filter" >
                <Image  src="/images/Folder_light.svg" alt="task project filter" width={15} height={15}/>
                
                
                    <select 
                        className="tasklist-projectSelect"
                        value={selectedProject}
                        onChange={handleSelectProjectFilter}
                        >
                            {/* 選擇不篩project */}
                            <option value="">All</option>

                            {/* 選單內容 */}
                            {projects?.map(project => (
                                <option key={project.id} value={project.id} >
                                    {project.projectTitle}
                                </option>

                            ))}
                    </select>
            </div>
    </>
    )
}

export default TaskProjectFilter;