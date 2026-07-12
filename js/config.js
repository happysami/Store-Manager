const firebaseConfig = {
    apiKey: "AIzaSyAUvP68wr-fPfcSTIqHphxlAsktghIwfwU",
    authDomain: "hailu-store-tracker.firebaseapp.com",
    projectId: "hailu-store-tracker",
    storageBucket: "hailu-store-tracker.firebasestorage.app",
    messagingSenderId: "262051149803",
    appId: "1:262051149803:web:c6fc70a4e19a9495248bae",
    measurementId: "G-RDKWL34QGL"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

let inventory = [];
let editModeId = null;

const priceSuggestions = {
    "azzy 5L": { buy: 930, sell: 1000 },
    "azzy 1L": { buy: 800, sell: 850 },
    "azzy 2L": { buy: 900, sell: 950 },
    "azzy DW 5L": { buy: 1200, sell: 1300 },
    "Accessories": { buy: 3, sell: 10 }
};
