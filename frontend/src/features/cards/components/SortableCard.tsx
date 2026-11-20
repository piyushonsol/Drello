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

import type { ReactNode } from "react";
import { useSortable } from "@dnd-kit/react/sortable";

// Props parent component se aati hain.
// Parent har card ke liye uski identity, list aur current position bhejta hai.
type Props = {
  cardId: string; // MongoDB mein card ki unique ID
  listId: string; // Ye card currently kis list mein hai
  index: number; // List ke andar card ki current position (0, 1, 2...)
  children: ReactNode; // Actual card UI, jo CardItem render karta hai
};

export default function SortableCard({
  cardId,
  listId,
  index,
  children,
}: Props) {
  // useSortable is particular card ko drag-and-drop system mein register karta hai.
  // Isse library ko pata chalta hai:
  // - Kaunsa card drag ho raha hai?       -> id
  // - Card kis position par hai?          -> index
  // - Card kis list/group ka member hai?  -> group
  // - Kaunse type ke elements accept hain? -> accept
  const { ref, isDragging } = useSortable({
    id: cardId, // Card ki unique identity; drag ke time isi se identify hoga
    index, // Current position; parent se updated value aani chahiye
    group: listId, // List ki identity; move hone par destination listId milega
    type: "card", // Is draggable element ka type "card" hai
    accept: "card", // Ye card-type elements ko accept kar sakta hai
  });

  return (
    // ref library ko actual DOM element se connect karta hai.
    // Isi div par drag-and-drop registration apply hoti hai.
    <div
      ref={ref}
      // isDragging true hone par dragged card thoda transparent dikhega.
      // Ye sirf visual effect hai; card ki position ya data nahi badalta.
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      {/* Actual card ka UI yahan render hota hai.
          SortableCard khud title, description ya delete button nahi banata. */}
      {children}
    </div>
  );
}
