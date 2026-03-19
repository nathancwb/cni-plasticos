// CNI Plásticos — Produtos App Logic
(function () {
    const viewArea = document.getElementById('products-view-area');
    const detailSection = document.getElementById('product-detail');
    const modalOverlay = document.getElementById('modal-overlay');
    const modalClose = document.getElementById('modal-close');
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

    const categoryIcons = {
        'Isoladores Tipo W': '⚡',
        'Roldanas Isoladoras': '⭕',
        'Castanhas e Catracas': '⚙️',
        'Ganchos Isoladores': '🪝',
        'Acessórios para Cerca Elétrica': '🔌',
        'Niveladores para Pisos': '📏'
    };

    // ─── Build full catalog: all categories + products on one page ───
    function buildFullCatalog() {
        // Group products by category preserving order
        const categoryMap = {};
        const categoryOrder = [];
        PRODUCTS.forEach((p, i) => {
            if (!categoryMap[p.cat]) {
                categoryMap[p.cat] = [];
                categoryOrder.push(p.cat);
            }
            categoryMap[p.cat].push({ product: p, idx: i });
        });

        // Build sticky category nav
        let navHTML = '<div class="cat-nav" id="cat-nav">';
        categoryOrder.forEach(cat => {
            const slug = cat.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
            const icon = categoryIcons[cat] || '📦';
            navHTML += `<a class="cat-nav-link" href="#cat-${slug}">${icon} ${cat}</a>`;
        });
        navHTML += '</div>';

        // Build each category section
        let sectionsHTML = '';
        categoryOrder.forEach(cat => {
            const slug = cat.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
            const icon = categoryIcons[cat] || '📦';
            const items = categoryMap[cat];

            sectionsHTML += `
            <div class="cat-section" id="cat-${slug}">
                <div class="cat-section-header">
                    <span class="cat-section-icon">${icon}</span>
                    <h2 class="cat-section-title">${cat}</h2>
                    <span class="cat-section-count">${items.length} produto${items.length > 1 ? 's' : ''}</span>
                </div>
                <div class="products-grid">`;

            items.forEach(({ product: p, idx }) => {
                sectionsHTML += `
                    <div class="grid-card" data-idx="${idx}" id="card-${p.id}">
                        ${p.has3d ? '<span class="badge-3d">3D</span>' : ''}
                        <img class="grid-card-img" src="${p.img}" alt="${p.name}" loading="lazy">
                        <h3>${p.name}</h3>
                        <p>${p.specs.categoria}</p>
                    </div>`;
            });

            sectionsHTML += `</div></div>`;
        });

        viewArea.innerHTML = navHTML + sectionsHTML;

        // Attach card click handlers
        viewArea.querySelectorAll('.grid-card').forEach(card => {
            card.addEventListener('click', () => openProduct(parseInt(card.dataset.idx)));
        });

        // Sticky nav highlight on scroll
        initNavHighlight();
    }

    // Highlight active category in nav on scroll
    function initNavHighlight() {
        const sections = viewArea.querySelectorAll('.cat-section');
        const navLinks = viewArea.querySelectorAll('.cat-nav-link');
        if (!sections.length || !navLinks.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.id;
                    navLinks.forEach(link => {
                        link.classList.toggle('active', link.getAttribute('href') === '#' + id);
                    });
                }
            });
        }, { rootMargin: '-20% 0px -70% 0px' });

        sections.forEach(s => observer.observe(s));
    }

    function openProduct(idx) {
        const p = PRODUCTS[idx];
        currentProduct = p;

        viewArea.querySelectorAll('.grid-card').forEach(c => c.classList.remove('active'));
        const activeCard = document.getElementById('card-' + p.id);
        if (activeCard) activeCard.classList.add('active');

        pCategory.textContent = p.specs.categoria;
        pName.textContent = p.name;
        pDesc.textContent = p.desc;
        sCat.textContent = p.specs.categoria;
        sMat.textContent = p.specs.material;
        sDim.textContent = p.specs.dimensao;
        sPeso.textContent = p.specs.peso;

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
                    colorSwatches.querySelectorAll('.color-swatch').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    showColorVariant(parseInt(btn.dataset.color));
                });
            });
        } else {
            variantsSection.style.display = 'none';
        }

        buildThumbs();
        showMainImage(p.img);

        modalOverlay.classList.add('active');
        detailSection.classList.add('visible');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        modalOverlay.classList.remove('active');
        detailSection.classList.remove('visible');
        document.body.style.overflow = '';
        viewArea.querySelectorAll('.grid-card').forEach(c => c.classList.remove('active'));
    }

    modalClose.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', closeModal);

    function showColorVariant(ci) {
        const p = currentProduct;
        if (!p.colors || !p.colors[ci]) return;
        const color = p.colors[ci];
        buildThumbs(ci);
        if (color.imgs && color.imgs.length > 0) showMainImage(color.imgs[0]);
        else showMainImage(p.img);
    }

    function buildThumbs(colorIdx) {
        const p = currentProduct;
        let html = '';
        const ci = colorIdx !== undefined ? colorIdx : 0;

        if (p.has3d) {
            html += `<div class="gallery-thumb thumb-3d" data-action="3d"><span>🎲 3D</span></div>`;
        }

        const mainImg = (p.imgs && p.imgs.length > 0) ? p.imgs[0] :
                        (p.colors && p.colors[ci] && p.colors[ci].imgs && p.colors[ci].imgs.length > 0) ? p.colors[ci].imgs[0] :
                        p.img;

        html += `<div class="gallery-thumb active" data-action="img" data-src="${mainImg}">
            <img src="${mainImg}" alt="${p.name}">
        </div>`;

        if (p.colors && p.colors[ci] && p.colors[ci].imgs) {
            p.colors[ci].imgs.forEach((imgSrc, i) => {
                if (i === 0) return;
                html += `<div class="gallery-thumb" data-action="img" data-src="${imgSrc}">
                    <img src="${imgSrc}" alt="${p.name}">
                </div>`;
            });
        } else if (p.imgs && p.imgs.length > 1) {
            p.imgs.forEach((imgSrc, i) => {
                if (i === 0) return;
                html += `<div class="gallery-thumb" data-action="img" data-src="${imgSrc}">
                    <img src="${imgSrc}" alt="${p.name}">
                </div>`;
            });
        }

        galleryThumbs.innerHTML = html;

        galleryThumbs.querySelectorAll('.gallery-thumb').forEach(thumb => {
            thumb.addEventListener('click', () => {
                galleryThumbs.querySelectorAll('.gallery-thumb').forEach(t => t.classList.remove('active'));
                thumb.classList.add('active');
                if (thumb.dataset.action === '3d') show3D();
                else showMainImage(thumb.dataset.src);
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
        gallery3d.interactionPrompt = 'none';
        gallery3d.addEventListener('click', (event) => {
            if (window.innerWidth > 900) return;
            const hit = event.target.positionAndNormalFromPoint(event.clientX, event.clientY);
            if (hit) event.target.cameraTarget = `${hit.position.x}m ${hit.position.y}m ${hit.position.z}m`;
        });
    }

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
    buildFullCatalog();
})();
