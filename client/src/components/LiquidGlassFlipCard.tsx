import { useState, type CSSProperties, type KeyboardEvent } from "react";
import { ArrowUpRight, RotateCw } from "lucide-react";
import { motion } from "framer-motion";
import type { Property } from "@/data/properties";
import "./LiquidGlassFlipCard.css";

type LiquidGlassFlipCardProps = {
  property: Property;
  index: number;
};

export default function LiquidGlassFlipCard({ property, index }: LiquidGlassFlipCardProps) {
  const [flipped, setFlipped] = useState(false);

  const toggle = () => setFlipped((current) => !current);
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggle();
    }
  };

  return (
    <div
      className="liquid-glass-card-wrap"
      style={{ "--card-delay": `${index * 90}ms` } as CSSProperties}
    >
      <motion.div
        className={`liquid-glass-card ${flipped ? "is-flipped" : ""}`}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ type: "spring", stiffness: 70, damping: 14, mass: 1.05 }}
        tabIndex={0}
        role="button"
        aria-pressed={flipped}
        aria-label={`${flipped ? "Show photo of" : "Show details for"} ${property.title}`}
        onClick={toggle}
        onKeyDown={handleKeyDown}
      >
        <div className="liquid-glass-card__face liquid-glass-card__front">
          <img src={property.src} alt={property.alt} />
          <div className="liquid-glass-card__image-wash" />
          <div className="liquid-glass-card__glass" />
          <div className="liquid-glass-card__light-band" />
          <div className="liquid-glass-card__content">
            <span className="liquid-glass-card__eyebrow">{property.tag} · 0{index + 1}</span>
            <h3>{property.title}</h3>
            <p>{property.subtitle}</p>
          </div>
          <span className="liquid-glass-card__flip-hint"><RotateCw size={14} /> Tap to turn</span>
        </div>

        <div className="liquid-glass-card__face liquid-glass-card__back">
          <div className="liquid-glass-card__back-glow" />
          <div className="liquid-glass-card__content liquid-glass-card__content--back">
            <span className="liquid-glass-card__eyebrow">A little more context</span>
            <h3>{property.title}</h3>
            <p>{property.detail}</p>
            <strong className="liquid-glass-card__price">{property.price}</strong>
            <a href={`/explore?q=${encodeURIComponent(property.title)}`} className="liquid-glass-card__link" onClick={(event) => event.stopPropagation()}>
              Explore this home <ArrowUpRight size={15} />
            </a>
          </div>
          <span className="liquid-glass-card__flip-hint"><RotateCw size={14} /> Tap to return</span>
        </div>

        <span className="liquid-glass-card__rim" aria-hidden="true" />
        <span className="liquid-glass-card__spectrum" aria-hidden="true" />
      </motion.div>
    </div>
  );
}
