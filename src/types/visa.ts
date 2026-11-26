export type VisaStatusCategory =
  | "processed_printed"
  | "granted_not_printed"
  | "under_processing"
  | "attention_required"
  | "closed"
  | "not_found"
  | "unknown";

export type GlassThemeId =
  | "light"
  | "dark"
  | "sunrise"
  | "ocean"
  | "neon"
  | "forest";

export interface VisaPortalResult {
  status: "success" | "error";
  message: string;
  category?: VisaStatusCategory;
  label?: string;
}

export interface PasstrackResult {
  status: "success" | "not-found" | "error";
  applicant_name: string;
  table: string[][];
  message?: string;
}

export interface VisaCheckResponse {
  status: "success" | "error";
  application_id: string;
  passport_no: string;
  checked_at: string;
  elapsed_ms: number;
  visa_portal: VisaPortalResult;
  passtrack: PasstrackResult;
}

export interface PipelineStepState {
  step: number;
  title: string;
  detail: string;
  state: "pending" | "active" | "completed";
  elapsedMs?: number;
}

export interface PendingCaptchaPrompt {
  application_id: string;
  passport_no: string;
  reason: string;
  captchas: {
    visa?: { sessionId: string; imageDataUrl: string };
    passtrack?: { sessionId: string; imageDataUrl: string };
  };
  partial: {
    visa_portal: VisaPortalResult | null;
    passtrack: PasstrackResult | null;
  };
}

export interface IvacCenterInfo {
  prefix: string;
  name: string;
  shortName: string;
  city: string;
  division: string;
  address: string;
  hours: string;
}

export interface SearchHistoryEntry {
  id: string;
  application_id: string;
  passport_no: string;
  applicant_name?: string;
  submission_date?: string;
  last_checked_at: string;
  visa_category?: VisaStatusCategory;
  visa_label?: string;
  visa_message?: string;
  passtrack_progress_pct?: number;
  latest_delivery_step?: string;
  auto_watch?: boolean;
}
