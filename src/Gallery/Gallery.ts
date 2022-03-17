import addImage from './addImage';
import Model from './Model/Model';
import move from './move';
import View from './View/View';

export default class Gallery {
  private model: Model;
  private view: View;

  private lastTime = Date.now();

  private isLocked = false;
  private lastX = 0;

  private keyPressedMap: any =
      {KeyH: 'left', KeyL: 'right', ArrowLeft: 'left', ArrowRight: 'right'};

  public constructor(elementId: string) {
    this.model = {
      urls: [],
      descriptions: [],
      cursor: 0,
      direction: 'left'
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
        this.jumpTo(direction);
      }
    };

    // document.onmousemove = (event: MouseEvent) => this.move(event.clientX);
    // document.onmousedown = (event: MouseEvent) => this.lock(event.clientX);
    // document.onmouseup = (event: MouseEvent) => this.release(event.clientX);

    document.ontouchmove = (event: TouchEvent) =>
        this.move(this.unifyTouchEvent(event));
    document.ontouchstart = (event: TouchEvent) =>
        this.lock(this.unifyTouchEvent(event));
    document.ontouchend = (event: TouchEvent) =>
        this.release(this.unifyTouchEvent(event));

    this.view.on('selected', (target) => {
      const length = target - this.model.cursor;
      if (length != 0) {
        const direction: 'right'|'left' = length > 0 ? 'right' : 'left';
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

  private jumpTo(direction: 'left'|'right') {
    if ((Date.now() - this.lastTime) < 1000) {
      return;
    }
    this.lastTime = Date.now();
    const model = move(this.model, direction);
    this.view.update(model);
    this.model = model;
  }

  private unifyTouchEvent(event: TouchEvent|Touch): number {
    return (event as TouchEvent).changedTouches ?
        (event as TouchEvent).changedTouches[0].clientX :
        (event as Touch).clientX
  }

  private move(clientX: number) {
    if (this.isLocked) {
      const offset = clientX - this.lastX;
      this.view.drag(offset);
    }
  }

  private lock(clientX: number) {
    this.isLocked = true;
    this.view.preventAnimations();
    this.lastX = clientX;
  }

  private release(clientX: number) {
    const width = this.view.element.clientWidth;
    const offset = (this.lastX - clientX) / width;
    if (Math.abs(offset) > 0.3) {
      this.jumpTo(offset > 0 ? 'right' : 'left');
    } else {
      this.view.release();
    }
    this.view.allowAnimations();
    this.isLocked = false;
  }
}
