
import { db } from '../../../../firebase';
import { collection, query, where, getDocs, doc,setDoc,updateDoc } from 'firebase/firestore';
import { useState} from 'react'
import { User as FirebaseUser, User} from 'firebase/auth'
interface Task {
    id: string;
    taskTitle: string;
    taskStatus: string| null;
    taskAssign: string| null;
    taskDate: string| null;
    taskDescription: string| null;
    taskOwner: string | null;
    calendarId: string;
    projectId: string|null;
    createdAt: string;  
}

interface AddProjectTaskProps {
    project: string;   
    title: string;
    endTimeSet: string;
    calendarId:string;
    currentUser: User| null;
}   


const AddorEditProjectTask = async({project, title, endTimeSet,calendarId,currentUser}:AddProjectTaskProps) =>{
    const categoryTitle = 'unclassified'
    
    console.log('我現在要確認這粒有沒有')
        
    if(currentUser){
        try{
            //搜尋此calendar.id是否已經是task了
            //先撈目前使用者的Project
            const projectQuery = query(collection(db, 'project'),where('projectMember', 'array-contains',currentUser.email));
            const projectSnapshot = await getDocs(projectQuery);
            const projectWithAccess = projectSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            //在項目中找這個calendar.id的任務
            for(const proj of projectWithAccess){
                const taskQuery = query(collection(db, `project/${proj.id}/category`),
                where('task.calendarId', '==', calendarId)
                );
                const taskSnapshot = await getDocs(taskQuery);

                if(!taskSnapshot.empty){
                    //如果有找到的話
                    const existingTaskDoc = taskSnapshot.docs[0];
                    //定義這個task的文檔
                    const existingTaskRef = existingTaskDoc.ref;

                    //更新現有task的project還有taskDate
                    await updateDoc(existingTaskRef,{
                        projectId: project,
                        taskDate: endTimeSet,
                        taskTitle: title || '',
                    });
                    console.log('已更新',existingTaskDoc.id)
                    return;//退出函數
                }
            }
            

            console.log('no project')
            //若是沒有的話就創一個
            const q = query(collection(db, `project/${project}/category`), where('categoryTitle','==','unclassified'));
            const querySnapshot = await getDocs(q);
            const currentUserCat = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            if(currentUserCat.length > 0){
                //如果有一個叫做未分類的cat的話，就直接在這個cat新增task
                const currentCatId = currentUserCat[0].id;
                const newDocRefTask = doc(collection(db, `project/${project}/category/${currentCatId}/task`));
                const newTask: Task = {
                    id: newDocRefTask.id,
                    taskTitle:title||'',
                    taskStatus:'unstarted',
                    taskAssign: null,
                    taskDate:endTimeSet,
                    taskDescription: null,
                    taskOwner:currentUser.uid,
                    calendarId:calendarId,
                    createdAt: new Date().toISOString(),
                    projectId: project
                }
                await setDoc(newDocRefTask, newTask)
                currentUserCat.forEach(cat=>{
                    console.log('project ID check', cat.id);
                })
            }else{
                //如果沒有找到未分類的cat就直接創一個
                try{
                    const newDocRefCat = doc(collection(db, `project/${project}/category`));
                    const newCategory = {
                            id: newDocRefCat.id,
                            uid:currentUser?.uid,
                            categoryTitle,
                            createAt: new Date().toISOString(),
                            projectId: project
                    }
                    await setDoc(newDocRefCat, newCategory);
                    const currentCatId = newCategory.id;
                    const newDocRefTask = doc(collection(db, `project/${project}/category/${currentCatId}/task`));
                    const newTask: Task = {
                        id: newDocRefTask.id,
                        taskTitle:title||'',
                        taskStatus:'unstarted',
                        taskAssign: null,
                        taskDate:endTimeSet,
                        taskDescription: null,
                        taskOwner:currentUser.uid,
                        calendarId: calendarId,
                        createdAt: new Date().toISOString(),
                        projectId: project
                    }
                    await setDoc(newDocRefTask, newTask)

                }catch(error){
                    console.log('新增task的時候出錯',error);
                }
            }
        }catch(error){
            console.log('獲取項目出錯',error);
        }
    }
    
}

export default AddorEditProjectTask;