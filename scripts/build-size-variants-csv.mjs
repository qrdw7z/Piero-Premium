import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const products = [
  ['Triko Kazak Lacivert ve Boyfriend Kalıp Kot Pantolon', 'DfUyw5dACfC', 2198, 3297],
  ['Triko Kazak Ekru ve Boyfriend Kalıp Kot Pantolon', 'DfUyhh7ADQQ', 2198, 3297],
  ['Triko Kazak Haki ve Baggy Kalıp Kot Pantolon', 'DfUyX2-AFcl', 2198, 3297],
  ['Baklava Desenli Triko Kazak ve Gabardin Kumaş Pantolon', 'DfRtl4igIvE', 2398, 3597],
  ['Baklava Desenli Triko Kazak ve Baggy Kalıp Kot Pantolon', 'DfRsv7igLXj', 2198, 3297],
  ['Baklava Desenli Triko Kazak ve Gabardin Kumaş Pantolon', 'DfRsYZfgLk8', 2398, 3597],
  ['Baklava Desenli Triko Kazak ve Boyfriend Kalıp Kot Pantolon', 'DfRr_7pAFjG', 2198, 3297],
  ['Kuzu Derisi Triko Kazak ve Boyfriend Kalıp Kot Pantolon', 'DfRrmSXAPb-', 2398, 3597],
  ['Kuzu Derisi Triko Kazak ve Baggy Kalıp Kot Pantolon', 'DfRrAm7gOdu', 2398, 3597],
  ['Triko Çizgi Dokulu Kazak Ekru ve Boyfriend Kot Pantolon', 'DejrxeUgDRI', 2099, 3148.5],
  ['Triko Sık Doku Kazak Gri ve Boyfriend Kot Pantolon', 'DejrjwHgJq4', 2099, 3148.5],
  ['Triko Sık Doku Kazak Lacivert ve Boyfriend Kot Pantolon', 'DejrUO3gNU0', 2099, 3148.5],
  ['Triko Örgü Kazak Siyah ve Boyfriend Kot Pantolon', 'DejrBtaAGTT', 2099, 3148.5],
  ['Triko Örgü Kazak Lacivert ve Boyfriend Kot Pantolon', 'Dejqt-OgA0b', 2099, 3148.5],
  ['Triko Polo Yaka Taş Melanj ve Siyah Gabardin Kumaş Pantolon', 'DejqYslAEL7', 2399, 3598.5],
  ['Triko Tam Fermuar Hırka Kahve ve Kumaş Pantolon', 'DeY3yLAAOdG', 2398, 3597],
  ['Triko Düğmeli Oversize Hırka Lacivert ve Gabardin Kumaş Pantolon', 'DeJ7mbHgMl2', 3200, 4800],
  ['Triko Düğmeli Oversize Hırka Gri ve Boyfriend Kot Pantolon', 'DeJ56izgCEo', 2098, 3147],
];

const topSizes = ['S', 'M', 'L', 'XL'];
const bottomSizes = ['S (29-30)', 'M (31-32)', 'L (33-34)', 'XL (36)'];
const header = [
  'Handle', 'Title', 'Option1 Name', 'Option1 Value', 'Option2 Name', 'Option2 Value',
  'Variant SKU', 'Variant Inventory Tracker', 'Variant Inventory Qty', 'Variant Inventory Policy',
  'Variant Fulfillment Service', 'Variant Price', 'Variant Compare At Price',
  'Variant Requires Shipping', 'Variant Taxable', 'Status',
];

const slug = (value) => value.toLowerCase().normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 90);
const csv = (value = '') => `"${String(value).replaceAll('"', '""')}"`;
const rows = [header];

for (const [title, postCode, price, compareAt] of products) {
  const handle = `${slug(title)}-${postCode.toLowerCase()}`;
  for (const top of topSizes) {
    for (const bottom of bottomSizes) {
      rows.push([
        handle, top === 'S' && bottom === 'S (29-30)' ? title : '', 'Beden', top,
        'Pantolon Bedeni', bottom, `ARVEL-${postCode.toUpperCase()}-${top}-${bottom.slice(0, 1)}`,
        'shopify', 20, 'deny', 'manual', price, compareAt, 'true', 'true', 'active',
      ]);
    }
  }
}

const target = join(process.cwd(), 'piero-size-variants.csv');
await writeFile(target, `${rows.map((row) => row.map(csv).join(',')).join('\n')}\n`);
console.log(`Created ${rows.length - 1} size variants for ${products.length} products: ${target}`);
