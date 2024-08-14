import {useState} from 'react';
import ProjectContent from './2_projectContent';
import AddCategory from "./3_addCategory";
import { useAuth } from '../auth/authContext';

const ProjectList = ({project,OnDelete,OnUpdate}) => {
    // 
    const [title, setTitle] = useState(project.projectTitle);
    const [status, setStatus] = useState(project.projectStatus);
    const [member, setMember] = useState(project.projectMember);
    const [startDate, setStartDate] = useState(project.projectDateStart?.slice(0,10));
    const [endDate, setEndDate] = useState(project.projectDateEnd?.slice(0,10));
    console.log('有到這裡呦')
    console.log('key?',project.id)
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
                            <img className='signup-img' src="/images/google.png" alt="" />
                            <div>member</div>
                            <button>+</button>
                        </div>

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
                    <ProjectContent/>
                </div>
            </div>
           
            
           
        </>


    )




}

export default ProjectList;