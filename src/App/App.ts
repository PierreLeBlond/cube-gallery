import Gallery from "../Gallery/Gallery";

export default class App {
  private gallery: Gallery;

  public constructor(elementId: string) {
    this.gallery = new Gallery(elementId);
  }

  public display() {
    this.gallery.display();
  }

  public addImage(url: string, description?: string) {
    this.gallery.addImage(url, description);
  }
}
