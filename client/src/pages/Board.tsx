import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

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

function Board() {
  const { boardId } = useParams();

  const [board, setBoard] = useState<Board | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lists, setLists] = useState<List[]>([]);

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
      } catch (error) {
        setError("Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchBoard();
  }, [boardId]);
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
      } catch (error) {
        setError("Something went wrong");
      }
    };

    fetchLists();
  }, [boardId]);
  if (loading) {
    return <main>Loading board...</main>;
  }

  if (error) {
    return <main>{error}</main>;
  }

  if (!board) {
    return <main>Board not found</main>;
  }

  return (
    <main>
      <h1>{board.name}</h1>
      <p>{board.description || "No description"}</p>

      <div>
        {lists.map((list) => (
          <div key={list._id}>
            <h2>{list.name}</h2>
          </div>
        ))}
      </div>
    </main>
  );
}

export default Board;
