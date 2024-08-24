
import { gapi } from 'gapi-script';
import { useState} from 'react'
import Cookies from 'js-cookie';

const readEvent = async () =>{
    try{
        const calendarList = await gapi.client.calendar.calendarList.list()
        const calendars = calendarList.result.items || [];
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
                
                allEvents = [...allEvents,...events]
                console.log('現在我想測試這個',allEvents)
            }
        };
        
        return allEvents;
        
    }catch(error){
        console.error('fetch google calendar的錯誤',error);
        return [];
    }

    
};

export default readEvent;