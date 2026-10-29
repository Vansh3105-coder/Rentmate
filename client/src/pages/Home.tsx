import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
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
import { startLogin } from "@/const";
import StaggeredMenu, { type StaggeredMenuItem } from "@/components/StaggeredMenu";
import AccordionGallery from "@/components/AccordionGallery";

import { properties, type Property } from "@/data/properties";
const propertyFacts: Record<string, string[]> = {
  "The Courtyard Flat": [
    "Two-bedroom apartment with a calm courtyard outlook",
    "Indiranagar location near cafes, metro, and daily essentials",
    "Dedicated work-from-home nook with strong natural light",
    "Leafy balcony that opens from the living space",
    "Warm kitchen with generous storage and dining space",
    "Managed community with a quiet, lived-in atmosphere",
    "Best suited to couples, small families, or focused professionals",
    "₹42,000 monthly rent with no hidden listing fee",
    "Move-in conversation and viewing arranged through Nestly"
  ],
  "House on 9th": [
    "Spacious three-bedroom house in Kalyani Nagar",
    "Private garden for slow mornings, pets, and small gatherings",
    "Generous windows keep the living areas bright throughout the day",
    "Large kitchen designed for hosting and everyday cooking",
    "Flexible room that works as an office, studio, or guest room",
    "Residential street with quick access to shops and restaurants",
    "A strong fit for families or a group sharing a full home",
    "₹68,000 monthly rent with the home story clearly listed",
    "Schedule a thoughtful viewing before making a decision"
  ],
  "Mango House PG": [
    "Warm co-living PG in HSR Layout for easy everyday living",
    "Private room with comfortable shared common areas",
    "Homemade dinners served twice a week by the house team",
    "Quiet corners for study, calls, and decompression",
    "Good access to offices, cafes, gyms, and neighborhood markets",
    "Run with clear house rules and no mystery move-in fee",
    "Ideal for students, first-job movers, and new-to-city residents",
    "₹18,500 monthly rent with the essentials kept transparent",
    "Meet the space and ask questions before you move in"
  ],
  "The Terrace Studio": [
    "Compact studio with a generous private terrace in Powai",
    "Character-filled interior with soft daylight and practical storage",
    "Quick access to the lake, cafes, and a slower morning routine",
    "Open living and sleeping zone that is easy to make your own",
    "Terrace works for plants, reading, evening tea, or a small table",
    "Low-maintenance setup for independent city living",
    "A good fit for a solo resident or a couple who loves outdoor space",
    "₹31,500 monthly rent with the important details up front",
    "View the studio in person and picture your daily rhythm"
  ]
};

const propertyPalettes: Record<string, { surface: string; ink: string; muted: string; accent: string; bullet: string }> = {
  "The Courtyard Flat": { surface: "#D8C7AE", ink: "#211D1A", muted: "#5D5145", accent: "#B86F4C", bullet: "#A95C3F" },
  "House on 9th": { surface: "#D7D1BD", ink: "#26302A", muted: "#596052", accent: "#A87854", bullet: "#9B6749" },
  "Mango House PG": { surface: "#D2AE86", ink: "#2B211B", muted: "#654A38", accent: "#C4764E", bullet: "#AF5D3F" },
  "The Terrace Studio": { surface: "#C9AA8D", ink: "#241D1A", muted: "#604A3D", accent: "#A96748", bullet: "#98563D" }
};

const mobileMenuItems: StaggeredMenuItem[] = [
  { label: "Explore homes", ariaLabel: "Explore available homes", link: "/explore" },
  { label: "Find a roommate", ariaLabel: "Find a roommate", link: "#roommates" },
  { label: "Stories", ariaLabel: "Read Nestly stories", link: "#stories" },
  { label: "Sign in", ariaLabel: "Sign in to Nestly", link: "/onboarding" },
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

  const featured = useMemo(() => properties.slice(0, 4), []);
  const accordionItems = useMemo(() => featured.map((property) => ({ image: property.src, label: property.title, detail: `${property.subtitle} · ${property.price}`, info: propertyFacts[property.title], palette: propertyPalettes[property.title], link: "", alt: property.alt })), [featured]);

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
        <a href="#top" className="brand" aria-label="Nestly home">
          <span className="brand-mark"><span /><span /></span>
          <span>Nestly</span>
        </a>
        <nav className="main-nav" aria-label="Main navigation">
          <a href="/explore">Explore homes</a>
          <a href="#roommates" onClick={(event) => { event.preventDefault(); showInterest("Roommate matching is coming next"); }}>Find a roommate</a>
          <a href="#stories">Stories</a>
        </nav>
        <div className="header-actions">
          <button type="button" className="text-button header-login" onClick={() => startLogin()}>Sign in</button>
          <button type="button" className="button button--dark button--small" onClick={() => { window.location.href = "/owner"; }}>List your place <ArrowUpRight size={15} /></button>
        </div>
      </header>
      <StaggeredMenu items={mobileMenuItems} socialItems={[{ label: "hello@nestly.place", link: "mailto:hello@nestly.place" }]} colors={["#d9e3d3", "#bc7d5b"]} accentColor="#bc7d5b" />

      <main id="top">
        <section className="hero-section">
          <div className="hero-content">
            <div className="hero-copy">
              <span className="announcement"><Sparkles size={13} /> A softer way to move</span>
              <h1>Find a place that feels like <em>you.</em></h1>
              <p className="hero-subcopy">Homes, rooms, and housemates with a little more care behind them. Search less. Feel at home sooner.</p>
              <div className="hero-actions">
                <button type="button" className="button button--peach" onClick={() => { window.location.href = "/explore"; }}>Find my next place <ArrowUpRight size={17} /></button>
                <button type="button" className="button button--ghost-light" onClick={() => { window.location.href = "/owner"; }}>I have a place to list <ArrowRight size={17} /></button>
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

        <section className="trust-strip" aria-label="Nestly highlights" data-reveal="up">
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
          <AccordionGallery items={accordionItems} defaultIndex={-1} accentColor="#C27855" overlayColor="#1F1E1D" textColor="#FAF8F5" height={390} gap={12} radius={16} expandRatio={0.68} duration={1.15} parallax={0.45} tilt={5} trigger="hover" grayscale showLabels className="property-accordion" />
        </section>

        <section className="flip-section section-pad" id="stories" data-reveal="up">
          <div className="flip-copy"><span className="eyebrow eyebrow--light">Turn the card</span><h2>Because a home is more than <em>four walls.</em></h2><p>Get the little details that make the big decision easier. Tap a card to see the story behind the listing.</p><button type="button" className="button button--outline-light" onClick={() => showInterest("We’ll show you the good stuff first")}>Get early access <ArrowUpRight size={16} /></button></div>
          <div className="flip-cards" data-reveal="scale"><FlipCard item={properties[1]} index={0} /><FlipCard item={properties[2]} index={1} /><FlipCard item={properties[3]} index={2} /></div>
        </section>

        <section className="owner-section section-pad" id="owners" data-reveal="up">
          <div className="owner-visual"><div className="owner-image"><img src="https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1400&q=85&auto=format&fit=crop" alt="Bright home interior ready for its next resident" /><div className="owner-image-note"><BadgeCheck size={18} /><span>Thoughtful homes<br /><strong>find good people</strong></span></div></div><div className="owner-badge"><span>For the<br /><em>people</em><br />with keys</span><ArrowUpRight size={20} /></div></div>
          <div className="owner-copy"><span className="eyebrow">Have a place to share?</span><h2>Your space has a <em>story.</em></h2><p>Let’s tell it properly. Nestly helps owners show up with the right details, reach people who care, and make the next handover feel like a welcome.</p><ul><li><span><Check size={14} /></span>Qualify interest before you open the door</li><li><span><Check size={14} /></span>List with clear, honest information</li><li><span><Check size={14} /></span>Keep every conversation in one place</li></ul><button type="button" className="button button--dark" onClick={() => { window.location.href = "/owner"; }}>List your place <ArrowUpRight size={17} /></button><span className="owner-footnote"><ShieldCheck size={15} /> No listing fee while we’re getting started</span></div>
        </section>

        <section className="closing-section section-pad" data-reveal="up"><div className="closing-inner"><span className="eyebrow">Your next place is out there</span><h2>Make room for <em>what’s next.</em></h2><p>Join the early list for thoughtful homes, honest listings, and a calmer way to move.</p><button type="button" className="button button--peach" onClick={() => showInterest("You’re on the early list")}>Join the early list <ArrowUpRight size={17} /></button><div className="closing-squiggle">⌁</div></div></section>
      </main>

      <footer className="site-footer"><div className="footer-top"><div className="footer-brand"><a href="#top" className="brand brand--footer"><span className="brand-mark"><span /><span /></span><span>Nestly</span></a><p>Find the place<br />that finds you back.</p></div><div className="footer-links"><div><span>Explore</span><a href="/explore">Homes</a><a href="#how-it-works">How it works</a><a href="#stories">Stories</a></div><div><span>For owners</span><a href="#owners">List your place</a><a href="#owners">Owner guide</a><a href="#owners">Good to know</a></div><div><span>Say hello</span><a href="mailto:hello@nestly.place">hello@nestly.place</a><a href="#top">Instagram <MoveUpRight size={13} /></a><a href="#top">LinkedIn <MoveUpRight size={13} /></a></div></div></div><div className="footer-bottom"><span>© 2026 Nestly Technologies</span><span>Made for people in motion <Heart size={13} fill="currentColor" /></span><div><a href="#top">Privacy</a><a href="#top">Terms</a></div></div></footer>
    </div>
  );
}

export default Home;
