document.addEventListener('DOMContentLoaded', () => {
    // Mobile Menu Toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('.nav');

    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            nav.style.display = nav.style.display === 'flex' ? 'none' : 'flex';
            if (nav.style.display === 'flex') {
                nav.style.flexDirection = 'column';
                nav.style.position = 'absolute';
                nav.style.top = '80px';
                nav.style.left = '0';
                nav.style.width = '100%';
                nav.style.background = 'white';
                nav.style.padding = '20px';
                nav.style.boxShadow = '0 10px 20px rgba(0,0,0,0.1)';
            } else {
                nav.removeAttribute('style'); // Clean up inline styles
            }
        });
    }

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
