import { apiRequest } from "../../../lib/api";
import type { Card } from "../types/card";

type CardResponse = { card: Card };
type CardsResponse = { cards: Card[] };

export const cardApi = {
  getCards: (listId: string) =>
    apiRequest<CardsResponse>(`/api/cards/list/${listId}`),
  createCard: (title: string, description: string, listId: string) =>
    apiRequest<CardResponse>("/api/cards", {
      method: "POST",
      body: JSON.stringify({
        title,
        description: description.trim() || undefined,
        listId,
      }),
    }),
  updateCard: (cardId: string, title: string, description: string) =>
    apiRequest<CardResponse>(`/api/cards/${cardId}`, {
      method: "PUT",
      body: JSON.stringify({ title, description }),
    }),
  deleteCard: (cardId: string) =>
    apiRequest<{ message: string }>(`/api/cards/${cardId}`, {
      method: "DELETE",
    }),
  reorderCards: (
    boardId: string,
    cards: Array<{ _id: string; list: string; position: number }>,
  ) =>
    apiRequest<{ message: string }>("/api/cards/reorder", {
      method: "PATCH",
      body: JSON.stringify({
        boardId,
        cards: cards.map((card) => ({
          cardId: card._id,
          listId: card.list,
          position: card.position,
        })),
      }),
    }),
};

