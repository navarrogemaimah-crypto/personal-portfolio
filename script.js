
/* =========================
   DARK MODE TOGGLE
========================= */

const themeToggle = document.getElementById("theme-toggle");

// Apply the saved theme when the page loads
const savedTheme = localStorage.getItem("portfolio-theme");

if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
} else {
    document.body.classList.remove("dark-mode");
}

// Update the button icon
function updateThemeIcon() {
    if (!themeToggle) return;

    if (document.body.classList.contains("dark-mode")) {
        themeToggle.textContent = "☀️";
        themeToggle.setAttribute("aria-label", "Switch to light mode");
        themeToggle.setAttribute("title", "Switch to light mode");
    } else {
        themeToggle.textContent = "🌙";
        themeToggle.setAttribute("aria-label", "Switch to dark mode");
        themeToggle.setAttribute("title", "Switch to dark mode");
    }
}

// Listen for button clicks
if (themeToggle) {
    updateThemeIcon();

    themeToggle.addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");

        // Save the selected theme
        const currentTheme = document.body.classList.contains("dark-mode")
            ? "dark"
            : "light";

        localStorage.setItem("portfolio-theme", currentTheme);

        // Update the button icon
        updateThemeIcon();
    });
}
