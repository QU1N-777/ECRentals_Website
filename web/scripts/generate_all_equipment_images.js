const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const targetDir = path.resolve('./public/media');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

const mappings = {
  // Trailers (using actual ECR trailer photos in ../Images!)
  '6m-v-tec-trailer.webp': '../Images/ECR017 6m V-Tec Trailer.png',
  '4m-v-tec-trailer.webp': '../Images/ECR024 - 4m V-Tec Trailer.png',
  'v-tec-cable-trailer.webp': '../Images/ECR017 6m V-Tec Trailer.png',
  '6m-flatbed-trailer.webp': '../Images/ECR062 - ECR065 6m Trailer.png',
  '10t-ubt-drawbar-truck-trailer.webp': '../Images/ECR025 10T - UBT Drawbar Truck Trailer.jpg',
  'cve-truck-trailer.webp': '../Images/ECR050 CVE Truck Trailer.png',
  'box-trailers-venter-karet-challenger.webp': '../Images/ECR037 Venter Box Trailer ECR038 ECR061 Karet Box Trailer ECR039 Challenger Box Trailer.jpeg',
  'water-trailer.webp': '../Images/ECR067 Water Trailer.png',
  
  // Tractors & Agricultural
  '8t-6m-tractor-trailer.webp': '../Images/ECR101 ECR102 8T 6m - Tractor Trailer (Rooi Plaas trailer).png',
  '10t-9m-flatbed-tractor-trailer.webp': '../Images/ECR101 ECR102 8T 6m - Tractor Trailer (Rooi Plaas trailer).png',
  'landini-tractor.webp': '../Images/ECR079 ECR091 - Massey Ferguson Tractor.png',
  'slasher-dicla.webp': '../Images/web-optimised/wulf-mulcher.webp',
  'slasher-aem.webp': '../Images/web-optimised/2-tine-ripper.webp',

  // Vehicles (using real ECR fleet bakkies)
  'toyota-hilux-2-4-gd-6-single-cab-4x4.webp': '../Images/ECR112 ECR112 - Toyota Hilux GD-6 Base Model.jpg',
  'toyota-hilux-2-4-gd-6-extended-cab.webp': '../Images/ECR014 036 068 069 081 Toyota Hilux GD-6 SC.png',
  'toyota-hilux-vvti-single-cab-2-0-2-2-2-4-3-0.webp': '../Images/ECR112 ECR112 - Toyota Hilux GD-6 Base Model.jpg',
  'toyota-hilux-4-0-v6-double-cab.webp': '../Images/ECR026 027 035 049 053 059 080 085 044 045 048 Toyota Hilux GD-6 DC.png',
  'toyota-hilux-2-5-3-0-d-4d-double-cab.webp': '../Images/ECR041 - Toyota Hilux GD-6 DC with Canopy.png',

  // Telehandlers & Access (using ECR JCB/Haulotte & Cinematic/Site assets)
  '2-5t-telehandler-2505.webp': '../Images/Generated/managed-hire-telehandler.webp',
  '3-5t-telehandler-3512.webp': '../Images/ECR056 - JCB Telehandler.png',
  '4t-telehandler-4017.webp': '../Images/ECR070 - Hauoutte Telehandler.png',
  '9t-telehandler.webp': '../Images/Generated Cinematic Website Images/14-haulotte-telehandler-industrial-steelwork.png',
  '10t-telehandler-hth10.webp': '../Images/Generated Cinematic Website Images/05-jcb-telehandler-blue-hour-lift.png',
  '12-5m-trailer-mounted-cherry-picker.webp': '../Images/site-ready/cat-telehandlers.webp',
  '26m-cherry-picker.webp': '../Images/site-ready/cat-telehandlers.webp',

  // Cranes & Forklifts
  '110t-mobile-crane-managed-hire.webp': '../Images/Generated/hero-wide-crane-truck.webp',
  '10t-tcm-forklift.webp': '../Images/Generated/forklifts-zoomlion.webp',

  // Power, Site Support & Diagnostics
  'cable-trolley.webp': '../Images/ECR033 - Toyota Hilux GD-6 with Cable Rack.png',
  'site-containers-office-store-ablution-kitchen.webp': '../Images/site-ready/proj-warehouse.webp',
  'hva60-vlf-high-voltage-cable-tester.webp': '../Images/site-ready/cat-hv-diagnostics.webp',
  'sherla-cable-sheath-fault-locator-010kv.webp': '../Images/site-ready/cat-hv-diagnostics.webp',
};

async function processAll() {
  console.log('Starting image conversion for', Object.keys(mappings).length, 'files...');
  for (const [destName, srcRel] of Object.entries(mappings)) {
    const srcPath = path.resolve(srcRel);
    const destPath = path.join(targetDir, destName);
    
    if (!fs.existsSync(srcPath)) {
      console.error('Source file not found:', srcPath);
      continue;
    }

    try {
      if (srcRel.endsWith('.webp')) {
        // If it's already a webp, copy directly
        fs.copyFileSync(srcPath, destPath);
        console.log(`Copied webp: ${destName}`);
      } else {
        // Convert to webp with sharp
        await sharp(srcPath)
          .resize({ width: 1200, withoutEnlargement: true })
          .webp({ quality: 85 })
          .toFile(destPath);
        console.log(`Converted & saved: ${destName} (from ${path.basename(srcPath)})`);
      }
    } catch (err) {
      console.error(`Failed to process ${destName}:`, err.message);
    }
  }

  // Also make sure subdirectories 'equipment' and 'categories' have copies if anything references them
  const eqDir = path.join(targetDir, 'equipment');
  const catDir = path.join(targetDir, 'categories');
  if (!fs.existsSync(eqDir)) fs.mkdirSync(eqDir, { recursive: true });
  if (!fs.existsSync(catDir)) fs.mkdirSync(catDir, { recursive: true });

  const mediaFiles = fs.readdirSync(targetDir);
  for (const f of mediaFiles) {
    if (f.endsWith('.webp') || f.endsWith('.png') || f.endsWith('.jpg')) {
      const src = path.join(targetDir, f);
      // Copy to equipment/
      fs.copyFileSync(src, path.join(eqDir, f));
      // If cat-*, copy to categories/
      if (f.startsWith('cat-')) {
        fs.copyFileSync(src, path.join(catDir, f));
      }
    }
  }
  console.log('Subdirectories /equipment and /categories populated for fallback compatibility.');
  console.log('Image processing complete!');
}

processAll();
