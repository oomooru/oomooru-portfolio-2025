import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

type Section = 'PROFILE' | 'SKILL SET' | 'TIMELINE' | 'PROJECT' | 'CONTACT';
const SECTIONS: Section[] = ['PROFILE', 'SKILL SET', 'TIMELINE', 'PROJECT', 'CONTACT'];

const PATH_DATA = {
  PROFILE: "M50 30 C40 30 35 40 35 50 L35 60 C35 70 40 80 50 80 S65 70 65 60 L65 50 C65 40 60 30 50 30Z",
  'SKILL SET': "M50,25 L55.9,42.5 L74.5,42.5 L60.2,54.2 L65.5,71.5 L50,60.5 L34.5,71.5 L39.8,54.2 L25.5,42.5 L44.1,42.5 Z",
  TIMELINE: "M50 20 L50 50 L75 65 M50 10 C77.6 10 100 32.4 100 60 C100 87.6 77.6 110 50 110 C22.4 110 0 87.6 0 60 C0 32.4 22.4 10 50 10 Z",
  PROJECT: "M30 20 L70 20 L70 80 L30 80 Z M40 30 L60 30 M40 40 L60 40 M40 50 L50 50",
  CONTACT: "M15 25 L85 25 L85 75 L15 75 Z M15 25 L50 55 L85 25",
};

const MorphingSvgBackground = ({ activeSection }: { activeSection: Section }) => {
  return (
    <div className="fixed top-0 left-0 w-full h-full -z-10 opacity-10 pointer-events-none">
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
        <motion.path
          d={PATH_DATA[activeSection]}
          fill="none"
          stroke="white"
          strokeWidth="2"
          initial={{ d: PATH_DATA['PROFILE'] }}
          animate={{ d: PATH_DATA[activeSection] }}
          transition={{ duration: 1, ease: "easeInOut" }}
        />
      </svg>
    </div>
  );
};

const useAnimatedText = (targetText: string) => {
  const [animatedText, setAnimatedText] = useState(targetText);
  const animationFrameId = useRef<number | null>(null);
  const isAnimating = useRef(false);

  useEffect(() => {
    if (isAnimating.current || animatedText === targetText) {
      return;
    }

    isAnimating.current = true;
    let currentText = animatedText;

    const shrink = () => {
      if (currentText.length > 0) {
        currentText = currentText.slice(0, -1);
        const randomChars = Array.from({ length: currentText.length }, () =>
          String.fromCharCode(65 + Math.random() * 26)
        ).join('');
        setAnimatedText(randomChars);
        animationFrameId.current = window.setTimeout(shrink, 50);
      } else {
        grow();
      }
    };

    const grow = () => {
      if (currentText.length < targetText.length) {
        currentText = targetText.slice(0, currentText.length + 1);
        setAnimatedText(currentText);
        animationFrameId.current = window.setTimeout(grow, 70);
      } else {
        isAnimating.current = false;
      }
    };

    shrink();

    return () => {
      if (animationFrameId.current) {
        clearTimeout(animationFrameId.current);
      }
      isAnimating.current = false;
    };
  }, [targetText]);

  return animatedText;
};

const WaveCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frameId: number;
    let phase = 0;
    const waveSpeed = 0.02;
    const waveAmplitude = 20;
    const waveFrequency = 0.01;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = 100;
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      ctx.moveTo(0, canvas.height / 2);

      for (let x = 0; x < canvas.width; x++) {
        const y = Math.sin(x * waveFrequency + phase) * waveAmplitude + canvas.height / 2;
        ctx.lineTo(x, y);
      }

      ctx.strokeStyle = 'white';
      ctx.lineWidth = 1;
      ctx.stroke();

      phase += waveSpeed;
      frameId = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed bottom-0 left-0 w-full h-[100px] pointer-events-none"
    />
  );
};

export default function App() {
  const [activeSection, setActiveSection] = useState<Section>('PROFILE');
  const sectionRefs = useRef(new Map<Section, HTMLElement | null>());

  useEffect(() => {
    const observerCallback: IntersectionObserverCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id as Section);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, {
      root: null,
      rootMargin: '0px',
      threshold: 0.5,
    });

    const refs = sectionRefs.current;
    refs.forEach((el) => {
      if (el) {
        observer.observe(el);
      }
    });

    return () => {
      const refs = sectionRefs.current;
      refs.forEach((el) => {
        if (el) {
          observer.unobserve(el);
        }
      });
    };
  }, []);

  const animatedSectionName = useAnimatedText(activeSection);

  return (
    <div className="bg-black text-white min-h-screen font-sans select-none">
      <MorphingSvgBackground activeSection={activeSection} />
      
      <header className="fixed top-10 left-1/2 -translate-x-1/2 w-[95%] max-w-full z-50">
        <nav className="flex justify-between items-center bg-black/10 backdrop-blur-md border border-white/50 rounded-full pb-5 pt-4 pl-8 pr-8">
          <a href="#" className="flex items-center font-bold text-xl tracking-wider">OOMOORU</a>
          <ul className="hidden md:flex items-center space-x-6">
            {SECTIONS.map((section) => (
              <li key={section}>
                <a
                  href={`#${section}`}
                  className={`flex items-center text-sm uppercase tracking-widest transition-all duration-300 ${
                    activeSection === section
                      ? 'font-extrabold text-white'
                      : 'font-medium text-gray-300'
                  } hover:font-extrabold hover:text-white`}
                >
                  {section}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <div className="fixed top-1/2 left-10 -translate-y-1/2 w-1/2 h-full flex items-center justify-end pointer-events-none z-0">
        <h1
          className="text-[12vw] lg:text-[10rem] font-black uppercase break-words text-right text-transparent"
          style={{
            WebkitTextStroke: '1px rgba(255, 255, 255, 0.7)',
          }}
        >
          {animatedSectionName}
        </h1>
      </div>
      
      <WaveCanvas />

      <main className="relative z-10">
        <div className="flex">
          <div className="w-1/2 hidden lg:block"></div>
          <div className="w-full lg:w-1/2">
            {SECTIONS.map((id) => (
              <section
                key={id}
                id={id}
                ref={(el) => {
                  sectionRefs.current.set(id, el);
                }}
                className="min-h-screen flex items-center justify-center p-8 lg:p-16"
              >
                <div className="w-full max-w-md">
                  <h2 className="text-3xl font-bold mb-4 uppercase tracking-widest">{id}</h2>
                  <p className="text-gray-300">
                    임시 텍스트입니다. 포트폴리오 제작 중.
                  </p>
                </div>
              </section>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
