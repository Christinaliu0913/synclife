"use client"

import dynamic from "next/dynamic";

const CalendarComponent = dynamic(() => import("../component/calendar/0_calendar"), {
  ssr: false,
});

const Project = () => {
  return (
    <div className="main">
      <div></div>
      <div>
        <CalendarComponent />
      </div>
    </div>
  ); 
};

export default Project;