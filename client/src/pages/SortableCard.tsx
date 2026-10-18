import type { ReactNode } from "react";
import { useSortable } from "@dnd-kit/react/sortable";

type Props = {
  cardId: string;
  listId: string;
  index: number;
  children: ReactNode;
};

export default function SortableCard({
  cardId,
  listId,
  index,
  children,
}: Props) {
  const { ref, isDragging } = useSortable({
    id: cardId,
    index,
    group: listId,
    type: "card",
    accept: "card",
  });

  return (
    <div ref={ref} style={{ opacity: isDragging ? 0.5 : 1 }}>
      {children}
    </div>
  );
}
