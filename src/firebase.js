// src/firebase.js
// Firebase Analytics setup for Ocean Adventure
// ---------------------------------------------------------------------------
// SETUP: Replace the firebaseConfig values with your own from
// Firebase console → Project Settings → General → Your apps → web app
// ---------------------------------------------------------------------------

import { initializeApp } from "firebase/app";
import { getAnalytics, logEvent as firebaseLogEvent, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCSK6mzWkMskEzmoOlMQmCKMRfnOrfcgFM",
  authDomain: "polynesian-wayfinding-97d64.firebaseapp.com",
  projectId: "polynesian-wayfinding-97d64",
  storageBucket: "polynesian-wayfinding-97d64.firebasestorage.app",
  messagingSenderId: "1033974689241",
  appId: "1:1033974689241:web:ffaea5c6d04d0028453dc8",
  measurementId: "G-BRPV6XV197"
};

const app = initializeApp(firebaseConfig);

// Analytics degrades gracefully if blocked or unavailable
let analytics = null;
isSupported().then(supported => {
  if (supported) {
    analytics = getAnalytics(app);
    firebaseLogEvent(analytics, "app_opened");
  }
}).catch(() => {});

// Safe wrapper — logs to console if analytics not ready
export function logEvent(eventName, params = {}) {
  if (analytics) {
    firebaseLogEvent(analytics, eventName, params);
  } else {
    console.log(`[Analytics] ${eventName}`, params);
  }
}

export const analyticsEvents = {
  voyageStarted:      (name)            => logEvent("voyage_started",      { player_name: name }),
  moduleStarted:      (moduleNum)       => logEvent("module_started",      { module: moduleNum }),
  moduleCompleted:    (moduleNum)       => logEvent("module_completed",    { module: moduleNum }),
  bridgeReached:      (moduleNum)       => logEvent("bridge_reached",      { module: moduleNum }),
  activityCorrect:    (moduleNum, step) => logEvent("activity_correct",    { module: moduleNum, step }),
  activityWrong:      (moduleNum, step) => logEvent("activity_wrong",      { module: moduleNum, step }),
  bagOpened:          ()                => logEvent("bag_opened"),
  finalVoyageStarted: ()                => logEvent("final_voyage_started"),
  voyageCompleted:    ()                => logEvent("voyage_completed"),
  appCrashed:         (errorMsg)        => logEvent("app_crashed",         { error: errorMsg?.slice(0, 100) }),
  feedbackOpened:     ()                => logEvent("feedback_opened"),
};