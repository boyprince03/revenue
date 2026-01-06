// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// 修改標記：若要使用 analytics 需引入，或直接註解掉以免報錯
// import { getAnalytics } from "firebase/analytics"; 

const firebaseConfig = {
  apiKey: "AIzaSyCIcAZiHaF11h6HxSxYbPaG8CafX7xSVig",
  authDomain: "divvy-app-e4565.firebaseapp.com",
  projectId: "divvy-app-e4565",
  storageBucket: "divvy-app-e4565.firebasestorage.app",
  messagingSenderId: "1098437381330",
  appId: "1:1098437381330:web:7811b086b7bbc37ce8710b",
  measurementId: "G-Z8KCWD3P9M"
};

const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app); // 修改標記：暫時註解掉，因為上方沒有 import 會導致崩潰
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export { auth, db, googleProvider };