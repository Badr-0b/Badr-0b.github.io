Scroll Animations Skill

Expert knowledge for scroll-triggered animations, parallax effects, and scroll-linked interactions that create immersive storytelling experiences.



When to Use

Activate this skill when:



User wants animations triggered by scrolling

Building parallax scrolling effects

Creating scroll-linked progress indicators

Implementing reveal-on-scroll patterns

Building horizontal scroll sections

Need scroll-based storytelling

File Patterns

\*\*/\*.tsx with scroll-related hooks

\*\*/hooks/useScroll\*.ts

Files with ScrollTrigger imports

Files with useScroll, useInView from framer-motion

Intersection Observer usage

Scroll Animation Libraries

Framer Motion Scroll

import { motion, useScroll, useTransform, useInView } from 'framer-motion';

GSAP ScrollTrigger

import gsap from 'gsap';

import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

Intersection Observer (Native)

const observer = new IntersectionObserver(callback, options);

Framer Motion Patterns

Basic Scroll Progress

import { motion, useScroll, useTransform } from 'framer-motion';



function ScrollProgress() {

&#x20; const { scrollYProgress } = useScroll();



&#x20; return (

&#x20;   <motion.div

&#x20;     className="fixed top-0 left-0 h-1 bg-blue-500 origin-left"

&#x20;     style={{ scaleX: scrollYProgress }}

&#x20;   />

&#x20; );

}

Parallax Effect

function Parallax() {

&#x20; const { scrollY } = useScroll();



&#x20; // Background moves slower than foreground

&#x20; const backgroundY = useTransform(scrollY, \[0, 1000], \[0, -200]);

&#x20; const foregroundY = useTransform(scrollY, \[0, 1000], \[0, -400]);



&#x20; return (

&#x20;   <div className="relative h-screen overflow-hidden">

&#x20;     <motion.div

&#x20;       className="absolute inset-0 bg-cover bg-center"

&#x20;       style={{ y: backgroundY, backgroundImage: 'url(bg.jpg)' }}

&#x20;     />

&#x20;     <motion.div

&#x20;       className="relative z-10"

&#x20;       style={{ y: foregroundY }}

&#x20;     >

&#x20;       <h1>Foreground Content</h1>

&#x20;     </motion.div>

&#x20;   </div>

&#x20; );

}

Element-Linked Scroll

function ElementParallax() {

&#x20; const ref = useRef(null);

&#x20; const { scrollYProgress } = useScroll({

&#x20;   target: ref,

&#x20;   offset: \['start end', 'end start'], // When to start/end tracking

&#x20; });



&#x20; const opacity = useTransform(scrollYProgress, \[0, 0.5, 1], \[0, 1, 0]);

&#x20; const y = useTransform(scrollYProgress, \[0, 1], \[100, -100]);



&#x20; return (

&#x20;   <motion.div

&#x20;     ref={ref}

&#x20;     style={{ opacity, y }}

&#x20;     className="h-screen flex items-center justify-center"

&#x20;   >

&#x20;     Content that fades and moves with scroll

&#x20;   </motion.div>

&#x20; );

}

useInView for Reveal

import { motion, useInView } from 'framer-motion';



function RevealOnScroll({ children }: { children: React.ReactNode }) {

&#x20; const ref = useRef(null);

&#x20; const isInView = useInView(ref, {

&#x20;   once: true,         // Only trigger once

&#x20;   margin: '-100px',   // Trigger 100px before entering viewport

&#x20; });



&#x20; return (

&#x20;   <motion.div

&#x20;     ref={ref}

&#x20;     initial={{ opacity: 0, y: 50 }}

&#x20;     animate={isInView ? { opacity: 1, y: 0 } : {}}

&#x20;     transition={{ duration: 0.5, ease: 'easeOut' }}

&#x20;   >

&#x20;     {children}

&#x20;   </motion.div>

&#x20; );

}

GSAP ScrollTrigger Patterns

Basic Scroll-Triggered Animation

import { useGSAP } from '@gsap/react';

import gsap from 'gsap';

import { ScrollTrigger } from 'gsap/ScrollTrigger';



gsap.registerPlugin(ScrollTrigger);



function Component() {

&#x20; const containerRef = useRef(null);



&#x20; useGSAP(() => {

&#x20;   gsap.from('.reveal-item', {

&#x20;     y: 100,

&#x20;     opacity: 0,

&#x20;     duration: 1,

&#x20;     stagger: 0.2,

&#x20;     scrollTrigger: {

&#x20;       trigger: '.reveal-container',

&#x20;       start: 'top 80%',

&#x20;       end: 'bottom 20%',

&#x20;       toggleActions: 'play none none reverse',

&#x20;       // markers: true, // Debug

&#x20;     },

&#x20;   });

&#x20; }, { scope: containerRef });



&#x20; return (

&#x20;   <div ref={containerRef}>

&#x20;     <div className="reveal-container">

&#x20;       <div className="reveal-item">Item 1</div>

&#x20;       <div className="reveal-item">Item 2</div>

&#x20;       <div className="reveal-item">Item 3</div>

&#x20;     </div>

&#x20;   </div>

&#x20; );

}

Scrub Animation (Linked to Scroll Position)

useGSAP(() => {

&#x20; gsap.to('.progress-bar', {

&#x20;   scaleX: 1,

&#x20;   ease: 'none',

&#x20;   scrollTrigger: {

&#x20;     trigger: '.content',

&#x20;     start: 'top top',

&#x20;     end: 'bottom bottom',

&#x20;     scrub: true, // Links animation to scroll position

&#x20;   },

&#x20; });

});

Pin Section (Sticky Animation)

useGSAP(() => {

&#x20; const tl = gsap.timeline({

&#x20;   scrollTrigger: {

&#x20;     trigger: '.pin-section',

&#x20;     start: 'top top',

&#x20;     end: '+=300%', // 3x viewport height of scrolling

&#x20;     pin: true,

&#x20;     scrub: 1,

&#x20;   },

&#x20; });



&#x20; tl.to('.step-1', { opacity: 0 })

&#x20;   .to('.step-2', { opacity: 1 })

&#x20;   .to('.step-2', { opacity: 0 })

&#x20;   .to('.step-3', { opacity: 1 });

});

Horizontal Scroll Section

useGSAP(() => {

&#x20; const panels = gsap.utils.toArray('.panel');



&#x20; gsap.to(panels, {

&#x20;   xPercent: -100 \* (panels.length - 1),

&#x20;   ease: 'none',

&#x20;   scrollTrigger: {

&#x20;     trigger: '.horizontal-container',

&#x20;     pin: true,

&#x20;     scrub: 1,

&#x20;     snap: 1 / (panels.length - 1),

&#x20;     end: () => '+=' + document.querySelector('.horizontal-container')!.offsetWidth,

&#x20;   },

&#x20; });

});

Intersection Observer (Native)

Custom useInView Hook

import { useState, useEffect, useRef, RefObject } from 'react';



interface InViewOptions {

&#x20; threshold?: number | number\[];

&#x20; rootMargin?: string;

&#x20; triggerOnce?: boolean;

}



export function useInView<T extends HTMLElement>(

&#x20; options: InViewOptions = {}

): \[RefObject<T>, boolean] {

&#x20; const { threshold = 0, rootMargin = '0px', triggerOnce = false } = options;

&#x20; const ref = useRef<T>(null);

&#x20; const \[inView, setInView] = useState(false);



&#x20; useEffect(() => {

&#x20;   const element = ref.current;

&#x20;   if (!element) return;



&#x20;   const observer = new IntersectionObserver(

&#x20;     (\[entry]) => {

&#x20;       if (entry.isIntersecting) {

&#x20;         setInView(true);

&#x20;         if (triggerOnce) {

&#x20;           observer.unobserve(element);

&#x20;         }

&#x20;       } else if (!triggerOnce) {

&#x20;         setInView(false);

&#x20;       }

&#x20;     },

&#x20;     { threshold, rootMargin }

&#x20;   );



&#x20;   observer.observe(element);

&#x20;   return () => observer.disconnect();

&#x20; }, \[threshold, rootMargin, triggerOnce]);



&#x20; return \[ref, inView];

}



// Usage

function Component() {

&#x20; const \[ref, inView] = useInView<HTMLDivElement>({ triggerOnce: true });



&#x20; return (

&#x20;   <div

&#x20;     ref={ref}

&#x20;     className={`transition-all duration-500 ${

&#x20;       inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'

&#x20;     }`}

&#x20;   >

&#x20;     Content reveals when scrolled into view

&#x20;   </div>

&#x20; );

}

Advanced Patterns

Scroll-Linked Text Reveal

function TextReveal() {

&#x20; const ref = useRef(null);

&#x20; const { scrollYProgress } = useScroll({

&#x20;   target: ref,

&#x20;   offset: \['start end', 'end start'],

&#x20; });



&#x20; const words = 'This text reveals word by word'.split(' ');



&#x20; return (

&#x20;   <p ref={ref} className="text-4xl font-bold">

&#x20;     {words.map((word, i) => {

&#x20;       const start = i / words.length;

&#x20;       const end = start + 1 / words.length;

&#x20;       const opacity = useTransform(

&#x20;         scrollYProgress,

&#x20;         \[start, end],

&#x20;         \[0.2, 1]

&#x20;       );



&#x20;       return (

&#x20;         <motion.span

&#x20;           key={i}

&#x20;           style={{ opacity }}

&#x20;           className="inline-block mr-2"

&#x20;         >

&#x20;           {word}

&#x20;         </motion.span>

&#x20;       );

&#x20;     })}

&#x20;   </p>

&#x20; );

}

Scroll-Based 3D Card

function Scroll3DCard() {

&#x20; const ref = useRef(null);

&#x20; const { scrollYProgress } = useScroll({

&#x20;   target: ref,

&#x20;   offset: \['start end', 'center center'],

&#x20; });



&#x20; const rotateX = useTransform(scrollYProgress, \[0, 1], \[45, 0]);

&#x20; const scale = useTransform(scrollYProgress, \[0, 1], \[0.8, 1]);

&#x20; const opacity = useTransform(scrollYProgress, \[0, 0.5], \[0, 1]);



&#x20; return (

&#x20;   <motion.div

&#x20;     ref={ref}

&#x20;     style={{

&#x20;       rotateX,

&#x20;       scale,

&#x20;       opacity,

&#x20;       transformPerspective: 1000,

&#x20;     }}

&#x20;     className="bg-white rounded-xl shadow-xl p-8"

&#x20;   >

&#x20;     Card content

&#x20;   </motion.div>

&#x20; );

}

Progress-Based Section Navigator

function SectionNavigator() {

&#x20; const sections = \['intro', 'features', 'pricing', 'contact'];

&#x20; const { scrollYProgress } = useScroll();



&#x20; const activeIndex = useTransform(

&#x20;   scrollYProgress,

&#x20;   sections.map((\_, i) => i / sections.length),

&#x20;   sections.map((\_, i) => i)

&#x20; );



&#x20; return (

&#x20;   <nav className="fixed right-4 top-1/2 -translate-y-1/2">

&#x20;     {sections.map((section, i) => (

&#x20;       <motion.button

&#x20;         key={section}

&#x20;         className="block w-3 h-3 rounded-full my-2"

&#x20;         style={{

&#x20;           backgroundColor: useTransform(

&#x20;             activeIndex,

&#x20;             \[i - 0.5, i, i + 0.5],

&#x20;             \['#ccc', '#3b82f6', '#ccc']

&#x20;           ),

&#x20;         }}

&#x20;         onClick={() => {

&#x20;           document.getElementById(section)?.scrollIntoView({ behavior: 'smooth' });

&#x20;         }}

&#x20;       />

&#x20;     ))}

&#x20;   </nav>

&#x20; );

}

Examples

Context: User wants elements to fade in as they scroll user: "Animate these cards to fade in when scrolling down" assistant: Using Framer Motion's useInView for reveal: ```tsx import { motion, useInView } from 'framer-motion';

function FadeInCard({ children, delay = 0 }) { const ref = useRef(null); const isInView = useInView(ref, { once: true, margin: '-50px' });



return ( <motion.div ref={ref} initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay, ease: 'easeOut' }} > {children} </motion.div> ); }



// Usage



{cards.map((card, i) => ( {card.content} ))}

``` Context: User needs a parallax hero section user: "Create a parallax scrolling effect for the hero" assistant: Using scroll-linked transforms for parallax: ```tsx function ParallaxHero() { const { scrollY } = useScroll();

const backgroundY = useTransform(scrollY, \[0, 500], \[0, 150]); const textY = useTransform(scrollY, \[0, 500], \[0, -100]); const opacity = useTransform(scrollY, \[0, 300], \[1, 0]);



return (



<motion.img src="https://raw.githubusercontent.com/lobbi-docs/claude/056cffc07fbde4d068ba90ae0b0b81de9fc6d357/plugins/react-animation-studio/skills/scroll-animations//hero-bg.jpg" className="absolute inset-0 w-full h-full object-cover" style={{ y: backgroundY }} /> <motion.div className="relative z-10 flex items-center justify-center h-full" style={{ y: textY, opacity }} >

Welcome

</motion.div>

); }

</example>



\## Related Skills



\- \*\*framer-motion\*\* - Core animation library

\- \*\*gsap\*\* - Advanced scroll triggers

\- \*\*transition-engineer\*\* - Page transitions



\## Author



Created by Brookside BI as part of React Animation Studio

