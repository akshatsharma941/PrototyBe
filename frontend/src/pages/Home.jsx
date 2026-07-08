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
      background: 'var(--bg-primary)',
      position: 'relative'
    }}>
      {/* Ambient Background Orbs */}
      <div className="ambient-orb" style={{ 
        top: '-10%', left: '-5%', width: '40vw', height: '40vw', background: 'rgba(139, 92, 246, 0.15)' 
      }} />
      <div className="ambient-orb" style={{ 
        top: '40%', right: '-10%', width: '30vw', height: '30vw', background: 'rgba(59, 130, 246, 0.12)', animationDelay: '-5s' 
      }} />
      <div className="ambient-orb" style={{ 
        bottom: '-5%', left: '10%', width: '35vw', height: '35vw', background: 'rgba(16, 185, 129, 0.08)', animationDelay: '-2s' 
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <HeroSection />
        <WhyPyBeSection />
        <HowItWorksSection />
        <ComparisonSection />
        <AiCoachSection />
        <FinalCtaSection />
      </div>
    </div>
  );
};

export default Home;
