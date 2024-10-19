
import { setDeleteGoogleEvent, setGoogleEvents, setLoading } from "@/features/eventsSlice";
import { RootState } from "@/store";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";


//delete Google event
export const deleteGoogleEvent = async({eventId,dispatch}:{eventId:string,dispatch:any}) => {

    dispatch(setLoading(true));
   
    try{
        const { gapi } = await import('gapi-script');

        await gapi.client.calendar.events.delete({
            calendarId: 'primary',
            eventId: eventId,
        });
        dispatch(setDeleteGoogleEvent(eventId));
        
        console.log('刪除了！')
    }catch(error){
        console.error('刪除google日曆事件時出錯',error)
    }finally{
        dispatch(setLoading(false))
    }


 }