"use client";
//認證現在User有沒有登入
import { createContext, ReactNode, useContext, useEffect,useState} from 'react';
import { auth } from '../../../../firebase';
import { User as FirebaseUser} from 'firebase/auth'
import { onAuthStateChanged, getAuth, setPersistence, browserLocalPersistence} from 'firebase/auth';
//User->firebase的用戶類型

interface User extends FirebaseUser{
    displayName: string | null;
}

interface AuthContextType{
    currentUser: User| null;
    loadingUser: boolean;

}


interface AuthProviderProps{
    children: ReactNode;
    loadingUser?: boolean;

}


//  傳遞用戶認證狀態
const AuthContext = createContext<AuthContextType|undefined>(undefined);

export const AuthProvider = ({children}:AuthProviderProps) =>{
    const [currentUser, setCurrentUser ] = useState<User | null>(null);
    const [loadingUser, setLaodingUser ] = useState<boolean>(true);

    useEffect(()=>{
        //認證
        const unsubscribe = onAuthStateChanged(auth, async (user) =>{

            setLaodingUser(false);
            if (user){
                setCurrentUser(user);
            }
            
            
        });
        //清理訂閱以免持續訂閱
        return () => unsubscribe();
    },[]);

    return (
        //上下文提供者組件
        <AuthContext.Provider value={{currentUser,loadingUser}}>
            {children}
        </AuthContext.Provider>
    );
};

//自訂Hook，useContext返回當前上下文的值
export const useAuth = ():AuthContextType => {
    const context = useContext(AuthContext);
    if (context == undefined){
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}