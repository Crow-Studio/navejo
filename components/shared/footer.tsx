import React from 'react';
import { Twitter, Github, Mail } from 'lucide-react';


const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    legal: [
      { name: 'Privacy', href: '#privacy' },
      { name: 'Terms', href: '#terms' }
    ]
  };

  const socialLinks = [
    { icon: Twitter, href: '#twitter', label: 'Twitter' },
    { icon: Github, href: '#github', label: 'GitHub' },
    { icon: Mail, href: '#email', label: 'Email' }
  ];

  return (
    <footer className="bg-black text-white border-t border-white/10 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-16">
        {/* Main Footer Content */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-8 md:space-y-0 mb-12">
          {/* Brand Section */}
          <div>
            <h3 className="text-2xl font-light mb-4">Navejo</h3>
            <p className="text-white/70 text-sm leading-relaxed mb-6">
              Organize your digital life with intelligent bookmark management.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  aria-label={social.label}
                  className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors duration-200"
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Legal Links */}
          <div className="flex space-x-6">
            {footerLinks.legal.map((link, index) => (
              <a
                key={index}
                href={link.href}
                className="text-white/70 hover:text-white transition-colors duration-200 text-sm"
              >
                {link.name}
              </a>
            ))}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-white/50 text-sm">
              © {currentYear} Navejo. All rights reserved.
            </p>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-white/70 text-sm">All systems operational</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;