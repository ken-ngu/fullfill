import { useState, useRef, useEffect } from "react";

interface Props {
  content: React.ReactNode;
  children: React.ReactNode;
  variant?: "icon" | "label";
}

type Position = "bottom" | "top" | "left" | "right";

export function Tooltip({ content, children, variant = "icon" }: Props) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState<Position>("bottom");
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Smart positioning: detect available space and position accordingly
  useEffect(() => {
    if (!isVisible || !triggerRef.current || !tooltipRef.current) return;

    const trigger = triggerRef.current.getBoundingClientRect();
    const tooltip = tooltipRef.current.getBoundingClientRect();
    const padding = 12; // Space between trigger and tooltip

    // Check available space in each direction
    const spaceBelow = window.innerHeight - trigger.bottom;
    const spaceAbove = trigger.top;
    const spaceRight = window.innerWidth - trigger.right;
    const spaceLeft = trigger.left;

    // Determine best position based on available space
    // Priority: bottom > top > right > left
    if (spaceBelow >= tooltip.height + padding) {
      setPosition("bottom");
    } else if (spaceAbove >= tooltip.height + padding) {
      setPosition("top");
    } else if (spaceRight >= tooltip.width + padding) {
      setPosition("right");
    } else if (spaceLeft >= tooltip.width + padding) {
      setPosition("left");
    } else {
      // If no space is ideal, use bottom and let it scroll
      setPosition("bottom");
    }
  }, [isVisible]);

  // Close on escape key
  useEffect(() => {
    if (!isVisible) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsVisible(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isVisible]);

  // Close when clicking outside
  useEffect(() => {
    if (!isVisible) return;

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (
        triggerRef.current &&
        tooltipRef.current &&
        !triggerRef.current.contains(e.target as Node) &&
        !tooltipRef.current.contains(e.target as Node)
      ) {
        setIsVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isVisible]);

  const handleToggle = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsVisible(!isVisible);
  };

  const handleMouseEnter = () => {
    // Only enable hover on non-touch devices
    if (!window.matchMedia('(hover: hover)').matches) return;
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    // Only enable hover on non-touch devices
    if (!window.matchMedia('(hover: hover)').matches) return;
    setIsVisible(false);
  };

  // Position-specific styles
  const getTooltipPositionStyles = (): string => {
    // On mobile: fixed positioning centered on screen
    // On desktop: absolute positioning relative to trigger
    const mobileStyles = "fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100vw-2rem)] max-w-[320px] z-50";
    const desktopBaseStyles = "absolute w-80 z-50";

    // Use fixed centered position on mobile screens
    if (window.innerWidth < 640) { // sm breakpoint
      return mobileStyles;
    }

    // Desktop positioning relative to trigger
    switch (position) {
      case "bottom":
        return `${desktopBaseStyles} left-1/2 -translate-x-1/2 top-full mt-2`;
      case "top":
        return `${desktopBaseStyles} left-1/2 -translate-x-1/2 bottom-full mb-2`;
      case "right":
        return `${desktopBaseStyles} left-full top-1/2 -translate-y-1/2 ml-2`;
      case "left":
        return `${desktopBaseStyles} right-full top-1/2 -translate-y-1/2 mr-2`;
      default:
        return `${desktopBaseStyles} left-1/2 -translate-x-1/2 top-full mt-2`;
    }
  };

  // Arrow position styles
  const getArrowStyles = (): string => {
    // Hide arrow on mobile (since tooltip is centered, arrow doesn't point to trigger)
    const baseStyles = "hidden sm:block absolute";

    switch (position) {
      case "bottom":
        return `${baseStyles} left-1/2 -translate-x-1/2 bottom-full border-8 border-transparent border-b-slate-900`;
      case "top":
        return `${baseStyles} left-1/2 -translate-x-1/2 top-full border-8 border-transparent border-t-slate-900`;
      case "right":
        return `${baseStyles} right-full top-1/2 -translate-y-1/2 border-8 border-transparent border-r-slate-900`;
      case "left":
        return `${baseStyles} left-full top-1/2 -translate-y-1/2 border-8 border-transparent border-l-slate-900`;
      default:
        return `${baseStyles} left-1/2 -translate-x-1/2 bottom-full border-8 border-transparent border-b-slate-900`;
    }
  };

  if (variant === "label") {
    // Hoverable label variant - no separate icon
    return (
      <div
        ref={triggerRef}
        className="relative inline-flex cursor-help touch-none"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleToggle}
        onTouchStart={(e) => {
          // On touch devices, prevent hover and just toggle
          e.preventDefault();
          handleToggle(e);
        }}
      >
        <div className="border-b border-dotted border-slate-400 hover:border-slate-600 active:border-blue-500 transition-colors">
          {children}
        </div>
        {isVisible && (
          <>
            {/* Mobile backdrop */}
            <div className="sm:hidden fixed inset-0 bg-black/30 z-40 animate-in fade-in duration-150" />
            <div ref={tooltipRef} className={getTooltipPositionStyles()}>
              <div className="bg-slate-900 text-white text-xs rounded-xl shadow-2xl p-4 border border-slate-700 animate-in fade-in duration-150">
                <div className="prose prose-invert prose-sm max-w-none">
                  {content}
                </div>
                <div className={getArrowStyles()} />
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  // Icon variant - small info icon
  return (
    <div ref={triggerRef} className="relative inline-flex">
      <button
        type="button"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleToggle}
        onTouchStart={(e) => {
          // On touch devices, prevent hover and just toggle
          e.stopPropagation();
          handleToggle(e);
        }}
        onFocus={handleMouseEnter}
        onBlur={handleMouseLeave}
        className="inline-flex items-center justify-center min-w-[44px] min-h-[44px] sm:w-3.5 sm:h-3.5 rounded-full bg-slate-300/60 hover:bg-slate-400/80 active:bg-slate-500 text-slate-600 hover:text-slate-800 text-[9px] font-medium transition-all duration-150 cursor-help ml-1 -my-5 sm:my-0"
        aria-label="More information"
      >
        <span className="text-xs sm:text-[9px]">i</span>
      </button>
      {isVisible && (
        <>
          {/* Mobile backdrop */}
          <div className="sm:hidden fixed inset-0 bg-black/30 z-40 animate-in fade-in duration-150" />
          <div ref={tooltipRef} className={getTooltipPositionStyles()}>
            <div className="bg-slate-900 text-white text-xs rounded-xl shadow-2xl p-4 border border-slate-700 animate-in fade-in duration-150">
              <div className="prose prose-invert prose-sm max-w-none">
                {content}
              </div>
              <div className={getArrowStyles()} />
            </div>
          </div>
        </>
      )}
      {children}
    </div>
  );
}
