import "@testing-library/jest-dom/vitest";

class ResizeObserverMock {
  observe() {}

  unobserve() {}

  disconnect() {}
}

globalThis.ResizeObserver = ResizeObserverMock;

if (typeof globalThis.PointerEvent === "undefined") {
  globalThis.PointerEvent = class PointerEvent extends MouseEvent {};
}

if (!Element.prototype.hasPointerCapture) {
  Element.prototype.hasPointerCapture = () => false;
}
if (!Element.prototype.setPointerCapture) {
  Element.prototype.setPointerCapture = () => {};
}
if (!Element.prototype.releasePointerCapture) {
  Element.prototype.releasePointerCapture = () => {};
}
if (!HTMLElement.prototype.scrollIntoView) {
  HTMLElement.prototype.scrollIntoView = () => {};
}

function createMemoryStorage() {
  const store = new Map();
  return {
    getItem: (key) => (store.has(String(key)) ? store.get(String(key)) : null),
    setItem: (key, value) => {
      store.set(String(key), String(value));
    },
    removeItem: (key) => {
      store.delete(String(key));
    },
    clear: () => {
      store.clear();
    },
    key: (index) => [...store.keys()][index] ?? null,
    get length() {
      return store.size;
    },
  };
}

const memoryStorage = createMemoryStorage();

function installLocalStorage(target) {
  try {
    if (typeof target.localStorage?.clear === "function") return;
  } catch {
    // Node 25 expõe window.localStorage sem implementação até --localstorage-file.
  }
  try {
    Object.defineProperty(target, "localStorage", {
      configurable: true,
      value: memoryStorage,
    });
  } catch {
    try {
      target.localStorage = memoryStorage;
    } catch {
      // jsdom já definiu um storage utilizável
    }
  }
}

installLocalStorage(window);
installLocalStorage(globalThis);
