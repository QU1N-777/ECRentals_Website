const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');
const { parse } = require('csv-parse/sync');

const sa = require('../serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(sa)
});

const db = admin.firestore();

const catMap = {
  'cranes-trucks-logistics': 'cat-cranes-logistics.webp',
  'earthmoving-material-handling': 'cat-earthmoving.webp',
  'forklifts': 'cat-forklifts.webp',
  'hv-diagnostics-testing': 'cat-hv-diagnostics.webp',
  'personnel-transport': 'cat-personnel.webp',
  'power-site-support': 'cat-power-site.webp',
  'solar-piling': 'cat-solar-piling.webp',
  'telehandlers-access': 'cat-telehandlers.webp',
  'tractors-agricultural': 'cat-tractors.webp',
  'trailers': 'cat-trailers.webp',
  'vehicle-hire-ldvs-bakkies': 'cat-vehicle-hire.webp'
};

async function updateAll() {
  console.log('--- Updating Categories in Firestore ---');
  const catSnap = await db.collection('equipment_categories').get();
  for (const doc of catSnap.docs) {
    const data = doc.data();
    const slug = data.slug || doc.id;
    const catImage = catMap[slug] || 'cat-cranes-logistics.webp';
    await doc.ref.update({
      image_url: catImage
    });
    console.log(`Updated Category [${slug}]: image_url -> ${catImage}`);
  }

  console.log('\n--- Updating Equipment in Firestore ---');
  const csvPath = path.resolve('../ec-rentals-catalogue.csv');
  const csv = fs.readFileSync(csvPath, 'utf8');
  const records = parse(csv, { columns: true, skip_empty_lines: true });

  const eqSnap = await db.collection('equipment').get();
  const eqDocs = new Map();
  eqSnap.forEach(d => eqDocs.set(d.id, d));

  for (const r of records) {
    const slug = r.slug;
    const cleanImg = r.image || `${slug}.webp`;
    
    const doc = eqDocs.get(slug);
    if (doc) {
      await doc.ref.update({
        image_url: cleanImg
      });
      console.log(`Updated Equipment [${slug}]: image_url -> ${cleanImg}`);
    } else {
      console.log(`Warning: Equipment doc not found for slug: ${slug}`);
    }
  }

  console.log('\nAll Firestore images successfully updated!');
}

updateAll().catch(err => {
  console.error('Update failed:', err);
  process.exit(1);
});
