import { useState, useEffect, useCallback, useMemo } from 'react'
import { useSettings, useViewport, useFiles, useSystemActions } from '@mywallpaper/sdk-react'

// ---------------------------------------------------------------------------
// APP PRESETS
// ---------------------------------------------------------------------------

interface AppPreset {
  protocol: string
  emoji: string
  label: string
  icon: string | null
}

const APP_PRESETS: Record<string, AppPreset> = {
  spotify: {
    protocol: 'spotify://',
    emoji: '\u{1F3B5}',
    label: 'Spotify',
    icon: 'https://upload.wikimedia.org/wikipedia/commons/8/84/Spotify_icon.svg',
  },
  discord: {
    protocol: 'discord://',
    emoji: '\u{1F4AC}',
    label: 'Discord',
    icon: 'https://assets-global.website-files.com/6257adef93867e50d84d30e2/6257d23c5fb25be7e0b6e220_Open%20Source%20Projects%20702702b9ac54dd3a999140.svg',
  },
  vscode: {
    protocol: 'vscode://',
    emoji: '\u{1F4BB}',
    label: 'VS Code',
    icon: 'https://upload.wikimedia.org/wikipedia/commons/9/9a/Visual_Studio_Code_1.35_icon.svg',
  },
  slack: {
    protocol: 'slack://',
    emoji: '\u{1F4E2}',
    label: 'Slack',
    icon: 'https://upload.wikimedia.org/wikipedia/commons/d/d5/Slack_icon_2019.svg',
  },
  telegram: {
    protocol: 'tg://',
    emoji: '\u2708\uFE0F',
    label: 'Telegram',
    icon: 'https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg',
  },
  steam: {
    protocol: 'steam://',
    emoji: '\u{1F3AE}',
    label: 'Steam',
    icon: 'https://upload.wikimedia.org/wikipedia/commons/8/83/Steam_icon_logo.svg',
  },
  obs: {
    protocol: 'obsproject://',
    emoji: '\u{1F3A5}',
    label: 'OBS Studio',
    icon: 'https://upload.wikimedia.org/wikipedia/commons/1/14/Open_Broadcaster_Software_Logo.png',
  },
  figma: {
    protocol: 'figma://',
    emoji: '\u{1F3A8}',
    label: 'Figma',
    icon: 'https://upload.wikimedia.org/wikipedia/commons/3/33/Figma-logo.svg',
  },
  notion: {
    protocol: 'notion://',
    emoji: '\u{1F4DD}',
    label: 'Notion',
    icon: 'https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png',
  },
  chrome: {
    protocol: 'googlechrome://',
    emoji: '\u{1F310}',
    label: 'Chrome',
    icon: 'https://upload.wikimedia.org/wikipedia/commons/e/e1/Google_Chrome_icon_%28February_2022%29.svg',
  },
  firefox: {
    protocol: 'firefox://',
    emoji: '\u{1F98A}',
    label: 'Firefox',
    icon: 'https://upload.wikimedia.org/wikipedia/commons/a/a0/Firefox_logo%2C_2019.svg',
  },
  terminal: {
    protocol: 'x-terminal-emulator://',
    emoji: '\u2B1B',
    label: 'Terminal',
    icon: null,
  },
}

// ---------------------------------------------------------------------------
// Settings interface (mirrors manifest.json settings)
// ---------------------------------------------------------------------------

interface ShortcutTileSettings {
  // Action
  actionMode: 'preset' | 'url' | 'file' | 'folder' | 'custom'
  appPreset: string
  targetUrl: string
  targetFile: unknown
  targetFolder: string
  targetProtocol: string
  // Icon
  iconSource: 'auto' | 'emoji' | 'url' | 'file'
  iconEmoji: string
  iconUrl: string
  iconFile: unknown
  iconSize: number
  // Label
  showLabel: boolean
  labelMode: 'auto' | 'custom'
  labelCustom: string
  labelSize: number
  labelColor: string
  // Tile
  tileColor: string
  tileOpacity: number
  blurAmount: number
  borderRadius: number
  borderWidth: number
  borderColor: string
  borderOpacity: number
  // Effects
  enableGlow: boolean
  glowColor: string
  glowIntensity: number
  hoverScale: number
  clickScale: number
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ShortcutTile() {
  const settings = useSettings<ShortcutTileSettings>()
  const viewport = useViewport()
  const files = useFiles()
  const { openPath } = useSystemActions()

  const [iconBlobUrl, setIconBlobUrl] = useState<string | null>(null)
  const [fileBlobUrl, setFileBlobUrl] = useState<string | null>(null)
  const [clicked, setClicked] = useState(false)
  const [error, setError] = useState(false)

  // ---- Destructure settings with defaults -----------------------------------

  const actionMode = settings.actionMode ?? 'preset'
  const appPreset = settings.appPreset ?? 'spotify'
  const targetUrl = settings.targetUrl ?? 'https://github.com'
  const targetFile = settings.targetFile ?? null
  const targetFolder = settings.targetFolder ?? ''
  const targetProtocol = settings.targetProtocol ?? ''
  const iconSource = settings.iconSource ?? 'auto'
  const iconEmoji = settings.iconEmoji ?? '\u{1F680}'
  const iconUrl = settings.iconUrl ?? ''
  const iconFile = settings.iconFile ?? null
  const iconSize = settings.iconSize ?? 48
  const showLabel = settings.showLabel ?? true
  const labelMode = settings.labelMode ?? 'auto'
  const labelCustom = settings.labelCustom ?? ''
  const labelSize = settings.labelSize ?? 14
  const labelColor = settings.labelColor ?? '#ffffff'
  const tileColor = settings.tileColor ?? '#ffffff'
  const tileOpacity = settings.tileOpacity ?? 10
  const blurAmount = settings.blurAmount ?? 12
  const borderRadius = settings.borderRadius ?? 16
  const borderWidth = settings.borderWidth ?? 1
  const borderColor = settings.borderColor ?? '#ffffff'
  const borderOpacity = settings.borderOpacity ?? 20
  const enableGlow = settings.enableGlow ?? true
  const glowColor = settings.glowColor ?? '#8b5cf6'
  const glowIntensity = settings.glowIntensity ?? 10
  const hoverScale = settings.hoverScale ?? 1.08
  const clickScale = settings.clickScale ?? 0.95

  // ---- Resolve preset -------------------------------------------------------

  const preset = actionMode === 'preset' ? APP_PRESETS[appPreset] ?? null : null

  // ---- Load file blob URLs via useFiles -------------------------------------

  useEffect(() => {
    if (iconSource === 'file' && iconFile && files.isFileReference(iconFile)) {
      files.request('iconFile').then((url) => {
        if (url) setIconBlobUrl(url)
      })
    } else {
      setIconBlobUrl(null)
    }
  }, [iconSource, iconFile, files])

  useEffect(() => {
    if (actionMode === 'file' && targetFile && files.isFileReference(targetFile)) {
      files.request('targetFile').then((url) => {
        if (url) setFileBlobUrl(url)
      })
    } else {
      setFileBlobUrl(null)
    }
  }, [actionMode, targetFile, files])

  // ---- Target path & type ---------------------------------------------------

  const targetPath = useMemo<string>(() => {
    switch (actionMode) {
      case 'preset':
        return preset ? preset.protocol : ''
      case 'url':
        return targetUrl
      case 'file':
        return fileBlobUrl ?? (targetFile as string) ?? ''
      case 'folder':
        return targetFolder
      case 'custom':
        return targetProtocol
      default:
        return ''
    }
  }, [actionMode, preset, targetUrl, fileBlobUrl, targetFile, targetFolder, targetProtocol])

  const actionType = useMemo<'auto' | 'url' | 'file' | 'folder' | 'protocol'>(() => {
    switch (actionMode) {
      case 'preset':
      case 'custom':
        return 'protocol'
      case 'url':
        return 'url'
      case 'file':
        return 'file'
      case 'folder':
        return 'folder'
      default:
        return 'auto'
    }
  }, [actionMode])

  // ---- Click handler --------------------------------------------------------

  const handleClick = useCallback(async () => {
    if (!targetPath) {
      console.warn('[ShortcutTile] No target configured')
      setError(true)
      setTimeout(() => setError(false), 2000)
      return
    }

    // Visual feedback
    setClicked(true)
    setTimeout(() => setClicked(false), 300)

    try {
      await openPath(targetPath, actionType)
    } catch (err) {
      console.error('[ShortcutTile] Error:', err)
      setError(true)
      setTimeout(() => setError(false), 2000)
    }
  }, [targetPath, actionType, openPath])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        handleClick()
      }
    },
    [handleClick],
  )

  // ---- Icon rendering -------------------------------------------------------

  const iconElement = useMemo(() => {
    const sizeStyle = { width: iconSize, height: iconSize }

    // Auto mode with preset
    if (iconSource === 'auto' && preset) {
      if (preset.icon) {
        return <img style={{ ...sizeStyle, objectFit: 'contain' as const }} src={preset.icon} alt="" />
      }
      return (
        <span style={{ fontSize: iconSize, lineHeight: 1, textAlign: 'center' as const }}>
          {preset.emoji}
        </span>
      )
    }

    switch (iconSource) {
      case 'auto':
      case 'emoji': {
        const emoji = iconSource === 'auto' && preset ? preset.emoji : iconEmoji
        return (
          <span style={{ fontSize: iconSize, lineHeight: 1, textAlign: 'center' as const }}>
            {emoji || '\u{1F680}'}
          </span>
        )
      }
      case 'url':
        if (iconUrl) {
          return <img style={{ ...sizeStyle, objectFit: 'contain' as const }} src={iconUrl} alt="" />
        }
        return (
          <span style={{ fontSize: iconSize, lineHeight: 1, textAlign: 'center' as const }}>
            {'\u{1F680}'}
          </span>
        )
      case 'file':
        if (iconBlobUrl) {
          return <img style={{ ...sizeStyle, objectFit: 'contain' as const }} src={iconBlobUrl} alt="" />
        }
        return (
          <span style={{ fontSize: iconSize, lineHeight: 1, textAlign: 'center' as const }}>
            {'\u{1F680}'}
          </span>
        )
      default:
        return (
          <span style={{ fontSize: iconSize, lineHeight: 1, textAlign: 'center' as const }}>
            {'\u{1F680}'}
          </span>
        )
    }
  }, [iconSource, preset, iconSize, iconEmoji, iconUrl, iconBlobUrl])

  // ---- Label text -----------------------------------------------------------

  const labelText = useMemo<string>(() => {
    if (labelMode === 'auto') {
      if (preset) return preset.label
      if (actionMode === 'url') {
        try {
          return new URL(targetUrl).hostname
        } catch {
          return 'URL'
        }
      }
      if (actionMode === 'file') return 'Fichier'
      if (actionMode === 'folder') return 'Dossier'
      return 'Raccourci'
    }
    return labelCustom || 'Raccourci'
  }, [labelMode, preset, actionMode, targetUrl, labelCustom])

  // ---- Inline styles --------------------------------------------------------

  const glowRgba = hexToRgba(glowColor, 0.5)
  const glowHoverRgba = hexToRgba(glowColor, 0.7)

  const tileStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    width: '100%',
    height: '100%',
    cursor: 'pointer',
    userSelect: 'none',
    background: hexToRgba(tileColor, tileOpacity / 100),
    backdropFilter: `blur(${blurAmount}px)`,
    WebkitBackdropFilter: `blur(${blurAmount}px)`,
    border: `${borderWidth}px solid ${hexToRgba(borderColor, borderOpacity / 100)}`,
    borderRadius,
    boxShadow: enableGlow ? `0 0 ${glowIntensity}px ${glowRgba}` : undefined,
    borderColor: error ? 'rgba(239, 68, 68, 0.5)' : undefined,
  }

  const labelStyle: React.CSSProperties = {
    display: showLabel ? 'block' : 'none',
    fontWeight: 500,
    fontSize: labelSize,
    color: labelColor,
    textAlign: 'center',
    textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '100%',
  }

  // ---- CSS-in-JS for hover / active via CSS vars + style tag ----------------

  const tileId = 'shortcut-tile'

  const dynamicCSS = `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body, #root { width: 100%; height: 100%; overflow: hidden; background: transparent; }

    #${tileId} {
      transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1),
                  box-shadow 0.2s ease,
                  background-color 0.2s ease;
    }

    #${tileId}:hover {
      transform: scale(${hoverScale});
      ${enableGlow ? `box-shadow: 0 0 ${glowIntensity * 1.5}px ${glowHoverRgba};` : ''}
    }

    #${tileId}:active {
      transform: scale(${clickScale});
    }

    @keyframes pulse {
      0% { opacity: 1; }
      50% { opacity: 0.7; }
      100% { opacity: 1; }
    }

    #${tileId}.clicked {
      animation: pulse 0.3s ease;
    }
  `

  // ---- Render ---------------------------------------------------------------

  void viewport // acknowledge viewport subscription

  return (
    <>
      <style>{dynamicCSS}</style>
      <div
        id={tileId}
        className={clicked ? 'clicked' : undefined}
        style={tileStyle}
        tabIndex={0}
        role="button"
        onClick={handleClick}
        onKeyDown={handleKeyDown}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {iconElement}
        </div>
        <div style={labelStyle}>{labelText}</div>
      </div>
    </>
  )
}
