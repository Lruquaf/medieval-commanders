import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { getImageUrl } from '../utils/images';
import { formatYearRange } from '../utils/years';

const Card = React.memo(({ card, isAdmin = false, onEdit, onDelete }) => {
  const [showModal, setShowModal] = useState(false);

  const getTierClass = (tier) => {
    return `tier-${tier.toLowerCase()}`;
  };

  const handleCardClick = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  React.useEffect(() => {
    if (!showModal) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setShowModal(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [showModal]);

  // Focus management and scroll lock for modal
  const firstFocusableRef = React.useRef(null);
  React.useEffect(() => {
    if (showModal) {
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      // focus the close button
      firstFocusableRef.current && firstFocusableRef.current.focus();
      const onKeyDown = (e) => {
        if (e.key !== 'Tab') return;
        const dialog = document.querySelector('.modal-content');
        if (!dialog) return;
        const focusable = dialog.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last && last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first && first.focus();
        }
      };
      document.addEventListener('keydown', onKeyDown);
      return () => {
        document.body.style.overflow = previousOverflow;
        document.removeEventListener('keydown', onKeyDown);
      };
    }
  }, [showModal]);

  // use shared getImageUrl util

  return (
    <>
      <div className="card" onClick={handleCardClick}>
        <div className="card-image-container">
          <img 
            src={getImageUrl(card.image)} 
            alt={card.name}
            loading="lazy"
            className="card-image"
            onError={(e) => {
              e.target.src = '/placeholder-commander.svg';
            }}
          />
        </div>
        <div className="card-content">
          <h3 className="card-name">{card.name}</h3>
          <div className={`card-tier ${getTierClass(card.tier)}`}>
            {card.tier}
          </div>
        </div>
      </div>

      {showModal && createPortal(
        <div className="modal-overlay" role="presentation" onClick={handleCloseModal}>
          <div className="modal-content" role="dialog" aria-modal="true" aria-label={card.name} onClick={(e) => e.stopPropagation()}>
            <button ref={firstFocusableRef} className="modal-close" aria-label="Close modal" onClick={handleCloseModal}>×</button>
            
            {/* Admin action buttons - top left corner */}
            {isAdmin && (
              <div className="modal-admin-actions">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowModal(false);
                    onEdit && onEdit(card);
                  }}
                  className="btn btn-secondary modal-admin-btn"
                  title="Edit Card"
                >
                  Edit
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowModal(false);
                    onDelete && onDelete(card);
                  }}
                  className="btn btn-danger modal-admin-btn"
                  title="Delete Card"
                >
                  Delete
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const canvas = document.createElement('canvas');
                    const width = 1200;
                    const height = Math.round(width * 3 / 2);
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');

                    // Background
                    const gradient = ctx.createLinearGradient(0, 0, 0, height);
                    gradient.addColorStop(0, '#3e2723');
                    gradient.addColorStop(1, '#1b0f0a');
                    ctx.fillStyle = gradient;
                    ctx.fillRect(0, 0, width, height);
                    // Vignette overlay for depth
                    const rad = ctx.createRadialGradient(width/2, height/2, Math.min(width, height)/6, width/2, height/2, Math.max(width, height)/1.1);
                    rad.addColorStop(0, 'rgba(0,0,0,0)');
                    rad.addColorStop(1, 'rgba(0,0,0,0.25)');
                    ctx.fillStyle = rad;
                    ctx.fillRect(0, 0, width, height);

                    // Parchment texture overlay (procedural, subtle) with square tile that evenly fits canvas
                    const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
                    const canvasGcd = gcd(width, height);
                    const getDivisors = (n) => {
                      const small = [];
                      const large = [];
                      for (let i = 1; i * i <= n; i++) {
                        if (n % i === 0) {
                          small.push(i);
                          if (i * i !== n) large.push(n / i);
                        }
                      }
                      return small.concat(large.reverse());
                    };
                    const divisors = getDivisors(canvasGcd);
                    const targetTilesX = 6; // aim ~6x9 grid for 1200x1800
                    const targetTileSize = width / targetTilesX;
                    let T = divisors[0];
                    let minDiff = Math.abs(T - targetTileSize);
                    for (let i = 1; i < divisors.length; i++) {
                      const d = divisors[i];
                      const diff = Math.abs(d - targetTileSize);
                      if (diff < minDiff) { T = d; minDiff = diff; }
                    }
                    const parch = document.createElement('canvas');
                    parch.width = T; parch.height = T; // square tile that divides both width and height
                    const pctx = parch.getContext('2d');
                    // base parchment tone
                    pctx.fillStyle = '#efe2c3';
                    pctx.fillRect(0, 0, T, T);
                    // mottled darker blotches
                    for (let i = 0; i < Math.max(6, Math.floor(T / 40)); i++) {
                      const cx = Math.random() * T;
                      const cy = Math.random() * T;
                      const r = (T * 0.28) + Math.random() * (T * 0.42);
                      const g = pctx.createRadialGradient(cx, cy, 0, cx, cy, r);
                      g.addColorStop(0, 'rgba(120, 80, 40, 0.14)');
                      g.addColorStop(1, 'rgba(120, 80, 40, 0)');
                      pctx.fillStyle = g;
                      pctx.beginPath();
                      pctx.arc(cx, cy, r, 0, Math.PI * 2);
                      pctx.fill();
                    }
                    // subtle light patches
                    for (let i = 0; i < Math.max(4, Math.floor(T / 60)); i++) {
                      const cx = Math.random() * T;
                      const cy = Math.random() * T;
                      const r = (T * 0.20) + Math.random() * (T * 0.35);
                      const g = pctx.createRadialGradient(cx, cy, 0, cx, cy, r);
                      g.addColorStop(0, 'rgba(255, 245, 220, 0.12)');
                      g.addColorStop(1, 'rgba(255, 245, 220, 0)');
                      pctx.fillStyle = g;
                      pctx.beginPath();
                      pctx.arc(cx, cy, r, 0, Math.PI * 2);
                      pctx.fill();
                    }
                    // fine fibers
                    pctx.strokeStyle = 'rgba(90, 60, 30, 0.05)';
                    pctx.lineWidth = Math.max(0.5, T * 0.003);
                    for (let i = 0; i < 6; i++) {
                      const y = Math.random() * T;
                      pctx.beginPath();
                      pctx.moveTo(0, y);
                      const cp1x = (T * 0.25) + Math.random() * (T * 0.25);
                      const cp1y = y + (Math.random() * (T * 0.05) - (T * 0.025));
                      const cp2x = (T * 0.5) + Math.random() * (T * 0.25);
                      const cp2y = y + (Math.random() * (T * 0.05) - (T * 0.025));
                      pctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, T, y + (Math.random() * (T * 0.05) - (T * 0.025)));
                      pctx.stroke();
                    }
                    // grain noise speckles
                    pctx.fillStyle = 'rgba(90, 60, 30, 0.05)';
                    for (let i = 0; i < Math.floor(T * T * 0.06); i++) {
                      const x = Math.random() * T;
                      const y = Math.random() * T;
                      const s = Math.random() * (T * 0.006) + (T * 0.002);
                      pctx.fillRect(x, y, s, s);
                    }
                    const parchPattern = ctx.createPattern(parch, 'repeat');
                    if (parchPattern) {
                      ctx.save();
                      ctx.globalAlpha = 0.35;
                      ctx.globalCompositeOperation = 'overlay';
                      ctx.fillStyle = parchPattern;
                      ctx.fillRect(0, 0, width, height);
                      ctx.restore();
                    }

                    // Helpers
                    const toTitleCase = (s) => (String(s || '')).toLowerCase().split(' ').map(w => w ? (w[0].toUpperCase() + w.slice(1)) : '').join(' ');
                    const removeDiacritics = (s) => (String(s || '')).normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                    const drawRoundedRectPath = (x, y, w, h, rr) => {
                      ctx.beginPath();
                      ctx.moveTo(x + rr, y);
                      ctx.arcTo(x + w, y, x + w, y + h, rr);
                      ctx.arcTo(x + w, y + h, x, y + h, rr);
                      ctx.arcTo(x, y + h, x, y, rr);
                      ctx.arcTo(x, y, x + w, y, rr);
                      ctx.closePath();
                    };
                    const wrapTitle = (text, maxWidth, maxLines = 2) => {
                      const words = String(text || '').split(/\s+/);
                      const lines = [];
                      let current = '';
                      words.forEach((word) => {
                        const test = current ? current + ' ' + word : word;
                        const m = ctx.measureText(test);
                        if (m.width <= maxWidth) {
                          current = test;
                        } else {
                          if (current) lines.push(current);
                          current = word;
                        }
                      });
                      if (current) lines.push(current);
                      if (lines.length > maxLines) {
                        const clipped = lines.slice(0, maxLines);
                        const last = clipped[maxLines - 1];
                        let truncated = last;
                        while (ctx.measureText(truncated + '…').width > maxWidth && truncated.length > 0) {
                          truncated = truncated.slice(0, -1);
                        }
                        clipped[maxLines - 1] = truncated + '…';
                        return clipped;
                      }
                      return lines;
                    };

                    // Tier theme
                    const tierNameTitle = toTitleCase(card.tier || 'Common');
                    const themeByTier = {
                      // accent: dark tone for text/shadows; vivid: core tier color for strokes/glow
                      'Common': { accent: '#5a3b1f', vivid: '#cd7f32', pillBg: 'rgba(205,127,50,0.18)', pillStroke: '#cd7f32', innerLight: 'rgba(255, 230, 200, 0.35)' },
                      'Rare': { accent: '#4a4f55', vivid: '#c0c0c0', pillBg: 'rgba(192,192,192,0.18)', pillStroke: '#c0c0c0', innerLight: 'rgba(240, 240, 255, 0.35)' },
                      'Epic': { accent: '#5e4200', vivid: '#ffd700', pillBg: 'rgba(255,215,0,0.18)', pillStroke: '#ffd700', innerLight: 'rgba(255, 245, 200, 0.35)' },
                      'Legendary': { accent: '#62224f', vivid: '#a3478e', pillBg: 'rgba(125,15,107,0.16)', pillStroke: '#8c2e75', innerLight: 'rgba(240, 210, 235, 0.35)' },
                      'Mythic': { accent: '#134a3a', vivid: '#50c878', pillBg: 'rgba(80,200,120,0.18)', pillStroke: '#50c878', innerLight: 'rgba(210, 255, 235, 0.35)' },
                    };
                    const theme = themeByTier[tierNameTitle] || { accent: '#d4af37', pillBg: 'rgba(212,175,55,0.14)', pillStroke: '#d4af37' };

                    // Decorative outer/inner borders
                    const outerMargin = 24;
                    ctx.save();
                    drawRoundedRectPath(outerMargin, outerMargin, width - outerMargin * 2, height - outerMargin * 2, 26);
                    // colored glow using vivid tier color
                    ctx.shadowColor = theme.vivid + 'CC'; // add alpha via string concat for subtlety
                    ctx.shadowBlur = 24;
                    ctx.shadowOffsetX = 0;
                    ctx.shadowOffsetY = 0;
                    ctx.strokeStyle = theme.vivid; // use core tier color
                    ctx.lineWidth = 10;
                    ctx.stroke();
                    // reset shadow
                    ctx.shadowColor = 'transparent';
                    ctx.shadowBlur = 0;
                    ctx.restore();

                    const innerMargin = 50;
                    ctx.save();
                    drawRoundedRectPath(innerMargin, innerMargin, width - innerMargin * 2, height - innerMargin * 2, 20);
                    ctx.setLineDash([10, 12]);
                    ctx.strokeStyle = 'rgba(212, 175, 55, 0.35)';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                    ctx.restore();

                    // Corner ornaments (small diamonds)
                    const drawDiamond = (cx, cy, size, color) => {
                      ctx.save();
                      ctx.translate(cx, cy);
                      ctx.rotate(Math.PI / 4);
                      ctx.fillStyle = color;
                      ctx.fillRect(-size / 2, -size / 2, size, size);
                      ctx.restore();
                    };
                    const decoSize = 24; // 50% larger corners
                    drawDiamond(innerMargin + 18, innerMargin + 18, decoSize, theme.vivid);
                    drawDiamond(width - innerMargin - 18, innerMargin + 18, decoSize, theme.vivid);
                    drawDiamond(innerMargin + 18, height - innerMargin - 18, decoSize, theme.vivid);
                    drawDiamond(width - innerMargin - 18, height - innerMargin - 18, decoSize, theme.vivid);

                    // Collection header (top) - UPPERCASE and larger, with spacing from border
                    ctx.textAlign = 'center';
                    ctx.fillStyle = '#ead9b0';
                    ctx.font = 'bold 62px Cinzel, serif';
                    ctx.fillText('MEDIEVAL COMMANDERS', Math.floor(width / 2), 120);

                    // Tier (below header)
                    const tierLabel = removeDiacritics(String(card.tier || 'Common')).toUpperCase();
                    const isCommonTier = String(card.tier || '').toLowerCase() === 'common';
                    ctx.font = 'bold 40px Cinzel, serif';
                    const pillPaddingX = 26;
                    const pillH = 58;
                    const textW = ctx.measureText(tierLabel).width;
                    const pillW = Math.ceil(textW + pillPaddingX * 2);
                    const pillX = Math.floor((width - pillW) / 2);
                    const pillY = 180; // more space below header
                    ctx.fillStyle = theme.pillBg;
                    ctx.strokeStyle = theme.accent; // dark tier tone for border
                    const pillBorderWidth = isCommonTier ? 8 : 6;
                    ctx.lineWidth = pillBorderWidth; // thicker border (Common a bit thicker)
                    ctx.beginPath();
                    const r = pillH / 2;
                    ctx.moveTo(pillX + r, pillY);
                    ctx.arcTo(pillX + pillW, pillY, pillX + pillW, pillY + pillH, r);
                    ctx.arcTo(pillX + pillW, pillY + pillH, pillX, pillY + pillH, r);
                    ctx.arcTo(pillX, pillY + pillH, pillX, pillY, r);
                    ctx.arcTo(pillX, pillY, pillX + pillW, pillY, r);
                    ctx.closePath();
                    ctx.fill();
                    ctx.stroke();
                    ctx.fillStyle = theme.vivid; // vivid tier color for text
                    ctx.fillText(tierLabel, pillX + pillW / 2, pillY + pillH / 2 + 12);

                    // Image frame (middle, 25% smaller)
                    const baseFrameMarginX = 120;
                    const baseFrameW = width - baseFrameMarginX * 2;
                    const baseFrameH = Math.floor(height * 0.52);
                    const frameW = Math.floor(baseFrameW * 0.75);
                    const frameH = Math.floor(baseFrameH * 0.75);
                    const frameX = Math.floor((width - frameW) / 2);
                    const frameY = 300; // push image lower

                    const img = new Image();
                    img.crossOrigin = 'anonymous';
                    img.onload = () => {
                      const imgRatio = img.width / img.height;
                      const frameRatio = frameW / frameH;
                      let drawW, drawH;
                      if (imgRatio > frameRatio) {
                        drawH = frameH;
                        drawW = Math.floor(drawH * imgRatio);
                      } else {
                        drawW = frameW;
                        drawH = Math.floor(drawW / imgRatio);
                      }
                      const drawX = Math.floor(frameX + (frameW - drawW) / 2);
                      const drawY = Math.floor(frameY + (frameH - drawH) / 2);

                      // Rounded clip and border
                      const borderR = 28;

                      // Shadowed image inside rounded rect
                      ctx.save();
                      drawRoundedRectPath(frameX, frameY, frameW, frameH, borderR);
                      ctx.clip();
                      ctx.drawImage(img, drawX, drawY, drawW, drawH);
                      ctx.restore();

                      // Border with glow - stronger, tier-vivid color
                      ctx.save();
                      // first a soft black ambient shadow
                      ctx.shadowColor = 'rgba(0,0,0,0.45)';
                      ctx.shadowBlur = 24;
                      ctx.shadowOffsetY = 10;
                      // draw stroke fully outside the image frame by expanding the path
                      const outerStrokeW1 = 12;
                      const outerExpand1 = outerStrokeW1 / 2;
                      drawRoundedRectPath(
                        frameX - outerExpand1,
                        frameY - outerExpand1,
                        frameW + outerStrokeW1,
                        frameH + outerStrokeW1,
                        borderR + outerExpand1
                      );
                      ctx.strokeStyle = theme.vivid;
                      ctx.lineWidth = outerStrokeW1;
                      ctx.stroke();
                      // add colored glow pass (also outside)
                      ctx.shadowColor = theme.vivid + 'AA';
                      ctx.shadowBlur = 30;
                      ctx.shadowOffsetY = 0;
                      ctx.shadowOffsetX = 0;
                      const outerStrokeW2 = 6;
                      const outerExpand2 = outerStrokeW2 / 2;
                      drawRoundedRectPath(
                        frameX - outerExpand2,
                        frameY - outerExpand2,
                        frameW + outerStrokeW2,
                        frameH + outerStrokeW2,
                        borderR + outerExpand2
                      );
                      ctx.lineWidth = outerStrokeW2;
                      ctx.strokeStyle = theme.vivid;
                      ctx.stroke();
                      // Inner stroke with slight inset and lighter color (kept inside for detail)
                      const inset = 10;
                      drawRoundedRectPath(frameX + inset, frameY + inset, frameW - inset * 2, frameH - inset * 2, Math.max(12, borderR - 6));
                      ctx.strokeStyle = theme.innerLight;
                      ctx.lineWidth = 2;
                      ctx.stroke();
                      ctx.restore();

                      // Name (single-line with ellipsis), keep original casing
                      const displayName = String(card.name || '');
                      ctx.textAlign = 'center';
                      ctx.fillStyle = '#f0e4c3';
                      const nameFontSize = 68;
                      ctx.font = `bold ${nameFontSize}px 'IM Fell English', serif`;
                      const maxNameWidth = width - 220;
                      let nameText = displayName;
                      while (ctx.measureText(nameText).width > maxNameWidth && nameText.length > 0) {
                        nameText = nameText.slice(0, -1);
                      }
                      if (nameText.length < displayName.length) {
                        nameText = nameText.trimEnd() + '…';
                      }
                      const nameY = frameY + frameH + 130; // spacing from image
                      ctx.fillText(nameText, Math.floor(width / 2), nameY);

                      // Years (bottom-most)
                      const birth = card.birthYear ?? null;
                      const death = card.deathYear ?? null;
                      const years = birth || death ? `${birth ?? '???'} - ${death ?? '???'}` : '';
                      if (years) {
                        // Decorative divider
                        const divY = nameY + 48;
                        ctx.strokeStyle = theme.vivid;
                        ctx.lineWidth = 2;
                        ctx.beginPath();
                        ctx.moveTo(width * 0.175, divY);
                        ctx.lineTo(width * 0.825, divY);
                        ctx.stroke();
                        // small diamonds at ends
                        const dsz = 10;
                        const leftX = width * 0.175;
                        const rightX = width * 0.825;
                        const drawDiamond = (cx, cy, size, color) => {
                          ctx.save();
                          ctx.translate(cx, cy);
                          ctx.rotate(Math.PI / 4);
                          ctx.fillStyle = color;
                          ctx.fillRect(-size / 2, -size / 2, size, size);
                          ctx.restore();
                        };
                        drawDiamond(leftX, divY, dsz, theme.vivid);
                        drawDiamond(rightX, divY, dsz, theme.vivid);

                        ctx.font = 'bold 46px Cinzel, serif';
                        ctx.fillStyle = theme.vivid;
                        ctx.fillText(years, Math.floor(width / 2), divY + 64);

                        // Description under years
                        const desc = String(card.description || '').trim();
                        if (desc) {
                          const descTop = divY + 64 + 60;
                          ctx.textAlign = 'center';
                          ctx.fillStyle = '#e6d7c3';
                          const descFontSize = 32;
                          ctx.font = `normal ${descFontSize}px 'IM Fell English', serif`;
                          const maxDescWidth = width - 240;
                          const descLines = wrapTitle(desc, maxDescWidth, 10);
                          const descLineHeight = Math.round(descFontSize * 1.4);
                          descLines.forEach((line, i) => {
                            ctx.fillText(line, Math.floor(width / 2), descTop + i * descLineHeight);
                          });
                        }
                      }

                      // Final parchment overlay on top of all content for visibility
                      if (parchPattern) {
                        ctx.save();
                        ctx.globalAlpha = 0.28;
                        ctx.globalCompositeOperation = 'soft-light';
                        ctx.fillStyle = parchPattern;
                        ctx.fillRect(0, 0, width, height);
                        ctx.restore();
                      }

                      // Re-fill tier pill background after overlay to ensure visibility
                      ctx.save();
                      ctx.fillStyle = theme.pillBg;
                      drawRoundedRectPath(pillX, pillY, pillW, pillH, r);
                      ctx.fill();
                      ctx.restore();

                      // Re-stroke outer border and re-draw tier pill border/text to avoid wash-out
                      ctx.save();
                      drawRoundedRectPath(outerMargin, outerMargin, width - outerMargin * 2, height - outerMargin * 2, 26);
                      ctx.shadowColor = theme.vivid + 'CC';
                      ctx.shadowBlur = 24;
                      ctx.shadowOffsetX = 0;
                      ctx.shadowOffsetY = 0;
                      ctx.strokeStyle = theme.vivid;
                      ctx.lineWidth = 10;
                      ctx.stroke();
                      ctx.shadowColor = 'transparent';
                      ctx.shadowBlur = 0;
                      ctx.restore();

                      // Re-stroke pill border (dark accent) after overlay
                      ctx.save();
                      ctx.strokeStyle = theme.accent;
                      ctx.lineWidth = pillBorderWidth;
                      drawRoundedRectPath(pillX, pillY, pillW, pillH, r);
                      ctx.stroke();
                      ctx.restore();

                      ctx.textAlign = 'center';
                      ctx.font = 'bold 40px Cinzel, serif';
                      ctx.fillStyle = theme.vivid;
                      ctx.fillText(removeDiacritics(String(card.tier || 'Common')).toUpperCase(), Math.floor(width / 2), 180 + 58 / 2 + 12);

                      canvas.toBlob((blob) => {
                        if (!blob) return;
                        const a = document.createElement('a');
                        const url = URL.createObjectURL(blob);
                        a.href = url;
                        a.download = `${card.name.replace(/\s+/g, '_')}_card_2x3.png`;
                        document.body.appendChild(a);
                        a.click();
                        a.remove();
                        URL.revokeObjectURL(url);
                      }, 'image/png');
                    };
                    img.onerror = () => {
                      // Draw header and tier even if image fails
                      ctx.textAlign = 'center';
                      ctx.fillStyle = '#ead9b0';
                      ctx.font = 'bold 62px Cinzel, serif';
                      ctx.fillText('MEDIEVAL COMMANDERS', Math.floor(width / 2), 120);
                      ctx.font = 'bold 40px Cinzel, serif';
                      ctx.fillStyle = theme.accent;
                      ctx.fillText(removeDiacritics(String(card.tier || 'Common')).toUpperCase(), Math.floor(width / 2), 180 + 58 / 2 + 12);

                      const displayName = String(card.name || '');
                      const nameFontSize = 68;
                      ctx.font = `bold ${nameFontSize}px 'IM Fell English', serif`;
                      const maxNameWidth = width - 220;
                      let nameText = displayName;
                      while (ctx.measureText(nameText).width > maxNameWidth && nameText.length > 0) {
                        nameText = nameText.slice(0, -1);
                      }
                      if (nameText.length < displayName.length) {
                        nameText = nameText.trimEnd() + '…';
                      }
                      ctx.fillStyle = '#f0e4c3';
                      const nameYErr = Math.floor(height / 2) + 60;
                      ctx.fillText(nameText, Math.floor(width / 2), nameYErr);
                      const birth = card.birthYear ?? null;
                      const death = card.deathYear ?? null;
                      const years = birth || death ? `${birth ?? '???'} - ${death ?? '???'}` : '';
                      if (years) {
                        ctx.strokeStyle = theme.vivid;
                        const divY = nameYErr + 36;
                        ctx.lineWidth = 2;
                        ctx.beginPath();
                        ctx.moveTo(width * 0.25, divY);
                        ctx.lineTo(width * 0.75, divY);
                        ctx.stroke();
                        const dsz = 10;
                        const leftX = width * 0.25;
                        const rightX = width * 0.75;
                        const drawDiamond = (cx, cy, size, color) => {
                          ctx.save();
                          ctx.translate(cx, cy);
                          ctx.rotate(Math.PI / 4);
                          ctx.fillStyle = color;
                          ctx.fillRect(-size / 2, -size / 2, size, size);
                          ctx.restore();
                        };
                        drawDiamond(leftX, divY, dsz, theme.vivid);
                        drawDiamond(rightX, divY, dsz, theme.vivid);
                        ctx.font = 'bold 46px Cinzel, serif';
                        ctx.fillStyle = theme.vivid;
                        ctx.fillText(years, Math.floor(width / 2), divY + 64);

                        // Description under years (error path)
                        const desc = String(card.description || '').trim();
                        if (desc) {
                          const descTop = divY + 64 + 60;
                          ctx.textAlign = 'center';
                          ctx.fillStyle = '#e6d7c3';
                          const descFontSize = 32;
                          ctx.font = `normal ${descFontSize}px 'IM Fell English', serif`;
                          const maxDescWidth = width - 240;
                          const descLines = wrapTitle(desc, maxDescWidth, 10);
                          const descLineHeight = Math.round(descFontSize * 1.4);
                          descLines.forEach((line, i) => {
                            ctx.fillText(line, Math.floor(width / 2), descTop + i * descLineHeight);
                          });
                        }
                      }
                      // Final parchment overlay on top of all content for visibility (error path)
                      if (parchPattern) {
                        ctx.save();
                        ctx.globalAlpha = 0.28;
                        ctx.globalCompositeOperation = 'soft-light';
                        ctx.fillStyle = parchPattern;
                        ctx.fillRect(0, 0, width, height);
                        ctx.restore();
                      }

                      // Re-stroke outer border and re-draw tier pill border/text to avoid wash-out (error path)
                      ctx.save();
                      drawRoundedRectPath(outerMargin, outerMargin, width - outerMargin * 2, height - outerMargin * 2, 26);
                      ctx.shadowColor = theme.vivid + 'CC';
                      ctx.shadowBlur = 24;
                      ctx.shadowOffsetX = 0;
                      ctx.shadowOffsetY = 0;
                      ctx.strokeStyle = theme.vivid;
                      ctx.lineWidth = 10;
                      ctx.stroke();
                      ctx.shadowColor = 'transparent';
                      ctx.shadowBlur = 0;
                      ctx.restore();

                      // Re-fill tier pill background after overlay (error path) for visibility
                      ctx.save();
                      ctx.fillStyle = theme.pillBg;
                      drawRoundedRectPath(pillX, pillY, pillW, pillH, r);
                      ctx.fill();
                      ctx.restore();

                      // Re-stroke pill border (dark accent) after overlay (error path)
                      ctx.save();
                      ctx.strokeStyle = theme.accent;
                      ctx.lineWidth = pillBorderWidth;
                      drawRoundedRectPath(pillX, pillY, pillW, pillH, r);
                      ctx.stroke();
                      ctx.restore();

                      ctx.textAlign = 'center';
                      ctx.font = 'bold 40px Cinzel, serif';
                      ctx.fillStyle = theme.vivid;
                      ctx.fillText(removeDiacritics(String(card.tier || 'Common')).toUpperCase(), Math.floor(width / 2), 180 + 58 / 2 + 12);

                      canvas.toBlob((blob) => {
                        if (!blob) return;
                        const a = document.createElement('a');
                        const url = URL.createObjectURL(blob);
                        a.href = url;
                        a.download = `${card.name.replace(/\s+/g, '_')}_card_2x3.png`;
                        document.body.appendChild(a);
                        a.click();
                        a.remove();
                        URL.revokeObjectURL(url);
                      }, 'image/png');
                    };
                    img.src = getImageUrl(card.image);
                  }}
                  className="btn btn-success modal-admin-btn"
                  title="Download 2:3 Card Image"
                >
                  Download
                </button>
              </div>
            )}
            
            <div className="modal-header">
              <h2 className="modal-title">{card.name}</h2>
              <div className={`modal-tier ${getTierClass(card.tier)}`}>
                {card.tier}
              </div>
            </div>

            {/* Birth and Death Dates - Above Image */}
            <div className="modal-dates">
              <div className="modal-date-range">
                {formatYearRange(card.birthYear ?? null, card.deathYear ?? null)}
              </div>
            </div>

            <img 
              src={getImageUrl(card.image)} 
              alt={card.name}
              loading="lazy"
              className="modal-image"
              onError={(e) => {
                e.target.src = '/placeholder-commander.svg';
              }}
            />

            <p className="modal-description">{card.description}</p>

            <div className="modal-attributes">
              <div className="modal-attribute">
                <span className="modal-attribute-name">Strength</span>
                <span className="modal-attribute-value">{card.attributes.strength}</span>
              </div>
              <div className="modal-attribute">
                <span className="modal-attribute-name">Intelligence</span>
                <span className="modal-attribute-value">{card.attributes.intelligence}</span>
              </div>
              <div className="modal-attribute">
                <span className="modal-attribute-name">Charisma</span>
                <span className="modal-attribute-value">{card.attributes.charisma}</span>
              </div>
              <div className="modal-attribute">
                <span className="modal-attribute-name">Leadership</span>
                <span className="modal-attribute-value">{card.attributes.leadership}</span>
              </div>
              <div className="modal-attribute">
                <span className="modal-attribute-name">Attack</span>
                <span className="modal-attribute-value">{card.attributes.attack}</span>
              </div>
              <div className="modal-attribute">
                <span className="modal-attribute-name">Defense</span>
                <span className="modal-attribute-value">{card.attributes.defense}</span>
              </div>
              <div className="modal-attribute">
                <span className="modal-attribute-name">Speed</span>
                <span className="modal-attribute-value">{card.attributes.speed}</span>
              </div>
              <div className="modal-attribute">
                <span className="modal-attribute-name">Health</span>
                <span className="modal-attribute-value">{card.attributes.health}</span>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
});

export default Card;
