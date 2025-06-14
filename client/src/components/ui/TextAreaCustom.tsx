import * as React from "react";

import { useMotionTemplate, useMotionValue, motion } from "motion/react";
import { cn } from "../../lib/utils";

export interface TextAreaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const TextAreaCustom = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className, ...props }, ref) => {
    const radius = 100;
    const [visible, setVisible] = React.useState(false);

    let mouseX = useMotionValue(0);
    let mouseY = useMotionValue(0);

    function handleMouseMove({ currentTarget, clientX, clientY }: any) {
      let { left, top } = currentTarget.getBoundingClientRect();

      mouseX.set(clientX - left);
      mouseY.set(clientY - top);
    }
    return (
      <motion.div
        style={{
          background: useMotionTemplate`
        radial-gradient(
          ${visible ? radius + "px" : "0px"} circle at ${mouseX}px ${mouseY}px,
          #34d399,
          transparent 80%
        )
      `,
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        className={cn(
          "group/input rounded-xl p-[2px] transition duration-300",
          className
        )}
      >
        <textarea
          className={cn(
            `invalid:border-red-600 shadow-input  dark:placeholder-black flex h-10 w-full rounded-xl border-b-2 light:bg-white px-3 py-2 text-sm text-black transition duration-400 group-hover/input:shadow-lg dark:border-b-emerald-500  file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-black  focus-visible:ring-neutral-400 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-black  dark:focus-visible:ring-neutral-600`,
            className
          )}
          ref={ref}
          {...props}
        />
      </motion.div>
    );
  }
);
TextAreaCustom.displayName = "Textarea";

export { TextAreaCustom };
