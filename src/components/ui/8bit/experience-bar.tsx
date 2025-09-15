import { BitProgressProps, Progress } from "@/components/ui/8bit/progress";

interface ManaBarProps extends React.ComponentProps<"div"> {
  className?: string;
  props?: BitProgressProps;
  variant?: "retro" | "default";
  value?: number;
}

export default function ExperienceBar({
  className,
  variant,
  value,
  ...props
}: ManaBarProps) {
  return (
    <Progress
      {...props}
      value={value}
      variant={variant}
      className={className}
      progressBg="bg-green-500"
    />
  );
}
