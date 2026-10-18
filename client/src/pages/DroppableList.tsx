import type { ReactNode } from "react";
import { useDroppable } from "@dnd-kit/react";
import { CollisionPriority } from "@dnd-kit/abstract";

type Props = {
  listId: string;
  className: string;
  children: ReactNode;
};

export default function DroppableList({ listId, className, children }: Props) {
  const { ref } = useDroppable({
    id: `list:${listId}`,
    type: "list",
    accept: "card",
    collisionPriority: CollisionPriority.Low,
  });

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
