# Contributing to The Daily Cairo

Thank you for considering contributing to **The Daily Cairo**!

We welcome contributions from everyone — whether it's fixing bugs, improving the UI, adding new features, optimizing performance, enhancing the API, or improving documentation.

---

## 📖 Table of Contents

* [How to Contribute](#how-to-contribute)
* [Development Setup](#development-setup)
* [Contribution Guidelines](#contribution-guidelines)
* [Ideas for Contribution](#ideas-for-contribution)

---

## How to Contribute

### 1. Fork the Repository

Create your own fork of the project.

### 2. Create a New Branch

```bash
git checkout -b feature/your-feature-name

# Examples:
# git checkout -b feature/article-reactions
# git checkout -b feature/email-notifications
# git checkout -b fix/search-pagination
```

### 3. Make Your Changes

Implement your feature, fix, documentation update, or improvement.

### 4. Commit and Push

```bash
git add .

git commit -m "feat: add article reaction system"

git push origin feature/your-feature-name
```

### 5. Open a Pull Request

Describe:

* What was changed
* Why it was changed
* How to test it
* Screenshots (if UI related)

---

## Development Setup

### Backend (Laravel 12)

```bash
cd backend

composer install

cp .env.example .env

php artisan key:generate

php artisan migrate --seed

php artisan storage:link

php artisan serve
```

Backend URL:

```text
http://localhost:8000
```

### Frontend (React 18)

```bash
cd frontend

npm install

npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

---

## Contribution Guidelines

### Small Focused Pull Requests

Keep each Pull Request focused on a single feature or fix.

### Commit Message Convention

Use descriptive commit messages:

```text
feat: add article bookmarking
fix: resolve login validation issue
docs: update API documentation
refactor: simplify article service logic
style: improve mobile navigation layout
test: add authentication feature tests
```

### API Changes

Any new or modified endpoint should be documented before opening a Pull Request.

### Database Changes

Always create new migration files.

Never modify existing migrations that may already be in production.

### Code Style

#### Backend

* Follow Laravel conventions
* Use Form Requests or validation rules
* Keep controllers lightweight
* Move business logic into Services when appropriate
* Follow PSR-12 standards

#### Frontend

* Use TypeScript for all new code
* Keep components reusable and maintainable
* Avoid unnecessary duplication
* Follow the existing project structure

### Accessibility

* Add proper alt attributes to images
* Ensure keyboard accessibility
* Use semantic HTML whenever possible

### Respect Others

Be respectful, constructive, and professional in all discussions.

---

## Ideas for Contribution

### 📰 Content Features

* Article reactions (Like, Love, Insightful)
* Article ratings
* Related article recommendations
* Reading progress tracking
* Personalized news feed

### 🔐 Authentication & Security

* Google OAuth Login
* Email verification
* Two-factor authentication (2FA)
* Login activity tracking
* Session management

### 👤 User Experience

* Saved searches
* Follow categories
* Follow authors
* Reading statistics dashboard
* Newsletter subscriptions

### 🔔 Notifications

* Breaking news alerts
* Category subscription notifications
* Email notifications
* Push notification support

### 🔍 Search & Discovery

* Search autocomplete
* Advanced filters
* Trending topics
* Popular tags system

### 🎨 UI & Design

* Skeleton loaders
* Enhanced article animations
* Improved dark mode
* Better mobile navigation
* Accessibility improvements

### 📊 Admin Features

* Advanced analytics
* Editorial workflow system
* Content scheduling
* Author management
* Moderation tools

### ⚙️ Technical Improvements

* PHPUnit tests
* React Testing Library tests
* CI/CD pipelines
* Docker support
* Performance optimization
* Caching improvements
* PWA support

### 📝 Documentation

* Improve inline documentation
* Expand API documentation
* Create Postman collection
* Add architecture diagrams

---

We're excited to see your contributions! 🚀

---

Built with ❤️ by **Ibrahim Elsayed**
