import type { NextConfig } from 'next';


const isProduction = process.env.NODE_ENV === 'production';


const securityHeaders = [
  {
    key: 'X-Frame-Options',
    value: 'DENY', 
  },

  {
    key: 'X-Content-Type-Options',
    value: 'nosniff', 
  },

  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin', 
  },
  
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
    // camera=() → desactive la camera
    // microphone=() → desactive le micro
    // geolocation=() → desactive la geolocalisation
    // interest-cohort=() → desactive l'ancien mecanisme de tracking FLoC
  },

  ...(isProduction
    ? [
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=63072000; includeSubDomains; preload',

        },
      ]
    : []), 

  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",                    
      `script-src 'self' 'unsafe-inline' ${    
        isProduction ? '' : "'unsafe-eval'"    
      } https://js.stripe.com`,                 
      "frame-src https://js.stripe.com https://checkout.stripe.com https://hooks.stripe.com",  
      "connect-src 'self' https://api.stripe.com",  
      "img-src 'self' data: https:",            
      "style-src 'self' 'unsafe-inline'",       
      "font-src 'self' data:",                  
      "object-src 'none'",                      
      "base-uri 'self'",                        
      "form-action 'self' https://checkout.stripe.com",  
      "frame-ancestors 'none'",                 
    ].join('; '), 
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',          
        headers: securityHeaders,  
      },  
    ];
  },
};

export default nextConfig;