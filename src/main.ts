import App from "./App/App"

var scripts = document.getElementsByTagName("script");
var script = Array.from(scripts).find(script => script.hasAttribute("cube-gallery-callback"));
(window as any)[script.getAttribute("cube-gallery-callback")](App);
