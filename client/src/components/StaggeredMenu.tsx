import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import "./StaggeredMenu.css";

export type StaggeredMenuItem = {
  label: string;
  ariaLabel: string;
  link: string;
};

type StaggeredMenuSocial = { label: string; link: string };

type StaggeredMenuProps = {
  items: StaggeredMenuItem[];
  socialItems?: StaggeredMenuSocial[];
  colors?: string[];
  accentColor?: string;
  position?: "left" | "right";
};

export default function StaggeredMenu({
  items,
  socialItems = [],
  colors = ["#d9e3d3", "#bc7d5b"],
  accentColor = "#bc7d5b",
  position = "right",
}: StaggeredMenuProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const [layers, setLayers] = useState<HTMLElement[]>([]);

  useLayoutEffect(() => {
    const panel = panelRef.current;
    const layerContainer = layerRef.current;
    if (!panel || !layerContainer) return;
    const nextLayers = Array.from(layerContainer.querySelectorAll<HTMLElement>(".sm-prelayer"));
    setLayers(nextLayers);
    gsap.set([panel, ...nextLayers], { xPercent: position === "right" ? 100 : -100, opacity: 1 });
  }, [position]);

  const openMenu = useCallback(() => {
    const panel = panelRef.current;
    if (!panel) return;
    const labels = Array.from(panel.querySelectorAll<HTMLElement>(".sm-panel-itemLabel"));
    const numbers = Array.from(panel.querySelectorAll<HTMLElement>(".sm-panel-item"));
    const socialTitle = panel.querySelector<HTMLElement>(".sm-socials-title");
    const socialLinks = Array.from(panel.querySelectorAll<HTMLElement>(".sm-socials-link"));
    const offscreen = position === "right" ? 100 : -100;
    gsap.killTweensOf([panel, ...layers, ...labels, ...socialLinks]);
    gsap.set(labels, { yPercent: 140, rotate: 8 });
    gsap.set(numbers, { "--sm-num-opacity": 0 });
    gsap.set(socialTitle, { opacity: 0 });
    gsap.set(socialLinks, { y: 20, opacity: 0 });
    const timeline = gsap.timeline();
    layers.forEach((layer, index) => timeline.to(layer, { xPercent: 0, duration: 0.48, ease: "power4.out" }, index * 0.07));
    const panelStart = Math.max(0, (layers.length - 1) * 0.07) + 0.08;
    timeline.to(panel, { xPercent: 0, duration: 0.65, ease: "power4.out" }, panelStart);
    timeline.to(labels, { yPercent: 0, rotate: 0, duration: 0.85, ease: "power4.out", stagger: 0.08 }, panelStart + 0.12);
    timeline.to(numbers, { "--sm-num-opacity": 1, duration: 0.45, ease: "power2.out", stagger: 0.06 }, panelStart + 0.2);
    if (socialTitle) timeline.to(socialTitle, { opacity: 1, duration: 0.35 }, panelStart + 0.45);
    timeline.to(socialLinks, { y: 0, opacity: 1, duration: 0.4, ease: "power3.out", stagger: 0.07 }, panelStart + 0.5);
    void offscreen;
  }, [layers, position]);

  const closeMenu = useCallback(() => {
    const panel = panelRef.current;
    if (!panel) return;
    const offscreen = position === "right" ? 100 : -100;
    gsap.killTweensOf([panel, ...layers]);
    gsap.to([panel, ...layers], { xPercent: offscreen, duration: 0.32, ease: "power3.in", stagger: 0.04 });
  }, [layers, position]);

  const toggleMenu = () => {
    const next = !open;
    setOpen(next);
    if (next) openMenu();
    else closeMenu();
  };

  useEffect(() => {
    if (!open) return;
    const handleOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
        closeMenu();
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [closeMenu, open]);

  return (
    <div ref={wrapperRef} className="staggered-menu-wrapper" data-open={open || undefined} data-position={position} style={{ "--sm-accent": accentColor } as React.CSSProperties}>
      <div ref={layerRef} className="sm-prelayers" aria-hidden="true">
        {colors.slice(0, 3).map((color, index) => <div className="sm-prelayer" style={{ background: color }} key={`${color}-${index}`} />)}
      </div>
      <header className="staggered-menu-header" aria-label="Mobile navigation header">
        <button className="sm-toggle" type="button" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} onClick={toggleMenu}>
          <span className="sm-toggle-text">{open ? "Close" : "Menu"}</span>
          <span className={`sm-icon ${open ? "is-open" : ""}`} aria-hidden="true"><span /><span /></span>
        </button>
      </header>
      <aside ref={panelRef} className="staggered-menu-panel" aria-hidden={!open}>
        <div className="sm-panel-inner">
          <ul className="sm-panel-list" data-numbering="true">
            {items.map((item) => <li className="sm-panel-itemWrap" key={item.label}><a className="sm-panel-item" href={item.link} aria-label={item.ariaLabel} onClick={() => { setOpen(false); closeMenu(); }}><span className="sm-panel-itemLabel">{item.label}</span></a></li>)}
          </ul>
          {socialItems.length > 0 && <div className="sm-socials"><h3 className="sm-socials-title">Say hello</h3><ul className="sm-socials-list">{socialItems.map((item) => <li key={item.label}><a className="sm-socials-link" href={item.link}>{item.label}</a></li>)}</ul></div>}
        </div>
      </aside>
    </div>
  );
}
