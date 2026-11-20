import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import type { Card } from "../types/card";

type Props = {
  card: Card;
  deleting: boolean;
  onUpdate: (cardId: string, title: string, description: string) => Promise<void>;
  onDelete: (cardId: string) => Promise<void>;
};

export default function CardItem({
  card,
  deleting,
  onUpdate,
  onDelete,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description ?? "");
  const [saving, setSaving] = useState(false);


  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (!title.trim()) return;

    setSaving(true);
    try {
      await onUpdate(card._id, title.trim(), description.trim());
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card-item">
      {editing ? (
        <form className="edit-card-form" onSubmit={save}>
          <input
            type="text"
            placeholder="Card title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            autoFocus
          />
          <textarea
            placeholder="Card description (optional)"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
          <div className="card-edit-actions">
            <button type="submit" disabled={saving || !title.trim()}>
              {saving ? "Saving..." : "Save changes"}
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              disabled={saving}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <>
          <h3>{card.title}</h3>
          {card.description && <p>{card.description}</p>}
          <div className="card-actions">
            <button
              type="button"
              className="card-action-button"
              aria-label={`Edit ${card.title}`}
              title="Edit card"
              onClick={() => setEditing(true)}
            >
              <Pencil size={15} strokeWidth={1.8} aria-hidden="true" />
            </button>
            <button
              type="button"
              className="card-action-button card-delete-button"
              aria-label={`Delete ${card.title}`}
              title="Delete card"
              disabled={deleting}
              onClick={() => {
                if (window.confirm("Are you sure you want to delete this card?")) {
                  void onDelete(card._id);
                }
              }}
            >
              <Trash2 size={15} strokeWidth={1.8} aria-hidden="true" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
