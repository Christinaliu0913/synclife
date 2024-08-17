'use client'
import { useAuth } from '../auth/authContext';
import SignOut from '../auth/signOut'


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
                        <li><img src="/images/Date_today.png" alt="" /><a href="/pages">Calendar</a> </li>
                        <li>
                            <span><img src="/images/check-contained.png" alt="" /> To do list</span> 
                            <ul className='sub-menu-project'>
                              <li>test</li>
                            </ul>
                        </li>
                        <li>
                            <span><img src="/images/Folder_light.png" alt="" /><a href="/pages/project">Project</a></span> 
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