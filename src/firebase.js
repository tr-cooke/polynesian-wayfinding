// src/firebase.js
// Firebase Analytics setup for Ocean Adventure
// ---------------------------------------------------------------------------
// SETUP INSTRUCTIONS (one-time):
// 1. Go to console.firebase.google.com → your project → Project Settings → General
// 2. Scroll to "Your apps" → select your web app → copy the firebaseConfig object
// 3. Paste the values into the config below, replacing each placeholder
// 4. In Firebase console → Analytics → enable Google Analytics if not already on
// ---------------------------------------------------------------------------
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCSK6mzWkMskEzmoOlMQmCKMRfnOrfcgFM",
  authDomain: "polynesian-wayfinding-97d64.firebaseapp.com",
  projectId: "polynesian-wayfinding-97d64",
  storageBucket: "polynesian-wayfinding-97d64.firebasestorage.app",
  messagingSenderId: "1033974689241",
  appId: "1:1033974689241:web:ffaea5c6d04d0028453dc8",
  measurementId: "G-BRPV6XV197"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialise — analytics may not be supported in all environments (e.g. localhost
// with ad blockers), so we degrade gracefully rather than crashing.
let analytics = null;

const app = initializeApp(firebaseConfig);

isSupported().then(supported => {
  if (supported) {
    analytics = getAnalytics(app);
    firebaseLogEvent(analytics, "app_opened");
  }
}).catch(() => {
  // Analytics blocked or unavailable — continue silently
});

// ---------------------------------------------------------------------------
// Wrapper — safe to call from anywhere. If analytics isn't ready (localhost,
// ad blocker, config not filled in) it logs to the console instead.
// ---------------------------------------------------------------------------
export function logEvent(eventName, params = {}) {
  if (analytics) {
    firebaseLogEvent(analytics, eventName, params);
  } else {
    console.log(`[Analytics] ${eventName}`, params);
  }
}

// ---------------------------------------------------------------------------
// Named events — call these at the right moments in App.jsx
// ---------------------------------------------------------------------------

// Called when the player enters their name and starts the voyage
export const analyticsEvents = {
  voyageStarted:      (name)         => logEvent("voyage_started",        { player_name: name }),
  moduleStarted:      (moduleNum)    => logEvent("module_started",        { module: moduleNum }),
  moduleCompleted:    (moduleNum)    => logEvent("module_completed",      { module: moduleNum }),
  bridgeReached:      (moduleNum)    => logEvent("bridge_reached",        { module: moduleNum }),
  activityCorrect:    (moduleNum, step) => logEvent("activity_correct",   { module: moduleNum, step }),
  activityWrong:      (moduleNum, step) => logEvent("activity_wrong",     { module: moduleNum, step }),
  bagOpened:          ()             => logEvent("bag_opened"),
  finalVoyageStarted: ()             => logEvent("final_voyage_started"),
  voyageCompleted:    ()             => logEvent("voyage_completed"),
  appCrashed:         (errorMsg)     => logEvent("app_crashed",           { error: errorMsg?.slice(0, 100) }),
  feedbackOpened:     ()             => logEvent("feedback_opened"),
};
