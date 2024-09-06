import Image from "next/image"
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { AppDispatch } from '@/store'
import { setFilteredProject } from "@/features/tasksSlice"




const TaskProjectFilterTest = () =>{
    const dispatch:AppDispatch = useDispatch();
    
    const projects = useSelector((state: RootState) => state.tasks.projects);
    const selectedProject = useSelector((state: RootState) => state.tasks.selectedProject);

    const handleSelectProjectFilter = (e:React.ChangeEvent<HTMLSelectElement>) => {
        const selectedProjectId = e.target.value;
        dispatch(setFilteredProject(selectedProjectId));
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

export default TaskProjectFilterTest;