"use client"
import { signOut } from "firebase/auth";
import { auth } from '../../../../firebase'
import Cookies from 'js-cookie'
import { useRouter } from 'next/navigation';
import { useAuth } from "./authContext";
import { useEffect } from "react";


const SignOut = () => {
    const { currentUser,loadingUser } = useAuth();
    const router = useRouter()
    const logOutwithGoogle = async()=> {
        try{
            await signOut(auth);            
            Cookies.remove('googleToken',{path:'/'});
            console.log('已登出');
            router.push('/');
        }catch(error){
            console.error('Error logging out',error);
        }
    }


    return(
        <>
        <button className="hp-signOut-button" onClick={logOutwithGoogle}>Log out</button>
        </>
    )

}

export default SignOut;