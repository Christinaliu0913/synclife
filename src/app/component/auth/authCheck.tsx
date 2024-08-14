"use client";
import { useAuth } from "./authContext";
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';
import { User } from 'firebase/auth';

interface AuthContextType{
    currentUser: User|null;
    loadingUser: boolean;
}

const AuthCheck =  ({ children }: { children: ReactNode }) => {
    const {currentUser, loadingUser}:AuthContextType = useAuth();
    const router = useRouter();
    console.log('check this function!!!!!!!!!!!!')
    useEffect (() =>{
    
        if(!loadingUser){
            if(currentUser){
                console.log('有登入呦！',currentUser)
            }else{
                console.log('確認一下not log in')
                router.push('/');
            }
            
        }
    
        
    },[currentUser, loadingUser, router]);
    

    return <>{children}</>;
};

export default AuthCheck;