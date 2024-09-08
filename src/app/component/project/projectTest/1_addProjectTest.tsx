import { Dispatch, SetStateAction } from 'react';
import { Project } from '@/types/types';
import { auth, db } from '../../../../../firebase';
import { collection, doc, setDoc} from 'firebase/firestore';
import { useAuth } from '../../auth/authContext';
import { useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { useDispatch } from 'react-redux';
import { addProjects } from '@/features/projectsSlice';

const AddProjectTest = () => {

    //Store data
    const dispatch:AppDispatch = useDispatch();

    //project data
    const {currentUser,loadingUser} = useAuth();
    const projectTitle = '';
    const projectStatus = 'Unstarted';
    const projectMember: string[] = currentUser && currentUser.email ? [currentUser.email] : [];
    const projectDateStart = new Date().toISOString();//應該直接設置今天
    const projectDateEnd = '';
    const projectOwner: string | undefined = currentUser?.email ?? undefined;
    const projectColor =  '';



    //新增一個project
    const handleAddProject = async() =>{
        if(!loadingUser){
            if(currentUser){
                const newDocRef = doc(collection(db, 'project'));
                const newProject:Project = {
                    id: newDocRef.id,
                    uid:currentUser.uid,
                    projectTitle,
                    projectColor,
                    projectStatus,
                    projectMember,
                    projectDateStart,
                    projectDateEnd,
                    projectOwner,
                    createdAt: new Date().toISOString()
                }
                
                dispatch(addProjects({newDocRef, newProject}));
            }
        }
        return;
    }

    
    return(
        <> 
            <button className='project-addProject' onClick={handleAddProject}>
                <span>+</span>
            </button>

        </>
    )   

}

export default AddProjectTest;