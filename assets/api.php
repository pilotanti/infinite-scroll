<?php
/**
 * Infinite Scroll API
 * 
 * Returns paginated post data as JSON.
 * Supports: ?page=N&limit=N&category=string
 * 
 * Each post includes: id, title, excerpt, category, author, date,
 *                      image (from picsum.photos), read_time, likes, comments
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

// ─── Configuration ───
$POSTS_PER_PAGE = 6;
$TOTAL_POSTS    = 120;  // Total available posts

// ─── Parse Query Parameters ───
$page     = isset($_GET['page'])     ? max(1, intval($_GET['page']))     : 1;
$limit    = isset($_GET['limit'])    ? max(1, min(20, intval($_GET['limit']))) : $POSTS_PER_PAGE;
$category = isset($_GET['category']) ? strtolower(trim($_GET['category'])) : 'all';

// ─── Data Pools ───
$categories = ['technology', 'design', 'science', 'lifestyle', 'travel'];

$titles = [
    'technology' => [
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
        "Zero Trust Security Architecture"
    ],
    'design' => [
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
        "Designing for Augmented Reality"
    ],
    'science' => [
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
        "The Chemistry of Sustainable Materials"
    ],
    'lifestyle' => [
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
        "The Benefits of Learning a New Language"
    ],
    'travel' => [
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
        "The Future of Space Tourism"
    ]
];

$excerpts = [
    'technology' => "Explore the cutting-edge advancements in technology that are reshaping how we build, deploy, and interact with software systems across industries.",
    'design'     => "Dive into the latest design methodologies and visual trends that are creating more intuitive, beautiful, and inclusive digital experiences for users worldwide.",
    'science'    => "Discover groundbreaking scientific research and discoveries that push the boundaries of our understanding of the universe and our place within it.",
    'lifestyle'  => "Learn practical strategies and evidence-based approaches to optimize your daily routines, health, productivity, and overall well-being for a balanced life.",
    'travel'     => "Journey to breathtaking destinations and uncover travel insights that help make your adventures more enriching, sustainable, and unforgettable."
];

$authors = [
    ['name' => 'Alex Chen',      'initials' => 'AC'],
    ['name' => 'Sarah Parker',   'initials' => 'SP'],
    ['name' => 'James Wilson',   'initials' => 'JW'],
    ['name' => 'Maya Patel',     'initials' => 'MP'],
    ['name' => 'David Kim',      'initials' => 'DK'],
    ['name' => 'Elena Ross',     'initials' => 'ER'],
    ['name' => 'Ryan Torres',    'initials' => 'RT'],
    ['name' => 'Lisa Chang',     'initials' => 'LC'],
    ['name' => 'Omar Hassan',    'initials' => 'OH'],
    ['name' => 'Nina Johansson', 'initials' => 'NJ'],
    ['name' => 'Chris Blake',    'initials' => 'CB'],
    ['name' => 'Priya Sharma',   'initials' => 'PS'],
];

// ─── Generate Deterministic Posts ───
function generatePost($id, $categories, $titles, $excerpts, $authors, $filterCategory) {
    // Use seed for deterministic randomness
    mt_srand($id * 7919);  // Prime multiplier for good distribution

    if ($filterCategory !== 'all') {
        $cat = $filterCategory;
    } else {
        $cat = $categories[mt_rand(0, count($categories) - 1)];
    }

    $catTitles = $titles[$cat];
    $titleIndex = $id % count($catTitles);
    $title = $catTitles[$titleIndex];

    // Add unique variation if we've cycled
    if ($id >= count($catTitles)) {
        $suffixes = [': A Deep Dive', ' — Part ' . ceil($id / count($catTitles)), ': Updated Guide', ': Expert Analysis', ': Case Study'];
        $title .= $suffixes[$id % count($suffixes)];
    }

    $author = $authors[$id % count($authors)];
    $daysAgo = ($id * 3) % 90;
    $date = date('M d, Y', strtotime("-{$daysAgo} days"));

    // Image - using picsum for variety (seeded by id)
    $imageId = 100 + ($id * 13) % 900;

    return [
        'id'        => $id,
        'title'     => $title,
        'excerpt'   => $excerpts[$cat],
        'category'  => $cat,
        'author'    => $author,
        'date'      => $date,
        'image'     => "https://picsum.photos/seed/{$imageId}/800/500",
        'read_time' => mt_rand(3, 15),
        'likes'     => mt_rand(20, 980),
        'comments'  => mt_rand(2, 85),
    ];
}

// ─── Calculate Pagination ───
$startIndex = ($page - 1) * $limit;
$posts = [];

// Filter total by category simulation
$effectiveTotal = ($category !== 'all') ? intval($TOTAL_POSTS / count($categories)) : $TOTAL_POSTS;

for ($i = 0; $i < $limit; $i++) {
    $globalId = $startIndex + $i + 1;
    if ($globalId > $effectiveTotal) break;

    $posts[] = generatePost($globalId, $categories, $titles, $excerpts, $authors, $category);
}

$hasMore = ($startIndex + $limit) < $effectiveTotal;

// Simulate network latency (300-800ms)
usleep(mt_rand(300000, 800000));

// ─── Return Response ───
echo json_encode([
    'success'      => true,
    'page'         => $page,
    'limit'        => $limit,
    'category'     => $category,
    'total'        => $effectiveTotal,
    'has_more'     => $hasMore,
    'posts'        => $posts,
    'loaded_count' => count($posts),
], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
