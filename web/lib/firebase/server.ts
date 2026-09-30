import { initializeApp, cert, getApps, getApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import fs from "fs";
import path from "path";

let adminApp: any = null;

export function getFirebaseAdmin() {
  if (adminApp) {
    return {
      app: adminApp,
      auth: getAuth(adminApp),
      db: getFirestore(adminApp),
      storage: getStorage(adminApp).bucket("logicore-center.firebasestorage.app"),
    };
  }

  const apps = getApps();
  const defaultApp = apps.find((a) => a.name === "[DEFAULT]") || apps[0];

  if (defaultApp) {
    adminApp = defaultApp;
    return {
      app: adminApp,
      auth: getAuth(adminApp),
      db: getFirestore(adminApp),
      storage: getStorage(adminApp).bucket("logicore-center.firebasestorage.app"),
    };
  }

  let credential = undefined;
  const projectId = process.env.FB_ADMIN_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "logicore-center";

  // 1. Check for Base64 encoded Service Account JSON (safest across all cloud platforms)
  if (process.env.FB_SERVICE_ACCOUNT_B64) {
    try {
      const decoded = JSON.parse(Buffer.from(process.env.FB_SERVICE_ACCOUNT_B64, "base64").toString("utf8"));
      credential = cert(decoded);
    } catch (e) {
      console.warn("Could not parse FB_SERVICE_ACCOUNT_B64:", e);
    }
  }

  // 2. Check individual environment variables
  if (!credential) {
    const clientEmail = process.env.FB_ADMIN_CLIENT_EMAIL || process.env.FIREBASE_CLIENT_EMAIL;
    let privateKey = process.env.FB_ADMIN_PRIVATE_KEY || process.env.FIREBASE_PRIVATE_KEY;


    if (clientEmail && privateKey) {
      if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
        privateKey = privateKey.slice(1, -1);
      }
      privateKey = privateKey.replace(/\\n/g, "\n");

      try {
        credential = cert({
          projectId,
          clientEmail,
          privateKey,
        });
      } catch (e) {
        console.warn("Could not parse Admin Private Key from environment:", e);
      }
    }
  }


  if (!credential) {
    const saPath = path.resolve("./serviceAccountKey.json");
    if (fs.existsSync(saPath)) {
      try {
        const sa = JSON.parse(fs.readFileSync(saPath, "utf8"));
        credential = cert(sa);
      } catch {
        // fallback to ambient
      }
    }
  }

  try {
    adminApp = initializeApp({
      ...(credential ? { credential } : {}),
      projectId,
      storageBucket: "logicore-center.firebasestorage.app",
    });
  } catch (err: any) {
    const refreshed = getApps();
    adminApp = refreshed.find((a) => a.name === "[DEFAULT]") || refreshed[0];
    if (!adminApp) throw err;
  }

  return {
    app: adminApp,
    auth: getAuth(adminApp),
    db: getFirestore(adminApp),
    storage: getStorage(adminApp).bucket("logicore-center.firebasestorage.app"),
  };
}
