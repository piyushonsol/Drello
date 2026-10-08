import { useEffect, useState } from "react";
import "./Dashboard.css";
import { Link } from "react-router-dom";
type Board = {
  _id: string;
  name: string;
  description?: string;
};

function Dashboard() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);

  const [boardName, setBoardName] = useState("");
  const [boardDescription, setBoardDescription] = useState("");

  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const fetchBoards = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("You are not logged in");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("http://localhost:5000/api/boards", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.message || "Failed to fetch boards");
          return;
        }

        setBoards(data.boards);
      } catch (error) {
        setError("Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchBoards();
  }, []);

  if (loading) {
    return <main className="dashboard">Loading...</main>;
  }

  if (error) {
    return <main className="dashboard">{error}</main>;
  }
  const handleCreateBoard = async () => {
    if (!boardName.trim()) {
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setError("You are not logged in");
      return;
    }

    setCreating(true);
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/boards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: boardName,
          description: boardDescription,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to create board");
        return;
      }

      setBoards((prevBoards) => [...prevBoards, data.board]);

      setBoardName("");
      setBoardDescription("");
      setShowCreateForm(false);
    } catch (error) {
      setError("Something went wrong");
    } finally {
      setCreating(false);
    }
  };

  return (
    <main className="dashboard">
      <div className="dashboard-header">
        {showCreateForm && (
          <div className="create-board-form">
            <input
              type="text"
              placeholder="Board name"
              value={boardName}
              onChange={(e) => setBoardName(e.target.value)}
            />

            <input
              type="text"
              placeholder="Description"
              value={boardDescription}
              onChange={(e) => setBoardDescription(e.target.value)}
            />

            <div className="create-board-actions">
              <button onClick={handleCreateBoard} disabled={creating}>
                {creating ? "Creating..." : "Create Board"}
              </button>

              <button onClick={() => setShowCreateForm(false)}>Cancel</button>
            </div>

            <button onClick={() => setShowCreateForm(false)}>Cancel</button>
          </div>
        )}
        <div>
          <p className="section-label">YOUR WORKSPACE</p>
          <h1>Your Boards.</h1>
        </div>

        <button
          className="create-board-button"
          onClick={() => setShowCreateForm(true)}
        >
          + New Board
        </button>
      </div>

      <div className="boards-grid">
        {boards.map((board) => (
          <Link
            to={`/boards/${board._id}`}
            className="board-card"
            key={board._id}
          >
            <div className="board-number">BOARD</div>

            <h2>{board.name}</h2>

            <p>{board.description || "No description"}</p>

            <div className="board-footer">
              <span>OPEN BOARD →</span>
            </div>
          </Link>
        ))}
      </div>

      {boards.length === 0 && (
        <div className="empty-state">
          <h2>No boards yet.</h2>
          <p>Create your first board and start building your plan.</p>
        </div>
      )}
    </main>
  );
}

export default Dashboard;
