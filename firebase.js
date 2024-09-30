import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDePMfW6Q5jJc9gXaMOMeD2585yWZ-QMFI",
  authDomain: "synclife-8a268.firebaseapp.com",
  projectId: "synclife-8a268",
  storageBucket: "synclife-8a268.appspot.com",
  messagingSenderId: "390930633591",
  appId: "1:390930633591:web:d00b5ea7bf24ffa8b40772",
  measurementId: "G-HTT5NFJGZ1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
//google登入認證，封裝與google OAuth 2.0的交互
const googleProvider = new GoogleAuthProvider();

export {db, auth, googleProvider};
