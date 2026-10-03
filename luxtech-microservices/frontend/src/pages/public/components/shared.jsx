import { useEffect, useRef, useState } from "react";

export const SectionContainer = ({
  children,
  id,
  className = "",
  py = "py-16 md:py-20",
}) => (
  <section id={id} className={`${py} ${className}`}>
    {children}
  </section>
);

export const ContentWrapper = ({
  children,
  className = "",
  maxWidth = "max-w-7xl",
}) => (
  <div className={`mx-auto w-full ${maxWidth} px-5 sm:px-8 lg:px-10 ${className}`}>
    {children}
  </div>
);

export const SectionHeader = ({
  title,
  highlightText,
  description,
  isVisible = true,
}) => (
  <div
    className={`max-w-3xl transition-all duration-700 ${
      isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
    }`}
  >
    <div className="h-1 w-10 bg-[#00bcd4]" />
    <h2 className="mt-5 text-3xl font-semibold tracking-tight text-[#102a43] md:text-4xl">
      {title}{" "}
      {highlightText && (
        <span className="text-[#0b5fc6]">{highlightText}</span>
      )}
    </h2>
    {description && (
      <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
        {description}
      </p>
    )}
  </div>
);

export const AnimatedElement = ({
  children,
  animation = "fade-up",
  delay = 0,
}) => (
  <div
    className="animate-[luxtechFadeUp_.65s_cubic-bezier(.22,1,.36,1)_both]"
    style={{ animationDelay: `${delay}ms` }}
    data-animation={animation}
  >
    {children}
  </div>
);

export const Button = ({
  children,
  onClick,
  variant = "primary",
  className = "",
  type = "button",
}) => {
  const variants = {
    primary: "bg-[#0b5fc6] text-white hover:bg-[#084eaa]",
    outline:
      "border border-slate-300 bg-white text-[#102a43] hover:border-[#0b5fc6] hover:text-[#0b5fc6]",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`inline-flex items-center justify-center px-5 py-3 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

export const GradientText = ({ children, className = "" }) => (
  <span className={`text-[#0b5fc6] ${className}`}>{children}</span>
);

export const FeatureCard = ({
  icon: Icon,
  title,
  description,
  features = [],
}) => (
  <article className="border border-slate-200 bg-white p-6 transition hover:border-[#9edee5] hover:bg-[#fbfdfe]">
    <div className="flex h-10 w-10 items-center justify-center bg-[#eaf7fa] text-[#0b5fc6]">
      <Icon size={19} />
    </div>
    <h3 className="mt-5 text-lg font-semibold text-[#102a43]">{title}</h3>
    <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
    {features.length > 0 && (
      <div className="mt-5 space-y-2">
        {features.map((f) => (
          <div key={f} className="flex gap-2 text-xs text-slate-600">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#00bcd4]" />
            {f}
          </div>
        ))}
      </div>
    )}
  </article>
);

export const useIntersectionObserver = () => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return [ref, visible];
};
