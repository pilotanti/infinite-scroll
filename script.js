/**
 * Infinite Scroll - Main JavaScript
 * 
 * Handles:
 *  - Fetching posts from PHP API (with client-side fallback)
 *  - Intersection Observer for infinite scroll triggering
 *  - Category filtering
 *  - Scroll-based navbar effects & FAB visibility
 *  - Animated post counter
 *  - Graceful error handling & retries
 */

// ─── Configuration ───
const CONFIG = {
    apiUrl: 'api.php',
    postsPerPage: 6,
    rootMargin: '400px',
    maxRetries: 2,
    retryDelay: 800,
    totalPosts: 120,
};

// ─── State ───
const state = {
    currentPage: 1,
    isLoading: false,
    hasMore: true,
    activeCategory: 'all',
    totalLoaded: 0,
    retryCount: 0,
    useClientFallback: false,
    viewMode: 'explore',  // 'explore' | 'trending'
};

// ─── Client-Side Data Generator (Fallback when PHP is unavailable) ───
const DataGenerator = {
    categories: ['technology', 'design', 'science', 'lifestyle', 'travel'],

    titles: {
        technology: [
            "The Rise of Quantum Computing in 2026",
            "Building Scalable Microservices with Go",
            "WebAssembly: The Future of Browser Performance",
            "Understanding Neural Network Architecture",
            "Edge Computing Transforms IoT Deployments",
            "Rust vs C++: A Modern Systems Comparison",
            "Kubernetes Best Practices for Production",
            "The Evolution of Programming Languages",
            "Blockchain Beyond Cryptocurrency",
            "Machine Learning Pipeline Optimization",
            "5G Networks and Their Impact on Development",
            "Serverless Architecture Patterns",
            "GraphQL vs REST: Making the Right Choice",
            "Cybersecurity Trends Every Dev Should Know",
            "DevOps Culture: Breaking Down Silos",
            "Progressive Web Apps in Enterprise",
            "Data Engineering with Apache Spark",
            "Microcontrollers and Embedded Systems Today",
            "AI-Powered Code Review Tools",
            "Zero Trust Security Architecture",
        ],
        design: [
            "Mastering Design Systems at Scale",
            "The Psychology of Color in UI Design",
            "Typography Trends Shaping Digital Experiences",
            "Designing Accessible-First Interfaces",
            "Micro-Animations That Delight Users",
            "Glassmorphism: Beyond the Trend",
            "Dark Mode Design Best Practices",
            "Mobile-First vs Desktop-First Strategy",
            "Creating Stunning Data Visualizations",
            "The Art of White Space in Modern Design",
            "Design Tokens for Cross-Platform Consistency",
            "Figma Advanced Prototyping Techniques",
            "Motion Design Principles for Developers",
            "Responsive Images and Art Direction",
            "Brutalism in Modern Web Design",
            "User Research Methods That Actually Work",
            "Brand Identity Systems for Startups",
            "Illustration Trends in Product Design",
            "Voice UI Design Considerations",
            "Designing for Augmented Reality",
        ],
        science: [
            "CRISPR Gene Editing: Latest Breakthroughs",
            "Dark Matter: What We Know in 2026",
            "Quantum Entanglement Explained Simply",
            "The Science of Climate Modeling",
            "Mars Colonization: Current Progress",
            "Neuroscience of Learning and Memory",
            "Fusion Energy: The Path Forward",
            "Ocean Acidification and Marine Life",
            "The Microbiome Revolution in Medicine",
            "Gravitational Waves and New Discoveries",
            "Stem Cell Therapy Advances",
            "Particle Physics After the Higgs Boson",
            "The Mathematics of Chaos Theory",
            "Synthetic Biology and Bio-Engineering",
            "Space Telescope Discoveries of 2026",
            "The Physics of Superconductors",
            "Evolutionary Biology in the Genomic Age",
            "Asteroid Mining Feasibility Studies",
            "Brain-Computer Interface Progress",
            "The Chemistry of Sustainable Materials",
        ],
        lifestyle: [
            "Building a Sustainable Morning Routine",
            "Digital Minimalism for Better Focus",
            "The Science Behind Intermittent Fasting",
            "Remote Work Productivity Strategies",
            "Mindfulness Practices for Busy Professionals",
            "Ergonomic Home Office Setup Guide",
            "Sleep Optimization for Peak Performance",
            "Healthy Meal Prep for the Workweek",
            "Financial Planning for Freelancers",
            "The Art of Deep Work in a Distracted World",
            "Fitness Routines You Can Do Anywhere",
            "Mental Health in the Tech Industry",
            "Sustainable Living: Small Changes Big Impact",
            "Time Management with the Pomodoro Method",
            "Book Recommendations for Personal Growth",
            "Building Meaningful Relationships Online",
            "Photography as a Mindfulness Practice",
            "Journaling Techniques for Self-Discovery",
            "Work-Life Balance in Remote Teams",
            "The Benefits of Learning a New Language",
        ],
        travel: [
            "Hidden Gems of Southeast Asia",
            "Sustainable Travel in the Modern Age",
            "Digital Nomad Hubs Worth Visiting",
            "Solo Travel Safety Guide for 2026",
            "Cultural Etiquette Around the World",
            "Best Scenic Train Journeys Worldwide",
            "Island Hopping in the Mediterranean",
            "Adventure Travel on a Budget",
            "Northern Lights: Best Viewing Locations",
            "Street Food Tours That Changed My Life",
            "Eco-Friendly Resorts and Lodges",
            "Exploring Japan Beyond Tokyo",
            "Road Trips Through the American Southwest",
            "Backpacking Through South America",
            "UNESCO Heritage Sites You Must Visit",
            "Winter Wonderlands Worth the Cold",
            "Underwater Adventures: Best Dive Spots",
            "Cultural Festivals Not to Miss",
            "Travel Photography Tips and Gear",
            "The Future of Space Tourism",
        ],
    },

    excerpts: {
        technology: "Explore the cutting-edge advancements in technology that are reshaping how we build, deploy, and interact with software systems across industries.",
        design: "Dive into the latest design methodologies and visual trends that are creating more intuitive, beautiful, and inclusive digital experiences for users worldwide.",
        science: "Discover groundbreaking scientific research and discoveries that push the boundaries of our understanding of the universe and our place within it.",
        lifestyle: "Learn practical strategies and evidence-based approaches to optimize your daily routines, health, productivity, and overall well-being for a balanced life.",
        travel: "Journey to breathtaking destinations and uncover travel insights that help make your adventures more enriching, sustainable, and unforgettable.",
    },

    authors: [
        { name: 'Alex Chen',      initials: 'AC' },
        { name: 'Sarah Parker',   initials: 'SP' },
        { name: 'James Wilson',   initials: 'JW' },
        { name: 'Maya Patel',     initials: 'MP' },
        { name: 'David Kim',      initials: 'DK' },
        { name: 'Elena Ross',     initials: 'ER' },
        { name: 'Ryan Torres',    initials: 'RT' },
        { name: 'Lisa Chang',     initials: 'LC' },
        { name: 'Omar Hassan',    initials: 'OH' },
        { name: 'Nina Johansson', initials: 'NJ' },
        { name: 'Chris Blake',    initials: 'CB' },
        { name: 'Priya Sharma',   initials: 'PS' },
    ],

    // Simple seeded random for deterministic posts
    _seed: 1,
    seededRandom(seed) {
        const x = Math.sin(seed * 9301 + 49297) * 49311;
        return x - Math.floor(x);
    },

    generatePost(id, filterCategory) {
        const cat = filterCategory !== 'all'
            ? filterCategory
            : this.categories[Math.floor(this.seededRandom(id * 7) * this.categories.length)];

        const catTitles = this.titles[cat];
        let title = catTitles[id % catTitles.length];

        if (id >= catTitles.length) {
            const suffixes = [': A Deep Dive', ' — Part ' + Math.ceil(id / catTitles.length), ': Updated Guide', ': Expert Analysis', ': Case Study'];
            title += suffixes[id % suffixes.length];
        }

        const author = this.authors[id % this.authors.length];
        const daysAgo = (id * 3) % 90;
        const date = new Date();
        date.setDate(date.getDate() - daysAgo);
        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const imageId = 100 + (id * 13) % 900;

        return {
            id,
            title,
            excerpt: this.excerpts[cat],
            category: cat,
            author,
            date: dateStr,
            image: `https://picsum.photos/seed/${imageId}/800/500`,
            read_time: 3 + Math.floor(this.seededRandom(id * 11) * 13),
            likes: 20 + Math.floor(this.seededRandom(id * 17) * 960),
            comments: 2 + Math.floor(this.seededRandom(id * 23) * 83),
        };
    },

    getPage(page, limit, category) {
        const effectiveTotal = category !== 'all'
            ? Math.floor(CONFIG.totalPosts / this.categories.length)
            : CONFIG.totalPosts;

        const startIndex = (page - 1) * limit;
        const posts = [];

        for (let i = 0; i < limit; i++) {
            const globalId = startIndex + i + 1;
            if (globalId > effectiveTotal) break;
            posts.push(this.generatePost(globalId, category));
        }

        const hasMore = (startIndex + limit) < effectiveTotal;

        return {
            success: true,
            page,
            limit,
            category,
            total: effectiveTotal,
            has_more: hasMore,
            posts,
            loaded_count: posts.length,
        };
    },

    // Generate ALL posts, sort by likes (descending), then paginate
    _trendingCache: null,
    _trendingCacheCategory: null,

    getTrendingPage(page, limit, category) {
        // Build or refresh cache when category changes
        if (!this._trendingCache || this._trendingCacheCategory !== category) {
            const effectiveTotal = category !== 'all'
                ? Math.floor(CONFIG.totalPosts / this.categories.length)
                : CONFIG.totalPosts;

            const allPosts = [];
            for (let i = 1; i <= effectiveTotal; i++) {
                allPosts.push(this.generatePost(i, category));
            }
            // Sort by likes descending (most popular first)
            allPosts.sort((a, b) => b.likes - a.likes);
            this._trendingCache = allPosts;
            this._trendingCacheCategory = category;
        }

        const startIndex = (page - 1) * limit;
        const posts = this._trendingCache.slice(startIndex, startIndex + limit);
        const hasMore = (startIndex + limit) < this._trendingCache.length;

        return {
            success: true,
            page,
            limit,
            category,
            total: this._trendingCache.length,
            has_more: hasMore,
            posts,
            loaded_count: posts.length,
        };
    },

    clearTrendingCache() {
        this._trendingCache = null;
        this._trendingCacheCategory = null;
    },
};

// ─── DOM References ───
const dom = {
    postsGrid: document.getElementById('posts-grid'),
    loadingIndicator: document.getElementById('loading-indicator'),
    endMessage: document.getElementById('end-message'),
    counterValue: document.getElementById('counter-value'),
    navbar: document.getElementById('navbar'),
    fabTop: document.getElementById('fab-top'),
    filterBtns: document.querySelectorAll('.filter-btn'),
    navExplore: document.getElementById('nav-explore'),
    navTrending: document.getElementById('nav-trending'),
    navCategories: document.getElementById('nav-categories'),
    filterBar: document.getElementById('filter-bar'),
    viewBanner: document.getElementById('view-banner'),
    viewBannerIcon: document.getElementById('view-banner-icon'),
    viewBannerText: document.getElementById('view-banner-text'),
};

// ─── Intersection Observer for Infinite Scroll ───
let observer;

function setupObserver() {
    if (observer) observer.disconnect();

    observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !state.isLoading && state.hasMore) {
                    loadPosts();
                }
            });
        },
        { rootMargin: CONFIG.rootMargin }
    );

    if (dom.loadingIndicator) {
        observer.observe(dom.loadingIndicator);
    }
}

// ─── Fetch Posts (API → Client Fallback) ───
async function loadPosts() {
    if (state.isLoading || !state.hasMore) return;

    state.isLoading = true;
    showLoading(true);

    try {
        let data;

        if (state.useClientFallback) {
            // Client-side generation — simulate network delay
            await delay(300 + Math.random() * 500);
            if (state.viewMode === 'trending') {
                data = DataGenerator.getTrendingPage(state.currentPage, CONFIG.postsPerPage, state.activeCategory);
            } else {
                data = DataGenerator.getPage(state.currentPage, CONFIG.postsPerPage, state.activeCategory);
            }
        } else {
            // Try PHP API first
            const url = `${CONFIG.apiUrl}?page=${state.currentPage}&limit=${CONFIG.postsPerPage}&category=${state.activeCategory}`;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const text = await response.text();

            // Check if the response is valid JSON (not an HTML error page)
            try {
                data = JSON.parse(text);
            } catch (parseErr) {
                throw new Error('Invalid JSON response — PHP server may not be running');
            }

            // If in trending mode with PHP, sort client-side
            if (state.viewMode === 'trending' && data.success && data.posts.length > 0) {
                data.posts.sort((a, b) => b.likes - a.likes);
            }
        }

        if (data.success && data.posts.length > 0) {
            renderPosts(data.posts);
            state.currentPage++;
            state.totalLoaded += data.posts.length;
            state.hasMore = data.has_more;
            state.retryCount = 0;

            updateCounter();

            if (!state.hasMore) {
                showEndMessage();
            }
        } else {
            state.hasMore = false;
            showEndMessage();
        }
    } catch (error) {
        console.warn('API fetch failed:', error.message);

        // If PHP is not available, switch to client-side fallback
        if (!state.useClientFallback) {
            console.log('%c⚡ Switching to client-side data generator (PHP not available)', 'color: #7c5cfc; font-weight: bold;');
            state.useClientFallback = true;
            state.isLoading = false;
            loadPosts();
            return;
        }

        state.retryCount++;
        if (state.retryCount <= CONFIG.maxRetries) {
            setTimeout(() => {
                state.isLoading = false;
                loadPosts();
            }, CONFIG.retryDelay);
            return;
        } else {
            showErrorMessage();
        }
    }

    state.isLoading = false;
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ─── Render Posts ───
function renderPosts(posts) {
    const fragment = document.createDocumentFragment();

    posts.forEach((post, index) => {
        const card = createPostCard(post, index);
        fragment.appendChild(card);
    });

    dom.postsGrid.appendChild(fragment);
}

function createPostCard(post, index) {
    const card = document.createElement('article');
    card.className = 'post-card';
    card.id = `post-${post.id}`;
    card.style.animationDelay = `${index * 0.1}s`;

    card.innerHTML = `
        <div class="card-image">
            <img src="${post.image}" alt="${escapeHtml(post.title)}" loading="lazy" 
                 onerror="this.src='https://picsum.photos/seed/${post.id}/800/500'">
            <div class="card-image-overlay"></div>
            <span class="card-category ${post.category}">${post.category}</span>
        </div>
        <div class="card-body">
            <h2 class="card-title">${escapeHtml(post.title)}</h2>
            <p class="card-excerpt">${escapeHtml(post.excerpt)}</p>
            <div class="card-footer">
                <div class="card-author">
                    <div class="author-avatar">${post.author.initials}</div>
                    <div class="author-info">
                        <span class="author-name">${escapeHtml(post.author.name)}</span>
                        <span class="author-date">${post.date} · ${post.read_time} min read</span>
                    </div>
                </div>
                <div class="card-stats">
                    <span class="stat">
                        <span class="stat-icon">❤️</span>
                        ${post.likes}
                    </span>
                    <span class="stat">
                        <span class="stat-icon">💬</span>
                        ${post.comments}
                    </span>
                </div>
            </div>
        </div>
    `;

    return card;
}

// ─── UI Helpers ───
function showLoading(visible) {
    dom.loadingIndicator.classList.toggle('hidden', !visible);
}

function showEndMessage() {
    showLoading(false);
    dom.endMessage.classList.remove('hidden');
    if (observer) observer.disconnect();
}

function showErrorMessage() {
    showLoading(false);
    const errorDiv = document.createElement('div');
    errorDiv.className = 'end-message';
    errorDiv.innerHTML = `
        <div class="end-icon">⚠️</div>
        <h3>Something went wrong</h3>
        <p>Could not load more posts. Please check your connection and try again.</p>
        <button class="btn-top" onclick="retryLoad()">↻ Retry</button>
    `;
    dom.postsGrid.parentElement.appendChild(errorDiv);
}

function retryLoad() {
    state.retryCount = 0;
    state.isLoading = false;
    state.hasMore = true;

    // Remove error messages
    document.querySelectorAll('.end-message:not(#end-message)').forEach(el => el.remove());

    showLoading(true);
    setupObserver();
    loadPosts();
}

function updateCounter() {
    const target = state.totalLoaded;
    const current = parseInt(dom.counterValue.textContent) || 0;
    const duration = 400;
    const startTime = performance.now();

    function animateCount(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = Math.round(current + (target - current) * eased);
        dom.counterValue.textContent = value;

        if (progress < 1) {
            requestAnimationFrame(animateCount);
        }
    }

    requestAnimationFrame(animateCount);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ─── Category Filtering ───
dom.filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const category = btn.dataset.category;
        if (category === state.activeCategory && state.viewMode === 'explore') return;

        // Update active filter button
        dom.filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Reset state
        state.activeCategory = category;
        state.currentPage = 1;
        state.totalLoaded = 0;
        state.hasMore = true;
        state.isLoading = false;
        state.retryCount = 0;

        // If a specific category is chosen, show a banner
        if (category !== 'all') {
            const catIcons = { technology: '💻', design: '🎨', science: '🔬', lifestyle: '🌿', travel: '✈️' };
            showViewBanner(catIcons[category] || '📂', `${category.charAt(0).toUpperCase() + category.slice(1)} Posts`);
        } else if (state.viewMode === 'trending') {
            showViewBanner('🔥', 'Trending Posts — Sorted by Most Liked');
        } else {
            hideViewBanner();
        }

        // Clear trending cache on category change
        DataGenerator.clearTrendingCache();

        // Clear grid
        dom.postsGrid.innerHTML = '';
        dom.endMessage.classList.add('hidden');

        // Remove any error messages
        document.querySelectorAll('.end-message:not(#end-message)').forEach(el => el.remove());

        updateCounter();

        // Re-setup observer and load
        setupObserver();
        loadPosts();
    });
});

// ─── Navigation View Switching ───
function switchView(view, event) {
    if (event) event.preventDefault();

    // Update nav link active state
    [dom.navExplore, dom.navTrending, dom.navCategories].forEach(link => {
        if (link) link.classList.remove('active');
    });

    if (view === 'explore') {
        if (dom.navExplore) dom.navExplore.classList.add('active');

        state.viewMode = 'explore';
        state.activeCategory = 'all';
        state.currentPage = 1;
        state.totalLoaded = 0;
        state.hasMore = true;
        state.isLoading = false;
        state.retryCount = 0;

        // Reset filter buttons
        dom.filterBtns.forEach(b => b.classList.remove('active'));
        document.querySelector('.filter-btn[data-category="all"]')?.classList.add('active');

        DataGenerator.clearTrendingCache();
        hideViewBanner();

        // Clear and reload
        dom.postsGrid.innerHTML = '';
        dom.endMessage.classList.add('hidden');
        document.querySelectorAll('.end-message:not(#end-message)').forEach(el => el.remove());
        updateCounter();
        setupObserver();
        loadPosts();

        // Scroll to content
        dom.filterBar?.scrollIntoView({ behavior: 'smooth', block: 'start' });

    } else if (view === 'trending') {
        if (dom.navTrending) dom.navTrending.classList.add('active');

        state.viewMode = 'trending';
        state.currentPage = 1;
        state.totalLoaded = 0;
        state.hasMore = true;
        state.isLoading = false;
        state.retryCount = 0;

        DataGenerator.clearTrendingCache();
        showViewBanner('🔥', 'Trending Posts — Sorted by Most Liked');

        // Clear and reload
        dom.postsGrid.innerHTML = '';
        dom.endMessage.classList.add('hidden');
        document.querySelectorAll('.end-message:not(#end-message)').forEach(el => el.remove());
        updateCounter();
        setupObserver();
        loadPosts();

        // Scroll to content
        dom.filterBar?.scrollIntoView({ behavior: 'smooth', block: 'start' });

    } else if (view === 'categories') {
        if (dom.navCategories) dom.navCategories.classList.add('active');

        // Scroll to filter bar and highlight it
        dom.filterBar?.scrollIntoView({ behavior: 'smooth', block: 'start' });

        // Visual highlight pulse
        if (dom.filterBar) {
            dom.filterBar.classList.add('highlight');
            setTimeout(() => dom.filterBar.classList.remove('highlight'), 1500);
        }

        // After a moment, set nav back to current active view
        setTimeout(() => {
            [dom.navExplore, dom.navTrending, dom.navCategories].forEach(l => l?.classList.remove('active'));
            if (state.viewMode === 'trending') {
                dom.navTrending?.classList.add('active');
            } else {
                dom.navExplore?.classList.add('active');
            }
        }, 1500);
    }
}

function showViewBanner(icon, text) {
    if (dom.viewBanner) {
        dom.viewBannerIcon.textContent = icon;
        dom.viewBannerText.textContent = text;
        dom.viewBanner.classList.remove('hidden');
    }
}

function hideViewBanner() {
    if (dom.viewBanner) {
        dom.viewBanner.classList.add('hidden');
    }
}

// ─── Scroll Effects ───
let ticking = false;

window.addEventListener('scroll', () => {
    if (!ticking) {
        requestAnimationFrame(() => {
            const scrollY = window.scrollY;

            // Navbar solid background on scroll
            dom.navbar.classList.toggle('scrolled', scrollY > 50);

            // FAB visibility
            dom.fabTop.classList.toggle('hidden', scrollY < 500);

            ticking = false;
        });
        ticking = true;
    }
});

// ─── Initialize ───
document.addEventListener('DOMContentLoaded', () => {
    setupObserver();
    loadPosts();
});
