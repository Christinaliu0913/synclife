import { GoogleAuthProvider } from 'firebase/auth/web-extension';
import { auth, googleProvider} from '../../../../firebase';
import { signInWithPopup } from 'firebase/auth'
import  Cookies  from  "js-cookie";
import Image from "next/image";
import { useEffect, useState } from 'react';


const GoogleCalendarAuth = () => {
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(()=>{
        //確認有沒有google token
        const token = Cookies.get('googleToken');
        if(token){
            setIsAuthorized(true);
        }
    },[])

    const handleConnectToGoolgeCalendar = async() => { 
        try{           
            //添加Google calendar的權限   
            googleProvider.addScope('https://www.googleapis.com/auth/calendar');

            const result = await signInWithPopup(auth, googleProvider);
            const credential = GoogleAuthProvider.credentialFromResult(result);
            const token = credential?.accessToken;
            alert('已授權成功！');
            if(token){
                Cookies.set('googleToken',token, {expires:7,path:'/'});
                setIsAuthorized(true);
                window.location.reload();
            }
        }catch(error){
            console.log('授權google calendar時錯誤',error);
        }
    }

    const handleRevokeGoogleCalendarAccess = async() => {
        const token = Cookies.get('googleToken');
        if(!token){
            console.error('沒有google token');
            return
        }
        try{
            const res = await fetch(`https://oauth2.googleapis.com/revoke?token=${token}`,{
                method: 'POST',
                headers: {
                    'Content-type':'application/x-www-form-urlencoded'
                }
            });
            if(res.ok){
                console.log('成功取消google calendar權限');
                Cookies.remove('googleToken',{path:'/'});
                setIsAuthorized(false);
                alert('已取消授權');
                window.location.reload();
            }else{
                console.log('請求取消google Calendar權限時失敗',res)
            }


        }catch(error){
            console.log('請求取消goolge calendar權限時出錯',error);
        }
    };

    return (
        <>
            {isAuthorized ?
                (
                    <button onClick={handleRevokeGoogleCalendarAccess}>
                        <Image src='/images/google.png' alt="" width={20} height={20}/>
                        unconnect Google Calendar</button>
                )
                :(
                    <button onClick={handleConnectToGoolgeCalendar}>
                        <Image src='/images/google.png' alt="" width={20} height={20}/>
                        Connect to Google Calendar</button>
                )
            }
            
        </>
    )
} 


export default GoogleCalendarAuth; 