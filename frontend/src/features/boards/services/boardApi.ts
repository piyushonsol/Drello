import { apiRequest } from "../../../lib/api";
import type { Board, BoardList } from "../types/board";

type BoardResponse = { board: Board };
type BoardsResponse = { boards: Board[] };
type ListsResponse = { lists: BoardList[] };
type ListResponse = { list: BoardList };

export const boardApi = {
  getBoard: (boardId: string) =>
    apiRequest<BoardResponse>(`/api/boards/${boardId}`),
  getLists: (boardId: string) =>
    apiRequest<ListsResponse>(`/api/lists/board/${boardId}`),
  createBoard: (name: string, description: string) =>
    apiRequest<BoardResponse & { board: Board }>("/api/boards", {
      method: "POST",
      body: JSON.stringify({ name, description }),
    }),
  getBoards: () => apiRequest<BoardsResponse>("/api/boards"),
  createList: (name: string, boardId: string) =>
    apiRequest<ListResponse>("/api/lists", {
      method: "POST",
      body: JSON.stringify({ name, boardId }),
    }),
  updateList: (listId: string, name: string) =>
    apiRequest<ListResponse>(`/api/lists/${listId}`, {
      method: "PUT",
      body: JSON.stringify({ name }),
    }),
  deleteList: (listId: string) =>
    apiRequest<{ message: string }>(`/api/lists/${listId}`, {
      method: "DELETE",
    }),
};

