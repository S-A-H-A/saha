import { VisaCheckResponse } from "../types/visa";
import { resolveIvacCenter } from "../data/ivacData";

interface ExportCardOptions {
  result: VisaCheckResponse;
  maskAppId: boolean;
  maskPassport: boolean;
  maskName: boolean;
  submissionDate?: string;
}

function maskString(val: string, keepStart = 0): string {
  if (!val) return "••••••••";
  if (keepStart > 0 && val.length > keepStart) {
    return val.slice(0, keepStart) + "•".repeat(val.length - keepStart);
  }
  return val.replace(/[A-Za-z0-9]/g, "•");
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export function downloadStatusCardPng({
  result,
  maskAppId,
  maskPassport,
  maskName,
  submissionDate,
}: ExportCardOptions) {
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 675;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // Crisp slate-navy architectural background
  ctx.fillStyle = "#0F172A";
  ctx.fillRect(0, 0, 1200, 675);

  // Subtle inner card canvas
  ctx.fillStyle = "#FFFFFF";
  ctx.beginPath();
  ctx.roundRect(32, 32, 1136, 611, 16);
  ctx.fill();

  // Top header band
  ctx.fillStyle = "#F8FAFC";
  ctx.beginPath();
  ctx.roundRect(32, 32, 1136, 92, [16, 16, 0, 0]);
  ctx.fill();

  ctx.strokeStyle = "#E2E8F0";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(32, 124);
  ctx.lineTo(1168, 124);
  ctx.stroke();

  // Brand title & timestamp
  ctx.fillStyle = "#0F172A";
  ctx.font = "700 28px Outfit, system-ui, sans-serif";
  ctx.fillText("IndiaVisa Track", 64, 82);

  const center = resolveIvacCenter(result.application_id);
  ctx.fillStyle = "#475569";
  ctx.font = "500 15px 'Plus Jakarta Sans', system-ui, sans-serif";
  ctx.fillText(
    `${center ? center.name : "Indian Visa & IVAC Verification"} · ${new Date(result.checked_at).toLocaleString()}`,
    64,
    106
  );

  // Credential strip
  const appIdDisplay = maskAppId
    ? maskString(result.application_id, 4)
    : result.application_id;
  const passportDisplay = maskPassport
    ? maskString(result.passport_no, 2)
    : result.passport_no;
  const nameRaw =
    result.passtrack.applicant_name &&
    result.passtrack.applicant_name !== "Unknown"
      ? result.passtrack.applicant_name
      : "Not Available";
  const nameDisplay = maskName ? maskString(nameRaw) : nameRaw;

  const metaItems = [
    { label: "APPLICATION ID", value: appIdDisplay },
    { label: "PASSPORT NO", value: passportDisplay },
    { label: "APPLICANT NAME", value: nameDisplay },
    {
      label: submissionDate ? "SUBMISSION DATE" : "CENTER",
      value: submissionDate || (center ? center.shortName : "IVAC"),
    },
  ];

  metaItems.forEach((item, idx) => {
    const x = 64 + idx * 272;
    ctx.fillStyle = "#64748B";
    ctx.font = "600 11px 'JetBrains Mono', monospace";
    ctx.fillText(item.label, x, 164);

    ctx.fillStyle = "#0F172A";
    ctx.font = "600 18px 'JetBrains Mono', monospace";
    ctx.fillText(item.value.slice(0, 22), x, 190);
  });

  // Divider
  ctx.strokeStyle = "#E2E8F0";
  ctx.beginPath();
  ctx.moveTo(64, 214);
  ctx.lineTo(1136, 214);
  ctx.stroke();

  // Left section: Visa Portal Status
  const category = result.visa_portal.category;
  const accentMap: Record<string, { fg: string; bg: string }> = {
    processed_printed: { fg: "#15803D", bg: "#F0FDF4" },
    granted_not_printed: { fg: "#15803D", bg: "#F0FDF4" },
    under_processing: { fg: "#B45309", bg: "#FFFBEB" },
    attention_required: { fg: "#B91C1C", bg: "#FEF2F2" },
    closed: { fg: "#B91C1C", bg: "#FEF2F2" },
    not_found: { fg: "#1D4ED8", bg: "#EFF6FF" },
  };
  const colors = accentMap[category || ""] || { fg: "#1D4ED8", bg: "#EFF6FF" };

  ctx.fillStyle = colors.bg;
  ctx.strokeStyle = "#CBD5E1";
  ctx.beginPath();
  ctx.roundRect(64, 238, 520, 310, 12);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#475569";
  ctx.font = "600 13px 'Plus Jakarta Sans', system-ui, sans-serif";
  ctx.fillText("INDIAN VISA ONLINE PORTAL", 88, 274);

  ctx.fillStyle = colors.fg;
  ctx.font = "700 24px Outfit, system-ui, sans-serif";
  ctx.fillText(result.visa_portal.label || "Status Retrieved", 88, 312);

  ctx.fillStyle = "#1E293B";
  ctx.font = "500 16px 'Plus Jakarta Sans', system-ui, sans-serif";
  const msgLines = wrapText(ctx, result.visa_portal.message, 468);
  msgLines.slice(0, 7).forEach((line, i) => {
    ctx.fillText(line, 88, 354 + i * 26);
  });

  // Right section: IVAC Passtrack Delivery
  ctx.fillStyle = "#F8FAFC";
  ctx.strokeStyle = "#CBD5E1";
  ctx.beginPath();
  ctx.roundRect(616, 238, 520, 310, 12);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#475569";
  ctx.font = "600 13px 'Plus Jakarta Sans', system-ui, sans-serif";
  ctx.fillText("IVAC PASSTRACK DELIVERY", 640, 274);

  const rows =
    result.passtrack.table.length > 1 ? result.passtrack.table.slice(1) : [];
  const doneCount = rows.filter(
    (r) => r[2] && r[2].toLowerCase().includes("done")
  ).length;
  const pct = rows.length > 0 ? Math.round((doneCount / rows.length) * 100) : 0;

  ctx.fillStyle = "#0F172A";
  ctx.font = "700 24px Outfit, system-ui, sans-serif";
  ctx.fillText(
    rows.length > 0 ? `${pct}% Complete (${doneCount}/${rows.length} Steps)` : "Delivery Timeline",
    640,
    312
  );

  if (rows.length > 0) {
    rows.slice(0, 5).forEach((row, idx) => {
      const y = 356 + idx * 36;
      const isDone = row[2] && row[2].toLowerCase().includes("done");
      ctx.fillStyle = isDone ? "#15803D" : "#64748B";
      ctx.font = "700 13px 'JetBrains Mono', monospace";
      ctx.fillText(isDone ? "[DONE]" : "[WAIT]", 640, y);

      ctx.fillStyle = "#0F172A";
      ctx.font = "500 15px 'Plus Jakarta Sans', system-ui, sans-serif";
      ctx.fillText((row[1] || row[0] || "").slice(0, 42), 710, y);
    });
  } else {
    ctx.fillStyle = "#475569";
    ctx.font = "500 15px 'Plus Jakarta Sans', system-ui, sans-serif";
    const ptLines = wrapText(
      ctx,
      result.passtrack.message || "Delivery tracking steps not available yet.",
      468
    );
    ptLines.slice(0, 5).forEach((line, i) => {
      ctx.fillText(line, 640, 356 + i * 26);
    });
  }

  // Footer
  ctx.fillStyle = "#64748B";
  ctx.font = "500 13px 'Plus Jakarta Sans', system-ui, sans-serif";
  ctx.fillText(
    "Live dual-portal verification from indianvisaonline.gov.in & passtrack.net",
    64,
    608
  );

  const link = document.createElement("a");
  link.download = `IndiaVisa_${maskAppId ? "Status" : result.application_id}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}
