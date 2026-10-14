import { expect, test } from "bun:test";
import { createVisibleAnimation } from "../src/lib/visible-animation";

function fixture() {
  let id = 0;
  const queue = new Map<number, (now: number) => void>();
  const elapsed: number[] = [];
  let starts = 0;
  const animation = createVisibleAnimation(delta => { elapsed.push(delta); return true; }, () => { starts++; }, {
    request: callback => { queue.set(++id, callback); return id; },
    cancel: key => { queue.delete(key); },
  });
  const step = (time: number) => {
    const entry = queue.entries().next().value;
    if (entry) { queue.delete(entry[0]); entry[1](time); }
  };
  return { animation, queue, elapsed, step, starts: () => starts };
}

test("no frames are scheduled off-screen; visible animation schedules one at a time", () => {
  const f = fixture();
  expect(f.queue.size).toBe(0);
  f.animation.setInView(true);
  f.animation.setInView(true);
  expect(f.queue.size).toBe(1);
  f.step(100); f.step(116);
  expect(f.elapsed).toEqual([0, 16]);
  expect(f.queue.size).toBe(1);
  f.animation.setInView(false);
  expect(f.queue.size).toBe(0);
});

test("hidden tabs and hover/focus pauses cancel frames and resume without a time jump", () => {
  const f = fixture();
  f.animation.setInView(true); f.step(100);
  f.animation.setDocumentVisible(false);
  expect(f.queue.size).toBe(0);
  f.animation.setPaused(true); f.animation.setDocumentVisible(true);
  expect(f.queue.size).toBe(0);
  f.animation.setPaused(false);
  f.step(10000);
  expect(f.elapsed).toEqual([0, 0]);
  expect(f.starts()).toBe(2);
  f.animation.setPaused(true);
  expect(f.queue.size).toBe(0);
});

test("cleanup never restarts, and large elapsed frames remain capped", () => {
  const f = fixture();
  f.animation.setInView(true); f.step(100); f.step(1000);
  expect(f.elapsed).toEqual([0, 48]);
  f.animation.dispose();
  expect(f.queue.size).toBe(0);
  f.animation.setInView(true); f.animation.setPaused(false);
  expect(f.queue.size).toBe(0);
});

test("default scheduler keeps the window receiver required by native browser methods", () => {
  const previousWindow = globalThis.window;
  let queued = false;
  const browser = {
    requestAnimationFrame(this: unknown) {
      expect(this).toBe(browser);
      queued = true;
      return 1;
    },
    cancelAnimationFrame(this: unknown) {
      expect(this).toBe(browser);
      queued = false;
    },
  };
  try {
    globalThis.window = browser as unknown as Window & typeof globalThis;
    const animation = createVisibleAnimation(() => true, () => {});
    animation.setInView(true);
    expect(queued).toBe(true);
    animation.setInView(false);
    expect(queued).toBe(false);
  } finally {
    if (previousWindow) globalThis.window = previousWindow;
    else Reflect.deleteProperty(globalThis, "window");
  }
});

test("reaching the end stops scheduling even if visibility changes afterward", () => {
  const queue = new Map<number, (now: number) => void>();
  const animation = createVisibleAnimation(() => false, () => {}, {
    request: callback => { queue.set(1, callback); return 1; },
    cancel: id => { queue.delete(id); },
  });
  animation.setInView(true);
  const callback = queue.get(1)!;
  queue.clear(); callback(100);
  expect(queue.size).toBe(0);
  animation.setInView(false); animation.setInView(true);
  expect(queue.size).toBe(0);
});
