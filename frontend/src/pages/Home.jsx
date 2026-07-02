import React from 'react';
import HeroSection from '../components/home/HeroSection';
import WhyPyBeSection from '../components/home/WhyPyBeSection';
import HowItWorksSection from '../components/home/HowItWorksSection';
import ComparisonSection from '../components/home/ComparisonSection';
import AiCoachSection from '../components/home/AiCoachSection';
import FinalCtaSection from '../components/home/FinalCtaSection';

const Home = () => {
  return (
    <div style={{ 
      width: '100%', 
      height: '100%', 
      overflowY: 'auto', 
      overflowX: 'hidden',
      background: 'radial-gradient(circle at top, rgba(139, 92, 246, 0.05), transparent 60%)'
    }}>
      <HeroSection />
      <WhyPyBeSection />
      <HowItWorksSection />
      <ComparisonSection />
      <AiCoachSection />
      <FinalCtaSection />
    </div>
  );
};

export default Home;
