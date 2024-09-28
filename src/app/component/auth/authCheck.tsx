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
    useEffect (() =>{
    
        if(!loadingUser){
            if(currentUser){
                console.log('logged in',currentUser)
            }else{
                console.log('not log in')
                router.push('/');
            }
            
        }
        
    },[currentUser, loadingUser, router]);
    

    return <>{children}</>;
};

export default AuthCheck;