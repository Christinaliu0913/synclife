import { useEffect, useState } from "react"
import { User } from "firebase/auth";
import { collection, deleteDoc, doc, getDocs, query, setDoc, where } from "firebase/firestore";
import { db } from "../../../../firebase";
import AddTask from "./1_addTask";
import { useAuth } from "../auth/authContext";
import Image from "next/image";

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

interface TaskListProjectProps{
    task: Task;
    projects: any[];
}
const TaskListProject:React.FC<TaskListProjectProps> = ({ task, projects}) => {
    const [taskProject, setTaskProject] = useState('');
    const [newProject, setNewProject] = useState('');
    const [newProjectTitle, setNewProjectTitle] = useState('');
    const [optionProject, setOptionProject] = useState('');
    const {currentUser, loadingUser} = useAuth();

    useEffect(()=> {
        if(task.projectId){
            setTaskProject(task.projectId)
            setOptionProject(task.projectId)
        }
        //console.log('alskdfja;sldkjfa;',taskProject)

    },[task])

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        if (newProject !== taskProject) {
            handleSelectProject();
        }
    }, [newProject]);
   

    const handleSelectProjectChange = (e:any) => {
        const selectValue = e.target.value;
        if(selectValue ==='0'){
            setOptionProject('');
            setNewProject('0');
            setNewProjectTitle('')
        }
        else{
            setOptionProject(selectValue);
            setNewProject(selectValue);
            const selectProject = projects.find(project =>project.id === optionProject)
            setNewProjectTitle(selectProject? selectProject.projectTitle:'')
        }
        
    }

     //編輯project的部分
     const handleSelectProject = async() => {
        if(!currentUser){
            return;
        }
        try{
            console.log('chhihihiasdf')
            //狀態1 - 本身有project
            if(taskProject){
                //  狀態1.1 將此task的project移除並且把task放入沒有NoProject的資料庫
                console.log('123123123123')
                if(newProject === '0'){
                    await removeTaskFromProject(taskProject, currentUser);
                }
                // 狀態1.2有選擇新的newProject
                else if(taskProject !== newProject){
                    await moveTaskToNewProject(taskProject, newProject, newProjectTitle,currentUser);
                }
                // 狀態1.3沒有變更project
                else{
                    return;
                }
            }
            else{//狀態2- 本身沒有帶project
                console.log('1111111')
                if(newProject){
                    await UpdateTaskProject(newProject, newProjectTitle, currentUser);
                }
            }
        }catch(error){

        }
    }   
    //狀態1.1將此task的project移除並且把task放入沒有NoProject的資料庫
    const removeTaskFromProject = async(taskProject:string, currentUser: User) => {
        try{
            const oldProjectQuery = query(collection(db, `project/${taskProject}/category`));
            const oldProjectSnapshot = await getDocs(oldProjectQuery);
            
            for(const categoryDoc of oldProjectSnapshot.docs){
                const taskQuery = query(
                    collection(db,`project/${taskProject}/category/${categoryDoc.id}/task`),
                    where('id','==',task.id)
                );
                const taskSnapshot = await getDocs(taskQuery);
                //有找到此task就先儲存其資料再刪除
                if(!taskSnapshot.empty){
                    const taskDoc = taskSnapshot.docs[0];
                    const taskData = taskDoc.data() as Task;

                    const ck =await deleteDoc(taskDoc.ref);
                    console.log('確認這個有沒有刪除',ck)
                    await AddTaskToNoProjectList(taskData,currentUser)
                }
            }
        }catch(error){
            console.log('狀態1.1移除task的project時出錯',error)
        }
    }
    //狀態1.1-a
    const AddTaskToNoProjectList = async(taskData:Task, currentUser: User) => {
        try{
            const noProject = doc(collection(db, `noProject/${currentUser?.uid}/task`));
            console.log('狀態1.1-a已將任務移除project')
            const newTask: Task = {
                id: noProject.id,
                taskTitle:taskData.taskTitle,
                taskStatus:taskData.taskStatus,
                taskAssign: taskData.taskAssign,
                taskNotAssign: taskData.taskNotAssign,
                taskDate:taskData.taskDate,
                taskDescription: taskData.taskDescription,
                taskOwner: taskData.taskOwner,
                calendarId:taskData.calendarId,
                createdAt: taskData.createdAt,
                projectId: '',
                projectTitle:''
            }
            await setDoc(noProject, newTask);
            
        }catch(error){
            console.log('狀態1.1-a將task加入noProject時出錯',error);
        }
    } 



    //狀態1.2有選擇新的newProject 
    const moveTaskToNewProject = async(taskProject:string, newProject: string,newProjectTitle: string, currentUser: User) => {
        try{
            const oldProjectQuery = query(collection(db, `project/${taskProject}/category`));
            const oldProjectSnapshot = await getDocs(oldProjectQuery);
            
            for(const categoryDoc of oldProjectSnapshot.docs){
                const taskQuery = query(
                    collection(db,`project/${taskProject}/category/${categoryDoc.id}/task`),
                    where('id','==',task.id)
                );
                const taskSnapshot = await getDocs(taskQuery);
                //有找到此task就先儲存其資料再刪除
                if(!taskSnapshot.empty){
                    const taskDoc = taskSnapshot.docs[0];
                    const taskData = taskDoc.data() as Task;

                    await deleteDoc(taskDoc.ref);
                    
                    //在新project中確認有沒有unclassified
                    const q = query(collection(db, `project/${newProject}/category`), where('categoryTitle','==','unclassified'));
                    const querySnapshot = await getDocs(q);
                    const currentUserCat = querySnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));

                    //如果有一個叫做未分類的cat的話，就直接在這個cat新增task 
                    if(currentUserCat.length > 0){
                    
                        const currentCatId = currentUserCat[0].id;
                        const newDocRefTask = doc(collection(db, `project/${newProject}/category/${currentCatId}/task`));
                        const newTask: Task = {
                            id: newDocRefTask.id,
                            taskTitle:taskData.taskTitle||'',
                            taskStatus:taskData.taskStatus,
                            taskAssign: taskData.taskAssign,
                            taskNotAssign: taskData.taskNotAssign,
                            taskDate:taskData.taskDate,
                            taskDescription: taskData.taskDescription,
                            taskOwner: taskData.taskOwner,
                            calendarId:taskData.calendarId,
                            createdAt: taskData.createdAt,
                            projectId: newProject,
                            projectTitle: newProjectTitle
                        }
                        console.log('更改task',taskData)
                        //在選擇project中新增一個剛剛刪除的task
                        await setDoc(newDocRefTask, newTask)
                        currentUserCat.forEach(cat=>{
                            console.log('project ID check', cat.id);
                        })
                    }else{
                        //如果沒有找到未分類的cat就直接創一個
                        try{
                            const newDocRefCat = doc(collection(db, `project/${newProject}/category`));
                            const newCategory = {
                                    id: newDocRefCat.id,
                                    uid:currentUser?.uid,
                                    categoryTitle:'unclassified',
                                    createAt: new Date().toISOString(),
                                    projectId: newProject
                            }
                            await setDoc(newDocRefCat, newCategory);
                            const currentCatId = newCategory.id;
                            const newDocRefTask = doc(collection(db, `project/${newProject}/category/${currentCatId}/task`));
                            const newTask: Task = {
                                id: newDocRefTask.id,
                                taskTitle:taskData.taskTitle||'',
                                taskStatus:taskData.taskStatus,
                                taskAssign: taskData.taskAssign,
                                taskNotAssign: taskData.taskNotAssign,
                                taskDate:taskData.taskDate,
                                taskDescription: taskData.taskDescription,
                                taskOwner: taskData.taskOwner,
                                calendarId:taskData.calendarId,
                                createdAt: taskData.createdAt,
                                projectId: newProject||'',
                                projectTitle: newProjectTitle||''
                            }
                            await setDoc(newDocRefTask, newTask)
    
                        }catch(error){
                            console.log('1.2 新增task的project時候出錯',error);
                        }
                    }

                }
            }
        }catch(error){
            console.log('狀態1.2將task加入Project時出錯',error);
        }
    }
    //狀態2 本身沒有帶project
    const UpdateTaskProject = async(newProject: string, newProjectTitle: string,currentUser: User) => {
        try{
            //先移除noProject的task，並把其的資料先暫存
            const q = query(collection(db, `noProject/${currentUser?.uid}/task`),where('id','==', task.id));
            const querySnapshot = await getDocs(q);
            console.log('狀態2ck UserID',currentUser?.uid)
            //有找到此task就先儲存資料再刪除
            if(!querySnapshot.empty){
                const taskDoc = querySnapshot.docs[0];
                const taskData = taskDoc.data() as Task;
                
                await deleteDoc(taskDoc.ref);

                //找有沒有一個叫做unclassified的cate
                const categoryQuery = query(collection(db, `project/${newProject}/category`), where('categoryTitle','==','unclassified'));
                const categoryQuerySnapshot = await getDocs(categoryQuery);
                const currentUserCat = categoryQuerySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                
                if(currentUserCat.length > 0){
                    //如果有一個叫做未分類的cat的話，就直接在這個cat新增task
                    console.log('確認有加進去未分類');
                    const currentCatId = currentUserCat[0].id;
                    const newDocRefTask = doc(collection(db, `project/${newProject}/category/${currentCatId}/task`));
                    const newTask: Task = {
                        id: newDocRefTask.id,
                        taskTitle:taskData.taskTitle||'',
                        taskStatus:taskData.taskStatus,
                        taskAssign: [`${currentUser?.email}`],
                        taskNotAssign: taskData.taskNotAssign,
                        taskDate:taskData.taskDate,
                        taskDescription: taskData.taskDescription,
                        taskOwner: taskData.taskOwner,
                        calendarId:taskData.calendarId,
                        createdAt: taskData.createdAt,
                        projectId: newProject,
                        projectTitle: newProjectTitle
                    }
                    await setDoc(newDocRefTask, newTask)

                    currentUserCat.forEach(cat=>{
                        console.log('project ID check', cat.id);
                    })
                }else{
                    //如果沒有找到未分類的cat就直接創一個
                    try{
                        const newDocRefCat = doc(collection(db, `project/${newProject}/category`));
                        const newCategory = {
                                id: newDocRefCat.id,
                                uid:currentUser?.uid,
                                categoryTitle:'unclassified',
                                createAt: new Date().toISOString(),
                                projectId: newProject
                        }
                        await setDoc(newDocRefCat, newCategory);
                        const currentCatId = newCategory.id;
                        const newDocRefTask = doc(collection(db, `project/${newProject}/category/${currentCatId}/task`));
                        const newTask: Task = {
                            id: newDocRefTask.id,
                            taskTitle:taskData.taskTitle||'',
                            taskStatus:taskData.taskStatus,
                            taskAssign: [`${currentUser?.email}`],
                            taskNotAssign: taskData.taskNotAssign,
                            taskDate:taskData.taskDate,
                            taskDescription: taskData.taskDescription,
                            taskOwner: taskData.taskOwner,
                            calendarId:taskData.calendarId,
                            createdAt: taskData.createdAt,
                            projectId: newProject||'',
                            projectTitle: newProjectTitle||''
                        }
                        await setDoc(newDocRefTask, newTask)
            
                    }catch(error){
                        console.log('新增task的時候出錯',error);
                    }
            }
            }

            

        }catch(error){
            console.log('狀態2將task加入Project時出錯',error);
        }
    }
    return(
        <>
            <div>
            <Image className='tasklist-projectImg' src="/images/Folder_light.svg" alt="task project" width={20} height={20}/>
            </div>
            
            <select 
            className="tasklist-projectSelect"
            value={optionProject}
            onChange={handleSelectProjectChange}
            >
            <option value="0"></option>
            {/* 選單內容 */}
            {projects?.map(project => (
                <option key={project.id} value={project.id} >
                    {project.projectTitle}
                </option>

            ))}
        </select>
        </>
        
    )
}

export default TaskListProject;