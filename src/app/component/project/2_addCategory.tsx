
import { useAuth } from '../auth/authContext';
import { auth, db } from '../../../../firebase';
import { collection, doc, setDoc} from 'firebase/firestore';
import { useState } from 'react'
import Image from 'next/image';

const AddCategory = ({projectId, setCategories, categories}) => {
    const {currentUser,loadingUser} = useAuth();
    const categoryTitle  = '';

    const handleAddCategory = async() => {
        if(!loadingUser && currentUser){
            try{
                const newDocRef = doc(collection(db, `project/${projectId}/category`));
                const newCategory = {
                    uid:
                        currentUser?.uid,
                        categoryTitle,
                        createAt: new Date().toISOString(),
                        projectId: projectId
                }
                await setDoc(newDocRef, newCategory);

                setCategories(categories => (categories? [...categories,{id: newDocRef.id,...newCategory}]:[{id: newDocRef.id,...newCategory}]));
                
            }catch(error){
                console.log('fetch category的時候錯誤',error);
            }
        }

    }
    
    return (

    <> 
    <button onClick={handleAddCategory}>
        <Image src="/images/add.png" alt="Add Task" width={20} height={20} />Add Category
    </button>
    </>
    )


}

export default AddCategory;