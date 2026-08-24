const PREFIX = "fitbuddy.";

function key(name) {
  return PREFIX + name;
}

export function read(name, fallback = null) {
  try {
    const raw = localStorage.getItem(key(name));
    if (raw == null) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function write(name, value) {
  localStorage.setItem(key(name), JSON.stringify(value));
}

export function remove(name) {
  localStorage.removeItem(key(name));
}
