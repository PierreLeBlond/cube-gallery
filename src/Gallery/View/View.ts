import { EventEmitter } from "events";
import Model from "../Model/Model";
import dots from "./dots.gif";
import { css, keyframes } from "@emotion/css";

const style: any = {
  base: css({
    display: 'flex',
    justifyContent: 'center',
    position: 'relative',
    height: '70%',
    width: '70%',
    perspective: '100vh',
    transformStyle: 'preserve-3d',
  }),
  wrapper: css({
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    width: '100%',
    perspectiveOrigin: '50% 50%',
  }),
  face: {
    common: css({
      position: 'absolute',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'background-color 1s ease',
      animationDuration: '1s',
      backgroundSize: 'contain',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center center',
    }),
    front: css({
      transform: 'rotateY(0deg)',
      backgroundColor: '#f5f5f5'
    }),
    left: css({
      transform: 'rotateY(-90deg)',
      backgroundColor: '#444'
    }),
    right: css({
      transform: 'rotateY(90deg)',
      backgroundColor: '#444'
    }),
    back: css({
      transform: 'rotateY(180deg)',
      backgroundColor: '#444'
    })
  },
  shadow: css({
    position: 'absolute',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transformOrigin: '50% 50% -200px',
    animationDuration: '1s',
    transform: 'translateY(50px) rotateX(-90deg) scale(0.3)',
    boxShadow: '0px 0px 500px 500px black',
    backgroundColor: 'black'
  }),
  nav: {
    base: css({
      display: 'flex',
      justifyContent: 'center',
      position: 'relative',
      width: '90%',
      listStyleType: 'none',
      padding: '0px',
      li: {
        textDecoration: 'none',
        paddingLeft: '5px',
        paddingRight: '5px',
      }
    }),
    item: css({
      transition: 'color 1s ease',
      '&:hover': {
        cursor: 'pointer'
      }
    }),
    selected: css({
      color: '#BB2FED'
    })
  }
}

const animations: any = {
  [style.face.front]: {
    [style.face.left]: keyframes({
    '0%': {
      transform: 'rotateY(0deg)'
    },
    '100%': {
      transform: 'rotateY(90deg)'
    }
    }),
    [style.face.right]: keyframes`
    0% {
      transform: rotateY(0deg);
    }
    100% {
      transform: rotateY(-90deg);
    }
    `
  },
  [style.face.left]: {
    [style.face.back]: keyframes`
    0% {
      transform: rotateY(90deg);
    }
    100% {
      transform: rotateY(180deg);
    }
    `,
    [style.face.front]: keyframes`
    0% {
      transform: rotateY(90deg);
    }
    100% {
      transform: rotateY(0deg);
    }
    `
  },
  [style.face.back]: {
    [style.face.right]: keyframes`
    0% {
      transform: rotateY(180deg);
    }
    100% {
      transform: rotateY(270deg);
    }
    `,
    [style.face.left]: keyframes`
    0% {
      transform: rotateY(180deg);
    }
    100% {
      transform: rotateY(90deg);
    }
    `
  },
  [style.face.right]: {
    [style.face.front]: keyframes`
    0% {
      transform: rotateY(-90deg);
    }
    100% {
      transform: rotateY(0deg);
    }
    `,
    [style.face.back]: keyframes`
    0% {
      transform: rotateY(270deg);
    }
    100% {
      transform: rotateY(180deg);
    }
    `
  },
  shadow: {
    right: keyframes`
    0% {
      transform: translateY(50px) rotateX(-90deg) rotateZ(0deg) scale(0.3);
    }
    100% {
      transform: translateY(50px) rotateX(-90deg) rotateZ(90deg) scale(0.3);
    }
    `,
    left: keyframes`
    0% {
      transform: translateY(50px) rotateX(-90deg) rotateZ(0deg) scale(0.3);
    }
    100% {
      transform: translateY(50px) rotateX(-90deg) rotateZ(-90deg) scale(0.3);
    }
    `
  }
}

const directionMap: {[direction: string]: {[source: string]: string}} = {
  "left": {
    [style.face.front]: style.face.right,
    [style.face.right]: style.face.back,
    [style.face.back]: style.face.left,
    [style.face.left]: style.face.front,
  },
  "right": {
    [style.face.front]: style.face.left,
    [style.face.right]: style.face.front,
    [style.face.back]: style.face.right,
    [style.face.left]: style.face.back,
  }
};

export default class View extends EventEmitter {

  private model: Model;
  private elementId: string;
  private element: HTMLElement;

  private urlResolvers: {[url: string]: Promise<string>} = {};

  private navItems: {[url: string]: HTMLElement} = {};

  public constructor(elementId: string) {
    super();

    this.model = {
      urls: [],
      cursor: 0,
      direction: "left"
    }

    this.elementId = elementId;

    const element = document.getElementById(elementId);

    if (!element) {
      throw new Error(`Element with id ${elementId} does not exists`);
    }

    this.element = element;

    this.init();

    window.addEventListener('resize', () => this.resize(), false)
    this.resize();
  }

  private resize() {
    const cubeElements = this.element.getElementsByClassName(style.base);
    Array.from(cubeElements).forEach((cubeElement: HTMLElement) => {
      const { clientWidth, clientHeight } = cubeElement;
      const size = Math.min(clientWidth, clientHeight);
      const faceElements = cubeElement.getElementsByClassName(style.face.common);
      Array.from(faceElements).forEach((faceElement: HTMLElement) => {
        faceElement.style.width = `${size}px`;
        faceElement.style.height = `${size}px`;
        faceElement.style.transformOrigin = `50% 50% -${size/2}px`;
        faceElement.style.transformOrigin = `50% 50% -${size/2}px`;
        faceElement.style.boxShadow = `rgba(0, 0, 0, 0.35) 0px -${size/10}px ${size/10}px -${size/10}px inset`;
      });

      const shadowElements = cubeElement.getElementsByClassName(style.shadow);
      Array.from(shadowElements).forEach((shadowElement: HTMLElement) => {
        shadowElement.style.width = `${size}px`;
        shadowElement.style.height = `${size}px`;
        shadowElement.style.transformOrigin = `50% 50% -${size/2}px`;
        shadowElement.style.transformOrigin = `50% 50% -${size/2}px`;
        shadowElement.style.boxShadow = `0px 0px ${size}px ${size}px black`;
      });
    });
  }

  private init() {
    this.element.innerHTML = `
    <div class="${style.wrapper}">
    <div class="${style.base}">
    <div class="${style.face.common} ${style.face.front}"></div>
    <div class="${style.face.common} ${style.face.left}"></div>
    <div class="${style.face.common} ${style.face.right}"></div>
    <div class="${style.face.common} ${style.face.back}"></div>
    <div class="${style.shadow}"></div>
    </div>
    <ul id="${this.elementId}-cube-viewer-nav" class="${style.nav.base}"></ul>
    </div>
    `
  }

  public update(model: Model) {
    // 1. Update navigation bar
    const navNeedsUdate = this.model.urls.toString() !== model.urls.toString();
    if (navNeedsUdate) {
      this.updateNav(model);
    }

    // 2. Launch cube animation
    const needsToMove = model.cursor != this.model.cursor;
    if (needsToMove) {
      this.move(model);
    }

    // 3. Update selected navigation item
    model.urls.forEach((url: string, id: number) => {
      const item = this.navItems[url];
      item.classList.remove(style.nav.selected)
      if (id == model.cursor) {
        item.classList.add(style.nav.selected)
      }
    });

    // 4. Update image
    const fronts = this.element.getElementsByClassName(style.face.front);
    Array.from(fronts).forEach((face: HTMLElement) => {
      this.updateBackgroundImage(face, model.urls[model.cursor]);
    });

    this.model = model;
  }

  private updateNav(model: Model) {
    const ul = document.getElementById(`${this.elementId}-cube-viewer-nav`);

    while (ul.lastChild) {
      ul.removeChild(ul.lastChild);
    }

    model.urls.forEach((url: string, id: number) => {

      let item = this.navItems[url];

      if (!item) {
        item = document.createElement("li");
        item.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-box" viewBox="0 0 16 16">
          <path d="M8.186 1.113a.5.5 0 0 0-.372 0L1.846 3.5 8 5.961 14.154 3.5 8.186 1.113zM15 4.239l-6.5 2.6v7.922l6.5-2.6V4.24zM7.5 14.762V6.838L1 4.239v7.923l6.5 2.6zM7.443.184a1.5 1.5 0 0 1 1.114 0l7.129 2.852A.5.5 0 0 1 16 3.5v8.662a1 1 0 0 1-.629.928l-7.185 2.874a.5.5 0 0 1-.372 0L.63 13.09a1 1 0 0 1-.63-.928V3.5a.5.5 0 0 1 .314-.464L7.443.184z"/>
        </svg>
        `
        item.classList.add(style.nav.item)
        item.addEventListener("click", () => {
          this.emit("selected", id);
        })
        this.navItems[url] = item;
      }

      ul.appendChild(item);
    });
  }

  private move(model: Model) {
    const faces = this.element.getElementsByClassName(style.face.common);
    Array.from(faces).forEach((face: HTMLElement) => {
      const [source, target]: [string, string] = Object.entries(directionMap[model.direction])
        .find(([source, target]: [string, string]) => face.classList.contains(source));
      face.className = face.className.replace(source, target);
      face.style.animationName = animations[source][target];
    })

    this.moveShadow(model);
  }

  private moveShadow(model: Model) {
    const shadows = this.element.getElementsByClassName(style.shadow);
    Array.from(shadows).forEach((shadow: HTMLElement) => {
      shadow.style.animationName = "none";
      shadow.offsetHeight;
      shadow.style.animationName = animations.shadow[model.direction];
    });
  }

  private updateBackgroundImage(element: HTMLElement, url: string) {
    element.style.backgroundImage = `url(${dots})`;
    element.style.backgroundSize = `auto`;
    this.getObjectUrl(url).then((objectUrl) => {
      element.style.backgroundImage = `url(${objectUrl})`;
      element.style.backgroundSize = `contain`;
    });
  }

  private async getObjectUrl(url: string) {
    const getObjectUrlResolver = async (url: string) => {
      const response = await fetch(url);
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      return objectUrl;
    }

    if (!this.urlResolvers[url]) {
      this.urlResolvers[url] = getObjectUrlResolver(url);
    }

    return this.urlResolvers[url];
  }

}
