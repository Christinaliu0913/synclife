

export const settingGoogleEvents = async(calendars: any[], gapi: any) => {
  
    let allGoogleEvents: any[] = [];
    for (const calendar of calendars) {
      if (calendar.accessRole === 'owner' || calendar.accessRole === 'writer') {
        const eventResponse = await gapi.client.calendar.events.list({
          calendarId: calendar.id,
          timeMin: '2024-9-28T00:00:00Z',
          showDeleted: false,
          singleEvents: true,
          orderBy: 'startTime',
        });
        const events = eventResponse.result.items || [];
        const colorTypeEvents = events.map((event: any) => ({
          ...event,
          color: calendar.backgroundColor,
          taskType: 'googleEvent',
        }));
  
        allGoogleEvents = [...allGoogleEvents, ...colorTypeEvents];
      }
    }
    console.log('12312312312',allGoogleEvents)
    return { allGoogleEvents, calendars };
  }