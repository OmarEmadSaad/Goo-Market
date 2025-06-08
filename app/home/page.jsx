"use client";
import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import { Typography } from "@material-tailwind/react";
import HomeCard from "./HomeCard";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts } from "../ReduxSystem/productSlice";

import "swiper/css";
import "swiper/css/autoplay";
import Loading from "../loding/page";
import Error from "../erro/page";

const Home = () => {
  const dispatch = useDispatch();
  const { products, categories, status, error } = useSelector(
    (state) => state.products
  );

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchProducts());
    }
  }, [dispatch, status]);

  if (status === "loading") {
    return <Loading />;
  }

  if (status === "failed") {
    return <Error error={error} />;
  }

  return (
    <div className="p-4 min-h-screen flex items-center justify-center">
      <div className="w-full max-w-6xl">
        {categories.length === 0 ? (
          <Typography variant="h5" className="text-center">
            No products available
          </Typography>
        ) : (
          categories.map((category, index) => (
            <div key={category} className="mb-8">
              <Typography
                variant="h4"
                color="green"
                className="mb-4 text-center"
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Typography>
              <Swiper
                className="w-full"
                spaceBetween={50}
                slidesPerView={1}
                centeredSlides={true}
                breakpoints={{
                  640: { slidesPerView: 2, centeredSlides: false },
                  768: { slidesPerView: 3, centeredSlides: false },
                  1024: { slidesPerView: 4, centeredSlides: false },
                }}
                autoplay={{
                  delay: 5000 + index * 2000,
                  disableOnInteraction: false,
                }}
                modules={[Autoplay]}
              >
                {products[category]?.map((product) => (
                  <SwiperSlide key={product.id}>
                    <motion.div
                      className="flex justify-center"
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      whileHover={{ scale: 1.05 }}
                    >
                      <HomeCard product={product} />
                    </motion.div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Home;
