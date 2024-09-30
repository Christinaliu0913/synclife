'use client'
import interactionPlugin from '@fullcalendar/interaction'
import { gapi } from 'gapi-script';
import { settingGoogleEvents } from './gapi/2_settingGoogleEvents';
import { AppDispatch } from '@/store';
import { useDispatch } from 'react-redux';
import { setGoogleEvents } from '@/features/eventsSlice';



const addEventToGoogleCalendar = async(eventData:any) => {
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;//設定使用者的時區
    console.log('eventid test',eventData.id)
    try{
        const eventResource: any = {
            summary: eventData.title,
            description: eventData.description,
            start:{},
            end:{}
        }
            
        if(eventData.checkAllDay){
            eventResource.start = {
                date: eventData.start,

            }
            eventResource.end = {
                date: eventData.end,
            }
        }else{
            const formattedStartDateTime = new Date(eventData.start).toISOString();
            const formattedEndDateTime = new Date(eventData.end).toISOString()
            eventResource.start = {
                dateTime: formattedStartDateTime,
                timeZone: userTimeZone,
            }
            eventResource.end = {
                dateTime: formattedEndDateTime,
                timeZone: userTimeZone,
            }
        }


        let res;

        if (eventData.id){
            res= await gapi.client.calendar.events.update({
                calendarId: 'primary',
                eventId: eventData.id,
                resource: eventResource,
            });
            
            console.log('google API response', res)
        }else{
            //沒有id添加event
            res = await gapi.client.calendar.events.insert({
                calendarId: 'primary',
                resource: eventResource,
            });
           
        }
        
        console.log('google API response', res)
        return {
            ...res.result,
            ...eventData,
            id: res.result?.id,
        };

    }catch(error){
        console.error('新增google日曆時出錯',error)
    }
    }
   


export default addEventToGoogleCalendar;