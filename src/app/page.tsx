import Image from "next/image";
import SignIn from "./component/auth/signIn";
import SignOut from "./component/auth/signOut";


export default function Home() {
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
          
          <div className="hp-main-subtitle"> 同步管理你的生活計畫</div>
          <SignIn />
      </div>     
    </>
    
  );
}
