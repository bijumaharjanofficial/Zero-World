// quiz.js
// Main Quiz Application
class ZeroWorldQuiz {
    constructor() {
        // Quiz state
        this.state = {
            currentScreen: 'start',
            questions: [],
            currentQuestionIndex: 0,
            score: 0,
            correctAnswers: 0,
            totalQuestions: 15,
            timeRemaining: 60,
            timerInterval: null,
            quizStarted: false,
            selectedAnswer: null,
            answers: [],
            categories: {
                continents: true,
                nations: true,
                rulers: true,
                heroes: true,
                gods: true,
                monsters: true,
                system: true,
                dungeons: true,
                races: true
            },
            difficulty: 'mixed',
            soundEnabled: true,
            hintsEnabled: true,
            dataLoaded: false,
            worldData: null,
            continentData: null,
            godData: null,
            fullData: null
        };
        
        // Initialize the quiz
        this.init();
    }
    
    async init() {
        // Show loading state
        this.showLoading(true);
        
        // Load data from JSON files
        await this.loadData();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Initialize UI
        this.updateUI();
        
        // Mark data as loaded
        this.state.dataLoaded = true;
        console.log('Zero World Quiz initialized with data');
        
        // Hide loading
        this.showLoading(false);
    }
    
    async loadData() {
        try {
            console.log('Loading data from JSON files...');
            
            // Load the main data.json file
            const dataResponse = await fetch('data.json');
            if (!dataResponse.ok) {
                throw new Error(`Failed to load data.json: ${dataResponse.status}`);
            }
            const data = await dataResponse.json();
            this.state.fullData = data;
            this.state.worldData = data.world;
            this.state.continentData = data.continents;
            
            console.log('Loaded world data and', this.state.continentData.length, 'continents');
            
            // Try to load gods.json from the Gods folder
            try {
                const godsResponse = await fetch('Gods/gods.json');
                if (godsResponse.ok) {
                    this.state.godData = await godsResponse.json();
                    console.log('Loaded god data');
                } else {
                    console.warn('Could not load gods.json, using fallback god data');
                    this.state.godData = this.getFallbackGodData();
                }
            } catch (godsError) {
                console.warn('Error loading gods.json:', godsError);
                this.state.godData = this.getFallbackGodData();
            }
            
        } catch (error) {
            console.error('Error loading data:', error);
            // Fallback to sample data
            this.getFallbackData();
        }
    }
    
    getFallbackGodData() {
        // Fallback god data in case gods.json isn't available
        return {
            pantheons: {
                Eldoria: {
                    pantheon_name: "Dharnic Celestial Order",
                    real_world_inspiration: "Hindu Mythology",
                    supreme_god: {
                        name: "Mahasvaran, The Weaver of Realities",
                        title: "The Eternal Architect",
                        domain: ["Creation", "Preservation", "System Foundation", "Reality Matrix"]
                    },
                    high_gods: [
                        {
                            name: "Agneyastra, The Forge-Flame",
                            title: "Lord of Alchemical Fire",
                            domain: ["Fire", "Transformation", "Purification", "Craftsmanship"],
                            stars: 9
                        },
                        {
                            name: "Varunima, The Liquid Truth",
                            title: "Mistress of Memory Rivers",
                            domain: ["Water", "Memory", "Truth", "Prophecy"],
                            stars: 9
                        }
                    ]
                },
                Mechanis: {
                    pantheon_name: "Clockwork Divinity",
                    real_world_inspiration: "Gnosticism & Technology",
                    supreme_god: {
                        name: "The Prime Mover",
                        title: "The Architect of Order",
                        domain: ["Logic", "Machinery", "Time", "Perfection"]
                    }
                },
                Spiritus: {
                    pantheon_name: "Dualistic Heavens",
                    real_world_inspiration: "Zoroastrianism & Abrahamic Faiths",
                    supreme_god: {
                        name: "The Unknowable Unity",
                        title: "Source of All Contradictions",
                        domain: ["Duality", "Conflict", "Balance", "Transcendence"]
                    }
                }
            }
        };
    }
    
    getFallbackData() {
        // Fallback to some basic data if loading fails
        console.log('Using fallback data');
        this.state.worldData = {
            name: "Zero",
            type: "Creation Engine"
        };
        this.state.continentData = [
            {
                name: "Eldoria",
                theme: "Stable Fantasy & Predictable Magic",
                system_authority_range: "SA 2-4",
                description: "The 'tutorial continent' where System runs predictably"
            },
            {
                name: "Mechanis",
                theme: "Order vs. Entropy, Logic vs. Chaos",
                system_authority_range: "SA 3-6",
                description: "The continent physically divided by the 'Great Divide'"
            },
            {
                name: "Spiritus",
                theme: "Eternal Divine vs. Demonic War, Reality in Flux",
                system_authority_range: "SA 7-9",
                description: "Reality in flux based on celestial battle outcomes"
            }
        ];
        this.state.godData = this.getFallbackGodData();
    }
    
    setupEventListeners() {
        // Start button
        document.getElementById('start-btn').addEventListener('click', () => this.startQuiz());
        
        // Submit answer button
        document.getElementById('submit-btn').addEventListener('click', () => this.submitAnswer());
        
        // Skip question button
        document.getElementById('skip-btn').addEventListener('click', () => this.skipQuestion());
        
        // Next question button
        document.getElementById('next-btn').addEventListener('click', () => this.nextQuestion());
        
        // Hint button
        document.getElementById('hint-btn').addEventListener('click', () => this.toggleHint());
        
        // Restart button
        document.getElementById('restart-btn').addEventListener('click', () => this.restartQuiz());
        
        // Review button
        document.getElementById('review-btn').addEventListener('click', () => this.showReview());
        
        // Back to results button
        document.getElementById('back-to-results').addEventListener('click', () => this.showResults());
        
        // Sound toggle
        document.getElementById('toggle-sound').addEventListener('click', () => this.toggleSound());
        
        // Hints toggle
        document.getElementById('toggle-hints').addEventListener('click', () => this.toggleHints());
        
        // Help button
        document.getElementById('help-btn').addEventListener('click', () => this.showHelp());
        
        // Close modal button
        document.querySelector('.close-modal').addEventListener('click', () => this.hideHelp());
        
        // Close modal when clicking outside
        document.getElementById('help-modal').addEventListener('click', (e) => {
            if (e.target.id === 'help-modal') this.hideHelp();
        });
        
        // Update question count when changed
        document.getElementById('question-count-select').addEventListener('change', (e) => {
            this.state.totalQuestions = parseInt(e.target.value);
            document.getElementById('question-count').textContent = this.state.totalQuestions;
        });
        
        // Update difficulty when changed
        document.getElementById('difficulty-select').addEventListener('change', (e) => {
            this.state.difficulty = e.target.value;
        });
        
        // Update categories when changed
        const categoryIds = [
            'cat-continents', 'cat-nations', 'cat-rulers', 'cat-heroes', 
            'cat-gods', 'cat-monsters', 'cat-system', 'cat-dungeons', 'cat-races'
        ];
        const categoryKeys = [
            'continents', 'nations', 'rulers', 'heroes', 
            'gods', 'monsters', 'system', 'dungeons', 'races'
        ];
        
        categoryIds.forEach((id, index) => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('change', (e) => {
                    this.state.categories[categoryKeys[index]] = e.target.checked;
                });
            }
        });
    }
    
    startQuiz() {
        // Validate that at least one category is selected
        const selectedCategories = Object.values(this.state.categories).filter(v => v);
        if (selectedCategories.length === 0) {
            alert('Please select at least one question category!');
            return;
        }
        
        // Validate data is loaded
        if (!this.state.dataLoaded || !this.state.continentData) {
            alert('Data is still loading. Please wait a moment and try again.');
            return;
        }
        
        // Update continent count in UI
        const continentCount = this.state.continentData ? this.state.continentData.length : 0;
        document.getElementById('continent-count').textContent = continentCount;
        
        // Generate questions
        this.generateQuestions();
        
        // Reset quiz state
        this.state.currentQuestionIndex = 0;
        this.state.score = 0;
        this.state.correctAnswers = 0;
        this.state.answers = [];
        this.state.quizStarted = true;
        
        // Set time based on difficulty
        this.state.timeRemaining = 60;
        
        // Update UI
        this.updateUI();
        
        // Show first question
        this.showQuestion();
        
        // Switch to question screen
        this.switchScreen('question');
        
        // Start timer
        this.startTimer();
        
        // Play start sound
        this.playSound('click');
    }
    
    generateQuestions() {
        this.state.questions = [];
        const questionCount = this.state.totalQuestions;
        
        // Get active categories
        const activeCategories = Object.keys(this.state.categories)
            .filter(key => this.state.categories[key]);
        
        // Question generators for each category
        const generators = [];
        
        if (this.state.categories.continents) {
            generators.push(...this.getContinentQuestionGenerators());
        }
        
        if (this.state.categories.nations) {
            generators.push(...this.getNationQuestionGenerators());
        }
        
        if (this.state.categories.rulers) {
            generators.push(...this.getRulerQuestionGenerators());
        }
        
        if (this.state.categories.heroes) {
            generators.push(...this.getHeroQuestionGenerators());
        }
        
        if (this.state.categories.gods) {
            generators.push(...this.getGodQuestionGenerators());
        }
        
        if (this.state.categories.monsters) {
            generators.push(...this.getMonsterQuestionGenerators());
        }
        
        if (this.state.categories.system) {
            generators.push(...this.getSystemQuestionGenerators());
        }
        
        if (this.state.categories.dungeons) {
            generators.push(...this.getDungeonQuestionGenerators());
        }
        
        if (this.state.categories.races) {
            generators.push(...this.getRaceQuestionGenerators());
        }
        
        // Shuffle generators and select questions
        const shuffledGenerators = this.shuffleArray([...generators]);
        
        for (let i = 0; i < questionCount && i < shuffledGenerators.length; i++) {
            try {
                const question = shuffledGenerators[i]();
                if (question) {
                    // Assign difficulty if not set
                    if (!question.difficulty) {
                        question.difficulty = this.assignDifficulty(question.category);
                    }
                    
                    // Assign points based on difficulty
                    question.points = this.getPointsForDifficulty(question.difficulty);
                    
                    this.state.questions.push(question);
                }
            } catch (error) {
                console.error('Error generating question:', error);
            }
        }
        
        // If we don't have enough questions, generate some fallback ones
        while (this.state.questions.length < questionCount) {
            this.state.questions.push(this.generateFallbackQuestion());
        }
        
        console.log(`Generated ${this.state.questions.length} questions from ${generators.length} generators`);
    }
    
    getContinentQuestionGenerators() {
        const generators = [];
        const continents = this.state.continentData;
        
        if (!continents || continents.length === 0) return generators;
        
        continents.forEach(continent => {
            // Question about continent name from theme
            generators.push(() => {
                const wrongAnswers = continents
                    .filter(c => c.name !== continent.name)
                    .map(c => c.name)
                    .slice(0, 3);
                
                return {
                    category: 'continent',
                    type: 'multiple-choice',
                    difficulty: 'easy',
                    question: `Which continent has the theme: "${continent.theme}"?`,
                    correctAnswer: continent.name,
                    wrongAnswers: this.shuffleArray(wrongAnswers),
                    explanation: `The continent with theme "${continent.theme}" is ${continent.name}. ${continent.description}`,
                    dataSource: 'continent',
                    continent: continent.name
                };
            });
            
            // Question about continent description
            if (continent.description) {
                generators.push(() => {
                    const wrongAnswers = continents
                        .filter(c => c.name !== continent.name)
                        .map(c => c.description)
                        .filter(Boolean)
                        .slice(0, 3);
                    
                    // If not enough wrong answers, add generic ones
                    while (wrongAnswers.length < 3) {
                        wrongAnswers.push(...[
                            'A land of floating islands and sky pirates',
                            'A continent covered in eternal ice and glaciers',
                            'A realm where dreams and reality intertwine'
                        ].slice(0, 3 - wrongAnswers.length));
                    }
                    
                    return {
                        category: 'continent',
                        type: 'multiple-choice',
                        difficulty: 'medium',
                        question: `Which continent is described as: "${continent.description}"?`,
                        correctAnswer: continent.name,
                        wrongAnswers: this.shuffleArray(wrongAnswers.map(desc => {
                            // Get continent names for wrong answers
                            const wrongContinent = continents.find(c => c.description === desc);
                            return wrongContinent ? wrongContinent.name : 'Unknown Continent';
                        })),
                        explanation: `This description matches ${continent.name}.`,
                        dataSource: 'continent',
                        continent: continent.name
                    };
                });
            }
            
            // Question about continent SA range
            if (continent.system_authority_range) {
                generators.push(() => {
                    const wrongAnswers = [
                        'SA 1-3',
                        'SA 2-4',
                        'SA 3-5', 
                        'SA 4-6',
                        'SA 5-7',
                        'SA 6-8',
                        'SA 7-9',
                        'SA 8-10'
                    ].filter(sa => sa !== continent.system_authority_range)
                     .slice(0, 3);
                    
                    return {
                        category: 'continent',
                        type: 'multiple-choice',
                        difficulty: 'medium',
                        question: `What is the System Authority range of ${continent.name}?`,
                        correctAnswer: continent.system_authority_range,
                        wrongAnswers: this.shuffleArray(wrongAnswers),
                        explanation: `${continent.name} has a System Authority range of ${continent.system_authority_range}, which affects how predictably magic and system functions work there.`,
                        dataSource: 'continent',
                        continent: continent.name
                    };
                });
            }
            
            // Question about continent core mechanic
            if (continent.core_mechanic) {
                generators.push(() => {
                    const allMechanics = continents.map(c => c.core_mechanic).filter(Boolean);
                    const wrongAnswers = allMechanics
                        .filter(mech => mech !== continent.core_mechanic)
                        .slice(0, 3);
                    
                    // If not enough wrong answers, add generic ones
                    while (wrongAnswers.length < 3) {
                        wrongAnswers.push(...[
                            'Lunar Phase Influence',
                            'Atmospheric Pressure System', 
                            'Memory Echo Resonance',
                            'Elemental Cycle'
                        ].slice(0, 3 - wrongAnswers.length));
                    }
                    
                    return {
                        category: 'continent',
                        type: 'multiple-choice',
                        difficulty: 'medium',
                        question: `What is the core mechanic of ${continent.name}?`,
                        correctAnswer: continent.core_mechanic,
                        wrongAnswers: this.shuffleArray(wrongAnswers),
                        explanation: `The core mechanic of ${continent.name} is "${continent.core_mechanic}".`,
                        dataSource: 'continent',
                        continent: continent.name
                    };
                });
            }
            
            // Question about continent ID
            if (continent.id) {
                generators.push(() => {
                    const wrongAnswers = [1, 2, 3, 4, 5, 6, 7]
                        .filter(id => id !== continent.id)
                        .slice(0, 3);
                    
                    return {
                        category: 'continent',
                        type: 'multiple-choice',
                        difficulty: 'hard',
                        question: `What is the ID number of ${continent.name}?`,
                        correctAnswer: continent.id.toString(),
                        wrongAnswers: wrongAnswers.map(id => id.toString()),
                        explanation: `${continent.name} has ID ${continent.id}.`,
                        dataSource: 'continent',
                        continent: continent.name
                    };
                });
            }
        });
        
        return generators;
    }
    
    getNationQuestionGenerators() {
        const generators = [];
        const continents = this.state.continentData;
        
        if (!continents) return generators;
        
        continents.forEach(continent => {
            if (continent.nations && continent.nations.length > 0) {
                continent.nations.forEach(nation => {
                    // Question about nation capital
                    if (nation.capital) {
                        generators.push(() => {
                            const otherNations = continent.nations.filter(n => n.name !== nation.name);
                            const wrongAnswers = otherNations
                                .map(n => n.capital)
                                .filter(Boolean)
                                .slice(0, 3);
                            
                            // If not enough wrong answers, add generic ones
                            while (wrongAnswers.length < 3) {
                                wrongAnswers.push(...['Silverkeep', 'Ironhold', 'Stormspire', 'Sunhaven'].slice(0, 3 - wrongAnswers.length));
                            }
                            
                            return {
                                category: 'nation',
                                type: 'multiple-choice',
                                difficulty: 'easy',
                                question: `What is the capital of ${nation.name}?`,
                                correctAnswer: nation.capital,
                                wrongAnswers: this.shuffleArray(wrongAnswers),
                                explanation: `The capital of ${nation.name} is ${nation.capital}.`,
                                dataSource: 'continent',
                                continent: continent.name
                            };
                        });
                    }
                    
                    // Question about nation name from capital
                    if (nation.capital) {
                        generators.push(() => {
                            const otherNations = continent.nations.filter(n => n.name !== nation.name);
                            const wrongAnswers = otherNations
                                .map(n => n.name)
                                .slice(0, 3);
                            
                            return {
                                category: 'nation',
                                type: 'multiple-choice',
                                difficulty: 'easy',
                                question: `Which nation has the capital city ${nation.capital}?`,
                                correctAnswer: nation.name,
                                wrongAnswers: this.shuffleArray(wrongAnswers),
                                explanation: `${nation.capital} is the capital of ${nation.name}.`,
                                dataSource: 'continent',
                                continent: continent.name
                            };
                        });
                    }
                    
                    // Question about primary race
                    if (nation.primary_race) {
                        generators.push(() => {
                            // Collect all unique races from all nations
                            const allRaces = new Set();
                            continents.forEach(c => {
                                if (c.nations) {
                                    c.nations.forEach(n => {
                                        if (n.primary_race) allRaces.add(n.primary_race);
                                    });
                                }
                            });
                            
                            const wrongAnswers = Array.from(allRaces)
                                .filter(race => race !== nation.primary_race)
                                .slice(0, 3);
                            
                            return {
                                category: 'nation',
                                type: 'multiple-choice',
                                difficulty: 'easy',
                                question: `What is the primary race of ${nation.name}?`,
                                correctAnswer: nation.primary_race,
                                wrongAnswers: this.shuffleArray(wrongAnswers),
                                explanation: `The primary race of ${nation.name} is ${nation.primary_race}.`,
                                dataSource: 'continent',
                                continent: continent.name
                            };
                        });
                    }
                    
                    // Question about SA level
                    if (nation.sa_level || nation.sa_range) {
                        generators.push(() => {
                            const saValue = nation.sa_level || nation.sa_range;
                            const wrongAnswers = ['SA 2', 'SA 3', 'SA 4', 'SA 5', 'SA 6', 'SA 7', 'SA 8', 'SA 9']
                                .filter(sa => sa !== saValue)
                                .slice(0, 3);
                            
                            return {
                                category: 'nation',
                                type: 'multiple-choice',
                                difficulty: 'medium',
                                question: `What is the System Authority level of ${nation.name}?`,
                                correctAnswer: saValue,
                                wrongAnswers: this.shuffleArray(wrongAnswers),
                                explanation: `${nation.name} has a System Authority level of ${saValue}.`,
                                dataSource: 'continent',
                                continent: continent.name
                            };
                        });
                    }
                });
            }
        });
        
        return generators;
    }
    
    getRulerQuestionGenerators() {
        const generators = [];
        const continents = this.state.continentData;
        
        if (!continents) return generators;
        
        continents.forEach(continent => {
            if (continent.nations && continent.nations.length > 0) {
                continent.nations.forEach(nation => {
                    let ruler = nation.ruler || nation.rulers;
                    
                    if (ruler) {
                        // Handle different ruler structures
                        let rulerName = '';
                        let rulerTitle = '';
                        let uniqueSkill = null;
                        
                        if (nation.ruler) {
                            // Single ruler
                            rulerName = nation.ruler.name;
                            rulerTitle = nation.ruler.title || 'Ruler';
                            uniqueSkill = nation.ruler.unique_skill;
                        } else if (nation.rulers && nation.rulers.type === 'Diarchy') {
                            // Diarchy
                            rulerName = `${nation.rulers.chieftain.name} and ${nation.rulers.grove_mother.name}`;
                            rulerTitle = 'Diarchs';
                            uniqueSkill = nation.rulers.chieftain.unique_skill; // Use chieftain's skill for questions
                        } else if (nation.rulers && nation.rulers.type === 'Council') {
                            // Council
                            rulerName = nation.rulers.name || `${nation.rulers.type} of ${nation.name}`;
                            rulerTitle = nation.rulers.type;
                            uniqueSkill = nation.rulers.unique_skill;
                        }
                        
                        // Question about ruler name
                        if (rulerName) {
                            generators.push(() => {
                                const otherRulers = [];
                                continents.forEach(c => {
                                    if (c.nations) {
                                        c.nations.forEach(n => {
                                            let nRulerName = '';
                                            if (n.ruler) {
                                                nRulerName = n.ruler.name;
                                            } else if (n.rulers && n.rulers.type === 'Diarchy') {
                                                nRulerName = `${n.rulers.chieftain.name} and ${n.rulers.grove_mother.name}`;
                                            } else if (n.rulers && n.rulers.type === 'Council') {
                                                nRulerName = n.rulers.name || `${n.rulers.type} of ${n.name}`;
                                            }
                                            
                                            if (nRulerName && nRulerName !== rulerName) {
                                                otherRulers.push(nRulerName);
                                            }
                                        });
                                    }
                                });
                                
                                const wrongAnswers = otherRulers.slice(0, 3);
                                
                                // If not enough wrong answers, add generic ones
                                while (wrongAnswers.length < 3) {
                                    wrongAnswers.push(...[
                                        'King Alistair the Wise',
                                        'Queen Seraphina of the Dawn',
                                        'Emperor Magnus Ironfist',
                                        'Council of Seven Sages'
                                    ].slice(0, 3 - wrongAnswers.length));
                                }
                                
                                return {
                                    category: 'ruler',
                                    type: 'multiple-choice',
                                    difficulty: 'medium',
                                    question: `Who rules ${nation.name}?`,
                                    correctAnswer: rulerName,
                                    wrongAnswers: this.shuffleArray(wrongAnswers),
                                    explanation: `${rulerName} rules ${nation.name} as ${rulerTitle}.`,
                                    dataSource: 'continent',
                                    continent: continent.name
                                };
                            });
                        }
                        
                        // Question about ruler's unique skill
                        if (uniqueSkill && uniqueSkill.name) {
                            generators.push(() => {
                                // Collect unique skills from all rulers
                                const allSkills = [];
                                continents.forEach(c => {
                                    if (c.nations) {
                                        c.nations.forEach(n => {
                                            let skill = null;
                                            if (n.ruler && n.ruler.unique_skill) {
                                                skill = n.ruler.unique_skill.name;
                                            } else if (n.rulers && n.rulers.type === 'Diarchy' && n.rulers.chieftain.unique_skill) {
                                                skill = n.rulers.chieftain.unique_skill.name;
                                            } else if (n.rulers && n.rulers.unique_skill) {
                                                skill = n.rulers.unique_skill.name;
                                            }
                                            
                                            if (skill && skill !== uniqueSkill.name) {
                                                allSkills.push(skill);
                                            }
                                        });
                                    }
                                });
                                
                                const wrongAnswers = allSkills.slice(0, 3);
                                
                                // If not enough wrong answers, add generic ones
                                while (wrongAnswers.length < 3) {
                                    wrongAnswers.push(...[
                                        "Dragon's Roar",
                                        "Stone Shape", 
                                        "Lightning Call",
                                        "Time Manipulation"
                                    ].slice(0, 3 - wrongAnswers.length));
                                }
                                
                                return {
                                    category: 'ruler',
                                    type: 'multiple-choice',
                                    difficulty: 'hard',
                                    question: `What is the unique skill of the ruler of ${nation.name}?`,
                                    correctAnswer: uniqueSkill.name,
                                    wrongAnswers: this.shuffleArray(wrongAnswers),
                                    explanation: `The ruler of ${nation.name} has the unique skill "${uniqueSkill.name}": ${uniqueSkill.description}`,
                                    dataSource: 'continent',
                                    continent: continent.name
                                };
                            });
                            
                            // Question about skill star rating
                            generators.push(() => {
                                const wrongAnswers = [6, 7, 8, 9, 10]
                                    .filter(stars => stars !== uniqueSkill.stars)
                                    .slice(0, 3);
                                
                                return {
                                    category: 'ruler',
                                    type: 'multiple-choice',
                                    difficulty: 'hard',
                                    question: `How many stars does the unique skill "${uniqueSkill.name}" have?`,
                                    correctAnswer: uniqueSkill.stars.toString(),
                                    wrongAnswers: wrongAnswers.map(s => s.toString()),
                                    explanation: `"${uniqueSkill.name}" is a ${uniqueSkill.stars}-star skill.`,
                                    dataSource: 'continent',
                                    continent: continent.name
                                };
                            });
                        }
                    }
                });
            }
        });
        
        return generators;
    }
    
    getHeroQuestionGenerators() {
        const generators = [];
        const continents = this.state.continentData;
        
        if (!continents) return generators;
        
        continents.forEach(continent => {
            if (continent.nations && continent.nations.length > 0) {
                continent.nations.forEach(nation => {
                    if (nation.national_hero) {
                        const hero = nation.national_hero;
                        
                        // Question about hero name
                        generators.push(() => {
                            const otherHeroes = [];
                            continents.forEach(c => {
                                if (c.nations) {
                                    c.nations.forEach(n => {
                                        if (n.national_hero && n.national_hero.name !== hero.name) {
                                            otherHeroes.push(n.national_hero.name);
                                        }
                                    });
                                }
                            });
                            
                            const wrongAnswers = otherHeroes.slice(0, 3);
                            
                            // If not enough wrong answers, add generic ones
                            while (wrongAnswers.length < 3) {
                                wrongAnswers.push(...[
                                    'Sir Gideon the Brave',
                                    'Lady Isolde of the Veil',
                                    'Baron Viktor Stormcaller',
                                    'Dame Elara Sunshield'
                                ].slice(0, 3 - wrongAnswers.length));
                            }
                            
                            return {
                                category: 'hero',
                                type: 'multiple-choice',
                                difficulty: 'medium',
                                question: `Who is the national hero of ${nation.name}?`,
                                correctAnswer: hero.name,
                                wrongAnswers: this.shuffleArray(wrongAnswers),
                                explanation: `The national hero of ${nation.name} is ${hero.name}, known as "${hero.title || 'a hero'}".`,
                                dataSource: 'continent',
                                continent: continent.name
                            };
                        });
                        
                        // Question about hero's title
                        if (hero.title) {
                            generators.push(() => {
                                const otherTitles = [];
                                continents.forEach(c => {
                                    if (c.nations) {
                                        c.nations.forEach(n => {
                                            if (n.national_hero && n.national_hero.title && n.national_hero.title !== hero.title) {
                                                otherTitles.push(n.national_hero.title);
                                            }
                                        });
                                    }
                                });
                                
                                const wrongAnswers = otherTitles.slice(0, 3);
                                
                                // If not enough wrong answers, add generic ones
                                while (wrongAnswers.length < 3) {
                                    wrongAnswers.push(...[
                                        'The Dragon Slayer',
                                        'The Shield of the Realm',
                                        'The Mage Hunter',
                                        'The Shadow Walker'
                                    ].slice(0, 3 - wrongAnswers.length));
                                }
                                
                                return {
                                    category: 'hero',
                                    type: 'multiple-choice',
                                    difficulty: 'medium',
                                    question: `What is the title of ${hero.name}?`,
                                    correctAnswer: hero.title,
                                    wrongAnswers: this.shuffleArray(wrongAnswers),
                                    explanation: `${hero.name} is known as "${hero.title}".`,
                                    dataSource: 'continent',
                                    continent: continent.name
                                };
                            });
                        }
                        
                        // Question about hero's famed deed
                        if (hero.famed_deed) {
                            generators.push(() => {
                                // Try to use other heroes' deeds as wrong answers
                                const otherDeeds = [];
                                continents.forEach(c => {
                                    if (c.nations) {
                                        c.nations.forEach(n => {
                                            if (n.national_hero && n.national_hero.famed_deed && n.national_hero.famed_deed !== hero.famed_deed) {
                                                otherDeeds.push(n.national_hero.famed_deed);
                                            }
                                        });
                                    }
                                });
                                
                                const wrongAnswers = otherDeeds.length >= 3 ? 
                                    otherDeeds.slice(0, 3) : 
                                    [
                                        'Defeated the Shadow Dragon of the Northern Peaks',
                                        'Protected the capital during the Great Siege',
                                        'Retrieved the Lost Artifact from the Abyssal Depths'
                                    ].slice(0, 3);
                                
                                return {
                                    category: 'hero',
                                    type: 'multiple-choice',
                                    difficulty: 'hard',
                                    question: `What is the famed deed of ${hero.name}?`,
                                    correctAnswer: hero.famed_deed,
                                    wrongAnswers: this.shuffleArray(wrongAnswers),
                                    explanation: `${hero.name}'s famed deed is: "${hero.famed_deed}".`,
                                    dataSource: 'continent',
                                    continent: continent.name
                                };
                            });
                        }
                        
                        // Question about hero's level
                        if (hero.level) {
                            generators.push(() => {
                                const wrongAnswers = [800, 805, 810, 815, 820, 825, 830, 835, 840, 850]
                                    .filter(level => level !== hero.level)
                                    .slice(0, 3);
                                
                                return {
                                    category: 'hero',
                                    type: 'multiple-choice',
                                    difficulty: 'medium',
                                    question: `What is the level of ${hero.name}?`,
                                    correctAnswer: hero.level.toString(),
                                    wrongAnswers: wrongAnswers.map(l => l.toString()),
                                    explanation: `${hero.name} is level ${hero.level}.`,
                                    dataSource: 'continent',
                                    continent: continent.name
                                };
                            });
                        }
                        
                        // Question about hero's race
                        if (hero.race) {
                            generators.push(() => {
                                const races = [
                                    'High Elf', 'Dwarf', 'Lionman', 'Android', 'Human',
                                    'Wood Elf', 'Seraphim', 'Archfiend', 'Goblin'
                                ];
                                
                                const wrongAnswers = races
                                    .filter(race => race !== hero.race)
                                    .slice(0, 3);
                                
                                return {
                                    category: 'hero',
                                    type: 'multiple-choice',
                                    difficulty: 'easy',
                                    question: `What race is ${hero.name}?`,
                                    correctAnswer: hero.race,
                                    wrongAnswers: this.shuffleArray(wrongAnswers),
                                    explanation: `${hero.name} is a ${hero.race}.`,
                                    dataSource: 'continent',
                                    continent: continent.name
                                };
                            });
                        }
                    }
                });
            }
        });
        
        return generators;
    }
    
    getGodQuestionGenerators() {
        const generators = [];
        const godData = this.state.godData;
        
        if (!godData || !godData.pantheons) return generators;
        
        Object.keys(godData.pantheons).forEach(pantheonName => {
            const pantheon = godData.pantheons[pantheonName];
            
            // Question about pantheon name
            generators.push(() => {
                const wrongAnswers = [
                    'Olympian Pantheon',
                    'Aesir and Vanir',
                    'Celestial Bureaucracy',
                    'Divine Assembly',
                    'Ethereal Council',
                    'Primeval Gods'
                ].slice(0, 3);
                
                return {
                    category: 'god',
                    type: 'multiple-choice',
                    difficulty: 'easy',
                    question: `What is the name of the ${pantheonName} pantheon?`,
                    correctAnswer: pantheon.pantheon_name,
                    wrongAnswers: this.shuffleArray(wrongAnswers),
                    explanation: `The pantheon of ${pantheonName} is called the "${pantheon.pantheon_name}", inspired by ${pantheon.real_world_inspiration || 'ancient mythology'}.`,
                    dataSource: 'god',
                    continent: pantheonName
                };
            });
            
            // Question about pantheon inspiration
            if (pantheon.real_world_inspiration) {
                generators.push(() => {
                    const inspirations = [
                        'Greek Mythology',
                        'Norse Mythology',
                        'Egyptian Mythology',
                        'Hindu Mythology',
                        'Chinese Mythology',
                        'Japanese Mythology',
                        'Abrahamic Faiths',
                        'Gnosticism'
                    ].filter(insp => insp !== pantheon.real_world_inspiration)
                     .slice(0, 3);
                    
                    return {
                        category: 'god',
                        type: 'multiple-choice',
                        difficulty: 'medium',
                        question: `What is the real-world inspiration for the ${pantheon.pantheon_name}?`,
                        correctAnswer: pantheon.real_world_inspiration,
                        wrongAnswers: this.shuffleArray(inspirations),
                        explanation: `The ${pantheon.pantheon_name} is inspired by ${pantheon.real_world_inspiration}.`,
                        dataSource: 'god',
                        continent: pantheonName
                    };
                });
            }
            
            // Question about supreme god
            if (pantheon.supreme_god) {
                const supreme = pantheon.supreme_god;
                
                generators.push(() => {
                    const wrongAnswers = [
                        'Zeus, King of the Gods',
                        'Odin, the Allfather',
                        'Ra, the Sun God',
                        'Shiva, the Destroyer',
                        'Amaterasu, the Sun Goddess'
                    ].slice(0, 3);
                    
                    return {
                        category: 'god',
                        type: 'multiple-choice',
                        difficulty: 'medium',
                        question: `Who is the supreme god of the ${pantheon.pantheon_name}?`,
                        correctAnswer: supreme.name,
                        wrongAnswers: this.shuffleArray(wrongAnswers),
                        explanation: `The supreme god of the ${pantheon.pantheon_name} is ${supreme.name}, the ${supreme.title}.`,
                        dataSource: 'god',
                        continent: pantheonName
                    };
                });
                
                // Question about supreme god's title
                generators.push(() => {
                    const wrongAnswers = [
                        'The Allfather',
                        'King of the Gods',
                        'The Sun God',
                        'The Creator',
                        'The Destroyer'
                    ].slice(0, 3);
                    
                    return {
                        category: 'god',
                        type: 'multiple-choice',
                        difficulty: 'medium',
                        question: `What is the title of ${supreme.name}?`,
                        correctAnswer: supreme.title,
                        wrongAnswers: this.shuffleArray(wrongAnswers),
                        explanation: `${supreme.name} is known as "${supreme.title}".`,
                        dataSource: 'god',
                        continent: pantheonName
                    };
                });
                
                // Question about supreme god's domain
                if (supreme.domain && supreme.domain.length > 0) {
                    generators.push(() => {
                        const domains = supreme.domain;
                        const correctDomain = domains[Math.floor(Math.random() * domains.length)];
                        
                        const allDomains = [
                            'Creation', 'Preservation', 'Destruction', 'Fire', 'Water',
                            'Earth', 'Air', 'Wisdom', 'War', 'Love', 'Justice',
                            'Magic', 'Death', 'Life', 'Sun', 'Moon', 'Stars',
                            'Time', 'Fate', 'Chaos', 'Order', 'Light', 'Darkness'
                        ];
                        
                        const wrongAnswers = allDomains
                            .filter(domain => !domains.includes(domain))
                            .slice(0, 3);
                        
                        return {
                            category: 'god',
                            type: 'multiple-choice',
                            difficulty: 'hard',
                            question: `Which of these is a domain of ${supreme.name}?`,
                            correctAnswer: correctDomain,
                            wrongAnswers: this.shuffleArray(wrongAnswers),
                            explanation: `${supreme.name}'s domains include: ${domains.join(', ')}.`,
                            dataSource: 'god',
                            continent: pantheonName
                        };
                    });
                }
            }
            
            // Questions about high gods
            if (pantheon.high_gods && pantheon.high_gods.length > 0) {
                pantheon.high_gods.forEach(god => {
                    generators.push(() => {
                        const otherGods = pantheon.high_gods
                            .filter(g => g.name !== god.name)
                            .map(g => g.name)
                            .slice(0, 3);
                        
                        // If not enough wrong answers, add from other pantheons or generic
                        while (otherGods.length < 3) {
                            otherGods.push(...['Thor', 'Athena', 'Anubis', 'Quetzalcoatl'].slice(0, 3 - otherGods.length));
                        }
                        
                        return {
                            category: 'god',
                            type: 'multiple-choice',
                            difficulty: 'medium',
                            question: `Which of these is a high god in the ${pantheon.pantheon_name}?`,
                            correctAnswer: god.name,
                            wrongAnswers: this.shuffleArray(otherGods),
                            explanation: `${god.name}, the ${god.title}, is a high god in the ${pantheon.pantheon_name}.`,
                            dataSource: 'god',
                            continent: pantheonName
                        };
                    });
                    
                    // Question about high god's stars
                    if (god.stars) {
                        generators.push(() => {
                            const wrongAnswers = [7, 8, 9, 10]
                                .filter(stars => stars !== god.stars)
                                .slice(0, 3);
                            
                            return {
                                category: 'god',
                                type: 'multiple-choice',
                                difficulty: 'hard',
                                question: `How many stars does ${god.name} have?`,
                                correctAnswer: god.stars.toString(),
                                wrongAnswers: wrongAnswers.map(s => s.toString()),
                                explanation: `${god.name} is a ${god.stars}-star deity.`,
                                dataSource: 'god',
                                continent: pantheonName
                            };
                        });
                    }
                });
            }
        });
        
        return generators;
    }
    
    getMonsterQuestionGenerators() {
        const generators = [];
        const continents = this.state.continentData;
        
        if (!continents) return generators;
        
        // Extract monsters from all continents
        const allMonsters = [];
        continents.forEach(continent => {
            if (continent.bestiary && continent.bestiary.monsters) {
                continent.bestiary.monsters.forEach(monster => {
                    monster.continent = continent.name;
                    allMonsters.push(monster);
                });
            }
        });
        
        if (allMonsters.length === 0) return generators;
        
        // Limit to 20 monsters to avoid too many questions
        const selectedMonsters = allMonsters.slice(0, 20);
        
        selectedMonsters.forEach(monster => {
            // Question about monster name from classification
            if (monster.classification && monster.name) {
                generators.push(() => {
                    const otherMonsters = selectedMonsters
                        .filter(m => m.name !== monster.name)
                        .map(m => m.name)
                        .slice(0, 3);
                    
                    return {
                        category: 'monster',
                        type: 'multiple-choice',
                        difficulty: 'medium',
                        question: `Which monster is classified as a "${monster.classification}"?`,
                        correctAnswer: monster.name,
                        wrongAnswers: this.shuffleArray(otherMonsters),
                        explanation: `${monster.name} is classified as a ${monster.classification}.`,
                        dataSource: 'monster',
                        continent: monster.continent
                    };
                });
            }
            
            // Question about monster rank
            if (monster.rank) {
                generators.push(() => {
                    const ranks = [
                        "X-Rank Calamity", "SSS-Rank", "SS-Rank", "S-Rank", 
                        "A-Rank", "B-Rank", "C-Rank", "D-Rank", "E-Rank", "F-Rank"
                    ].filter(rank => rank !== monster.rank)
                     .slice(0, 3);
                    
                    return {
                        category: 'monster',
                        type: 'multiple-choice',
                        difficulty: 'easy',
                        question: `What is the rank of ${monster.name}?`,
                        correctAnswer: monster.rank,
                        wrongAnswers: this.shuffleArray(ranks),
                        explanation: `${monster.name} has a rank of ${monster.rank}.`,
                        dataSource: 'monster',
                        continent: monster.continent
                    };
                });
            }
            
            // Question about monster threat level
            if (monster.threat_level) {
                generators.push(() => {
                    const threatLevels = [
                        "Cataclysmic", "Continental Cataclysm", "National Disaster", 
                        "Army-Killer", "Regional Boss", "Elite Monster", 
                        "Dangerous Foe", "Common Threat", "Minor Nuisance", "Pest"
                    ].filter(threat => threat !== monster.threat_level)
                     .slice(0, 3);
                    
                    return {
                        category: 'monster',
                        type: 'multiple-choice',
                        difficulty: 'easy',
                        question: `What is the threat level of ${monster.name}?`,
                        correctAnswer: monster.threat_level,
                        wrongAnswers: this.shuffleArray(threatLevels),
                        explanation: `${monster.name} has a threat level of "${monster.threat_level}".`,
                        dataSource: 'monster',
                        continent: monster.continent
                    };
                });
            }
            
            // Question about monster star rating
            if (monster.stars) {
                generators.push(() => {
                    const stars = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
                        .filter(star => star !== monster.stars)
                        .slice(0, 3);
                    
                    return {
                        category: 'monster',
                        type: 'multiple-choice',
                        difficulty: 'medium',
                        question: `How many stars does ${monster.name} have?`,
                        correctAnswer: monster.stars.toString(),
                        wrongAnswers: stars.map(s => s.toString()),
                        explanation: `${monster.name} is a ${monster.stars}-star monster.`,
                        dataSource: 'monster',
                        continent: monster.continent
                    };
                });
            }
            
            // Question about monster location
            if (monster.location) {
                generators.push(() => {
                    const location = Array.isArray(monster.location) ? monster.location[0] : monster.location;
                    const otherMonsters = selectedMonsters
                        .filter(m => m.name !== monster.name)
                        .map(m => Array.isArray(m.location) ? m.location[0] : m.location)
                        .filter(Boolean)
                        .slice(0, 3);
                    
                    return {
                        category: 'monster',
                        type: 'multiple-choice',
                        difficulty: 'hard',
                        question: `Where can ${monster.name} be found?`,
                        correctAnswer: location,
                        wrongAnswers: this.shuffleArray(otherMonsters),
                        explanation: `${monster.name} can be found in ${location}.`,
                        dataSource: 'monster',
                        continent: monster.continent
                    };
                });
            }
        });
        
        return generators;
    }
    
    getSystemQuestionGenerators() {
        const generators = [];
        const worldData = this.state.worldData;
        
        if (!worldData || !worldData.core_system) return generators;
        
        const system = worldData.core_system;
        
        // Question about world name
        generators.push(() => {
            const wrongAnswers = ['Aetheria', 'Terra Nova', 'Arcania', 'Mystara', 'Elysium'];
            
            return {
                category: 'system',
                type: 'multiple-choice',
                difficulty: 'easy',
                question: 'What is the name of the world governed by the System?',
                correctAnswer: worldData.name,
                wrongAnswers: this.shuffleArray(wrongAnswers).slice(0, 3),
                explanation: `The world is called "${worldData.name}", a ${worldData.type} where reality is governed by the System.`,
                dataSource: 'world'
            };
        });
        
        // Question about System name
        generators.push(() => {
            const wrongAnswers = ['The Matrix', 'The Framework', 'Reality Engine', 'Cosmic Interface', 'Divine Mechanism'];
            
            return {
                category: 'system',
                type: 'multiple-choice',
                difficulty: 'easy',
                question: 'What is the name of the universal interface governing reality?',
                correctAnswer: system.name,
                wrongAnswers: this.shuffleArray(wrongAnswers).slice(0, 3),
                explanation: `The universal interface is called the "${system.name}". ${system.nature}`,
                dataSource: 'world'
            };
        });
        
        // Question about core stats
        if (system.progression_mechanics && system.progression_mechanics.stats) {
            generators.push(() => {
                const coreStats = system.progression_mechanics.stats.core;
                const correctStat = coreStats[Math.floor(Math.random() * coreStats.length)];
                
                const allStats = [
                    'Strength', 'Agility', 'Constitution', 'Intelligence', 
                    'Wisdom', 'Perception', 'Charisma', 'Luck', 'Endurance',
                    'Dexterity', 'Willpower', 'Faith'
                ];
                
                const wrongAnswers = allStats
                    .filter(stat => !coreStats.includes(stat))
                    .slice(0, 3);
                
                return {
                    category: 'system',
                    type: 'multiple-choice',
                    difficulty: 'medium',
                    question: 'Which of these is a core stat in the System?',
                    correctAnswer: correctStat,
                    wrongAnswers: this.shuffleArray(wrongAnswers),
                    explanation: `The core stats in the System are: ${coreStats.join(', ')}.`,
                    dataSource: 'world'
                };
            });
        }
        
        // Question about derived stats
        if (system.progression_mechanics && system.progression_mechanics.stats && system.progression_mechanics.stats.derived) {
            generators.push(() => {
                const derivedStats = system.progression_mechanics.stats.derived;
                const correctStat = derivedStats[Math.floor(Math.random() * derivedStats.length)];
                
                const allStats = [
                    'Health', 'Mana', 'Stamina', 'Physical Defense', 'Magical Defense',
                    'Crit Chance', 'Cast Speed', 'Attack Speed', 'Dodge Chance',
                    'Accuracy', 'Resistance', 'Regeneration'
                ];
                
                const wrongAnswers = allStats
                    .filter(stat => !derivedStats.includes(stat))
                    .slice(0, 3);
                
                return {
                    category: 'system',
                    type: 'multiple-choice',
                    difficulty: 'medium',
                    question: 'Which of these is a derived stat in the System?',
                    correctAnswer: correctStat,
                    wrongAnswers: this.shuffleArray(wrongAnswers),
                    explanation: `The derived stats in the System include: ${derivedStats.join(', ')}.`,
                    dataSource: 'world'
                };
            });
        }
        
        // Question about skill gacha frequency
        if (system.progression_mechanics && system.progression_mechanics.skill_gacha_system) {
            generators.push(() => {
                const gacha = system.progression_mechanics.skill_gacha_system;
                const wrongAnswers = ['Every level', 'Every 3 levels', 'Every 10 levels', 'Monthly', 'After major quests'];
                
                return {
                    category: 'system',
                    type: 'multiple-choice',
                    difficulty: 'medium',
                    question: 'How often can users draw skills from the gacha system?',
                    correctAnswer: gacha.frequency,
                    wrongAnswers: this.shuffleArray(wrongAnswers).slice(0, 3),
                    explanation: `The skill gacha system allows draws ${gacha.frequency.toLowerCase()}. Each draw presents ${gacha.draw_size} skill options.`,
                    dataSource: 'world'
                };
            });
        }
        
        // Question about skill rarity descriptions
        if (system.progression_mechanics && system.progression_mechanics.skill_gacha_system && system.progression_mechanics.skill_gacha_system.rarity) {
            const rarity = system.progression_mechanics.skill_gacha_system.rarity;
            Object.keys(rarity).forEach(rarityKey => {
                generators.push(() => {
                    const wrongAnswers = Object.values(rarity)
                        .filter(desc => desc !== rarity[rarityKey])
                        .slice(0, 3);
                    
                    return {
                        category: 'system',
                        type: 'multiple-choice',
                        difficulty: 'hard',
                        question: `What do ${rarityKey} star skills represent?`,
                        correctAnswer: rarity[rarityKey],
                        wrongAnswers: this.shuffleArray(wrongAnswers),
                        explanation: `${rarityKey} star skills are: ${rarity[rarityKey]}.`,
                        dataSource: 'world'
                    };
                });
            });
        }
        
        // Question about 0-Level Aid
        if (system.aids && system.aids["0_level_aid"]) {
            const zeroAid = system.aids["0_level_aid"];
            generators.push(() => {
                const wrongAnswers = [
                    'A perfect AI companion',
                    'A fragment of a destroyed god',
                    'A bug in reality itself',
                    'A manifestation of user willpower',
                    'An ancient spirit bound to the user'
                ];
                
                return {
                    category: 'system',
                    type: 'multiple-choice',
                    difficulty: 'hard',
                    question: 'What is the nature of the 0-Level Aid?',
                    correctAnswer: zeroAid.nature,
                    wrongAnswers: this.shuffleArray(wrongAnswers).slice(0, 3),
                    explanation: `The 0-Level Aid is "${zeroAid.nature}". It manifests as "${zeroAid.manifestation}" and has the ability to ${zeroAid.abilities}.`,
                    dataSource: 'world'
                };
            });
        }
        
        // Question about inviolable menus
        if (system.absolute_rules && system.absolute_rules.inviolable_menus) {
            generators.push(() => {
                const menus = system.absolute_rules.inviolable_menus;
                const correctMenu = menus[Math.floor(Math.random() * menus.length)];
                
                const wrongMenus = [
                    'Inventory Management',
                    'Skill Respec',
                    'Character Customization',
                    'World Map Fast Travel',
                    'Quest Abandonment',
                    'Party Member Dismissal'
                ].slice(0, 3);
                
                return {
                    category: 'system',
                    type: 'multiple-choice',
                    difficulty: 'hard',
                    question: 'Which of these is an inviolable menu in the System?',
                    correctAnswer: correctMenu,
                    wrongAnswers: this.shuffleArray(wrongMenus),
                    explanation: `The inviolable menus in the System are: ${menus.join(', ')}. These cannot be altered or bypassed.`,
                    dataSource: 'world'
                };
            });
        }
        
        return generators;
    }
    
    getDungeonQuestionGenerators() {
        const generators = [];
        const continents = this.state.continentData;
        
        if (!continents) return generators;
        
        continents.forEach(continent => {
            if (continent.dungeons && continent.dungeons.length > 0) {
                continent.dungeons.forEach(dungeon => {
                    // Question about dungeon name
                    generators.push(() => {
                        const otherDungeons = [];
                        continents.forEach(c => {
                            if (c.dungeons) {
                                c.dungeons.forEach(d => {
                                    if (d.name !== dungeon.name) {
                                        otherDungeons.push(d.name);
                                    }
                                });
                            }
                        });
                        
                        const wrongAnswers = otherDungeons.slice(0, 3);
                        
                        // If not enough wrong answers, add generic ones
                        while (wrongAnswers.length < 3) {
                            wrongAnswers.push(...[
                                'The Crystal Caverns',
                                'Shadowfang Keep',
                                'Firestorm Peak',
                                'Abyssal Depths'
                            ].slice(0, 3 - wrongAnswers.length));
                        }
                        
                        return {
                            category: 'dungeon',
                            type: 'multiple-choice',
                            difficulty: 'easy',
                            question: `What is the name of the dungeon located in ${dungeon.location || continent.name}?`,
                            correctAnswer: dungeon.name,
                            wrongAnswers: this.shuffleArray(wrongAnswers),
                            explanation: `The dungeon in ${dungeon.location || continent.name} is called "${dungeon.name}".`,
                            dataSource: 'dungeon',
                            continent: continent.name
                        };
                    });
                    
                    // Question about dungeon type/theme
                    if (dungeon.type || dungeon.theme) {
                        const dungeonTheme = dungeon.theme || dungeon.type;
                        generators.push(() => {
                            const themes = [
                                'Ley Line Clash Dungeon',
                                'Corrupted Construct / Entropic Tomb',
                                'Shifting Reality Dungeon / Dual-Alignment',
                                'Ice Cavern',
                                'Fire Temple',
                                'Shadow Realm',
                                'Ancient Ruins'
                            ].filter(theme => theme !== dungeonTheme)
                             .slice(0, 3);
                            
                            return {
                                category: 'dungeon',
                                type: 'multiple-choice',
                                difficulty: 'medium',
                                question: `What is the theme of the dungeon "${dungeon.name}"?`,
                                correctAnswer: dungeonTheme,
                                wrongAnswers: this.shuffleArray(themes),
                                explanation: `"${dungeon.name}" is a ${dungeonTheme}.`,
                                dataSource: 'dungeon',
                                continent: continent.name
                            };
                        });
                    }
                    
                    // Question about dungeon boss
                    if (dungeon.boss && dungeon.boss.name) {
                        generators.push(() => {
                            const otherBosses = [];
                            continents.forEach(c => {
                                if (c.dungeons) {
                                    c.dungeons.forEach(d => {
                                        if (d.boss && d.boss.name && d.boss.name !== dungeon.boss.name) {
                                            otherBosses.push(d.boss.name);
                                        }
                                    });
                                }
                            });
                            
                            const wrongAnswers = otherBosses.slice(0, 3);
                            
                            // If not enough wrong answers, add generic ones
                            while (wrongAnswers.length < 3) {
                                wrongAnswers.push(...[
                                    'The Ice Dragon',
                                    'The Fire Giant',
                                    'The Shadow King',
                                    'The Earth Elemental'
                                ].slice(0, 3 - wrongAnswers.length));
                            }
                            
                            return {
                                category: 'dungeon',
                                type: 'multiple-choice',
                                difficulty: 'medium',
                                question: `Who is the boss of the dungeon "${dungeon.name}"?`,
                                correctAnswer: dungeon.boss.name,
                                wrongAnswers: this.shuffleArray(wrongAnswers),
                                explanation: `The boss of "${dungeon.name}" is ${dungeon.boss.name}.`,
                                dataSource: 'dungeon',
                                continent: continent.name
                            };
                        });
                    }
                    
                    // Question about recommended level
                    if (dungeon.recommended_level) {
                        generators.push(() => {
                            const levels = ['10-20', '25-35', '40-50', '60-75', '80-95', '100+']
                                .filter(level => level !== dungeon.recommended_level)
                                .slice(0, 3);
                            
                            return {
                                category: 'dungeon',
                                type: 'multiple-choice',
                                difficulty: 'easy',
                                question: `What is the recommended level for the dungeon "${dungeon.name}"?`,
                                correctAnswer: dungeon.recommended_level,
                                wrongAnswers: this.shuffleArray(levels),
                                explanation: `"${dungeon.name}" is recommended for levels ${dungeon.recommended_level}.`,
                                dataSource: 'dungeon',
                                continent: continent.name
                            };
                        });
                    }
                });
            }
        });
        
        return generators;
    }
    
    getRaceQuestionGenerators() {
        const generators = [];
        const continents = this.state.continentData;
        
        if (!continents) return generators;
        
        // Collect all unique races
        const allRaces = new Map(); // race -> {trait, effect, continent}
        
        continents.forEach(continent => {
            if (continent.nations && continent.nations.length > 0) {
                continent.nations.forEach(nation => {
                    // Primary race trait
                    if (nation.racial_insight) {
                        const race = nation.racial_insight.race;
                        if (race && !allRaces.has(race)) {
                            allRaces.set(race, {
                                trait: nation.racial_insight.trait,
                                effect: nation.racial_insight.effect,
                                continent: continent.name
                            });
                        }
                    }
                    
                    // Secondary races (add as simple entries)
                    if (nation.secondary_races && nation.secondary_races.length > 0) {
                        nation.secondary_races.forEach(race => {
                            if (race && !allRaces.has(race)) {
                                allRaces.set(race, {
                                    trait: 'Various traits',
                                    effect: 'Depends on specific heritage',
                                    continent: continent.name
                                });
                            }
                        });
                    }
                });
            }
            
            // Other races section
            if (continent.other_races) {
                continent.other_races.forEach(raceInfo => {
                    if (raceInfo.name && !allRaces.has(raceInfo.name)) {
                        allRaces.set(raceInfo.name, {
                            trait: raceInfo.role || 'Various traits',
                            effect: raceInfo.description || 'Depends on specific heritage',
                            continent: continent.name
                        });
                    }
                });
            }
            
            // Racial homelands
            if (continent.racial_homelands) {
                continent.racial_homelands.forEach(homeland => {
                    if (homeland.race && !allRaces.has(homeland.race)) {
                        allRaces.set(homeland.race, {
                            trait: homeland.role || 'Various traits',
                            effect: homeland.description || `Primary homeland in ${homeland.center || continent.name}`,
                            continent: continent.name
                        });
                    }
                });
            }
        });
        
        // Convert to array for easier processing
        const racesArray = Array.from(allRaces.entries()).map(([name, data]) => ({
            name,
            ...data
        }));
        
        if (racesArray.length === 0) return generators;
        
        // Limit to 15 races to avoid too many questions
        const selectedRaces = racesArray.slice(0, 15);
        
        selectedRaces.forEach(race => {
            // Question about race trait
            if (race.trait && race.trait !== 'Various traits') {
                generators.push(() => {
                    const otherRaces = selectedRaces
                        .filter(r => r.name !== race.name && r.trait !== 'Various traits')
                        .map(r => r.trait)
                        .slice(0, 3);
                    
                    // If not enough wrong answers, add generic traits
                    while (otherRaces.length < 3) {
                        otherRaces.push(...[
                            'Night Vision',
                            'Water Breathing',
                            'Stone Sense',
                            'Fire Resistance'
                        ].slice(0, 3 - otherRaces.length));
                    }
                    
                    return {
                        category: 'race',
                        type: 'multiple-choice',
                        difficulty: 'medium',
                        question: `What is the racial trait of the ${race.name}?`,
                        correctAnswer: race.trait,
                        wrongAnswers: this.shuffleArray(otherRaces),
                        explanation: `The ${race.name} racial trait is "${race.trait}". Effect: ${race.effect}`,
                        dataSource: 'race',
                        continent: race.continent
                    };
                });
            }
            
            // Question about race from trait
            if (race.trait && race.trait !== 'Various traits') {
                generators.push(() => {
                    const otherRaces = selectedRaces
                        .filter(r => r.name !== race.name)
                        .map(r => r.name)
                        .slice(0, 3);
                    
                    return {
                        category: 'race',
                        type: 'multiple-choice',
                        difficulty: 'medium',
                        question: `Which race has the trait: "${race.trait}"?`,
                        correctAnswer: race.name,
                        wrongAnswers: this.shuffleArray(otherRaces),
                        explanation: `The ${race.name} have the trait "${race.trait}". Effect: ${race.effect}`,
                        dataSource: 'race',
                        continent: race.continent
                    };
                });
            }
            
            // Question about race homeland/continent
            generators.push(() => {
                const wrongContinents = ['Eldoria', 'Mechanis', 'Spiritus', 'Veridia', 'Crystalia', 'Nocturna', 'Aethelgard']
                    .filter(cont => cont !== race.continent)
                    .slice(0, 3);
                
                return {
                    category: 'race',
                    type: 'multiple-choice',
                    difficulty: 'easy',
                    question: `On which continent can the ${race.name} primarily be found?`,
                    correctAnswer: race.continent,
                    wrongAnswers: this.shuffleArray(wrongContinents),
                    explanation: `The ${race.name} are primarily found on ${race.continent}.`,
                    dataSource: 'race',
                    continent: race.continent
                };
            });
        });
        
        return generators;
    }
    
    generateFallbackQuestion() {
        // Fallback question in case we run out of generated questions
        const fallbackQuestions = [
            {
                category: 'continent',
                type: 'multiple-choice',
                difficulty: 'easy',
                question: 'Which continent is known as the "tutorial continent" where the System runs predictably?',
                correctAnswer: 'Eldoria',
                wrongAnswers: ['Mechanis', 'Spiritus', 'Veridia'],
                explanation: 'Eldoria is known as the "tutorial continent" with stable magic and predictable System behavior (SA 2-4).',
                points: 10
            },
            {
                category: 'system',
                type: 'multiple-choice',
                difficulty: 'easy',
                question: 'What is the name of the world where all these continents exist?',
                correctAnswer: 'Zero',
                wrongAnswers: ['Aether', 'Terra', 'Gaia'],
                explanation: 'The world is called "Zero", which is actually a Creation Engine left by a precursor civilization.',
                points: 10
            },
            {
                category: 'god',
                type: 'multiple-choice',
                difficulty: 'medium',
                question: 'Which continent has a pantheon inspired by Hindu mythology?',
                correctAnswer: 'Eldoria',
                wrongAnswers: ['Mechanis', 'Spiritus', 'Veridia'],
                explanation: 'Eldoria is governed by the Dharnic Celestial Order, inspired by Hindu mythology.',
                points: 25
            },
            {
                category: 'monster',
                type: 'multiple-choice',
                difficulty: 'hard',
                question: 'What is the highest rank a monster can have in the threat rating system?',
                correctAnswer: 'X-Rank Calamity',
                wrongAnswers: ['SSS-Rank', 'SS-Rank', 'S-Rank'],
                explanation: 'X-Rank is the highest monster rank, reserved for Primordial System Anomalies and Reality Debuggers.',
                points: 50
            }
        ];
        
        const randomQuestion = fallbackQuestions[Math.floor(Math.random() * fallbackQuestions.length)];
        randomQuestion.points = this.getPointsForDifficulty(randomQuestion.difficulty);
        return randomQuestion;
    }
    
    assignDifficulty(category) {
        // Assign difficulty based on category and state difficulty setting
        if (this.state.difficulty === 'easy') return 'easy';
        if (this.state.difficulty === 'hard') return 'hard';
        if (this.state.difficulty === 'medium') return 'medium';
        
        // Mixed difficulty: assign based on category
        const categoryDifficulty = {
            'continent': ['easy', 'easy', 'medium'],
            'nation': ['easy', 'easy', 'medium'],
            'ruler': ['medium', 'medium', 'hard'],
            'hero': ['medium', 'hard'],
            'god': ['medium', 'hard', 'hard'],
            'monster': ['easy', 'medium', 'hard'],
            'system': ['easy', 'medium', 'hard'],
            'dungeon': ['easy', 'medium', 'hard'],
            'race': ['easy', 'medium']
        };
        
        const difficulties = categoryDifficulty[category] || ['medium'];
        return difficulties[Math.floor(Math.random() * difficulties.length)];
    }
    
    getPointsForDifficulty(difficulty) {
        switch(difficulty) {
            case 'easy': return 10;
            case 'medium': return 25;
            case 'hard': return 50;
            default: return 10;
        }
    }
    
    showQuestion() {
        const currentQuestion = this.state.questions[this.state.currentQuestionIndex];
        if (!currentQuestion) return;
        
        // Update question text
        document.getElementById('question-text').textContent = currentQuestion.question;
        
        // Update category
        const categoryNames = {
            'continent': 'Continent',
            'nation': 'Nation',
            'ruler': 'Ruler',
            'hero': 'Hero',
            'god': 'God',
            'monster': 'Monster',
            'system': 'System',
            'dungeon': 'Dungeon',
            'race': 'Race'
        };
        
        let categoryText = `${categoryNames[currentQuestion.category] || 'General'} Knowledge`;
        if (currentQuestion.continent) {
            categoryText += ` | ${currentQuestion.continent}`;
        }
        
        document.getElementById('question-category').textContent = categoryText;
        
        // Update difficulty badge
        const difficultyBadge = document.getElementById('difficulty-badge');
        difficultyBadge.textContent = currentQuestion.difficulty.charAt(0).toUpperCase() + currentQuestion.difficulty.slice(1);
        difficultyBadge.className = 'difficulty-badge ' + currentQuestion.difficulty;
        
        // Clear any existing image
        const imageContainer = document.getElementById('question-image-container');
        imageContainer.innerHTML = '';
        
        // Add image if available (in a real implementation, this would come from the data)
        if ((currentQuestion.category === 'continent' || currentQuestion.category === 'monster') && Math.random() > 0.7) {
            const img = document.createElement('img');
            img.src = `https://via.placeholder.com/600x300/4a6fa5/ffffff?text=${encodeURIComponent(currentQuestion.correctAnswer.split(',')[0])}`;
            img.alt = currentQuestion.correctAnswer;
            imageContainer.appendChild(img);
        }
        
        // Generate options
        const optionsContainer = document.getElementById('options-container');
        optionsContainer.innerHTML = '';
        
        // Combine correct and wrong answers
        const allAnswers = [currentQuestion.correctAnswer, ...currentQuestion.wrongAnswers];
        const shuffledAnswers = this.shuffleArray([...allAnswers]);
        
        // Create option elements
        shuffledAnswers.forEach((answer, index) => {
            const option = document.createElement('div');
            option.className = 'option';
            option.dataset.value = answer;
            
            const optionLabel = document.createElement('div');
            optionLabel.className = 'option-label';
            optionLabel.textContent = String.fromCharCode(65 + index); // A, B, C, D
            
            const optionText = document.createElement('div');
            optionText.className = 'option-text';
            optionText.textContent = answer;
            
            option.appendChild(optionLabel);
            option.appendChild(optionText);
            
            option.addEventListener('click', () => this.selectAnswer(option));
            optionsContainer.appendChild(option);
        });
        
        // Clear selected answer
        this.state.selectedAnswer = null;
        
        // Reset submit button
        const submitBtn = document.getElementById('submit-btn');
        submitBtn.disabled = true;
        
        // Clear hint
        const hintText = document.getElementById('hint-text');
        hintText.classList.remove('show');
        hintText.textContent = '';
        
        // Update progress
        this.updateProgress();
    }
    
    selectAnswer(optionElement) {
        // Deselect all options
        document.querySelectorAll('.option').forEach(opt => {
            opt.classList.remove('selected');
        });
        
        // Select clicked option
        optionElement.classList.add('selected');
        
        // Store selected answer
        this.state.selectedAnswer = optionElement.dataset.value;
        
        // Enable submit button
        document.getElementById('submit-btn').disabled = false;
        
        // Play click sound
        this.playSound('click');
    }
    
    submitAnswer() {
        if (this.state.selectedAnswer === null) return;
        
        // Stop timer
        this.stopTimer();
        
        const currentQuestion = this.state.questions[this.state.currentQuestionIndex];
        const isCorrect = this.state.selectedAnswer === currentQuestion.correctAnswer;
        
        // Calculate points
        let pointsEarned = currentQuestion.points;
        const timeBonus = Math.floor(this.state.timeRemaining);
        pointsEarned += timeBonus;
        
        // Update score
        if (isCorrect) {
            this.state.score += pointsEarned;
            this.state.correctAnswers++;
        }
        
        // Store answer for review
        this.state.answers.push({
            question: currentQuestion.question,
            correctAnswer: currentQuestion.correctAnswer,
            userAnswer: this.state.selectedAnswer,
            isCorrect: isCorrect,
            explanation: currentQuestion.explanation,
            points: isCorrect ? pointsEarned : 0,
            timeBonus: timeBonus,
            difficulty: currentQuestion.difficulty,
            category: currentQuestion.category,
            continent: currentQuestion.continent
        });
        
        // Show feedback
        this.showFeedback(isCorrect, pointsEarned, timeBonus);
        
        // Play sound
        this.playSound(isCorrect ? 'correct' : 'incorrect');
    }
    
    showFeedback(isCorrect, pointsEarned, timeBonus) {
        const currentQuestion = this.state.questions[this.state.currentQuestionIndex];
        
        // Update feedback screen
        const feedbackIcon = document.getElementById('feedback-icon');
        feedbackIcon.innerHTML = isCorrect ? 
            '<i class="fas fa-check-circle"></i>' : 
            '<i class="fas fa-times-circle"></i>';
        feedbackIcon.className = `feedback-icon ${isCorrect ? 'correct' : 'incorrect'}`;
        
        document.getElementById('feedback-title').textContent = isCorrect ? 'Correct!' : 'Incorrect';
        
        document.getElementById('feedback-message').innerHTML = isCorrect ?
            `You answered correctly and earned <span class="points-earned">+${pointsEarned}</span> points!` :
            `The correct answer was: <strong>${currentQuestion.correctAnswer}</strong>`;
        
        // Show explanation
        const explanationEl = document.getElementById('answer-explanation');
        explanationEl.innerHTML = `
            <h4>Explanation</h4>
            <p>${currentQuestion.explanation}</p>
        `;
        
        // Show time bonus if correct
        const timeBonusEl = document.getElementById('time-bonus');
        if (isCorrect && timeBonus > 0) {
            timeBonusEl.innerHTML = `Time Bonus: <span class="bonus-points">+${timeBonus}</span> points`;
            timeBonusEl.style.display = 'block';
        } else {
            timeBonusEl.style.display = 'none';
        }
        
        // Switch to feedback screen
        this.switchScreen('feedback');
    }
    
    skipQuestion() {
        // Stop timer
        this.stopTimer();
        
        const currentQuestion = this.state.questions[this.state.currentQuestionIndex];
        
        // Store as incorrect answer
        this.state.answers.push({
            question: currentQuestion.question,
            correctAnswer: currentQuestion.correctAnswer,
            userAnswer: null,
            isCorrect: false,
            explanation: currentQuestion.explanation,
            points: 0,
            timeBonus: 0,
            difficulty: currentQuestion.difficulty,
            category: currentQuestion.category,
            continent: currentQuestion.continent
        });
        
        // Move to next question
        this.nextQuestion();
    }
    
    nextQuestion() {
        // Move to next question
        this.state.currentQuestionIndex++;
        
        // Check if quiz is complete
        if (this.state.currentQuestionIndex >= this.state.questions.length) {
            this.completeQuiz();
            return;
        }
        
        // Reset timer
        this.state.timeRemaining = 60;
        
        // Show next question
        this.showQuestion();
        
        // Switch back to question screen
        this.switchScreen('question');
        
        // Start timer
        this.startTimer();
    }
    
    startTimer() {
        // Clear any existing timer
        this.stopTimer();
        
        // Update timer display
        this.updateTimerDisplay();
        
        // Start new timer
        this.state.timerInterval = setInterval(() => {
            this.state.timeRemaining--;
            this.updateTimerDisplay();
            
            // Change color when time is running low
            const timerEl = document.getElementById('timer');
            if (this.state.timeRemaining <= 10) {
                timerEl.style.color = '#dc3545'; // Red
                timerEl.style.animation = 'pulse 1s infinite';
            } else if (this.state.timeRemaining <= 30) {
                timerEl.style.color = '#ffc107'; // Yellow
                timerEl.style.animation = '';
            } else {
                timerEl.style.color = '';
                timerEl.style.animation = '';
            }
            
            // Time's up
            if (this.state.timeRemaining <= 0) {
                this.timeUp();
            }
        }, 1000);
    }
    
    stopTimer() {
        if (this.state.timerInterval) {
            clearInterval(this.state.timerInterval);
            this.state.timerInterval = null;
        }
    }
    
    updateTimerDisplay() {
        document.getElementById('timer').textContent = this.state.timeRemaining;
    }
    
    timeUp() {
        this.stopTimer();
        
        // Auto-submit if an answer is selected
        if (this.state.selectedAnswer !== null) {
            this.submitAnswer();
        } else {
            // Otherwise skip the question
            this.skipQuestion();
        }
    }
    
    completeQuiz() {
        // Stop timer
        this.stopTimer();
        
        // Calculate final score
        let finalScore = this.state.score;
        
        // Add perfect quiz bonus
        if (this.state.correctAnswers === this.state.questions.length) {
            finalScore += 100;
        }
        
        this.state.score = finalScore;
        
        // Update results screen
        document.getElementById('correct-answers').textContent = `${this.state.correctAnswers} / ${this.state.questions.length}`;
        document.getElementById('final-score').textContent = this.state.score;
        
        // Calculate total time bonus
        const totalTimeBonus = this.state.answers.reduce((sum, answer) => sum + answer.timeBonus, 0);
        document.getElementById('final-time').textContent = totalTimeBonus;
        
        // Determine rank
        const percentage = (this.state.correctAnswers / this.state.questions.length) * 100;
        let rank = 'Novice';
        
        if (percentage >= 90) rank = 'System Sage';
        else if (percentage >= 75) rank = 'Lore Master';
        else if (percentage >= 60) rank = 'Knowledge Seeker';
        else if (percentage >= 40) rank = 'Apprentice';
        
        document.getElementById('rank-title').textContent = rank;
        
        // Create breakdown chart
        this.createResultsChart();
        
        // Create breakdown stats
        this.createBreakdownStats();
        
        // Switch to results screen
        this.switchScreen('results');
        
        // Play completion sound
        this.playSound('complete');
    }
    
    createResultsChart() {
        const ctx = document.getElementById('results-chart').getContext('2d');
        
        // Group answers by category
        const categoryCounts = {};
        const categoryCorrect = {};
        
        this.state.answers.forEach(answer => {
            const category = answer.category;
            categoryCounts[category] = (categoryCounts[category] || 0) + 1;
            if (answer.isCorrect) {
                categoryCorrect[category] = (categoryCorrect[category] || 0) + 1;
            }
        });
        
        const categories = Object.keys(categoryCounts);
        const correctData = categories.map(cat => categoryCorrect[cat] || 0);
        const totalData = categories.map(cat => categoryCounts[cat]);
        
        // Calculate percentages
        const percentageData = categories.map((cat, i) => {
            return totalData[i] > 0 ? Math.round((correctData[i] / totalData[i]) * 100) : 0;
        });
        
        // Define colors for each category
        const categoryColors = {
            'continent': '#4a6fa5',
            'nation': '#17a2b8',
            'ruler': '#28a745',
            'hero': '#ffc107',
            'god': '#dc3545',
            'monster': '#6f42c1',
            'system': '#fd7e14',
            'dungeon': '#20c997',
            'race': '#e83e8c'
        };
        
        const backgroundColors = categories.map(cat => categoryColors[cat] || '#6c757d');
        
        // Destroy existing chart if it exists
        if (window.resultsChart) {
            window.resultsChart.destroy();
        }
        
        // Create new chart
        window.resultsChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: categories.map(cat => {
                    const categoryNames = {
                        'continent': 'Continent',
                        'nation': 'Nation',
                        'ruler': 'Ruler',
                        'hero': 'Hero',
                        'god': 'God',
                        'monster': 'Monster',
                        'system': 'System',
                        'dungeon': 'Dungeon',
                        'race': 'Race'
                    };
                    return categoryNames[cat] || cat.charAt(0).toUpperCase() + cat.slice(1);
                }),
                datasets: [{
                    label: 'Correct Answers (%)',
                    data: percentageData,
                    backgroundColor: backgroundColors,
                    borderColor: backgroundColors.map(color => color.replace('0.8', '1')),
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const category = categories[context.dataIndex];
                                const correct = correctData[context.dataIndex];
                                const total = totalData[context.dataIndex];
                                return `${context.parsed.y}% (${correct}/${total} correct)`;
                            }
                        }
                    }
                }
            }
        });
    }
    
    createBreakdownStats() {
        const breakdownStats = document.getElementById('breakdown-stats');
        breakdownStats.innerHTML = '';
        
        // Group answers by category
        const categoryStats = {};
        
        this.state.answers.forEach(answer => {
            const category = answer.category;
            if (!categoryStats[category]) {
                categoryStats[category] = {
                    total: 0,
                    correct: 0,
                    points: 0
                };
            }
            
            categoryStats[category].total++;
            if (answer.isCorrect) {
                categoryStats[category].correct++;
                categoryStats[category].points += answer.points;
            }
        });
        
        // Create HTML for each category
        Object.keys(categoryStats).forEach(category => {
            const stats = categoryStats[category];
            const percentage = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
            
            const categoryNames = {
                'continent': 'Continent',
                'nation': 'Nation',
                'ruler': 'Ruler',
                'hero': 'Hero',
                'god': 'God',
                'monster': 'Monster',
                'system': 'System',
                'dungeon': 'Dungeon',
                'race': 'Race'
            };
            
            const displayName = categoryNames[category] || category.charAt(0).toUpperCase() + category.slice(1);
            
            const statEl = document.createElement('div');
            statEl.className = 'breakdown-stat';
            statEl.innerHTML = `
                <div class="breakdown-category">${displayName}</div>
                <div class="breakdown-value">${stats.correct}/${stats.total} (${percentage}%)</div>
            `;
            
            breakdownStats.appendChild(statEl);
        });
    }
    
    showReview() {
        const reviewContainer = document.getElementById('review-container');
        reviewContainer.innerHTML = '';
        
        // Create review items for each question
        this.state.answers.forEach((answer, index) => {
            const reviewItem = document.createElement('div');
            reviewItem.className = 'review-item';
            
            const question = this.state.questions[index];
            
            reviewItem.innerHTML = `
                <div class="review-question">${index + 1}. ${answer.question}</div>
                <div class="review-answer ${answer.isCorrect ? 'correct' : 'incorrect'}">
                    <i class="fas ${answer.isCorrect ? 'fa-check' : 'fa-times'}"></i>
                    <div>
                        <strong>Your answer:</strong> ${answer.userAnswer || 'Skipped'}<br>
                        <strong>Correct answer:</strong> ${answer.correctAnswer}
                    </div>
                </div>
                <div class="review-explanation">
                    <strong>Explanation:</strong> ${answer.explanation}
                    ${answer.isCorrect ? `<br><strong>Points earned:</strong> ${answer.points} (${answer.points - answer.timeBonus} base + ${answer.timeBonus} time bonus)` : ''}
                </div>
            `;
            
            reviewContainer.appendChild(reviewItem);
        });
        
        // Switch to review screen
        this.switchScreen('review');
    }
    
    restartQuiz() {
        // Reset state
        this.state.currentQuestionIndex = 0;
        this.state.score = 0;
        this.state.correctAnswers = 0;
        this.state.answers = [];
        this.state.quizStarted = false;
        this.state.selectedAnswer = null;
        
        // Update UI
        this.updateUI();
        
        // Switch to start screen
        this.switchScreen('start');
    }
    
    toggleHint() {
        if (!this.state.hintsEnabled) {
            alert('Hints are disabled. Enable them in the footer controls.');
            return;
        }
        
        const hintText = document.getElementById('hint-text');
        const currentQuestion = this.state.questions[this.state.currentQuestionIndex];
        
        if (!hintText.classList.contains('show')) {
            // Generate hint based on question type
            let hint = '';
            const correctAnswer = currentQuestion.correctAnswer;
            
            if (currentQuestion.category === 'continent') {
                hint = `This continent has System Authority range ${currentQuestion.continent ? 'specific to its theme' : 'that affects magic stability'}.`;
            } else if (currentQuestion.category === 'nation') {
                hint = `This nation belongs to a specific continent and has a distinct capital city.`;
            } else if (currentQuestion.category === 'ruler') {
                hint = `This ruler possesses a unique skill with a specific star rating.`;
            } else if (currentQuestion.category === 'hero') {
                hint = `This hero is known for a specific deed and has a combat style.`;
            } else if (currentQuestion.category === 'god') {
                hint = `This deity is part of a pantheon with specific domains.`;
            } else if (currentQuestion.category === 'monster') {
                hint = `This creature has a specific threat classification and rank.`;
            } else if (currentQuestion.category === 'system') {
                hint = `This relates to the fundamental mechanics governing the Zero world.`;
            } else if (currentQuestion.category === 'dungeon') {
                hint = `This dungeon has a specific theme and recommended level range.`;
            } else if (currentQuestion.category === 'race') {
                hint = `This race has specific traits and is found primarily on one continent.`;
            }
            
            // Sometimes give a more specific hint
            if (Math.random() > 0.5) {
                const answerLength = correctAnswer.length;
                hint += ` The answer is ${answerLength} characters long.`;
            }
            
            hintText.textContent = hint;
            hintText.classList.add('show');
        } else {
            hintText.classList.remove('show');
        }
        
        // Play click sound
        this.playSound('click');
    }
    
    toggleSound() {
        this.state.soundEnabled = !this.state.soundEnabled;
        const soundIcon = document.getElementById('sound-icon');
        soundIcon.className = this.state.soundEnabled ? 'fas fa-volume-up' : 'fas fa-volume-mute';
        
        // Play test sound if enabling
        if (this.state.soundEnabled) {
            this.playSound('click');
        }
    }
    
    toggleHints() {
        this.state.hintsEnabled = !this.state.hintsEnabled;
        const hintsIcon = document.getElementById('hints-icon');
        
        if (this.state.hintsEnabled) {
            hintsIcon.className = 'fas fa-lightbulb';
            hintsIcon.style.color = '#ffc107';
        } else {
            hintsIcon.className = 'fas fa-lightbulb';
            hintsIcon.style.color = '#6c757d';
        }
        
        // Play click sound
        this.playSound('click');
    }
    
    showHelp() {
        document.getElementById('help-modal').classList.add('active');
        this.playSound('click');
    }
    
    hideHelp() {
        document.getElementById('help-modal').classList.remove('active');
    }
    
    playSound(soundName) {
        if (!this.state.soundEnabled) return;
        
        const soundMap = {
            'correct': document.getElementById('correct-sound'),
            'incorrect': document.getElementById('incorrect-sound'),
            'click': document.getElementById('click-sound'),
            'complete': document.getElementById('complete-sound')
        };
        
        const sound = soundMap[soundName];
        if (sound) {
            sound.currentTime = 0;
            sound.play().catch(e => console.log('Audio play failed:', e));
        }
    }
    
    switchScreen(screenName) {
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        // Show selected screen
        document.getElementById(`${screenName}-screen`).classList.add('active');
        this.state.currentScreen = screenName;
    }
    
    updateUI() {
        // Update question count display
        document.getElementById('question-count').textContent = this.state.totalQuestions;
        document.getElementById('total-questions').textContent = this.state.totalQuestions;
        
        // Update current question number
        document.getElementById('current-question').textContent = this.state.currentQuestionIndex + 1;
        
        // Update score display
        document.getElementById('current-score').textContent = this.state.score;
        
        // Update continent count if data is loaded
        if (this.state.continentData) {
            document.getElementById('continent-count').textContent = this.state.continentData.length;
        }
        
        // Update progress bar
        this.updateProgress();
    }
    
    updateProgress() {
        if (this.state.questions.length > 0) {
            const progress = ((this.state.currentQuestionIndex + 1) / this.state.questions.length) * 100;
            document.getElementById('progress-fill').style.width = `${progress}%`;
        }
    }
    
    showResults() {
        this.switchScreen('results');
    }
    
    showLoading(show) {
        const loadingOverlay = document.getElementById('loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.style.display = show ? 'flex' : 'none';
        }
    }
    
    // Utility function to shuffle array
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
}

// Initialize the quiz when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.quiz = new ZeroWorldQuiz();
});

// Add CSS animation for timer pulse
const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0% { opacity: 1; }
        50% { opacity: 0.5; }
        100% { opacity: 1; }
    }
    
    #loading-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.85);
        color: white;
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
        flex-direction: column;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }
    
    #loading-overlay i {
        font-size: 4rem;
        margin-bottom: 20px;
        color: #4a6fa5;
    }
    
    #loading-overlay p {
        font-size: 1.3rem;
        max-width: 400px;
        text-align: center;
        line-height: 1.5;
    }
`;
document.head.appendChild(style);

// Mobile Navigation Toggle - UPDATED FOR FULL SCREEN
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    const body = document.body;
    
    if (hamburger) {
        hamburger.addEventListener('click', function(event) {
            event.preventDefault();
            event.stopPropagation();
            
            navMenu.classList.toggle('active');
            body.classList.toggle('menu-open');
            
            // Toggle hamburger icon
            const icon = hamburger.querySelector('i');
            if (icon.classList.contains('fa-bars')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }
    
    // Close mobile menu when clicking a link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function() {
            if (navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                body.classList.remove('menu-open');
                const icon = hamburger.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            }
        });
    });
    
    // Close mobile menu when clicking outside (on overlay)
    document.addEventListener('click', function(event) {
        const isClickInsideNav = event.target.closest('nav');
        const isHamburger = event.target.closest('#hamburger');
        
        if (navMenu.classList.contains('active') && !isClickInsideNav && !isHamburger) {
            navMenu.classList.remove('active');
            body.classList.remove('menu-open');
            const icon = hamburger.querySelector('i');
            if (icon) {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        }
    });
    
    // Close menu on window resize (if resized to desktop)
    window.addEventListener('resize', function() {
        if (window.innerWidth > 992 && navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
            body.classList.remove('menu-open');
            const icon = hamburger.querySelector('i');
            if (icon) {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        }
    });
    
    // Toggle dropdowns on mobile
    document.querySelectorAll('.dropdown-toggle').forEach(toggle => {
        toggle.addEventListener('click', function(event) {
            if (window.innerWidth <= 992) {
                event.preventDefault();
                event.stopPropagation();
                
                const dropdown = this.parentElement;
                dropdown.classList.toggle('active');
                
                // Close other dropdowns
                document.querySelectorAll('.dropdown').forEach(other => {
                    if (other !== dropdown) {
                        other.classList.remove('active');
                    }
                });
            }
        });
    });
    
    // Highlight current page link
    const currentPage = window.location.pathname.split('/').pop();
    document.querySelectorAll('.nav-link').forEach(link => {
        const linkPage = link.getAttribute('href');
        if (linkPage === currentPage || (linkPage === 'quiz.html' && currentPage === '')) {
            link.classList.add('active');
        }
    });
});