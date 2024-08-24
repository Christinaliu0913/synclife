"use client"

import dynamic from "next/dynamic";
import GoogleCalendarAuth from "../component/auth/googleCalendarAuth";

const CalendarComponent = dynamic(() => import("../component/calendar/0_calendar"), {
  ssr: false,
});

const Project = () => {
  return (
    <div className="main">
      <div>
        <GoogleCalendarAuth/>
      </div>
      <div>
        <CalendarComponent/>
      </div>
    </div>
  ); 
};

export default Project;