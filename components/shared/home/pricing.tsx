'use client'
import React, { useState } from 'react';
import { Check } from 'lucide-react';
import Button from '@/components/shared/button';
import GrainOverlay from '@/components/shared/GrainOverlay';
import { pricingPlans, faqData } from '@/data/pricing';

const PricingSection = () => {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <GrainOverlay />
      
      <div className="relative z-10 px-4 md:px-8 py-12 md:py-20 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-light mb-6 leading-tight">
            Simple Pricing for <span className="text-white/80">Organized Minds</span>
          </h1>
          <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
            Start free, upgrade when you need more power. No surprises, no complex tiers.
          </p>
        </div>

        {/* Toggle */}
        <div className="flex justify-center mb-12">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-1 border border-white/20">
            <div className="flex">
              <button
                onClick={() => setIsYearly(false)}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  !isYearly 
                    ? 'bg-white text-black' 
                    : 'text-white/70 hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setIsYearly(true)}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  isYearly 
                    ? 'bg-white text-black' 
                    : 'text-white/70 hover:text-white'
                }`}
              >
                Yearly
                <span className="ml-2 bg-black text-gray-50 text-xs px-2 py-1 rounded-full">
                  Save 20%
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-20">
          {pricingPlans.map((plan) => (
            <div
              key={plan.name}
              className={`relative bg-white/5 backdrop-blur-sm rounded-xl border p-8 hover:bg-white/10 transition-all duration-200 ${
                plan.popular 
                  ? 'border-white/40 shadow-2xl' 
                  : 'border-white/20 hover:border-white/30'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-white text-black px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="text-center mb-8">
                <h3 className="text-xl font-semibold text-white mb-2">{plan.name}</h3>
                <p className="text-white/70 mb-6">{plan.description}</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-white">
                    ${isYearly ? plan.price.yearly : plan.price.monthly}
                  </span>
                  <span className="text-white/70">/month</span>
                </div>
                <Button
                  className={`w-full ${
                    plan.buttonVariant === 'primary'
                      ? 'bg-white text-black hover:bg-gray-100'
                      : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
                  }`}
                >
                  {plan.buttonText}
                </Button>
              </div>
              
              <div className="space-y-4">
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-center">
                    <Check className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
                    <span className="text-white/80">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto mb-20">
          <h2 className="text-3xl md:text-4xl font-light text-center text-white mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-6">
            {faqData.map((faq, index) => (
              <div key={index} className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                <h3 className="font-semibold text-white mb-2">{faq.question}</h3>
                <p className="text-white/70">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-12 border border-white/20">
          <h2 className="text-3xl md:text-4xl font-light text-white mb-4">
            Ready to organize your digital life?
          </h2>
          <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto">
            Join thousands of developers and creators who&apos;ve already transformed their bookmark chaos into organized knowledge.
          </p>
          <Button className="bg-white text-black hover:bg-gray-100 uppercase px-8 py-4 text-lg font-medium">
            Start Your Free Trial
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PricingSection;