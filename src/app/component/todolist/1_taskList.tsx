import { User } from 'firebase/auth';
import { collection, getDocs, query,where } from 'firebase/firestore';
import { useState, useEffect } from 'react';
import { db } from '../../../../firebase';
import TaskListProject from './2_taskListProject';
import TaskListTitle from './2_taskListTitle';
import TaskListDate from './2_taskListDate';
import { useAuth } from '../auth/authContext';

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

interface TaskProps{
    tasks: Task[];
    setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
    onUpdate: (taskRefString: string, updatedData: Partial<Task>,taskId: string) => void;
    projects: Project[];
    onDelete: (taskRefString: string, taskId: string) => void;
}

const TaskList:React.FC<TaskProps> = ({tasks,setTasks,onUpdate,projects,onDelete}) => {

    console.log('ck all tasks', tasks)
    return(
        
        <div>
        {tasks?.map(task =>(
            
            <div className='list-task' key={task.id}>
                <TaskListTitle
                    key={`title-${task.id}`}
                    task={task}
                    onUpdate = {onUpdate}
                />
                

                <TaskListProject
                    key={`project-${task.id}`}
                    task={task}
                    projects = {projects}
                    
                />
                
                <TaskListDate
                    key={`date-${task.id}`}
                    task={task}
                    onUpdate = {onUpdate}
                    onDelete = {onDelete}
                
                />
                
            </div>
            
            

        ))}
        </div>
    );
}
export default TaskList;