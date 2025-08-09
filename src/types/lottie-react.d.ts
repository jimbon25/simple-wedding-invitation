declare module "lottie-react" {
  import * as React from "react";
  export interface LottieProps {
    animationData: any;
    loop?: boolean;
    autoplay?: boolean;
    style?: React.CSSProperties;
    [key: string]: any;
  }
  const Lottie: React.FC<LottieProps>;
  export default Lottie;
}
