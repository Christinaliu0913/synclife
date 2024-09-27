"use client";

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setEvents, setCalendars, setLoading } from '../../../../features/eventsSlice'
import { EventTask, Task,Project, Event } from "@/types/types";
import { collection , getDocs, query, where } from "firebase/firestore";
import { db } from '../../../../../firebase';


export const useFetchGoogleEvents = (token: string | undefined, projects: Project[]) => {

  const dispatch = useDispatch();
  
  useEffect(() => {
    if (!token) {
      console.error('Google token is undefined.');
      return;
    }

    const fetchEvents = async () => {
      if (typeof window === 'undefined') {
        console.error('Cannot fetch Google events on the server.');
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
        const { allGoogleEvents, calendars } = await readGoogleEvents(gapi);

        // 將專案連結到事件上
        const updatedEvents = await mapEventsWithProjects(allGoogleEvents, projects);

        // 更新 Redux 狀態
        dispatch(setEvents(updatedEvents));
        dispatch(setCalendars(calendars));
      } catch (error) {
        console.error('Error fetching Google events', error);
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchEvents();
  }, [token, dispatch, projects]);
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
        timeMin: '2024-01-01T00:00:00Z',
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
  return { allGoogleEvents, calendars };
}

// 卻任是否帶有project
async function mapEventsWithProjects(googleEvents: any[], projects: Project[]) {
  
  return Promise.all(
    googleEvents.map(async (event) => {
      let projectId = '';
      let projectTitle = '';
      const calendarType = event.organizer.displayName;

      //在項目中看有沒有這個calendar.id的task
      for (const proj of projects) {
        const categoryQuery = query(collection(db, `project/${proj.id}/category`));
        const categorySnapshot = await getDocs(categoryQuery);

        for (const categoryDoc of categorySnapshot.docs) {
          const taskQuery = query(
            collection(db, `project/${proj.id}/category/${categoryDoc.id}/task`),
            where('calendarId', '==', event.id)
          );
          const taskSnapshot = await getDocs(taskQuery);

          if (!taskSnapshot.empty) {
            const taskData = taskSnapshot.docs[0].data();
            projectId = taskData.projectId || projectId;
            projectTitle = proj.projectTitle || '';
          }
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
  );
}
