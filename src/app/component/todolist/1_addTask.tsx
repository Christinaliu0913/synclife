import { useState } from "react"
import { db } from '../../../../firebase'
import { collection, doc, getDocs, query, setDoc, where } from "firebase/firestore";
import { User } from "firebase/auth";
import { useDispatch } from 'react-redux';
import { addTasksAsync } from '@/features/tasksSlice';
import { AppDispatch } from '@/store'
import { useSelector } from "react-redux";
import { RootState } from '@/store';
import { Task } from "@/types/types";
import { addProjects } from "@/features/projectsSlice";
import { addCategories, updateCategories } from "@/features/categoriesSlice";


interface TaskProps{
    currentUser: User|null;
    loadingUser: boolean;
}


const AddTask:React.FC<TaskProps> = ({currentUser,loadingUser}) => {

    const dispatch:AppDispatch = useDispatch();
    const selectedProject = useSelector((state: RootState) => state.tasks.selectedProject);

    const [title,setTitle] = useState('')
    const taskStatus = 'Unstarted';
    const taskAssign:string[] = [];
    const taskNotAssign = ['']
    const taskDescription = '';
    //const taskDate = new Date().toISOString().slice(0,10);//應該直接設置今天
    const taskDate = new Date().toISOString().slice(0,10)
    const taskOwner: string | null = currentUser?.email ?? null; 
    const calendarId = '';
    const projectId = selectedProject? selectedProject:'';
   
    
    //project setting 
    const projectTitle = '';
    

    const handleAddTask = async() => {
        if(!loadingUser){
            if(currentUser){
                //如果project==noproject的話
                if(selectedProject === ""){
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
                            categoryId:'',
                            projectId,
                            projectTitle
                    };

                    dispatch(addTasksAsync({newDocRef, newTask}));
                    setTitle('');
                    
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
                        
                            const currentCatId = currentUserCat[0].id;
                            const newDocRef = doc(collection(db, `project/${selectedProject}/category/${currentCatId}/task`));
                            const newTask:Task = {
                                id: newDocRef.id,
                                    taskTitle:title,
                                    taskStatus,
                                    taskAssign:[`${currentUser.email}`],
                                    taskNotAssign,
                                    taskDate,
                                    taskDescription,
                                    taskOwner,
                                    calendarId,
                                    createdAt: new Date().toISOString(),
                                    categoryId:currentCatId,
                                    projectId,
                                    projectTitle
                            }
                            dispatch(addTasksAsync({newDocRef, newTask}));
                            setTitle('');

                
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
                            const currentCatId = newCategory.id;
                            const newDocRef = doc(collection(db, `project/${selectedProject}/category/${currentCatId}/task`));
                            const newTask:Task = {
                                id: newDocRef.id,
                                    taskTitle:title,
                                    taskStatus,
                                    taskAssign:[`${currentUser.email}`],
                                    taskNotAssign,
                                    taskDate,
                                    taskDescription,
                                    taskOwner,
                                    calendarId,
                                    createdAt: new Date().toISOString(),
                                    categoryId:currentCatId,
                                    projectId,
                                    projectTitle
                            }
                            dispatch(addTasksAsync({newDocRef, newTask}));
                            dispatch(addCategories({newDocRefCat,newCategory}));
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