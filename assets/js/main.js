document.addEventListener('DOMContentLoaded', () => {
    // Mobile Menu Toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('.nav');

    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            nav.classList.toggle('active');
            document.body.classList.toggle('menu-open');
        });
    }

    // Mobile Dropdown Handle
    const dropdowns = document.querySelectorAll('.dropdown > a');
    dropdowns.forEach(dropdown => {
        dropdown.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                e.preventDefault();
                dropdown.parentElement.classList.toggle('active');
            }
        });
    });

    // Smooth Scrolling for Anchors
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }
        });
    });

    // Reveal Animations on Scroll
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    // Add 'fade-in-up' class to sections you want to animate
    document.querySelectorAll('.section').forEach(section => {
        section.classList.add('fade-in-up');
        observer.observe(section);
    });
});

// Splash Screen Animation (FLIP)
window.addEventListener('load', () => {
    const splashScreen = document.getElementById('splash-screen');
    const splashLogo = document.getElementById('splash-logo');
    const headerLogo = document.querySelector('.logo img');

    if (splashScreen && splashLogo && headerLogo) {
        // Check if splash has already been shown in this session
        if (sessionStorage.getItem('splashShown')) {
            // Already shown, hide splash immediately and show content
            splashScreen.style.display = 'none';
            headerLogo.style.opacity = '1';
            headerLogo.classList.add('visible');
            document.body.classList.add('loaded');
            return;
        }

        // Mark as shown for next time
        sessionStorage.setItem('splashShown', 'true');

        // Use requestAnimationFrame to ensure layout is settled
        requestAnimationFrame(() => {
            // 1. Get initial positions
            const splashRect = splashLogo.getBoundingClientRect();
            const headerRect = headerLogo.getBoundingClientRect();

            // 2. Calculate scale
            // Compare widths to determine scale factor
            const scale = headerRect.width / splashRect.width;

            // 3. Calculate translation
            const splashCX = splashRect.left + splashRect.width / 2;
            const splashCY = splashRect.top + splashRect.height / 2;

            const headerCX = headerRect.left + headerRect.width / 2;
            const headerCY = headerRect.top + headerRect.height / 2;

            const translateX = headerCX - splashCX;
            const translateY = headerCY - splashCY;

            // 5. Set initial styles
            splashLogo.style.transformOrigin = 'center center';

            // Wait 1.0s before starting the animation (Hold Logo)
            setTimeout(() => {
                // Apply transformation with smoother timing
                splashLogo.style.transition = 'transform 2.0s cubic-bezier(0.22, 1, 0.36, 1)'; // Faster (was 2.5s)
                splashLogo.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;

                // 6. Fade out splash screen background smoothly
                // Wait a bit so the logo starts moving on white, then fade to content
                setTimeout(() => {
                    splashScreen.style.transition = 'background-color 1.5s ease-out, opacity 1.5s ease-out, visibility 1.5s';
                    splashScreen.style.backgroundColor = 'transparent'; // Reveal site

                    // 7. Finalize
                    setTimeout(() => {
                        splashScreen.style.opacity = '0';
                        splashScreen.style.visibility = 'hidden';

                        // Ensure header logo is visible and splash is gone
                        headerLogo.style.opacity = '1';
                        headerLogo.classList.add('visible');
                        document.body.classList.add('loaded');
                    }, 2100); // Wait for transition to finish (2000ms + buffer)

                }, 800); // Start fading background sooner
            }, 1000); // Initial hold delay
        });
    } else {
        document.body.classList.add('loaded');
        if (headerLogo) headerLogo.classList.add('visible');
    }
});

// Protection: Prevent right-click, image dragging, and show Toast notice
document.addEventListener('DOMContentLoaded', () => {
    // Disable right-click on images, cards and modal overlay/watermarks
    document.addEventListener('contextmenu', (e) => {
        const isProtected = e.target.tagName === 'IMG' || 
                            e.target.classList.contains('watermark-overlay') || 
                            e.target.closest('.gallery-main') || 
                            e.target.closest('.card-img-container');
        if (isProtected) {
            e.preventDefault();
            showCopyrightToast();
        }
    });

    // Disable dragging on images
    document.addEventListener('dragstart', (e) => {
        if (e.target.tagName === 'IMG') {
            e.preventDefault();
        }
    });

    // Elegant toast notification
    function showCopyrightToast() {
        let toast = document.getElementById('copyright-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'copyright-toast';
            toast.style.cssText = `
                position: fixed;
                bottom: 30px;
                left: 50%;
                transform: translateX(-50%) translateY(100px);
                background-color: var(--dark-sea-blue, #003D58);
                color: #FFFFFF;
                padding: 12px 24px;
                border-radius: 8px;
                font-family: 'Poppins', sans-serif;
                font-size: 0.8rem;
                font-weight: 600;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
                z-index: 10000;
                transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s;
                opacity: 0;
                pointer-events: none;
                text-align: center;
                border-left: 4px solid var(--sea-blue, #006CBC);
                max-width: 90%;
                line-height: 1.4;
            `;
            toast.innerHTML = '⚖️ Uso não autorizado das imagens é proibido por lei (Direitos Autorais)';
            document.body.appendChild(toast);
        }
        
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(-50%) translateY(0)';
        
        clearTimeout(toast.timeoutId);
        toast.timeoutId = setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(-50%) translateY(100px)';
        }, 3000);
    }
});
