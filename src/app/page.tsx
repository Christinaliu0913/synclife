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
          <Image src='/images/logo.svg' alt="logo" width={400} height={200}></Image>
          <div className="hp-main-subtitle"> 同步管理你的生活計畫</div>
          <SignIn />
      </div>     
    </>
    
  );
}
