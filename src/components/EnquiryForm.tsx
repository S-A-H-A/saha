import React, { useRef, useState } from "react";
import {
  AlertCircle,
  Camera,
  ExternalLink,
  Eye,
  EyeOff,
  Loader2,
  Search,
  SearchCheck,
} from "lucide-react";
import { resolveIvacCenter } from "../data/ivacData";
import { SearchHistoryEntry } from "../types/visa";
import { IconTile } from "./IconTile";

interface EnquiryFormProps {
  applicationId: string;
  passportNo: string;
  maskAppId: boolean;
  maskPassport: boolean;
  isSubmitting: boolean;
  recentSearches: SearchHistoryEntry[];
  onChangeAppId: (val: string) => void;
  onChangePassport: (val: string) => void;
  onToggleMaskAppId: () => void;
  onToggleMaskPassport: () => void;
  onSubmit: (appId?: string, passport?: string) => void;
}

export const EnquiryForm: React.FC<EnquiryFormProps> = ({
  applicationId,
  passportNo,
  maskAppId,
  maskPassport,
  isSubmitting,
  recentSearches,
  onChangeAppId,
  onChangePassport,
  onToggleMaskAppId,
  onToggleMaskPassport,
  onSubmit,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [scanning, setScanning] = useState(false);
  const [scanNotice, setScanNotice] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const detectedCenter = resolveIvacCenter(applicationId);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanApp = applicationId.trim().toUpperCase();
    const cleanPass = passportNo.trim().toUpperCase();

    if (cleanApp.length !== 12 || !/^[A-Z0-9]{12}$/.test(cleanApp)) {
      setValidationError(
        "Application ID must be exactly 12 alphanumeric characters (e.g., BGDD12345678)."
      );
      return;
    }
    if (
      cleanPass.length < 7 ||
      cleanPass.length > 14 ||
      !/^[A-Z0-9]+$/.test(cleanPass)
    ) {
      setValidationError(
        "Passport Number must be 7 to 14 alphanumeric characters (e.g., A01234567)."
      );
      return;
    }

    setValidationError(null);
    onSubmit(cleanApp, cleanPass);
  };

  const handleReceiptScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScanning(true);
    setScanNotice(null);
    setValidationError(null);

    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () =>
          reject(new Error("Could not read selected image."));
        reader.readAsDataURL(file);
      });

      const resp = await fetch("/api/scan-receipt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: dataUrl,
          mimeType: file.type || "image/jpeg",
        }),
      });
      const json = await resp.json();

      if (!resp.ok) {
        setScanNotice(json.error || "Could not extract details from receipt.");
      } else {
        let foundAny = false;
        if (json.application_id) {
          onChangeAppId(json.application_id.slice(0, 12));
          foundAny = true;
        }
        if (json.passport_no) {
          onChangePassport(json.passport_no.slice(0, 14));
          foundAny = true;
        }
        setScanNotice(
          foundAny
            ? "Credentials extracted from receipt. Verify and click Check Status."
            : "No Application ID or Passport Number detected in this image."
        );
      }
    } catch (err) {
      setScanNotice(
        err instanceof Error ? err.message : "Failed to scan receipt."
      );
    } finally {
      setScanning(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <section
      aria-label="Visa Status Enquiry Form"
      className="glass-panel p-5 sm:p-6 animate-rise"
    >
      <div
        className="mb-5 flex flex-col gap-3 border-b pb-4 sm:flex-row sm:items-center sm:justify-between"
        style={{ borderColor: "var(--line2)" }}
      >
        <div className="flex items-center gap-3.5">
          <IconTile hue="sky" size={44}>
            <SearchCheck className="h-5 w-5" />
          </IconTile>
          <div>
            <h2 className="font-display text-lg font-bold text-[var(--ink)]">
              Dual-Portal Status Enquiry
            </h2>
            <p className="text-xs text-[var(--mut)] sm:text-sm">
              Automatic verification across Indian Visa Online and IVAC
              Passtrack in real time.
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3 text-xs text-[var(--mut)]">
          <a
            href="https://indianvisaonline.gov.in/visa/StatusEnquiry"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-semibold hover:text-[var(--tx-info)] whitespace-nowrap"
          >
            Official Visa Portal
            <ExternalLink className="h-3 w-3" aria-hidden="true" />
          </a>
          <span aria-hidden="true">·</span>
          <a
            href="https://www.passtrack.net/regular_passport.php"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-semibold hover:text-[var(--tx-info)] whitespace-nowrap"
          >
            Official Passtrack
            <ExternalLink className="h-3 w-3" aria-hidden="true" />
          </a>
        </div>
      </div>

      <form onSubmit={handleFormSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-12 xl:items-start">
          {/* Application ID */}
          <div className="xl:col-span-5">
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <label
                htmlFor="applicationIdInput"
                className="text-xs font-bold text-[var(--mut)]"
              >
                Application ID (Web File Number)
              </label>
              <span className="font-mono text-[11px] font-semibold tabular-nums text-[var(--mut2)]">
                {applicationId.length}/12
              </span>
            </div>
            <div className="relative">
              <input
                id="applicationIdInput"
                type={maskAppId ? "password" : "text"}
                value={applicationId}
                onChange={(e) => {
                  setValidationError(null);
                  onChangeAppId(
                    e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "")
                  );
                }}
                maxLength={12}
                placeholder="e.g., BGDD01234567"
                autoComplete="off"
                disabled={isSubmitting}
                className="glass-input h-12 w-full px-3.5 pr-11 font-mono text-sm uppercase tracking-wider disabled:opacity-60"
              />
              <button
                type="button"
                onClick={onToggleMaskAppId}
                aria-label={
                  maskAppId ? "Show Application ID" : "Hide Application ID"
                }
                title={
                  maskAppId ? "Show Application ID" : "Hide Application ID"
                }
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-[var(--mut)] hover:text-[var(--ink)] cursor-pointer"
              >
                {maskAppId ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            <div className="mt-1.5 min-h-[18px] text-xs text-[var(--mut)]">
              {detectedCenter ? (
                <span>
                  {detectedCenter.name} <span aria-hidden="true">·</span> Prefix{" "}
                  <span className="font-mono font-semibold text-[var(--tx-info)]">
                    {detectedCenter.prefix}
                  </span>
                </span>
              ) : (
                <span>12-character Web File ID from your IVAC receipt</span>
              )}
            </div>
          </div>

          {/* Passport Number */}
          <div className="xl:col-span-4">
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <label
                htmlFor="passportNoInput"
                className="text-xs font-bold text-[var(--mut)]"
              >
                Passport Number
              </label>
              <span className="font-mono text-[11px] font-semibold tabular-nums text-[var(--mut2)]">
                {passportNo.length}/9+
              </span>
            </div>
            <div className="relative">
              <input
                id="passportNoInput"
                type={maskPassport ? "password" : "text"}
                value={passportNo}
                onChange={(e) => {
                  setValidationError(null);
                  onChangePassport(
                    e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "")
                  );
                }}
                maxLength={14}
                placeholder="e.g., A01234567"
                autoComplete="off"
                disabled={isSubmitting}
                className="glass-input h-12 w-full px-3.5 pr-11 font-mono text-sm uppercase tracking-wider disabled:opacity-60"
              />
              <button
                type="button"
                onClick={onToggleMaskPassport}
                aria-label={
                  maskPassport ? "Show Passport Number" : "Hide Passport Number"
                }
                title={
                  maskPassport ? "Show Passport Number" : "Hide Passport Number"
                }
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-[var(--mut)] hover:text-[var(--ink)] cursor-pointer"
              >
                {maskPassport ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            <div className="mt-1.5 min-h-[18px] text-xs text-[var(--mut)]">
              Current passport number submitted with application
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-end gap-2.5 md:col-span-2 md:pt-1 xl:col-span-3 xl:pt-[22px]">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleReceiptScan}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isSubmitting || scanning}
              title="Scan IVAC receipt photo to autofill"
              className="btn-glass-ghost inline-flex h-12 items-center justify-center gap-1.5 rounded-2xl px-4 text-xs font-bold disabled:opacity-50 whitespace-nowrap shrink-0 cursor-pointer"
            >
              {scanning ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Camera className="h-4 w-4" />
              )}
              <span>Scan Receipt</span>
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-glass-primary inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl px-5 text-sm font-bold disabled:opacity-60 whitespace-nowrap shrink-0 cursor-pointer md:flex-initial md:min-w-[180px] xl:flex-1 xl:min-w-0"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Checking</span>
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  <span>Check Status</span>
                </>
              )}
            </button>
          </div>
        </div>

        {validationError && (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-2xl border px-4 py-3 text-xs font-semibold"
            style={{
              background: "rgba(var(--c-rose), 0.12)",
              borderColor: "rgba(var(--c-rose), 0.45)",
              color: "var(--tx-neg)",
            }}
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {scanNotice && (
          <div
            className="rounded-2xl border px-4 py-3 text-xs font-semibold"
            style={{
              background: "rgba(var(--c-sky), 0.12)",
              borderColor: "rgba(var(--c-sky), 0.42)",
              color: "var(--tx-info)",
            }}
          >
            {scanNotice}
          </div>
        )}
      </form>

      {recentSearches.length > 0 && (
        <div
          className="mt-5 border-t pt-4"
          style={{ borderColor: "var(--line2)" }}
        >
          <div className="mb-2.5 text-xs font-bold text-[var(--mut)]">
            Recent Enquiries
          </div>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
            {recentSearches.slice(0, 4).map((entry) => (
              <button
                key={entry.id}
                type="button"
                disabled={isSubmitting}
                onClick={() => {
                  onChangeAppId(entry.application_id);
                  onChangePassport(entry.passport_no);
                  onSubmit(entry.application_id, entry.passport_no);
                }}
                className="btn-glass-ghost flex w-full flex-col items-start gap-1 rounded-xl px-3.5 py-2.5 text-left text-xs disabled:opacity-50 cursor-pointer"
              >
                <div className="flex w-full items-center justify-between gap-2">
                  <span className="font-mono font-bold text-[var(--tx-info)]">
                    {maskAppId
                      ? `${entry.application_id.slice(0, 4)}••••••••`
                      : entry.application_id}
                  </span>
                  {entry.visa_label && (
                    <span className="truncate text-[11px] font-semibold text-[var(--mut)]">
                      {entry.visa_label}
                    </span>
                  )}
                </div>
                {entry.applicant_name && (
                  <span className="w-full truncate font-medium text-[var(--ink)]">
                    {entry.applicant_name}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
