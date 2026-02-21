import { useState, useEffect, useCallback, useRef } from 'react'
import { useSettings, useFiles, useSystemActions } from '@mywallpaper/sdk-react'

interface ButtonSettings {
  label: string
  actionType: 'url' | 'file' | 'folder' | 'protocol'
  execUrl: string
  execFile: string
  execFolder: string
  execProtocol: string
  iconEmoji: string
  iconSourceType: 'emoji' | 'url' | 'upload'
  iconUrl: string
  iconImage: unknown
  size: number
  borderRadiusUrl: number
  borderRadiusUpload: number
  hoverScale: number
  enableGlow: boolean
  glowColor: string
  glowIntensity: number
  gifPlayOnHover: boolean
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export default function Button() {
  const settings = useSettings<ButtonSettings>()
  const { openPath } = useSystemActions()
  const { request: requestFile, isFileReference } = useFiles()

  const [hovered, setHovered] = useState(false)
  const [clicked, setClicked] = useState(false)
  const [fileBlobUrl, setFileBlobUrl] = useState<string | null>(null)
  const [staticFrame, setStaticFrame] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const label = settings.label ?? 'My Button'
  const actionType = settings.actionType ?? 'url'

  const execPathMap: Record<string, string> = {
    url: settings.execUrl ?? '',
    file: settings.execFile ?? '',
    folder: settings.execFolder ?? '',
    protocol: settings.execProtocol ?? '',
  }
  const execPath = execPathMap[actionType] ?? ''

  const iconEmoji = settings.iconEmoji ?? '\u{1F680}'
  const iconSourceType = settings.iconSourceType ?? 'emoji'
  const iconUrl = settings.iconUrl ?? ''
  const size = settings.size ?? 48
  const hoverScale = (settings.hoverScale ?? 108) / 100
  const enableGlow = settings.enableGlow ?? true
  const glowColor = settings.glowColor ?? '#8b5cf6'
  const glowIntensity = settings.glowIntensity ?? 10
  const gifPlayOnHover = settings.gifPlayOnHover ?? false

  const borderRadius = iconSourceType === 'url'
    ? (settings.borderRadiusUrl ?? 8)
    : iconSourceType === 'upload'
      ? (settings.borderRadiusUpload ?? 8)
      : 0

  // Resolve uploaded image
  useEffect(() => {
    if (iconSourceType === 'upload' && isFileReference(settings.iconImage)) {
      requestFile('iconImage').then((url) => {
        if (url) setFileBlobUrl(url)
      })
    }
  }, [iconSourceType, settings.iconImage, requestFile, isFileReference])

  const imgSrc = iconSourceType === 'upload' ? fileBlobUrl : iconSourceType === 'url' ? iconUrl : null

  // Detect GIF + capture first frame from raw blob (before browser animates it)
  const [isGif, setIsGif] = useState(false)
  useEffect(() => {
    if (!imgSrc) { setIsGif(false); setStaticFrame(null); return }

    let cancelled = false
    fetch(imgSrc)
      .then(r => r.blob())
      .then(async (blob) => {
        if (cancelled) return
        // Check magic bytes GIF8
        const header = new Uint8Array(await blob.slice(0, 6).arrayBuffer())
        const magic = header[0] === 0x47 && header[1] === 0x49 && header[2] === 0x46 && header[3] === 0x38
        setIsGif(magic)

        if (magic && gifPlayOnHover) {
          // createImageBitmap on the raw blob captures frame 1 before any animation
          const bitmap = await createImageBitmap(blob)
          if (cancelled) return
          const canvas = document.createElement('canvas')
          canvas.width = bitmap.width
          canvas.height = bitmap.height
          const ctx = canvas.getContext('2d')
          if (ctx) {
            ctx.drawImage(bitmap, 0, 0)
            setStaticFrame(canvas.toDataURL('image/png'))
          }
          bitmap.close()
        } else {
          setStaticFrame(null)
        }
      })
      .catch(() => { setIsGif(false); setStaticFrame(null) })

    return () => { cancelled = true }
  }, [imgSrc, gifPlayOnHover])

  const handleClick = useCallback(async () => {
    if (!execPath) return
    setClicked(true)
    setTimeout(() => setClicked(false), 200)
    try {
      await openPath(execPath, actionType)
    } catch (err) {
      console.error('[Button] Launch failed:', err)
    }
  }, [execPath, actionType, openPath])

  // Restart GIF from beginning on each hover
  const [gifKey, setGifKey] = useState(0)
  const handlePointerEnter = useCallback(() => {
    setHovered(true)
    if (gifPlayOnHover && isGif) setGifKey(k => k + 1)
  }, [gifPlayOnHover, isGif])

  let displaySrc: string | null
  if (gifPlayOnHover && isGif && !hovered && staticFrame) {
    displaySrc = staticFrame
  } else if (gifPlayOnHover && isGif && hovered && imgSrc) {
    displaySrc = imgSrc + (imgSrc.includes('?') ? '&' : '?') + '_r=' + gifKey
  } else {
    displaySrc = imgSrc
  }

  const iconElement = displaySrc ? (
    <img
      src={displaySrc}
      alt=""
      draggable={false}
      style={{ maxWidth: size, maxHeight: size, borderRadius: borderRadius, display: 'block' }}
    />
  ) : (
    <span style={{ fontSize: size * 0.7, lineHeight: 1 }}>
      {iconEmoji || '\u{1F680}'}
    </span>
  )

  const scale = clicked ? 'scale(0.92)' : hovered ? `scale(${hoverScale})` : 'scale(1)'
  const glow = hovered && enableGlow
    ? `drop-shadow(0 0 ${glowIntensity}px ${hexToRgba(glowColor, 0.6)})`
    : 'none'

  return (
    <>
      <style>{`* { margin: 0; padding: 0; box-sizing: border-box; }
html, body, #root { width: 100%; height: 100%; overflow: hidden; background: transparent; }`}</style>

      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          onClick={handleClick}
          onPointerEnter={handlePointerEnter}
          onPointerLeave={() => setHovered(false)}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 6,
            cursor: 'pointer',
            userSelect: 'none',
            transition: 'transform 0.15s ease, filter 0.15s ease',
            transform: scale,
            filter: glow,
          }}
        >
          {iconElement}
          {label && (
            <span
              style={{
                fontSize: Math.max(11, size * 0.25),
                color: '#fff',
                textShadow: '0 1px 4px rgba(0,0,0,0.7)',
                fontFamily: 'system-ui, sans-serif',
                textAlign: 'center',
                lineHeight: 1.2,
                maxWidth: size * 2,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {label}
            </span>
          )}
        </div>
      </div>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </>
  )
}
