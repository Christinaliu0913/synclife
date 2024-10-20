"use client";

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setCalendars, setLoading, setGoogleEvents } from '../../../../features/eventsSlice'
import { EventTask, Task,Project, Event } from "@/types/types";
import { collection , getDocs, query, where } from "firebase/firestore";
import { db } from '../../../../../firebase';
import { settingGoogleEvents } from './2_settingGoogleEvents';


export const useFetchGoogleEvents = (token: string | undefined, projects: Project[],dispatch:any) => {


  
  useEffect(() => {
    if (!token) {
      console.error('Google token is undefined.');
      return;
    }
    //確認project已經載入
    
    const fetchEvents = async () => {
      if (typeof window === 'undefined') {
        console.error('Cannot fetch Google events on the server.');
        return;
      }
      if (projects === undefined || !Array.isArray(projects)) {
        dispatch(setLoading(true));
        return;
      }

      
      dispatch(setLoading(true));

      //取得google calendar授權並初始化
      try {
        const { gapi } = await import('gapi-script');

        await new Promise((resolve, reject) => {
          gapi.load('client', {
            callback: resolve,
            onerror: () => reject('GAPI client loading error'),
          });
        });
        //設置 Google token
        gapi.client.setToken({ access_token: token });

        await gapi.client.init({
          discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"],
        });

        // 調用 readGoogleEvents 函式
        const  allGoogleEvents  = await readGoogleEvents(gapi);

        // 將專案連結到事件上
        const updatedEvents = await mapEventsWithProjects(allGoogleEvents, projects);

        // 更新 Redux 狀態
        dispatch(setGoogleEvents(updatedEvents));
        //dispatch(setCalendars(calendars));
      } catch (error) {
        console.error('Error fetching Google events', error);
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchEvents();
  }, [token, projects, dispatch]);
};

// 讀取 Google 活動
async function readGoogleEvents(gapi: any) {
  const calendarList = await gapi.client.calendar.calendarList.list();
  const calendars = calendarList.result.items || [];
  
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
          description: event.description,
          taskType: 'googleEvent',
        }));
  
        allGoogleEvents = [...allGoogleEvents, ...colorTypeEvents];
      }
    }
  
  return  allGoogleEvents ;
}

// 卻任是否帶有project
async function mapEventsWithProjects(googleEvents: any[], projects: Project[]) {
  // 創一個map來儲存所有項目的task
  const projectTaskMap: Record<string, any[]> = {};

  for (const proj of projects) {
    const categoryQuery = query(collection(db, `project/${proj.id}/category`));
    const categorySnapshot = await getDocs(categoryQuery);

    for (const categoryDoc of categorySnapshot.docs) {
      const taskQuery = query(
        collection(db, `project/${proj.id}/category/${categoryDoc.id}/task`)
      );
      
      const taskSnapshot = await getDocs(taskQuery);
      projectTaskMap[proj.id] = taskSnapshot.docs.map((doc) => doc.data());
    }
  }
  console.log(projectTaskMap)

  //使用已經查少的task資料來更新googleEvents
  const mappedEvents = googleEvents.map(async (event) => {
      let projectId = '';
      let projectTitle = '';
      const calendarType = event.organizer.displayName;

      //在項目中看有沒有這個calendar.id的task
      for (const proj of projects){
          const relatedTasks = projectTaskMap[proj.id]?.filter((task) => task.calendarId === event.id)||[];
          if (relatedTasks.length > 0 ){
            const taskData = relatedTasks[0];
            projectId = taskData.projectId || '';
            projectTitle = proj.projectTitle || '';
          }
      }
      return {
        ...event,
        taskType: 'googleEvent',
        projectTitle: projectTitle,
        projectId: projectId,
        calendarType: calendarType,
      };
    })
  return Promise.all(mappedEvents);
}
