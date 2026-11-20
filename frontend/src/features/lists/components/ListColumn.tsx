import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import type { BoardList } from "../../boards/types/board";
import type { Card } from "../../cards/types/card";
import SortableCard from "../../cards/components/SortableCard";
import DroppableList from "./DroppableList";
import CardItem from "../../cards/components/CardItem";

type Props = {
  list: BoardList;
  cards: Card[];
  deletingList: boolean;
  deletingCardId: string | null;
  onUpdateList: (listId: string, name: string) => Promise<void>;
  onDeleteList: (listId: string) => Promise<void>;
  onCreateCard: (listId: string, title: string, description: string) => Promise<void>;
  onUpdateCard: (cardId: string, title: string, description: string) => Promise<void>;
  onDeleteCard: (cardId: string) => Promise<void>;
};

export default function ListColumn({
  list,
  cards,
  deletingList,
  deletingCardId,
  onUpdateList,
  onDeleteList,
  onCreateCard,
  onUpdateCard,
  onDeleteCard,
}: Props) {
  const [editingList, setEditingList] = useState(false);
  const [listName, setListName] = useState(list.name);
  const [savingList, setSavingList] = useState(false);
  const [addingCard, setAddingCard] = useState(false);
  const [cardTitle, setCardTitle] = useState("");
  const [cardDescription, setCardDescription] = useState("");
  const [creatingCard, setCreatingCard] = useState(false);

  async function saveList(event: React.FormEvent) {
    event.preventDefault();
    if (!listName.trim()) return;
    setSavingList(true);
    try {
      await onUpdateList(list._id, listName.trim());
      setEditingList(false);
    } finally {
      setSavingList(false);
    }
  }

  async function addCard() {
    if (!cardTitle.trim()) return;
    setCreatingCard(true);
    try {
      await onCreateCard(list._id, cardTitle.trim(), cardDescription.trim());
      setCardTitle("");
      setCardDescription("");
      setAddingCard(false);
    } finally {
      setCreatingCard(false);
    }
  }

  return (
    <DroppableList listId={list._id} className="list-column">
      <div className="list-header">
        {editingList ? (
          <form className="edit-list-form" onSubmit={saveList}>
            <input
              type="text"
              value={listName}
              onChange={(event) => setListName(event.target.value)}
              autoFocus
            />
            <div className="list-edit-actions">
              <button type="submit" disabled={savingList || !listName.trim()}>
                {savingList ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                onClick={() => setEditingList(false)}
                disabled={savingList}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <>
            <h2>{list.name}</h2>
            <div className="list-header-actions">
              <button
                type="button"
                className="list-action-button"
                aria-label={`Edit ${list.name}`}
                title="Edit list"
                onClick={() => setEditingList(true)}
              >
                <Pencil size={15} strokeWidth={1.8} aria-hidden="true" />
              </button>
              <button
                type="button"
                className="list-action-button list-delete-button"
                aria-label={`Delete ${list.name}`}
                title="Delete list"
                disabled={deletingList}
                onClick={() => {
                  if (window.confirm("Delete this list and all its cards?")) {
                    void onDeleteList(list._id);
                  }
                }}
              >
                <Trash2 size={15} strokeWidth={1.8} aria-hidden="true" />
              </button>
            </div>
          </>
        )}
      </div>

      <div className="cards-container">
        {[...cards]
          .sort((a, b) => a.position - b.position)
          .map((card, index) => (
            <SortableCard
              key={card._id}
              cardId={card._id}
              listId={list._id}
              index={index}
            >
              <CardItem
                card={card}
                deleting={deletingCardId === card._id}
                onUpdate={onUpdateCard}
                onDelete={onDeleteCard}
              />
            </SortableCard>
          ))}
      </div>

      {addingCard ? (
        <div className="add-card-form">
          <input
            type="text"
            placeholder="Card title"
            value={cardTitle}
            onChange={(event) => setCardTitle(event.target.value)}
          />
          <textarea
            placeholder="Card description (optional)"
            value={cardDescription}
            onChange={(event) => setCardDescription(event.target.value)}
          />
          <div className="add-card-actions">
            <button
              type="button"
              onClick={() => void addCard()}
              disabled={creatingCard || !cardTitle.trim()}
            >
              {creatingCard ? "Adding..." : "Add Card"}
            </button>
            <button
              type="button"
              onClick={() => {
                setAddingCard(false);
                setCardTitle("");
                setCardDescription("");
              }}
              disabled={creatingCard}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className="add-card-button"
          onClick={() => setAddingCard(true)}
        >
          + Add card
        </button>
      )}
    </DroppableList>
  );
}
