function exportPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' });

  const PW = 215.9, PH = 279.4;
  const ML = 15, MR = 15, MT = 15;
  const CW = PW - ML - MR;
  let y = MT;

  // ── COLORS ──────────────────────────────────────────────────
  const C = {
    bg:       [13, 15, 14],
    surface:  [20, 23, 22],
    surface2: [26, 30, 27],
    border:   [40, 46, 40],
    accent:   [74, 222, 128],
    text:     [232, 235, 230],
    text2:    [138, 145, 136],
    text3:    [84, 92, 82],
    red:      [248, 113, 113],
    amber:    [251, 191, 36],
    green:    [74, 222, 128],
  };

  function setFill(c)   { doc.setFillColor(c[0], c[1], c[2]); }
  function setDraw(c)   { doc.setDrawColor(c[0], c[1], c[2]); }
  function setTxt(c)    { doc.setTextColor(c[0], c[1], c[2]); }

  function statusColor(s) {
    if (s === 'overdue') return C.red;
    if (s === 'soon')    return C.amber;
    if (s === 'ok')      return C.green;
    if (s === 'na')      return C.text3;
    return C.text3;
  }

  function statusLabel(s) {
    if (s === 'overdue') return 'OVERDUE';
    if (s === 'soon')    return 'DUE SOON';
    if (s === 'ok')      return 'OK';
    if (s === 'na')      return 'NON-SERV.';
    return 'NOT LOGGED';
  }

  function getStatusForPDF(item) {
    if (nonServiceable[item.id]) return 'na';
    if (miles === null) return 'unknown';
    const rec = records[item.id] || {};
    const lastDone = rec.lastMiles || 0;
    const rem = (lastDone + ivl(item)) - miles;
    if (rem <= 0) return 'overdue';
    if (rem <= 1500) return 'soon';
    return 'ok';
  }

  function getRemForPDF(item) {
    if (nonServiceable[item.id]) return null;
    if (miles === null) return null;
    const rec = records[item.id] || {};
    const lastDone = rec.lastMiles || 0;
    return (lastDone + ivl(item)) - miles;
  }

  // ── PAGE BACKGROUND ──────────────────────────────────────────
  function drawPageBg() {
    setFill(C.bg);
    doc.rect(0, 0, PW, PH, 'F');
  }

  // ── NEW PAGE ─────────────────────────────────────────────────
  function newPage() {
    doc.addPage();
    drawPageBg();
    y = MT;
    drawPageFooter();
  }

  function checkPage(needed) {
    if (y + needed > PH - 18) newPage();
  }

  function drawPageFooter() {
    const pg = doc.internal.getCurrentPageInfo().pageNumber;
    const total = doc.internal.getNumberOfPages ? doc.internal.getNumberOfPages() : '';
    setTxt(C.text3);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Toyota Tacoma · Maintenance Report', ML, PH - 8);
    doc.text(`Page ${pg}`, PW - MR, PH - 8, { align: 'right' });
    setDraw(C.border);
    doc.setLineWidth(0.2);
    doc.line(ML, PH - 12, PW - MR, PH - 12);
  }

  // ── COVER HEADER ─────────────────────────────────────────────
  drawPageBg();

  // green accent bar top
  setFill(C.accent);
  doc.rect(0, 0, PW, 1.5, 'F');

  // dark header band
  setFill(C.surface);
  doc.rect(0, 1.5, PW, 42, 'F');
  setDraw(C.border);
  doc.setLineWidth(0.3);
  doc.line(0, 43.5, PW, 43.5);

  // Title
  setTxt(C.text);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(26);
  doc.text('TOYOTA TACOMA', ML, 22);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  setTxt(C.accent);
  doc.text('Maintenance Report', ML, 31);

  // meta right side
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  setTxt(C.text2);
  const dateStr = new Date().toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' });
  doc.text(`Generated: ${dateStr}`, PW - MR, 18, { align: 'right' });
  doc.text('3rd Gen · 2016–2023 · V6 3.5L', PW - MR, 25, { align: 'right' });
  if (miles !== null) {
    setTxt(C.amber);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(`${miles.toLocaleString()} mi`, PW - MR, 33, { align: 'right' });
    setTxt(C.text3);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('Current odometer', PW - MR, 38, { align: 'right' });
  }

  y = 52;

  // ── SUMMARY CARDS ────────────────────────────────────────────
  const allItems = [...ITEMS, ...customItems];
  const counts = { overdue: 0, soon: 0, ok: 0, unknown: 0 };
  allItems.forEach(item => {
    const s = item.id.startsWith('custom_')
      ? (() => {
          const rec = records[item.id] || {};
          if (item.interval) {
            if (miles === null) return 'unknown';
            const rem = (rec.lastMiles || 0) + item.interval - miles;
            if (rem <= 0) return 'overdue';
            if (rem <= 1500) return 'soon';
            return 'ok';
          } else {
            return rec.lastMiles ? 'ok' : 'unknown';
          }
        })()
      : getStatusForPDF(item);
    if (s !== 'na') counts[s]++;
  });

  const cards = [
    { label: 'Overdue',    val: counts.overdue,  color: C.red },
    { label: 'Due Soon',   val: counts.soon,     color: C.amber },
    { label: 'OK',         val: counts.ok,       color: C.green },
    { label: 'Not Logged', val: counts.unknown,  color: C.text3 },
  ];
  const cw = (CW - 9) / 4;
  cards.forEach((card, i) => {
    const cx = ML + i * (cw + 3);
    setFill(C.surface);
    doc.roundedRect(cx, y, cw, 18, 1.5, 1.5, 'F');
    setDraw(card.color);
    doc.setLineWidth(0.5);
    doc.line(cx, y, cx + cw, y);
    setTxt(card.color);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text(String(card.val), cx + cw / 2, y + 10, { align: 'center' });
    setTxt(C.text3);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.text(card.label.toUpperCase(), cx + cw / 2, y + 15.5, { align: 'center' });
  });
  y += 26;

  // next service
  const nextSvc = calcNextService();
  if (nextSvc !== null) {
    setFill(C.surface2);
    doc.roundedRect(ML, y, CW, 10, 1, 1, 'F');
    setTxt(C.text3);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('NEXT SERVICE AT', ML + 4, y + 4.5);
    setTxt(C.amber);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(`${nextSvc.toLocaleString()} mi`, ML + 4, y + 8.5);
    if (miles !== null) {
      setTxt(C.text2);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(`(in ${(nextSvc - miles).toLocaleString()} mi)`, ML + 38, y + 8.5);
    }
    const modeLabel = severeMode ? 'SEVERE INTERVALS' : 'NORMAL INTERVALS';
    setTxt(C.text3);
    doc.setFontSize(7.5);
    doc.text(modeLabel, PW - MR, y + 6.5, { align: 'right' });
    y += 16;
  }

  // ── SECTION RENDERER ─────────────────────────────────────────
  function drawSectionHeader(title) {
    checkPage(14);
    y += 4;
    setTxt(C.text3);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text(title.toUpperCase(), ML, y);
    setDraw(C.border);
    doc.setLineWidth(0.2);
    doc.line(ML + doc.getTextWidth(title.toUpperCase()) + 3, y - 0.5, PW - MR, y - 0.5);
    y += 5;
  }

  function drawItemRow(item, isCustom) {
    const ROW_H = 13;
    checkPage(ROW_H + 2);

    const isNA = !isCustom && !!nonServiceable[item.id];

    const status = isCustom
      ? (() => {
          if (!item.interval || miles === null) return 'unknown';
          const rec = records[item.id] || {};
          const rem = (rec.lastMiles || 0) + item.interval - miles;
          if (rem <= 0) return 'overdue';
          if (rem <= 1500) return 'soon';
          return 'ok';
        })()
      : getStatusForPDF(item);

    const rem = isCustom
      ? (!item.interval || miles === null ? null : ((records[item.id]?.lastMiles || 0) + item.interval - miles))
      : getRemForPDF(item);

    const rec = records[item.id] || {};
    const sc = statusColor(status);

    // row bg — dimmed for NA
    setFill(isNA ? C.surface2 : C.surface);
    doc.roundedRect(ML, y, CW, ROW_H, 1, 1, 'F');

    // status stripe
    setFill(sc);
    doc.roundedRect(ML, y, 2.5, ROW_H, 0.5, 0.5, 'F');

    // item name — dimmed for NA
    setTxt(isNA ? C.text3 : C.text);
    doc.setFont('helvetica', isNA ? 'normal' : 'bold');
    doc.setFontSize(9);
    doc.text(item.name, ML + 6, y + 5.5);

    // part number / notes below name
    if (item.pn) {
      setTxt(C.text3);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      const pnText = item.pn.length > 55 ? item.pn.substring(0, 55) + '…' : item.pn;
      doc.text(pnText, ML + 6, y + 10);
    }

    // interval — show N/A text for non-serviceable
    const intLabel = isNA ? 'Non-serviceable' : isCustom
      ? (item.interval ? `Every ${(item.interval/1000).toFixed(0)}K` : 'One-time')
      : (item.severe ? `${(ivl(item)/1000).toFixed(0)}K` : `${(item.normal/1000).toFixed(0)}K`);
    setTxt(C.text3);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.text(intLabel, ML + 90, y + 5.5);

    // last done (skip for NA)
    if (!isNA) {
      if (rec.lastMiles) {
        setTxt(C.text2);
        doc.setFontSize(7.5);
        doc.text(`Done: ${rec.lastMiles.toLocaleString()} mi`, ML + 90, y + 10);
      }
      if (rec.lastDate) {
        setTxt(C.text3);
        doc.setFontSize(7);
        doc.text(rec.lastDate, ML + 118, y + 10);
      }
    }

    // status pill
    const pillW = 22, pillH = 5.5;
    const pillX = PW - MR - pillW;
    const pillY = y + (ROW_H - pillH) / 2;
    setFill([sc[0], sc[1], sc[2]].map(v => Math.min(255, v * 0.15 + 20)));
    doc.roundedRect(pillX, pillY, pillW, pillH, 1, 1, 'F');
    setTxt(sc);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.text(statusLabel(status), pillX + pillW / 2, pillY + 3.7, { align: 'center' });

    // remaining miles (skip for NA)
    if (!isNA && rem !== null) {
      const remText = rem <= 0 ? `-${Math.abs(rem).toLocaleString()} mi` : `${rem.toLocaleString()} mi`;
      setTxt(status === 'ok' ? C.text2 : sc);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.text(remText, pillX - 3, y + 5.5, { align: 'right' });
      setTxt(C.text3);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.text(rem <= 0 ? 'overdue' : 'remaining', pillX - 3, y + 10, { align: 'right' });
    }

    y += ROW_H + 1.5;
  }

  // ── RENDER GROUPS ─────────────────────────────────────────────
  const groups = [
    { title: 'Fluids',                  ids: 'fluids'  },
    { title: 'Filters & Spark Plugs',   ids: 'filters' },
    { title: 'Brakes, Belt & Rotation', ids: 'brakes'  },
  ];

  groups.forEach(g => {
    const items = ITEMS.filter(i => i.group === g.ids);
    drawSectionHeader(g.title);
    items.forEach(item => drawItemRow(item, false));
  });

  // custom items
  if (customItems.length > 0) {
    drawSectionHeader('Custom Items');
    customItems.forEach(item => drawItemRow(item, true));
  }

  // ── SERVICE HISTORY PAGE ──────────────────────────────────────
  const itemsWithHistory = [...ITEMS, ...customItems].filter(item => {
    const h = records[item.id]?.history;
    return Array.isArray(h) && h.length > 0;
  });

  if (itemsWithHistory.length > 0) {
    newPage();
    // accent bar
    setFill(C.accent);
    doc.rect(0, 0, PW, 1.5, 'F');

    setFill(C.surface);
    doc.rect(0, 1.5, PW, 18, 'F');
    setTxt(C.text);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('SERVICE HISTORY', ML, 15);
    setDraw(C.border);
    doc.setLineWidth(0.3);
    doc.line(0, 19.5, PW, 19.5);
    y = 28;

    itemsWithHistory.forEach(item => {
      const history = records[item.id].history;
      checkPage(10 + history.length * 7);
      drawSectionHeader(item.name);

      history.forEach((entry, idx) => {
        checkPage(8);
        setFill(idx % 2 === 0 ? C.surface : C.surface2);
        doc.roundedRect(ML, y, CW, 7, 0.5, 0.5, 'F');

        // index dot
        setFill(C.accent);
        doc.circle(ML + 4, y + 3.5, 1.5, 'F');
        setTxt(C.bg);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6);
        doc.text(String(history.length - idx), ML + 4, y + 4.2, { align: 'center' });

        setTxt(C.text);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.text(`${(entry.miles ?? 0).toLocaleString()} mi`, ML + 9, y + 4.5);

        if (entry.date) {
          setTxt(C.text2);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8);
          doc.text(entry.date, ML + 50, y + 4.5);
        }

        y += 8;
      });
      y += 3;
    });
  }

  // finalize footers on all pages
  const totalPages = doc.internal.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    drawPageFooter();
  }

  const date = new Date().toISOString().split('T')[0];
  doc.save(`tacoma-maintenance-${date}.pdf`);
}
