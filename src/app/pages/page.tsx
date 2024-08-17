"use client"

import dynamic from "next/dynamic";

const Calendar = dynamic(() => import("../component/calendar/0_calendar"), {
  ssr: false,
});

const Project = () => {
  return (
    <div className="main">
      <div></div>
      <div>
        <Calendar />
      </div>
    </div>
  ); 
};

export default Project;