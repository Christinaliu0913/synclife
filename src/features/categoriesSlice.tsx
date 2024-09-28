import { createSlice, createAction, createAsyncThunk } from "@reduxjs/toolkit";
import { db } from '../../firebase'
import { query, where, collection, getDocs, addDoc, doc, deleteDoc, updateDoc, DocumentReference, DocumentData, setDoc } from 'firebase/firestore'
import { Category, Project } from "@/types/types";
import { User } from "firebase/auth";
import { RootState } from "@/store";



interface CategoriesState{
    categories: Category[];
    loading: boolean;
}
const initialState: CategoriesState = {
    categories: [],
    loading: false
}

//fetch Cate
export const fetchCategories =createAsyncThunk('categories/fetchCategories',
    async(currentUser:User|null, { getState }) => {
        if(!currentUser) return; 
    
        
        const state = getState() as RootState;
        const projects = state.projects.projects;

        let categories:Category[] = [];
        try{
            if(projects.length > 0){
                for (const projectDoc of projects){
                    const projectId = projectDoc.id;
                    const categoryQuery = query(collection(db,`project/${projectId}/category`));
                    const querySnapshot = await getDocs(categoryQuery);
    
                    const fetchedCategories = querySnapshot.docs.map(doc =>({
                        id:doc.id,
                        ...doc.data()
                    })as Category);
    
                    categories.push(...fetchedCategories);
                }
            }
            
        }catch(error){
            console.log('獲取category出錯',error)
        }
        return categories;
    }
)

//Add Cate
export const addCategories = createAsyncThunk('categories/addCategories', 
    async({newDocRefCat, newCategory}:{newDocRefCat:DocumentReference<DocumentData>,newCategory:Category}) => {
        try{
            await setDoc(newDocRefCat, newCategory);
        }catch(error){
            console.log('fetch category的時候錯誤',error);
        }
        return newCategory;
    }
)
//Delete Cate
export const deleteCategories = createAsyncThunk('categories/deleteCategories', 
    async({categoryDef,categoryId}:{categoryDef:DocumentReference<DocumentData>, categoryId:string}) => {
        try{
            await deleteDoc(categoryDef);
        }catch(error){
            console.log('fetch category的時候錯誤',error);
        }
        return categoryId;
    }
)
//Update Cate
export const updateCategories = createAsyncThunk('categories/updateCategories', 
    async({categoryDef,updatedData,categoryId}:{categoryDef:DocumentReference<DocumentData>,updatedData:Partial<Category>,categoryId:string}) => {
        try{
            await updateDoc(categoryDef, updatedData);
        }catch(error){
            console.log('更新category時錯誤',error);
        }
        return { categoryId, updatedData }
    }
)


const categoriesSlice = createSlice({
    name: 'categories',
    initialState,
    reducers:{
        
    },
    extraReducers: (builder) => {
        builder
        //fetch categories
        .addCase(fetchCategories.pending, (state)=> {
            state.loading = true;
        })
        .addCase(fetchCategories.fulfilled, (state, action) => {
            state.categories = action.payload|| [];
        })
        //add cate
        .addCase(addCategories.fulfilled, (state,action) => {
            state.categories.unshift(action.payload);
        })
        //delete cate
        .addCase(deleteCategories.fulfilled, (state, action) => {
            state.categories = state.categories.filter(category => category.id !== action.payload)
        })
        //update cate
        .addCase(updateCategories.fulfilled, (state, action) => {
            const { categoryId, updatedData } = action.payload;
            state.categories = state.categories.map(category => 
                category.id === categoryId ? {...category, ...updatedData}: category
            )
        })
    }
})

export default categoriesSlice.reducer;