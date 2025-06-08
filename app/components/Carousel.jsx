"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/autoplay";

export function CarouselHome() {
  const images = [
    {
      src: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1470&q=80",
      alt: "Stylish Sneakers",
    },
    {
      src: "https://www.thecharlestoncitymarket.com/wp-content/uploads/2021/12/gallery.jpg",
      alt: "Casual Jacket",
    },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      <Swiper
        modules={[Autoplay]}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        loop={true}
        spaceBetween={10}
        slidesPerView={1}
      >
        {images.map((image, index) => (
          <SwiperSlide key={index}>
            <img
              src={image.src}
              alt={image.alt}
              className="w-full h-[300px] object-cover "
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
