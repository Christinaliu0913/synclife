import TaskBlock from "./3_taskBlock";
import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc,updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../../../firebase';
import AddTask from "./3_addTask";

interface Category {
    id: string;
    projectId: string;
    categoryTitle: string;
}

interface Task {
    id: string;
    taskTitle: string;
    taskStatus: string;
    taskAssign: string;
    taskDate: string;
    taskDescription: string;
    taskOwnner: string | null;
    projectId: string;
    createdAt: string;  
}

interface CategoryContentProps {
    key: string;
    category: Category;
    OnDelete: () => void;
    OnUpdate: (categoryId: string, updatedData: Partial<Category>) => void;
}

const CategoryContent:React.FC<CategoryContentProps> = ({key,category,OnDelete,OnUpdate}) => {
    const [title, setTitle] = useState(category.categoryTitle)
    //task
    const [tasks, setTasks] = useState<Task[]>([]);
    const projectId = category.projectId;
    console.log('checkthis!!!',projectId) 
    console.log('task',tasks)   
    
    //fetch task
    useEffect(()=>{
        const fetchTasks = async () => {
            try{
                const q = query(collection(db, `project/${projectId}/category/${category.id}/task`));
                const querySnapshot = await getDocs(q);
                const fetchedTasks: Task[] = querySnapshot.docs.map(doc =>({
                    ...doc.data() as Task,
                    id: doc.id
                }));
                if(fetchedTasks){
                    setTasks(fetchedTasks);
                }else{
                    console.log('這個category沒有task');
                }

            }catch(error){
                console.log('獲取task時出錯',error)
            }
        }
        fetchTasks();
    },[projectId, category.id])

    //-----編輯Category----
    const handleTitleBlur = () =>{
        OnUpdate(category.id, {categoryTitle: title})
    }
    //-----Task---------
    //刪除Task
    const handleDeleteTask = async(taskId:string) =>{
        try{
            const taskDef = doc(db, `project/${projectId}/category/${category.id}/task/${taskId}`)
            await deleteDoc(taskDef);
            setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
        }catch(error){
            console.log('刪除Task時出錯',error)
        }
    }

    const handleUpdateTask = async(taskId:string, updatedData: any) => {
        try{
            const taskDef = doc(db, `project/${projectId}/category/${category.id}/task/${taskId}`);
            await updateDoc(taskDef, updatedData);
            console.log('更新task',updatedData);
            setTasks(prevTasks => prevTasks.map(task=> 
                task.id === taskId? {...task, ...updatedData} : task
            ))
        }catch(error){
            console.log('updateTask mistake',error)
        }
    }


    return (
        <div className="project-content-category">
            <div> <input placeholder="title" value={title} type="text" onChange={(e)=>setTitle(e.target.value)} onBlur={handleTitleBlur}/></div>
            <AddTask
                categoryId={category.id}
                setTasks={setTasks}
                tasks={tasks}
                projectId={category.projectId}
            />
            <button onClick={OnDelete}>delete</button>
            {tasks?.map(task => (
                <TaskBlock
                    key={task.id}
                    task={task}
                    OnDelete={handleDeleteTask}
                    OnUpdate={handleUpdateTask}
                />
            ))}

        </div>
    )



}

export default CategoryContent;
