import { motion } from "framer-motion";
import { Autoplay, EffectCards, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/effect-cards";
import "swiper/css/navigation";
import "swiper/css/pagination";
import type { Property } from "@/data/properties";
import "./PropertyCarousel.css";

type PropertyCarouselProps = {
  items: Property[];
  className?: string;
  showPagination?: boolean;
  showNavigation?: boolean;
  loop?: boolean;
  autoplay?: boolean;
  spaceBetween?: number;
};

export default function PropertyCarousel({
  items,
  className = "",
  showPagination = false,
  showNavigation = false,
  loop = true,
  autoplay = false,
  spaceBetween = 40,
}: PropertyCarouselProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className={`property-carousel ${className}`}
    >
      <Swiper
        spaceBetween={spaceBetween}
        autoplay={
          autoplay
            ? { delay: 2400, disableOnInteraction: false }
            : false
        }
        effect="cards"
        grabCursor
        loop={loop}
        pagination={showPagination ? { clickable: true } : false}
        navigation={showNavigation}
        className="property-carousel__swiper"
        modules={[EffectCards, Autoplay, Pagination, Navigation]}
      >
        {items.map((property) => (
          <SwiperSlide key={property.title} className="property-carousel__slide">
            <img src={property.src} alt={property.alt} />
            <div className="property-carousel__shade" />
            <div className="property-carousel__caption">
              <span className="property-carousel__tag">{property.tag}</span>
              <strong>{property.title}</strong>
              <span>{property.subtitle} · {property.price}</span>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </motion.div>
  );
}
