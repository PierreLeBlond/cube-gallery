import {css, keyframes} from '@emotion/css';
import {EventEmitter} from 'events';

import Model from '../Model/Model';

import dots from './dots.gif';

const mod =
    (z: number, n: number) => {
      const m = ((z % n) + n) % n;
      return m < 0 ? m + Math.abs(n) : m;
    }

const getNextIndex = (current: number, direction: number, length: number) => {
  return mod(current + direction, length);
};

const getNextElement =
    (array: any[], current: number, direction: number) => {
      return array[getNextIndex(current, direction, array.length)];
    }

const style: any = {
  wrapper: css({
    display: 'flex',
    flexDirection: 'column',
    flexWrap: 'nowrap',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: '10px',
    height: '100%',
    width: '100%',
    overflowX: 'hidden',
    perspective: '100vh',
    perspectiveOrigin: '50% 50%',
  }),
  cube: css({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'end',
    position: 'relative',
    maxHeight: '70%',
    width: '70%',
    aspectRatio: '1',
    transformStyle: 'preserve-3d',
    transform: 'translateZ(-400px) rotateY(0deg)'
  }),
  animatable: css({transition: 'transform 1s'}),
  face: {
    common: css({
      position: 'absolute',
      display: 'flex',
      width: '100%',
      height: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'background-color 1s ease',
      animationDuration: '1s',
      backgroundSize: 'contain',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center center',
      transformStyle: 'preserve-3d',
      backgroundColor: '#444'
    }),
    front: css({
      transform: 'rotateY(0deg) translate3d(0, 0, 200px)',
    }),
    left: css({
      transform: 'rotateY(-90deg) translate3d(0, 0, 200px)',
    }),
    right: css({
      transform: 'rotateY(90deg) translate3d(0, 0, 200px)',
    }),
    back: css({
      transform: 'rotateY(180deg) translate3d(0, 0, 200px)',
    }),
    current: css({backgroundColor: '#f5f5f5'})
  },
  shadow: {
    holder: css({
      position: 'absolute',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transform: 'translateY(50px) rotateX(-90deg)',
      preserve3d: true
    }),
    item: css({
      width: '30%',
      height: '30%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transformOrigin: '50% 50% -200px',
      animationDuration: '1s',
      // transform: 'translateY(50px) rotateX(-90deg) scale(0.3)',
      boxShadow: '0px 0px 500px 500px black',
      backgroundColor: 'black'
    })
  },
  nav: {
    base: css({
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'start',
      position: 'relative',
      width: '90%',
      height: '10%',
      listStyleType: 'none',
      padding: '0px',
      marginBottom: '0%',
      li: {
        textDecoration: 'none',
        paddingLeft: '5px',
        paddingRight: '5px',
      }
    }),
    item: css({transition: 'color 1s ease', '&:hover': {cursor: 'pointer'}}),
    link: css({color: '#FFF'}),
    selected: css({'a': {color: '#2E93FF'}})
  },
  description: {
    holder: css({
      display: 'flex',
      alignItems: 'center',
      position: 'relative',
      width: '90%',
      height: '20%'
    }),
    item: css({
      textIndent: '10px',
      textAlign: 'center',
      width: '100%',
      position: 'absolute',
      animationDuration: '1s',
      animationFillMode: 'forwards',
      margin: 0,
      p: {
        margin: 0,
      }
    })
  }
}

const orientations = ['front', 'right', 'back', 'left'];

const rotations: any = {
  front: 0,
  back: 180,
  left: -90,
  right: 90
}

const animations: any = {
  description: {
    left: {
      in : keyframes({
        '0%': {opacity: '0', left: '-100%'},
        '100%': {opacity: '1', left: '0%'}
      }),
      out: keyframes({
        '0%': {opacity: '1', left: '0%'},
        '100%': {opacity: '0', left: '100%'}
      }),
    },
    right: {
      in : keyframes({
        '0%': {opacity: '0', left: '100%'},
        '100%': {opacity: '1', left: '0%'}
      }),
      out: keyframes({
        '0%': {opacity: '1', left: '0%'},
        '100%': {opacity: '0', left: '-100%'}
      }),
    }
  }
}

export default class View extends EventEmitter {
  private model: Model;
  private elementId: string;
  public element: HTMLElement;

  private urlResolvers: {[url: string]: Promise<string>} = {};

  private navItems: {[url: string]: HTMLElement} = {};

  private anchorAngle = 0;
  private angle = 0;
  private distance = 0;

  private currentFaceId = 0;
  // Remember last chosen direction to lazy load images in this direction
  private currentDirection = 1;

  public constructor(elementId: string) {
    super();

    this.model = {
      urls: [],
      descriptions: [],
      cursor: 0,
      direction: 'left'
    }

                 this.elementId = elementId;

    const element = document.getElementById(elementId);

    if (!element) {
      throw new Error(`Element with id ${elementId} does not exists`);
    }

    this.element = element;

    this.init();

    window.addEventListener('resize', () => this.resize(), false);
    this.resize();
  }

  public preventAnimations() {
    const cubeElement =
        this.element.getElementsByClassName(style.cube)[0] as HTMLElement;
    cubeElement.classList.remove(style.animatable);
  }

  public allowAnimations() {
    const cubeElement =
        this.element.getElementsByClassName(style.cube)[0] as HTMLElement;
    cubeElement.classList.add(style.animatable);
  }

  public drag(offset: number) {
    const width = this.element.clientWidth;
    this.angle = this.anchorAngle + (offset / width) * 90.0;
    this.updateCube();
  }

  public release() {
    this.angle = this.anchorAngle;
    this.updateCube();
  }

  private resize() {
    const cubeElement =
        this.element.getElementsByClassName(style.cube)[0] as HTMLElement;
    const {clientWidth, clientHeight} = cubeElement;
    const size = Math.min(clientWidth, clientHeight);

    this.distance = size / 2;

    orientations.forEach((orientation: string) => {
      const faceElement = this.element.getElementsByClassName(
                              style.face[orientation])[0] as HTMLElement;
      faceElement.style.transform = `rotateY(${
          rotations[orientation]}deg) translate3d(0, 0, ${this.distance}px)`;
      faceElement.style.boxShadow =
          `rgba(0, 0, 0, 0.35) 0px 0px ${size / 10}px ${size / 20}px inset`;
    });

    const shadowHolderElements =
        cubeElement.getElementsByClassName(style.shadow.holder);
    Array.from(shadowHolderElements)
        .forEach((shadowHolderElement: HTMLElement) => {
          shadowHolderElement.style.width = `${size}px`;
          shadowHolderElement.style.height = `${size}px`;
          shadowHolderElement.style.transform =
              `translateY(${this.distance + size / 30}px) rotateX(-90deg)`;
        });

    const shadowElements =
        cubeElement.getElementsByClassName(style.shadow.item);
    Array.from(shadowElements).forEach((shadowElement: HTMLElement) => {
      shadowElement.style.boxShadow =
          `0px 0px ${size / 4}px ${size / 3}px black`;
    });

    this.updateCube();
  }

  private init() {
    this.element.innerHTML = `
    <div class="${style.wrapper}">
    <div class="${style.cube} ${style.animatable}">
    <div class="${style.face.common} ${style.face.front} ${
        style.face.current}"></div>
    <div class="${style.face.common} ${style.face.left}"></div>
    <div class="${style.face.common} ${style.face.right}"></div>
    <div class="${style.face.common} ${style.face.back}"></div>
    <div class="${style.shadow.holder}">
    <div class="${style.shadow.item}"></div>
    </div>
    </div>
    <div class="${style.description.holder}">
      <p class="${style.description.item}"></p>
      <p class="${style.description.item}"></p>
    </div>
    <ul id="${this.elementId}-cube-viewer-nav" class="${style.nav.base}"></ul>
    </div>
    `
  }

  public update(model: Model) {
    const navNeedsRebuild =
        this.model.urls.toString() !== model.urls.toString();
    if (navNeedsRebuild) {
      this.rebuildNav(model);
    }

    const needsToMove = model.cursor != this.model.cursor;
    if (needsToMove) {
      this.currentDirection = model.direction == 'right' ? 1 : -1;
      this.currentFaceId = getNextIndex(
          this.currentFaceId, this.currentDirection, orientations.length);
      this.move(model);
    }

    this.updateNav(model);

    this.updateDescription(model);

    this.updateCube();

    this.updateFaces(model);

    this.model = model;
  }

  private updateDescription(model: Model) {
    const text = model.descriptions[model.cursor];
    const descriptions: HTMLElement[] =
        Array.from(this.element.getElementsByClassName(
            style.description.item)) as HTMLElement[];

    if (this.model.cursor == model.cursor) {
      descriptions[0].innerHTML = model.descriptions[model.cursor];
      return;
    }

    // out element
    descriptions[1].innerHTML = this.model.descriptions[this.model.cursor];
    descriptions[1].style.animationName = 'none';
    descriptions[1].offsetHeight;
    descriptions[1].style.animationName =
        animations.description[model.direction].out;

    // in element
    descriptions[0].innerHTML = model.descriptions[model.cursor];
    descriptions[0].style.animationName = 'none';
    descriptions[0].offsetHeight;
    descriptions[0].style.animationName =
        animations.description[model.direction].in;
  }

  private rebuildNav(model: Model) {
    const ul = document.getElementById(`${this.elementId}-cube-viewer-nav`);

    while (ul.lastChild) {
      ul.removeChild(ul.lastChild);
    }

    model.urls.forEach((url: string, id: number) => {
      let item = this.navItems[url];

      if (!item) {
        item = document.createElement('li');
        const itemLink = document.createElement('a');
        itemLink.classList.add(style.nav.link);
        item.appendChild(itemLink);
        itemLink.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-box" viewBox="0 0 16 16">
          <path d="M8.186 1.113a.5.5 0 0 0-.372 0L1.846 3.5 8 5.961 14.154 3.5 8.186 1.113zM15 4.239l-6.5 2.6v7.922l6.5-2.6V4.24zM7.5 14.762V6.838L1 4.239v7.923l6.5 2.6zM7.443.184a1.5 1.5 0 0 1 1.114 0l7.129 2.852A.5.5 0 0 1 16 3.5v8.662a1 1 0 0 1-.629.928l-7.185 2.874a.5.5 0 0 1-.372 0L.63 13.09a1 1 0 0 1-.63-.928V3.5a.5.5 0 0 1 .314-.464L7.443.184z"/>
        </svg>
        `;
        item.classList.add(style.nav.item);
        itemLink.addEventListener('click', () => {
          this.emit('selected', id);
        });
        this.navItems[url] = item;
      }

      ul.appendChild(item);
    });
  }

  private updateNav(model: Model) {
    model.urls.forEach((url: string, id: number) => {
      let item = this.navItems[url];
      item.classList.remove(style.nav.selected)
      if (id == model.cursor) {
        item.classList.add(style.nav.selected)
      }
    });
  }

  private updateCube() {
    const cubeElement =
        this.element.getElementsByClassName(style.cube)[0] as HTMLElement;
    cubeElement.style.transform =
        `translateZ(-${this.distance}px) rotateY(${this.angle}deg)`;
  }

  private updateFaces(model: Model) {
    Array.from(this.element.getElementsByClassName(style.face.common))
        .forEach((element: HTMLElement) => {
          element.classList.remove(style.face.current);
        });

    const orientation = orientations[this.currentFaceId];
    const face = this.element.getElementsByClassName(
                     style.face[orientation])[0] as HTMLElement;
    face.classList.add(style.face.current);

    for (let i = 0; i < 3; i++) {
      const orientation = getNextElement(
          orientations, this.currentFaceId, i * this.currentDirection);
      const face = this.element.getElementsByClassName(
                       style.face[orientation])[0] as HTMLElement;
      this.updateBackgroundImage(
          face,
          getNextElement(model.urls, model.cursor, i * this.currentDirection));
    }
  }

  private move(model: Model) {
    this.anchorAngle -= this.currentDirection * 90;
    this.angle = this.anchorAngle;
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
    const getObjectUrlResolver =
        async (url: string) => {
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
