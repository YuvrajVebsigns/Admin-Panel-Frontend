/* eslint-disable @typescript-eslint/no-explicit-any */

interface ColorToolConfig {
  colorCollections?: string[];
  defaultColor?: string;
  type?: 'text' | 'marker';
  icon?: string;
  customPicker?: boolean;
}

interface ColorToolConstructorParams {
  api: any;
  config: ColorToolConfig;
}

const TEXT_ICON = `<svg fill="currentColor" viewBox="-6 0 512 512" xmlns="http://www.w3.org/2000/svg" width="12" height="12"><path d="M365 432L328 352 172 352 135 432 64 432 227 80 272 80 436 432 365 432ZM201 288L299 288 250 183 201 288Z"></path></svg>`;

const MARKER_ICON = `<svg width="12" height="12" viewBox="0 0 16 15" xmlns="http://www.w3.org/2000/svg"><path d="M10.358 5.874L8.4 3.915c-.244-.244-.64-.244-.884 0l-5.65 5.65c-.244.244-.244.64 0 .884l1.958 1.958c.244.244.64.244.884 0l5.65-5.65c.244-.244.244-.64 0-.884zM14 14.5a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1 0-1h11a.5.5 0 0 1 .5.5z" fill="currentColor" fill-rule="nonzero"/></svg>`;

const DEFAULT_TEXT_COLORS = [
  '#1e1b4b',
  '#ef4444',
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#6366f1',
  '#8b5cf6',
  '#ec4899',
  '#000000',
  '#ffffff',
];

const PICKER_OVERLAY_ID = 'ejs-color-picker-overlay';
const CACHE_KEY = 'editorjs-color-tool-cache';

function getCachedColor(type: string): string | null {
  try {
    const cached = sessionStorage.getItem(`${CACHE_KEY}-${type}`);
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
}

function setCachedColor(color: string, type: string): void {
  try {
    sessionStorage.setItem(`${CACHE_KEY}-${type}`, JSON.stringify(color));
  } catch {
    /* ignore */
  }
}

/** Remove any existing picker overlay */
function removeExistingPicker(): void {
  document.getElementById(PICKER_OVERLAY_ID)?.remove();
}

export class ColorInlineTool {
  private api: any;
  private config: ColorToolConfig;
  private pluginType: 'text' | 'marker';
  private parentTag: string;
  private color: string;
  private button: HTMLButtonElement | null = null;
  private colorIndicator: HTMLElement | null = null;
  private savedRange: Range | null = null;
  private iconClasses: { base: string; active: string };

  static get isInline(): boolean {
    return true;
  }

  static get sanitize(): Record<string, boolean> {
    return { font: true, span: true, mark: true };
  }

  static get title(): string {
    return 'Color';
  }

  constructor({ api, config }: ColorToolConstructorParams) {
    this.api = api;
    this.config = config || {};
    this.pluginType = this.config.type || 'text';
    this.parentTag = this.pluginType === 'marker' ? 'MARK' : 'FONT';
    this.color =
      getCachedColor(this.pluginType) ||
      this.config.defaultColor ||
      (this.pluginType === 'marker' ? '#FFBF00' : '#1e1b4b');
    this.iconClasses = {
      base: this.api.styles.inlineToolButton,
      active: this.api.styles.inlineToolButtonActive,
    };
  }

  render(): HTMLElement {
    this.button = document.createElement('button');
    this.button.type = 'button';
    this.button.classList.add(this.iconClasses.base);

    Object.assign(this.button.style, {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '1px',
      padding: '6px 4px',
      position: 'relative',
      cursor: 'pointer',
      minWidth: '32px',
      boxSizing: 'border-box' as const,
    });

    // Icon
    const iconWrap = document.createElement('span');
    Object.assign(iconWrap.style, {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      lineHeight: '0',
      padding: '2px',
    });
    iconWrap.innerHTML =
      this.config.icon || (this.pluginType === 'marker' ? MARKER_ICON : TEXT_ICON);

    // Color indicator bar
    this.colorIndicator = document.createElement('span');
    Object.assign(this.colorIndicator.style, {
      display: 'block',
      width: '16px',
      height: '3px',
      borderRadius: '2px',
      backgroundColor: this.color,
      position: 'absolute',
      bottom: '3px',
      left: '50%',
      transform: 'translateX(-50%)',
      pointerEvents: 'none',
    });

    // Small dropdown arrow
    const dropdownArrow = document.createElement('span');
    Object.assign(dropdownArrow.style, {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      lineHeight: '0',
      opacity: '0.5',
    });
    dropdownArrow.innerHTML = `<svg width="6" height="6" viewBox="0 0 12 12" fill="currentColor"><path d="M2 4l4 4 4-4z"/></svg>`;

    this.button.appendChild(iconWrap);
    this.button.appendChild(this.colorIndicator);
    this.button.appendChild(dropdownArrow);

    return this.button;
  }

  /**
   * EditorJS calls surround() when the user clicks the inline tool button.
   * We save the current selection and defer opening the color picker
   * so EditorJS finishes its internal event handling first.
   */
  surround(range: Range): void {
    if (!range) return;

    // Save selection before EditorJS can lose it
    this.savedRange = range.cloneRange();

    // Defer to next tick so EditorJS popover events complete first
    setTimeout(() => {
      this.showColorPicker();
    }, 50);
  }

  /** Build and show the color picker as a fixed overlay on document.body */
  private showColorPicker(): void {
    // Close any existing picker
    removeExistingPicker();

    const colors = this.config.colorCollections || DEFAULT_TEXT_COLORS;

    // Full-screen transparent overlay to catch outside clicks
    const overlay = document.createElement('div');
    overlay.id = PICKER_OVERLAY_ID;
    Object.assign(overlay.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100vw',
      height: '100vh',
      zIndex: '2147483646', // max safe z-index minus 1
      background: 'transparent',
    });

    const closePicker = () => {
      overlay.remove();
    };

    overlay.addEventListener('mousedown', (e) => {
      e.preventDefault();
      closePicker();
    });

    // Color picker panel
    const picker = document.createElement('div');
    Object.assign(picker.style, {
      position: 'fixed',
      zIndex: '2147483647', // max safe z-index
      background: '#ffffff',
      borderRadius: '10px',
      boxShadow: '0 8px 30px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.08)',
      padding: '10px',
      display: 'grid',
      gridTemplateColumns: 'repeat(5, 1fr)',
      gap: '6px',
      width: '196px',
      boxSizing: 'border-box' as const,
    });

    // Position below the button
    if (this.button) {
      const rect = this.button.getBoundingClientRect();
      const pickerWidth = 196;
      let leftPos = rect.left + rect.width / 2 - pickerWidth / 2;

      // Keep within viewport
      if (leftPos < 8) leftPos = 8;
      if (leftPos + pickerWidth > window.innerWidth - 8) {
        leftPos = window.innerWidth - pickerWidth - 8;
      }

      picker.style.top = `${rect.bottom + 8}px`;
      picker.style.left = `${leftPos}px`;
    }

    // Prevent picker clicks from bubbling to overlay
    picker.addEventListener('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();
    });

    // Color swatches — using <div> to avoid Tailwind button resets
    colors.forEach((c) => {
      const swatch = document.createElement('div');
      swatch.setAttribute('role', 'button');
      swatch.title = c;
      Object.assign(swatch.style, {
        width: '30px',
        height: '30px',
        borderRadius: '6px',
        border: '2px solid transparent',
        cursor: 'pointer',
        transition: 'transform 0.12s, box-shadow 0.12s',
        backgroundColor: c,
        boxSizing: 'border-box' as const,
      });

      if (c.toLowerCase() === '#ffffff' || c.toLowerCase() === '#fff') {
        swatch.style.border = '2px solid #d1d5db';
      }
      if (c.toLowerCase() === this.color.toLowerCase()) {
        swatch.style.border = '2px solid #3b82f6';
        swatch.style.boxShadow = '0 0 0 2px rgba(59,130,246,0.35)';
      }

      swatch.addEventListener('mouseenter', () => {
        swatch.style.transform = 'scale(1.12)';
      });
      swatch.addEventListener('mouseleave', () => {
        swatch.style.transform = 'scale(1)';
      });
      swatch.addEventListener('click', (e) => {
        e.stopPropagation();
        this.color = c;
        setCachedColor(c, this.pluginType);
        this.updateColorIndicator();
        closePicker();
        this.restoreAndApply();
      });

      picker.appendChild(swatch);
    });

    // Custom color button
    if (this.config.customPicker !== false) {
      const customBtn = document.createElement('div');
      customBtn.setAttribute('role', 'button');
      customBtn.title = 'Custom color';
      Object.assign(customBtn.style, {
        width: '30px',
        height: '30px',
        borderRadius: '6px',
        border: '2px solid #d1d5db',
        cursor: 'pointer',
        background: 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)',
        transition: 'transform 0.12s',
        boxSizing: 'border-box' as const,
      });

      customBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const input = document.createElement('input');
        input.type = 'color';
        input.value = this.color;
        Object.assign(input.style, {
          position: 'fixed',
          opacity: '0',
          pointerEvents: 'none',
          top: '-200px',
          left: '-200px',
        });
        input.addEventListener('input', () => {
          this.color = input.value;
          setCachedColor(input.value, this.pluginType);
          this.updateColorIndicator();
        });
        input.addEventListener('change', () => {
          closePicker();
          input.remove();
          this.restoreAndApply();
        });
        document.body.appendChild(input);
        input.click();
      });

      picker.appendChild(customBtn);
    }

    overlay.appendChild(picker);
    document.body.appendChild(overlay);
  }

  /**
   * Restore the saved text selection and apply the current color.
   */
  private restoreAndApply(): void {
    if (!this.savedRange) return;

    const selection = window.getSelection();
    if (!selection) return;

    // Restore selection
    selection.removeAllRanges();
    selection.addRange(this.savedRange);

    // Apply color after a small delay to let the browser process
    requestAnimationFrame(() => {
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return;
      const range = sel.getRangeAt(0);
      if (range.collapsed) return;

      const existingWrapper = this.api.selection.findParentTag(this.parentTag);
      if (existingWrapper) {
        if (this.pluginType === 'marker') {
          existingWrapper.style.backgroundColor = this.color;
        } else {
          existingWrapper.style.color = this.color;
        }
      } else {
        this.wrap(range);
      }
    });
  }

  private updateColorIndicator(): void {
    if (this.colorIndicator) {
      this.colorIndicator.style.backgroundColor = this.color;
    }
  }

  private wrap(range: Range): void {
    const contents = range.extractContents();
    const wrapper = document.createElement(this.parentTag);
    wrapper.appendChild(contents);
    range.insertNode(wrapper);

    if (this.pluginType === 'marker') {
      wrapper.style.backgroundColor = this.color;
      const fontParent = this.api.selection.findParentTag('FONT');
      if (fontParent) {
        wrapper.style.color = fontParent.style.color;
      }
    } else {
      wrapper.style.color = this.color;
    }

    this.api.selection.expandToTag(wrapper);
  }

  checkState(): boolean {
    const parentTag = this.api.selection.findParentTag(this.parentTag);
    const isActive = !!parentTag;
    this.button?.classList.toggle(this.iconClasses.active, isActive);
    return isActive;
  }

  renderActions(): HTMLElement {
    // Return an empty hidden container — we don't use the EditorJS
    // actions area because it clips with overflow:hidden.
    const el = document.createElement('div');
    el.hidden = true;
    return el;
  }

  clear(): void {
    removeExistingPicker();
  }
}

/** Factory to create text color tool class */
export function createTextColorTool(): typeof ColorInlineTool {
  return ColorInlineTool;
}

/** Marker/highlight tool */
export class MarkerInlineTool extends ColorInlineTool {
  static get title(): string {
    return 'Highlight';
  }
}
