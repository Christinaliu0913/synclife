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
                <div>
                    <div>{userName}</div>
                    <div>{userEmail}</div>
                </div>
                <div className='menu'>
                    <ul>
                        <li><Image src="/images/Date_today.png" alt="Description" width={20} height={20} /><a href="/pages">Calendar</a> </li>
                        <li>
                            <span><Image src="/images/check-contained.png" alt="Description" width={20} height={20} /> To do list</span> 
                            <ul className='sub-menu-project'>
                              <li>test</li>
                            </ul>
                        </li>
                        <li>
                            <span><Image src="/images/Folder_light.png" alt="Description" width={20} height={20} /><a href="/pages/project">Project</a></span> 
                            <ul className='sub-menu-project'>
                                <li>test</li>
                            </ul>
                        </li>
                        <li>
                            <span>
                                Report
                            </span>
                        </li>
                    </ul>
                </div>
                <div>
                    <SignOut/>
                </div>
            </div>
        </>
    );

}
export default Navigation;