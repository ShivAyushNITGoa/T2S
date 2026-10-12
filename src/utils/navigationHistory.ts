type BackHandler = () => void;

interface StackEntry {
  id: string;
  onBack: BackHandler;
}

class NavigationHistoryManager {
  private stack: StackEntry[] = [];
  private listeners = new Set<() => void>();
  private isHandlingPop = false;
  private isProgrammaticBack = false;
  private initialized = false;

  private notify() {
    this.listeners.forEach((fn) => fn());
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public init() {
    if (this.initialized || typeof window === 'undefined') return;
    this.initialized = true;

    try {
      window.history.replaceState({ t2sBase: true }, '');
    } catch {}

    window.addEventListener('popstate', () => {
      if (this.isProgrammaticBack) {
        this.isProgrammaticBack = false;
        this.notify();
        return;
      }

      if (this.stack.length > 0) {
        this.isHandlingPop = true;
        const top = this.stack.pop()!;
        try {
          top.onBack();
        } finally {
          this.isHandlingPop = false;
          this.notify();
        }
      } else {
        try {
          window.history.pushState({ t2sBase: true }, '');
        } catch {}
        this.notify();
      }
    });
  }

  public push(id: string, onBack: BackHandler) {
    this.init();
    if (this.isHandlingPop) return;

    const existingIdx = this.stack.findIndex((e) => e.id === id);
    if (existingIdx !== -1) {
      this.stack[existingIdx].onBack = onBack;
      this.notify();
      return;
    }

    this.stack.push({ id, onBack });
    try {
      window.history.pushState({ t2sEntry: id, depth: this.stack.length }, '');
    } catch {}
    this.notify();
  }

  public remove(id: string) {
    if (this.isHandlingPop) return;

    const idx = this.stack.findIndex((e) => e.id === id);
    if (idx === -1) return;

    const isTop = idx === this.stack.length - 1;
    this.stack.splice(idx, 1);

    if (isTop && typeof window !== 'undefined') {
      this.isProgrammaticBack = true;
      try {
        window.history.back();
      } catch {
        this.isProgrammaticBack = false;
      }
    }
    this.notify();
  }

  public goBack(): boolean {
    this.init();
    if (this.stack.length > 0) {
      this.isHandlingPop = true;
      const top = this.stack.pop()!;
      try {
        top.onBack();
      } finally {
        this.isHandlingPop = false;
      }
      this.isProgrammaticBack = true;
      try {
        window.history.back();
      } catch {
        this.isProgrammaticBack = false;
      }
      this.notify();
      return true;
    }
    return false;
  }

  public getDepth(): number {
    return this.stack.length;
  }
}

export const navHistory = new NavigationHistoryManager();
