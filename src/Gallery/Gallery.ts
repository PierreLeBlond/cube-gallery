import addImage from "./addImage";
import Model from "./Model/Model";
import move from "./move";
import View from "./View/View";

export default class Gallery {
  private model: Model;
  private view: View;

  private keyPressedMap: any = {
    KeyH: "left",
    KeyL: "right"
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
    document.addEventListener('keypress', (event) => {
      const direction = this.keyPressedMap[event.code];
      if (!!direction) {
        const model = move(this.model, direction);
        this.view.update(model);
        this.model = model;
      }
    });

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
}
