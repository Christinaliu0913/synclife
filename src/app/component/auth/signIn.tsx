'use client'
import { useState, useEffect } from "react";
import { auth, googleProvider} from '../../../../firebase'
import { GoogleAuthProvider } from "firebase/auth/web-extension";
import { signInWithPopup} from 'firebase/auth'
import { useAuth } from '../auth/authContext'
import { signOut } from "firebase/auth";
import { useRouter } from 'next/navigation'
import  SignOut from './signOut'
import  Cookies  from  "js-cookie";
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
            //添加Google calendar的權限
            googleProvider.addScope('https://www.googleapis.com/auth/calendar');
            const result = await signInWithPopup(auth, googleProvider);
            const credential = GoogleAuthProvider.credentialFromResult(result)
            const token = credential?.accessToken;
            console.log('loged in!');
            console.log('OAuth Token', token)
            if(token){
               Cookies.set('googleToken',token, {expires:7,path:'/'});
            }
            
            // const token = result.user.accessToken
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