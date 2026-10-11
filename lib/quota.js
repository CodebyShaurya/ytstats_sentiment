// Daily Search Quota Manager (LocalStorage)
// Fast search: 3 per day
// Balanced search: 2 per day
// Deep search: 1 per day

export const DAILY_LIMITS = {
  fast: 3,
  balanced: 2,
  deep: 1,
};

export const ACCURACY_TO_MODE = {
  low: "fast",
  medium: "balanced",
  high: "deep",
};

export const SLIDER_TO_MODE = {
  1: "fast",
  2: "balanced",
  3: "deep",
};

export function getTodayString() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const STORAGE_KEY = "yt_sentiment_daily_quota_v1";

export function getQuotaData() {
  if (typeof window === "undefined") {
    return {
      date: "2026-10-11",
      used: { fast: 0, balanced: 0, deep: 0 },
    };
  }

  const todayStr = getTodayString();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.date === todayStr && parsed.used) {
        return parsed;
      }
    }
  } catch (err) {
    console.error("Failed to parse daily quota from localStorage:", err);
  }

  // Initialize fresh for today
  const initial = {
    date: todayStr,
    used: { fast: 0, balanced: 0, deep: 0 },
  };

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
  } catch (err) {
    console.error("Failed to save daily quota to localStorage:", err);
  }

  return initial;
}

export function getRemainingQuota(modeKey) {
  const data = getQuotaData();
  const used = (data.used && data.used[modeKey]) || 0;
  const limit = DAILY_LIMITS[modeKey] || 1;
  return Math.max(0, limit - used);
}

export function getAllRemainingQuotas() {
  const data = getQuotaData();
  return {
    fast: Math.max(0, DAILY_LIMITS.fast - ((data.used && data.used.fast) || 0)),
    balanced: Math.max(0, DAILY_LIMITS.balanced - ((data.used && data.used.balanced) || 0)),
    deep: Math.max(0, DAILY_LIMITS.deep - ((data.used && data.used.deep) || 0)),
  };
}

export function canSearch(modeKey) {
  return getRemainingQuota(modeKey) > 0;
}

export function recordSearchUsage(modeKey) {
  if (typeof window === "undefined") return;
  const data = getQuotaData();
  if (!data.used) data.used = { fast: 0, balanced: 0, deep: 0 };
  data.used[modeKey] = (data.used[modeKey] || 0) + 1;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error("Failed to update daily quota in localStorage:", err);
  }
  return getAllRemainingQuotas();
}
