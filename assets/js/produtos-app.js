// CNI Plásticos — Produtos App Logic
(function () {
    const viewArea = document.getElementById('products-view-area');
    const detailSection = document.getElementById('product-detail');
    const modalOverlay = document.getElementById('modal-overlay');
    const modalClose = document.getElementById('modal-close');
    const modalPrev = document.getElementById('modal-prev');
    const modalNext = document.getElementById('modal-next');
    const galleryImg = document.getElementById('gallery-img');
    const gallery3d = document.getElementById('gallery-3d');
    const galleryWatermark = document.getElementById('gallery-watermark');
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
    const sPedido = document.getElementById('s-pedido');
    const singleCodigo = document.getElementById('single-codigo');
    const singleCodigoVal = document.getElementById('single-codigo-value');

    let currentIdx = -1;
    let currentProduct = null;
    let PRODUCTS = [];

    // Índice de produtos por categoria (para prev/next dentro da lista filtrada)
    let filteredIndexes = [];

    const categoryIcons = {
        'Isoladores': '',
        'Porteiras e Catracas': '',
        'Fios, Cabos, Tubos e Chaves': '',
        'Produtos Gerais': ''
    };

    // ─── Build full catalog ───────────────────────────────────────────
    function buildFullCatalog() {
        const categoryMap = {};
        const categoryOrder = [];
        PRODUCTS.forEach((p, i) => {
            if (!categoryMap[p.cat]) {
                categoryMap[p.cat] = [];
                categoryOrder.push(p.cat);
            }
            categoryMap[p.cat].push({ product: p, idx: i });
        });

        filteredIndexes = PRODUCTS.map((_, i) => i);

        let navHTML = '<div class="cat-nav" id="cat-nav">';
        categoryOrder.forEach(cat => {
            const slug = cat.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
            navHTML += `<a class="cat-nav-link" href="#cat-${slug}">${cat}</a>`;
        });
        navHTML += '</div>';

        let sectionsHTML = '';
        categoryOrder.forEach(cat => {
            const slug = cat.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
            const items = categoryMap[cat];

            sectionsHTML += `
            <div class="cat-section" id="cat-${slug}">
                <div class="cat-section-header">
                    <h2 class="cat-section-title">${cat}</h2>
                    <span class="cat-section-count">${items.length} produto${items.length > 1 ? 's' : ''}</span>
                </div>
                <div class="products-grid">`;

            items.forEach(({ product: p, idx }) => {
                // Thumb: use first color's first IMG if colors defined, else p.img
                const thumb = p.colors && p.colors[0] && p.colors[0].imgs && p.colors[0].imgs[0]
                    ? p.colors[0].imgs[0]
                    : (p.img || '');

                const imgHtml = thumb
                    ? `<div class="card-img-container">
                         <img class="grid-card-img" src="${thumb}" alt="${p.name}" loading="lazy">
                         <div class="watermark-overlay"></div>
                       </div>`
                    : `<div class="grid-card-img grid-card-no-img"><span>📷</span></div>`;

                const badgeHtml = p.has3d ? '<span class="badge-3d">3D</span>' : '';

                sectionsHTML += `
                    <div class="grid-card" data-idx="${idx}" id="card-${p.id}">
                        ${badgeHtml}
                        ${imgHtml}
                        <h3>${p.name}</h3>
                        <p>${p.specs.categoria}</p>
                    </div>`;
            });

            sectionsHTML += `</div></div>`;
        });

        viewArea.innerHTML = navHTML + sectionsHTML;

        viewArea.querySelectorAll('.grid-card').forEach(card => {
            card.addEventListener('click', () => openProduct(parseInt(card.dataset.idx)));
        });

        initNavHighlight();
    }

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

    // ─── Open Product Modal ────────────────────────────────────────────
    function openProduct(idx) {
        const p = PRODUCTS[idx];
        currentIdx = idx;
        currentProduct = p;

        viewArea.querySelectorAll('.grid-card').forEach(c => c.classList.remove('active'));
        const activeCard = document.getElementById('card-' + p.id);
        if (activeCard) activeCard.classList.add('active');

        // Update prev/next visibility
        const pos = filteredIndexes.indexOf(idx);
        modalPrev.style.visibility = pos > 0 ? 'visible' : 'hidden';
        modalNext.style.visibility = pos < filteredIndexes.length - 1 ? 'visible' : 'hidden';

        pCategory.textContent = p.specs.categoria;
        pName.textContent = p.name;
        pDesc.textContent = p.desc;
        sCat.textContent = p.specs.categoria;
        sMat.textContent = p.specs.material;
        sDim.textContent = p.specs.dimensao;
        sPedido.textContent = p.specs.pedido_minimo || '';

        // Badge "Disponível versão com pregos"
        let badgeEl = document.getElementById('product-badge');
        if (badgeEl) badgeEl.remove();
        if (p.badge) {
            badgeEl = document.createElement('div');
            badgeEl.id = 'product-badge';
            badgeEl.style.cssText = 'display:inline-flex;align-items:center;gap:6px;background:#f0f9ff;border:1px solid #bae6fd;color:#0369a1;font-size:.78rem;font-weight:600;padding:6px 12px;border-radius:6px;margin-bottom:12px;';
            badgeEl.innerHTML = `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg> ${p.badge}`;
            pName.insertAdjacentElement('afterend', badgeEl);
        }

        // Color swatches — sempre começa no índice 0 (Preto geralmente)
        // Código display
        if (p.colors && p.colors.length > 0) {
            // Para produtos com cores, o código já aparece em cada swatch
            singleCodigo.style.display = 'none';
            variantsSection.style.display = 'block';
            let swatchHTML = '';
            p.colors.forEach((c, ci) => {
                let codText = c.cod;
                if (Array.isArray(codText)) {
                    codText = codText.join(' | ');
                }
                const codLabel = codText ? `<small style="color:#6b7280;font-size:.7rem;">Cód: ${codText}</small>` : '';
                swatchHTML += `<button class="color-swatch${ci === 0 ? ' active' : ''}" data-color="${ci}">
                    <span class="color-dot ${c.class}"></span>
                    <span style="display:flex;flex-direction:column;align-items:flex-start;gap:1px">
                        ${c.name}
                        ${codLabel}
                    </span>
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
            // Show first color (index 0) — always Preto first
            showColorVariant(0);
        } else {
            variantsSection.style.display = 'none';
            // Mostra código no topo para produtos sem variante de cor
            if (p.specs.codigo) {
                let codeVal = p.specs.codigo;
                if (Array.isArray(codeVal)) {
                    codeVal = codeVal.join(' | ');
                }
                singleCodigoVal.textContent = codeVal;
                singleCodigo.style.display = 'block';
            } else {
                singleCodigo.style.display = 'none';
            }
            buildThumbs();
            // Only show main image if there is one
            if (p.img) {
                showMainImage(p.img);
            } else if (p.has3d) {
                buildThumbs();
                show3D();
            } else {
                showNoImage();
            }
        }

        if (!detailSection.classList.contains('visible')) {
            modalOverlay.classList.add('active');
            detailSection.classList.add('visible');
            document.body.style.overflow = 'hidden';
        }
    }

    function showNoImage() {
        galleryImg.style.display = 'none';
        gallery3d.style.display = 'none';
        if (galleryWatermark) galleryWatermark.style.display = 'none';
        galleryBadge.textContent = 'Foto em breve';
        galleryBadge.className = 'gallery-badge';
        galleryHint.style.display = 'none';
        viewerControls.style.display = 'none';
    }

    // ─── Prev / Next navigation ────────────────────────────────────────
    modalPrev.addEventListener('click', () => {
        const pos = filteredIndexes.indexOf(currentIdx);
        if (pos > 0) openProduct(filteredIndexes[pos - 1]);
    });

    modalNext.addEventListener('click', () => {
        const pos = filteredIndexes.indexOf(currentIdx);
        if (pos < filteredIndexes.length - 1) openProduct(filteredIndexes[pos + 1]);
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (!detailSection.classList.contains('visible')) return;
        if (e.key === 'ArrowLeft') modalPrev.click();
        if (e.key === 'ArrowRight') modalNext.click();
        if (e.key === 'Escape') closeModal();
    });

    // ─── Close ────────────────────────────────────────────────────────
    function closeModal() {
        modalOverlay.classList.remove('active');
        detailSection.classList.remove('visible');
        document.body.style.overflow = '';
        viewArea.querySelectorAll('.grid-card').forEach(c => c.classList.remove('active'));
    }

    modalClose.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', closeModal);

    // ─── Color Variant ──────────────────────────────────────────────────
    function showColorVariant(ci) {
        const p = currentProduct;
        if (!p.colors || !p.colors[ci]) return;
        const color = p.colors[ci];
        buildThumbs(ci);
        if (color.imgs && color.imgs.length > 0) {
            showMainImage(color.imgs[0]);
        } else if (p.has3d) {
            show3D();
        } else {
            showNoImage();
        }
    }

    // ─── Gallery Thumbs ─────────────────────────────────────────────────
    function buildThumbs(colorIdx) {
        const p = currentProduct;
        let html = '';
        const ci = colorIdx !== undefined ? colorIdx : 0;

        if (p.has3d) {
            html += `<div class="gallery-thumb thumb-3d" data-action="3d"><span>🎲 3D</span></div>`;
        }

        let imgList = [];
        if (p.colors && p.colors[ci] && p.colors[ci].imgs && p.colors[ci].imgs.length > 0) {
            imgList = p.colors[ci].imgs;
        } else if (p.imgs && p.imgs.length > 0) {
            imgList = p.imgs;
        }

        imgList.forEach((imgSrc, i) => {
            html += `<div class="gallery-thumb ${i === 0 && !p.has3d ? 'active' : ''}" data-action="img" data-src="${imgSrc}">
                <img src="${imgSrc}" alt="${p.name}">
            </div>`;
        });

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
        if (!src) { showNoImage(); return; }
        galleryImg.src = src;
        galleryImg.alt = currentProduct ? currentProduct.name : '';
        galleryImg.style.display = 'block';
        gallery3d.style.display = 'none';
        if (galleryWatermark) galleryWatermark.style.display = 'block';
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
        if (galleryWatermark) galleryWatermark.style.display = 'none';
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
    async function initCatalog() {
        try {
            const urls = [
                '/content/produtos-isoladores.json',
                '/content/produtos-porteiras.json',
                '/content/produtos-fios-chaves.json',
                '/content/produtos-gerais.json'
            ];
            const responses = await Promise.all(urls.map(u => fetch(u + '?_=' + Date.now()).catch(() => null)));
            const dataArrays = await Promise.all(
                responses.filter(r => r && r.ok).map(r => r.json())
            );
            
            PRODUCTS = [];
            dataArrays.forEach(d => {
                if (d && d.produtos) PRODUCTS.push(...d.produtos);
            });
            
            buildFullCatalog();
        } catch (e) {
            console.error('Erro ao carregar o catálogo de produtos:', e);
        }
    }
    
    initCatalog();
})();
