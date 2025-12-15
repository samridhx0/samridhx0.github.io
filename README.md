# Markdown Blog System

A minimal, efficient, and beautiful markdown-based blog system built with pure HTML, CSS, and vanilla JavaScript.

## Features

- ✅ **Pure Markdown**: Write posts in simple `.md` files
- ✅ **No Build Process**: No webpack, no babel, no compilation
- ✅ **Lightweight Parser**: Custom markdown parser in ~60 lines of JS
- ✅ **Accessible**: Semantic HTML, keyboard navigation, screen reader friendly
- ✅ **Beautiful Typography**: Clean, readable design with thoughtful spacing
- ✅ **Fast**: Minimal JavaScript, instant page loads
- ✅ **Git-Friendly**: Version control your content with ease
- ✅ **Simple URLs**: Clean post URLs with query parameters

## How It Works

### Directory Structure

```
├── blog.html           # Blog list and post renderer
├── posts/
│   ├── posts.json     # Post index/metadata
│   ├── post-1.md      # Your blog posts
│   ├── post-2.md
│   └── post-3.md
```

### Adding a New Post

1. **Create a markdown file** in the `posts/` directory:

```markdown
# My New Post

This is my blog post content...
```

2. **Add metadata** to `posts/posts.json`:

```json
{
  "id": "my-new-post",
  "title": "My New Post",
  "date": "2025-12-15",
  "description": "A brief description of the post",
  "file": "my-new-post.md"
}
```

3. **That's it!** Your post is now live.

## Supported Markdown Features

The built-in parser supports:

- Headers (`#`, `##`, `###`)
- Bold (`**bold**`)
- Italic (`*italic*`)
- Links (`[text](url)`)
- Inline code (`` `code` ``)
- Code blocks (` ```language `)
- Blockquotes (`> quote`)
- Unordered lists (`- item`)
- Ordered lists (`1. item`)

## Styling Guide

The blog uses minimal CSS for maximum readability:

- **Max width**: 650px for optimal reading
- **Font**: System font stack (native on every OS)
- **Line height**: 1.6 for comfortable reading
- **Colors**: Subtle grays and blue links
- **Spacing**: Generous margins for breathing room

## Why This Approach?

### Simple
- No complex build tools
- No framework dependencies
- Just HTML, CSS, and vanilla JS

### Fast
- Minimal JavaScript (~100 lines)
- No external libraries
- Instant page loads

### Maintainable
- Easy to understand
- Easy to modify
- Easy to deploy

### Accessible
- Semantic HTML
- Keyboard navigation
- Screen reader friendly
- Works without JavaScript (graceful degradation)

## Deployment

Deploy to GitHub Pages, Netlify, Vercel, or any static hosting:

```bash
git add .
git commit -m "Add new post"
git push
```

That's it! No build step, no deployment pipeline.

## Future Enhancements (Optional)

Keep it simple, but if you want to add features:

- **RSS Feed**: Generate `feed.xml` from `posts.json`
- **Search**: Simple client-side search through posts
- **Tags/Categories**: Add to `posts.json` metadata
- **Dark Mode**: Add CSS variables and toggle
- **Syntax Highlighting**: Add Prism.js or highlight.js

## Philosophy

This blog system embodies the principle of **simplicity at the core**:

> "Perfection is achieved, not when there is nothing more to add, but when there is nothing left to take away." — Antoine de Saint-Exupéry

Focus on writing. Everything else is optional.
