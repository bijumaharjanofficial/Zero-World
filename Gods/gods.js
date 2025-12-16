// Main data object to store all gods data
let godsData = null;

// DOM elements
const themeSwitch = document.getElementById('theme-switch');
const hamburger = document.getElementById('hamburger');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');
const supremeGodsGrid = document.getElementById('supreme-gods-grid');
const pantheonCards = document.getElementById('pantheon-cards');
const templesGrid = document.getElementById('temples-grid');
const pantheonAccordion = document.getElementById('pantheon-accordion');
const godModal = document.getElementById('god-modal');
const modalTitle = document.getElementById('modal-title');
const modalBody = document.getElementById('modal-body');
const closeModalBtn = document.querySelector('.close-modal');

// Current state
let currentGod = null;
const IMAGE_BASE_PATH = 'images/';

// Initialize the website
document.addEventListener('DOMContentLoaded', function () {
    // Load the gods data from gods.json
    loadGodsData();

    // Initialize event listeners
    initEventListeners();

    // Initialize smooth scrolling for navigation links
    initSmoothScrolling();
});

// Load gods data from gods.json file
async function loadGodsData() {
    try {
        console.log("Loading gods data from gods.json...");

        // Fetch the gods.json file
        const response = await fetch('gods.json');

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Parse the JSON data
        godsData = await response.json();

        console.log("Gods data loaded successfully");

        // Process the data
        renderSupremeGods();
        renderPantheonCards();
        renderTemples();
        renderPantheonAccordion();

    } catch (error) {
        console.error("Error loading gods data from gods.json:", error);

        // Show error message
        supremeGodsGrid.innerHTML = `
            <div class="error-message">
                <h3>Error loading data from gods.json</h3>
                <p>Please make sure the gods.json file exists in the same directory.</p>
                <p>Error details: ${error.message}</p>
            </div>
        `;

        // Load fallback sample data if fetch fails
        console.log("Loading fallback sample data...");
        loadFallbackData();
    }
}

// Initialize event listeners
function initEventListeners() {
    // Theme toggle
    if (themeSwitch) {
        themeSwitch.addEventListener('change', toggleTheme);
    }

    // Mobile menu toggle
    if (hamburger) {
        hamburger.addEventListener('click', toggleMobileMenu);
    }

    // Close mobile menu when clicking a link
    navLinks.forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });

    // Close modal
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeModal);
    }

    // Close modal when clicking outside
    if (godModal) {
        godModal.addEventListener('click', (e) => {
            if (e.target === godModal) closeModal();
        });
    }

    // Set active navigation link based on scroll position
    window.addEventListener('scroll', setActiveNavLink);
}

// Initialize smooth scrolling
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');

            // Skip if it's just "#"
            if (href === '#' || href === '#!') return;

            // Don't prevent default for normal links
            if (href.startsWith('http') || href.includes('.html')) return;

            e.preventDefault();

            const targetElement = document.querySelector(href);
            if (targetElement) {
                const headerHeight = document.querySelector('header').offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });

                // Update active nav link
                updateActiveNavLink(href);
            }
        });
    });
}

// Set active navigation link based on scroll position
function setActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const scrollPosition = window.scrollY + 100;

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        const sectionId = section.getAttribute('id');

        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            updateActiveNavLink(`#${sectionId}`);
        }
    });
}

// Update active navigation link
function updateActiveNavLink(targetId) {
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === targetId) {
            link.classList.add('active');
        }
    });
}

// Toggle between light and dark themes
function toggleTheme() {
    const body = document.body;
    if (themeSwitch.checked) {
        body.classList.remove('light-mode');
        body.classList.add('dark-mode');
        localStorage.setItem('theme', 'dark');
    } else {
        body.classList.remove('dark-mode');
        body.classList.add('light-mode');
        localStorage.setItem('theme', 'light');
    }
}

// Load saved theme from localStorage
function loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.remove('light-mode');
        document.body.classList.add('dark-mode');
        themeSwitch.checked = true;
    } else {
        document.body.classList.remove('dark-mode');
        document.body.classList.add('light-mode');
        themeSwitch.checked = false;
    }
}

// Toggle mobile menu
function toggleMobileMenu() {
    navMenu.classList.toggle('active');
    hamburger.innerHTML = navMenu.classList.contains('active')
        ? '<i class="fas fa-times"></i>'
        : '<i class="fas fa-bars"></i>';
}

// Close mobile menu
function closeMobileMenu() {
    navMenu.classList.remove('active');
    hamburger.innerHTML = '<i class="fas fa-bars"></i>';
}

// Render Supreme Gods section
function renderSupremeGods() {
    if (!godsData || !godsData.gods_data || !godsData.gods_data.pantheons) return;

    const pantheons = godsData.gods_data.pantheons;
    supremeGodsGrid.innerHTML = '';

    Object.entries(pantheons).forEach(([continent, pantheon]) => {
        const supremeGod = pantheon.supreme_god;

        const godCard = document.createElement('div');
        godCard.className = 'supreme-god-card';
        godCard.setAttribute('data-continent', continent);
        godCard.setAttribute('data-god-type', 'supreme');

        godCard.innerHTML = `
            <div class="god-card-img">
                <div class="god-card-badge">SUPREME</div>
                ${supremeGod.image ?
                `<img src="${IMAGE_BASE_PATH}${supremeGod.image}" alt="${supremeGod.name}" onerror="this.onerror=null; this.src='${IMAGE_BASE_PATH}placeholder.png';">` :
                `<div class="placeholder-img">
                        <i class="fas fa-crown"></i>
                    </div>`
            }
            </div>
            <div class="god-card-content">
                <h3>${supremeGod.name}</h3>
                <p class="god-card-subtitle">${supremeGod.title}</p>
                <p class="god-card-description">${supremeGod.description.substring(0, 120)}...</p>
                <div class="god-card-stats">
                    <div class="god-stat">
                        <span class="god-stat-value">${continent}</span>
                        <span class="god-stat-label">Continent</span>
                    </div>
                    <div class="god-stat">
                        <span class="god-stat-value">${supremeGod.domain.length}</span>
                        <span class="god-stat-label">Domains</span>
                    </div>
                    <div class="god-stat">
                        <span class="god-stat-value">10★</span>
                        <span class="god-stat-label">Power</span>
                    </div>
                </div>
            </div>
        `;

        godCard.addEventListener('click', () => {
            openGodModal(supremeGod, continent, 'supreme');
        });

        supremeGodsGrid.appendChild(godCard);
    });
}

// Render Pantheon Cards
function renderPantheonCards() {
    if (!godsData || !godsData.gods_data || !godsData.gods_data.pantheons) return;

    const pantheons = godsData.gods_data.pantheons;
    pantheonCards.innerHTML = '';

    Object.entries(pantheons).forEach(([continent, pantheon]) => {
        const pantheonCard = document.createElement('div');
        pantheonCard.className = 'pantheon-card';
        pantheonCard.setAttribute('data-continent', continent);

        // Get icon based on continent
        const icon = getPantheonIcon(continent);

        pantheonCard.innerHTML = `
            <div class="pantheon-icon">
                <i class="${icon}"></i>
            </div>
            <h3>${pantheon.pantheon_name}</h3>
            <p class="pantheon-inspiration">Inspired by ${pantheon.real_world_inspiration}</p>
            <div class="pantheon-stats">
                <div class="pantheon-stat">
                    <span class="pantheon-stat-value">1</span>
                    <span class="pantheon-stat-label">Supreme</span>
                </div>
                <div class="pantheon-stat">
                    <span class="pantheon-stat-value">${pantheon.high_gods.length}</span>
                    <span class="pantheon-stat-label">High Gods</span>
                </div>
                <div class="pantheon-stat">
                    <span class="pantheon-stat-value">${pantheon.low_gods.length}</span>
                    <span class="pantheon-stat-label">Low Gods</span>
                </div>
            </div>
        `;

        pantheonCard.addEventListener('click', () => {
            // Find the accordion item for this pantheon and open it
            const accordionItem = document.querySelector(`[data-accordion-continent="${continent}"]`);
            if (accordionItem && !accordionItem.classList.contains('active')) {
                accordionItem.querySelector('.accordion-header').click();
            }

            // Scroll to the accordion section
            document.getElementById('details').scrollIntoView({ behavior: 'smooth' });
        });

        pantheonCards.appendChild(pantheonCard);
    });
}

// Get pantheon icon based on continent
function getPantheonIcon(continent) {
    const icons = {
        'Eldoria': 'fas fa-mountain',
        'Mechanis': 'fas fa-cogs',
        'Spiritus': 'fas fa-sun',
        'Wildheart': 'fas fa-tree',
        'Aqualon': 'fas fa-water',
        'Skydrift': 'fas fa-cloud',
        'Shattered Expanse': 'fas fa-globe'
    };
    return icons[continent] || 'fas fa-temple';
}

// Render Temples section
function renderTemples() {
    if (!godsData || !godsData.gods_data || !godsData.gods_data.pantheons) return;

    const pantheons = godsData.gods_data.pantheons;
    templesGrid.innerHTML = '';

    Object.entries(pantheons).forEach(([continent, pantheon]) => {
        const supremeGod = pantheon.supreme_god;

        if (supremeGod.temples && Array.isArray(supremeGod.temples)) {
            supremeGod.temples.forEach(temple => {
                const templeCard = document.createElement('div');
                templeCard.className = 'temple-card';

                templeCard.innerHTML = `
                    <div class="temple-img">
                        <i class="fas fa-place-of-worship"></i>
                    </div>
                    <div class="temple-content">
                        <h3>${temple}</h3>
                        <p class="temple-pantheon">${pantheon.pantheon_name}</p>
                        <div class="temple-location">
                            <i class="fas fa-map-marker-alt"></i>
                            <span>${continent}</span>
                        </div>
                        <p class="temple-description">Sacred temple dedicated to ${supremeGod.name}, where followers gather to pay homage and seek blessings.</p>
                    </div>
                `;

                templesGrid.appendChild(templeCard);
            });
        }
    });

    // If no temples found, show message
    if (templesGrid.children.length === 0) {
        templesGrid.innerHTML = '<div class="no-temples"><h3>Temple data coming soon!</h3></div>';
    }
}

// Render Pantheon Accordion
function renderPantheonAccordion() {
    if (!godsData || !godsData.gods_data || !godsData.gods_data.pantheons) return;

    const pantheons = godsData.gods_data.pantheons;
    pantheonAccordion.innerHTML = '';

    Object.entries(pantheons).forEach(([continent, pantheon]) => {
        const accordionItem = document.createElement('div');
        accordionItem.className = 'accordion-item';
        accordionItem.setAttribute('data-accordion-continent', continent);

        accordionItem.innerHTML = `
            <div class="accordion-header">
                <h3>
                    <i class="fas fa-temple"></i>
                    ${pantheon.pantheon_name}
                    <span style="font-size: 0.9rem; opacity: 0.7; margin-left: 10px;">(${continent})</span>
                </h3>
                <i class="fas fa-chevron-down accordion-icon"></i>
            </div>
            <div class="accordion-content">
                <div class="god-list">
                    <h4><i class="fas fa-crown"></i> Supreme God</h4>
                    <div class="god-list-items">
                        <div class="god-list-item" data-god="${pantheon.supreme_god.name}" data-type="supreme" data-continent="${continent}">
                            <strong>${pantheon.supreme_god.name}</strong> - ${pantheon.supreme_god.title}
                        </div>
                    </div>
                </div>
                
                <div class="god-list">
                    <h4><i class="fas fa-star"></i> High Gods (${pantheon.high_gods.length})</h4>
                    <div class="god-list-items">
                        ${pantheon.high_gods.map(god => `
                            <div class="god-list-item" data-god="${god.name}" data-type="high" data-continent="${continent}">
                                <strong>${god.name}</strong> - ${god.title}
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="god-list">
                    <h4><i class="fas fa-gem"></i> Low Gods (${pantheon.low_gods.length})</h4>
                    <div class="god-list-items">
                        ${pantheon.low_gods.map(god => `
                            <div class="god-list-item" data-god="${god.name}" data-type="low" data-continent="${continent}">
                                <strong>${god.name}</strong> - ${god.domain.join(', ')}
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="god-list">
                    <h4><i class="fas fa-users"></i> Demi-Gods</h4>
                    <div class="god-list-items">
                        ${pantheon.demi_gods.map(god => `
                            <div class="god-list-item">
                                <strong>${god.name}</strong> - ${god.count} (${god.description})
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        // Add click event to accordion header
        const header = accordionItem.querySelector('.accordion-header');
        header.addEventListener('click', () => {
            // Close all other accordion items
            document.querySelectorAll('.accordion-item.active').forEach(item => {
                if (item !== accordionItem) {
                    item.classList.remove('active');
                }
            });

            // Toggle current item
            accordionItem.classList.toggle('active');
        });

        // Add click events to god list items
        const godItems = accordionItem.querySelectorAll('.god-list-item[data-god]');
        godItems.forEach(item => {
            item.style.cursor = 'pointer';
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                const godName = item.getAttribute('data-god');
                const godType = item.getAttribute('data-type');
                const continent = item.getAttribute('data-continent');

                // Find the god in the data
                let godData = null;
                if (godType === 'supreme') {
                    godData = pantheons[continent].supreme_god;
                } else if (godType === 'high') {
                    godData = pantheons[continent].high_gods.find(g => g.name === godName);
                } else if (godType === 'low') {
                    godData = pantheons[continent].low_gods.find(g => g.name === godName);
                }

                if (godData) {
                    openGodModal(godData, continent, godType);
                }
            });
        });

        pantheonAccordion.appendChild(accordionItem);
    });
}

// Open god modal with details
function openGodModal(godData, continent, godType) {
    const pantheon = godsData.gods_data.pantheons[continent];
    const typeLabels = {
        'supreme': 'Supreme God',
        'high': 'High God',
        'low': 'Low God'
    };

    modalTitle.textContent = `${godData.name} - ${typeLabels[godType] || 'Divine Being'}`;

    let modalHTML = `
        <div class="modal-section">
            ${godData.image ?
            `<img src="${IMAGE_BASE_PATH}${godData.image}" alt="${godData.name}" class="modal-image" onerror="this.onerror=null; this.src='${IMAGE_BASE_PATH}placeholder-large.png';">` :
            `<div class="modal-image placeholder-img-large">
                    <i class="${godType === 'supreme' ? 'fas fa-crown' : godType === 'high' ? 'fas fa-star' : 'fas fa-gem'}"></i>
                </div>`
        }
        </div>
        
        <div class="modal-stats">
            <div class="modal-stat">
                <span class="modal-stat-value">${continent}</span>
                <span class="modal-stat-label">Continent</span>
            </div>
            <div class="modal-stat">
                <span class="modal-stat-value">${pantheon.pantheon_name}</span>
                <span class="modal-stat-label">Pantheon</span>
            </div>
            <div class="modal-stat">
                <span class="modal-stat-value">${godData.stars || '10'}★</span>
                <span class="modal-stat-label">Divine Power</span>
            </div>
        </div>
        
        <div class="modal-section">
            <h3><i class="fas fa-info-circle"></i> Description</h3>
            <p>${godData.description}</p>
        </div>

        <div class="modal-section">
            <h3><i class="fa fa-book"></i> God Title</h3>
            <p>${godData.god_of}</p>
        </div>
        
        <div class="modal-section">
            <h3><i class="fas fa-crosshairs"></i> Domains</h3>
            <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-top: 10px;">
                ${godData.domain.map(domain => `
                    <span style="padding: 5px 12px; background: rgba(52, 152, 219, 0.1); border-radius: 20px; font-size: 0.9rem;">
                        ${domain}
                    </span>
                `).join('')}
            </div>
        </div>

        <div class="modal-section">
            <h3><i class="fa fa-book"></i> Lore</h3>
            <p>${godData.lore}</p>
        </div>
    `;

    if (godType === 'supreme') {
        // Add appearance for supreme gods
        if (godData.appearance) {
            modalHTML += `
                <div class="modal-section">
                    <h3><i class="fas fa-eye"></i> Appearance</h3>
                    <p>${godData.appearance}</p>
                </div>
            `;
        }

        // Add unique abilities for supreme gods
        if (godData.unique_abilities && godData.unique_abilities.length > 0) {
            modalHTML += `
                <div class="modal-section">
                    <h3><i class="fas fa-bolt"></i> Unique Abilities</h3>
                    ${godData.unique_abilities.map(ability => `
                        <div class="ability-item">
                            <h4>${ability.name} (${ability.stars}★)</h4>
                            <p><strong>Effect:</strong> ${ability.effect}</p>
                            <p><strong>Cooldown:</strong> ${ability.cooldown}</p>
                        </div>
                    `).join('')}
                </div>
                
            `;
        }

        // Add realm and symbols
        modalHTML += `
            <div class="modal-section">
                <h3><i class="fas fa-universe"></i> Divine Realm</h3>
                <p>${godData.realm}</p>
            </div>
            
            <div class="modal-section">
                <h3><i class="fas fa-symbols"></i> Sacred Symbols</h3>
                <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-top: 10px;">
                    ${godData.symbols.map(symbol => `
                        <span style="padding: 5px 12px; background: rgba(155, 89, 182, 0.1); border-radius: 20px; font-size: 0.9rem;">
                            ${symbol}
                        </span>
                    `).join('')}
                </div>
            </div>
            
            <div class="modal-section">
                <h3><i class="fas fa-paw"></i> Sacred Animals</h3>
                <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-top: 10px;">
                    ${godData.sacred_animals.map(animal => `
                        <span style="padding: 5px 12px; background: rgba(46, 204, 113, 0.1); border-radius: 20px; font-size: 0.9rem;">
                            ${animal}
                        </span>
                    `).join('')}
                </div>
            </div>
        `;
    }

    if (godType === 'high') {
        // Add unique ability for high gods
        if (godData.unique_ability) {
            modalHTML += `
                <div class="modal-section">
                    <h3><i class="fas fa-bolt"></i> Unique Ability</h3>
                    <div class="ability-item">
                        <h4>${godData.unique_ability}</h4>
                    </div>
                </div>
            `;
        }

        // Add favored by
        if (godData.favored_by && godData.favored_by.length > 0) {
            modalHTML += `
                <div class="modal-section">
                    <h3><i class="fas fa-users"></i> Favored By</h3>
                    <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-top: 10px;">
                        ${godData.favored_by.map(favored => `
                            <span style="padding: 5px 12px; background: rgba(231, 76, 60, 0.1); border-radius: 20px; font-size: 0.9rem;">
                                ${favored}
                            </span>
                        `).join('')}
                    </div>
                </div>
            `;
        }
    }

    modalBody.innerHTML = modalHTML;
    godModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Close modal
function closeModal() {
    if (godModal) {
        godModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Fallback data in case gods.json can't be loaded
function loadFallbackData() {
    // Minimal fallback data
    godsData = {
        gods_data: {
            pantheons: {
                'Eldoria': {
                    pantheon_name: 'Dharnic Celestial Order',
                    real_world_inspiration: 'Hindu Mythology',
                    supreme_god: {
                        name: 'Mahasvaran, The Weaver of Realities',
                        title: 'The Eternal Architect',
                        domain: ['Creation', 'Preservation', 'System Foundation', 'Reality Matrix'],
                        description: 'The supreme consciousness who wove the ley lines and system foundations of Eldoria.',
                        stars: 10,
                        realm: 'Brahmaloka',
                        symbols: ['Infinity knot', 'Cosmic egg', 'Serpent swallowing its tail'],
                        sacred_animals: ['Airavata', 'Garuda', 'Naga'],
                        unique_abilities: [
                            {
                                name: 'Sanatana Dharma',
                                stars: 10,
                                effect: 'Can rewrite local reality laws',
                                cooldown: 'Once per solar eclipse'
                            }
                        ]
                    },
                    high_gods: [
                        {
                            name: 'Agneyastra, The Forge-Flame',
                            title: 'Lord of Alchemical Fire',
                            domain: ['Fire', 'Transformation', 'Purification'],
                            stars: 9,
                            description: 'God of all transformative processes.',
                            unique_ability: 'Samskara\'s Fire',
                            favored_by: ['Dwarves', 'Alchemists', 'Blacksmiths']
                        }
                    ],
                    low_gods: [
                        {
                            name: 'Vanadevi, Forest\'s Whisper',
                            domain: ['Forests', 'Beasts', 'Secrets'],
                            stars: 7,
                            description: 'Goddess of wild places and their inhabitants.'
                        }
                    ],
                    demi_gods: [
                        {
                            name: 'Ley-Line Spirits',
                            count: 'Hundreds',
                            description: 'Minor deities born from ley line convergences'
                        }
                    ]
                }
            }
        }
    };

    renderSupremeGods();
    renderPantheonCards();
    renderTemples();
    renderPantheonAccordion();
}

// Load saved theme when page loads
window.addEventListener('DOMContentLoaded', () => {
    loadTheme();
});