// wrapper for querySelector...returns matching element
export function qs(selector:string, parent = document) {
  return parent.querySelector(selector);
}
// or a more concise version if you are into that sort of thing:
// export const qs = (selector, parent = document) => parent.querySelector(selector);

// retrieve data from localstorage
export function getLocalStorage(key:string) {
  const data = localStorage.getItem(key);
  if (!data) return [];
  return JSON.parse(data);
}
// save data to local storage
export function setLocalStorage(key:string, data:any) {
  localStorage.setItem(key, JSON.stringify(data));
  if (key === "so-cart") {
    window.dispatchEvent(new CustomEvent("so-cart-updated"));
  }
}
// set a listener for both touchend and click
interface ClickHandler {
  (e:Event):void;
}

export function setClick(selector:string, callback:ClickHandler) {
  const element = qs(selector);
  element?.addEventListener("touchend", (event) => {
    event.preventDefault();
    callback(event);
  });
  element?.addEventListener("click", callback);
}

export function openUserMenu(selector:string) {
  setClick(selector, (e:Event) => {
    e.stopPropagation();
    const el = document.querySelector(".user__menu");
    el?.classList.toggle("open");
  });
  setClick("body", () => {
    const openMenus = document.querySelectorAll(".open");
    openMenus.forEach((el) => {
      el?.classList.remove("open");
    });
  });
}
export function getParam(param: string): string | null {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  return urlParams.get(param);
}