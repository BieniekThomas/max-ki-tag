import { useEffect, useRef } from "react";

type AutoScrollProps = {
  children: React.ReactNode;
  style?: React.CSSProperties;
};

export const AutoScroll = ({ children, style }: AutoScrollProps) => {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.scrollTop = ref.current.scrollHeight;
    }
  }, [children]);

  return (
    <div
      ref={ref}
      style={{
        overflowY: "auto",
        ...style,
      }}
    >
      {children}
    </div>
  );
};
