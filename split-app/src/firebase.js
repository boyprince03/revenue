// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// 修改標記：若要使用 analytics 需引入，或直接註解掉以免報錯
// import { getAnalytics } from "firebase/analytics"; 

const firebaseConfig = {
  apiKey: "AIzaSyAyxbZQWGHISHK-gumMQuHnzhOTQoS5hgA",
  authDomain: "device-streaming-e921c475.firebaseapp.com",
  projectId: "device-streaming-e921c475",
  storageBucket: "device-streaming-e921c475.firebasestorage.app",
  messagingSenderId: "303515436841",
  appId: "1:303515436841:web:01c9b39cd66b14dea5d938",
  measurementId: "G-ECLQ35FTRB"
};

const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app); // 修改標記：暫時註解掉，因為上方沒有 import 會導致崩潰
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export { auth, db, googleProvider };