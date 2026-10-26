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
  Menu,
  MoveUpRight,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  X,
} from "lucide-react";
import { toast } from "sonner";

type Property = {
  src: string;
  alt: string;
  title: string;
  subtitle: string;
  price: string;
  tag: string;
  detail: string;
};

const properties: Property[] = [
  {
    src: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1000&q=85&auto=format&fit=crop",
    alt: "Sunlit living room in a contemporary apartment",
    title: "The Courtyard Flat",
    subtitle: "Indiranagar, Bengaluru",
    price: "₹42,000 / month",
    tag: "Apartment",
    detail: "A breezy two-bedroom with a work-from-home nook, leafy balcony, and a community that feels like a small neighbourhood.",
  },
  {
    src: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1000&q=85&auto=format&fit=crop",
    alt: "Warm modern kitchen and dining room",
    title: "House on 9th",
    subtitle: "Kalyani Nagar, Pune",
    price: "₹68,000 / month",
    tag: "House",
    detail: "A calm three-bedroom home with generous light, a private garden, and the kind of kitchen that makes you want to host.",
  },
  {
    src: "https://images.unsplash.com/photo-1615529182904-14819c35db37?w=1000&q=85&auto=format&fit=crop",
    alt: "Minimal bedroom with neutral bedding",
    title: "Mango House PG",
    subtitle: "HSR Layout, Bengaluru",
    price: "₹18,500 / month",
    tag: "PG",
    detail: "A beautifully run co-living home with homemade dinners twice a week, quiet corners, and no mystery fee at move-in.",
  },
  {
    src: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1000&q=85&auto=format&fit=crop",
    alt: "Relaxed apartment lounge with soft daylight",
    title: "The Terrace Studio",
    subtitle: "Powai, Mumbai",
    price: "₹31,500 / month",
    tag: "Studio",
    detail: "A compact, character-filled studio with an enormous terrace and quick access to the lake, cafes, and a slower morning.",
  },
  {
    src: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1000&q=85&auto=format&fit=crop",
    alt: "Bright dining area with sculptural pendant light",
    title: "Palm Court",
    subtitle: "Alwarpet, Chennai",
    price: "₹54,000 / month",
    tag: "Apartment",
    detail: "A generous two-bedroom made for long lunches, with a resident manager and a move-in experience that is refreshingly clear.",
  },
  {
    src: "https://images.unsplash.com/photo-1600607688969-a5bfcd646154?w=1000&q=85&auto=format&fit=crop",
    alt: "Modern living space with textured walls",
    title: "The Brickline Home",
    subtitle: "Jubilee Hills, Hyderabad",
    price: "₹74,000 / month",
    tag: "House",
    detail: "A considered four-bedroom with a shaded courtyard, smart storage, and room for the people you want to keep close.",
  },
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
  const [mobileMenu, setMobileMenu] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const featured = useMemo(() => properties.slice(0, 4), []);

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
        <nav className={`main-nav ${mobileMenu ? "is-open" : ""}`} aria-label="Main navigation">
          <a href="#explore" onClick={() => setMobileMenu(false)}>Explore homes</a>
          <a href="#how-it-works" onClick={() => setMobileMenu(false)}>How it works</a>
          <a href="#owners" onClick={() => setMobileMenu(false)}>For owners</a>
          <a href="#stories" onClick={() => setMobileMenu(false)}>Stories</a>
        </nav>
        <div className="header-actions">
          <button type="button" className="text-button header-login" onClick={() => showInterest("Sign in is coming soon")}>Sign in</button>
          <button type="button" className="button button--dark button--small" onClick={() => scrollToId("owners")}>List your place <ArrowUpRight size={15} /></button>
        </div>
        <button type="button" className="mobile-menu-button" onClick={() => setMobileMenu((value) => !value)} aria-label={mobileMenu ? "Close menu" : "Open menu"}>
          {mobileMenu ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      <main id="top">
        <section className="hero-section">
          <div className="hero-content">
            <div className="hero-copy">
              <span className="announcement"><Sparkles size={13} /> A softer way to move</span>
              <h1>Find a place that feels like <em>you.</em></h1>
              <p className="hero-subcopy">Homes, rooms, and housemates with a little more care behind them. Search less. Feel at home sooner.</p>
              <div className="hero-actions">
                <button type="button" className="button button--peach" onClick={() => scrollToId("explore")}>Find my next place <ArrowUpRight size={17} /></button>
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
              <button type="button" className="search-submit" onClick={() => { showInterest(searchValue ? `We'll start with ${searchValue}` : "Tell us where you want to live"); scrollToId("explore"); }}><Search size={18} /> <span>Search homes</span></button>
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
            {featureCards.map((card) => { const Icon = card.icon; return <article className={`feature-card ${card.className}`} key={card.title} data-reveal="scale" style={{ "--reveal-delay": `${featureCards.indexOf(card) * 90}ms` } as CSSProperties}><span className="feature-icon"><Icon size={21} /></span><span className="eyebrow">{card.eyebrow}</span><h3>{card.title}</h3><p>{card.copy}</p><a href={card.eyebrow === "For owners" ? "#owners" : "#explore"}>See how it works <ArrowUpRight size={15} /></a></article>; })}
            <article className="feature-stamp"><span className="stamp-star">✳</span><span>Made for<br /><em>real life.</em></span><span className="stamp-arrow"><ArrowDownRight size={18} /></span></article>
          </div>
        </section>

        <section className="explore-section section-pad" id="explore" data-reveal="up">
          <div className="section-heading section-heading--row"><div><span className="eyebrow">A few good places</span><h2>Start with a feeling.</h2></div><a href="#explore" className="inline-link" onClick={(event) => { event.preventDefault(); showInterest("The full explore experience is coming soon"); }}>Explore all homes <ArrowUpRight size={16} /></a></div>
          <div className="property-grid">{featured.map((property, index) => <article className="property-card" key={property.title} data-reveal="scale" style={{ "--reveal-delay": `${index * 90}ms` } as CSSProperties}><div className="property-image-wrap"><img src={property.src} alt={property.alt} /><span className="property-tag">{property.tag}</span><button type="button" className="property-heart" onClick={() => showInterest(`${property.title} saved to your shortlist`)} aria-label={`Save ${property.title}`}><Heart size={17} /></button></div><div className="property-card__body"><div><h3>{property.title}</h3><p>{property.subtitle}</p></div><strong>{property.price}</strong></div></article>)}</div>
        </section>

        <section className="flip-section section-pad" id="stories" data-reveal="up">
          <div className="flip-copy"><span className="eyebrow eyebrow--light">Turn the card</span><h2>Because a home is more than <em>four walls.</em></h2><p>Get the little details that make the big decision easier. Tap a card to see the story behind the listing.</p><button type="button" className="button button--outline-light" onClick={() => showInterest("We’ll show you the good stuff first")}>Get early access <ArrowUpRight size={16} /></button></div>
          <div className="flip-cards" data-reveal="scale"><FlipCard item={properties[1]} index={0} /><FlipCard item={properties[2]} index={1} /><FlipCard item={properties[3]} index={2} /></div>
        </section>

        <section className="owner-section section-pad" id="owners" data-reveal="up">
          <div className="owner-visual"><div className="owner-image"><img src="https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1400&q=85&auto=format&fit=crop" alt="Bright home interior ready for its next resident" /><div className="owner-image-note"><BadgeCheck size={18} /><span>Thoughtful homes<br /><strong>find good people</strong></span></div></div><div className="owner-badge"><span>For the<br /><em>people</em><br />with keys</span><ArrowUpRight size={20} /></div></div>
          <div className="owner-copy"><span className="eyebrow">Have a place to share?</span><h2>Your space has a <em>story.</em></h2><p>Let’s tell it properly. Nestly helps owners show up with the right details, reach people who care, and make the next handover feel like a welcome.</p><ul><li><span><Check size={14} /></span>Qualify interest before you open the door</li><li><span><Check size={14} /></span>List with clear, honest information</li><li><span><Check size={14} /></span>Keep every conversation in one place</li></ul><button type="button" className="button button--dark" onClick={() => showInterest("Owner early access is open")}>List your place <ArrowUpRight size={17} /></button><span className="owner-footnote"><ShieldCheck size={15} /> No listing fee while we’re getting started</span></div>
        </section>

        <section className="closing-section section-pad" data-reveal="up"><div className="closing-inner"><span className="eyebrow">Your next place is out there</span><h2>Make room for <em>what’s next.</em></h2><p>Join the early list for thoughtful homes, honest listings, and a calmer way to move.</p><button type="button" className="button button--peach" onClick={() => showInterest("You’re on the early list")}>Join the early list <ArrowUpRight size={17} /></button><div className="closing-squiggle">⌁</div></div></section>
      </main>

      <footer className="site-footer"><div className="footer-top"><div className="footer-brand"><a href="#top" className="brand brand--footer"><span className="brand-mark"><span /><span /></span><span>Nestly</span></a><p>Find the place<br />that finds you back.</p></div><div className="footer-links"><div><span>Explore</span><a href="#explore">Homes</a><a href="#how-it-works">How it works</a><a href="#stories">Stories</a></div><div><span>For owners</span><a href="#owners">List your place</a><a href="#owners">Owner guide</a><a href="#owners">Good to know</a></div><div><span>Say hello</span><a href="mailto:hello@nestly.place">hello@nestly.place</a><a href="#top">Instagram <MoveUpRight size={13} /></a><a href="#top">LinkedIn <MoveUpRight size={13} /></a></div></div></div><div className="footer-bottom"><span>© 2026 Nestly Technologies</span><span>Made for people in motion <Heart size={13} fill="currentColor" /></span><div><a href="#top">Privacy</a><a href="#top">Terms</a></div></div></footer>
    </div>
  );
}

export default Home;
