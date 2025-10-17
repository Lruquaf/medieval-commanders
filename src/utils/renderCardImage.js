import { getImageUrl } from './images';

export function renderAndDownloadCard(card, ratioKey) {
  const ratioMap = {
    '2:3': { w: 2, h: 3, suffix: '2x3' },
    '1:1': { w: 1, h: 1, suffix: '1x1' },
    '4:5': { w: 4, h: 5, suffix: '4x5' },
  };
  const chosen = ratioMap[ratioKey] || ratioMap['2:3'];
  const canvas = document.createElement('canvas');
  const width = 1200;
  const height = Math.round(width * (chosen.h / chosen.w));
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, '#3e2723');
  gradient.addColorStop(1, '#1b0f0a');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  const rad = ctx.createRadialGradient(
    width / 2,
    height / 2,
    Math.min(width, height) / 6,
    width / 2,
    height / 2,
    Math.max(width, height) / 1.1
  );
  rad.addColorStop(0, 'rgba(0,0,0,0)');
  rad.addColorStop(1, 'rgba(0,0,0,0.25)');
  ctx.fillStyle = rad;
  ctx.fillRect(0, 0, width, height);

  const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
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
  const targetTilesX = 6;
  const targetTileSize = width / targetTilesX;
  let T = divisors[0];
  let minDiff = Math.abs(T - targetTileSize);
  for (let i = 1; i < divisors.length; i++) {
    const d = divisors[i];
    const diff = Math.abs(d - targetTileSize);
    if (diff < minDiff) {
      T = d;
      minDiff = diff;
    }
  }
  const parch = document.createElement('canvas');
  parch.width = T;
  parch.height = T;
  const pctx = parch.getContext('2d');
  pctx.fillStyle = '#efe2c3';
  pctx.fillRect(0, 0, T, T);
  for (let i = 0; i < Math.max(6, Math.floor(T / 40)); i++) {
    const cx = Math.random() * T;
    const cy = Math.random() * T;
    const r = T * 0.28 + Math.random() * (T * 0.42);
    const g = pctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    g.addColorStop(0, 'rgba(120, 80, 40, 0.14)');
    g.addColorStop(1, 'rgba(120, 80, 40, 0)');
    pctx.fillStyle = g;
    pctx.beginPath();
    pctx.arc(cx, cy, r, 0, Math.PI * 2);
    pctx.fill();
  }
  for (let i = 0; i < Math.max(4, Math.floor(T / 60)); i++) {
    const cx = Math.random() * T;
    const cy = Math.random() * T;
    const r = T * 0.2 + Math.random() * (T * 0.35);
    const g = pctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    g.addColorStop(0, 'rgba(255, 245, 220, 0.12)');
    g.addColorStop(1, 'rgba(255, 245, 220, 0)');
    pctx.fillStyle = g;
    pctx.beginPath();
    pctx.arc(cx, cy, r, 0, Math.PI * 2);
    pctx.fill();
  }
  pctx.strokeStyle = 'rgba(90, 60, 30, 0.05)';
  pctx.lineWidth = Math.max(0.5, T * 0.003);
  for (let i = 0; i < 6; i++) {
    const y = Math.random() * T;
    pctx.beginPath();
    pctx.moveTo(0, y);
    const cp1x = T * 0.25 + Math.random() * (T * 0.25);
    const cp1y = y + (Math.random() * (T * 0.05) - T * 0.025);
    const cp2x = T * 0.5 + Math.random() * (T * 0.25);
    const cp2y = y + (Math.random() * (T * 0.05) - T * 0.025);
    pctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, T, y + (Math.random() * (T * 0.05) - T * 0.025));
    pctx.stroke();
  }
  pctx.fillStyle = 'rgba(90, 60, 30, 0.05)';
  for (let i = 0; i < Math.floor(T * T * 0.06); i++) {
    const x = Math.random() * T;
    const y = Math.random() * T;
    const s = Math.random() * (T * 0.006) + T * 0.002;
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

  const toTitleCase = (s) => (String(s || '')).toLowerCase().split(' ').map(w => (w ? w[0].toUpperCase() + w.slice(1) : '')).join(' ');
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

  const tierNameTitle = toTitleCase(card.tier || 'Common');
  const themeByTier = {
    Common: { accent: '#5a3b1f', vivid: '#cd7f32', pillBg: 'rgba(205,127,50,0.18)', pillStroke: '#cd7f32', innerLight: 'rgba(255, 230, 200, 0.35)' },
    Rare: { accent: '#4a4f55', vivid: '#c0c0c0', pillBg: 'rgba(192,192,192,0.18)', pillStroke: '#c0c0c0', innerLight: 'rgba(240, 240, 255, 0.35)' },
    Epic: { accent: '#5e4200', vivid: '#ffd700', pillBg: 'rgba(255,215,0,0.18)', pillStroke: '#ffd700', innerLight: 'rgba(255, 245, 200, 0.35)' },
    Legendary: { accent: '#62224f', vivid: '#a3478e', pillBg: 'rgba(125,15,107,0.16)', pillStroke: '#8c2e75', innerLight: 'rgba(240, 210, 235, 0.35)' },
    Mythic: { accent: '#134a3a', vivid: '#50c878', pillBg: 'rgba(80,200,120,0.18)', pillStroke: '#50c878', innerLight: 'rgba(210, 255, 235, 0.35)' },
  };
  const theme = themeByTier[tierNameTitle] || { accent: '#d4af37', pillBg: 'rgba(212,175,55,0.14)', pillStroke: '#d4af37' };

  const sW = width / 1200;
  const sH = height / 1800;

  const outerMargin = Math.round(24 * sW);
  ctx.save();
  drawRoundedRectPath(outerMargin, outerMargin, width - outerMargin * 2, height - outerMargin * 2, Math.round(26 * sW));
  ctx.shadowColor = theme.vivid + 'CC';
  ctx.shadowBlur = 24 * sW;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  ctx.strokeStyle = theme.vivid;
  ctx.lineWidth = 10 * sW;
  ctx.stroke();
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.restore();

  const innerMargin = Math.round(50 * sW);
  ctx.save();
  drawRoundedRectPath(innerMargin, innerMargin, width - innerMargin * 2, height - innerMargin * 2, Math.round(20 * sW));
  ctx.setLineDash([10 * sW, 12 * sW]);
  ctx.strokeStyle = 'rgba(212, 175, 55, 0.35)';
  ctx.lineWidth = 2 * sW;
  ctx.stroke();
  ctx.restore();

  const drawDiamond = (cx, cy, size, color) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(Math.PI / 4);
    ctx.fillStyle = color;
    ctx.fillRect(-size / 2, -size / 2, size, size);
    ctx.restore();
  };
  const decoSize = 24 * sW;
  drawDiamond(innerMargin + 18 * sW, innerMargin + 18 * sW, decoSize, theme.vivid);
  drawDiamond(width - innerMargin - 18 * sW, innerMargin + 18 * sW, decoSize, theme.vivid);
  drawDiamond(innerMargin + 18 * sW, height - innerMargin - 18 * sW, decoSize, theme.vivid);
  drawDiamond(width - innerMargin - 18 * sW, height - innerMargin - 18 * sW, decoSize, theme.vivid);

  // Vertical content offset for 1:1 to center layout
  let offsetY = 0;
  if (ratioKey === '1:1') {
    const headerYBase = Math.round(120 * sH);
    const pillYBase = Math.round(180 * sH);
    const baseFrameMarginX0 = Math.round(120 * sW);
    const baseFrameW0 = width - baseFrameMarginX0 * 2;
    const baseFrameH0 = Math.floor(height * 0.56);
    let frameW0 = Math.floor(baseFrameW0 * 0.75);
    let frameH0 = Math.floor(baseFrameH0 * 0.75);
    const frameSize0 = Math.min(frameW0, frameH0);
    frameW0 = frameSize0;
    frameH0 = frameSize0;
    const frameYBase = Math.round(300 * sH);
    const nameYBase = frameYBase + frameH0 + Math.round(160 * sH);
    const divYBase = nameYBase + Math.round(64 * sH);
    const yearsYBase = divYBase + Math.round(72 * sH);
    const topY = Math.min(headerYBase, pillYBase, frameYBase);
    const bottomY = yearsYBase;
    const contentH = bottomY - topY;
    offsetY = Math.round((height - contentH) / 2 - topY);
  }

  // Header
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ead9b0';
  ctx.font = `bold ${Math.round(62 * sW)}px Cinzel, serif`;
  ctx.fillText('MEDIEVAL COMMANDERS', Math.floor(width / 2), Math.round((ratioKey === '4:5' ? 140 : 120) * sH) + (ratioKey === '1:1' ? offsetY : 0));

  // Tier pill
  const tierLabel = removeDiacritics(String(card.tier || 'Common')).toUpperCase();
  const isCommonTier = String(card.tier || '').toLowerCase() === 'common';
  ctx.font = `bold ${Math.round((ratioKey === '4:5' ? 44 : 40) * sW)}px Cinzel, serif`;
  const pillPaddingX = Math.round((ratioKey === '4:5' ? 28 : (ratioKey === '1:1' ? 26 * 1.25 : 26)) * sW);
  const pillH = Math.round((ratioKey === '4:5' ? 68 : (ratioKey === '1:1' ? 58 * 1.25 : 58)) * sH);
  const textW = ctx.measureText(tierLabel).width;
  const pillW = Math.ceil(textW + pillPaddingX * 2);
  const pillX = Math.floor((width - pillW) / 2);
  const pillY = Math.round(180 * sH) + (ratioKey === '1:1' ? offsetY : 0);
  ctx.fillStyle = theme.pillBg;
  ctx.strokeStyle = theme.accent;
  const pillBorderWidth = isCommonTier ? 8 * sW : 6 * sW;
  ctx.lineWidth = pillBorderWidth;
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
  ctx.fillStyle = theme.vivid;
  const prevBaseline = ctx.textBaseline;
  ctx.textBaseline = 'alphabetic';
  const metrics = ctx.measureText(tierLabel);
  const ascent = metrics.actualBoundingBoxAscent || 0;
  const descent = metrics.actualBoundingBoxDescent || 0;
  const baselineY = pillY + (pillH + (ascent - descent)) / 2;
  ctx.fillText(tierLabel, pillX + pillW / 2, baselineY);
  ctx.textBaseline = prevBaseline;

  // Image frame
  const baseFrameMarginX = Math.round(120 * sW);
  const baseFrameW = width - baseFrameMarginX * 2;
  const baseFrameH = Math.floor(height * (ratioKey === '2:3' ? 0.52 : 0.56));
  let frameW = Math.floor(baseFrameW * 0.75);
  let frameH = Math.floor(baseFrameH * 0.75);
  if (ratioKey === '1:1' || ratioKey === '4:5') {
    const frameSize = Math.min(frameW, frameH);
    frameW = frameSize;
    frameH = frameSize;
  }
  if (ratioKey === '4:5') {
    frameW = Math.floor(frameW * 0.825);
    frameH = Math.floor(frameH * 0.825);
  }
  const frameX = Math.floor((width - frameW) / 2);
  const frameY = Math.round(300 * sH) + (ratioKey === '1:1' ? offsetY : 0);

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

    const borderR = Math.max(12, Math.round(28 * sW));

    ctx.save();
    drawRoundedRectPath(frameX, frameY, frameW, frameH, borderR);
    ctx.clip();
    ctx.drawImage(img, drawX, drawY, drawW, drawH);
    ctx.restore();

    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.45)';
    ctx.shadowBlur = 24 * sW;
    ctx.shadowOffsetY = 10 * sH;
    const outerStrokeW1 = 12 * sW;
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
    ctx.shadowColor = theme.vivid + 'AA';
    ctx.shadowBlur = 30 * sW;
    ctx.shadowOffsetY = 0;
    ctx.shadowOffsetX = 0;
    const outerStrokeW2 = 6 * sW;
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
    const inset = 10 * sW;
    drawRoundedRectPath(
      frameX + inset,
      frameY + inset,
      frameW - inset * 2,
      frameH - inset * 2,
      Math.max(12, borderR - 6 * sW)
    );
    ctx.strokeStyle = theme.innerLight;
    ctx.lineWidth = 2 * sW;
    ctx.stroke();
    ctx.restore();

    // Vertical side dividers (skip for 2:3)
    if (ratioKey !== '2:3') {
      const sideGap = Math.floor((frameX - innerMargin) / 2);
      if (sideGap > 8 * sW) {
        const vXLeft = innerMargin + sideGap;
        const vXRight = width - innerMargin - sideGap;
        const baseInset = Math.round(8 * sH);
        let vYTop = frameY + baseInset;
        let vYBottom = frameY + frameH - baseInset;
        const currentLen = vYBottom - vYTop;
        const targetLen = Math.round(currentLen * 1.25);
        const addEach = Math.round(Math.max(0, targetLen - currentLen) / 2);
        vYTop = Math.max(innerMargin, vYTop - addEach);
        vYBottom = Math.min(height - innerMargin, vYBottom + addEach);
        ctx.save();
        ctx.strokeStyle = theme.vivid;
        ctx.lineWidth = 2 * sW;
        ctx.beginPath();
        ctx.moveTo(vXLeft, vYTop);
        ctx.lineTo(vXLeft, vYBottom);
        ctx.moveTo(vXRight, vYTop);
        ctx.lineTo(vXRight, vYBottom);
        ctx.stroke();
        ctx.restore();
        const vDiamondSize = 15 * sW;
        drawDiamond(vXLeft, vYTop, vDiamondSize, theme.vivid);
        drawDiamond(vXLeft, vYBottom, vDiamondSize, theme.vivid);
        drawDiamond(vXRight, vYTop, vDiamondSize, theme.vivid);
        drawDiamond(vXRight, vYBottom, vDiamondSize, theme.vivid);
      }
    }

    // Name
    const displayName = String(card.name || '');
    ctx.textAlign = 'center';
    ctx.fillStyle = '#f0e4c3';
    const nameFontSize = Math.round(68 * sW);
    ctx.font = `bold ${nameFontSize}px 'IM Fell English', serif`;
    const maxNameWidth = width - Math.round((ratioKey === '4:5' ? 180 : 220) * sW);
    let nameText = displayName;
    while (ctx.measureText(nameText).width > maxNameWidth && nameText.length > 0) {
      nameText = nameText.slice(0, -1);
    }
    if (nameText.length < displayName.length) {
      nameText = nameText.trimEnd() + '…';
    }
    const nameY = frameY + frameH + (ratioKey === '1:1' ? Math.round(160 * sH) : ratioKey === '4:5' ? Math.round(140 * sH) : Math.round(130 * sH));
    ctx.fillText(nameText, Math.floor(width / 2), nameY);

    // Years and description
    const birth = card.birthYear ?? null;
    const death = card.deathYear ?? null;
    const years = birth || death ? `${birth ?? '???'} - ${death ?? '???'}` : '';
    if (years) {
      const divY = nameY + (ratioKey === '1:1' ? Math.round(64 * sH) : Math.round(52 * sH));
      const sideGapH = Math.floor((frameX - innerMargin) / 2);
      let leftX = width * 0.175;
      let rightX = width * 0.825;
      if (sideGapH > 8 * sW) {
        leftX = innerMargin + sideGapH;
        rightX = width - innerMargin - sideGapH;
      }
      ctx.strokeStyle = theme.vivid;
      ctx.lineWidth = 2 * sW;
      ctx.beginPath();
      ctx.moveTo(leftX, divY);
      ctx.lineTo(rightX, divY);
      ctx.stroke();
      const dsz = 15 * sW;
      drawDiamond(leftX, divY, dsz, theme.vivid);
      drawDiamond(rightX, divY, dsz, theme.vivid);

      ctx.font = `bold ${Math.round(46 * sW)}px Cinzel, serif`;
      ctx.fillStyle = theme.vivid;
      ctx.fillText(years, Math.floor(width / 2), divY + (ratioKey === '1:1' ? Math.round(72 * sH) : Math.round(64 * sH)));

      const desc = String(card.description || '').trim();
      if (desc && ratioKey !== '1:1') {
        const descTop = divY + (ratioKey === '1:1' ? Math.round(80 * sH) : Math.round(64 * sH)) + Math.round(64 * sH);
        ctx.textAlign = 'center';
        ctx.fillStyle = '#e6d7c3';
        const descFontSize = Math.round(32 * sW);
        ctx.font = `normal ${descFontSize}px 'IM Fell English', serif`;
        const maxDescWidth = width - Math.round((ratioKey === '4:5' ? 200 : 240) * sW);
        const descLines = wrapTitle(desc, maxDescWidth, 10);
        const descLineHeight = Math.round(descFontSize * 1.4);
        descLines.forEach((line, i) => {
          ctx.fillText(line, Math.floor(width / 2), descTop + i * descLineHeight);
        });
      }
    }

    if (parchPattern) {
      ctx.save();
      ctx.globalAlpha = 0.28;
      ctx.globalCompositeOperation = 'soft-light';
      ctx.fillStyle = parchPattern;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();
    }

    ctx.save();
    drawRoundedRectPath(outerMargin, outerMargin, width - outerMargin * 2, height - outerMargin * 2, Math.round(26 * sW));
    ctx.shadowColor = theme.vivid + 'CC';
    ctx.shadowBlur = 24 * sW;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.strokeStyle = theme.vivid;
    ctx.lineWidth = 10 * sW;
    ctx.stroke();
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.restore();

    ctx.save();
    ctx.strokeStyle = theme.accent;
    ctx.lineWidth = pillBorderWidth;
    drawRoundedRectPath(pillX, pillY, pillW, pillH, r);
    ctx.stroke();
    ctx.restore();

    canvas.toBlob((blob) => {
      if (!blob) return;
      const a = document.createElement('a');
      const url = URL.createObjectURL(blob);
      a.href = url;
      a.download = `${card.name.replace(/\s+/g, '_')}_card_${chosen.suffix}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    }, 'image/png');
  };

  img.onerror = () => {
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ead9b0';
    ctx.font = `bold ${Math.round(62 * sW)}px Cinzel, serif`;
    ctx.fillText('MEDIEVAL COMMANDERS', Math.floor(width / 2), Math.round(120 * sH));
    ctx.font = `bold ${Math.round(40 * sW)}px Cinzel, serif`;
    ctx.fillStyle = theme.accent;
    ctx.fillText(removeDiacritics(String(card.tier || 'Common')).toUpperCase(), Math.floor(width / 2), Math.round(180 * sH) + Math.round(58 * sH) / 2 + Math.round(12 * sH));

    const displayName = String(card.name || '');
    const nameFontSize = Math.round(68 * sW);
    ctx.font = `bold ${nameFontSize}px 'IM Fell English', serif`;
    const maxNameWidth = width - Math.round(220 * sW);
    let nameText = displayName;
    while (ctx.measureText(nameText).width > maxNameWidth && nameText.length > 0) {
      nameText = nameText.slice(0, -1);
    }
    if (nameText.length < displayName.length) {
      nameText = nameText.trimEnd() + '…';
    }
    ctx.fillStyle = '#f0e4c3';
    const nameYErr = Math.floor(height / 2) + Math.round(60 * sH);
    ctx.fillText(nameText, Math.floor(width / 2), nameYErr);
    const birth = card.birthYear ?? null;
    const death = card.deathYear ?? null;
    const years = birth || death ? `${birth ?? '???'} - ${death ?? '???'}` : '';
    if (years) {
      ctx.strokeStyle = theme.vivid;
      const divY = nameYErr + Math.round(36 * sH);
      const sideGapH2 = Math.floor((frameX - innerMargin) / 2);
      let leftX2 = width * 0.25;
      let rightX2 = width * 0.75;
      if (sideGapH2 > 8 * sW) {
        leftX2 = innerMargin + sideGapH2;
        rightX2 = width - innerMargin - sideGapH2;
      }
      ctx.lineWidth = 2 * sW;
      ctx.beginPath();
      ctx.moveTo(leftX2, divY);
      ctx.lineTo(rightX2, divY);
      ctx.stroke();
      const dsz = 15 * sW;
      drawDiamond(leftX2, divY, dsz, theme.vivid);
      drawDiamond(rightX2, divY, dsz, theme.vivid);
      ctx.font = `bold ${Math.round(46 * sW)}px Cinzel, serif`;
      ctx.fillStyle = theme.vivid;
      ctx.fillText(years, Math.floor(width / 2), divY + Math.round(64 * sH));

      const desc = String(card.description || '').trim();
      if (desc && ratioKey !== '1:1') {
        const descTop = divY + Math.round(64 * sH) + Math.round(60 * sH);
        ctx.textAlign = 'center';
        ctx.fillStyle = '#e6d7c3';
        const descFontSize = Math.round(32 * sW);
        ctx.font = `normal ${descFontSize}px 'IM Fell English', serif`;
        const maxDescWidth = width - Math.round(240 * sW);
        const descLines = wrapTitle(desc, maxDescWidth, 10);
        const descLineHeight = Math.round(descFontSize * 1.4);
        descLines.forEach((line, i) => {
          ctx.fillText(line, Math.floor(width / 2), descTop + i * descLineHeight);
        });
      }
    }
    if (parchPattern) {
      ctx.save();
      ctx.globalAlpha = 0.28;
      ctx.globalCompositeOperation = 'soft-light';
      ctx.fillStyle = parchPattern;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();
    }
    ctx.save();
    drawRoundedRectPath(outerMargin, outerMargin, width - outerMargin * 2, height - outerMargin * 2, Math.round(26 * sW));
    ctx.shadowColor = theme.vivid + 'CC';
    ctx.shadowBlur = 24 * sW;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.strokeStyle = theme.vivid;
    ctx.lineWidth = 10 * sW;
    ctx.stroke();
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.restore();

    // Re-fill pill background
    ctx.save();
    ctx.fillStyle = theme.pillBg;
    const pillH2 = Math.round(58 * sH);
    const pillY2 = Math.round(180 * sH);
    const pillR2 = pillH2 / 2;
    drawRoundedRectPath(Math.floor((width - 300) / 2), pillY2, 300, pillH2, pillR2);
    ctx.fill();
    ctx.restore();

    canvas.toBlob((blob) => {
      if (!blob) return;
      const a = document.createElement('a');
      const url = URL.createObjectURL(blob);
      a.href = url;
      a.download = `${card.name.replace(/\s+/g, '_')}_card_${chosen.suffix}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    }, 'image/png');
  };
  img.src = getImageUrl(card.image);
}


