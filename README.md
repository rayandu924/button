# Button

A customizable glassmorphism tile shortcut widget for MyWallpaper. Open URLs, files, folders, or application protocols with a single click.

## Features

- **Multiple Action Types**: Open URLs, execute files, open folders, or launch apps via protocol handlers (spotify://, discord://, etc.)
- **Flexible Icons**: Use emojis, URLs, or local image files
- **Glassmorphism Design**: Customizable blur, opacity, and border effects
- **Glow Effects**: Configurable glow color and intensity
- **Smooth Animations**: Spring-based hover and click animations
- **Hot Reload**: Settings update in real-time

## Installation

1. In MyWallpaper, go to **Settings > Developer**
2. Enter the URL: `http://localhost:5174` (for local development)
3. Enable **Developer Mode**

## Local Development

```bash
npx serve -l 5174 --cors
```

## Settings

### Action
- **Action Type**: URL, File, Folder, or Protocol
- **Target**: The path/URL to open

### Icon
- **Source**: Emoji, URL, or local file
- **Size**: 24-128px

### Appearance
- **Label**: Optional text below the icon
- **Tile Color/Opacity**: Glassmorphism background
- **Blur**: Backdrop blur amount
- **Border**: Customizable radius, width, color, opacity

### Effects
- **Glow**: Toggle, color, and intensity
- **Hover Scale**: Size increase on hover
- **Click Scale**: Size decrease on click

## Examples

### Open a Website
- Action Type: `Open URL`
- Target: `https://github.com`

### Launch Spotify
- Action Type: `App Protocol`
- Target: `spotify://`

### Open a Folder
- Action Type: `Open Folder`
- Target: `/home/user/Documents`

## License

MIT
