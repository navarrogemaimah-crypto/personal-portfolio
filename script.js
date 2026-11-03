// ========================================
// 1. PAGE NAVIGATION
// ========================================

const pages = document.querySelectorAll(".page");
const navLinks = document.querySelectorAll(".nav-link");

function showPage(pageId, updateHistory = true) {
    const selectedPage = document.getElementById(pageId);

    if (!selectedPage || !selectedPage.classList.contains("page")) {
        return;
    }

    pages.forEach(page => {
        page.classList.remove("active");
        page.setAttribute("aria-hidden", "true");
    });

    selectedPage.classList.add("active");
    selectedPage.setAttribute("aria-hidden", "false");

    navLinks.forEach(link => {
        const isActive = link.dataset.page === pageId;

        link.classList.toggle("active", isActive);
        link.setAttribute("aria-pressed", isActive ? "true" : "false");
    });

    if (updateHistory && window.location.hash !== `#${pageId}`) {
        history.pushState({ page: pageId }, "", `#${pageId}`);
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

// Navigation buttons
document.querySelectorAll("[data-page]").forEach(button => {
    button.addEventListener("click", function (event) {
        event.preventDefault();
        showPage(this.dataset.page);
    });
});

// Browser back and forward
window.addEventListener("popstate", function () {
    const pageId = window.location.hash.replace("#", "") || "home";
    showPage(pageId, false);
});

// Initial page
const initialPage = window.location.hash.replace("#", "") || "home";
showPage(initialPage, false);

// Back to home button
const backToTop = document.getElementById("back-to-top");

if (backToTop) {
    backToTop.addEventListener("click", function () {
        showPage("home");
    });
}


// ========================================
// 2. DAY / NIGHT THEME
// ========================================

const themeToggle = document.getElementById("theme-toggle");

let savedTheme = "dark";

try {
    savedTheme = localStorage.getItem("portfolio-theme") || "dark";
} catch (error) {
    console.log("Theme preference could not be loaded.");
}

// Apply saved theme
document.body.classList.toggle("light-mode", savedTheme === "light");

// Update theme icon
function updateThemeIcon() {
    if (!themeToggle) return;

    const isLightMode = document.body.classList.contains("light-mode");

    themeToggle.textContent = isLightMode ? "🌙" : "☀️";

    themeToggle.setAttribute(
        "aria-label",
        isLightMode ? "Switch to dark mode" : "Switch to light mode"
    );

    themeToggle.setAttribute(
        "title",
        isLightMode ? "Switch to dark mode" : "Switch to light mode"
    );
}

updateThemeIcon();

// Toggle theme
if (themeToggle) {
    themeToggle.addEventListener("click", function () {
        document.body.classList.toggle("light-mode");

        const currentTheme = document.body.classList.contains("light-mode")
            ? "light"
            : "dark";

        try {
            localStorage.setItem("portfolio-theme", currentTheme);
        } catch (error) {
            console.log("Theme preference could not be saved.");
        }

        updateThemeIcon();

        // Refresh particle colors after changing theme
        if (typeof drawParticles === "function") {
            drawParticles();
        }
    });
}


// ========================================
// 3. ANIMATED PARTICLE BACKGROUND
// ========================================

const canvas = document.getElementById("particles");
const ctx = canvas ? canvas.getContext("2d") : null;

let particles = [];
let animationFrame = null;
let canvasWidth = 0;
let canvasHeight = 0;

const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
);

// Check current theme
function isDayMode() {
    return document.body.classList.contains("light-mode");
}

// Create particles
function createParticles() {
    const particleCount = Math.min(
        75,
        Math.max(35, Math.floor(canvasWidth / 18))
    );

    particles = [];

    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * canvasWidth,
            y: Math.random() * canvasHeight,
            size: Math.random() * 2 + 0.5,
            speedX: (Math.random() - 0.5) * 0.5,
            speedY: (Math.random() - 0.5) * 0.5,
            opacity: Math.random() * 0.5 + 0.25
        });
    }
}

// Resize canvas
function resizeCanvas() {
    if (!canvas || !ctx) return;

    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

    canvasWidth = window.innerWidth;
    canvasHeight = window.innerHeight;

    canvas.width = canvasWidth * pixelRatio;
    canvas.height = canvasHeight * pixelRatio;

    canvas.style.width = canvasWidth + "px";
    canvas.style.height = canvasHeight + "px";

    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

    createParticles();
    drawParticles();

    if (!reducedMotion.matches && !document.hidden) {
        startAnimation();
    }
}

// Draw particles and connecting lines
function drawParticles() {
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    const dayMode = isDayMode();

    // Different colors for Day and Night
    const lineColor = dayMode
        ? "0, 127, 159"
        : "0, 229, 255";

    const particleColor = dayMode
        ? "#55bce8"
        : "#7dd3fc";

    const glowColor = dayMode
        ? "#69c9ef"
        : "#38bdf8";

    // Connecting lines
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;

            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 130) {
                const opacity = (1 - distance / 130) *
                    (dayMode ? 0.16 : 0.28);

                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);

                ctx.strokeStyle = `rgba(${lineColor}, ${opacity})`;
                ctx.lineWidth = 0.7;
                ctx.stroke();
            }
        }
    }

    // Individual particles
    particles.forEach(particle => {
        ctx.beginPath();

        ctx.arc(
            particle.x,
            particle.y,
            particle.size,
            0,
            Math.PI * 2
        );

        ctx.fillStyle = particleColor;
        ctx.shadowBlur = dayMode ? 5 : 10;
        ctx.shadowColor = glowColor;

        ctx.globalAlpha = particle.opacity;
        ctx.fill();
        ctx.globalAlpha = 1;

        ctx.shadowBlur = 0;
    });
}

// Move particles
function updateParticles() {
    particles.forEach(particle => {
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        if (particle.x < 0) particle.x = canvasWidth;
        if (particle.x > canvasWidth) particle.x = 0;

        if (particle.y < 0) particle.y = canvasHeight;
        if (particle.y > canvasHeight) particle.y = 0;
    });
}

// Animation loop
function animateParticles() {
    if (reducedMotion.matches || document.hidden) {
        animationFrame = null;
        return;
    }

    updateParticles();
    drawParticles();

    animationFrame = requestAnimationFrame(animateParticles);
}

// Start animation
function startAnimation() {
    if (
        canvas &&
        ctx &&
        animationFrame === null &&
        !reducedMotion.matches &&
        !document.hidden
    ) {
        animationFrame = requestAnimationFrame(animateParticles);
    }
}

// Stop animation
function stopAnimation() {
    if (animationFrame !== null) {
        cancelAnimationFrame(animationFrame);
        animationFrame = null;
    }
}

// Initialize particles
if (canvas && ctx) {
    resizeCanvas();

    window.addEventListener("resize", resizeCanvas);

    document.addEventListener("visibilitychange", function () {
        if (document.hidden) {
            stopAnimation();
        } else {
            startAnimation();
        }
    });

    reducedMotion.addEventListener("change", function () {
        if (reducedMotion.matches) {
            stopAnimation();
            drawParticles();
        } else {
            startAnimation();
        }
    });
}


// ========================================
// 4. LOADING SCREEN
// ========================================

const loader = document.getElementById("loader");

function hideLoader() {
    if (loader) {
        loader.classList.add("hidden");
    }
}

if (document.readyState === "complete") {
    setTimeout(hideLoader, 500);
} else {
    window.addEventListener("load", function () {
        setTimeout(hideLoader, 500);
    });
}


// ========================================
// 5. WEBSITE READY
// ========================================

console.log("Portfolio website is ready!");
