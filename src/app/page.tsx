import Image from "next/image";
import SignIn from "./component/auth/signIn";
import SignOut from "./component/auth/signOut";


export default function Home() {
  return (
    <>
      <nav>
        <div className="hp-nav"></div>
      </nav>
      <main>
        <SignIn/>
      </main>    
    </>
    
  );
}
