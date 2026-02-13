import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useSettings, useSettingsActions, useViewport, useSystemActions, type DesktopIconInfo } from '@mywallpaper/sdk-react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ShortcutIcon {
  id: string
  label: string
  execPath: string
  actionType: 'file' | 'url' | 'folder' | 'protocol' | 'auto'
  iconBase64?: string
  iconUrl?: string
  iconEmoji?: string
  col: number
  row: number
}

interface ShortcutsSettings {
  icons: ShortcutIcon[]
  iconSize: number
  gridSpacing: number
  showLabels: boolean
  labelSize: number
  labelColor: string
  enableGlow: boolean
  glowColor: string
}

// ---------------------------------------------------------------------------
// Preset apps for the "Add Shortcut" modal
// ---------------------------------------------------------------------------

const APP_PRESETS: { value: string; label: string; emoji: string; protocol: string; iconUrl?: string }[] = [
  { value: 'spotify', label: 'Spotify', emoji: '\u{1F3B5}', protocol: 'spotify://', iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/84/Spotify_icon.svg' },
  { value: 'discord', label: 'Discord', emoji: '\u{1F4AC}', protocol: 'discord://', iconUrl: 'https://assets-global.website-files.com/6257adef93867e50d84d30e2/6257d23c5fb25be7e0b6e220_Open%20Source%20Projects%20702702b9ac54dd3a999140.svg' },
  { value: 'vscode', label: 'VS Code', emoji: '\u{1F4BB}', protocol: 'vscode://', iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/9a/Visual_Studio_Code_1.35_icon.svg' },
  { value: 'slack', label: 'Slack', emoji: '\u{1F4E2}', protocol: 'slack://', iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d5/Slack_icon_2019.svg' },
  { value: 'telegram', label: 'Telegram', emoji: '\u2708\uFE0F', protocol: 'tg://', iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg' },
  { value: 'steam', label: 'Steam', emoji: '\u{1F3AE}', protocol: 'steam://', iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/83/Steam_icon_logo.svg' },
  { value: 'chrome', label: 'Chrome', emoji: '\u{1F310}', protocol: 'googlechrome://', iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e1/Google_Chrome_icon_%28February_2022%29.svg' },
  { value: 'firefox', label: 'Firefox', emoji: '\u{1F98A}', protocol: 'firefox://' },
  { value: 'figma', label: 'Figma', emoji: '\u{1F3A8}', protocol: 'figma://', iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/33/Figma-logo.svg' },
  { value: 'notion', label: 'Notion', emoji: '\u{1F4DD}', protocol: 'notion://', iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png' },
  { value: 'obs', label: 'OBS Studio', emoji: '\u{1F3A5}', protocol: 'obsproject://' },
  { value: 'terminal', label: 'Terminal', emoji: '\u2B1B', protocol: 'x-terminal-emulator://' },
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function uid(): string {
  return Math.random().toString(36).slice(2, 10)
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

/** Find the next available grid position */
function nextGridPos(icons: ShortcutIcon[], cols: number): { col: number; row: number } {
  const occupied = new Set(icons.map(i => `${i.col},${i.row}`))
  for (let row = 0; row < 100; row++) {
    for (let col = 0; col < cols; col++) {
      if (!occupied.has(`${col},${row}`)) return { col, row }
    }
  }
  return { col: 0, row: icons.length }
}

// ---------------------------------------------------------------------------
// Inline Modal — Add / Edit shortcut
// ---------------------------------------------------------------------------

interface AddModalProps {
  editIcon?: ShortcutIcon | null
  onSave: (icon: Omit<ShortcutIcon, 'id' | 'col' | 'row'> & { id?: string }) => void
  onClose: () => void
}

function AddEditModal({ editIcon, onSave, onClose }: AddModalProps) {
  const [mode, setMode] = useState<'preset' | 'custom'>(editIcon ? 'custom' : 'preset')
  const [label, setLabel] = useState(editIcon?.label ?? '')
  const [execPath, setExecPath] = useState(editIcon?.execPath ?? '')
  const [actionType, setActionType] = useState<ShortcutIcon['actionType']>(editIcon?.actionType ?? 'auto')
  const [iconEmoji, setIconEmoji] = useState(editIcon?.iconEmoji ?? '\u{1F680}')
  const [iconUrl, setIconUrl] = useState(editIcon?.iconUrl ?? '')
  const [selectedPreset, setSelectedPreset] = useState('')

  const handlePresetSelect = (presetValue: string) => {
    const preset = APP_PRESETS.find(p => p.value === presetValue)
    if (!preset) return
    setSelectedPreset(presetValue)
    setLabel(preset.label)
    setExecPath(preset.protocol)
    setActionType('protocol')
    setIconEmoji(preset.emoji)
    setIconUrl(preset.iconUrl ?? '')
  }

  const handleSave = () => {
    if (!label.trim() && !execPath.trim()) return
    onSave({
      id: editIcon?.id,
      label: label.trim() || 'Shortcut',
      execPath: execPath.trim(),
      actionType,
      iconEmoji: iconEmoji || '\u{1F680}',
      iconUrl: iconUrl || undefined,
      iconBase64: editIcon?.iconBase64,
    })
  }

  const overlay: React.CSSProperties = {
    position: 'fixed', inset: 0, zIndex: 9999,
    background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  }

  const card: React.CSSProperties = {
    background: 'rgba(30,30,40,0.95)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 16, padding: 24, width: 360, maxHeight: '80vh',
    overflowY: 'auto', color: '#fff', fontFamily: 'system-ui, sans-serif',
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '8px 12px', borderRadius: 8,
    border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.06)',
    color: '#fff', fontSize: 13, outline: 'none', marginTop: 4,
  }

  const btnPrimary: React.CSSProperties = {
    padding: '8px 20px', borderRadius: 8, border: 'none',
    background: '#7c3aed', color: '#fff', cursor: 'pointer',
    fontSize: 13, fontWeight: 600,
  }

  const btnSecondary: React.CSSProperties = {
    padding: '8px 20px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)',
    background: 'transparent', color: '#aaa', cursor: 'pointer', fontSize: 13,
  }

  return (
    <div style={overlay} onClick={onClose}>
      <div style={card} onClick={e => e.stopPropagation()}>
        <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 600 }}>
          {editIcon ? 'Edit Shortcut' : 'Add Shortcut'}
        </h3>

        {/* Mode tabs */}
        {!editIcon && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            {(['preset', 'custom'] as const).map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                style={{
                  flex: 1, padding: '6px 0', borderRadius: 8, border: 'none',
                  background: mode === m ? 'rgba(124,58,237,0.3)' : 'rgba(255,255,255,0.06)',
                  color: mode === m ? '#c4b5fd' : '#888', cursor: 'pointer',
                  fontSize: 12, fontWeight: 500,
                }}
              >
                {m === 'preset' ? 'App Preset' : 'Custom'}
              </button>
            ))}
          </div>
        )}

        {/* Preset grid */}
        {mode === 'preset' && !editIcon && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 16 }}>
            {APP_PRESETS.map(p => (
              <button
                key={p.value}
                onClick={() => handlePresetSelect(p.value)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                  padding: 8, borderRadius: 10, border: 'none', cursor: 'pointer',
                  background: selectedPreset === p.value ? 'rgba(124,58,237,0.3)' : 'rgba(255,255,255,0.05)',
                  color: '#fff', fontSize: 11,
                }}
              >
                <span style={{ fontSize: 24 }}>{p.emoji}</span>
                <span style={{ opacity: 0.7 }}>{p.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Custom fields */}
        {(mode === 'custom' || editIcon) && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
            <label style={{ fontSize: 12, color: '#aaa' }}>
              Label
              <input style={inputStyle} value={label} onChange={e => setLabel(e.target.value)} placeholder="My App" />
            </label>
            <label style={{ fontSize: 12, color: '#aaa' }}>
              Path / URL / Protocol
              <input style={inputStyle} value={execPath} onChange={e => setExecPath(e.target.value)} placeholder="https://... or /path/to/file or spotify://" />
            </label>
            <label style={{ fontSize: 12, color: '#aaa' }}>
              Type
              <select
                style={{ ...inputStyle, appearance: 'auto' }}
                value={actionType}
                onChange={e => setActionType(e.target.value as ShortcutIcon['actionType'])}
              >
                <option value="auto">Auto-detect</option>
                <option value="url">URL</option>
                <option value="file">File</option>
                <option value="folder">Folder</option>
                <option value="protocol">Protocol</option>
              </select>
            </label>
            <label style={{ fontSize: 12, color: '#aaa' }}>
              Icon Emoji
              <input style={inputStyle} value={iconEmoji} onChange={e => setIconEmoji(e.target.value)} placeholder="\u{1F680}" />
            </label>
            <label style={{ fontSize: 12, color: '#aaa' }}>
              Icon Image URL (optional)
              <input style={inputStyle} value={iconUrl} onChange={e => setIconUrl(e.target.value)} placeholder="https://..." />
            </label>
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button style={btnSecondary} onClick={onClose}>Cancel</button>
          <button style={btnPrimary} onClick={handleSave}>
            {editIcon ? 'Save' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Icon component
// ---------------------------------------------------------------------------

interface IconTileProps {
  icon: ShortcutIcon
  iconSize: number
  showLabel: boolean
  labelSize: number
  labelColor: string
  enableGlow: boolean
  glowColor: string
  gridSpacing: number
  onLaunch: (icon: ShortcutIcon) => void
  onEdit: (icon: ShortcutIcon) => void
  onDelete: (id: string) => void
  onDragStart: (id: string) => void
  onDragOver: (col: number, row: number) => void
  onDragEnd: () => void
}

function IconTile({
  icon, iconSize, showLabel, labelSize, labelColor,
  enableGlow, glowColor, gridSpacing,
  onLaunch, onEdit, onDelete, onDragStart, onDragOver, onDragEnd,
}: IconTileProps) {
  const [hovered, setHovered] = useState(false)
  const [clicked, setClicked] = useState(false)
  const longPressRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [showMenu, setShowMenu] = useState(false)
  const didLongPress = useRef(false)

  const handlePointerDown = () => {
    didLongPress.current = false
    longPressRef.current = setTimeout(() => {
      didLongPress.current = true
      setShowMenu(true)
    }, 500)
  }

  const handlePointerUp = () => {
    if (longPressRef.current) {
      clearTimeout(longPressRef.current)
      longPressRef.current = null
    }
    if (!didLongPress.current && !showMenu) {
      setClicked(true)
      setTimeout(() => setClicked(false), 200)
      onLaunch(icon)
    }
  }

  const handlePointerLeave = () => {
    setHovered(false)
    if (longPressRef.current) {
      clearTimeout(longPressRef.current)
      longPressRef.current = null
    }
  }

  // Icon rendering
  const iconElement = useMemo(() => {
    const imgStyle: React.CSSProperties = { width: iconSize, height: iconSize, objectFit: 'contain', borderRadius: 8 }

    if (icon.iconBase64) {
      return <img style={imgStyle} src={`data:image/png;base64,${icon.iconBase64}`} alt="" draggable={false} />
    }
    if (icon.iconUrl) {
      return <img style={imgStyle} src={icon.iconUrl} alt="" draggable={false} />
    }
    return (
      <span style={{ fontSize: iconSize * 0.7, lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: iconSize, height: iconSize }}>
        {icon.iconEmoji || '\u{1F680}'}
      </span>
    )
  }, [icon.iconBase64, icon.iconUrl, icon.iconEmoji, iconSize])

  const tileStyle: React.CSSProperties = {
    position: 'absolute',
    left: icon.col * gridSpacing,
    top: icon.row * gridSpacing,
    width: gridSpacing,
    height: gridSpacing,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    cursor: 'pointer',
    userSelect: 'none',
    transition: 'transform 0.15s ease, filter 0.15s ease',
    transform: clicked ? 'scale(0.92)' : hovered ? 'scale(1.08)' : 'scale(1)',
    filter: hovered && enableGlow ? `drop-shadow(0 0 8px ${hexToRgba(glowColor, 0.6)})` : 'none',
    zIndex: showMenu ? 100 : 1,
  }

  const menuStyle: React.CSSProperties = {
    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
    background: 'rgba(30,30,40,0.95)', border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: 10, padding: '6px 0', zIndex: 200, minWidth: 120,
    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
  }

  const menuBtn: React.CSSProperties = {
    display: 'block', width: '100%', padding: '6px 16px', border: 'none',
    background: 'transparent', color: '#fff', fontSize: 12, cursor: 'pointer',
    textAlign: 'left',
  }

  return (
    <div
      style={tileStyle}
      draggable
      onDragStart={(e) => { e.dataTransfer.setData('text/plain', icon.id); onDragStart(icon.id) }}
      onDragEnd={onDragEnd}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={handlePointerLeave}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {iconElement}
      </div>
      {showLabel && (
        <div style={{
          fontSize: labelSize, color: labelColor, textAlign: 'center',
          textShadow: '0 1px 4px rgba(0,0,0,0.7)', lineHeight: 1.2,
          maxWidth: gridSpacing - 8, overflow: 'hidden',
          textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          fontFamily: 'system-ui, sans-serif',
        }}>
          {icon.label}
        </div>
      )}

      {/* Context menu */}
      {showMenu && (
        <div style={menuStyle} onClick={e => e.stopPropagation()}>
          <button
            style={menuBtn}
            onPointerDown={e => e.stopPropagation()}
            onClick={() => { setShowMenu(false); onEdit(icon) }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            {'\u270F\uFE0F'} Edit
          </button>
          <button
            style={{ ...menuBtn, color: '#f87171' }}
            onPointerDown={e => e.stopPropagation()}
            onClick={() => { setShowMenu(false); onDelete(icon.id) }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            {'\u{1F5D1}\uFE0F'} Delete
          </button>
          <button
            style={menuBtn}
            onPointerDown={e => e.stopPropagation()}
            onClick={() => setShowMenu(false)}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function Shortcuts() {
  const settings = useSettings<ShortcutsSettings>()
  const { setValue, onButtonClick } = useSettingsActions()
  const viewport = useViewport()
  const { openPath, getDesktopIcons } = useSystemActions()

  const icons: ShortcutIcon[] = settings.icons ?? []
  const iconSize = settings.iconSize ?? 48
  const gridSpacing = settings.gridSpacing ?? 90
  const showLabels = settings.showLabels ?? true
  const labelSize = settings.labelSize ?? 11
  const labelColor = settings.labelColor ?? '#ffffff'
  const enableGlow = settings.enableGlow ?? true
  const glowColor = settings.glowColor ?? '#8b5cf6'

  const [showAddModal, setShowAddModal] = useState(false)
  const [editingIcon, setEditingIcon] = useState<ShortcutIcon | null>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null)

  // Calculate grid columns based on viewport
  const gridCols = useMemo(() => {
    if (!viewport.width || gridSpacing <= 0) return 8
    return Math.max(1, Math.floor(viewport.width / gridSpacing))
  }, [viewport.width, gridSpacing])

  // ---- Persist icons helper ------------------------------------------------
  const persistIcons = useCallback((updated: ShortcutIcon[]) => {
    setValue('icons', updated)
  }, [setValue])

  // ---- Button click handlers from settings panel ---------------------------
  useEffect(() => {
    onButtonClick('addShortcut', () => {
      setShowAddModal(true)
    })

    onButtonClick('importDesktopIcons', () => {
      importDesktopIcons()
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ---- Import desktop icons via system bridge ------------------------------
  const importDesktopIcons = useCallback(async () => {
    try {
      const result = await getDesktopIcons()
      if (Array.isArray(result) && result.length > 0) {
        handleDesktopIconsImport(result)
      } else {
        console.warn('[Shortcuts] No desktop icons found')
      }
    } catch (err) {
      console.error('[Shortcuts] Failed to import desktop icons:', err)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [icons, gridCols, getDesktopIcons])

  const handleDesktopIconsImport = useCallback((desktopIcons: Array<{ name: string; icon_base64: string; exec_path: string; is_directory: boolean }>) => {
    const existingPaths = new Set(icons.map(i => i.execPath))
    const newIcons: ShortcutIcon[] = []
    let pos = { col: 0, row: 0 }

    // Start after existing icons
    const allIcons = [...icons]

    for (const di of desktopIcons) {
      if (existingPaths.has(di.exec_path)) continue

      pos = nextGridPos([...allIcons, ...newIcons], gridCols)
      newIcons.push({
        id: uid(),
        label: di.name,
        execPath: di.exec_path,
        actionType: di.is_directory ? 'folder' : 'file',
        iconBase64: di.icon_base64 || undefined,
        iconEmoji: di.is_directory ? '\u{1F4C1}' : '\u{1F4C4}',
        col: pos.col,
        row: pos.row,
      })
    }

    if (newIcons.length > 0) {
      persistIcons([...icons, ...newIcons])
    }
  }, [icons, gridCols, persistIcons])

  // ---- CRUD operations -----------------------------------------------------
  const handleAddSave = useCallback((data: Omit<ShortcutIcon, 'id' | 'col' | 'row'> & { id?: string }) => {
    if (data.id) {
      // Edit existing
      const updated = icons.map(i => i.id === data.id ? { ...i, ...data } as ShortcutIcon : i)
      persistIcons(updated)
    } else {
      // Add new
      const pos = nextGridPos(icons, gridCols)
      const newIcon: ShortcutIcon = {
        ...data,
        id: uid(),
        col: pos.col,
        row: pos.row,
      }
      persistIcons([...icons, newIcon])
    }
    setShowAddModal(false)
    setEditingIcon(null)
  }, [icons, gridCols, persistIcons])

  const handleDelete = useCallback((id: string) => {
    persistIcons(icons.filter(i => i.id !== id))
  }, [icons, persistIcons])

  const handleLaunch = useCallback(async (icon: ShortcutIcon) => {
    if (!icon.execPath) return
    try {
      await openPath(icon.execPath, icon.actionType === 'auto' ? undefined : icon.actionType)
    } catch (err) {
      console.error('[Shortcuts] Launch failed:', err)
    }
  }, [openPath])

  const handleEdit = useCallback((icon: ShortcutIcon) => {
    setEditingIcon(icon)
    setShowAddModal(true)
  }, [])

  // ---- Drag & drop to reposition ------------------------------------------
  const handleDragStart = useCallback((id: string) => {
    setDraggingId(id)
  }, [])

  const handleDragEnd = useCallback(() => {
    setDraggingId(null)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const id = e.dataTransfer.getData('text/plain')
    if (!id) return

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const col = Math.max(0, Math.floor(x / gridSpacing))
    const row = Math.max(0, Math.floor(y / gridSpacing))

    // Check if target cell is occupied by another icon
    const occupant = icons.find(i => i.col === col && i.row === row && i.id !== id)
    const draggedIcon = icons.find(i => i.id === id)
    if (!draggedIcon) return

    let updated: ShortcutIcon[]
    if (occupant) {
      // Swap positions
      updated = icons.map(i => {
        if (i.id === id) return { ...i, col, row }
        if (i.id === occupant.id) return { ...i, col: draggedIcon.col, row: draggedIcon.row }
        return i
      })
    } else {
      updated = icons.map(i => i.id === id ? { ...i, col, row } : i)
    }

    persistIcons(updated)
    setDraggingId(null)
  }, [icons, gridSpacing, persistIcons])

  // ---- "+" floating button -------------------------------------------------
  const handleAddClick = useCallback(() => {
    setEditingIcon(null)
    setShowAddModal(true)
  }, [])

  // ---- CSS -----------------------------------------------------------------
  const dynamicCSS = `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body, #root { width: 100%; height: 100%; overflow: hidden; background: transparent; }
  `

  void viewport

  // ---- Render grid dimensions ----------------------------------------------
  const maxRow = icons.reduce((max, i) => Math.max(max, i.row), 0)
  const gridHeight = (maxRow + 2) * gridSpacing

  return (
    <>
      <style>{dynamicCSS}</style>

      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          overflow: 'auto',
          padding: 8,
        }}
        onDragOver={e => e.preventDefault()}
        onDrop={handleDrop}
      >
        {/* Icon grid */}
        <div style={{ position: 'relative', minHeight: gridHeight }}>
          {icons.map(icon => (
            <IconTile
              key={icon.id}
              icon={icon}
              iconSize={iconSize}
              showLabel={showLabels}
              labelSize={labelSize}
              labelColor={labelColor}
              enableGlow={enableGlow}
              glowColor={glowColor}
              gridSpacing={gridSpacing}
              onLaunch={handleLaunch}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onDragStart={handleDragStart}
              onDragOver={() => {}}
              onDragEnd={handleDragEnd}
            />
          ))}
        </div>

        {/* Floating "+" button */}
        <button
          onClick={handleAddClick}
          style={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            width: 48,
            height: 48,
            borderRadius: '50%',
            border: '1px solid rgba(255,255,255,0.15)',
            background: 'rgba(124,58,237,0.5)',
            backdropFilter: 'blur(12px)',
            color: '#fff',
            fontSize: 24,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.15s ease, background 0.15s ease',
            zIndex: 50,
            boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.background = 'rgba(124,58,237,0.7)' }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = 'rgba(124,58,237,0.5)' }}
        >
          +
        </button>
      </div>

      {/* Add/Edit modal */}
      {showAddModal && (
        <AddEditModal
          editIcon={editingIcon}
          onSave={handleAddSave}
          onClose={() => { setShowAddModal(false); setEditingIcon(null) }}
        />
      )}
    </>
  )
}
