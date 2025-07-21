import React from "react";
import { HeroHighlightComponent } from "./HeroHighlight";


const HeroSection = () => {
  return (
    <section id="hero" className="relative w-full h-100vh">
      <HeroHighlightComponent />
    </section>
  );
};

export default HeroSection;
