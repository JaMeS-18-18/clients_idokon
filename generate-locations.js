const xlsx = require('xlsx');
const fs = require('fs');
const fetch = require('node-fetch');

const workbook = xlsx.readFile('koordinatalar.xlsx');
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const rows = xlsx.utils.sheet_to_json(sheet);

async function getRegionDistrict(lat, lon) {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`, {
      headers: { 'User-Agent': 'iDOKON/1.0' }
    });
    const data = await res.json();
    const region = data?.address?.state || "";
    const district = data?.address?.county || data?.address?.suburb || "";
    return { lat, lng: lon, region, district };
  } catch (err) {
    console.error(`Error for ${lat}, ${lon}:`, err.message);
    return { lat, lng: lon, region: "", district: "" };
  }
}

(async () => {
  const results = [];

  // const testRows = rows.slice(0, 5); // faqat 5 tasi uchun

  for (const row of rows) {
    if (!row.Latitude || !row.Longitude) continue;
    const item = await getRegionDistrict(row.Latitude, row.Longitude);
    console.log("Fetched:", item.region, "-", item.district);
    results.push(item);
    await new Promise(r => setTimeout(r, 1500)); // 1.5s delay
  }

  fs.writeFileSync('data.json', JSON.stringify(results, null, 2), 'utf8');
  console.log("✅ Saved to data.json");
})();
