import { forwardRef } from "react";

const BetSpot = forwardRef(function BetSpot(props, ref) {
  return (
    <div
      ref={ref}
      className="relative w-[500px] h-[500px] bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center rounded-lg shadow-lg border-2 border-red-300"
    >
      {/* <span className="text-white text-4xl font-bold">10</span> */}
    </div>
  );
});

export default BetSpot;
