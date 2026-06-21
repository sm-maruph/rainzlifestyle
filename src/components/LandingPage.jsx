// LandingComponent.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import Hero from "./Hero";
import { useEffect, useState } from "react";
import NewArrival from "./NewArrival";
import CollectionShowcase from "./CollectionShowcase";
import FeaturedCategories from "./FeaturedCategories";
import { getNewArrivals, getProductBySlug, getCategories } from "../api/mockApi";

import ReusableComponent from "./ReusableComponent";
import ReusableComponentReverse from "./ReusableComponentReverse";
// import ScrollToTop from "./subcomponent/ScrollToTop";
// import sectionImage from "../assets/global/calibration.webp";
import aboutusImage from "../assets/global/aboutus.webp"
import equipmentImage from "../assets/global/equipment.webp";
import testmaterialsImage from "../assets/global/test_materials.webp";
import moldpreventionImage from "../assets/global/mold_prevention.webp";
import proficiyancytestImage from "../assets/global/proficiency_test.webp";
import consultancyImage from "../assets/global/conseltancy.webp";
import calibrationImage from "../assets/global/calibration.webp";
import othersImage from "../assets/global/others.webp";
import contactusImage from "../assets/global/contactus.webp";

const LandingComponent = () => {
  const [newArrivals, setNewArrivals] = useState([]);
  const [product, setProduct] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    getNewArrivals(12).then(setNewArrivals);
    getProductBySlug("product-slug").then(setProduct);
    getCategories().then(setCategories);
  }, []);

  const navigate = useNavigate();

  const handleNavigate = (path) => {
    navigate(`/${path.toLowerCase().replace(/\s+/g, "-")}`);
  };

  return (
    <>
      <Hero />
      <NewArrival products={newArrivals} />
      <CollectionShowcase />
      <FeaturedCategories />


    </>
  );
};

export default LandingComponent;
