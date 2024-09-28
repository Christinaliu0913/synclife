import { createSlice, createAction, createAsyncThunk } from "@reduxjs/toolkit";
import { db } from '../../firebase'
import { query, where, collection, getDocs, addDoc, doc, deleteDoc, updateDoc, DocumentReference, DocumentData, setDoc } from 'firebase/firestore'
import { Project } from "@/types/types";
import { User } from "firebase/auth";


interface ProjectsState{
    projects: Project[];
    loading: boolean
}


const initialState: ProjectsState ={
    projects:[],
    loading: false
}

//fetch Project
export const fetchProjects = createAsyncThunk('projects/fetchProjects', async(currentUser: User|null, {getState})=>{
    if(!currentUser) return {tasks:[], projects:[]};

    //先從redux狀態中取得目前的projects 
    const state = getState() as {projects: ProjectsState};
    if (state.projects.projects.length > 0){
        return state.projects.projects;//已有專案資料，直接返回（減少firebase查詢次數）
    }
    let projects = [];
    const projectQuery = query(collection(db, 'project'), where('projectMember','array-contains',currentUser.email));
    const projectSnapshot = await getDocs(projectQuery);
    const currentUserProjects = projectSnapshot.docs.map(doc =>({
        id:doc.id, 
        ...doc.data()
    }) as Project);
    //目前有哪些project 
    projects.push(...currentUserProjects);
    return projects;
    }
)

//Add Project
export const addProjects = createAsyncThunk('projects/addProjects', 
    async({newDocRef,newProject}:{newDocRef:DocumentReference<DocumentData> , newProject:Project}) => {
        try{
            await setDoc(newDocRef, newProject);
        }catch(error){
            console.log('新增project內容時錯誤',error);
        }
        return newProject
    }
)

//Delete Project
export const deleteProjects = createAsyncThunk('projects/deleteProjects',
    async({projectDef, projectId}:{projectDef:DocumentReference<DocumentData>, projectId:string}) => {
        try{
            await deleteDoc(projectDef);
        }catch(error){
            console.log('刪除project內容時錯誤',error);
        }
        return projectId;
    }
)
//edit Project
export const updateProjects = createAsyncThunk('projects/updateProject',
    async({projectDef, updatedData, projectId}:{projectDef:DocumentReference<DocumentData>, updatedData:Partial<Project>,projectId: string}) =>{
        try{
            await updateDoc(projectDef, updatedData as DocumentData);
        }catch(error){
            console.log('更新project內容的時候錯誤',error);
        }
        return {projectId, updatedData};
    }
)

const projectsSlice = createSlice({
    name:'project',
    initialState,
    reducers:{

    },
    extraReducers: (builder) => {
        builder
            //fetch Projects
            .addCase(fetchProjects.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchProjects.fulfilled, (state, action) => {
                state.projects = action.payload as Project[];
                state.loading = false;
            })
            //add Project
            .addCase(addProjects.fulfilled, (state, action) => {
                state.projects.unshift(action.payload);
            })
            //delete Project
            .addCase(deleteProjects.fulfilled, (state, action) => {
                state.projects = state.projects.filter((project) => project.id !== action.payload);
            })
            //editing Project
            .addCase(updateProjects.fulfilled, (state, action) => {
                const { projectId, updatedData } = action.payload;
                state.projects = state.projects.map(project => 
                    project.id === projectId ? {...project, ...updatedData}: project
                )
            })
    }

})

export default projectsSlice.reducer