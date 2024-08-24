'use client'
import { useEffect } from "react";
import { auth, googleProvider} from '../../../../firebase'
import { signInWithPopup} from 'firebase/auth'
import { useAuth } from '../auth/authContext'
import { useRouter } from 'next/navigation'
import  SignOut from './signOut'
import Image from "next/image";



const SignIn = () =>{
    const {currentUser} = useAuth();
    const router = useRouter();
    console.log(currentUser);

    useEffect(()=>{
        //先確認有沒有登入，沒有的話就直接到操作頁面
        if(currentUser){
            console.log('有登入所以導入到操作頁面');
            router.push('/pages');
        }
    },[currentUser,router])

    const signWithGoogle = async() => {
        try{
            const result = await signInWithPopup(auth, googleProvider);
            console.log('登入資訊',result)
        }catch(error){
            console.error('error loggin in with Goolge:',error);
        }
    }



    return(
        <>
            {currentUser ? (
                <div>  
                    <button onClick={()=>router.push('/pages')}
                    >start!</button>
                </div>
                ) 
                : 
                (<button onClick={signWithGoogle}>
                    <Image className='signup-img'src='/images/google.png' alt="SignIn" width={20} height={20}/>Continue with Google
                </button>)
            } 
            {currentUser ? (
                <SignOut/>
            ): <></>}
        </>
    );
}

export default SignIn;