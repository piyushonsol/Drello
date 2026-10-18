import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { DragDropProvider } from "@dnd-kit/react";
import { isSortable } from "@dnd-kit/react/sortable";
import SortableCard from "../pages/SortableCard";
import DroppableList from "../pages/DroppableList";
import "./Board.css";

import { Pencil, Trash2 } from "lucide-react";
type Board = {
  _id: string;
  name: string;
  description?: string;
};

type List = {
  _id: string;
  name: string;
  board: string;
};

type Card = {
  _id: string;
  title: string;
  description?: string;
  list: string;
  position: number;
};

function Board() {
  const { boardId } = useParams();

  const [board, setBoard] = useState<Board | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lists, setLists] = useState<List[]>([]);
  const [showListForm, setShowListForm] = useState(false);
  const [listName, setListName] = useState("");
  const [creatingList, setCreatingList] = useState(false);
  const [creatingCard, setCreatingCard] = useState(false);
  const [cards, setCards] = useState<Card[]>([]);

  const [activeListId, setActiveListId] = useState<string | null>(null);
  const [cardTitle, setCardTitle] = useState("");
  const [cardDescription, setCardDescription] = useState("");
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [editCardTitle, setEditCardTitle] = useState("");
  const [editCardDescription, setEditCardDescription] = useState("");
  const [updatingCard, setUpdatingCard] = useState(false);
  const [deletingCardId, setDeletingCardId] = useState<string | null>(null);

  const [editingListId, setEditingListId] = useState<string | null>(null);
  const [editListName, setEditListName] = useState("");
  const [updatingList, setUpdatingList] = useState(false);
  const [deletingListId, setDeletingListId] = useState<string | null>(null);

  // first get the board details and then get the lists for that board and then get the cards for all the lists .
  useEffect(() => {
    const fetchBoard = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("You are not logged in");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:5000/api/boards/${boardId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data = await response.json();

        if (!response.ok) {
          setError(data.message || "Failed to fetch board");
          return;
        }

        setBoard(data.board);
      } catch {
        setError("Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchBoard();
  }, [boardId]);

  // fetch the listd for the boards
  useEffect(() => {
    const fetchLists = async () => {
      const token = localStorage.getItem("token");

      if (!token || !boardId) {
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:5000/api/lists/board/${boardId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data = await response.json();

        if (!response.ok) {
          setError(data.message || "Failed to fetch lists");
          return;
        }

        setLists(data.lists);
      } catch {
        setError("Something went wrong");
      }
    };

    fetchLists();
  }, [boardId]);

  useEffect(() => {
    const fetchCards = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("you are not logged in ");
        return;
      }

      if (lists.length === 0) {
        setCards([]);
        return;
      }

      try {
        const cardGroups = await Promise.all(
          lists.map(async (list) => {
            const response = await fetch(
              `http://localhost:5000/api/cards/list/${list._id}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              },
            );

            const data = await response.json();

            if (!response.ok) {
              throw new Error(
                data.message || `Failed to fetch cards for ${list.name}`,
              );
            }

            return data.cards as Card[];
          }),
        );
        setCards(cardGroups.flat());
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Failed to fetch cards",
        );
      }
    };

    fetchCards();
  }, [lists]);

  const handleCreateList = async () => {
    if (!listName.trim()) {
      return;
    }

    const token = localStorage.getItem("token");

    if (!token || !boardId) {
      setError("You are not logged in");
      return;
    }

    setCreatingList(true);
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/lists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: listName.trim(),
          boardId: boardId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to create list");
        return;
      }

      setLists((prevLists) => [...prevLists, data.list]);

      setListName("");
      setShowListForm(false);
    } catch {
      setError("Something went wrong");
    } finally {
      setCreatingList(false);
    }
  };

  const handleCreateCard = async () => {
    if (!cardTitle.trim()) {
      setError("Card title cannot be empty");
      return;
    }

    if (!activeListId) {
      setError("Please select a list");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token || !boardId) {
      setError("You are not logged in");
      return;
    }

    setCreatingCard(true);
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/cards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: cardTitle.trim(),
          description: cardDescription.trim() || undefined,
          listId: activeListId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to create card");
        return;
      }

      setCards((cards) => [...cards, data.card]);

      setCardTitle("");
      setCardDescription("");
      setCreatingCard(false);
    } catch {
      setError("Something went wrong");
    } finally {
      setCreatingCard(false);
    }
  };

  const handleStartEditCard = (card: Card) => {
    setEditingCardId(card._id);
    setEditCardTitle(card.title);
    setEditCardDescription(card.description ?? "");
    setError("");
  };

  const handleCancelEditCard = () => {
    setEditingCardId(null);
    setEditCardTitle("");
    setEditCardDescription("");
  };

  const handleUpdateCard = async () => {
    if (!editingCardId) {
      return;
    }

    if (!editCardTitle.trim()) {
      setError("Card title cannot be empty");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setError("You are not logged in");
      return;
    }

    const cardId = editingCardId;

    setUpdatingCard(true);
    setError("");

    try {
      const response = await fetch(
        `http://localhost:5000/api/cards/${cardId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: editCardTitle.trim(),
            description: editCardDescription.trim(),
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to update card");
        return;
      }

      setCards((prevCards) =>
        prevCards.map((card) => (card._id === cardId ? data.card : card)),
      );

      handleCancelEditCard();
    } catch {
      setError("Something went wrong while updating the card");
    } finally {
      setUpdatingCard(false);
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this card?",
    );

    if (!confirmed) {
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setError("You are not logged in");
      return;
    }

    setDeletingCardId(cardId);
    setError("");

    try {
      const response = await fetch(
        `http://localhost:5000/api/cards/${cardId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to delete card");
        return;
      }

      setCards((prevCards) => prevCards.filter((card) => card._id !== cardId));
    } catch {
      setError("Something went wrong while deleting the card");
    } finally {
      setDeletingCardId(null);
    }
  };

  const handleStartEditList = (list: List) => {
    setEditingListId(list._id);
    setEditListName(list.name);
    setError("");
  };

  const handleCancelEditList = () => {
    setEditingListId(null);
    setEditListName("");
  };

  const handleUpdateList = async () => {
    if (!editingListId || !editListName.trim()) {
      setError("List name cannot be empty");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setError("You are not logged in");
      return;
    }

    const listId = editingListId;

    setUpdatingList(true);
    setError("");

    try {
      const response = await fetch(
        `http://localhost:5000/api/lists/${listId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: editListName.trim(),
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to update list");
        return;
      }

      setLists((prevLists) =>
        prevLists.map((list) => (list._id === listId ? data.list : list)),
      );

      handleCancelEditList();
    } catch {
      setError("Something went wrong while updating the list");
    } finally {
      setUpdatingList(false);
    }
  };

  const handleDeleteList = async (listId: string) => {
    const confirmed = window.confirm("Delete this list and all its cards?");

    if (!confirmed) {
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setError("You are not logged in");
      return;
    }

    setDeletingListId(listId);
    setError("");

    try {
      const response = await fetch(
        `http://localhost:5000/api/lists/${listId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to delete list");
        return;
      }

      setLists((prevLists) => prevLists.filter((list) => list._id !== listId));

      setCards((prevCards) => prevCards.filter((card) => card.list !== listId));

      if (activeListId === listId) {
        setActiveListId(null);
        setCardTitle("");
        setCardDescription("");
      }

      if (editingListId === listId) {
        handleCancelEditList();
      }
    } catch {
      setError("Something went wrong while deleting the list");
    } finally {
      setDeletingListId(null);
    }
  };

  const handleDragEnd = async (event: any) => {
    if (event.canceled) return;

    const { source, target } = event.operation;

    if (!source || !target || !isSortable(source)) return;

    const initialGroup = String(source.initialGroup ?? "");
    const initialIndex = source.initialIndex;

    let targetGroup: string;
    let targetIndex: number;

    if (isSortable(target)) {
      targetGroup = String(target.group ?? "");
      targetIndex = source.index;
    } else if (typeof target.id === "string" && target.id.startsWith("list:")) {
      targetGroup = target.id.slice("list:".length);

      // Dropping onto a list container appends the card.
      targetIndex = cards.filter((card) => card.list === targetGroup).length;
    } else {
      return;
    }

    if (!initialGroup || !targetGroup) return;

    const previousCards = cards;
    const grouped = new Map<string, Card[]>();

    for (const list of lists) {
      grouped.set(
        list._id,
        cards
          .filter((card) => card.list === list._id)
          .sort((a, b) => a.position - b.position),
      );
    }

    const sourceCards = grouped.get(initialGroup);
    const targetCards = grouped.get(targetGroup);

    if (!sourceCards || !targetCards) return;

    const [movedCard] = sourceCards.splice(initialIndex, 1);

    if (!movedCard) return;

    const insertAt = Math.max(0, Math.min(targetIndex, targetCards.length));

    targetCards.splice(insertAt, 0, {
      ...movedCard,
      list: targetGroup,
    });

    const updatedCards = lists.flatMap((list) =>
      (grouped.get(list._id) ?? []).map((card, position) => ({
        ...card,
        list: list._id,
        position,
      })),
    );

    // Update the UI immediately.
    setCards(updatedCards);
    setError("");

    const token = localStorage.getItem("token");

    if (!token || !boardId) {
      setCards(previousCards);
      setError("You are not logged in");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/cards/reorder", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          boardId,
          cards: updatedCards.map((card) => ({
            cardId: card._id,
            listId: card.list,
            position: card.position,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save card order");
      }
    } catch (error) {
      setCards(previousCards);
      setError(
        error instanceof Error ? error.message : "Failed to save card order",
      );
    }
  };

  if (loading) {
    return <main>Loading board...</main>;
  }

  if (!board && error) {
    return <main>{error}</main>;
  }

  if (!board) {
    return <main>Board not found</main>;
  }

  return (
    <DragDropProvider onDragEnd={handleDragEnd}>
      <main className="board-page">
        <header className="board-header">
          <div>
            <p className="section-label">YOUR BOARD</p>
            <h1>{board.name}</h1>
            <p>{board.description || "No description"}</p>
          </div>

          <button className="back-button">← Dashboard</button>
        </header>

        <section className="lists-container">
          {lists.map((list) => (
            <DroppableList
              key={list._id}
              listId={list._id}
              className="list-column"
            >
              <div className="list-header">
                {editingListId === list._id ? (
                  <form
                    className="edit-list-form"
                    onSubmit={(event) => {
                      event.preventDefault();
                      void handleUpdateList();
                    }}
                  >
                    <input
                      type="text"
                      value={editListName}
                      onChange={(event) => setEditListName(event.target.value)}
                      placeholder="List name"
                      autoFocus
                    />

                    <div className="list-edit-actions">
                      <button type="submit" disabled={updatingList}>
                        {updatingList ? "Saving..." : "Save"}
                      </button>

                      <button
                        type="button"
                        onClick={handleCancelEditList}
                        disabled={updatingList}
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
                        onClick={() => handleStartEditList(list)}
                      >
                        <Pencil
                          size={15}
                          strokeWidth={1.8}
                          aria-hidden="true"
                        />
                      </button>

                      <button
                        type="button"
                        className="list-action-button list-delete-button"
                        aria-label={`Delete ${list.name}`}
                        title="Delete list"
                        onClick={() => handleDeleteList(list._id)}
                        disabled={deletingListId === list._id}
                      >
                        <Trash2
                          size={15}
                          strokeWidth={1.8}
                          aria-hidden="true"
                        />
                      </button>
                    </div>
                  </>
                )}
              </div>

              <div className="cards-container">
                {cards
                  .filter((card) => card.list === list._id)
                  .sort((a, b) => a.position - b.position)
                  .map((card, index) => (
                    <SortableCard
                      key={card._id}
                      cardId={card._id}
                      listId={list._id}
                      index={index}
                    >
                      <div className="card-item">
                        {editingCardId === card._id ? (
                          <form
                            className="edit-card-form"
                            onSubmit={(event) => {
                              event.preventDefault();
                              void handleUpdateCard();
                            }}
                          >
                            <input
                              type="text"
                              placeholder="Card title"
                              value={editCardTitle}
                              onChange={(event) =>
                                setEditCardTitle(event.target.value)
                              }
                            />

                            <textarea
                              placeholder="Card description (optional)"
                              value={editCardDescription}
                              onChange={(event) =>
                                setEditCardDescription(event.target.value)
                              }
                            />

                            <div className="card-edit-actions">
                              <button type="submit" disabled={updatingCard}>
                                {updatingCard ? "Saving..." : "Save changes"}
                              </button>

                              <button
                                type="button"
                                onClick={handleCancelEditCard}
                                disabled={updatingCard}
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
                                onClick={() => handleStartEditCard(card)}
                              >
                                <Pencil
                                  size={15}
                                  strokeWidth={1.8}
                                  aria-hidden="true"
                                />
                              </button>

                              <button
                                type="button"
                                className="card-action-button card-delete-button"
                                aria-label={`Delete ${card.title}`}
                                title="Delete card"
                                onClick={() => handleDeleteCard(card._id)}
                                disabled={deletingCardId === card._id}
                              >
                                <Trash2
                                  size={15}
                                  strokeWidth={1.8}
                                  aria-hidden="true"
                                />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </SortableCard>
                  ))}
              </div>

              {activeListId === list._id ? (
                <div className="add-card-form">
                  <input
                    type="text"
                    placeholder="Card title"
                    value={cardTitle}
                    onChange={(e) => setCardTitle(e.target.value)}
                  />

                  <textarea
                    placeholder="Card description (optional)"
                    value={cardDescription}
                    onChange={(e) => setCardDescription(e.target.value)}
                  />

                  <div className="add-card-actions">
                    <button
                      type="button"
                      onClick={handleCreateCard}
                      disabled={creatingCard}
                    >
                      Add Card
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveListId(null);
                        setCardTitle("");
                        setCardDescription("");
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  className="add-card-button"
                  onClick={() => setActiveListId(list._id)}
                >
                  + Add card
                </button>
              )}
            </DroppableList>
          ))}

          {showListForm ? (
            <div className="add-list-form">
              <input
                type="text"
                placeholder="List name"
                value={listName}
                onChange={(e) => setListName(e.target.value)}
              />

              <div className="add-list-actions">
                <button onClick={handleCreateList} disabled={creatingList}>
                  {creatingList ? "Creating..." : "Add List"}
                </button>

                <button onClick={() => setShowListForm(false)}>Cancel</button>
              </div>
            </div>
          ) : (
            <button
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

export default Board;
