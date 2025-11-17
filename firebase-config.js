// ============================================
// FIREBASE CONFIGURATION
// LJ Services Group Management Dashboard
// ============================================

// Firebase web configuration for LJ Services Group
const firebaseConfig = {
    apiKey: "AIzaSyAFcJLN8uc29vK6IPPsmEkNE-KRYDsrGV4",
    authDomain: "lj-services-group.firebaseapp.com",
    databaseURL: "https://lj-services-group-default-rtdb.firebaseio.com",
    projectId: "lj-services-group",
    storageBucket: "lj-services-group.firebasestorage.app",
    messagingSenderId: "617943691986",
    appId: "1:617943691986:web:ed3c18f02d68fb8c12cb96"
};

// Initialize Firebase (compat SDK)
firebase.initializeApp(firebaseConfig);

// Realtime Database + Auth instances
const auth = firebase.auth();
const database = firebase.database();

// Configure Microsoft Auth provider via Firebase
const provider = new firebase.auth.OAuthProvider('microsoft.com');
provider.setCustomParameters({
    prompt: 'select_account'
});

// Export for global usage
window.firebaseAuth = auth;
window.firebaseDatabase = database;
window.microsoftProvider = provider;

console.log('✅ Firebase initialized successfully!');
console.log('📡 Database:', firebaseConfig.databaseURL);
