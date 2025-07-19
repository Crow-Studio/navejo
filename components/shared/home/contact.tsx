'use client';
import React, { useState } from 'react';
import { Mail, MessageCircle, Send } from 'lucide-react';


const ContactSection = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });


const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
    // Reset form
    setFormData({ name: '', email: '', message: '' });
};

const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
        ...formData,
        [e.target.name]: e.target.value
    });
};

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
      
      <div className="relative z-10 px-4 md:px-8 py-20 max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-light mb-6 leading-tight">
            Get in <span className="text-white/60">Touch</span>
          </h1>
          <p className="text-lg text-white/70 max-w-xl mx-auto">
            Have a question or want to work together? We&apos;d love to hear from you.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Contact Info */}
          <div className="space-y-8">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-medium mb-1">Email</h3>
                <p className="text-white/70">hello@navejo.com</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-medium mb-1">Support</h3>
                <p className="text-white/70">We typically respond within 24 hours</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/20">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <input
                  type="text"
                  name="name"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all duration-200"
                />
              </div>

              <div>
                <input
                  type="email"
                  name="email"
                  placeholder="Your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all duration-200"
                />
              </div>

              <div>
                <textarea
                  name="message"
                  placeholder="Your message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all duration-200 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-white text-black py-3 px-6 rounded-lg font-medium hover:bg-gray-100 transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>Send Message</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactSection;