import React, { useEffect, useRef, useState } from "react";
import { Image } from "../components/ui/Image";
import Background from "../assets/icons/Background.svg";
import LogoIconBlack from "../assets/icons/LogoIconBlack.svg";
import { useNavigate } from "react-router-dom";

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const pageRef = useRef<HTMLDivElement>(null);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (!isFading) {
        setIsFading(true);
        setTimeout(() => {
          navigate("/");
        }, 500);
      }
    };

    window.addEventListener("scroll", handleScroll, { once: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [navigate, isFading]);

  return (
    <div
      ref={pageRef}
      className={`relative w-full h-[102vh] bg-white flex justify-center overflow-x-hidden overflow-y-hidden transition-opacity duration-500 ${
        isFading ? "animate-fadeInOpacity" : ""
      }`}
    >
      <div className="w-[450px] mt-20 z-20 flex flex-col items-center">
        <Image
          src={LogoIconBlack}
          className="w-[50px] animate-rotateHomePage"
        />
        <h1 className="font-k2d text-8xl text-center animate-fadeInOpacity">
          UNICHUB
        </h1>
        <h2 className="w-full text-center text-wrap font-k2d text-2xl animate-fadeInOpacity">
          Welcome to web app for managing the education process
        </h2>
      </div>

      <Image
        src={Background}
        className="absolute z-10 bottom-0 animate-bottomIn"
      />
    </div>
  );
};

export default HomePage;
