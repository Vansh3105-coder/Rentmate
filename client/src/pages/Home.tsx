import { useEffect, useRef, useState, type CSSProperties } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Check,
  ChevronDown,
  ChevronRight,
  Clock3,
  Compass,
  Heart,
  Home as HomeIcon,
  KeyRound,
  MoveUpRight,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react";
import { toast } from "sonner";
import StaggeredMenu, { type StaggeredMenuItem } from "@/components/StaggeredMenu";
import LiquidGlassFlipCard from "@/components/LiquidGlassFlipCard";

import { properties, type Property } from "@/data/properties";
const mobileMenuItems: StaggeredMenuItem[] = [
  { label: "Explore homes", ariaLabel: "Explore available homes", link: "/explore" },
  { label: "Find a roommate", ariaLabel: "Find a roommate", link: "#roommates" },
  { label: "Stories", ariaLabel: "Read Nestora stories", link: "#stories" },
  { label: "For owners", ariaLabel: "Learn about listing as an owner", link: "#owners" },
];

const trustPoints = [
  { value: "12k+", label: "places that feel lived in" },
  { value: "4.8/5", label: "average resident rating" },
  { value: "0", label: "hidden listing fees" },
];

const featureCards = [
  {
    eyebrow: "For renters",
    title: "A better way to find your next chapter.",
    copy: "See the real details before you visit. Compare places by what matters to your everyday, not just by a filtered photo grid.",
    icon: Compass,
    className: "feature-card--sage",
  },
  {
    eyebrow: "For owners",
    title: "Good spaces deserve good tenants.",
    copy: "Share the story of your space, meet people who are a fit, and keep your listing moving without chasing leads across five apps.",
    icon: KeyRound,
    className: "feature-card--peach",
  },
];

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}
function AnimatedHeroHeadline() {
  const titles = ["right.", "beautiful.", "like home.", "made for you.", "worth staying for."];
  const [titleNumber, setTitleNumber] = useState(0);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setTitleNumber((current) => (current + 1) % titles.length);
    }, 2200);
    return () => window.clearTimeout(timeoutId);
  }, [titleNumber, titles.length]);

  return (
    <h1 className="hero-animated-heading">
      <span>Find a place that feels</span>
      <span className="hero-rotating-word-wrap" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={titles[titleNumber]}
            className="hero-rotating-word"
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "-100%" }}
            transition={{ type: "spring", stiffness: 58, damping: 13 }}
          >
            {titles[titleNumber]}
          </motion.span>
        </AnimatePresence>
      </span>
    </h1>
  );
}

function InfiniteSpiral({ items }: { items: Property[] }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const progressRef = useRef(0);
  const targetProgressRef = useRef(0);
  const hoveredRef = useRef(false);
  const draggingRef = useRef(false);
  const lastPointerYRef = useRef(0);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || items.length === 0) return;

    let frameId = 0;
    let previousTime = performance.now();
    let lastScrollY = window.scrollY;
    let visible = true;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }, { threshold: 0.02 });
    observer.observe(root);

    const handleScroll = () => {
      if (visible) targetProgressRef.current += (window.scrollY - lastScrollY) / 420;
      lastScrollY = window.scrollY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    const render = (time: number) => {
      const delta = Math.min((time - previousTime) / 1000, 0.05);
      previousTime = time;
      if (visible && !reducedMotion.matches && !hoveredRef.current && !draggingRef.current) targetProgressRef.current += 0.48 * delta;
      const followBlend = 1 - Math.exp(-delta * (draggingRef.current ? 24 : 10));
      progressRef.current += (targetProgressRef.current - progressRef.current) * followBlend;

      const bounds = root.getBoundingClientRect();
      const fit = Math.min(1, bounds.width / 420, bounds.height / 520);
      const radius = Math.min(178, Math.max(90, bounds.width * 0.37)) * fit;
      const count = items.length;
      const half = count / 2;

      cardRefs.current.forEach((card, index) => {
        if (!card) return;
        let offset = index - progressRef.current;
        offset = ((offset + half) % count + count) % count - half;
        const edge = Math.min(Math.abs(offset) / Math.max(half, 1), 1);
        const fade = 1 - Math.max(0, (edge - 0.54) / 0.46);
        const focus = 1 - Math.min(Math.abs(offset) / 4.4, 1);
        const angle = offset * (360 / 7);
        const radians = (angle * Math.PI) / 180;
        const x = Math.sin(radians) * radius;
        const z = Math.cos(radians) * radius;
        const depth = (z / Math.max(radius, 1) + 1) / 2;
        const scale = (0.86 + focus * 0.26) * fit;
        const blur = Math.max(0, edge - 0.5) * 5;
        card.style.transform = `translate(-50%, -50%) translate3d(${x}px, ${offset * 70 * fit}px, ${z}px) rotateZ(${offset * 2.2}deg) scale(${scale})`;
        card.style.opacity = fade.toFixed(3);
        card.style.filter = blur > 0.1 ? `blur(${blur.toFixed(2)}px)` : "none";
        card.style.zIndex = String(Math.round(depth * 10000) + index);
        card.style.pointerEvents = fade > 0.2 ? "auto" : "none";
      });
      frameId = requestAnimationFrame(render);
    };

    frameId = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(frameId);
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
    };
  }, [items]);

  return (
    <div
      ref={rootRef}
      className="infinite-spiral"
      style={{ perspective: "1000px" }}
      aria-label="Infinite spiral property gallery"
      onMouseEnter={() => { hoveredRef.current = true; }}
      onMouseLeave={() => { hoveredRef.current = false; draggingRef.current = false; }}
      onPointerDown={(event) => {
        if (event.button !== 0) return;
        draggingRef.current = true;
        lastPointerYRef.current = event.clientY;
        event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerMove={(event) => {
        if (!draggingRef.current) return;
        const delta = event.clientY - lastPointerYRef.current;
        lastPointerYRef.current = event.clientY;
        targetProgressRef.current -= delta / 70;
      }}
      onPointerUp={(event) => {
        draggingRef.current = false;
        if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
      }}
      onPointerCancel={() => { draggingRef.current = false; }}
    >
      <div className="infinite-spiral__stage" role="list" aria-label="Available properties">
        {items.map((item, index) => (
          <button
            type="button"
            key={item.title}
            ref={(node) => { cardRefs.current[index] = node; }}
            className="infinite-spiral__item"
            style={{ borderRadius: 17 }}
            onClick={() => toast.success(`${item.title} saved to your shortlist`)}
            aria-label={`Save ${item.title}`}
          >
            <img className="infinite-spiral__image" src={item.src} alt={item.alt} draggable={false} />
            <span className="infinite-spiral__shade" />
            <span className="infinite-spiral__meta"><span>{item.tag}</span><strong>{item.title}</strong></span>
          </button>
        ))}
      </div>
      <div className="spiral-note"><span className="eyebrow eyebrow--light">Scroll · drag · pause</span><strong>A living shelf of available places.</strong></div>
    </div>
  );
}

function FlipCard({ item, index }: { item: Property; index: number }) {
  const [flipped, setFlipped] = useState(false);
  const tilt = index === 0 ? "flip-card--tilt-left" : index === 1 ? "flip-card--tilt-right" : "";
  return (
    <button
      type="button"
      className={`flip-card ${tilt} ${flipped ? "is-flipped" : ""}`}
      onClick={() => setFlipped((value) => !value)}
      aria-pressed={flipped}
      aria-label={`${flipped ? "Hide" : "Show"} details for ${item.title}`}
    >
      <span className="flip-card__rotor">
        <span className="flip-card__face flip-card__face--front">
          <img src={item.src} alt={item.alt} />
          <span className="flip-card__shade" />
          <span className="flip-card__front-copy">
            <span className="micro-label">{item.tag}</span>
            <strong>{item.title}</strong>
            <span>{item.subtitle}</span>
            <span className="flip-hint">Tap to turn <ArrowUpRight size={15} /></span>
          </span>
        </span>
        <span className="flip-card__face flip-card__face--back">
          <span className="back-orb" />
          <span className="micro-label">A closer look</span>
          <strong>{item.title}</strong>
          <p>{item.detail}</p>
          <span className="flip-card__back-line"><span>{item.price}</span><ChevronRight size={16} /></span>
        </span>
      </span>
    </button>
  );
}

function Home() {
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    const revealItems = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (revealItems.length === 0) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -48px" });
    revealItems.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  const showInterest = (message: string) => {
    toast.success(message, { description: "We’ll keep the good stuff coming your way." });
  };

  return (
    <div className="site-shell">
      <header className="site-header">
        <a href="#top" className="brand" aria-label="Nestora home">
          <span className="brand-mark"><span /><span /></span>
          <span>Nestora</span>
        </a>
        <nav className="main-nav" aria-label="Main navigation">
          <a href="/explore">Explore homes</a>
          <a href="#roommates" onClick={(event) => { event.preventDefault(); showInterest("Roommate matching is coming next"); }}>Find a roommate</a>
          <a href="#stories">Stories</a>
        </nav>
        <div className="header-actions">
          <a className="button button--dark button--small" href="#owners">For owners <ArrowUpRight size={15} /></a>
        </div>
      </header>
      <StaggeredMenu items={mobileMenuItems} socialItems={[{ label: "hello@nestora.place", link: "mailto:hello@nestora.place" }]} colors={["#d9e3d3", "#bc7d5b"]} accentColor="#bc7d5b" />

      <main id="top">
        <section className="hero-section">
          <div className="hero-content">
            <div className="hero-copy">
              <span className="announcement"><Sparkles size={13} /> A softer way to move</span>
              <AnimatedHeroHeadline />
              <p className="hero-subcopy">Homes, rooms, and housemates with a little more care behind them. Search less. Feel at home sooner.</p>
              <div className="hero-actions">
                <button type="button" className="button button--peach" onClick={() => { window.location.href = "/explore"; }}>Find my next place <ArrowUpRight size={17} /></button>
                <button type="button" className="button button--ghost-light" onClick={() => scrollToId("owners")}>I have a place to list <ArrowRight size={17} /></button>
              </div>
              <div className="hero-note"><span className="avatar-stack"><span>R</span><span>A</span><span>M</span><span>+</span></span><span>Trusted by people making their next move</span></div>
            </div>
            <div className="spiral-showcase"><InfiniteSpiral items={properties} /></div>
          </div>
        </section>

        <div className="search-section" aria-label="Search available homes" data-reveal="up">
          <div className="hero-search-wrap">
            <div className="hero-search">
              <div className="search-icon"><Search size={19} /></div>
              <div className="search-input-wrap">
                <label htmlFor="hero-search">Where do you want to live?</label>
                <input id="hero-search" value={searchValue} onChange={(event) => setSearchValue(event.target.value)} placeholder="City, neighbourhood, or landmark" />
              </div>
              <div className="search-divider" />
              <div className="search-filter"><span>Move-in</span><strong>Anytime</strong><ChevronDown size={15} /></div>
              <button type="button" className="search-submit" onClick={() => { window.location.href = searchValue ? `/explore?q=${encodeURIComponent(searchValue)}` : "/explore"; }}><Search size={18} /> <span>Search homes</span></button>
            </div>
          </div>
        </div>

        <section className="trust-strip" aria-label="Nestora highlights" data-reveal="up">
          <p className="trust-intro">The good kind of different <span>—</span> for the way you live now.</p>
          <div className="trust-points">{trustPoints.map((point) => <div className="trust-point" key={point.value}><strong>{point.value}</strong><span>{point.label}</span></div>)}</div>
        </section>

        <section className="story-section section-pad" id="how-it-works" data-reveal="up">
          <div className="section-heading section-heading--split">
            <div><span className="eyebrow">Room to breathe</span><h2>Renting shouldn’t feel like <em>a second job.</em></h2></div>
            <p>We’re building a more considered way to rent — one that puts context around every place, clarity around every step, and people back in the middle of it all.</p>
          </div>
          <div className="feature-grid">
            {featureCards.map((card) => { const Icon = card.icon; return <article className={`feature-card ${card.className}`} key={card.title} data-reveal="scale" style={{ "--reveal-delay": `${featureCards.indexOf(card) * 90}ms` } as CSSProperties}><span className="feature-icon"><Icon size={21} /></span><span className="eyebrow">{card.eyebrow}</span><h3>{card.title}</h3><p>{card.copy}</p><a href={card.eyebrow === "For owners" ? "#owners" : "/explore"}>See how it works <ArrowUpRight size={15} /></a></article>; })}
            <article className="feature-stamp"><span className="stamp-star">✳</span><span>Made for<br /><em>real life.</em></span><span className="stamp-arrow"><ArrowDownRight size={18} /></span></article>
          </div>
        </section>

        <section className="explore-section section-pad" id="explore" data-reveal="up">
          <div className="section-heading section-heading--row"><div><span className="eyebrow">A few good places</span><h2>Start with a feeling.</h2></div><a href="/explore" className="inline-link">Explore all homes <ArrowUpRight size={16} /></a></div>
          <div className="liquid-glass-grid">{properties.slice(0, 4).map((property, index) => <LiquidGlassFlipCard key={property.title} property={property} index={index} />)}</div>
        </section>

        <section className="flip-section section-pad" id="stories" data-reveal="up">
          <div className="flip-copy"><span className="eyebrow eyebrow--light">Turn the card</span><h2>Because a home is more than <em>four walls.</em></h2><p>Get the little details that make the big decision easier. Tap a card to see the story behind the listing.</p><button type="button" className="button button--outline-light" onClick={() => showInterest("We’ll show you the good stuff first")}>Get early access <ArrowUpRight size={16} /></button></div>
          <div className="flip-cards" data-reveal="scale"><FlipCard item={properties[1]} index={0} /><FlipCard item={properties[2]} index={1} /><FlipCard item={properties[3]} index={2} /></div>
        </section>

        <section className="owner-section section-pad" id="owners" data-reveal="up">
          <div className="owner-visual"><div className="owner-image"><img src="https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1400&q=85&auto=format&fit=crop" alt="Bright home interior ready for its next resident" /><div className="owner-image-note"><BadgeCheck size={18} /><span>Thoughtful homes<br /><strong>find good people</strong></span></div></div><div className="owner-badge"><span>For the<br /><em>people</em><br />with keys</span><ArrowUpRight size={20} /></div></div>
          <div className="owner-copy"><span className="eyebrow">Have a place to share?</span><h2>Your space has a <em>story.</em></h2><p>Let’s tell it properly. Nestora helps owners show up with the right details, reach people who care, and make the next handover feel like a welcome.</p><ul><li><span><Check size={14} /></span>Qualify interest before you open the door</li><li><span><Check size={14} /></span>List with clear, honest information</li><li><span><Check size={14} /></span>Keep every conversation in one place</li></ul><button type="button" className="button button--dark" onClick={() => showInterest("Owner tools are coming next")}>List your place <ArrowUpRight size={17} /></button><span className="owner-footnote"><ShieldCheck size={15} /> No listing fee while we’re getting started</span></div>
        </section>

        <section className="closing-section section-pad" data-reveal="up"><div className="closing-inner"><span className="eyebrow">Your next place is out there</span><h2>Make room for <em>what’s next.</em></h2><p>Join the early list for thoughtful homes, honest listings, and a calmer way to move.</p><button type="button" className="button button--peach" onClick={() => showInterest("You’re on the early list")}>Join the early list <ArrowUpRight size={17} /></button><div className="closing-squiggle">⌁</div></div></section>
      </main>

      <footer className="site-footer"><div className="footer-top"><div className="footer-brand"><a href="#top" className="brand brand--footer"><span className="brand-mark"><span /><span /></span><span>Nestora</span></a><p>Find the place<br />that finds you back.</p></div><div className="footer-links"><div><span>Explore</span><a href="/explore">Homes</a><a href="#how-it-works">How it works</a><a href="#stories">Stories</a></div><div><span>For owners</span><a href="#owners">List your place</a><a href="#owners">Owner guide</a><a href="#owners">Good to know</a></div><div><span>Say hello</span><a href="mailto:hello@nestora.place">hello@nestora.place</a><a href="#top">Instagram <MoveUpRight size={13} /></a><a href="#top">LinkedIn <MoveUpRight size={13} /></a></div></div></div><div className="footer-bottom"><span>© 2026 Nestora Technologies</span><span>Made for people in motion <Heart size={13} fill="currentColor" /></span><div><a href="#top">Privacy</a><a href="#top">Terms</a></div></div></footer>
    </div>
  );
}

export default Home;
