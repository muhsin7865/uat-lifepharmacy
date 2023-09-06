import { cn } from "@/lib/utils";
import React from "react";
import * as RadioGroup from "@radix-ui/react-radio-group";
function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-[#EAEAEB]", className)}
      {...props}
    />
  );
}

interface RadioProps
  extends RadioGroup.RadioGroupItemProps,
    React.RefAttributes<HTMLButtonElement> {
  labelContent?: React.ReactNode;
}

type RadioGroupProps = {
  className: any;
  children: React.ReactNode;
};

function RadioContainer({ className, children }: RadioGroupProps) {
  return (
    <>
      <RadioGroup.Root className={className} aria-label="View density">
        {children}
      </RadioGroup.Root>
    </>
  );
}

function RadioItem({ labelContent, ...props }: RadioProps) {
  return (
    <div className="flex space-x-2 rtl:space-x-reverse items-center">
      <RadioGroup.Item
        {...props}
        className="bg-white w-[20px] h-[20px] rounded-full  hover:bg-blue-100 border-blue-300 border  outline-none cursor-default duration-200 transition-all"
      >
        <RadioGroup.Indicator className="flex items-center justify-center w-full h-full relative after:content-[''] after:block after:w-[12px] after:h-[12px] after:rounded-[50%]  after:bg-blue-500" />
      </RadioGroup.Item>
      {labelContent && (
        <label
          htmlFor={props.id}
          className="text-[15px] leading-none capitalize"
        >
          {labelContent}
        </label>
      )}
    </div>
  );
}
export { Skeleton, RadioContainer, RadioItem };
