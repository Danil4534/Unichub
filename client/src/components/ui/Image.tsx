import { cn } from "../../lib/utils";

interface ImageProps {
  src: any;
  className?: string;
}
const Image: React.FC<ImageProps> = ({ src, className }) => {
  return (
    <>
      <img src={src} alt="" className={cn(className)} />
    </>
  );
};
export { Image };
