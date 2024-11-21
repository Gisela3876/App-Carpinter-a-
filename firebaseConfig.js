// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAlJQy9VTCSrgB_YIb4sLtSkK2kpIGPvTw",
  authDomain: "appcarpinteria-ced37.firebaseapp.com",
  projectId: "appcarpinteria-ced37",
  storageBucket: "appcarpinteria-ced37.firebasestorage.app",
  messagingSenderId: "845829809027",
  appId: "1:845829809027:web:df26e44cfdc437bec90cb6",
  measurementId: "G-WCQYG2C0RD"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

isSupported().then((supported) => {
  if (supported) {
    getAnalytics(app);
  }
});

export { db };
