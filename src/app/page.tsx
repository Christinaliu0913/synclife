"use client"
import Image from "next/image";
import SignIn from "./component/auth/signIn";
import SignOut from "./component/auth/signOut";
import { useState } from "react";


export default function Home() {

  const [isAVisible, setIsAVisible] = useState(true);
  const [isBVisible, setIsBVisible] = useState(false);
  const [isCVisible, setIsCVisible] = useState(false);
  
  return (
    <>
      <nav className="hp-nav">
        
        <Image className="hp-navlogo" src='/images/logoLight.svg' alt="logo" width={100} height={50}></Image>
        
      </nav>
      <div className="hp-main">
        <div className="hp-logo" >
          <Image className="hp-logo-text" src='/images/logo-text.svg' alt="logo" width={400} height={200}></Image>
          <Image className="hp-logo-timer" src='/images/logo-timer.svg' alt="logo" width={90} height={90}></Image>
        </div>
          
          <div className="hp-main-subtitle"> Sync and manage your life plans.</div>
          <SignIn />
      </div>     

      <div className="hp-explain" >
        <div >
          <div className="explain-curve-background-up">
          </div>
          <div className="explain-curve-background">
            <h1>Less is more.</h1>
            <p > SyncLife saves you the time spent switching between different devices, helping you stay more focused and efficient!</p>
            <div className="explain-iconContainer">
              <Image  className="explain-icon" src='/images/clock.svg' alt="logo" width={70} height={70}></Image>
            </div>
          </div>
          <div className="explain-main">
            
            <div className={isAVisible? 'explain-button-active':'explain-button'  } 
              onClick={()=>{
                setIsAVisible(true);
                setIsBVisible(false);
                setIsCVisible(false);
              }}
              >Sync Google Calendar</div>
            <div className={isBVisible? 'explain-button-active':'explain-button'  } 
              onClick={()=>{
                setIsAVisible(false);
                setIsBVisible(true);
                setIsCVisible(false);
              }}
            >Manage Project</div>
            <div className={isCVisible? 'explain-button-active':'explain-button'  } 
              onClick={()=>{
                setIsAVisible(false);
                setIsBVisible(false);
                setIsCVisible(true);
              }}
            >Track Tasks</div>
            
          </div>
          <div>
            {isAVisible?
              (
                <div className="explain-main-content">
                  <div>
                  <Image  className="explain-content-img" src='/images/explain-calendar.svg' alt="logo" width={400} height={400} layout="responsive"></Image>
                  </div>
                  <div className="explain-content-text">
                    <h1>Sync your Google Calendar and create your own projects!</h1>
                    <p>Track all project timelines and tasks through Google Calendar to gain better control over your progress!</p>
                  </div>
                </div>
              ):(<></>)
              
            }

            {isBVisible?
              (
                <div className="explain-main-content">
                  <div className="explain-main-content-img">
                  <Image  className="explain-content-img" src='/images/explain-project.svg' alt="main explain" width={400} height={400} layout="responsive"></Image>
                  </div>
                  <div className="explain-content-text">
                    <h1>Manage your projects together with your team!</h1>
                    <p>Easily add members to manage projects together, categorize different tasks, assign them to team members, and track the status of each task for effective progress management!</p>
                  </div>
                </div>
              ):(<></>)
              
            }
            {isCVisible?
              (
                <div className="explain-main-content">
                  <div>
                  <Image  className="explain-content-img" src='/images/explain-task1.svg' alt="logo" width={400} height={400} layout="responsive"></Image>
                  </div>
                  <div className="explain-content-text">
                    <h1>Track both personal and team projects simultaneously!</h1>
                    <p>Manage personal tasks and project tasks simultaneously, effectively keeping track of all task timelines and schedules.</p>
                  </div>
                </div>
              ):(<></>)
              
            }
          </div>
          
        </div>
        <div className="hp-main-actionCall">
          <div style={{marginBottom:'20px'}}> Discover  how  SyncLife  can help  <br></br>
             you  build  a  better life</div>
              <SignIn/>
        </div>
            
        <div className="hp-footer"> 
          <div className="hp-footer-logo">
            <Image className="hp-navlogo" src='/images/logoLight.svg' alt="logo" width={130} height={65}></Image>
          </div>
          <div style={{marginTop:"50px"}}>
            
            <ul>
              <li>About Synclife</li>
              <li>contact us</li>
            </ul>
          </div>
          
        </div>
      </div>
      
    </>
    
  );
}
