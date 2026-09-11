interface PreviewScheduler {
  requestFrame(callback: () => void): number;
  cancelFrame(id: number): void;
}

const browserScheduler: PreviewScheduler = {
  requestFrame: (callback) => window.requestAnimationFrame(callback),
  cancelFrame: (id) => window.cancelAnimationFrame(id),
};

export function beginPreviewFade(
  container: HTMLElement,
  reducedMotion: boolean,
  scheduler: PreviewScheduler = browserScheduler,
) {
  let frameId: number | null = null;

  if (reducedMotion) {
    container.style.opacity = "1";
  } else {
    container.style.opacity = "0";
  }

  return {
    commit(nextFrame: HTMLElement) {
      container.replaceChildren(nextFrame);
      if (reducedMotion) return;

      frameId = scheduler.requestFrame(() => {
        frameId = null;
        container.style.opacity = "1";
      });
    },
    cancel(restore = false) {
      if (frameId !== null) {
        scheduler.cancelFrame(frameId);
        frameId = null;
      }
      if (restore) container.style.opacity = "1";
    },
  };
}
