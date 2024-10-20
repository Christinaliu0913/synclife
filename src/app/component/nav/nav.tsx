'use client'
import { Dispatch, SetStateAction, useState } from 'react';
import { useAuth } from '../auth/authContext';
import SignOut from '../auth/signOut'
import Image from 'next/image';
import TodoListToggle from '../todolist/0_todolistMain';
import { Task } from '@/types/types';


const Navigation = () => {
    const {currentUser} = useAuth();
    const userName = currentUser? (currentUser.displayName ): ('Set your name')
    const userEmail = currentUser? currentUser.email: null;
    const [isSidebarVisible, setIsSidebarVisible] = useState(true)
    const [isTodolistShow, setIsTodolistShow] = useState(false);
    const handleNavShow = () => {
        setIsSidebarVisible(!isSidebarVisible);
    }
    const [tasks,setTasks] = useState<Task[]|[]>([])
    
    const handleSideToggleToDoList = () => {
        setIsTodolistShow(!isTodolistShow);
        setIsSidebarVisible(!isSidebarVisible);

    }
    return(
        <>
            <div className='sidebar-phone'>
                <button onClick={handleNavShow}>
                    ☰
                </button>
                <a href="/pages" className='sidebar-phone-Img'>
                    <Image src='/images/logoLight.svg' alt="logo" width={100} height={50}></Image>
                </a>
            </div>
            <div className={`sidebar ${isSidebarVisible? 'sidebar':'sidebar-phone-show'}`}>
                <button className='sidebar-phone-close' onClick={handleNavShow}>x</button>
                <div className='sidebarUser'>
                    <div>{userName}</div>
                    <div className='email'>{userEmail}</div>
                    <hr />
                </div>
        
                <div className='menu'>
                    <ul>
                        <li>
                            <Image src="/images/Date_today.png" alt="Description" width={20} height={20} className='menu-listImg'/>
                            <a href="/pages">Calendar</a>
                        </li>
                        <li>
                            <span  >
                                <Image src="/images/check-contained.png" alt="Description" width={20} height={20} className='menu-listImg'/>
                                <a onClick={handleSideToggleToDoList}>To do list</a>
                            </span> 
                        </li>
                        <li>
                            <span>
                                <Image src="/images/Folder_light.png" alt="Description" width={20} height={20} className='menu-listImg'/>
                                <a href="/pages/project">Project</a>
                            </span> 
                        </li>
                        
                    </ul>
                </div>

                
                <div className='sidebar-signOut'>
                    <div className='sidebar-signOut-box'>
                        <SignOut/>
                    </div>
                </div>
                    
            </div>
            <div>
                <TodoListToggle
                    setIsTodolistShow={setIsTodolistShow}
                    isTodolistShow={isTodolistShow}
                />
            </div>
        </>
    );

}
export default Navigation;