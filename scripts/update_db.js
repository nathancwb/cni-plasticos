const fs = require('fs');
const path = require('path');

const PRODUCTS_FILE = path.join(__dirname, '../assets/js/produtos-data.js');
const VARIANTS_DIR = path.join(__dirname, '../assets/images/products/variants');

const folderMap = {
    'cabo-subterraneo': 'cabo-subterr-aneo',
    'fio-eletroplastico': 'fio-eletropl-astico',
    'gancho-19cm': 'gancho-19-cm',
    'gancho-9cm': 'gancho-9-cm',
    'tubo-isolador': 'tubo-isolador-final'
};

function capitalize(s) {
    return s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, ' ');
}

// Read and eval the current products array
const content = fs.readFileSync(PRODUCTS_FILE, 'utf8');
const objScript = content.replace('const PRODUCTS =', 'module.exports =');
const tmpFile = path.join(__dirname, 'tmp_products.js');
fs.writeFileSync(tmpFile, objScript);
const PRODUCTS = require('./tmp_products.js');

for (const prod of (PRODUCTS || [])) {
    const folderName = folderMap[prod.id] || prod.id;
    const dirPath = path.join(VARIANTS_DIR, folderName);

    if (fs.existsSync(dirPath)) {
        const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.jpg'));

        const variantsMap = {};
        let nonVariantFiles = [];

        for (const file of files) {
            // Is it a variant? "amarelo-1.jpg"
            const match = file.match(/^(.*)-(\d+)\.jpg$/);
            if (match) {
                const variantSlug = match[1];
                if (!variantsMap[variantSlug]) variantsMap[variantSlug] = [];
                variantsMap[variantSlug].push(`assets/images/products/variants/${folderName}/${file}`);
            } else {
                nonVariantFiles.push(`assets/images/products/variants/${folderName}/${file}`);
            }
        }

        const colors = [];
        for (const [slug, imgs] of Object.entries(variantsMap)) {
            // sort images simply
            imgs.sort();
            colors.push({
                name: capitalize(slug),
                class: slug,
                imgs: imgs
            });
        }

        if (colors.length > 1) {
            prod.colors = colors;
            // Force main img to first variant's first image, so it uses the real optimized photo
            prod.img = colors[0].imgs[0];
        } else if (colors.length === 1) {
            // Only 1 variant. Merge it into simple imgs array
            delete prod.colors;
            prod.imgs = colors[0].imgs;
            prod.img = prod.imgs[0];
        } else if (nonVariantFiles.length > 0) {
            // Delete old colors to be safe
            delete prod.colors;
            prod.imgs = nonVariantFiles;
            prod.img = nonVariantFiles[0];
        }
    }
}

const finalScript = `// CNI Plásticos — Product Data
const PRODUCTS = ${JSON.stringify(PRODUCTS, null, 2)};
`;

fs.writeFileSync(PRODUCTS_FILE, finalScript);
console.log('Successfully updated produtos-data.js with the new variants database!');
