import {useEffect, useState} from 'react';
import { collection, query, where, getDocs, doc,updateDoc, deleteDoc } from 'firebase/firestore';
import AddCategory from "./2_addCategory";
import { db } from '../../../../firebase';
import CategoryContent from './2_categoryContent'
import MemberList from './member/member_List'
import Image from 'next/image';

interface Project {
    id: string;
    uid: string;
    projectTitle: string;
    projectStatus: string;
    projectMember: string[];
    projectDateStart: string;
    projectDateEnd: string;
    projectOwner: string | undefined;
    createdAt: string;
}

interface ProjectListProps {
    project: Project;
    OnDelete: () => void;
    OnUpdate: (id: string, updatedData: Partial<Project>) => void;
}

const ProjectList: React.FC<ProjectListProps>  = ({project,OnDelete,OnUpdate}) => {
    //set project資料 
    const [title, setTitle] = useState(project.projectTitle);
    const [status, setStatus] = useState(project.projectStatus);
    const [members, setMembers] = useState(Array.isArray(project.projectMember) ? project.projectMember : [project.projectMember]); 
    const [startDate, setStartDate] = useState(project.projectDateStart?.slice(0,10));
    const [endDate, setEndDate] = useState(project.projectDateEnd?.slice(0,10));
    //category 資料
    const [categories, setCategories] = useState<any[]>([]); 
    console.log('checilllll',project.projectMember)
    //members 資料
    const [showMemberInput, setShowMemberInput] = useState(false)
    const [newMember, setNewMember] = useState('');



    
    //fetch category的資料
    useEffect(()=>{
        const fetchCategories = async () => {
            try{
                const q = query(collection(db,`project/${project.id}/category`));
                const querySnapshot = await getDocs(q);
                const fetchedCategories = querySnapshot.docs.map(doc =>({
                    id:doc.id,
                    ...doc.data()
                }));
                if(fetchedCategories){
                    setCategories(fetchedCategories);
                    console.log('fetchedCategories',fetchedCategories)
                }else{
                    console.log('這個project沒有categories');
                }
            }catch(error){
                console.log('獲取category出錯',error)
            }

        } 
        fetchCategories()
    },[project.id])
        //----------------------- member 處理----------------------------
    

    //新增會員權限
    const handleAddMember = async() => {
        if(newMember && !members.includes(newMember) ){
            try{
                const newMemberRef = doc (db, 'project',project.id);
                const updatedMembers = [...members, newMember];
                await updateDoc(newMemberRef, {
                    projectMember: updatedMembers
                });

                setMembers(updatedMembers);
                setNewMember('');
                setShowMemberInput(false);
            } catch(error){
                console.log('新增成員時出錯',error);
            }
           
            

        }
    }

    //刪除會員
    const handleDeleteMember = async(memberToRemove:string) => {
        try{
            const updatedMembers = members.filter(member => member !== memberToRemove)
            const newMemberRef = doc (db, 'project',project.id);
            await updateDoc(newMemberRef, {
                projectMember: updatedMembers
            });
            setMembers(updatedMembers);//更新local端
        }catch(error){
            console.log('刪除成員時出錯',error);
        }
    }
    
    //-----Category-------
    //刪除Category
    const onDeleteCategory = async(categoryId:string) => {
        try{
            const categoryDef = doc(db, `project/${project.id}/category/${categoryId}`);
            await deleteDoc(categoryDef);
            setCategories(prevCategories => prevCategories.filter(category => category.id !== categoryId))
        }catch(error){
            console.log('刪除category時錯誤',error)
        }
    }

    //即時儲存更新category
    const handleUpdateCategory = async(categoryId:string, updatedData:any) =>{
        try{
            const categoryDef = doc(db, `project/${project.id}/category/${categoryId}`);
            await updateDoc(categoryDef, updatedData);
            setCategories(prevCategories => prevCategories.map(category =>
                category.id === categoryId ? { ...category, ...updatedData } : category
            ));
        }catch(error){
            console.log('更新category時錯誤',error);
        }

    }


    //console.log('有到這裡呦')
    //console.log('key?',project.id)


    //--------------------------編輯project內容---------------------------
    //編輯標題
    const handleTitleBlur = () =>  {
        OnUpdate(project.id, {projectTitle: title})
        console.log('確認project ID',project.id)
    }
    //編輯狀態
    const handleStatus = () => {
        OnUpdate(project.id, {projectStatus: status})
    }
    //編輯開始日程
    const handleStartDate = () =>{
        OnUpdate(project.id, {projectDateStart: startDate})
    }
    //編輯結束日期
    const handleEndDate = () => {
        OnUpdate(project.id, {projectDateEnd: endDate})
    }


    return (
        <>
            <div className='project'>
                <div className='project-list'>
                    <div className='project-list-box'>
                        {/* Title */}
                       
                        <input placeholder='title' value={title} onChange={(e)=>setTitle(e.target.value)} onBlur={handleTitleBlur}></input>
                        {/* Status */}
                        <select id="" value={status} onChange={(e) => setStatus(e.target.value)} onBlur={handleStatus}>
                            
                            <option value="Unstarted">Unstarted</option>
                            <option value="Processing">Processing</option>
                            <option value="Done">Done</option>
                        </select>


                        {/* Member !!!!這邊要另外處理member的部分*/}

                        


                        <div className='project-member'>
                            <Image className='signup-img' src="/images/google.png" alt="Add Task" width={20} height={20}/>
                            <div>member</div>
                            {Array.isArray(members) && members.map((member) => (
                                <MemberList
                                    key={member} // 使用 member 作为 key 因为 member 是字符串
                                    member={member}
                                    OnDelete={() => handleDeleteMember(member)}
                                />
                            ))}
                            <button onClick={()=> setShowMemberInput(true)}>+</button>
                        </div>
                        {/* 加入新成員視窗 showMemberInput */}

                        {showMemberInput? 
                            (<div className={`project-addMember ${showMemberInput? 'show' : ''}`}>
                                <div>
                                    <div>Enter email to join your member</div>
                                    <div>
                                    <input type="text" placeholder='' value={newMember} onChange={(e) => setNewMember(e.target.value)}/>
                                    </div>
                                        <button onClick={handleAddMember}>Add</button>
                                        
                                </div>

                            </div>) :
                            (
                                <div></div>
                            )

                        }
                  
                        {/* Date */}
                        <input 
                            type = "date" 
                            value = {startDate}
                            onChange = {(e) => setStartDate(e.target.value)}
                            onBlur = {handleStartDate}
                        />
                        ~
                        <input 
                            type="date" 
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            onBlur = {handleEndDate}    
                        />
                        
                        <button>展開</button>
                        <button onClick={OnDelete}>delete</button>
                    </div>

                    

                </div>
                <div className='project-content'>
                    
                    {categories?.map(category => (
                        <CategoryContent 
                        key={category.id}
                        category={category}
                        OnDelete={()=>onDeleteCategory(category.id)}
                        OnUpdate={handleUpdateCategory}
                    />
                    ))}
                    <AddCategory
                        projectId={project.id}
                        setCategories={setCategories}
                        categories={categories}
                    />
                </div>
            </div>
           
            
           
        </>


    )




}

export default ProjectList;