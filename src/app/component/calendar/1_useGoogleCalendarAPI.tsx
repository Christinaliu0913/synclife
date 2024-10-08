import { useAuth } from '../auth/authContext';
import { gapi } from 'gapi-script';
import Cookies from 'js-cookie';
import { useState, useEffect } from 'react'


const useGoogleCalendarAPI = () => {
    const [googleEvents, setGoogleEvents] = useState<any[]>([]);
    const token = Cookies.get('googleToken')
    //儲存calendar列表
    const [googleCalendars, setGoogleCalendars] = useState<any[]>([]);

    useEffect(()=>{
        if(token){
            console.log('有跑initClient');
            try{
                gapi.load('client',()=>{
                    gapi.client.setToken({access_token:token});
                    const initClient = async() => {
                        gapi.client.init({
                            discoveryDocs:["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"],
                        }).then(() => {
                            readEvent();
                        }).catch((error:any)=>{
                            console.log('initClient的錯誤', error);
                        });
                    } ;
                    initClient();
                    console.log('有跑到這裡')
                })
            }catch(error){
                console.error('loading GAPI的時候有錯誤',error)
            }
        }else{
            return;
        }
    },[token])
   
    
    const readEvent = async () =>{
        try{
            
            const calendarList = await gapi.client.calendar.calendarList.list()
            const calendars = calendarList.result.items || [];
            setGoogleCalendars(calendars);//設置日曆列表
            let allEvents: any[]= []
    
            for(const calendar of calendars){
                if(calendar.accessRole ==='owner' || calendar.accessRole ==='writer'){
                    const eventResponse =await gapi.client.calendar.events.list({
                        calendarId: calendar.id,
                        timeMin: '2024-01-01T00:00:00Z',
                        showDeleted: false,
                        singleEvents: true,
                        //maxResults: 10,
                        orderBy: 'startTime'
                    });
                    const events = eventResponse.result.items || [];
                    //加color到event中
                    const colorEvents = events.map((event: any) => ({
                        ...event,
                        color: calendar.backgroundColor
                    }))
                    
                    allEvents = [...allEvents,...colorEvents]
                    console.log('現在我想測試這個',allEvents)
            
                }
            };
            

            
            setGoogleEvents(allEvents);
            
        }catch(error){
            console.error('fetch google calendar的錯誤',error);
        }
        
    };
    
    return {googleEvents, googleCalendars};
    
}   

export default useGoogleCalendarAPI;