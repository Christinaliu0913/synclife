import { useState } from "react"
import { db } from '../../../../firebase';
import { collection, doc, getDocs, query, setDoc, where } from "firebase/firestore";
import { User } from "firebase/auth";


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
    currentUser: User|null;
    loadingUser: boolean;
    setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
    selectedProject: string;
    setAllTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}


const AddTask:React.FC<TaskProps> = ({currentUser,loadingUser,setTasks,selectedProject,setAllTasks}) => {

    const [title,setTitle] = useState('')
    const taskStatus = 'unstarted';
    const taskAssign:string[] = [];
    const taskNotAssign = ['']
    const taskDescription = '';
    //const taskDate = new Date().toISOString().slice(0,10);//應該直接設置今天
    const taskDate = new Date().toISOString().slice(0,10)
    const taskOwner: string | null = currentUser?.email ?? null; 
    const calendarId = '';
    const projectId = selectedProject? selectedProject:'';
    const projectTitle = '';
    const handleAddTask = async() => {
        if(!loadingUser){
            if(currentUser){
                //如果project==noproject的話
                if(selectedProject===""){
                    try{
                        const newDocRef = doc(collection(db,`noProject/${currentUser.uid}/task`));
                    const newTask:Task = {
                        id: newDocRef.id,
                            taskTitle:title,
                            taskStatus,
                            taskAssign,
                            taskNotAssign,
                            taskDate,
                            taskDescription,
                            taskOwner,
                            calendarId,
                            createdAt: new Date().toISOString(),
                            projectId,
                            projectTitle
                    }
                    await setDoc(newDocRef, newTask)

                    setTasks((tasks)=> (tasks?[...tasks,newTask]:[newTask]));
                    setAllTasks((tasks)=> (tasks?[...tasks,newTask]:[newTask]));
                    setTitle('');
                    }catch(error){
                        console.log('移動到noproject時出錯')
                    }
                    
                }
                //如果project== projectId
                else{
                    //在新project中確認有沒有unclassified
                    const q = query(collection(db, `project/${selectedProject}/category`), where('categoryTitle','==','unclassified'));
                    const querySnapshot = await getDocs(q);
                    const currentUserCat = querySnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));

                    //如果有一個叫做未分類的cat的話，就直接在這個cat新增task 
                    if(currentUserCat.length > 0){
                        try{
                            const currentCatId = currentUserCat[0].id;
                            const newDocRefTask = doc(collection(db, `project/${selectedProject}/category/${currentCatId}/task`));
                            const newTask:Task = {
                                id: newDocRefTask.id,
                                    taskTitle:title,
                                    taskStatus,
                                    taskAssign:[`${currentUser.email}`],
                                    taskNotAssign,
                                    taskDate,
                                    taskDescription,
                                    taskOwner,
                                    calendarId,
                                    createdAt: new Date().toISOString(),
                                    projectId,
                                    projectTitle
                            }
                            await setDoc(newDocRefTask, newTask)
                            setTasks((tasks)=> (tasks?[...tasks,newTask]:[newTask]));
                            setAllTasks((tasks)=> (tasks?[...tasks,newTask]:[newTask]));
                            setTitle('');
                        }catch(error){
                            console.log("移動錯誤 already have unclassified in cat")
                        }
                        
                
                    }else{
                        //如果沒有找到未分類的cat就直接創一個
                        try{
                            const newDocRefCat = doc(collection(db, `project/${selectedProject}/category`));
                            const newCategory = {
                                    id: newDocRefCat.id,
                                    uid:currentUser?.uid,
                                    categoryTitle:'unclassified',
                                    createAt: new Date().toISOString(),
                                    projectId: selectedProject
                            }
                            await setDoc(newDocRefCat, newCategory);
                            const currentCatId = newCategory.id;
                            const newDocRefTask = doc(collection(db, `project/${selectedProject}/category/${currentCatId}/task`));
                            const newTask:Task = {
                                id: newDocRefTask.id,
                                    taskTitle:title,
                                    taskStatus,
                                    taskAssign:[`${currentUser.email}`],
                                    taskNotAssign,
                                    taskDate,
                                    taskDescription,
                                    taskOwner,
                                    calendarId,
                                    createdAt: new Date().toISOString(),
                                    projectId,
                                    projectTitle
                            }
                            await setDoc(newDocRefTask, newTask)
                            setTasks((tasks)=> (tasks?[...tasks,newTask]:[newTask]));
                            setAllTasks((tasks)=> (tasks?[...tasks,newTask]:[newTask]));
                            setTitle('');
                        }catch(error){
                            console
                        }
                    }
                
            }
        }
        
    }   }
    return (
        <>
            <input className="tasklist-addTask-input" type="text" placeholder='To do ....' value={title} onChange={(e)=> setTitle(e.target.value)}/>
            <button className="tasklist-addTask" onClick={handleAddTask} >Add Task</button>
        </>
    );

};

export default AddTask;