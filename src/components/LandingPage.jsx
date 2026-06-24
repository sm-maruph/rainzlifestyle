// src/components/LandingPage.jsx
import React from "react";
import Hero from "./Hero";
import NewArrival from "./NewArrival";
import CollectionShowcase from "./CollectionShowcase";
import FeaturedCategories from "./FeaturedCategories";

const LandingComponent = () => {
  return (
    <>
      <Hero />
      <NewArrival />
      <CollectionShowcase />
      <FeaturedCategories />
    </>
  );
};

export default LandingComponent;