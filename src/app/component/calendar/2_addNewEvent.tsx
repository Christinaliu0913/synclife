'use client'
import interactionPlugin from '@fullcalendar/interaction'
import { gapi } from 'gapi-script';

//changeInfo接受一個參數
interface EventData {
    title: string;
    id: string|null;
    start: string;
    end: string;
    checkAllDay: boolean;
    calendar: string;
    description: string;
    newProject: string|null;

}

const addEventToGoogleCalendar = async(eventData:EventData) => {
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
            ...eventData,
            id: res.result.id
        };

    }catch(error){
        console.error('新增google日曆時出錯',error)
    }
    }
   


export default addEventToGoogleCalendar;