"use client";

interface CircuitCellProps {
  row: number;
  column: number;
  children?: React.ReactNode;
  onDrop: (
    gate: string,
    row: number,
    column: number
  ) => void;
  onClick: (
    row: number,
    column: number
  ) => void;
}

export default function CircuitCell({
  row,
  column,
  children,
  onDrop,
  onClick,
}: CircuitCellProps) {
  return (
    <div
      onDragOver={(event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "copy";
      }}
      onDrop={(event) => {
        event.preventDefault();

        const gate =
          event.dataTransfer.getData(
            "application/qubit-gate"
          );

        if (gate) {
          onDrop(gate, row, column);
        }
      }}
      onClick={() =>
        onClick(row, column)
      }
      className="relative flex h-16 min-w-20 flex-1 cursor-pointer items-center justify-center border-r border-white/[0.07] transition hover:bg-cyan-300/[0.035]"
    >
      <div className="absolute left-0 right-0 top-1/2 h-px bg-white/[0.13]" />

      {children}
    </div>
  );
}