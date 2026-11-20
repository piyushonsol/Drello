import { useEffect, useState } from "react";
import "../../../styles/Dashboard.css";
import { Link } from "react-router-dom";
import { boardApi } from "../services/boardApi";
import type { Board } from "../types/board";

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
        const data = await boardApi.getBoards();
        setBoards(Array.isArray(data.boards) ? data.boards : []);
      } catch (error) {
        setError(error instanceof Error ? error.message : "Failed to fetch boards");
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
      const data = await boardApi.createBoard(boardName, boardDescription);
      setBoards((prevBoards) => [...prevBoards, data.board]);

      setBoardName("");
      setBoardDescription("");
      setShowCreateForm(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to create board");
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
