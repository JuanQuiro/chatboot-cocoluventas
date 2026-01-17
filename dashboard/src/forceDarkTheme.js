/**
 * Force Dark Theme - JavaScript DOM Enforcer
 * This script actively monitors and forces dark theme on ALL elements
 */

const DARK_COLORS = {
    background: '#1e293b',
    backgroundDark: '#0f172a',
    surface: '#1e293b',
    surfaceHover: '#334155',
    text: '#f1f5f9',
    textSecondary: '#94a3b8',
    border: '#334155',
    primary: '#60a5fa',
};

// Elements that should NEVER be white
const WHITE_BACKGROUNDS = [
    'rgb(255, 255, 255)',
    '#fff',
    '#ffffff',
    'white',
    'rgb(248, 248, 248)',
    'rgb(249, 250, 251)',
    '#f9fafb',
    '#f8f8f8',
];

const LIGHT_TEXT_COLORS = [
    'rgb(0, 0, 0)',
    '#000',
    '#000000',
    'black',
    'rgb(31, 41, 55)',
    '#1f2937',
];

function hasWhiteBackground(element) {
    const bg = window.getComputedStyle(element).backgroundColor;
    return WHITE_BACKGROUNDS.some(white => bg.includes(white.replace(/\s/g, '')));
}

function hasLightText(element) {
    const color = window.getComputedStyle(element).color;
    return LIGHT_TEXT_COLORS.some(light => color.includes(light.replace(/\s/g, '')));
}

function forceDarkStyle(element) {
    // Skip if it's the header gradient or already dark
    if (element.classList?.contains('header')) return;

    const computed = window.getComputedStyle(element);

    // Force dark background on white elements
    if (hasWhiteBackground(element)) {
        element.style.setProperty('background-color', DARK_COLORS.background, 'important');
        element.style.setProperty('background', DARK_COLORS.background, 'important');
    }

    // Force light text on dark backgrounds
    if (hasLightText(element)) {
        element.style.setProperty('color', DARK_COLORS.text, 'important');
    }

    // Force dark borders
    const borderColor = computed.borderColor;
    if (borderColor && (borderColor.includes('255') || borderColor.includes('rgb(229'))) {
        element.style.setProperty('border-color', DARK_COLORS.border, 'important');
    }
}

function processAllElements() {
    // Get ALL elements in the document
    const allElements = document.querySelectorAll('*');

    allElements.forEach(element => {
        forceDarkStyle(element);
    });
}

function setupMutationObserver() {
    // Watch for new elements being added
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === 1) { // Element node
                    forceDarkStyle(node);
                    // Also process all children
                    node.querySelectorAll?.('*').forEach(child => {
                        forceDarkStyle(child);
                    });
                }
            });
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class'],
    });

    return observer;
}

// Initialize
function init() {
    console.log('🌙 Force Dark Theme: Initializing...');

    // Process existing elements
    processAllElements();

    // Watch for new elements
    setupMutationObserver();

    // Re-process periodically to catch any stragglers
    setInterval(processAllElements, 1000);

    console.log('✅ Force Dark Theme: Active');
}

// Run on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

export default { init, processAllElements };
