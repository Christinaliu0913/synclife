
import Navigation from '../component/nav/nav'
import type { Metadata } from "next";
import Calendar from "../component/calendar/0_calendar";
import "./pages.scss";
import { useState } from 'react';
import React from 'react';

export const metadata: Metadata = {
    title: "Create Next App",
    description: "Generated by create next app",
  };



export default function PagesLayout({children,}:Readonly<{children: React.ReactNode;}>) {




    return (
      <>
        <div className='pages-container'>  
          <div className='nav'>
           <Navigation/>
          </div>
        
        <div className='main'>
          {children}
        </div>
        
        </div>
      </>
    );
  }
  