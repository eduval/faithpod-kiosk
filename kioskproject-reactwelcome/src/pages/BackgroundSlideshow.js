import React, { useEffect, useState } from 'react';
import './BackgroundSlideshow.css';

const images = [
  '/external/image1.jpg',
  '/external/image10.jpg',
  '/external/image3.jpg',
  '/external/image4.jpg',
  '/external/image5.jpg',
  '/external/image6.jpg',
  '/external/image7.jpg',
  '/external/image8.jpg',
  '/external/image9.jpg',
  '/external/image10.jpg',
];

const BackgroundSlideshow = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 5000); // ⏱ Change image every 8 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="welcome-backgrounds">
      {images.map((src, index) => (
        <img
          key={index}
          src={src}
          alt={`Faith ${index}`}
          className={`bg-image ${index === current ? 'bg-visible' : ''}`}
          draggable="false"
        />
      ))}
    </div>
  );
};

export default BackgroundSlideshow;
