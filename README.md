# ∞ Infinite Scroll

A modern, visually stunning web application showcasing **infinite scrolling** functionality. Content loads automatically as users scroll down the page, providing a seamless browsing experience.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![PHP](https://img.shields.io/badge/PHP-777BB4?style=for-the-badge&logo=php&logoColor=white)

## ✨ Features

- **Infinite Scrolling** — New posts load automatically as you scroll, no pagination clicks needed
- **Intersection Observer API** — Efficient scroll detection for optimal performance
- **Category Filtering** — Filter posts by Technology, Design, Science, Lifestyle, and Travel
- **Animated Loading Skeletons** — Shimmer effect placeholders while content loads
- **Dark Mode UI** — Premium dark theme with glassmorphism effects
- **Animated Background Blobs** — Dynamic floating gradient blobs
- **Responsive Design** — Works beautifully on desktop, tablet, and mobile
- **Animated Post Counter** — Live counter showing total posts loaded
- **Back to Top FAB** — Floating action button appears on scroll
- **Error Handling & Retry** — Graceful error states with retry capability

## 🛠️ Tech Stack

| Layer      | Technology      | Purpose                           |
|------------|-----------------|-----------------------------------|
| Structure  | **HTML5**       | Semantic markup & SEO             |
| Styling    | **CSS3**        | Animations, glassmorphism, layout |
| Logic      | **JavaScript**  | Infinite scroll, DOM manipulation |
| Backend    | **PHP**         | REST API for paginated data       |

## 🚀 Getting Started

### Prerequisites

- A PHP-enabled web server (e.g., XAMPP, WAMP, MAMP, or PHP's built-in server)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/infinite-scroll.git
   cd infinite-scroll
   ```

2. **Start a local PHP server:**
   ```bash
   php -S localhost:8000
   ```

3. **Open in browser:**
   ```
   http://localhost:8000
   ```

## 📂 Project Structure

```
infinite-scroll/
├── index.html      # Main HTML page
├── style.css       # Complete styling with animations
├── script.js       # Infinite scroll logic & DOM manipulation
├── api.php         # PHP API endpoint for paginated posts
└── README.md       # Project documentation
```

## 📡 API Endpoints

### `GET /api.php`

Returns paginated post data as JSON.

| Parameter  | Type   | Default | Description                        |
|------------|--------|---------|------------------------------------|
| `page`     | int    | 1       | Page number (1-indexed)            |
| `limit`    | int    | 6       | Posts per page (max 20)            |
| `category` | string | all     | Filter by category                 |

**Example Response:**
```json
{
  "success": true,
  "page": 1,
  "limit": 6,
  "category": "all",
  "total": 120,
  "has_more": true,
  "posts": [
    {
      "id": 1,
      "title": "The Rise of Quantum Computing in 2026",
      "excerpt": "Explore the cutting-edge advancements...",
      "category": "technology",
      "author": { "name": "Alex Chen", "initials": "AC" },
      "date": "Mar 26, 2026",
      "image": "https://picsum.photos/seed/113/800/500",
      "read_time": 7,
      "likes": 342,
      "comments": 28
    }
  ],
  "loaded_count": 6
}
```

## 🎨 Design Highlights

- **Glassmorphism** — Frosted glass navbar and filter bar with `backdrop-filter`
- **Gradient Blobs** — 3 animated SVG-like blobs floating in the background
- **Shimmer Skeletons** — Loading placeholders with animated gradients
- **Micro-Animations** — Card hover effects, smooth reveal on scroll, counter animation
- **Modern Typography** — Using Inter + Outfit from Google Fonts

## 📜 License

This project is open source and available under the [MIT License](LICENSE).
