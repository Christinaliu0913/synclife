
// "use client"
// import { Dispatch, SetStateAction } from 'react';
// import ProjectList from "@/app/component/project/1_projectList";
// import AddProject from "@/app/component/project/1_addProject";
// import { useAuth } from '../auth/authContext';
// import { useEffect, useState } from "react";
// import { auth, db } from '../../../../firebase';
// import { collection, query, where, getDocs, doc,updateDoc, deleteDoc } from 'firebase/firestore';


// interface Project {
//     id: string;
//     uid: string;
//     projectTitle: string;
//     projectStatus: string;
//     projectMember: string[];
//     projectDateStart: string;
//     projectDateEnd: string;
//     projectOwnner: string | undefined;
//     createdAt: string;
// }

// //project 

// const ProjectSeletor = () => {
//     const { currentUser,loadingUser } = useAuth();
//     const [ projects, setProjects ] = useState<Project[]>([]);

//     //先fetch這個人的資料
//     useEffect(()=>{
//         const fetchProjects = async () => {
//             console.log('loadingUser:', loadingUser);
//             console.log('currentUser:', currentUser);
//             if(!loadingUser && currentUser){
//                 try{
//                     const q = query(collection(db, 'project'), where('projectMember','array-contains',currentUser.email));
//                     const querySnapshot = await getDocs(q);
//                     const currentUserProjects = querySnapshot.docs.map(doc => ({
//                         id: doc.id,
//                         ...doc.data()
//                     } as Project));
//                     if(currentUserProjects){
//                         setProjects(currentUserProjects);
//                         console.log('這個人的project有', currentUserProjects);
//                         currentUserProjects.forEach(project=>{
//                             console.log('project ID check', project.id);
//                         })
//                     }else{
//                         console.log('這個人沒有project')
//                     }
//                 }catch(error){
//                     console.log('獲取項目出錯',error);
//                 }
//             }
//         }
//         fetchProjects();
        

//     },[currentUser,loadingUser])



//     return (
//         <div>
//                 <label htmlFor="project">Project</label>
//                 <select id="project" value={project} onChange={(e)=>setCalendar(e.target.value)} >

//                     <option value="default">test</option>
//                     <option value="addNewProject">Add new project</option>
//                     {/* 我這邊要另外做一個option的選項fetch */}
//                 </select>
//             </div>

//     )
// }