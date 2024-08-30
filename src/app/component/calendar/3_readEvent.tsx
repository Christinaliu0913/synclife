
import { gapi } from 'gapi-script';
import { collection, query, where, getDocs, doc,setDoc,updateDoc } from 'firebase/firestore';
import { db } from '../../../../firebase';
;

const readEvent = async (currentUser:any,tasks:any) =>{

    try{
        
        const calendarList = await gapi.client.calendar.calendarList.list()
        const calendars = calendarList.result.items || [];
        let allEvents: any[]= []

        //set 所有events
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
                //console.log('現在我想測試這個',allEvents)
            }
        };
        
        //確認每一個事件是否有加入project(task的calendarId有沒有符合event的calendarId)
        if(currentUser){
            const projectQuery= query(collection(db, 'project'),where('projectMember', 'array-contains',currentUser.email));
            const projectSnapshot = await getDocs(projectQuery);

            const projectWithAccess = projectSnapshot.docs.map(doc => ({
                id: doc.id,
                title: doc.data().projectTitle,
                ...doc.data()
            }));
            console.log('這是這個人的project',projectWithAccess)

            //確認每個event的內容
            const eventsWithProject = await Promise.all(
                allEvents.map(async event => {
                    let projectId = '';//默認沒有projectId
                    const calendarType = event.organizer.displayName;
                    let projectTitle = '';
                    //console.log('eventId',event.id)
                    //在項目中看有沒有這個calendar.id的task
                    for(const proj of projectWithAccess){
                        const categoryQuery = query(collection(db, `project/${proj.id}/category`));
                        const categorySnapshot = await getDocs(categoryQuery);

                        for(const categoryDoc of categorySnapshot.docs){
                            const taskQuery = query
                                (collection(db, `project/${proj.id}/category/${categoryDoc.id}/task`),
                                where('calendarId', '==', event.id)
                            );
                            const taskSnapshot = await getDocs(taskQuery);

                            if(!taskSnapshot.empty){
                                //console.log(' !!!!!!!!有taskproject',taskSnapshot)
                                const taskData = taskSnapshot.docs[0].data();
                                projectId = taskData.projectId || projectId;
                                projectTitle = proj.title ||'';
                                //console.log('!!!!!!!!專案名稱',projectTitle)
                            }
                            //console.log(' non taskproject',taskSnapshot)
                        }
                        
                        
                    }  

                    return {
                        ...event,
                        taskType: "event",
                        projectTitle,
                        projectId,
                        calendarType,
                    };
                })
            );

            return [...eventsWithProject,...tasks];
        }

        
        
        
    }catch(error){
        console.error('fetch google calendar的錯誤',error);
        return [];
    }

    
};

export default readEvent;