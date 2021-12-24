import addImage from "./addImage";
import Model from "./Model/Model";
import move from "./move";
import View from "./View/View";

export default class Gallery {
  private model: Model;
  private view: View;

  private lastTime = Date.now();

  private lastX = 0;

  private keyPressedMap: any = {
    KeyH: "left",
    KeyL: "right",
    ArrowLeft: "left",
    ArrowRight: "right"
  };

  public constructor(elementId: string) {
    this.model = {
      urls: [],
      descriptions: [],
      cursor: 0,
      direction: "left"
    }

    this.view = new View(elementId);
  }

  public addImage(url: string, description?: string) {
    const model = addImage(this.model, url, description);
    this.view.update(model);
    this.model = model;
  }

  public display() {
    document.onkeydown = (event) => {
      const direction = this.keyPressedMap[event.code];
      if (!!direction) {
        this.move(direction);
      }
    };

    document.ontouchstart = (event: TouchEvent) => this.lock(this.unifyTouchEvent(event));
    document.ontouchend = (event: TouchEvent) => this.release(this.unifyTouchEvent(event));

    this.view.on("selected", (target) => {
      const length = target - this.model.cursor;
      if (length != 0) {
        const direction: "right" | "left" = length > 0 ? "right" : "left";
        const model = {
          cursor: target,
          urls: this.model.urls.slice(0),
          descriptions: this.model.descriptions.slice(0),
          direction
        };
        this.view.update(model);
        this.model = model;
      }
    });
  }

  private move(direction: "left" | "right") {
    if ((Date.now() - this.lastTime) < 1000) {
      return;
    }
    this.lastTime = Date.now();
    const model = move(this.model, direction);
    this.view.update(model);
    this.model = model;
  }

  private unifyTouchEvent(event: TouchEvent | Touch): Touch {
    return (event as TouchEvent).changedTouches ? (event as TouchEvent).changedTouches[0] as Touch : event as Touch
  }

  private lock(event: Touch) {
    this.lastX = event.clientX;
  }

  private release(event: Touch) {
    const dx = this.lastX - event.clientX;
    if (Math.abs(dx) > window.innerWidth/3) {
      const sign = Math.sign(dx);
      this.move(dx > 0 ? "right" : "left");
    }
  }
}
