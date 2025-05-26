import { cn } from "../../lib/utils";

interface ImageProps {
  src: any;
  className?: string;
  id?: string;
}
const Image: React.FC<ImageProps> = ({ src, className, id }) => {
  return (
    <>
      <img src={src} alt="" className={cn(className)} id={id} />
    </>
  );
};
export { Image };
