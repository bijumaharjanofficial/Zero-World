// Main data object to store all world data
let worldData = null;

// DOM elements
const themeSwitch = document.getElementById('theme-switch');
const hamburger = document.getElementById('hamburger');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');
const viewContinentsBtn = document.getElementById('view-continents');
const viewBeastsBtn = document.getElementById('view-beasts');
const heroTitle = document.getElementById('hero-title');
const heroDescription = document.getElementById('hero-description');
const heroSA = document.getElementById('hero-sa');
const heroTheme = document.getElementById('hero-theme');
const rulersGrid = document.getElementById('rulers-grid');
const heroesGrid = document.getElementById('heroes-grid');
const additionalHeroesGrid = document.getElementById('additional-heroes-grid');
const additionalVillainsGrid = document.getElementById('additional-villains-grid');
const bossesGrid = document.getElementById('bosses-grid');
const beastsSwiperContainer = document.getElementById('beasts-swiper');
const continentsGrid = document.querySelector('.continents-grid');
const detailsModal = document.getElementById('details-modal');
const modalTitle = document.getElementById('modal-title');
const modalBody = document.getElementById('modal-body');
const closeModalBtn = document.querySelector('.close-modal');
const filterBtns = document.querySelectorAll('.filter-btn');
const rankFilters = document.querySelectorAll('.rank-filter');
const saSlider = document.getElementById('sa-slider');
const saValue = document.getElementById('sa-value');
const saDescription = document.getElementById('sa-description');
const gachaDrawBtn = document.getElementById('gacha-draw');
const gachaResults = document.getElementById('gacha-results');
const carouselPrevBtn = document.getElementById('carousel-prev');
const carouselNextBtn = document.getElementById('carousel-next');
const carouselIndicators = document.querySelectorAll('.indicator');
const carouselSlides = document.querySelectorAll('.carousel-slide');
const IMAGE_BASE_PATH = 'images/';

// Current state
let currentHeroView = 'continents';
let currentCarouselIndex = 0;
let currentRulerFilter = 'all';
let currentBeastRankFilter = 'all';
let currentBeastContinentFilter = 'all';
let beastSwiper = null;
let allRulers = [];
let allHeroes = [];
let allAdditionalHeroes = [];
let allAdditionalVillains = [];
let allBosses = [];
let allBeasts = [];
let allContinents = [];

// Initialize the website
document.addEventListener('DOMContentLoaded', function () {
    // Load the world data from data.json
    loadWorldData();

    // Initialize event listeners
    initEventListeners();

    // Initialize swiper for beasts
    initSwiper();

    // Initialize SA slider
    initSASlider();

    // Initialize gacha system
    initGachaSystem();

    // Initialize carousel
    initCarousel();

    // Initialize beast continent filters
    initBeastContinentFilters();
});

// Load world data from data.json file
async function loadWorldData() {
    try {
        console.log("Loading world data from data.json...");

        // Fetch the data.json file
        const response = await fetch('data.json');

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Parse the JSON data
        worldData = await response.json();

        console.log("World data loaded successfully:", worldData.world.name);

        // Process the data
        processWorldData();
        processCouncilData();

        // Render initial content
        renderContinents();
        renderRulers();
        renderHeroes();
        renderBeasts();
        renderBosses();
        renderAdditionalHeroes();
        renderAdditionalVillains();

    } catch (error) {
        console.error("Error loading world data from data.json:", error);

        // Show error message
        rulersGrid.innerHTML = `
            <div class="error-message">
                <h3>Error loading data from data.json</h3>
                <p>Please make sure the data.json file exists in the same directory as the HTML file.</p>
                <p>Error details: ${error.message}</p>
            </div>
        `;

        // Load fallback sample data if fetch fails
        console.log("Loading fallback sample data...");
        loadFallbackData();
    }
}

// Process the world data from the JSON structure
function processWorldData() {
    if (!worldData || !worldData.continents) {
        console.error("Invalid data structure or missing continents");
        return;
    }

    // Reset arrays
    allRulers = [];
    allHeroes = [];
    allAdditionalHeroes = [];  // NEW
    allAdditionalVillains = []; // NEW
    allBosses = [];            // NEW
    allBeasts = [];
    allContinents = worldData.continents || [];

    // Extract rulers, heroes, and beasts from each continent
    allContinents.forEach(continent => {
        // Process nations in the continent
        if (continent.nations && Array.isArray(continent.nations)) {
            continent.nations.forEach(nation => {
                // Add ruler(s)
                if (nation.ruler) {
                    const ruler = {
                        ...nation.ruler,
                        continent: continent.name,
                        nation: nation.name,
                        sa_level: nation.sa_level
                    };
                    allRulers.push(ruler);
                }

                // Handle Verdant Covenant's diarchy structure
                if (nation.rulers && nation.rulers.type === "Diarchy") {
                    if (nation.rulers.chieftain) {
                        const chieftain = {
                            ...nation.rulers.chieftain,
                            continent: continent.name,
                            nation: nation.name,
                            sa_level: nation.sa_level
                        };
                        allRulers.push(chieftain);
                    }

                    if (nation.rulers.grove_mother) {
                        const groveMother = {
                            ...nation.rulers.grove_mother,
                            continent: continent.name,
                            nation: nation.name,
                            sa_level: nation.sa_level
                        };
                        allRulers.push(groveMother);
                    }
                }

                // Add national hero
                if (nation.national_hero) {
                    const hero = {
                        ...nation.national_hero,
                        continent: continent.name,
                        nation: nation.name,
                        sa_level: nation.sa_level
                    };
                    allHeroes.push(hero);
                }

                // NEW: Add additional heroes if they exist
                if (nation.additional_heroes && Array.isArray(nation.additional_heroes)) {
                    nation.additional_heroes.forEach(hero => {
                        const additionalHero = {
                            ...hero,
                            continent: continent.name,
                            nation: nation.name,
                            sa_level: nation.sa_level
                        };
                        allAdditionalHeroes.push(additionalHero);
                    });
                }

                // NEW: Add additional villain if it exists
                if (nation.additional_villain && Array.isArray(nation.additional_villain)) {
                    nation.additional_villain.forEach(villian => {
                        const additionalVillain = {
                            ...villian,
                            continent: continent.name,
                            nation: nation.name,
                            sa_level: nation.sa_level
                        };
                        allAdditionalVillains.push(additionalVillain);
                    });
                }


                // if (nation.additional_villain) {
                //     const additionalVillain = {
                //         ...nation.additional_villain,
                //         continent: continent.name,
                //         nation: nation.name,
                //         sa_level: nation.sa_level
                //     };
                //     allAdditionalVillains.push(additionalVillain);
                // }
            });
        }

        // START: NEW: Process dungeons to extract bosses
        if (continent.dungeons && Array.isArray(continent.dungeons)) {
            continent.dungeons.forEach(dungeon => {
                if (dungeon.boss) {
                    const boss = {
                        ...dungeon.boss,
                        continent: continent.name,
                        dungeon: dungeon.name,
                        recommended_level: dungeon.recommended_level,
                        location: dungeon.location
                    };
                    allBosses.push(boss);
                }
            });
        }

        // Add beasts from bestiary
        if (continent.bestiary && continent.bestiary.monsters && Array.isArray(continent.bestiary.monsters)) {
            continent.bestiary.monsters.forEach(monster => {
                const beast = {
                    ...monster,
                    continent: continent.name
                };
                allBeasts.push(beast);
            });
        }
    });

    console.log(`Processed ${allRulers.length} rulers, ${allHeroes.length} heroes, ${allBeasts.length} beasts from ${allContinents.length} continents`);
}

// Fallback data in case data.json can't be loaded
function loadFallbackData() {
    // This is a minimal version of the actual data for fallback
    worldData = {
        world: {
            name: "Zero",
            type: "Creation Engine",
            core_system: {
                name: "System",
                nature: "Universal holographic-like interface governing reality"
            }
        },
        continents: [
            {
                id: 1,
                name: "Eldoria",
                theme: "Stable Fantasy & Predictable Magic",
                system_authority_range: "SA 2-4",
                description: "The 'tutorial continent' where System runs predictably",
                nations: [
                    {
                        name: "Arcane Dominion of Luminar",
                        sa_level: 2,
                        ruler: {
                            name: "King Valerius the Ley-Binder",
                            race: "High Elf",
                            unique_skill: {
                                name: "Aetheric Resonance",
                                stars: 8
                            },
                            description: "High Elf of serene authority with silver-white hair."
                        },
                        national_hero: {
                            name: "Lady Lyra 'Starshard'",
                            level: 820,
                            title: "The Whispering Assassin"
                        }
                    }
                ],
                bestiary: {
                    monsters: [
                        {
                            name: "The Unbound Arbiter, Aion",
                            stars: 10,
                            rank: "X-Rank Calamity",
                            description: "A living fragment of the Creation Engine's original debugging protocols."
                        }
                    ]
                }
            }
        ]
    };

    // Process the fallback data
    processWorldData();

    // Render content
    renderContinents();
    renderRulers();
    renderHeroes();
    renderBeasts();
}

// Initialize continent filters for beasts
function initBeastContinentFilters() {
    // Get all continent filter buttons
    const continentFilters = document.querySelectorAll('.continent-filter');
    
    if (continentFilters.length === 0) {
        console.error("Continent filter buttons not found!");
        return;
    }
    
    // Add click event to each filter button
    continentFilters.forEach(filter => {
        filter.addEventListener('click', () => {
            // Remove active class from all continent filter buttons
            document.querySelectorAll('.continent-filter').forEach(f => {
                f.classList.remove('active');
            });
            
            // Add active class to clicked button
            filter.classList.add('active');
            
            // Set current continent filter
            currentBeastContinentFilter = filter.getAttribute('data-continent');
            
            // Render filtered beasts
            renderBeasts();
        });
    });
    
    console.log("Continent filters initialized");
}

// Initialize event listeners
function initEventListeners() {
    // Theme toggle
    themeSwitch.addEventListener('change', toggleTheme);

    // Mobile menu toggle
    hamburger.addEventListener('click', toggleMobileMenu);

    // Close mobile menu when clicking a link
    navLinks.forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });

    // Hero view toggle
    viewContinentsBtn.addEventListener('click', () => switchHeroView('continents'));
    viewBeastsBtn.addEventListener('click', () => switchHeroView('beasts'));

    // Close modal
    closeModalBtn.addEventListener('click', closeModal);
    detailsModal.addEventListener('click', (e) => {
        if (e.target === detailsModal) closeModal();
    });

    // Ruler filters
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            filterBtns.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            btn.classList.add('active');
            // Set current filter
            currentRulerFilter = btn.getAttribute('data-filter');
            // Render filtered rulers
            renderRulers();
        });
    });

    // Beast rank filters
    rankFilters.forEach(filter => {
        filter.addEventListener('click', () => {
            // Remove active class from all buttons
            rankFilters.forEach(f => f.classList.remove('active'));
            // Add active class to clicked button
            filter.classList.add('active');
            // Set current filter
            currentBeastRankFilter = filter.getAttribute('data-rank');
            // Render filtered beasts
            renderBeasts();
        });
    });

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Footer continent links
    document.querySelectorAll('[data-continent]').forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const continentName = this.getAttribute('data-continent');
            // Filter and show rulers from this continent
            filterBtns.forEach(btn => {
                if (btn.getAttribute('data-filter') === continentName.toLowerCase()) {
                    btn.click();
                    // Scroll to rulers section
                    document.getElementById('kings').scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
    });
}

// Initialize swiper for beasts
function initSwiper() {
    beastSwiper = new Swiper('.swiper-container', {
        slidesPerView: 1,
        spaceBetween: 20,
        loop: true,
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        breakpoints: {
            640: {
                slidesPerView: 2,
            },
            992: {
                slidesPerView: 3,
            },
            1200: {
                slidesPerView: 4,
            }
        }
    });
}

// Initialize SA slider
function initSASlider() {
    saSlider.addEventListener('input', function () {
        const value = this.value;
        saValue.textContent = value;

        // Update description based on SA value
        let description = "";
        if (value <= 3) {
            description = "Predictable magic, stable ley lines, standard loot multipliers";
        } else if (value <= 6) {
            description = "Moderate instability, variable magic effects, increased loot chances";
        } else if (value <= 8) {
            description = "High instability, reality-bending effects, significantly enhanced loot";
        } else {
            description = "Extreme chaos, unpredictable reality, legendary loot possibilities";
        }

        saDescription.textContent = description;
    });
}

// Initialize gacha system
function initGachaSystem() {
    gachaDrawBtn.addEventListener('click', drawGacha);
}

// Initialize carousel
function initCarousel() {
    // Set up carousel controls
    carouselPrevBtn.addEventListener('click', () => {
        changeCarouselSlide(currentCarouselIndex - 1);
    });

    carouselNextBtn.addEventListener('click', () => {
        changeCarouselSlide(currentCarouselIndex + 1);
    });

    // Set up indicators
    carouselIndicators.forEach(indicator => {
        indicator.addEventListener('click', () => {
            const index = parseInt(indicator.getAttribute('data-index'));
            changeCarouselSlide(index);
        });
    });

    // Auto-rotate carousel
    setInterval(() => {
        changeCarouselSlide(currentCarouselIndex + 1);
    }, 100000);
}

// Toggle between light and dark themes
function toggleTheme() {
    const body = document.body;
    if (themeSwitch.checked) {
        body.classList.remove('light-mode');
        body.classList.add('dark-mode');
    } else {
        body.classList.remove('dark-mode');
        body.classList.add('light-mode');
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

// Switch hero view between continents and beasts
function switchHeroView(view) {
    currentHeroView = view;

    // Update button states
    if (view === 'continents') {
        viewContinentsBtn.classList.add('active');
        viewBeastsBtn.classList.remove('active');
    } else {
        viewContinentsBtn.classList.remove('active');
        viewBeastsBtn.classList.add('active');
    }

    // Update hero content based on view
    updateHeroContentForCurrentSlide();
}

// Update hero content for the current slide
function updateHeroContentForCurrentSlide() {
    if (currentHeroView === 'continents') {
        // Show continent info
        const currentContinent = allContinents[currentCarouselIndex];
        if (currentContinent) {
            updateHeroContent(
                currentContinent.name,
                currentContinent.description || "No description available",
                currentContinent.system_authority_range || "Unknown",
                currentContinent.theme || "Unknown theme"
            );
        }
    } else {
        // Show beast info
        const beastIndex = currentCarouselIndex % Math.max(allBeasts.length, 1);
        const currentBeast = allBeasts[beastIndex];
        if (currentBeast) {
            updateHeroContent(
                currentBeast.name,
                currentBeast.description || "No description available",
                currentBeast.rank || "Unknown rank",
                currentBeast.classification || "Unknown classification"
            );
        } else {
            updateHeroContent(
                "No Beasts Available",
                "Beast data not loaded yet.",
                "N/A",
                "Unknown"
            );
        }
    }
}

// Update hero content
function updateHeroContent(title, description, sa, theme) {
    heroTitle.textContent = title;
    heroDescription.textContent = description;
    heroSA.textContent = sa;
    heroTheme.textContent = theme;
}

// Change carousel slide
function changeCarouselSlide(index) {
    // Calculate new index with wrap-around
    let totalSlides = 7; // Default to 7 continents
    if (currentHeroView === 'beasts' && allBeasts.length > 0) {
        totalSlides = allBeasts.length;
    }

    if (index >= totalSlides) index = 0;
    if (index < 0) index = totalSlides - 1;

    // Update current index
    currentCarouselIndex = index;

    // Update slides (we have 7 slides for continents)
    carouselSlides.forEach((slide, i) => {
        if (i === index) {
            slide.classList.add('active');
        } else {
            slide.classList.remove('active');
        }
    });

    // Update indicators
    carouselIndicators.forEach((indicator, i) => {
        if (i === index) {
            indicator.classList.add('active');
        } else {
            indicator.classList.remove('active');
        }
    });

    // Update hero content based on current view
    updateHeroContentForCurrentSlide();
}

// Render continents
function renderContinents() {
    const container = continentsGrid;
    if (!container) return;

    container.innerHTML = '';

    allContinents.forEach(continent => {
        const continentCard = document.createElement('div');
        continentCard.className = 'continent-card';
        continentCard.style.background = getContinentBackground(continent.id);
        continentCard.innerHTML = `
            <h3>${continent.name}</h3>
            <p>${continent.theme || "Unknown Theme"}</p>
            <p><strong>SA Range:</strong> ${continent.system_authority_range || "Unknown"}</p>
        `;

        continentCard.addEventListener('click', () => {
            openContinentModal(continent);
        });

        container.appendChild(continentCard);
    });

    // If no continents were loaded, show message
    if (allContinents.length === 0) {
        container.innerHTML = '<div class="no-results"><h3>No continent data available.</h3></div>';
    }
}

// Get background for continent card
function getContinentBackground(id) {
    const backgrounds = [
        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // Eldoria - Purple
        'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', // Mechanis - Blue
        'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', // Spiritus - Pink/Red
        'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', // Wildheart - Green
        'linear-gradient(135deg, #30cfd0 0%, #330867 100%)', // Aqualon - Teal
        'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', // Skydrift - Yellow/Pink
        'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'  // Shattered Expanse - Pastel
    ];

    return backgrounds[(id - 1) % backgrounds.length];
}

// Render rulers
function renderRulers() {
    const container = rulersGrid;
    if (!container) return;

    container.innerHTML = '';

    // Filter rulers based on current filter
    let filteredRulers = allRulers;
    if (currentRulerFilter !== 'all') {
        filteredRulers = allRulers.filter(ruler =>
            ruler.continent && ruler.continent.toLowerCase().includes(currentRulerFilter.toLowerCase())
        );
    }

    // If no rulers found, show message
    if (filteredRulers.length === 0) {
        container.innerHTML = '<div class="no-results"><h3>No rulers found for this filter.</h3></div>';
        return;
    }

    // Create cards for each ruler
    filteredRulers.forEach(ruler => {
        const skillStars = ruler.unique_skill ? ruler.unique_skill.stars :
            ruler.unique_ability ? 7 : 5;

        const rulerCard = document.createElement('div');
        rulerCard.className = 'card';
        rulerCard.innerHTML = `
            <div class="card-img">
                <div class="card-badge" style="background-color: ${getRankColor(skillStars)};">
                    ${skillStars}★
                </div>
                ${ruler.image ?
                `<img src="${getImageUrl(ruler.image)}" alt="${ruler.name}" onerror="this.onerror=null; this.src='${IMAGE_BASE_PATH}placeholder.png';">` :
                `<div class="placeholder-img">
                        <i class="fas fa-crown"></i>
                    </div>`
            }
            </div>
            <div class="card-content">
                <h3>${ruler.name}</h3>
                <p>${ruler.race || ruler.type || 'Ruler'}</p>
                <p><strong>Continent:</strong> ${ruler.continent || 'Unknown'}</p>
                <p><strong>Nation:</strong> ${ruler.nation || 'Unknown'}</p>
                <div class="card-stats">
                    <div class="stat">
                        <span class="stat-value">${skillStars}</span>
                        <span class="stat-label">Skill Stars</span>
                    </div>
                    <div class="stat">
                        <span class="stat-value">${ruler.sa_level || 'N/A'}</span>
                        <span class="stat-label">SA Level</span>
                    </div>
                    <div class="stat">
                        <span class="stat-value">${(ruler.continent || '???').substring(0, 3)}</span>
                        <span class="stat-label">Continent</span>
                    </div>
                </div>
            </div>
        `;

        rulerCard.addEventListener('click', () => {
            openRulerModal(ruler);
        });

        container.appendChild(rulerCard);
    });
}

// Render heroes
function renderHeroes() {
    const container = heroesGrid;
    if (!container) return;

    container.innerHTML = '';

    // Create cards for each hero
    allHeroes.forEach(hero => {
        const skillStars = hero.signature_skill ? hero.signature_skill.stars : 5;

        const heroCard = document.createElement('div');
        heroCard.className = 'card';
        heroCard.innerHTML = `
            <div class="card-img">
                <div class="card-badge" style="background-color: ${getRankColor(skillStars)};">
                    ${hero.level || 'Hero'}
                </div>
                ${hero.image ?
                `<img src="${getImageUrl(hero.image)}" alt="${hero.name}" onerror="this.onerror=null; this.src='${IMAGE_BASE_PATH}placeholder.png';">` :
                `<div class="placeholder-img">
                        <i class="fas fa-shield-alt"></i>
                    </div>`
            }
            </div>
            <div class="card-content">
                <h3>${hero.name}</h3>
                <p>${hero.title || 'Hero'}</p>
                <p><strong>Race:</strong> ${hero.race || 'Unknown'}</p>
                <p><strong>Nation:</strong> ${hero.nation || 'Unknown'}</p>
                <div class="card-stats">
                    <div class="stat">
                        <span class="stat-value">${hero.level || 'N/A'}</span>
                        <span class="stat-label">Level</span>
                    </div>
                    <div class="stat">
                        <span class="stat-value">${skillStars}</span>
                        <span class="stat-label">Skill Stars</span>
                    </div>
                    <div class="stat">
                        <span class="stat-value">${(hero.continent || '???').substring(0, 3)}</span>
                        <span class="stat-label">Continent</span>
                    </div>
                </div>
            </div>
        `;

        heroCard.addEventListener('click', () => {
            openHeroModal(hero);
        });

        container.appendChild(heroCard);
    });

    // If no heroes were loaded, show message
    if (allHeroes.length === 0) {
        container.innerHTML = '<div class="no-results"><h3>No hero data available.</h3></div>';
    }
}

// Render beasts with both rank and continent filters
function renderBeasts() {
    const container = beastsSwiperContainer;
    if (!container) return;

    container.innerHTML = '';

    // Filter beasts based on current rank AND continent filters
    let filteredBeasts = allBeasts;
    
    // Apply rank filter if not "all"
    if (currentBeastRankFilter !== 'all') {
        filteredBeasts = filteredBeasts.filter(beast => {
            if (!beast.rank) return false;
            const rankPrefix = beast.rank.split('-')[0];
            return rankPrefix === currentBeastRankFilter;
        });
    }
    
    // Apply continent filter if not "all"
    if (currentBeastContinentFilter !== 'all') {
        filteredBeasts = filteredBeasts.filter(beast => {
            if (!beast.continent) return false;
            // Compare continent names case-insensitively
            return beast.continent.toLowerCase().includes(currentBeastContinentFilter.toLowerCase());
        });
    }

    // If no beasts found, show message
    if (filteredBeasts.length === 0) {
        container.innerHTML = `
            <div class="swiper-slide">
                <div class="card">
                    <div class="card-content">
                        <h3>No Beasts Found</h3>
                        <p>No beasts match the selected filters.</p>
                        <p>Current filters: 
                            ${currentBeastRankFilter !== 'all' ? `Rank: ${currentBeastRankFilter}` : ''}
                            ${currentBeastContinentFilter !== 'all' ? `Continent: ${currentBeastContinentFilter}` : ''}
                        </p>
                    </div>
                </div>
            </div>
        `;

        // Update swiper
        if (beastSwiper) {
            beastSwiper.update();
        }
        return;
    }

    // Create slides for each beast
    filteredBeasts.forEach(beast => {
        const beastSlide = document.createElement('div');
        beastSlide.className = 'swiper-slide';
        beastSlide.innerHTML = `
            <div class="card">
                <div class="card-img">
                    <div class="card-badge" style="background-color: ${getRankColor(beast.stars)};">
                        ${beast.rank || 'Unknown'}
                    </div>
                    ${beast.image ?
                `<img src="${getImageUrl(beast.image)}" alt="${beast.name}" onerror="this.onerror=null; this.src='${IMAGE_BASE_PATH}placeholder.png';">` :
                `<div class="placeholder-img">
                            <i class="fas fa-dragon"></i>
                        </div>`
            }
                </div>
                <div class="card-content">
                    <h3>${beast.name}</h3>
                    <p><strong>Stars:</strong> ${beast.stars || 'N/A'}★</p>
                    <div class="card-content-details">
                        <p><strong>Threat:</strong> ${beast.threat_level || 'Unknown'}</p>
                        <p><strong>Continent:</strong> ${beast.continent || 'Unknown'}</p>
                        <p>${beast.classification || 'Unknown'}</p>
                    </div>
                    <div class="card-stats">
                        <div class="stat">
                            <span class="stat-value">${beast.stars || 'N/A'}★</span>
                            <span class="stat-label">Stars</span>
                        </div>
                        <div class="stat">
                            <span class="stat-value">${beast.rank || 'N/A'}</span>
                            <span class="stat-label">Rank</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        beastSlide.addEventListener('click', () => {
            openBeastModal(beast);
        });

        container.appendChild(beastSlide);
    });

    // Update swiper
    if (beastSwiper) {
        beastSwiper.update();
    }
}

// Function to render all dungeon bosses
function renderBosses() {
    const container = bossesGrid;
    if (!container) return;
    container.innerHTML = '';

    allBosses.forEach(boss => {
        // Use rank or stars for color coding, default to 6 stars if not available
        const stars = boss.rank ? boss.rank.includes('A-Rank') ? 6 : boss.rank.includes('S-Rank') ? 7 : 5 : 5;
        const bossCard = document.createElement('div');
        bossCard.className = 'card boss-card';
        bossCard.innerHTML = `
            <div class="card-img">
                <div class="card-badge" style="background-color: ${getRankColor(stars)};">
                    ${boss.rank || 'Boss'}
                </div>
                <img src="${getImageUrl(boss.image || boss.logo)}" alt="${boss.name}">
            </div>
            <div class="card-content">
                <h3>${boss.name}</h3>
                <p class="subtitle">${boss.description ? boss.description.substring(0, 50) + '...' : 'Dungeon Boss'}</p>
                <div class="stats-row">
                    <div class="stat-item">
                        <span class="stat-value">${boss.recommended_level || '??'}</span>
                        <span class="stat-label">Min Lvl</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value">${boss.continent.substring(0, 3) || '??'}</span>
                        <span class="stat-label">Continent</span>
                    </div>
                </div>
            </div>
        `;
        bossCard.addEventListener('click', () => { openBossModal(boss); });
        container.appendChild(bossCard);
    });
}

// Function to render Additional Heroes
function renderAdditionalHeroes() {
    const container = additionalHeroesGrid;
    if (!container) return;
    container.innerHTML = '';

    if (allAdditionalHeroes.length === 0) {
        container.innerHTML = '<div class="no-results"><h3>No additional hero data available.</h3></div>';
        return;
    }

    allAdditionalHeroes.forEach(hero => {
        const skillStars = hero.unique_ability ? 7 : 6; // Default for unique abilities

        const heroCard = document.createElement('div');
        heroCard.className = 'card';
        heroCard.innerHTML = `
            <div class="card-img">
                <div class="card-badge" style="background-color: ${getRankColor(skillStars)};">
                    ${hero.race || 'Hero'}
                </div>
                ${hero.image ?
                `<img src="${getImageUrl(hero.image)}" alt="${hero.name}" onerror="this.onerror=null; this.src='${IMAGE_BASE_PATH}placeholder.png';">` :
                `<div class="placeholder-img">
                        <i class="fas fa-star"></i>
                    </div>`
            }
            </div>
            <div class="card-content">
                <h3>${hero.name}</h3>
                <p>${hero.title || 'Additional Hero'}</p>
                <p><strong>Type:</strong> ${hero.unique_ability ? 'Special Hero' : 'Hero'}</p>
                <div class="card-stats">
                    <div class="stat">
                        <span class="stat-value">${skillStars}★</span>
                        <span class="stat-label">Power</span>
                    </div>
                    <div class="stat">
                        <span class="stat-value">${(hero.continent || '???').substring(0, 3)}</span>
                        <span class="stat-label">Continent</span>
                    </div>
                </div>
            </div>
        `;

        heroCard.addEventListener('click', () => {
            openAdditionalHeroModal(hero);
        });

        container.appendChild(heroCard);
    });
}

// Function to render Additional Villains
function renderAdditionalVillains() {
    const container = additionalVillainsGrid;
    if (!container) return;
    container.innerHTML = '';

    if (allAdditionalVillains.length === 0) {
        container.innerHTML = '<div class="no-results"><h3>No additional villain data available.</h3></div>';
        return;
    }

    allAdditionalVillains.forEach(villain => {
        const skillStars = villain.unique_ability ? 7 : 6; // Default for unique abilities

        const villainCard = document.createElement('div');
        villainCard.className = 'card';
        villainCard.innerHTML = `
            <div class="card-img">
                <div class="card-badge" style="background-color: ${getRankColor(skillStars)};">
                    ${villain.race || 'Villain'}
                </div>
                ${villain.image ?
                `<img src="${getImageUrl(villain.image)}" alt="${villain.name}" onerror="this.onerror=null; this.src='${IMAGE_BASE_PATH}placeholder.png';">` :
                `<div class="placeholder-img">
                        <i class="fas fa-skull"></i>
                    </div>`
            }
            </div>
            <div class="card-content">
                <h3>${villain.name}</h3>
                <p>${villain.title || 'Strategic Villain'}</p>
                <p><strong>Type:</strong> ${villain.unique_ability ? 'Special Villain' : 'Villain'}</p>
                <div class="card-stats">
                    <div class="stat">
                        <span class="stat-value">${skillStars}★</span>
                        <span class="stat-label">Power</span>
                    </div>
                    <div class="stat">
                        <span class="stat-value">${(villain.continent || '???').substring(0, 3)}</span>
                        <span class="stat-label">Continent</span>
                    </div>
                </div>
            </div>
        `;

        villainCard.addEventListener('click', () => {
            openAdditionalVillainModal(villain);
        });

        container.appendChild(villainCard);
    });
}

// Get color based on rank/stars
function getRankColor(stars) {
    if (stars >= 10) return '#aa0000ff '; // Gold (for high-level figures like Caelum/Chronastra)
    if (stars >= 9) return '#cf0000ff '; // Gold (for high-level figures like Caelum/Chronastra)
    if (stars === 8) return '#ff4d00ff'; // Dark Orchid (for SS-Rank Bosses/Villains)
    if (stars === 7) return '#FF8C00'; // Dodger Blue
    if (stars === 6) return '#FFD700'; // Dark Turquoise
    if (stars === 5) return '#00CED1'; // Medium Sea Green
    if (stars === 4) return '#1E90FF'; // Dark Orange
    if (stars === 3) return '#9932CC'; // Fiery Red
    if (stars === 2) return '#3CB371 '; // Fiery Red
    return '#A9A9A9'; // Dark Gray
}

// Open ruler modal with details
function openRulerModal(ruler) {
    modalTitle.textContent = ruler.name;

    let modalHTML = `
        ${ruler.image ?
            `<div class="modal-image">
                <img src="${getImageUrl(ruler.image)}" alt="${ruler.name}" onerror="this.onerror=null; this.src='${IMAGE_BASE_PATH}placeholder-large.png';">
            </div>` :
            `<div class="modal-image placeholder-img-large">
                <i class="fas fa-crown"></i>
            </div>`
        }
        
        <div class="modal-stats">
            <div class="modal-stat">
                <span class="modal-stat-value">${ruler.race || ruler.type || 'Unknown'}</span>
                <span class="modal-stat-label">Race/Type</span>
            </div>
            <div class="modal-stat">
                <span class="modal-stat-value">${ruler.age || 'Unknown'}</span>
                <span class="modal-stat-label">Age</span>
            </div>
            <div class="modal-stat">
                <span class="modal-stat-value">${ruler.sa_level || 'N/A'}</span>
                <span class="modal-stat-label">SA Level</span>
            </div>
        </div>
        
        <div class="modal-section">
            <h3>Description</h3>
            <p>${ruler.description || 'No description available.'}</p>
        </div>
    `;

    if (ruler.personality) {
        modalHTML += `
            <div class="modal-section">
                <h3>Personality</h3>
                <p>${ruler.personality}</p>
            </div>
        `;
    }

    if (ruler.unique_skill || ruler.unique_ability) {
        const skill = ruler.unique_skill || ruler.unique_ability;
        modalHTML += `
            <div class="modal-section">
                <h3>Unique ${ruler.unique_skill ? 'Skill' : 'Ability'}</h3>
                <div class="skill-info">
                    <h4>${skill.name || 'Unknown'}</h4>
                    <p><strong>Stars:</strong> ${skill.stars || 'N/A'}★</p>
                    <p><strong>Description:</strong> ${skill.description || 'No description available.'}</p>
                    <p><strong>Effect:</strong> ${skill.effect || 'No effect information available.'}</p>
                </div>
            </div>
        `;
    }

    modalHTML += `
        <div class="modal-section">
            <h3>Location</h3>
            <p><strong>Continent:</strong> ${ruler.continent || 'Unknown'}</p>
            <p><strong>Nation:</strong> ${ruler.nation || 'Unknown'}</p>
        </div>
    `;

    modalBody.innerHTML = modalHTML;
    detailsModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Open hero modal with details
function openHeroModal(hero) {
    modalTitle.textContent = hero.name;

    let modalHTML = `
        ${hero.image ?
            `<div class="modal-image">
                <img src="${getImageUrl(hero.image)}" alt="${hero.name}" onerror="this.onerror=null; this.src='${IMAGE_BASE_PATH}placeholder-large.png';">
            </div>` :
            `<div class="modal-image placeholder-img-large">
                <i class="fas fa-shield-alt"></i>
            </div>`
        }
        
        <div class="modal-stats">
            <div class="modal-stat">
                <span class="modal-stat-value">${hero.level || 'Unknown'}</span>
                <span class="modal-stat-label">Level</span>
            </div>
            <div class="modal-stat">
                <span class="modal-stat-value">${hero.race || 'Unknown'}</span>
                <span class="modal-stat-label">Race</span>
            </div>
            <div class="modal-stat">
                <span class="modal-stat-value">${hero.title || 'Hero'}</span>
                <span class="modal-stat-label">Title</span>
            </div>
        </div>
        
        <div class="modal-section">
            <h3>Description</h3>
            <p>${hero.description || 'No description available.'}</p>
        </div>
    `;

    if (hero.famed_deed) {
        modalHTML += `
            <div class="modal-section">
                <h3>Famed Deed</h3>
                <p>${hero.famed_deed}</p>
            </div>
        `;
    }

    if (hero.combat_style) {
        modalHTML += `
            <div class="modal-section">
                <h3>Combat Style</h3>
                <p>${hero.combat_style}</p>
            </div>
        `;
    }

    if (hero.signature_skill) {
        modalHTML += `
            <div class="modal-section">
                <h3>Signature Skill</h3>
                <div class="skill-info">
                    <h4>${hero.signature_skill.name}</h4>
                    <p><strong>Stars:</strong> ${hero.signature_skill.stars}★</p>
                    <p><strong>Description:</strong> ${hero.signature_skill.description}</p>
                    <p><strong>Effect:</strong> ${hero.signature_skill.effect}</p>
                </div>
            </div>
        `;
    }

    modalHTML += `
        <div class="modal-section">
            <h3>Location</h3>
            <p><strong>Continent:</strong> ${hero.continent || 'Unknown'}</p>
            <p><strong>Nation:</strong> ${hero.nation || 'Unknown'}</p>
        </div>
    `;

    modalBody.innerHTML = modalHTML;
    detailsModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Open beast modal with details
function openBeastModal(beast) {
    modalTitle.textContent = beast.name;

    let modalHTML = `
        ${beast.image ?
            `<div class="modal-image">
                <img src="${getImageUrl(beast.image)}" alt="${beast.name}" onerror="this.onerror=null; this.src='${IMAGE_BASE_PATH}placeholder-large.png';">
            </div>` :
            `<div class="modal-image placeholder-img-large">
                <i class="fas fa-dragon"></i>
            </div>`
        }
        
        <div class="modal-stats">
            <div class="modal-stat">
                <span class="modal-stat-value">${beast.rank || 'Unknown'}</span>
                <span class="modal-stat-label">Rank</span>
            </div>
            <div class="modal-stat">
                <span class="modal-stat-value">${beast.stars || 'N/A'}★</span>
                <span class="modal-stat-label">Stars</span>
            </div>
            <div class="modal-stat">
                <span class="modal-stat-value">${beast.threat_level || 'Unknown'}</span>
                <span class="modal-stat-label">Threat Level</span>
            </div>
        </div>
        
        <div class="modal-section">
            <h3>Description</h3>
            <p>${beast.description || 'No description available.'}</p>
        </div>
        
        <div class="modal-section">
            <h3>Classification</h3>
            <p>${beast.classification || 'Unknown'}</p>
        </div>
    `;

    if (beast.location) {
        modalHTML += `
            <div class="modal-section">
                <h3>Location</h3>
                <p>${Array.isArray(beast.location) ? beast.location.join(', ') : beast.location}</p>
            </div>
        `;
    }

    if (beast.appearance) {
        modalHTML += `
            <div class="modal-section">
                <h3>Appearance</h3>
                <ul>
                    ${beast.appearance.lower_half ? `<li><strong>Lower Half:</strong> ${beast.appearance.lower_half}</li>` : ''}
                    ${beast.appearance.upper_half ? `<li><strong>Upper Half:</strong> ${beast.appearance.upper_half}</li>` : ''}
                    ${beast.appearance.wings ? `<li><strong>Wings:</strong> ${beast.appearance.wings}</li>` : ''}
                    ${beast.appearance.body ? `<li><strong>Body:</strong> ${beast.appearance.body}</li>` : ''}
                    ${beast.appearance.head ? `<li><strong>Head:</strong> ${beast.appearance.head}</li>` : ''}
                    ${beast.appearance.size ? `<li><strong>Size:</strong> ${beast.appearance.size}</li>` : ''}
                </ul>
            </div>
        `;
    }

    if (beast.abilities && Array.isArray(beast.abilities)) {
        modalHTML += `
            <div class="modal-section">
                <h3>Abilities</h3>
                <ul>
                    ${beast.abilities.map(ability =>
            `<li><strong>${ability.name}:</strong> ${ability.effect || ability.description || 'No details'}</li>`
        ).join('')}
                </ul>
            </div>
        `;
    }

    if (beast.behavior) {
        modalHTML += `
            <div class="modal-section">
                <h3>Behavior</h3>
                <p>${typeof beast.behavior === 'object' ?
                Object.entries(beast.behavior).map(([key, value]) =>
                    `<strong>${key}:</strong> ${value}`
                ).join('<br>') :
                beast.behavior}</p>
            </div>
        `;
    }

    modalHTML += `
        <div class="modal-section">
            <h3>Continent</h3>
            <p>${beast.continent || 'Unknown'}</p>
        </div>
    `;

    modalBody.innerHTML = modalHTML;
    detailsModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Open boss modal with details
function openBossModal(boss) {
    modalTitle.textContent = boss.name;
    let modalHTML = `
        ${boss.image ? `<div class="modal-image"> <img src="${getImageUrl(boss.image || boss.logo)}" alt="${boss.name}"> </div>` : ''}
        <div class="modal-section">
            <h3>Description</h3>
            <p>${boss.description || 'No description available.'}</p>
            <p><strong>Rank:</strong> ${boss.rank}</p>
            <p><strong>Recommended Level:</strong> ${boss.recommended_level}</p>
        </div>
        <div class="modal-section">
            <h3>Location</h3>
            <p><strong>Continent:</strong> ${boss.continent || 'Unknown'}</p>
            <p><strong>Dungeon:</strong> ${boss.dungeon || 'Unknown'}</p>
            <p><strong>Location:</strong> ${boss.location || 'Unknown'}</p>
        </div>
        <div class="modal-section">
            <h3>Abilities</h3>
            <ul>
                ${(boss.abilities || []).map(ability => `<li><strong>${ability.name}:</strong> ${ability.effect} (${ability.type})</li>`).join('')}
            </ul>
        </div>
        ${boss.loot && Object.keys(boss.loot).length > 0 ? `
            <div class="modal-section">
                <h3>Loot</h3>
                <ul>
                    ${Object.entries(boss.loot).map(([key, value]) => `<li><strong>${key.charAt(0).toUpperCase() + key.slice(1)}:</strong> ${Array.isArray(value) ? value.join(', ') : value}</li>`).join('')}
                </ul>
            </div>
        ` : ''}
    `;
    modalBody.innerHTML = modalHTML;
    detailsModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Open additional hero modal
function openAdditionalHeroModal(hero) {
    modalTitle.textContent = hero.name;

    let modalHTML = `
        ${hero.image ?
            `<div class="modal-image">
                <img src="${getImageUrl(hero.image)}" alt="${hero.name}" onerror="this.onerror=null; this.src='${IMAGE_BASE_PATH}placeholder-large.png';">
            </div>` :
            `<div class="modal-image placeholder-img-large">
                <i class="fas fa-star"></i>
            </div>`
        }

        <div class="modal-stats">
            <div class="modal-stat">
                <span class="modal-stat-value">${hero.level || 'Unknown'}</span>
                <span class="modal-stat-label">Level</span>
            </div>
            <div class="modal-stat">
                <span class="modal-stat-value">${hero.race || 'Unknown'}</span>
                <span class="modal-stat-label">Race</span>
            </div>
            <div class="modal-stat">
                <span class="modal-stat-value">${hero.title || 'Hero'}</span>
                <span class="modal-stat-label">Title</span>
            </div>
        </div>
        
        <div class="modal-section">
            <h3>Description</h3>
            <p>${hero.description || 'No description available.'}</p>
        </div>
    `;

    if (hero.title) {
        modalHTML += `
            <div class="modal-section">
                <h3>Title</h3>
                <p>${hero.title}</p>
            </div>
        `;
    }

    if (hero.unique_ability) {
        modalHTML += `
            <div class="modal-section">
                <h3>Unique Ability</h3>
                <p>${hero.unique_ability}</p>
            </div>
        `;
    }

    modalHTML += `
        <div class="modal-section">
            <h3>Location</h3>
            <p><strong>Continent:</strong> ${hero.continent || 'Unknown'}</p>
            <p><strong>Nation:</strong> ${hero.nation || 'Unknown'}</p>
        </div>
    `;

    modalBody.innerHTML = modalHTML;
    detailsModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Open additional villain modal
function openAdditionalVillainModal(villain) {
    modalTitle.textContent = villain.name;

    let modalHTML = `
        ${villain.image ?
            `<div class="modal-image">
                <img src="${getImageUrl(villain.image)}" alt="${villain.name}" onerror="this.onerror=null; this.src='${IMAGE_BASE_PATH}placeholder-large.png';">
            </div>` :
            `<div class="modal-image placeholder-img-large">
                <i class="fas fa-skull"></i>
            </div>`
        }

        <div class="modal-stats">
            <div class="modal-stat">
                <span class="modal-stat-value">${villain.level || 'Unknown'}</span>
                <span class="modal-stat-label">Level</span>
            </div>
            <div class="modal-stat">
                <span class="modal-stat-value">${villain.race || 'Unknown'}</span>
                <span class="modal-stat-label">Race</span>
            </div>
            <div class="modal-stat">
                <span class="modal-stat-value">${villain.title || 'Villian'}</span>
                <span class="modal-stat-label">Title</span>
            </div>
        </div>
        
        <div class="modal-section">
            <h3>Description</h3>
            <p>${villain.description || 'No description available.'}</p>
        </div>
    `;

    if (villain.title) {
        modalHTML += `
            <div class="modal-section">
                <h3>Title</h3>
                <p>${villain.title}</p>
            </div>
        `;
    }

    if (villain.unique_ability) {
        modalHTML += `
            <div class="modal-section">
                <h3>Unique Ability</h3>
                <p>${villain.unique_ability}</p>
            </div>
        `;
    }

    modalHTML += `
        <div class="modal-section">
            <h3>Location</h3>
            <p><strong>Continent:</strong> ${villain.continent || 'Unknown'}</p>
            <p><strong>Nation:</strong> ${villain.nation || 'Unknown'}</p>
        </div>
    `;

    modalBody.innerHTML = modalHTML;
    detailsModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Open continent modal with details
function openContinentModal(continent) {
    modalTitle.textContent = continent.name;

    let modalHTML = `
        <div class="modal-image" style="background: ${getContinentBackground(continent.id)}; display: flex; align-items: center; justify-content: center; color: white; font-size: 4rem;">
            <i class="fas fa-globe-americas"></i>
        </div>
        
        <div class="modal-stats">
            <div class="modal-stat">
                <span class="modal-stat-value">${continent.system_authority_range || 'Unknown'}</span>
                <span class="modal-stat-label">SA Range</span>
            </div>
            <div class="modal-stat">
                <span class="modal-stat-value">${continent.id || 'N/A'}</span>
                <span class="modal-stat-label">Continent ID</span>
            </div>
        </div>
        
        <div class="modal-section">
            <h3>Theme</h3>
            <p>${continent.theme || 'Unknown theme'}</p>
        </div>
        
        <div class="modal-section">
            <h3>Description</h3>
            <p>${continent.description || 'No description available.'}</p>
        </div>
    `;

    if (continent.nations && continent.nations.length > 0) {
        modalHTML += `
            <div class="modal-section">
                <h3>Nations</h3>
                <ul>
                    ${continent.nations.map(nation =>
            `<li><strong>${nation.name}:</strong> SA Level ${nation.sa_level || 'Unknown'}, Capital: ${nation.capital || 'Unknown'}</li>`
        ).join('')}
                </ul>
            </div>
        `;
    }

    if (continent.dungeons && continent.dungeons.length > 0) {
        modalHTML += `
            <div class="modal-section">
                <h3>Dungeons</h3>
                <ul>
                    ${continent.dungeons.map(dungeon =>
            `<li><strong>${dungeon.name}:</strong> ${dungeon.type || 'Dungeon'} (Level ${dungeon.recommended_level || 'Unknown'})</li>`
        ).join('')}
                </ul>
            </div>
        `;
    }

    modalBody.innerHTML = modalHTML;
    detailsModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function processCouncilData() {
    console.log("Processing council data...");

    // Find Spiritus continent
    const spiritus = allContinents.find(c => c.name === "Spiritus");
    console.log("Found Spiritus:", spiritus ? "Yes" : "No");

    if (!spiritus || !spiritus.nations) return;

    // Find Celestial Bastion
    const celestialBastion = spiritus.nations.find(n => n.name === "The Celestial Bastion");
    console.log("Found Celestial Bastion:", celestialBastion ? "Yes" : "No");

    if (celestialBastion && celestialBastion.ruler && celestialBastion.ruler.conclave_members) {
        window.solarChoirMembers = celestialBastion.ruler.conclave_members;
        console.log("Solar Choir members:", window.solarChoirMembers.length);
    }

    // Find Infernal Maw
    const infernalMaw = spiritus.nations.find(n => n.name === "The Infernal Maw");
    console.log("Found Infernal Maw:", infernalMaw ? "Yes" : "No");

    if (infernalMaw && infernalMaw.ruler && infernalMaw.ruler.council_members) {
        window.bloodlordCouncilMembers = infernalMaw.ruler.council_members;
        console.log("Bloodlord Council members:", window.bloodlordCouncilMembers.length);
    }
}


function openCouncilModal(councilType) {
    console.log("Opening council modal for:", councilType); // Add this line
    if (councilType === 'solar') {
        openSolarChoirModal();
    } else if (councilType === 'bloodlord') {
        openBloodlordCouncilModal();
    }
}

// Open Solar Choir modal
function openSolarChoirModal() {
    modalTitle.textContent = "The Solar Choir - Divine Conclave";

    let modalHTML = `
        <div class="council-intro">
            <div class="modal-image" style="background: linear-gradient(135deg, #FFD700 0%, #8B4513 100%); display: flex; align-items: center; justify-content: center; color: white; font-size: 4rem;">
                <i class="fas fa-crown"></i>
            </div>
            
            <div class="modal-section">
                <h3>The Solar Choir</h3>
                <p>A collective entity of breathtaking and terrifying beauty, a conclave of five Arch-Seraphs whose physical forms are individual masterpieces of divine artistry. When synced, a visible corona of intertwined golden light connects them, their individual forms seeming to dissolve at the edges into a single, shimmering collective silhouette—a chorus of celestial authority.</p>
            </div>
            
            <div class="modal-stats">
                <div class="modal-stat">
                    <span class="modal-stat-value">5</span>
                    <span class="modal-stat-label">Arch-Seraphs</span>
                </div>
                <div class="modal-stat">
                    <span class="modal-stat-value">SA 7-8</span>
                    <span class="modal-stat-label">System Authority</span>
                </div>
                <div class="modal-stat">
                    <span class="modal-stat-value">Celestial Bastion</span>
                    <span class="modal-stat-label">Realm</span>
                </div>
            </div>
        </div>
        
        <div class="modal-section">
            <h3>Conclave Members</h3>
            <div class="members-grid">
    `;

    // Add each Seraph member
    if (window.solarChoirMembers) {
        window.solarChoirMembers.forEach(member => {
            // Escape the name to handle special characters
            const escapedName = member.name.replace(/'/g, "\\'");

            modalHTML += `
            <div class="member-card solar-member" onclick="openMemberModal('solar', '${escapedName}')">
                <div class="member-img">
                    ${member.image ?
                    `<img src="${getImageUrl(member.image)}" alt="${member.name}">` :
                    `<i class="fas fa-angel" style="font-size: 2rem; color: #FFD700;"></i>`
                }
                </div>
                <h4>${member.name}</h4>
                <p class="member-title">${member.title}</p>
                <p><strong>Role:</strong> ${member.role}</p>
                <div class="member-skill">
                    <div class="skill-name">${member.unique_skills && member.unique_skills[0] ? member.unique_skills[0].name : 'Divine Power'}</div>
                    <div class="skill-desc">${member.unique_skills && member.unique_skills[0] ?
                    member.unique_skills[0].description.substring(0, 60) + '...' :
                    'Arch-Seraph ability'}</div>
                </div>
            </div>
        `;
        });
    }

    modalHTML += `
            </div>
        </div>
        
        <div class="modal-section">
            <h3>Collective Ability</h3>
            <div class="skill-info" style="background: rgba(255, 215, 0, 0.1); padding: 15px; border-radius: 10px; border-left: 4px solid #FFD700;">
                <h4>Hymn of Stabilization</h4>
                <p><strong>Stars:</strong> 8★</p>
                <p><strong>Description:</strong> Unified song fortifies territory allegiance, temporarily locking SA at 7 (Divine-Aligned) and preventing demonic corruption.</p>
                <p><strong>Effect:</strong> Area-wide stability, corruption immunity</p>
            </div>
        </div>
    `;

    modalBody.innerHTML = modalHTML;
    detailsModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Open Bloodlord Council modal
function openBloodlordCouncilModal() {
    modalTitle.textContent = "The Bloodlord Council - Infernal Rulers";

    let modalHTML = `
        <div class="council-intro">
            <div class="modal-image" style="background: linear-gradient(135deg, #8B0000 0%, #2F4F4F 100%); display: flex; align-items: center; justify-content: center; color: white; font-size: 4rem;">
                <i class="fas fa-skull-crown"></i>
            </div>
            
            <div class="modal-section">
                <h3>The Bloodlord Council</h3>
                <p>A shifting, treacherous alliance of the seven most powerful Archfiends in the Infernal Maw, each a sovereign embodiment of a cardinal sin. Their collective rule is a volatile equilibrium of malice, ambition, and shared appetite for destruction. They hold court in the 'Chamber of the Seven Throats,' a vast, organic amphitheater of fused bone and pulsating shadow.</p>
            </div>
            
            <div class="modal-stats">
                <div class="modal-stat">
                    <span class="modal-stat-value">7</span>
                    <span class="modal-stat-label">Archfiends</span>
                </div>
                <div class="modal-stat">
                    <span class="modal-stat-value">SA 8-9</span>
                    <span class="modal-stat-label">System Authority</span>
                </div>
                <div class="modal-stat">
                    <span class="modal-stat-value">Infernal Maw</span>
                    <span class="modal-stat-label">Realm</span>
                </div>
            </div>
        </div>
        
        <div class="modal-section">
            <h3>Council Members (The Seven Deadly Sins)</h3>
            <div class="members-grid">
    `;

    // Add each Bloodlord member
    if (window.bloodlordCouncilMembers) {
        window.bloodlordCouncilMembers.forEach(member => {
            // Escape the name to handle special characters
            const escapedName = member.name.replace(/'/g, "\\'");

            modalHTML += `
            <div class="member-card bloodlord-member" onclick="openMemberModal('bloodlord', '${escapedName}')">
                <div class="member-img">
                    ${member.image ?
                    `<img src="${getImageUrl(member.image)}" alt="${member.name}">` :
                    `<i class="fas fa-demon" style="font-size: 2rem; color: #8B0000;"></i>`
                }
                </div>
                <h4>${member.name}</h4>
                <p class="member-title">${member.title}</p>
                <p><strong>Sin:</strong> ${member.sin}</p>
                <div class="member-sin">${member.sin}</div>
                <div class="member-skill">
                    <div class="skill-name">${member.unique_skills && member.unique_skills[0] ? member.unique_skills[0].name : 'Demonic Power'}</div>
                    <div class="skill-desc">${member.unique_skills && member.unique_skills[0] ?
                    member.unique_skills[0].description.substring(0, 60) + '...' :
                    'Archfiend ability'}</div>
                </div>
            </div>
        `;
        });
    }

    modalHTML += `
            </div>
        </div>
        
        <div class="modal-section">
            <h3>Collective Ability</h3>
            <div class="skill-info" style="background: rgba(139, 0, 0, 0.1); padding: 15px; border-radius: 10px; border-left: 4px solid #8B0000;">
                <h4>Cascade of Corruption</h4>
                <p><strong>Stars:</strong> 8★</p>
                <p><strong>Description:</strong> Focus power to trigger violent allegiance shift in targeted region, forcing Demonic-Aligned (SA 9) and spawning powerful demonic lieutenants.</p>
                <p><strong>Effect:</strong> Rapid terrain corruption, lieutenant summoning</p>
            </div>
        </div>
    `;

    modalBody.innerHTML = modalHTML;
    detailsModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Open individual member modal
// Open individual member modal
function openMemberModal(councilType, memberName) {
    // Unescape the name (remove the backslash)
    const unescapedName = memberName.replace(/\\'/g, "'");
    const members = councilType === 'solar' ? window.solarChoirMembers : window.bloodlordCouncilMembers;
    const member = members.find(m => m.name === unescapedName);

    if (!member) {
        console.error("Member not found:", unescapedName);
        return;
    }

    // Store current council type for back button
    window.currentCouncilType = councilType;

    modalTitle.textContent = `${member.name} - ${member.title}`;

    let modalHTML = `
        <div class="member-detail">
            <div class="modal-header-buttons">
                <button class="back-to-council-btn" onclick="backToCouncil()">
                    <i class="fas fa-arrow-left"></i> Back
                </button>
            </div>
            
            ${member.image ?
            `<div class="modal-image">
                    <img src="${getImageUrl(member.image)}" alt="${member.name}">
                </div>` :
            `<div class="modal-image" style="background: ${councilType === 'solar' ? 'linear-gradient(135deg, #FFD700 0%, #8B4513 100%)' : 'linear-gradient(135deg, #8B0000 0%, #2F4F4F 100%)'}; display: flex; align-items: center; justify-content: center; color: white; font-size: 4rem;">
                    <i class="${councilType === 'solar' ? 'fas fa-angel' : 'fas fa-demon'}"></i>
                </div>`
        }
            
            <div class="modal-stats">
                ${councilType === 'bloodlord' ?
            `<div class="modal-stat">
                        <span class="modal-stat-value">${member.sin}</span>
                        <span class="modal-stat-label">Sin</span>
                    </div>` : ''
        }
                <div class="modal-stat">
                    <span class="modal-stat-value">${member.role}</span>
                    <span class="modal-stat-label">Role</span>
                </div>
                <div class="modal-stat">
                    <span class="modal-stat-value">${councilType === 'solar' ? 'Celestial' : 'Infernal'}</span>
                    <span class="modal-stat-label">Type</span>
                </div>
            </div>
            
            <div class="modal-section">
                <h3>Description</h3>
                <p>${member.description || 'No description available.'}</p>
            </div>
            
            <div class="modal-section">
                <h3>Appearance</h3>
                <p>${member.appearance ?
            (typeof member.appearance === 'object' ?
                Object.entries(member.appearance).map(([key, value]) =>
                    `<strong>${key.replace(/_/g, ' ').toUpperCase()}:</strong> ${value}<br>`
                ).join('') :
                member.appearance) :
            'No appearance details.'}
                </p>
            </div>
            
            ${member.personality ? `
                <div class="modal-section">
                    <h3>Personality</h3>
                    <p>${member.personality}</p>
                </div>
            ` : ''}
            
            ${member.lore ? `
                <div class="modal-section">
                    <h3>Lore</h3>
                    <p>${member.lore}</p>
                </div>
            ` : ''}
            
            ${member.unique_skills && member.unique_skills.length > 0 ? `
                <div class="modal-section">
                    <h3>Unique Skills</h3>
                    ${member.unique_skills.map(skill => `
                        <div class="skill-info" style="margin-bottom: 15px; background: rgba(255, 255, 255, 0.05); padding: 15px; border-radius: 8px;">
                            <h4>${skill.name}</h4>
                            <p><strong>Stars:</strong> ${skill.stars || 'N/A'}★</p>
                            <p><strong>Description:</strong> ${skill.description || 'No description.'}</p>
                            <p><strong>Effect:</strong> ${skill.effect || 'No effect information.'}</p>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
        </div>
    `;

    modalBody.innerHTML = modalHTML;
    detailsModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function backToCouncil() {
    if (window.currentCouncilType === 'solar') {
        openSolarChoirModal();
    } else if (window.currentCouncilType === 'bloodlord') {
        openBloodlordCouncilModal();
    }
}

// Close modal
function closeModal() {
    detailsModal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Draw gacha skills
function drawGacha() {
    const skillRarities = [
        { name: "Common Skill", stars: 1, color: "#95a5a6" },
        { name: "Common Skill", stars: 2, color: "#95a5a6" },
        { name: "Common Skill", stars: 3, color: "#95a5a6" },
        { name: "Rare Skill", stars: 4, color: "#3498db" },
        { name: "Rare Skill", stars: 5, color: "#3498db" },
        { name: "Powerful Skill", stars: 6, color: "#9b59b6" },
        { name: "Legendary Skill", stars: 7, color: "#e74c3c" },
        { name: "Reality-Bending", stars: 8, color: "#e74c3c" },
        { name: "Mythic Fragment", stars: 9, color: "#f1c40f" }
    ];

    // Clear previous results
    gachaResults.innerHTML = '';

    // Draw 5 skills
    for (let i = 0; i < 5; i++) {
        // Weighted random - lower stars are more common
        const rand = Math.random();
        let stars;

        if (rand < 0.4) stars = 1; // 40% chance
        else if (rand < 0.65) stars = 2; // 25% chance
        else if (rand < 0.8) stars = 3; // 15% chance
        else if (rand < 0.9) stars = 4; // 10% chance
        else if (rand < 0.95) stars = 5; // 5% chance
        else if (rand < 0.98) stars = 6; // 3% chance
        else if (rand < 0.995) stars = 7; // 1.5% chance
        else if (rand < 0.999) stars = 8; // 0.4% chance
        else stars = 9; // 0.1% chance

        const skill = skillRarities.find(s => s.stars === stars) || skillRarities[0];

        const skillElement = document.createElement('div');
        skillElement.className = 'gacha-item';
        skillElement.innerHTML = `
            <div style="font-size: 1.5rem; margin-bottom: 5px;">${'★'.repeat(stars)}</div>
            <div style="font-size: 0.8rem;">${skill.name}</div>
        `;
        skillElement.style.backgroundColor = skill.color;
        skillElement.style.color = stars >= 7 ? 'white' : 'black';

        gachaResults.appendChild(skillElement);
    }

    // Add animation effect
    gachaResults.style.opacity = '0';
    setTimeout(() => {
        gachaResults.style.transition = 'opacity 0.5s';
        gachaResults.style.opacity = '1';
    }, 10);
}

// Helper function to safely get nested properties
function safeGet(obj, path, defaultValue = 'Unknown') {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj) || defaultValue;
}

function getImageUrl(imagePath) {
    if (!imagePath) return null;
    return `${IMAGE_BASE_PATH}${imagePath}`;
}