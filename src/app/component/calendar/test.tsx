
import interactionPlugin from '@fullcalendar/interaction'
import { gapi } from 'gapi-script';
import Cookies from 'js-cookie';
//changeInfo接受一個參數


const addEventToGoogleCalendar = async(addInfo:any, events: any [] ,setEvents: (events:any[])=> void) => {
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    //const newEvent = addInfo.event;
    const eventTitle = prompt('event title:')
        if (eventTitle){
            const newEvent = {
                title: eventTitle,
                start: addInfo.dateStr,
                end:addInfo.dateStr,
                allDay: addInfo.allDay,
            };
            
            try{
                //fetch google並添加事件
                const res = await gapi.client.calendar.events.insert({
                    calendarId: 'primary',
                    resource:{
                        summary: newEvent.title,
                        start: {
                            dateTime: new Date(newEvent.start).toISOString(),
                            //設置如果沒有dateTime只有date的選項
                            timeZone: userTimeZone,
                        },
                        end:{
                            dateTime: new Date(newEvent.end).toISOString(),
                            timeZone: userTimeZone,
                        }
                    }
                });
                
                const createdEvent = {
                    ...newEvent,
                    id: res.result.id, 
                };

                setEvents([...events,createdEvent]);
                
            

            }catch(error){
                console.error('新增google日曆時出錯',error)
            }
        }
   
}

export default addEventToGoogleCalendar;