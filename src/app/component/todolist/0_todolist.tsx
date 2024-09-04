import { useState, useEffect, Dispatch, SetStateAction } from 'react';
import { useAuth } from '../auth/authContext';
import { collection, deleteDoc, doc, getDocs, query,updateDoc,where } from 'firebase/firestore';
import AddTask from './1_addTask';
import TaskList from './1_taskList';
import { db } from '../../../../firebase';
import Image from 'next/image';
import TaskProjectFilter from './1_projectFilter';

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

interface TodoListProps{
    tasks: Task[]|[];
    setTasks: Dispatch<SetStateAction<Task[]|[]>>;
    setIsTodlistShow: Dispatch<SetStateAction<boolean>>;
}

const TodoList:React.FC<TodoListProps> = ({tasks,setTasks,setIsTodlistShow}) => {
    const {currentUser, loadingUser} = useAuth();
    const [projects, setProjects] = useState<Project[]>([]);
    //用來保存所有被filter前的所有tasks
    const [allTasks, setAllTasks] = useState<Task[]|[]>([])
    //若有filter project的狀態時，直接設置其project
    const [selectedProject, setSelectedProject] = useState('');
    useEffect(() => {
        const fetchTask = async() => {
            if(!loadingUser && currentUser){
                try{
                    console.log('這裡有東西嗎？')
                    //沒有在project裡的task
                    const q = query(collection(db, `noProject/${currentUser.uid}/task`))
                    const noProjetTaskSnapshot = await getDocs(q);
                    const noProjectTask = noProjetTaskSnapshot.docs.map(doc =>({
                        taskId: doc.id,
                        ...(doc.data() as Task)
                    }));

                    if(noProjectTask.length > 0){
                        setTasks(pre => pre? [...pre, ...noProjectTask]: noProjectTask)
                        setAllTasks(pre => pre? [...pre, ...noProjectTask]: noProjectTask)
                    }
                    //在project且被assigned的task
                    const withProjectQuery = query(collection(db,'project'), where('projectMember','array-contains',currentUser.email))
                    const currentUserProjectSnapshot = await getDocs(withProjectQuery);
                    const currentUserProject = currentUserProjectSnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    } as Project));
                    setProjects(currentUserProject)

                    for(const proj of currentUserProject){
                        
                        const categoryQuery = query(collection(db,`project/${proj.id}/category`));
                        const categorySnapshot = await getDocs(categoryQuery);
                        for(const cat of categorySnapshot.docs){
                            const taskQuery = query(collection(db,`project/${proj.id}/category/${cat.id}/task`),
                                where('taskAssign', 'array-contains', currentUser.email)
                            );
                            const taskSnapshot = await getDocs(taskQuery);
                            if(!taskSnapshot.empty){
                                const taskData = taskSnapshot.docs.map(doc => ({
                                    ...(doc.data() as Task),
                                    id: doc.id,
                                    // id: doc.id,
                                    // ...(doc.data() as Task)
                                }))
                                const taskDataWithProTitle = taskData.map(task => ({...task,
                                    projectTitle: proj.projectTitle}))
                                if(taskDataWithProTitle){
                                    console.log('projectproject', proj.projectTitle)
                                    setTasks(pre => pre?[...pre, ...taskDataWithProTitle]:taskDataWithProTitle)
                                    setAllTasks(pre => pre?[...pre, ...taskDataWithProTitle]:taskDataWithProTitle)
                                }
                            }
                            
                        }
                    }
                    


                }catch(error){

                }
            }
        }
        fetchTask();
    },[loadingUser,currentUser])
    console.log('這邊這邊',tasks)
    //標題等更新
    const handleUpdateTask = async(taskRefString:string, updatedData:Partial<Task>,taskId: string) =>{
        try{
            const taskRef = doc(db, `${taskRefString}`, taskId)
            await updateDoc(taskRef, updatedData);
            setTasks(prevTasks => (prevTasks ?? []).map(task => 
                task.id === taskId ? { ...task, ... updatedData} : task
            ))
            setAllTasks(prevTasks => (prevTasks ?? []).map(task => 
                task.id === taskId ? { ...task, ... updatedData} : task
            ))
        }catch(error){
            console.log('更新標題的時候出錯TODOLIST',error)
        }
    } 

    const handleDeleteTask = async(taskRefString:string, taskId: string) => {
        try{
            const taskRef = doc(db, taskRefString);
            await deleteDoc(taskRef);
            setTasks(prevTasks => (prevTasks?? []).filter(task => 
                task.id !== taskId))
            setAllTasks(prevTasks => (prevTasks?? []).filter(task => 
                task.id !== taskId))
            console.log('已刪除task')
        }catch(error){
            console.log('刪除task時錯誤',error)
        }

    }
    console.log('ck task', tasks)
    console.log('ck all tasks',allTasks)
    return (
        <>
        <div className='list'>
            <h1>To Do List</h1>
                <div >
                <Image 
                        onClick={()=>{setIsTodlistShow(pre => !pre)}}
                        className='task-toggleImg' 
                        src="/images/toggle.svg" alt="task toggle" width={20} height={20}/>
                </div>
                <hr style={{marginRight:"10px"}} />
                <TaskProjectFilter
                    projects={projects}
                    setTasks={setTasks}
                    allTasks={allTasks}
                    setSelectedProject={setSelectedProject}
                    selectedProject={selectedProject}
                />
                
                {/* task List*/}
                <div >
                    <TaskList
                        tasks = {tasks}
                        setTasks = {setTasks}
                        projects = {projects}
                        onUpdate = {handleUpdateTask}
                        onDelete = {handleDeleteTask}
                        setAllTasks={setAllTasks}
                        />
                </div>
                <hr style={{marginRight:"10px"}} />
                {/* 新增task */}
                
                    <AddTask
                        currentUser = {currentUser}
                        loadingUser = {loadingUser}
                        setTasks = {setTasks}
                        selectedProject = {selectedProject}
                        setAllTasks={setAllTasks}
                />
                
         </div>
        
            
        
        </>
    )

}

export default TodoList 