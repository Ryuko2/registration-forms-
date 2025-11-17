// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBVVBJ4RylwN5pHmggd7aXKhVD-R9cIW7M",
  authDomain: "lj-services-group.firebaseapp.com",
  databaseURL: "https://lj-services-group-default-rtdb.firebaseio.com",
  projectId: "lj-services-group",
  storageBucket: "lj-services-group.firebasestorage.app",
  messagingSenderId: "697032093546",
  appId: "1:697032093546:web:950d395f0846c65a9eff13",
  measurementId: "G-179NM33MCX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
