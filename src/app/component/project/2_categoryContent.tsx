import TaskBlock from "./3_taskBlock";
import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc,updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../../../firebase';
import Image from 'next/image';
import { Task, Category } from "@/types/types";
import { useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { useDispatch } from 'react-redux';
import { deleteTasksAsync, fetchProjectTasks, fetchTasks, updateTasksAsync } from "@/features/tasksSlice";
import AddTask from "./3_addTask";
import { deleteCategories, updateCategories } from "@/features/categoriesSlice";




interface CategoryContentProps {
    key: string;
    category: Category;
    members: string[]|[];
    updatedMembers: (assignedMembers: string[], notAssignedMembers: string[]) => void;
}

const CategoryContent:React.FC<CategoryContentProps> = ({category,members,updatedMembers}) => {
    //Store data
    const dispatch:AppDispatch = useDispatch();
    const allTasks = useSelector((state:RootState) => state.tasks.allTasks);
    // data of cate
    const projectId = category.projectId
    const categoryId = category.id
    const [title, setTitle] = useState(category.categoryTitle)
    //task
    const [tasks, setTasks] = useState<Task[]>([]);
    //Visibal
    const [isCatDeleteVisible, setIsCatDeleteVisible] = useState(false);
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
       
   
    }, [allTasks, projectId, categoryId,dispatch]);



    //-------------------------------Category------------------------------------------

    //編輯Category title
    const handleTitleBlur = () =>{
        const updatedData = {categoryTitle: title}
        const categoryDef = doc(db, `project/${projectId}/category/${categoryId}`);
        dispatch(updateCategories({categoryDef, updatedData, categoryId}))
    }
   
    //刪除Category
    const handleDeleteCategory = async() => {
        const categoryDef = doc(db, `project/${projectId}/category/${categoryId}`);     
        dispatch(deleteCategories({categoryDef, categoryId}));
    }

   

   


    return (
        <div className="project-content-category">
            <div className="categoryTitle">
                 <input 
                    className="categoryTitle-input"
                    placeholder="Title" 
                    value={title} 
                    type="text" 
                    onChange={(e)=>setTitle(e.target.value)} 
                    onBlur={handleTitleBlur}/>
                <button onClick={()=>{setIsCatDeleteVisible(prev=> !prev)}}>
                    ⋮
                    {isCatDeleteVisible?
                    (<>
                        <div className="category-delete-block" onClick={handleDeleteCategory}>
                            <Image  src="/images/delete.svg" alt="project delete" width={20} height={20}/>
                        </div>
                        <div className="categoryt-overlay"></div>
                    </>):
                    <></>
                    }
                </button>
            </div>

            <div className="category-addTask">
                <AddTask
                    categoryId={category.id}
                    setTasks={setTasks}
                    projectId={category.projectId}
                />
            </div>
            
            
            {tasks?.map(task => (
                <TaskBlock
                    key={task.id}
                    task={task}
                    members={members}
                    updatedMembers={updatedMembers}
                />
            ))}

        </div>
    )



}

export default CategoryContent;
