"use client"

import dynamic from "next/dynamic";
import GoogleCalendarAuth from "../component/auth/googleCalendarAuth";
import "./pages.scss";

const CalendarComponent = dynamic(() => import("../component/calendar/0_calendar"), {
  ssr: false,
});

const Project = () => {
  return (
    <>
      <div>
        <GoogleCalendarAuth/>
      </div>
      <div>
        <CalendarComponent/>
      </div>
   </>
  ); 
};

export default Project;