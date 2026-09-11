import { describe, expect, it } from "vitest";
import { beginPreviewFade } from "@/lib/qr-preview-transition";

class FakeElement {
  style: Record<string, string> = {};
  parent: FakeContainer | null = null;

  remove() {
    if (!this.parent) return;
    this.parent.children = this.parent.children.filter((child) => child !== this);
    this.parent = null;
  }
}

class FakeContainer {
  style: Record<string, string> = {};
  children: FakeElement[] = [];

  get lastElementChild() {
    return this.children.at(-1) ?? null;
  }

  appendChild(child: FakeElement) {
    child.parent = this;
    this.children.push(child);
    return child;
  }

  replaceChildren(...children: FakeElement[]) {
    this.children.forEach((child) => {
      child.parent = null;
    });
    this.children = children;
    children.forEach((child) => {
      child.parent = this;
    });
  }
}

describe("beginPreviewFade", () => {
  it("hides the preview until the complete next frame fades in", () => {
    const prior = new FakeElement();
    const next = new FakeElement();
    const container = new FakeContainer();
    container.appendChild(prior);

    let runFrame = () => {};
    const transition = beginPreviewFade(
      container as unknown as HTMLElement,
      false,
      {
        requestFrame(callback) {
          runFrame = callback;
          return 1;
        },
        cancelFrame() {},
      },
    );

    expect(container.children).toEqual([prior]);
    expect(container.style.opacity).toBe("0");

    transition.commit(next as unknown as HTMLElement);
    expect(container.children).toEqual([next]);
    expect(container.style.opacity).toBe("0");

    runFrame();
    expect(container.style.opacity).toBe("1");
  });

  it("replaces the frame without motion when reduced motion is active", () => {
    const prior = new FakeElement();
    const next = new FakeElement();
    const container = new FakeContainer();
    container.appendChild(prior);

    const transition = beginPreviewFade(
      container as unknown as HTMLElement,
      true,
    );
    transition.commit(next as unknown as HTMLElement);

    expect(container.children).toEqual([next]);
    expect(container.style.opacity).toBe("1");
  });
});
