
import { db } from '../../../../firebase';
import { collection, query, where, getDocs, doc,setDoc,updateDoc, deleteDoc } from 'firebase/firestore';
import { useState} from 'react'
import { User as FirebaseUser, User} from 'firebase/auth'
import { calendar } from 'googleapis/build/src/apis/calendar';
import { create } from 'domain';
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
    createdAt: string;  
    projectId: string|null;
}

interface AddProjectTaskProps {
    projectId: string; 
    newProject: string|null;  
    title: string;
    endTimeSet: string;
    calendarId:string;
    currentUser: User| null;
}   


const AddorEditProjectTask = async({projectId, newProject, title, endTimeSet,calendarId,currentUser}:AddProjectTaskProps) =>{
    const categoryTitle = 'unclassified'
    if(!currentUser) return ;
    console.log('我現在要確認這粒有沒有')
        
    try {

        //狀態1/2 本身就有project
        if(projectId){
            //狀態1.1 將project移除並且把task放入沒有project的資料庫
            if(newProject === null){
                console.log('1我現在要確認這粒有沒有1')
                await removeTaskFromProject(projectId, calendarId,currentUser);
            }
            //狀態1.2 有選擇新的new project
            else if(projectId !== newProject){
                console.log('2我現在要確認這粒有沒有')
                await moveTaskToNewProject(projectId, newProject, title, endTimeSet,calendarId,currentUser,categoryTitle);
            }else{
                console.log('3我現在要確認這粒有沒有')
                //狀態1.3 編輯不更改project只編輯task
                await editTask(projectId, title, endTimeSet,calendarId);

            }
            
        }else{//狀態2/2本身沒有帶project
            if(newProject){
                console.log('4我現在要確認這粒有沒有')
                await createOrUpdateTaskInProject(newProject,title,endTimeSet,calendarId,currentUser, categoryTitle)
            }
            
        }

    }catch(error){
        console.log(error);
    }
}

//情境1.1 將task移除project --------------------------------------------------------|
const removeTaskFromProject = async (
    projectId: string,
    calendarId: string,
    currentUser: User
) => {
    try{
        console.log('這裡？removeTaskFromProject')
        //先找原本project的資料夾
        const oldProjectQuery =query(collection(db, `project/${projectId}/category`));
        const oldProjectSnapshot = await getDocs(oldProjectQuery);

        for(const categoryDoc of oldProjectSnapshot.docs){
            const taskQuery = query(
                collection(db,`project/${projectId}/category/${categoryDoc.id}/task`),
                where('calendarId', '==', calendarId)
            );
            const taskSnapshot = await getDocs(taskQuery);
            //若是有找到此task就先儲存其資料再刪除
            if(!taskSnapshot.empty){
                const taskDoc = taskSnapshot.docs[0];
                const taskData = taskDoc.data();

                //從project中刪除task
                await deleteDoc(taskDoc.ref);
                await addTaskToNoProjectList(taskData,calendarId,currentUser);
            }
        }
        
    }catch(error){
        console.log('移除task的project時出錯',error)
    }
} 

const addTaskToNoProjectList = async(
    taskData:any,
    calendarId:string,
    currentUser: User,
) => {
    try{
        const noProject = doc(collection(db, `noProject/${currentUser.uid}/task`));
        const newTask: Task = {
            id: taskData.id,
            taskTitle:taskData.taskTitle||'',
            taskStatus:'unstarted',
            taskAssign: taskData.taskAssign,
            taskNotAssign: taskData.taskNotAssign,
            taskDate:taskData.taskDate,
            taskDescription: taskData.taskDescription,
            taskOwner:currentUser.uid,
            calendarId:calendarId,
            createdAt: taskData.createdAt,
            projectId: null,

        }
        await setDoc(noProject, newTask);
        console.log('已將任務移除project')
    }catch(error){
        console.log('將task加入noProject時出錯',error);
    }
}

//狀態1.2 project -> newProject-----------------------------------|
const moveTaskToNewProject = async (
    projectId: string,
    newProject: string|null,
    title: string,
    endTimeSet: string,
    calendarId: string,
    currentUser: User,
    categoryTitle: string
) => {

    try{
        //先找原本project的資料夾
        const oldProjectQuery =query(collection(db, `project/${projectId}/category`));
        const oldProjectSnapshot = await getDocs(oldProjectQuery);

        for(const categoryDoc of oldProjectSnapshot.docs){
            const taskQuery = query(
                collection(db,`project/${projectId}/category/${categoryDoc.id}/task`),
                where('calendarId', '==', calendarId)
            );
            const taskSnapshot = await getDocs(taskQuery);
            //若是有找到此task就先儲存其資料再刪除
            if(!taskSnapshot.empty){
                const taskDoc = taskSnapshot.docs[0];
                const taskData = taskDoc.data();
                console.log('那這邊呢？',taskData)
                //從project中刪除task
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
                        taskTitle:title||'',
                        taskStatus:'unstarted',
                        taskAssign: taskData.taskAssign,
                        taskNotAssign: taskData.taskNotAssign,
                        taskDate:endTimeSet,
                        taskDescription: taskData.taskDescription,
                        taskOwner:currentUser.uid,
                        calendarId:calendarId,
                        createdAt: taskData.createdAt,
                        projectId: newProject
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
                                categoryTitle,
                                createAt: new Date().toISOString(),
                                projectId: newProject
                        }
                        await setDoc(newDocRefCat, newCategory);
                        const currentCatId = newCategory.id;
                        const newDocRefTask = doc(collection(db, `project/${newProject}/category/${currentCatId}/task`));
                        const newTask: Task = {
                            id: newDocRefTask.id,
                            taskTitle:title||'',
                            taskStatus:'unstarted',
                            taskAssign: taskData.taskAssign,
                            taskNotAssign: taskData.taskNotAssign,
                            taskDate:endTimeSet,
                            taskDescription: taskData.taskDescription,
                            taskOwner:currentUser.uid,
                            calendarId:calendarId,
                            createdAt: taskData.createdAt,
                            projectId: newProject
                        }
                        await setDoc(newDocRefTask, newTask)

                    }catch(error){
                        console.log('新增task的時候出錯',error);
                    }
                }


            }

        }
        }catch(error){
                console.log('更新project時出錯（情境1.2）',error);
        }
    };
//狀態1.3 編輯不更改project 只編輯task
const editTask = async (
    projectId:string,
    title:string,
    endTimeSet:string,
    calendarId:string

) => {

    const ProjectQuery =query(collection(db, `project/${projectId}/category`));
    const ProjectSnapshot = await getDocs(ProjectQuery);

    for(const categoryDoc of ProjectSnapshot.docs){
        const taskQuery = query(
            collection(db,`project/${projectId}/category/${categoryDoc.id}/task`),
            where('calendarId', '==', calendarId)
        );
        const taskSnapshot = await getDocs(taskQuery);
        //若是有找到此task就先儲存其資料再刪除
        if(!taskSnapshot.empty){
            const taskDoc = taskSnapshot.docs[0];
            const taskRef = taskDoc.ref;
            console.log('確認標題',title)
            await updateDoc(taskRef,{
                projectId:projectId,
                taskDate:endTimeSet,
                taskTitle:title||''
            });
            console.log('已更新task的資料', taskDoc.id)
            return;
        }
    }

}

//狀態2.1本身沒有帶project
const createOrUpdateTaskInProject = async (
    newProject: string,
    title: string,
    endTimeSet: string,
    calendarId: string,
    currentUser: User,
    categoryTitle: string
) => {
    const q = query(collection(db, `project/${newProject}/category`), where('categoryTitle','==','unclassified'));
    const querySnapshot = await getDocs(q);
    const currentUserCat = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));
    if(currentUserCat.length > 0){
        //如果有一個叫做未分類的cat的話，就直接在這個cat新增task
        const currentCatId = currentUserCat[0].id;
        const newDocRefTask = doc(collection(db, `project/${newProject}/category/${currentCatId}/task`));
        const newTask: Task = {
            id: newDocRefTask.id,
            taskTitle:title||'',
            taskStatus:'unstarted',
            taskAssign: [],
            taskNotAssign: [],
            taskDate:endTimeSet,
            taskDescription: '',
            taskOwner:currentUser.uid,
            calendarId:calendarId,
            createdAt: new Date().toISOString(),
            projectId: newProject
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
                    categoryTitle,
                    createAt: new Date().toISOString(),
                    projectId: newProject
            }
            await setDoc(newDocRefCat, newCategory);
            const currentCatId = newCategory.id;
            const newDocRefTask = doc(collection(db, `project/${newProject}/category/${currentCatId}/task`));
            const newTask: Task = {
                id: newDocRefTask.id,
                taskTitle:title||'',
                taskStatus:'unstarted',
                taskAssign: [],
                taskNotAssign: [],
                taskDate:endTimeSet,
                taskDescription: '',
                taskOwner:currentUser.uid,
                calendarId: calendarId,
                createdAt: new Date().toISOString(),
                projectId: newProject
            }
            await setDoc(newDocRefTask, newTask)

        }catch(error){
            console.log('新增task的時候出錯',error);
        }
    }
}

export default AddorEditProjectTask;