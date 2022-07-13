/* eslint-disable react/prop-types */
import { FC, useCallback } from "react";
import { Range, getTrackBackground } from "react-range";

const STEP = 1;

interface RangeSliderProps {
  left: number;
  right: number;
  onChange(values: { left: number; right: number }): void;
  min: number;
  max: number;
}

const RangeSlider: FC<RangeSliderProps> = ({
  left,
  right,
  onChange,
  min,
  max,
}) => {
  const _left = left - 1;

  const setValues = useCallback(
    ([left, right]: number[]) => {
      left = Math.min(left, -1);
      right = Math.max(right, 0);

      onChange({ left: left + 1, right });
    },
    [onChange]
  );

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        flexWrap: "wrap",
      }}
    >
      <Range
        values={[_left, right]}
        step={STEP}
        min={min}
        max={max}
        onChange={(values) => {
          setValues(values);
        }}
        renderTrack={({ props, children }) => (
          <div
            onMouseDown={props.onMouseDown}
            onTouchStart={props.onTouchStart}
            style={{
              ...props.style,
              height: "36px",
              display: "flex",
              width: "100%",
            }}
          >
            <div
              ref={props.ref}
              style={{
                height: "5px",
                width: "100%",
                borderRadius: "4px",
                background: getTrackBackground({
                  values: [_left, right],
                  colors: ["#ccc", "var(--bs-primary)", "#ccc"],
                  min: min,
                  max: max,
                }),
                alignSelf: "center",
              }}
            >
              {children}
            </div>
          </div>
        )}
        renderThumb={({ props, index, isDragged }) => (
          <div {...props} className="range-thumb">
            {isDragged && (
              <div
                style={{
                  position: "absolute",
                  top: "-45px",
                  color: "#fff",
                  fontWeight: "bold",
                  fontSize: "20px",
                  padding: "4px",
                  borderRadius: "4px",
                  backgroundColor: "var(--bs-primary)",
                }}
              >
                {[left, right][index]}
              </div>
            )}
          </div>
        )}
        renderMark={({ props, index: i }) => {
          const index = i * STEP + min;
          return (
            <div
              {...props}
              style={{
                ...props.style,
                marginTop: index === 0 || index === -1 ? "-13px" : "-5px",
                height: index === 0 || index === -1 ? "33px" : "16px",
                width: "1px",
                backgroundColor:
                  index * STEP <= right && index * STEP >= _left
                    ? "var(--bs-primary)"
                    : "#ccc",
              }}
            />
          );
        }}
      />
    </div>
  );
};

export default RangeSlider;
