/* eslint-disable */
/*
    Installed from https://reactbits.dev/ts/tailwind/
*/

import { useEffect, useRef, FC } from "react";
import { gsap } from "gsap";

interface GridMotionProps {
  items?: string[];
  gradientColor?: string;
}

const GridMotion: FC<GridMotionProps> = ({
  items = [],
  gradientColor = "black",
}) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const mouseXRef = useRef<number>(window.innerWidth / 2);

  const numRows = 16;
  const numCols = 28;
  const totalCells = numRows * numCols;
  const pokemonSprites = Array.from({ length: totalCells }, (_, i) =>
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${(i % 28) + 1}.png`
  );

  // Animation: Move each row left/right based on mouse X
  useEffect(() => {
    gsap.ticker.lagSmoothing(0);

    const handleMouseMove = (e: MouseEvent): void => {
      mouseXRef.current = e.clientX;
    };

    const updateMotion = (): void => {
      const maxMoveAmount = 300;
      const baseDuration = 0.8;
      const inertiaFactors = [0.6, 0.4, 0.3, 0.2];

      // Animate each row in a wave pattern
      for (let row = 0; row < numRows; row++) {
        const rowEl = gridRef.current?.children[row] as HTMLDivElement | undefined;
        if (rowEl) {
          const direction = row % 2 === 0 ? 1 : -1;
          const moveAmount =
            ((mouseXRef.current / window.innerWidth) * maxMoveAmount -
              maxMoveAmount / 2) *
            direction;

          gsap.to(rowEl, {
            x: moveAmount,
            duration:
              baseDuration + inertiaFactors[row % inertiaFactors.length],
            ease: "power3.out",
            overwrite: "auto",
          });
        }
      }
    };

    const removeAnimationLoop = gsap.ticker.add(updateMotion);
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      removeAnimationLoop();
    };
  }, [numRows]);

  return (
    <div ref={gridRef} className="h-full w-full overflow-hidden">
      <section
        className="w-full h-screen overflow-hidden relative flex items-center justify-center"
        style={{
          background: `radial-gradient(circle, ${gradientColor} 0%, ${gradientColor} 100%)`,
        }}
      >
        {/* Single grid: fills the whole background */}
        <div
          className="grid gap-1 w-full h-full grid-rows-16 grid-cols-28 z-[2]"
        >
          {Array.from({ length: numRows * numCols }, (_, idx) => {
            const content = pokemonSprites[idx];
            return (
              <div key={idx} className="relative w-16 h-16">
                <div className="relative w-full h-full overflow-hidden rounded-[10px] bg-[#111]/10 flex items-center justify-center">
                  <img
                    src={content}
                    alt=""
                    className="w-14 h-14 object-contain z-10 drop-shadow-lg"
                    draggable={false}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default GridMotion;