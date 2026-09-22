const fs = require('fs');
const path = require('path');

async function downloadFonts() {
  const cssUrl = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=DM+Sans:ital,wght@0,400;0,500;0,700;1,400&display=swap';
  // Standard user agent to get TTF/WOFF2 (or use old agent like Googlebot or safari for ttf)
  // To get raw .ttf files directly, user-agent can be older or fetch from GitHub google/fonts repo directly
  console.log('Fetching Google Fonts...');
  
  // Directly download official TTF from google/fonts repo on GitHub for perfect TTF compatibility:
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
      url: 'https://raw.githubusercontent.com/google/fonts/main/ofl/dmsans/DMSans%5Bopsz%2Cwght%5D.ttf'
    },
    {
      name: 'DMSans-Bold.ttf',
      url: 'https://raw.githubusercontent.com/google/fonts/main/ofl/dmsans/DMSans-Bold.ttf'
    }
  ];

  const fontsDir = path.join(__dirname, '..', 'assets', 'fonts');
  if (!fs.existsSync(fontsDir)) {
    fs.mkdirSync(fontsDir, { recursive: true });
  }

  for (const f of fontDownloads) {
    const dest = path.join(fontsDir, f.name);
    try {
      console.log(`Downloading ${f.name} from ${f.url}...`);
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
