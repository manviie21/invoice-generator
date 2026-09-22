import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function downloadFonts() {
  console.log('Downloading Google Fonts TTF files for Cormorant Garamond and DM Sans...');
  
  const fontDownloads = [
    {
      name: 'CormorantGaramond-Regular.ttf',
      url: 'https://raw.githubusercontent.com/google/fonts/main/ofl/cormorantgaramond/CormorantGaramond-Regular.ttf'
    },
    {
      name: 'CormorantGaramond-Bold.ttf',
      url: 'https://raw.githubusercontent.com/google/fonts/main/ofl/cormorantgaramond/CormorantGaramond-Bold.ttf'
    },
    {
      name: 'CormorantGaramond-Italic.ttf',
      url: 'https://raw.githubusercontent.com/google/fonts/main/ofl/cormorantgaramond/CormorantGaramond-Italic.ttf'
    },
    {
      name: 'DMSans-Regular.ttf',
      url: 'https://raw.githubusercontent.com/googlefonts/dm-fonts/master/Sans/fonts/ttf/DMSans-Regular.ttf'
    },
    {
      name: 'DMSans-Bold.ttf',
      url: 'https://raw.githubusercontent.com/googlefonts/dm-fonts/master/Sans/fonts/ttf/DMSans-Bold.ttf'
    },
    {
      name: 'DMSans-Medium.ttf',
      url: 'https://raw.githubusercontent.com/googlefonts/dm-fonts/master/Sans/fonts/ttf/DMSans-Medium.ttf'
    }
  ];

  const fontsDir = path.join(__dirname, '..', 'assets', 'fonts');
  if (!fs.existsSync(fontsDir)) {
    fs.mkdirSync(fontsDir, { recursive: true });
  }

  for (const f of fontDownloads) {
    const dest = path.join(fontsDir, f.name);
    try {
      console.log(`Downloading ${f.name}...`);
      const res = await fetch(f.url);
      if (!res.ok) {
        console.warn(`Failed to download ${f.name}: HTTP ${res.status}`);
        continue;
      }
      const buf = Buffer.from(await res.arrayBuffer());
      fs.writeFileSync(dest, buf);
      console.log(`Saved ${f.name} (${buf.length} bytes)`);
    } catch (e) {
      console.error(`Error downloading ${f.name}:`, e.message);
    }
  }
}

downloadFonts();
