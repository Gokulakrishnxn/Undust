import { Component, type ReactNode } from "react";
export class ErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <main className="error-recovery">
        <span className="wordmark">undust</span>
        <h1>Let’s take a fresh look.</h1>
        <p>Something interrupted the interface. Reload to try again.</p>
        <p className="muted">
          If an operation was in progress, inspect Trash before retrying.
        </p>
        <button
          className="recovery-button"
          onClick={() => window.location.reload()}
        >
          Reload Undust
        </button>
      </main>
    ) : (
      this.props.children
    );
  }
}
