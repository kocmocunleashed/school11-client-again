type FrameScheduler = {
  request: (callback: (now: number) => void) => number;
  cancel: (id: number) => void;
};

/** No scheduled frames while off-screen, hidden, paused, or disposed. */
export function createVisibleAnimation(
  tick: (elapsed: number) => boolean,
  onStart: () => void,
  scheduler: FrameScheduler = {
    request: callback => window.requestAnimationFrame(callback),
    cancel: id => window.cancelAnimationFrame(id),
  },
) {
  let inView = false;
  let documentVisible = true;
  let paused = false;
  let disposed = false;
  let frame: number | null = null;
  let previous: number | null = null;
  const active = () => inView && documentVisible && !paused && !disposed;
  const update = () => {
    if (!active()) {
      if (frame !== null) scheduler.cancel(frame);
      frame = null;
      previous = null;
    } else if (frame === null) {
      previous = null;
      onStart();
      frame = scheduler.request(run);
    }
  };
  function run(now: number) {
    frame = null;
    if (!active()) return;
    const elapsed = previous === null ? 0 : Math.min(now - previous, 48);
    previous = now;
    if (!tick(elapsed)) { disposed = true; return; }
    if (active()) frame = scheduler.request(run);
  }
  return {
    setInView: (value: boolean) => { inView = value; update(); },
    setDocumentVisible: (value: boolean) => { documentVisible = value; update(); },
    setPaused: (value: boolean) => { paused = value; update(); },
    dispose: () => { disposed = true; update(); },
  };
}
