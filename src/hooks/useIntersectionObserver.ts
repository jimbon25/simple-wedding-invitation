import { useEffect, useState, useRef } from "react";

interface IntersectionObserverOptions {
  threshold?: number;
  root?: Element | null;
  rootMargin?: string;
  triggerOnce?: boolean;
}

const useIntersectionObserver = (
  options: IntersectionObserverOptions = {},
): [React.RefObject<any>, boolean] => {
  const {
    threshold = 0.1,
    root = null,
    rootMargin = "0px",
    triggerOnce = true,
  } = options;
  const [isIntersecting, setIntersecting] = useState(false);
  const ref = useRef<any>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIntersecting(true);
          if (triggerOnce && ref.current) {
            observer.unobserve(ref.current);
          }
        } else {
          if (!triggerOnce) {
            setIntersecting(false);
          }
        }
      },
      {
        threshold,
        root,
        rootMargin,
      },
    );

    const currentRef = ref.current; // Capture the current ref value
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [ref, threshold, root, rootMargin, triggerOnce]);

  return [ref, isIntersecting];
};

export default useIntersectionObserver;
