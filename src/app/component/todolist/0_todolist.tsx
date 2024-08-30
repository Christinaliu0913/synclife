import { useState, useEffect } from 'react';
import { useAuth } from '../auth/authContext';
import { collection, deleteDoc, doc, getDocs, query,updateDoc,where } from 'firebase/firestore';
import AddTask from './1_addTask';
import TaskList from './1_taskList';
import { db } from '../../../../firebase';


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

const TodoList = () => {
    const {currentUser, loadingUser} = useAuth();
    const [tasks, setTasks] = useState<Task[]>([])
    const [projects, setProjects] = useState<Project[]>([]);

    useEffect(() => {
        const fetchTask = async() => {
            if(!loadingUser && currentUser){
                try{
                    //沒有在project裡的task
                    const q = query(collection(db, `noProject/${currentUser.uid}/task`))
                    const noProjetTaskSnapshot = await getDocs(q);
                    const noProjectTask = noProjetTaskSnapshot.docs.map(doc =>({
                        taskId: doc.id,
                        ...(doc.data() as Task)
                    }));
                    if(noProjectTask){
                        setTasks(pre => pre? [...pre, ...noProjectTask]: noProjectTask)
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

    //標題等更新
    const handleUpdateTask = async(taskRefString:string, updatedData:Partial<Task>,taskId: string) =>{
        try{
            const taskRef = doc(db, `${taskRefString}`, taskId)
            await updateDoc(taskRef, updatedData);
            setTasks(prevTasks => (prevTasks ?? []).map(task => 
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
            console.log('已刪除task')
        }catch(error){
            console.log('刪除task時錯誤',error)
        }

    }
    return (
        <>
        <div className='list'>
            <h1>To Do List</h1>
            <hr />
                <div className="list-filter">
                    <select name="" id="">Project</select>
                    <select name="" id=""></select>
                </div>
                
                {/* task List*/}
                <div >
                    <TaskList
                        tasks = {tasks}
                        setTasks = {setTasks}
                        projects = {projects}
                        onUpdate = {handleUpdateTask}
                        onDelete = {handleDeleteTask}
                        />
                </div>
                    
                {/* 新增task */}
                <hr />
                    <AddTask
                    currentUser = {currentUser}
                    loadingUser = {loadingUser}
                    setTasks = {setTasks}
                />
         </div>
            
            
        
        </>
    )

}

export default TodoList 