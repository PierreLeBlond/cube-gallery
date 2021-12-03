export default interface Model {
  urls: string[];
  descriptions: string[];
  cursor: number;
  direction: "left" | "right"
}
