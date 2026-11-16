import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const postCodes = [
  'DfUyw5dACfC', 'DfUyhh7ADQQ', 'DfUyX2-AFcl', 'DfRtl4igIvE', 'DfRsv7igLXj',
  'DfRsYZfgLk8', 'DfRr_7pAFjG', 'DfRrmSXAPb-', 'DfRrAm7gOdu', 'DejrxeUgDRI',
  'DejrjwHgJq4', 'DejrUO3gNU0', 'DejrBtaAGTT', 'Dejqt-OgA0b', 'DejqYslAEL7',
  'DeY3yLAAOdG', 'DeJ7mbHgMl2', 'DeJ56izgCEo',
];

const titles = {
  DfUyw5dACfC: 'Triko Kazak Lacivert ve Boyfriend Kalıp Kot Pantolon',
  DfUyhh7ADQQ: 'Triko Kazak Ekru ve Boyfriend Kalıp Kot Pantolon',
  'DfUyX2-AFcl': 'Triko Kazak Haki ve Baggy Kalıp Kot Pantolon',
  DfRtl4igIvE: 'Baklava Desenli Triko Kazak ve Gabardin Kumaş Pantolon',
  DfRsv7igLXj: 'Baklava Desenli Triko Kazak ve Baggy Kalıp Kot Pantolon',
  DfRsYZfgLk8: 'Baklava Desenli Triko Kazak ve Gabardin Kumaş Pantolon',
  DfRr_7pAFjG: 'Baklava Desenli Triko Kazak ve Boyfriend Kalıp Kot Pantolon',
  'DfRrmSXAPb-': 'Kuzu Derisi Triko Kazak ve Boyfriend Kalıp Kot Pantolon',
  DfRrAm7gOdu: 'Kuzu Derisi Triko Kazak ve Baggy Kalıp Kot Pantolon',
  DejrxeUgDRI: 'Triko Çizgi Dokulu Kazak Ekru ve Boyfriend Kot Pantolon',
  DejrjwHgJq4: 'Triko Sık Doku Kazak Gri ve Boyfriend Kot Pantolon',
  DejrUO3gNU0: 'Triko Sık Doku Kazak Lacivert ve Boyfriend Kot Pantolon',
  DejrBtaAGTT: 'Triko Örgü Kazak Siyah ve Boyfriend Kot Pantolon',
  'Dejqt-OgA0b': 'Triko Örgü Kazak Lacivert ve Boyfriend Kot Pantolon',
  DejqYslAEL7: 'Triko Polo Yaka Taş Melanj ve Siyah Gabardin Kumaş Pantolon',
  DeY3yLAAOdG: 'Triko Tam Fermuar Hırka Kahve ve Kumaş Pantolon',
  DeJ7mbHgMl2: 'Triko Düğmeli Oversize Hırka Lacivert ve Gabardin Kumaş Pantolon',
  DeJ56izgCEo: 'Triko Düğmeli Oversize Hırka Gri ve Boyfriend Kot Pantolon',
};

const root = process.cwd();
const imageDirectory = join(root, 'assets', 'instagram-products', 'carousel');
const csvPath = join(root, 'piero-instagram-products.csv');
const downloadImages = process.env.DOWNLOAD_IMAGES === '1';
const header = [
  'Handle', 'Title', 'Body (HTML)', 'Vendor', 'Product Category', 'Type', 'Tags', 'Published',
  'Option1 Name', 'Option1 Value', 'Variant SKU', 'Variant Grams', 'Variant Inventory Tracker',
  'Variant Inventory Qty', 'Variant Inventory Policy', 'Variant Fulfillment Service', 'Variant Price',
  'Variant Requires Shipping', 'Variant Taxable', 'Image Src', 'Image Position', 'Image Alt Text', 'Status',
];

const escapeCsv = (value = '') => `"${String(value).replaceAll('"', '""')}"`;
const slug = (value) => value.toLowerCase().normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 90);

function readJsonObject(source, key) {
  const keyOffset = source.indexOf(key);
  const start = source.indexOf('{', keyOffset);
  let depth = 0;
  let quoted = false;
  let escaping = false;
  for (let end = start; end < source.length; end += 1) {
    const character = source[end];
    if (quoted) {
      if (escaping) escaping = false;
      else if (character === '\\') escaping = true;
      else if (character === '"') quoted = false;
    } else if (character === '"') quoted = true;
    else if (character === '{') depth += 1;
    else if (character === '}' && --depth === 0) return JSON.parse(source.slice(start, end + 1));
  }
  throw new Error(`Could not parse ${key}`);
}

function cleanUrl(value) {
  return value.replaceAll('\\/', '/').replaceAll('\\u0026', '&').replaceAll('\\u00253D', '%3D');
}

function titleFromPage(source, fallback) {
  const match = source.match(/<meta property="og:description" content="([^"]+)"/);
  const caption = match?.[1]
    ?.replaceAll('&quot;', '"')
    .replaceAll('&#x27;', "'")
    .replaceAll('&amp;', '&')
    .replace(/\s+/g, ' ')
    .trim();
  if (!caption) return `Instagram kombini ${fallback}`;
  return caption.replace(/^.*?:\s*/, '').split(/[🏷️#]/)[0].trim().slice(0, 160) || `Instagram kombini ${fallback}`;
}

await mkdir(imageDirectory, { recursive: true });
const rows = [header];

for (const code of postCodes) {
  try {
    const pageUrl = `https://www.instagram.com/p/${code}/embed/captioned/`;
    const page = await fetch(pageUrl, { headers: { 'user-agent': 'Mozilla/5.0' } });
    if (!page.ok) throw new Error(`${page.status}`);
    const raw = await page.text();
    const source = raw.replaceAll('\\"', '"');
    const media = readJsonObject(source, 'edge_sidecar_to_children').edges.map(({ node }) => cleanUrl(node.display_url));
    if (media.length < 2) continue;

    const title = titles[code] ?? titleFromPage(raw, code);
    const handle = `${slug(title)}-${code.toLowerCase()}`;
    for (const [index, url] of media.entries()) {
      const imageName = `${handle}-${index + 1}.jpg`;
      if (downloadImages) {
        const image = await fetch(url, { headers: { referer: pageUrl, 'user-agent': 'Mozilla/5.0' } });
        if (!image.ok) throw new Error(`image ${index + 1}: ${image.status}`);
        await writeFile(join(imageDirectory, imageName), Buffer.from(await image.arrayBuffer()));
      }

      const row = Array(header.length).fill('');
      row[0] = handle;
      // Instagram's signed CDN URL is directly importable by Shopify immediately after export.
      // Upload the local copies to a permanent host before relying on a later import.
      row[19] = url;
      row[20] = String(index + 1);
      row[21] = `${title} – görsel ${index + 1}`;
      if (index === 0) {
        row[1] = title;
        row[3] = 'Arvel';
        row[4] = 'Apparel & Accessories > Clothing';
        row[5] = 'Kombin';
        row[6] = 'instagram,erkek-giyim,kombin,carousel';
        row[7] = 'false';
        row[8] = 'Title';
        row[9] = 'Default Title';
        row[10] = `IG-${code.toUpperCase()}`;
        row[11] = '0';
        row[12] = 'shopify';
        row[13] = '0';
        row[14] = 'deny';
        row[15] = 'manual';
        row[17] = 'true';
        row[18] = 'true';
        row[22] = 'draft';
      }
      rows.push(row);
    }
  } catch (error) {
    console.warn(`Skipped ${code}: ${error.message}`);
  }
}

await writeFile(csvPath, `${rows.map((row) => row.map(escapeCsv).join(',')).join('\n')}\n`);
console.log(`Imported ${rows.length - 1} images from ${postCodes.length} carousel posts.`);
