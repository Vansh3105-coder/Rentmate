import { useMemo, useState, type CSSProperties } from "react";
import { ArrowUpRight, ChevronDown, Heart, MapPin, Search, SlidersHorizontal, Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import { properties, type Property } from "@/data/properties";
import PolaroidLineCarousel from "@/components/PolaroidLineCarousel";
import StaggeredMenu, { type StaggeredMenuItem } from "@/components/StaggeredMenu";
import "./ExploreHomes.css";

const typeFilters = ["All homes", "Apartment", "House", "PG", "Studio"];
const mobileMenuItems: StaggeredMenuItem[] = [
  { label: "Explore homes", ariaLabel: "Explore available homes", link: "/explore" },
  { label: "Find a roommate", ariaLabel: "Find a roommate", link: "/#roommates" },
  { label: "Stories", ariaLabel: "Read Nestora stories", link: "/#stories" },
  { label: "For owners", ariaLabel: "Learn about listing as an owner", link: "/#owners" },
];
const priceValue = (price: string) => Number(price.replace(/[^0-9]/g, ""));
const polaroidSlides = properties.map((property) => ({
  image: property.src,
  title: property.title,
  caption: `${property.subtitle} · ${property.price}`,
  alt: property.alt,
}));

function PropertyListingCard({ property, liked, onLike, index }: { property: Property; liked: boolean; onLike: () => void; index: number }) {
  return (
    <article className="explore-listing-card" style={{ "--explore-delay": `${index * 75}ms` } as CSSProperties}>
      <div className="explore-listing-card__image">
        <img src={property.src} alt={property.alt} loading="lazy" />
        <span className="explore-listing-card__tag">{property.tag}</span>
        <button type="button" className={`explore-heart ${liked ? "is-liked" : ""}`} onClick={onLike} aria-label={liked ? `Remove ${property.title} from saved homes` : `Save ${property.title}`}>
          <Heart size={17} fill={liked ? "currentColor" : "none"} />
        </button>
        <span className="explore-listing-card__availability"><Sparkles size={12} /> Thoughtfully listed</span>
      </div>
      <div className="explore-listing-card__body">
        <div className="explore-listing-card__heading">
          <div><h3>{property.title}</h3><p><MapPin size={13} /> {property.subtitle}</p></div>
          <strong>{property.price}</strong>
        </div>
        <p className="explore-listing-card__detail">{property.detail}</p>
        <div className="explore-listing-card__footer"><span>Verified details</span><button type="button" onClick={() => toast(`We’ll help you explore ${property.title}`)}>View home <ArrowUpRight size={14} /></button></div>
      </div>
    </article>
  );
}

export default function ExploreHomes() {
  const [query, setQuery] = useState(() => new URLSearchParams(window.location.search).get("q") || "");
  const [activeType, setActiveType] = useState("All homes");
  const [sort, setSort] = useState("curated");
  const [liked, setLiked] = useState<string[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filteredProperties = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const result = properties.filter((property) => {
      const matchesType = activeType === "All homes" || property.tag === activeType;
      const searchable = `${property.title} ${property.subtitle} ${property.tag} ${property.price} ${property.detail}`.toLowerCase();
      return matchesType && (!normalized || searchable.includes(normalized));
    });
    if (sort === "price-low") return [...result].sort((a, b) => priceValue(a.price) - priceValue(b.price));
    if (sort === "price-high") return [...result].sort((a, b) => priceValue(b.price) - priceValue(a.price));
    return result;
  }, [activeType, query, sort]);

  const toggleLike = (title: string) => setLiked((current) => current.includes(title) ? current.filter((item) => item !== title) : [...current, title]);

  return (
    <div className="explore-page">
      <header className="explore-header">
        <a href="/" className="brand" aria-label="Nestora home"><span className="brand-mark"><span /><span /></span><span>Nestora</span></a>
        <nav className="explore-header__nav" aria-label="Explore navigation"><a href="/">Home</a><a className="is-active" href="/explore">Explore homes</a><a href="/#owners">For owners</a></nav>
        <a href="/#owners" className="button button--dark button--small">For owners <ArrowUpRight size={15} /></a>
      </header>
      <StaggeredMenu items={mobileMenuItems} socialItems={[{ label: "hello@nestora.place", link: "mailto:hello@nestora.place" }]} colors={["#A8B99F", "#D79A57"]} accentColor="#D79A57" />

      <main>
        <section className="explore-hero explore-hero--polaroid">
          <div className="explore-hero__intro">
            <div className="explore-hero__copy"><span className="eyebrow">The Nestora edit</span><h1 className="explore-quote"><span className="explore-quote__accent">“Home is not a place,</span><span className="explore-quote__base">it’s a feeling.”</span></h1><p className="explore-hero__quote-author">— Cecelia Ahern</p><p>Thoughtful homes, clear details, and the little things that make moving feel less like a transaction.</p></div>
            <div className="explore-hero__note"><span className="explore-hero__number">{String(filteredProperties.length).padStart(2, "0")}</span><span>homes in<br />your first look</span></div>
          </div>
          <div className="explore-polaroid-frame">
            <PolaroidLineCarousel
              slides={polaroidSlides}
              height={500}
              cardWidth={238}
              sag={42}
              swing={1.1}
              autoplay={5000}
              string="#8f725f"
              background="transparent"
              ink="#342b25"
              ariaLabel="Featured Nestora homes"
            />
          </div>
        </section>

        <section className="explore-directory" aria-label="Available homes">
          <div className="explore-toolbar">
            <div className="explore-search"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search city, neighbourhood, or home" aria-label="Search homes" />{query && <button type="button" onClick={() => setQuery("")} aria-label="Clear search"><X size={16} /></button>}</div>
            <button type="button" className={`explore-filter-toggle ${filtersOpen ? "is-open" : ""}`} onClick={() => setFiltersOpen((open) => !open)}><SlidersHorizontal size={16} /> Filters <span>{activeType === "All homes" ? "" : "· 1"}</span></button>
            <label className="explore-sort"><span>Sort by</span><select value={sort} onChange={(event) => setSort(event.target.value)}><option value="curated">Curated for you</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option></select><ChevronDown size={15} /></label>
          </div>
          <div className={`explore-filters ${filtersOpen ? "is-open" : ""}`}><span>Show me</span>{typeFilters.map((filter) => <button type="button" key={filter} className={activeType === filter ? "is-active" : ""} onClick={() => setActiveType(filter)}>{filter}</button>)}</div>
          <div className="explore-results-head"><p><strong>{filteredProperties.length}</strong> homes to start with</p><span>{liked.length ? `${liked.length} saved` : "Save a home to come back to it"}</span></div>
          {filteredProperties.length ? <div className="explore-listing-grid">{filteredProperties.map((property, index) => <PropertyListingCard key={property.title} property={property} index={index} liked={liked.includes(property.title)} onLike={() => toggleLike(property.title)} />)}</div> : <div className="explore-empty"><span className="eyebrow">A quiet moment</span><h2>Nothing here yet.</h2><p>Try a different city, neighbourhood, or home type. We’re adding good places all the time.</p><button type="button" className="button button--peach" onClick={() => { setQuery(""); setActiveType("All homes"); }}>Reset search</button></div>}
        </section>
      </main>

      <footer className="explore-footer"><span>© 2026 Nestora Technologies</span><span>Made for people in motion</span><a href="/">Back to home <ArrowUpRight size={14} /></a></footer>
    </div>
  );
}
