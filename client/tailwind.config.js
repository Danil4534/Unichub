import { transform } from 'lodash';
import { keyframes } from 'motion';

/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme');
export default {
    darkMode: ["class"],
    content: [
      "./index.html",
      "./src/**",
    ],
    theme: {
    	extend: {
    		fontFamily: {
    			k2d: [
    				'K2D',
                    ...defaultTheme.fontFamily.sans
                ]
    		},
    		keyframes: {
    			fadeIn: {
    				'0%': {
    					height: 0,
    					transform: 'scale(0)'
    				},
    				'100%': {
    					height: '100%',
    					transform: 'scale(1)'
    				}
    			},
    			fadeInOpacity: {
    				'0%': {
					
    					opacity:0,
    					transform: 'translateY(100px)'
    				},
    				'100%': {
					
    					transform: 'translateY(0)',
						opacity:1,
    				}
    			},
    			rightIn: {
    				'0%': {
    					opacity: 0,
    					transform: 'translateX(500px)'
    				},
    				'100%': {
    					opacity: 1,
    					transform: 'translateX(0)'
    				}
    			},
    			bottomIn: {
    				'0%': {
    					opacity: 0,
    					transform: 'translateY(500px)'
    				},
    				'100%': {
    					opacity: 1,
    					transform: 'translateY(0)'
    				}
    			},
    			topIn: {
    				'0%': {
    					opacity: 0,
    					transform: 'translateY(-50px)'
    				},
    				'100%': {
    					opacity: 1,
    					transform: 'translateY(0)'
    				}
    			},
    			rotate: {
    				'0%': {
    					opacity: 0,
    					transform: 'rotate(0deg) scale(0)'
    				},
    				'100%': {
    					opacity: 1,
    					transform: 'rotate(360deg) scale(1)'
    				}
    			},
    			rotateHomePage: {
    				'0%': {
    					opacity: 1,
    					transform: 'rotate(0deg) scale(100)'
    				},
    				'100%': {
    					opacity: 1,
    					transform: 'rotate(360deg) scale(1)'
    				}
    			},
    			fadeOut: {
    				'0%': {
    					opacity: 1
    				},
    				'100%': {
    					transform: 'translateY(-500px)'
    				}
    			},
    			'accordion-down': {
    				from: {
    					height: '0'
    				},
    				to: {
    					height: 'var(--radix-accordion-content-height)'
    				}
    			},
    			'accordion-up': {
    				from: {
    					height: 'var(--radix-accordion-content-height)'
    				},
    				to: {
    					height: '0'
    				}
    			}
    		},
    		animation: {
    			fadeIn: 'fadeIn 0.8s linear',
    			topIn: 'topIn 1s linear',
    			fadeInOpacity: 'fadeInOpacity 0.5s ease forwards',
    			rightIn: 'rightIn 0.8s ease-in-out',
    			rotateHomePage: 'rotateHomePage 0.8s ease-in-out',
    			rotate: 'rotate 0.8s ease-in-out',
    			bottomIn: 'bottomIn 3s ease-in',
    			fadeOut: 'fadeOut 0.5s ease-in-out forwards',
    			bottomInWithDelay: 'bottomIn 3s ease-in',
    			'accordion-down': 'accordion-down 0.2s ease-out',
    			'accordion-up': 'accordion-up 0.2s ease-out'
    		},
    		borderRadius: {
    			lg: 'var(--radius)',
    			md: 'calc(var(--radius) - 2px)',
    			sm: 'calc(var(--radius) - 4px)'
    		},
    		colors: {
    			background: 'hsl(var(--background))',
    			foreground: 'hsl(var(--foreground))',
    			card: {
    				DEFAULT: 'hsl(var(--card))',
    				foreground: 'hsl(var(--card-foreground))'
    			},
    			popover: {
    				DEFAULT: 'hsl(var(--popover))',
    				foreground: 'hsl(var(--popover-foreground))'
    			},
    			primary: {
    				DEFAULT: 'hsl(var(--primary))',
    				foreground: 'hsl(var(--primary-foreground))'
    			},
    			secondary: {
    				DEFAULT: 'hsl(var(--secondary))',
    				foreground: 'hsl(var(--secondary-foreground))'
    			},
    			muted: {
    				DEFAULT: 'hsl(var(--muted))',
    				foreground: 'hsl(var(--muted-foreground))'
    			},
    			accent: {
    				DEFAULT: 'hsl(var(--accent))',
    				foreground: 'hsl(var(--accent-foreground))'
    			},
    			destructive: {
    				DEFAULT: 'hsl(var(--destructive))',
    				foreground: 'hsl(var(--destructive-foreground))'
    			},
    			border: 'hsl(var(--border))',
    			input: 'hsl(var(--input))',
    			ring: 'hsl(var(--ring))',
    			chart: {
    				'1': 'hsl(var(--chart-1))',
    				'2': 'hsl(var(--chart-2))',
    				'3': 'hsl(var(--chart-3))',
    				'4': 'hsl(var(--chart-4))',
    				'5': 'hsl(var(--chart-5))'
    			}
    		}
    	}
    },
    plugins: [require("tailwindcss-animate")],
  }