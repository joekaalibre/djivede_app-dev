// 📁 src/components/ui/switch.tsx
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cva } from "class-variance-authority";
import clsx from "clsx";
import React from "react";

const switchStyles = cva(
  "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
  {
    variants: {
      checked: {
        true: "bg-coaching-primary",
        false: "bg-gray-200",
      },
    },
  }
);

export const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitive.Root
    ref={ref}
    className={clsx(switchStyles({ checked: props.checked }), className)}
    {...props}
  >
    <SwitchPrimitive.Thumb
      className={clsx(
        "pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform",
        "data-[state=checked]:translate-x-5",
        "data-[state=unchecked]:translate-x-0"
      )}
    />
  </SwitchPrimitive.Root>
));
Switch.displayName = "Switch";
