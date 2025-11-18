// ============================================
// FIREBASE CONFIGURATION
// LJ Services Ticket System
// ============================================

// Your Firebase configuration (from Firebase console)
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

// ============================================
// INITIALIZE FIREBASE (compat version)
// ============================================

// This uses the global "firebase" object from the CDN scripts in index.html
firebase.initializeApp(firebaseConfig);

// Core services
const auth = firebase.auth();
const database = firebase.database();

// ============================================
// MICROSOFT LOGIN VIA FIREBASE AUTH
// (You still need to configure Microsoft provider in Firebase console)
// ============================================

const provider = new firebase.auth.OAuthProvider('microsoft.com');
provider.setCustomParameters({
  tenant: '3de3b465-7bd9-4050-9925-ffcb715a664e', // your tenant ID
  prompt: 'select_account'
});

// ============================================
// EXPOSE FOR app.js
// ============================================

window.firebaseAuth = auth;
window.firebaseDatabase = database;
window.microsoftProvider = provider;

console.log('✅ Firebase initialized successfully!');
console.log('📡 Database:', firebaseConfig.databaseURL);
