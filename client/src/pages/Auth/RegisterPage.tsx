import RegisterForm from "../../components/RegisterForm";
import { Image } from "../../components/ui/Image";
import LogoIconBlack from "../../assets/icons/LogoIconBlack.svg";
import LaptopImage from "../../assets/icons/LaptopImage.svg";
import BackgroundImage from "../../assets/icons/Background.svg";
const RegisterPage: React.FC = () => {
  return (
    <div className="relative flex justify-center gap-20 items-center w-full h-screen  overflow-hidden ">
      <div className="z-50">
        <RegisterForm />
      </div>
      <Image src={BackgroundImage} className="absolute bottom-0 " />
      <Image src={LaptopImage} className="z-20 animate-rightIn  w-1/2" />
      <div className="absolute top-0 right-[60px]">
        <div className="flex justify-end">
          <Image src={LogoIconBlack} className="flex animate-rotate " />
          <h1 className="text-right text-6xl font-k2d">UNICHUB</h1>
        </div>
        <h2 className="font-k2d text-2xl text-wrap h-[70px] w-[450px] text-right">
          Welcome to web app for managing the educational process
        </h2>
      </div>
    </div>
  );
};

export default RegisterPage;
