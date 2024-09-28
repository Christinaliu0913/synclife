import { createAsyncThunk, createSlice, isFulfilled, PayloadAction } from "@reduxjs/toolkit";
import { db } from '../../firebase'
import { collection, getDocs, query, where, deleteDoc, doc, updateDoc, setDoc, DocumentReference, DocumentData, getDoc } from "firebase/firestore";
import { User } from "firebase/auth";
import { Task, Project } from "@/types/types";
import { tasks } from "googleapis/build/src/apis/tasks";
import { create } from "domain";
import { RootState } from "@/store";


//設定接口
interface TasksState{
    allTasks: Task[];
    tasks: Task[],
    projectTasks: Task[],
    projects: Project[];
    selectedProject: string;
    loading: boolean
}


const initialState: TasksState = {
    allTasks:[],
    tasks: [],
    projectTasks: [],
    projects: [],
    selectedProject: '',
    loading: false,
}


//-----------Projects---------------------------


//狀態1.1將此task的project移除並且把task放入沒有NoProject的資料庫
export const removeTaskFromProject = createAsyncThunk('project/removeTaskFromProject',
    async({task, currentUser}:{task: Task, currentUser: User}) =>{
        const oldProjectQuery = query(collection(db, `project/${task.projectId}/category`));
        const oldProjectSnapshot = await getDocs(oldProjectQuery);
        for(const categoryDoc of oldProjectSnapshot.docs){
            const taskQuery = query(
                collection(db,`project/${task.projectId}/category/${categoryDoc.id}/task`),
                where('id','==',task.id)
            );
            const taskSnapshot = await getDocs(taskQuery);
            //有找到此task就先儲存其資料再刪除
            if(!taskSnapshot.empty){
                const taskDoc = taskSnapshot.docs[0];
                const taskData = taskDoc.data() as Task;

                await deleteDoc(taskDoc.ref);
                

                //加到新項目
                const noProjectRef = doc(collection(db, `noProject/${currentUser.uid}/task`));
                await setDoc(noProjectRef, {
                    ...taskData,
                    id: noProjectRef.id,
                    categoryId:'',
                    projectId: '',
                    projectTitle: ''
                });
            }
        }
        
        return task.id;
    }
)
//狀態1.2有選擇新的newProject 
export const moveTaskToNewProject = createAsyncThunk('project/moveTaskToNewProject',
    async({task, newProjectId, newProjectTitle, currentUser}:{task:Task, newProjectId:string, newProjectTitle:string, currentUser: User} )=> {
        //刪除舊項目
        const oldProjectQuery = query(collection(db, `project/${task.projectId}/category`));
        const oldProjectSnapshot = await getDocs(oldProjectQuery);

        for(const categoryDoc of oldProjectSnapshot.docs){
            const taskQuery = query(
                collection(db,`project/${task.projectId}/category/${categoryDoc.id}/task`),
                where('id','==',task.id)
            );
            const taskSnapshot = await getDocs(taskQuery);
            //有找到此task就先儲存其資料再刪除
            if(!taskSnapshot.empty){
                try{
                    const taskDoc = taskSnapshot.docs[0];
                    const taskData = taskDoc.data() as Task;

                    await deleteDoc(taskDoc.ref);
                    const q = query(collection(db, `project/${newProjectId}/category`), where('categoryTitle','==','unclassified'));
                    const querySnapshot = await getDocs(q);
                    const currentUserCat = querySnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));
                    //如果有一個叫做未分類的cat的話，就直接在這個cat新增task 
                    if(currentUserCat.length > 0){
                        
                        const currentCatId = currentUserCat[0].id;
                        const newDocRefTask = doc(collection(db, `project/${newProjectId}/category/${currentCatId}/task`));
                        await setDoc(newDocRefTask, {
                            ...taskData,
                            id: newDocRefTask.id,
                            categoryId:currentCatId,
                            projectId: newProjectId,
                            projectTitle: newProjectTitle
                        });
                    }else{  
                    //如果沒有找到未分類的cat就直接創一個
                        const newDocRefCat = doc(collection(db, `project/${newProjectId}/category`));
                            const newCategory = {
                                    id: newDocRefCat.id,
                                    uid:currentUser?.uid,
                                    categoryTitle:'unclassified',
                                    createAt: new Date().toISOString(),
                                    projectId: newProjectId
                            }
                        await setDoc(newDocRefCat, newCategory);
                        const currentCatId = newCategory.id;
                        const newDocRefTask = doc(collection(db, `project/${newProjectId}/category/${currentCatId}/task`));
                        await setDoc(newDocRefTask, {
                            ...taskData,
                            id: newDocRefTask.id,
                            categoryId:currentCatId,
                            projectId: newProjectId,
                            projectTitle: newProjectTitle
                        });
                    }
                }catch(error){
                    console.log('1.2 error from deleting old project', error)
                }
                
            }   
        }  
        return { taskId: task.id, newProjectId, newProjectTitle };
    } 
)
//狀態2 本身沒有project被加入newproject
export const updateTaskProject = createAsyncThunk('project/updateTaskProject', 
    async({task,newProjectId, newProjectTitle, currentUser}:{task:Task, newProjectId:string, newProjectTitle:string, currentUser: User})=>{
        try{
            const q = query(collection(db, `noProject/${currentUser?.uid}/task`),where('id','==', task.id));
            const querySnapshot = await getDocs(q);

            if(!querySnapshot.empty){
                const taskDoc = querySnapshot.docs[0];
                const taskData = taskDoc.data() as Task;
                
                await deleteDoc(taskDoc.ref);

                //找有沒有一個叫做unclassified的cate
                const categoryQuery = query(collection(db, `project/${newProjectId}/category`), where('categoryTitle','==','unclassified'));
                const categoryQuerySnapshot = await getDocs(categoryQuery);
                const currentUserCat = categoryQuerySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                
                if(currentUserCat.length > 0){
                    //有找到unclassified cate
                    const currentCatId = currentUserCat[0].id;
                    const newDocRefTask = doc(collection(db, `project/${newProjectId}/category/${currentCatId}/task`));
                    await setDoc(newDocRefTask, {
                        ...taskData,
                        id: newDocRefTask.id,
                        categoryId:currentCatId,
                        projectId: newProjectId,
                        projectTitle: newProjectTitle
                    });
                }else{
                    //沒有unclassified cate->創一個
                    try{
                        const newDocRefCat = doc(collection(db, `project/${newProjectId}/category`));
                        const newCategory = {
                                id: newDocRefCat.id,
                                uid:currentUser?.uid,
                                categoryTitle:'unclassified',
                                createAt: new Date().toISOString(),
                                projectId: newProjectId
                        }
                        await setDoc(newDocRefCat, newCategory);

                        const currentCatId = newCategory.id;
                        const newDocRefTask = doc(collection(db, `project/${newProjectId}/category/${currentCatId}/task`));
                        await setDoc(newDocRefTask, {
                            ...taskData,
                            id: newDocRefTask.id,
                            categoryId:currentCatId,
                            projectId: newProjectId,
                            projectTitle: newProjectTitle
                        });
                    }
                    catch(error){
                        console.log('2 error from creating new unclassified category')
                    }
                }
            }
        }catch(error){
            console.log('2 error from adding task without project into new project',error)
        }
        return { taskId: task.id, newProjectId, newProjectTitle };
    }
)

//Project的Tasks
export const fetchProjectTasks = createAsyncThunk('tasks/fetchProjectTasks',
    async({projectId, categoryId}:{projectId:string,categoryId:string}) => {
        try{
            const q = query(collection(db, `project/${projectId}/category/${categoryId}/task`));
            const querySnapshot = await getDocs(q);
            const fetchedTasks: Task[] = querySnapshot.docs.map(doc =>({
                ...doc.data() as Task,
                id: doc.id
            }));
            return fetchedTasks;
        }catch(error){
            console.log('這個category沒有task');
        }
    }
)

//-----------Tasks---------------------------


//fetch Tasks and tasks project
export const fetchTasks = createAsyncThunk('tasks/fetchTasks', async(currentUser:User|null, { getState }) => {
    if(!currentUser) return {tasks:[], projects:[]};
    let tasks = [];
    
    //從ProjectsSlice取得project狀態
    const state = getState() as RootState;
    const projects = state.projects.projects;
    const categories = state.categories.categories;

    //noProject Tasks
    const noProjectQuery = query(collection(db, `noProject/${currentUser.uid}/task`));
    const noProjectSnapshot = await getDocs(noProjectQuery);
    const noProjectTasks = noProjectSnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
    })as Task)
    tasks.push(...noProjectTasks);
 

    //在目前有的project中看每個cat的每個task中有沒有被assigned
    for (const project of projects){
        for (const cat of categories){
            const taskQuery = query(collection(db, `project/${project.id}/category/${cat.id}/task`),
            where('taskAssign', 'array-contains', currentUser.email)
        );
        const taskSnapshot = await getDocs(taskQuery);
        if(!taskSnapshot.empty){
            const projectTasks = taskSnapshot.docs.map((doc)=>({
                ...doc.data(),
                id: doc.id,
                projectTitle: project.projectTitle,
            }));
            tasks.push(...projectTasks);
        }
        }
    }
    console.log('12341234123412341234', tasks)
    return { tasks, projects };

})

//Async update Tasks 
export const updateTasksAsync = createAsyncThunk('tasks/updateTask', 
    async ({taskRefString, updatedData, taskId} : { taskRefString:string, updatedData:Partial<Task>, taskId:string}) => {
    const taskRef = doc(db, `${taskRefString}`, taskId)
    await updateDoc(taskRef, updatedData);
    return { taskId, updatedData };
})

//Async Delete Tasks 
export const deleteTasksAsync = createAsyncThunk('tasks/deleteTask', 
    async({taskRefString, taskId}:{ taskRefString: string, taskId:string}) => {
        try{
            const taskRef = doc(db, taskRefString);
            await deleteDoc(taskRef);
            return taskId
        }catch(error){
            console.log('deleteTask mistake',error)
        }
        
    }
)

// Async Add Tasks 
export const addTasksAsync = createAsyncThunk('tasks/addTask', 
    async({newDocRef, newTask}:{ newDocRef:DocumentReference<DocumentData> , newTask:Task})=>{
        try{
            await setDoc(newDocRef, newTask);
        }catch(error){
            console.log('新增Task時出錯')
        }
        console.log('成功新增TASK',newTask)
    return newTask;
})

export const setTaskUpdate = createAsyncThunk('task/setTaskUpdate',
    async({taskRefString, taskId}: {taskRefString:string,taskId:string}) => {
        const taskQuery = doc(db, `${taskRefString}/${taskId}`);
        const taskSnapshot = await getDoc(taskQuery);
        // const tasks = taskSnapshot
        if(taskSnapshot.exists()){
            const updatedTask = taskSnapshot.data();
            return updatedTask
        }else{
            throw new Error ('Task not found')
        }
    }
)

//定義slice邏輯來管理tasks狀態
const tasksSlice = createSlice({
    name: "tasks",
    //初始狀態
    initialState,
    reducers: {
        //to do list filter projects 
        setFilteredProject:(state, action:PayloadAction<string>) =>{
            const selectedProjectId = action.payload;
            if(selectedProjectId === ''){
                state.tasks = state.allTasks;
            }else{
                state.tasks = state.allTasks.filter(tasks => 
                    tasks.projectId === selectedProjectId
                )
            }
            state.selectedProject = action.payload;
        }
    },

    extraReducers: (builder) => {
        builder
            //fetch tasks
            .addCase(fetchTasks.pending, (state)=> {
                state.loading = true;
            })
            .addCase(fetchTasks.fulfilled, (state, action) => {
                const { tasks =[], projects=[] } = action.payload || {};
                state.tasks = tasks as Task[];//動作攜帶的數據，傳遞給reducer的訊息，並更新store
                state.allTasks = tasks as Task[];
                state.projects = projects;
                state.loading = false;
            })
            //update tasks
            .addCase(updateTasksAsync.fulfilled, (state, action) => {
                const { taskId, updatedData } = action.payload;
                state.allTasks = state.allTasks.map((task) => 
                    task.id === taskId ? { ...task, ...updatedData} : task
                );
                state.tasks = state.tasks.map((task) => 
                    task.id === taskId ? { ...task, ...updatedData} : task
                );
            })
            //delete tasks
            .addCase(deleteTasksAsync.fulfilled, (state, action) => {
                state.allTasks = state.allTasks.filter((task) => task.id !== action.payload);
                state.tasks = state.tasks.filter((task) => task.id !== action.payload);
            })
            //add tasks
            .addCase(addTasksAsync.fulfilled, (state, action) => {
                state.allTasks.unshift(action.payload);
                state.tasks.unshift(action.payload);
            })
            // 取消原本有project的task
            .addCase(removeTaskFromProject.fulfilled,(state, action)=> {
                state.allTasks = state.allTasks.map(task=> 
                    task.id === action.payload ? {...task, projectId: '', projectTitle:''}:task
                ) 
                state.tasks = state.tasks.map(task=> 
                    task.id === action.payload ? {...task, projectId: '', projectTitle:''}:task
                ) 
            })
            .addCase(removeTaskFromProject.rejected, (state, action) =>{
                console.error('Error removing task from project', action.error);
                state.loading = false;
            })
            // 轉移project到新project
            .addCase(moveTaskToNewProject.fulfilled, (state, action) => {
                const { taskId, newProjectId, newProjectTitle } = action.payload;
                state.allTasks = state.allTasks.map(task => 
                    task.id === taskId ? { ... task, projectId: newProjectId, newProjectTitle: newProjectTitle} : task
                )
                state.tasks = state.tasks.map(task => 
                    task.id === taskId ? { ... task, projectId: newProjectId, newProjectTitle: newProjectTitle} : task
                )
            })
            // 從noproject到新project
            .addCase(updateTaskProject.fulfilled, (state, action) => {
                const { taskId, newProjectId, newProjectTitle } = action.payload;
                state.allTasks = state.allTasks.map(task => 
                    task.id === taskId ? { ... task, projectId: newProjectId, newProjectTitle: newProjectTitle} : task
                )
                state.tasks = state.tasks.map(task => 
                    task.id === taskId ? { ... task, projectId: newProjectId, newProjectTitle: newProjectTitle} : task
                )
            })
            // ProjectTasks
            .addCase(fetchProjectTasks.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchProjectTasks.fulfilled, (state, action) => {
                state.projectTasks = action.payload as Task[];
                state.loading = false;
            })
            // Updated task after assigned 
            .addCase(setTaskUpdate.fulfilled, (state ,action) => {
                const updatedTask = action.payload as Task;
                state.allTasks.push(updatedTask);
                state.tasks.push(updatedTask);
            })
            
    }
});

export const { setFilteredProject } = tasksSlice.actions;
export default tasksSlice.reducer;