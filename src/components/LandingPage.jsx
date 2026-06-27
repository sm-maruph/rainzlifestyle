// src/components/LandingPage.jsx
import React from "react";
import Hero from "./Hero";
import NewArrival from "./NewArrival";
import CollectionShowcase from "./CollectionShowcase";
import FeaturedCategories from "./FeaturedCategories";
import LoadingWrapper from "./ReusableComponent/LoadingWrapper";

const LandingComponent = () => {
  return (
    <>
      <LoadingWrapper>
        <Hero />
        <NewArrival />
        <CollectionShowcase />
        <FeaturedCategories />
      </LoadingWrapper>

    </>
  );
};

export default LandingComponent;