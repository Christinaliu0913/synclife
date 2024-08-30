'use client'
import { useAuth } from '../auth/authContext';
import SignOut from '../auth/signOut'
import Image from 'next/image';

const Navigation = () => {
    const {currentUser} = useAuth();
    const userName = currentUser? (currentUser.displayName ): ('Set your name')
    const userEmail = currentUser? currentUser.email: null;

    return(
        <>
            <div className='sidebar'>
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
                            <span>
                                <Image src="/images/check-contained.png" alt="Description" width={20} height={20} className='menu-listImg'/>
                                <a href="/pages/test">To do list</a>
                            </span> 
                        </li>
                        <li>
                            <span>
                                <Image src="/images/Folder_light.png" alt="Description" width={20} height={20} className='menu-listImg'/>
                                <a href="/pages/project">Project</a>
                            </span> 
                        </li>
                        {/* <li>
                            <span>
                                Report
                            </span>
                        </li> */}
                    </ul>
                </div>
                <div className='sidebar-signOut'>
                    <div className='sidebar-signOut-box'>
                        <SignOut/>
                    </div>
                </div>
                    
            </div>
        </>
    );

}
export default Navigation;