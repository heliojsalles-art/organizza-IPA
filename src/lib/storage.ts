// Generic localStorage helpers with JSON serialization

export function loadData<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function saveData<T>(key: string, data: T): void {
  localStorage.setItem(key, JSON.stringify(data));
}

export function exportAllData(): string {
  const keys = [
    'organizza-reminders',
    'organizza-lists',
    'organizza-finances',
    'organizza-categories',
  ];
  const data: Record<string, unknown> = {};
  keys.forEach((k) => {
    const raw = localStorage.getItem(k);
    if (raw) data[k] = JSON.parse(raw);
  });
  return JSON.stringify(data, null, 2);
}

export function importAllData(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString) as Record<string, unknown>;
    Object.entries(data).forEach(([key, value]) => {
      localStorage.setItem(key, JSON.stringify(value));
    });
    return true;
  } catch {
    return false;
  }
}
