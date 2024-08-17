import { auth, db } from '../../../../firebase';
import { collection, doc, setDoc} from 'firebase/firestore';
import { useAuth } from '../auth/authContext';



const AddTask = ({categoryId,setTasks,tasks,projectId}) => {
    const {currentUser,loadingUser} = useAuth();
    const taskTitle = '';
    const taskStatus = 'unstarted';
    const taskAssign = '';
    const taskDescription = '';
    const taskDate = new Date().toISOString();//應該直接設置今天
    const taskOwnner = currentUser?.email;
    
    
    console.log('checasdfasdfadfilllll',projectId)
    

    //新增一個Task
    const handleAddTask = async() => {
        if(!loadingUser){
            if(currentUser){
                const newDocRef = doc(collection(db, `project/${projectId}/category/${categoryId}/task`));
                const newTask = {
                    uid:
                        currentUser.uid,
                        taskTitle,
                        taskStatus,
                        taskAssign,
                        taskDate,
                        taskDescription,
                        taskOwnner,
                        createdAt: new Date().toISOString(),
                        projectId: projectId
                }
                await setDoc(newDocRef, newTask)
                console.log('已新增一個task了', newDocRef.id,`project/${projectId}/category/${categoryId}/task`)

                setTasks(tasks=> (tasks? [...tasks,{id:newDocRef.id,...newTask}]: [{id:newDocRef.id, ...newTask}]));
            }
            console.log('no currentUser')
        }
    };

    return (
        <>
            <button onClick={handleAddTask}>
            <img src="/images/add.png" alt="" />
            Add Task
            </button>
        </>
    )
}

export default AddTask;