import Model from './Model/Model';

const mod = (n: number, m: number) => ((n % m) + m) % m;

const directionToIncrement: any = {
  right: 1,
  left: -1
};

export default function move(model: Model, direction: 'left'|'right'): Model {
  let cursor = model.cursor + directionToIncrement[direction];
  cursor = mod(cursor, model.urls.length);
  console.log(cursor);
  return {
    cursor, urls: model.urls.slice(0),
        descriptions: model.descriptions.slice(0), direction
  }
}

