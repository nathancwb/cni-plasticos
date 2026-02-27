// CNI Plásticos — Produtos App Logic (Shopify-style)
(function () {
    const container = document.getElementById('products-container');
    const detailSection = document.getElementById('product-detail');
    const galleryMain = document.getElementById('gallery-main');
    const galleryImg = document.getElementById('gallery-img');
    const gallery3d = document.getElementById('gallery-3d');
    const galleryBadge = document.getElementById('gallery-badge');
    const galleryHint = document.getElementById('gallery-3d-hint');
    const galleryThumbs = document.getElementById('gallery-thumbs');
    const viewerControls = document.getElementById('viewer-controls');
    const btnRotate = document.getElementById('btn-rotate');

    const pCategory = document.getElementById('p-category');
    const pName = document.getElementById('p-name');
    const pDesc = document.getElementById('p-desc');
    const variantsSection = document.getElementById('variants-section');
    const colorSwatches = document.getElementById('color-swatches');
    const sCat = document.getElementById('s-cat');
    const sMat = document.getElementById('s-mat');
    const sDim = document.getElementById('s-dim');
    const sPeso = document.getElementById('s-peso');

    let currentProduct = null;
    let currentMode = 'photo'; // 'photo' or '3d'

    // Build product grid grouped by category
    function buildGrid() {
        let currentCat = '';
        let html = '';
        PRODUCTS.forEach((p, i) => {
            if (p.cat !== currentCat) {
                currentCat = p.cat;
                html += `<div class="category-title">${currentCat}</div>`;
            }
            if (p.cat !== PRODUCTS[i > 0 ? i - 1 : 0].cat || i === 0) {
                if (i > 0) html += '</div>';
                html += '<div class="products-grid">';
            }
            html += `
        <div class="grid-card" data-idx="${i}" id="card-${p.id}">
          ${p.has3d ? '<span class="badge-3d">3D</span>' : ''}
          <img class="grid-card-img" src="${p.img}" alt="${p.name}" loading="lazy">
          <h3>${p.name}</h3>
          <p>${p.specs.categoria}</p>
        </div>`;
        });
        html += '</div>';
        container.innerHTML = html;

        // Attach click handlers
        container.querySelectorAll('.grid-card').forEach(card => {
            card.addEventListener('click', () => {
                const idx = parseInt(card.dataset.idx);
                openProduct(idx);
            });
        });
    }

    function openProduct(idx) {
        const p = PRODUCTS[idx];
        currentProduct = p;

        // Update active card
        container.querySelectorAll('.grid-card').forEach(c => c.classList.remove('active'));
        const activeCard = document.getElementById('card-' + p.id);
        if (activeCard) activeCard.classList.add('active');

        // Fill info
        pCategory.textContent = p.specs.categoria;
        pName.textContent = p.name;
        pDesc.textContent = p.desc;
        sCat.textContent = p.specs.categoria;
        sMat.textContent = p.specs.material;
        sDim.textContent = p.specs.dimensao;
        sPeso.textContent = p.specs.peso;

        // Color variants
        if (p.colors && p.colors.length > 0) {
            variantsSection.style.display = 'block';
            let swatchHTML = '';
            p.colors.forEach((c, ci) => {
                swatchHTML += `<button class="color-swatch${ci === 0 ? ' active' : ''}" data-color="${ci}">
          <span class="color-dot ${c.class}"></span>${c.name}
        </button>`;
            });
            colorSwatches.innerHTML = swatchHTML;
            colorSwatches.querySelectorAll('.color-swatch').forEach(btn => {
                btn.addEventListener('click', () => {
                    const ci = parseInt(btn.dataset.color);
                    colorSwatches.querySelectorAll('.color-swatch').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    showColorVariant(ci);
                });
            });
        } else {
            variantsSection.style.display = 'none';
        }

        // Show gallery — default to photo mode
        currentMode = 'photo';
        buildThumbs();
        showMainImage(p.img);

        // Show detail section
        detailSection.classList.add('visible');
        setTimeout(() => {
            detailSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    }

    function showColorVariant(ci) {
        const p = currentProduct;
        if (!p.colors || !p.colors[ci]) return;
        const color = p.colors[ci];
        currentMode = 'photo';
        buildThumbs(ci);
        if (color.imgs && color.imgs.length > 0) {
            showMainImage(color.imgs[0]);
        } else {
            showMainImage(p.img);
        }
    }

    function buildThumbs(colorIdx) {
        const p = currentProduct;
        let html = '';
        const ci = colorIdx !== undefined ? colorIdx : 0;

        // 3D thumb if available
        if (p.has3d) {
            html += `<div class="gallery-thumb thumb-3d" data-action="3d"><span>🎲 3D</span></div>`;
        }

        // Main product image
        html += `<div class="gallery-thumb active" data-action="img" data-src="${p.img}">
      <img src="${p.img}" alt="${p.name}">
    </div>`;

        // Color variant images
        if (p.colors && p.colors[ci] && p.colors[ci].imgs) {
            p.colors[ci].imgs.forEach(imgSrc => {
                html += `<div class="gallery-thumb" data-action="img" data-src="${imgSrc}">
          <img src="${imgSrc}" alt="${p.name}">
        </div>`;
            });
        }

        galleryThumbs.innerHTML = html;

        // Attach thumb click handlers
        galleryThumbs.querySelectorAll('.gallery-thumb').forEach(thumb => {
            thumb.addEventListener('click', () => {
                galleryThumbs.querySelectorAll('.gallery-thumb').forEach(t => t.classList.remove('active'));
                thumb.classList.add('active');

                if (thumb.dataset.action === '3d') {
                    show3D();
                } else {
                    currentMode = 'photo';
                    showMainImage(thumb.dataset.src);
                }
            });
        });
    }

    function showMainImage(src) {
        galleryImg.src = src;
        galleryImg.alt = currentProduct ? currentProduct.name : '';
        galleryImg.style.display = 'block';
        gallery3d.style.display = 'none';
        galleryBadge.textContent = 'Foto do Produto';
        galleryBadge.className = 'gallery-badge photo';
        galleryHint.style.display = 'none';
        viewerControls.style.display = 'none';
    }

    function show3D() {
        const p = currentProduct;
        if (!p || !p.has3d) return;
        currentMode = '3d';
        galleryImg.style.display = 'none';
        gallery3d.style.display = 'block';
        gallery3d.src = p.model;
        gallery3d.alt = `Modelo 3D de ${p.name}`;
        gallery3d.autoRotate = true;
        galleryBadge.textContent = 'Visualização 3D';
        galleryBadge.className = 'gallery-badge';
        galleryHint.style.display = 'flex';
        viewerControls.style.display = 'flex';
        btnRotate.classList.add('active');
        btnRotate.textContent = 'Auto-Rotação';
    }

    // 3D controls
    window.toggleRotate = function () {
        if (gallery3d.autoRotate) {
            gallery3d.autoRotate = false;
            btnRotate.classList.remove('active');
            btnRotate.textContent = 'Girar';
        } else {
            gallery3d.autoRotate = true;
            btnRotate.classList.add('active');
            btnRotate.textContent = 'Auto-Rotação';
        }
    };

    window.resetView = function () {
        gallery3d.cameraOrbit = '0deg 75deg 105%';
    };

    // Initialize
    buildGrid();

    // Auto-open first product
    if (PRODUCTS.length > 0) {
        openProduct(0);
    }
})();
