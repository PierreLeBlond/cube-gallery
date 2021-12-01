import Model from "./Model/Model";

export default function addImage(model: Model, url: string): Model {
  return {
    cursor: model.cursor,
    urls: model.urls.concat(url),
    direction: model.direction
  }
}
