import { useEffect } from 'react';
import imgImages2 from '../../imports/LoadingScreen/f0a8549691ab94315d50ba5365ad279f69dba35e.png';
import { imgImages1 } from '../../imports/LoadingScreen/svg-ifi0o';

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-[#fdffec] overflow-hidden flex items-center justify-center" data-name="Loading Screen">
      {/* Decorative asterisks - matching homepage style */}
      <div className="absolute top-12 left-12 text-6xl" style={{ color: '#F5A623', opacity: 0.6 }}>✱</div>
      <div className="absolute top-20 right-24 text-5xl" style={{ color: '#F5A623', opacity: 0.5 }}>✱</div>
      <div className="absolute top-32 right-16 text-4xl" style={{ color: '#F5A623', opacity: 0.4 }}>✱</div>
      <div className="absolute bottom-32 left-16 text-5xl" style={{ color: '#F5A623', opacity: 0.5 }}>✱</div>
      <div className="absolute bottom-24 left-32 text-7xl" style={{ color: '#F5A623', opacity: 0.7 }}>✱</div>
      <div className="absolute top-40 left-24 text-5xl" style={{ color: '#F5A623', opacity: 0.5 }}>✱</div>
      <div className="absolute bottom-48 right-32 text-6xl" style={{ color: '#F5A623', opacity: 0.6 }}>✱</div>
      <div className="absolute top-1/3 left-20 text-4xl" style={{ color: '#B8D35F', opacity: 0.4 }}>✱</div>
      <div className="absolute top-1/4 right-1/4 text-5xl" style={{ color: '#B8D35F', opacity: 0.3 }}>✱</div>

      {/* Centered Wellspring Logo */}
      <div className="w-[200px] h-[200px] md:w-[300px] md:h-[300px] relative z-10" data-name="Wellspring Icon">
        <div className="absolute inset-0 aspect-square" style={{ maskImage: `url('${imgImages1}')`, maskSize: 'contain', maskPosition: 'center', maskRepeat: 'no-repeat' }} data-name="images 1">
          <img alt="Wellspring Logo" className="absolute inset-0 w-full h-full object-cover pointer-events-none" src={imgImages2} />
        </div>
      </div>
    </div>
  );
}
