// LandingComponent.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import Hero from "./Hero";
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
  const navigate = useNavigate();

  const handleNavigate = (path) => {
    navigate(`/${path.toLowerCase().replace(/\s+/g, "-")}`);
  };

  return (
    <>
      <Hero />
      <ReusableComponentReverse
        title="About Us"
        description="Materials & More (M&M) is a trusted enterprise providing high-quality industrial and laboratory materials."
        description2=" They specialize in delivering reliable products and solutions to meet diverse business needs."
        image={aboutusImage}
        onButtonClick={() => handleNavigate("About Us")}
        buttonText="About M & M"
      />
      <ReusableComponent
        title="Equipment"
        description="We specialize in lab setup services, textile testing equipment, and instruments."
        description2="Ensure precision and reliability with our top-grade testing tools."
        image={equipmentImage}
        onButtonClick={() => handleNavigate("Equipment")}
        buttonText="More Equipment"
      />

      <ReusableComponentReverse
        title="Test Materials"
        description="We provide test materials for quality checks and assurance processes."
        description2="Reliable, certified consumables tailored for your lab’s needs."
        image={testmaterialsImage}
        onButtonClick={() => handleNavigate("Test Materials")}
        buttonText="More Materials"
      />

      <ReusableComponent
        title="Mold Prevention"
        description="Protect your textiles and labs with our advanced mold prevention solutions."
        description2="Effective and safe methods that maintain quality and hygiene."
        image={moldpreventionImage}
        onButtonClick={() => handleNavigate("Mold Prevention")}
        buttonText="Prevent Mold"
      />

      <ReusableComponentReverse
        title="Proficiency Test"
        description="Participate in our international proficiency testing programs."
        description2="Benchmark your lab performance and improve accuracy."
        image={proficiyancytestImage}
        onButtonClick={() => handleNavigate("Proficiency Test")}
        buttonText="Join Test"
      />

      <ReusableComponent
        title="Consultancy"
        description="Expert consultancy for lab setup, quality control, and system improvements."
        description2="Achieve excellence with tailored guidance and professional support."
        image={consultancyImage}
        onButtonClick={() => handleNavigate("Consultancy")}
        buttonText="View Consultancy"
      />

      <ReusableComponentReverse
        title="Calibration"
        description="Ensure your instruments are calibrated for the highest accuracy."
        description2="Certified calibration services with detailed documentation."
        image={calibrationImage}
        onButtonClick={() => handleNavigate("Calibration")}
        buttonText="Get Calibrated"
      />

      <ReusableComponent
        title="Others"
        description="We also provide a wide range of other laboratory services and products."
        description2="Explore our additional offerings customized for your business."
        image={othersImage}
        onButtonClick={() => handleNavigate("Others")}
        buttonText="Explore More"
      />

      <ReusableComponentReverse
        title="Contact Us"
        description="Reach out to us for any queries, custom orders, or support."
        description2="We're here to help you find the right solution."
        image={contactusImage}
        onButtonClick={() => handleNavigate("Contact Us")}
        buttonText="Get in Touch"
      />
    </>
  );
};

export default LandingComponent;
