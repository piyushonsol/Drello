import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./Board.css";
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
          <div className="list-column" key={list._id}>
            <div className="list-header">
              <h2>{list.name}</h2>
            </div>

            <div className="cards-container">
              {cards
                .filter((card) => card.list === list._id)
                .sort((a, b) => a.position - b.position)
                .map((card) => (
                  <div className="card-item" key={card._id}>
                    <h3>{card.title}</h3>

                    {card.description && <p>{card.description}</p>}
                  </div>
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
          </div>
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
  );
}

export default Board;
