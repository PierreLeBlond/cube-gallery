import Model from "./Model/Model";

export default function addImage(model: Model, url: string, description: string): Model {
  return {
    cursor: model.cursor,
    urls: model.urls.concat(url),
    descriptions: model.descriptions.concat(description),
    direction: model.direction
  }
}
