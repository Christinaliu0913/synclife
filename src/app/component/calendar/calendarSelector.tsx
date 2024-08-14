import { useEffect, useState } from 'react';
import loadGoogleCalendarAPI from './1_useGoogleCalendarAPI';


interface CalendarSelectorProps{
    onSelectCalendar: (calendarId: string) => void;
}
interface Calendar{
    id: string;
    summary: string;
}
//可點選日曆類型
const CalendarSelector: React.FC<CalendarSelectorProps> = ({onSelectCalendar}) => {
    const [calendarsCategory, setCalendarsCategory] = useState<Calendar[]>([]);

    useEffect(()=>{

        const loadCalendars = async () => {
            const calendarList = await loadGoogleCalendarAPI();
            setCalendarsCategory(calendarList);
        }
        loadCalendars();

    },[])

    return (
      <select onChange={(e)=> onSelectCalendar(e.target.value)}>
        {calendarsCategory.map(calendar => (
            <option key={calendar.id} value={calendar.id}>
                {calendar.summary}
            </option>
        ))}
      </select>  
    );


}

export default CalendarSelector;