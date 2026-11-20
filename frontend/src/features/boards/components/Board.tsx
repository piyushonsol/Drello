import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { DragDropProvider, type DragEndEvent } from "@dnd-kit/react";
import { isSortable } from "@dnd-kit/react/sortable";
import "../../../styles/Board.css";
import ListColumn from "../../lists/components/ListColumn";
import { useBoard } from "../hooks/useBoard";

export default function Board() {
  const { boardId } = useParams();
  const navigate = useNavigate();
  const {
    board,
    lists,
    cards,
    loading,
    error,
    setError,
    createList,
    updateList,
    deleteList,
    createCard,
    updateCard,
    deleteCard,
    moveCard,
  } = useBoard(boardId);

  const [showListForm, setShowListForm] = useState(false);
  const [listName, setListName] = useState("");
  const [creatingList, setCreatingList] = useState(false);
  const [deletingListId, setDeletingListId] = useState<string | null>(null);
  const [deletingCardId, setDeletingCardId] = useState<string | null>(null);

  async function handleCreateList() {
    if (!listName.trim()) {
      setError("List name cannot be empty");
      return;
    }
    setCreatingList(true);
    setError("");
    try {
      await createList(listName.trim());
      setListName("");
      setShowListForm(false);
    } catch (createError) {
      setError(
        createError instanceof Error
          ? createError.message
          : "Failed to create list",
      );
    } finally {
      setCreatingList(false);
    }
  }

  async function handleUpdateList(listId: string, name: string) {
    setError("");
    try {
      await updateList(listId, name);
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : "Failed to update list",
      );
      throw updateError;
    }
  }

  async function handleDeleteList(listId: string) {
    setDeletingListId(listId);
    setError("");
    try {
      await deleteList(listId);
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Failed to delete list",
      );
    } finally {
      setDeletingListId(null);
    }
  }

  async function handleCreateCard(
    listId: string,
    title: string,
    description: string,
  ) {
    setError("");
    try {
      await createCard(listId, title, description);
    } catch (createError) {
      setError(
        createError instanceof Error
          ? createError.message
          : "Failed to create card",
      );
      throw createError;
    }
  }

  async function handleUpdateCard(
    cardId: string,
    title: string,
    description: string,
  ) {
    setError("");
    try {
      await updateCard(cardId, title, description);
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : "Failed to update card",
      );
      throw updateError;
    }
  }

  async function handleDeleteCard(cardId: string) {
    setDeletingCardId(cardId);
    setError("");
    try {
      await deleteCard(cardId);
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Failed to delete card",
      );
    } finally {
      setDeletingCardId(null);
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    if (event.canceled) return;

    const { source, target } = event.operation;
    if (!source || !target || !isSortable(source)) return;

    const sourceListId = String(source.initialGroup ?? "");
    const sourceIndex = source.initialIndex;
    let targetListId = "";
    let targetIndex: number;

    if (isSortable(target)) {
      targetListId = String(target.group ?? "");
      targetIndex = target.index;
    } else if (
      typeof target.id === "string" &&
      target.id.startsWith("list:")
    ) {
      targetListId = target.id.slice("list:".length);
      targetIndex = cards.filter((card) => card.list === targetListId).length;
    } else {
      return;
    }

    if (!sourceListId || !targetListId) return;
    await moveCard(sourceListId, sourceIndex, targetListId, targetIndex);
  }

  if (loading) return <main>Loading board...</main>;

  if (!board) {
    return <main>{error || "Board not found"}</main>;
  }

  return (
    <DragDropProvider onDragEnd={(event) => void handleDragEnd(event)}>
      <main className="board-page">
        <header className="board-header">
          <div>
            <p className="section-label">YOUR BOARD</p>
            <h1>{board.name}</h1>
            <p>{board.description || "No description"}</p>
          </div>
          <button
            type="button"
            className="back-button"
            onClick={() => navigate("/dashboard")}
          >
            ← Dashboard
          </button>
        </header>

        {error && <div className="board-error">{error}</div>}

        <section className="lists-container">
          {lists.map((list) => (
            <ListColumn
              key={list._id}
              list={list}
              cards={cards.filter((card) => card.list === list._id)}
              deletingList={deletingListId === list._id}
              deletingCardId={deletingCardId}
              onUpdateList={handleUpdateList}
              onDeleteList={handleDeleteList}
              onCreateCard={handleCreateCard}
              onUpdateCard={handleUpdateCard}
              onDeleteCard={handleDeleteCard}
            />
          ))}

          {showListForm ? (
            <div className="add-list-form">
              <input
                type="text"
                placeholder="List name"
                value={listName}
                onChange={(event) => setListName(event.target.value)}
              />
              <div className="add-list-actions">
                <button
                  type="button"
                  onClick={() => void handleCreateList()}
                  disabled={creatingList || !listName.trim()}
                >
                  {creatingList ? "Adding..." : "Add List"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowListForm(false);
                    setListName("");
                  }}
                  disabled={creatingList}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              className="add-list-button"
              onClick={() => setShowListForm(true)}
            >
              + Add another list
            </button>
          )}
        </section>
      </main>
    </DragDropProvider>
  );
}
