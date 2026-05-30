import { useRef, useCallback, useEffect } from 'react';
import { Bold, Italic, Heading2, Heading3, List, ListOrdered, Pilcrow } from 'lucide-react';

const TOOLBAR_ITEMS = [
  { key: 'bold', icon: Bold, action: 'bold', label: 'Gras' },
  { key: 'italic', icon: Italic, action: 'italic', label: 'Italique' },
  { key: 'h2', icon: Heading2, action: 'h2', label: 'Titre H2' },
  { key: 'h3', icon: Heading3, action: 'h3', label: 'Sous-titre H3' },
  { key: 'ul', icon: List, action: 'ul', label: 'Liste à puces' },
  { key: 'ol', icon: ListOrdered, action: 'ol', label: 'Liste numérotée' },
  { key: 'p', icon: Pilcrow, action: 'p', label: 'Paragraphe' },
];

function applyFormat(command, value = null) {
  document.execCommand(command, false, value);
}

export function RichTextEditor({ value, onChange, placeholder, minHeight = 200 }) {
  const editorRef = useRef(null);

  useEffect(() => {
    if (editorRef.current && !editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value || '';
    }
  }, []);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const handleToolbar = useCallback((action) => {
    switch (action) {
      case 'h2': applyFormat('formatBlock', '<h2>'); break;
      case 'h3': applyFormat('formatBlock', '<h3>'); break;
      case 'p': applyFormat('formatBlock', '<p>'); break;
      default: applyFormat(action); break;
    }
    handleInput();
  }, [handleInput]);

  const handlePaste = useCallback((e) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  }, []);

  return (
    <div
      className="rounded-xl overflow-hidden border"
      style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
    >
      <div className="flex items-center gap-0.5 p-1.5 border-b" style={{ background: 'var(--overlay-light)', borderColor: 'var(--border-color)' }}>
        {TOOLBAR_ITEMS.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => handleToolbar(item.action)}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            style={{ color: 'var(--text-muted)' }}
            title={item.label}
          >
            <item.icon className="w-4 h-4" />
          </button>
        ))}
      </div>
      <div style={{ position: 'relative' }}>
        {(!value || value === '<br>') && (
          <div className="pointer-events-none text-sm px-4" style={{ color: 'var(--text-muted)', position: 'absolute', top: '12px', left: 0, right: 0, zIndex: 1 }}>
            {placeholder}
          </div>
        )}
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          onPaste={handlePaste}
          className="px-4 py-3 text-sm outline-none overflow-y-auto custom-scrollbar"
          style={{
            color: 'var(--text-primary)',
            minHeight: `${minHeight}px`,
            maxHeight: '400px',
            lineHeight: '1.7',
            position: 'relative',
            zIndex: 2,
          }}
        />
      </div>
    </div>
  );
}
