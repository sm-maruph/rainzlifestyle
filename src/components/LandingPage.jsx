// src/components/LandingPage.jsx
import React from "react";
import Hero from "./Hero";
import NewArrival from "./NewArrival";
import CollectionShowcase from "./CollectionShowcase";
import FeaturedCategories from "./FeaturedCategories";
import LoadingWrapper from "./ReusableComponent/LoadingWrapper";
import SecondaryNav from ".././components/SecondaryNav";

const LandingComponent = () => {
  return (
    <>
      <LoadingWrapper>
        <Hero />
        <SecondaryNav />
        <NewArrival />
        <CollectionShowcase />
        <FeaturedCategories />
      </LoadingWrapper>

    </>
  );
};

export default LandingComponent;