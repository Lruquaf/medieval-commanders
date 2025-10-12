import React from 'react';

function ThemedSelect({ id, value, onChange, options, label, buttonClassName = '', listClassName = '' }) {
  const [open, setOpen] = React.useState(false);
  const buttonRef = React.useRef(null);
  const listRef = React.useRef(null);

  const selectedIndex = Math.max(0, options.findIndex((o) => o.value === value));
  const [activeIndex, setActiveIndex] = React.useState(selectedIndex);

  React.useEffect(() => {
    setActiveIndex(selectedIndex);
  }, [selectedIndex]);

  React.useEffect(() => {
    const onDocClick = (e) => {
      if (!open) return;
      if (!buttonRef.current || !listRef.current) return;
      if (buttonRef.current.contains(e.target)) return;
      if (listRef.current.contains(e.target)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  const commit = (idx) => {
    const opt = options[idx];
    if (!opt) return;
    onChange && onChange(opt.value);
    setOpen(false);
    buttonRef.current && buttonRef.current.focus();
  };

  const onButtonKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setActiveIndex((i) => Math.min(options.length - 1, (i < 0 ? 0 : i) + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setOpen(true);
      setActiveIndex((i) => Math.max(0, (i < 0 ? 0 : i) - 1));
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setOpen((o) => !o);
    }
  };

  const onListKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      setOpen(false);
      buttonRef.current && buttonRef.current.focus();
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(options.length - 1, i + 1));
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(0, i - 1));
      return;
    }
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      commit(activeIndex);
      return;
    }
  };

  return (
    <div className={`themed-select ${open ? 'open' : ''}`}>
      <button
        id={id}
        type="button"
        className={`themed-select-button ${buttonClassName}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={onButtonKeyDown}
        ref={buttonRef}
      >
        <span className="themed-select-label">{options[selectedIndex]?.label || ''}</span>
        <span className="themed-select-caret" aria-hidden>▾</span>
      </button>
      {open && (
        <ul
          role="listbox"
          className={`themed-select-list ${listClassName}`}
          aria-labelledby={id}
          tabIndex={-1}
          onKeyDown={onListKeyDown}
          ref={listRef}
        >
          {options.map((opt, idx) => (
            <li
              key={opt.value}
              role="option"
              aria-selected={value === opt.value}
              className={`themed-select-option ${idx === activeIndex ? 'active' : ''} ${value === opt.value ? 'selected' : ''}`}
              onMouseEnter={() => setActiveIndex(idx)}
              onClick={() => commit(idx)}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ThemedSelect;


