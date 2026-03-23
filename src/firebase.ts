import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// Konfigurasi Firebase dari google-services.json Anda
const firebaseConfig = {
  apiKey: "AIzaSyDTXmT_oLiBof3NTE5_mvup_ZNLf8kj6TY",
  projectId: "djonly-kansil",
  databaseURL: "https://djonly-kansil-default-rtdb.asia-southeast1.firebasedatabase.app",
  storageBucket: "djonly-kansil.firebasestorage.app",
  // App ID web placeholder karena google-services.json aslinya untuk Android
  appId: "1:150182611621:web:placeholder123456" 
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
