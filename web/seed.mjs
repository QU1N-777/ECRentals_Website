import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

const credentialPath = path.resolve("./serviceAccountKey.json");
let serviceAccount = null;

if (fs.existsSync(credentialPath)) {
  serviceAccount = JSON.parse(fs.readFileSync(credentialPath, "utf-8"));
}

if (!serviceAccount && !process.env.FIREBASE_PROJECT_ID) {
  console.error("Missing Firebase configuration. Please place serviceAccountKey.json in the web directory or provide FIREBASE_PROJECT_ID in .env.local");
  process.exit(1);
}

const bucketName = serviceAccount ? `${serviceAccount.project_id}.firebasestorage.app` : (process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || `${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.firebasestorage.app`);

initializeApp({
  credential: serviceAccount ? cert(serviceAccount) : cert({
    projectId: process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  }),
  storageBucket: bucketName
});

const db = getFirestore();
const storage = getStorage().bucket();

function getPublicUrl(bucket, filePath) {
  return `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(filePath)}?alt=media`;
}

async function uploadImages(imagesDir, folderPrefix = "") {
  if (!fs.existsSync(imagesDir)) {
    console.warn(`Images directory not found: ${imagesDir}`);
    return;
  }
  const files = fs.readdirSync(imagesDir).filter(f => /\.(webp|jpg|png|avif)$/i.test(f));
  for (const file of files) {
    const localPath = path.join(imagesDir, file);
    const destPath = folderPrefix + file;
    console.log(`Uploading ${localPath} to ${destPath}...`);
    try {
      await storage.upload(localPath, {
        destination: destPath,
        metadata: {
          cacheControl: "public, max-age=31536000",
        },
      });
      console.log(`  Uploaded ${destPath}`);
    } catch (err) {
      console.error(`  Failed to upload ${destPath}:`, err.message);
    }
  }
}

async function seed() {
  console.log("Seeding started.");
  
  // 1. Upload Images
  console.log("--- Uploading Site Ready Images ---");
  await uploadImages("../Images/site-ready", ""); 
  
  console.log("--- Uploading Equipment Images ---");
  await uploadImages("../Images/web-optimised", ""); 
  
  // 2. Read Catalogue CSV
  const cataloguePath = "../ec-rentals-catalogue.csv";
  if (!fs.existsSync(cataloguePath)) {
    console.error(`Catalogue CSV not found: ${cataloguePath}`);
    return;
  }
  
  const catalogueData = fs.readFileSync(cataloguePath, "utf-8");
  const records = parse(catalogueData, { columns: true, skip_empty_lines: true });
  
  // Extract categories
  const categoriesMap = new Map();
  for (const r of records) {
    if (!r.category || !r.category.trim()) continue;
    const catName = r.category.trim();
    const slug = catName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    if (!categoriesMap.has(slug)) {
      categoriesMap.set(slug, {
        title: catName,
        slug: slug,
        sort_order: categoriesMap.size + 1,
        active: true,
      });
    }
  }
  
  // 3. Write Categories to Firestore
  console.log("--- Seeding Categories ---");
  for (const [slug, data] of categoriesMap.entries()) {
    const catDoc = db.collection("equipment_categories").doc(slug);
    await catDoc.set({ id: slug, ...data }, { merge: true });
    console.log(`Saved Category: ${data.title}`);
  }
  
  // 4. Write Equipment to Firestore
  console.log("--- Seeding Equipment ---");
  for (const r of records) {
    if (!r.title || !r.slug) continue;
    const catSlug = r.category.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const eqDoc = db.collection("equipment").doc(r.slug);
    
    let imageUrl = null;
    if (r.image) {
      imageUrl = getPublicUrl(bucketName, r.image);
    }
    
    await eqDoc.set({
      id: r.slug,
      title: r.title,
      slug: r.slug,
      category_id: catSlug,
      short_description: r.shortDescription || null,
      specs: r.specs || null,
      fleet_qty: parseInt(r.fleetQty) || 0,
      ownership: r.ownership || "Owned",
      operator_available: r.operatorAvailable?.toLowerCase() === 'yes' || r.operatorAvailable?.toLowerCase() === 'true',
      delivery_class: r.deliveryClass || "Standard",
      image_url: imageUrl,
      gallery: [],
      sort_order: parseInt(r.sortOrder) || 99,
      active: r.active?.toLowerCase() === 'true'
    }, { merge: true });
    console.log(`Saved Equipment: ${r.title}`);
  }
  
  // 5. Write Tools to Firestore
  const toolsPath = "../ec-rentals-tools-catalogue.csv";
  if (fs.existsSync(toolsPath)) {
    console.log("--- Seeding Tools ---");
    const toolsData = fs.readFileSync(toolsPath, "utf-8");
    const toolRecords = parse(toolsData, { columns: true, skip_empty_lines: true });
    for (const r of toolRecords) {
      if (!r.title || !r.slug) continue;
      const toolDoc = db.collection("tools").doc(r.slug);
      await toolDoc.set({
        id: r.slug,
        title: r.title,
        slug: r.slug,
        tool_category: r.toolCategory || "General",
        active: r.active?.toLowerCase() === 'true'
      }, { merge: true });
      console.log(`Saved Tool: ${r.title}`);
    }
  }

  // 6. Write basic Site Content to avoid empty sections
  console.log("--- Seeding basic Site Content ---");
  const defaultContent = [
    { key: "hero_home", value: getPublicUrl(bucketName, "hero-home.webp") },
    { key: "cta_fleet", value: getPublicUrl(bucketName, "cta-fleet.webp") },
  ];
  for (const c of defaultContent) {
    await db.collection("site_content").doc(c.key).set({
      id: c.key,
      key: c.key,
      value: c.value
    }, { merge: true });
  }

  console.log("Seeding complete!");
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
