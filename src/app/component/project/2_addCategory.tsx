
import { useAuth } from '../auth/authContext';
import { auth, db } from '../../../../firebase';
import { collection, doc, setDoc} from 'firebase/firestore';
import { Category } from '@/types/types';

import { AppDispatch} from '@/store';
import { useDispatch } from 'react-redux';
import { addCategories } from '@/features/categoriesSlice';

interface AddCategoryProps {
    projectId: string;
}


const AddCategory:React.FC<AddCategoryProps>= ({projectId}) => {
    
    const {currentUser,loadingUser} = useAuth();
    //Store data
    const dispatch:AppDispatch = useDispatch();

    const categoryTitle  = '';

    const handleAddCategory = async() => {
        if(!loadingUser && currentUser){
            const newDocRefCat = doc(collection(db, `project/${projectId}/category`));
            const newCategory:Category = {
                id: newDocRefCat.id,
                uid:currentUser?.uid,
                categoryTitle,
                createAt: new Date().toISOString(),
                projectId: projectId
            }
            dispatch(addCategories({newDocRefCat,newCategory}))
        }
    }
    return (
        <> 
            <div className='category-button' onClick={handleAddCategory}>
                +<div className='category-text'>Category</div>
            </div>
        </>
    )


}

export default AddCategory;