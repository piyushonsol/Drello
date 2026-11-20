import { useEffect, useRef, useState } from "react";
import { boardApi } from "../services/boardApi";
import { cardApi } from "../../cards/services/cardApi";
import type { Board, BoardList } from "../types/board";
import type { Card } from "../../cards/types/card";

export function useBoard(boardId: string | undefined) {
  const [board, setBoard] = useState<Board | null>(null);
  const [lists, setLists] = useState<BoardList[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const cardsRef = useRef<Card[]>([]);
  const reorderQueue = useRef<Promise<void>>(Promise.resolve());
  const reorderRequestId = useRef(0);

  useEffect(() => {
    cardsRef.current = cards;
  }, [cards]);

  useEffect(() => {
    if (!boardId) {
      queueMicrotask(() => {
        setError("Board not found");
        setLoading(false);
      });
      return;
    }

    if (!localStorage.getItem("token")) {
      queueMicrotask(() => {
        setError("You are not logged in");
        setLoading(false);
      });
      return;
    }

    const currentBoardId = boardId;
    let cancelled = false;

    async function loadBoard() {
      try {
        setLoading(true);
        setError("");
        const boardData = await boardApi.getBoard(currentBoardId);
        if (cancelled) return;

        setBoard(boardData.board);

        const listData = await boardApi.getLists(currentBoardId);
        if (cancelled) return;

        const loadedLists = Array.isArray(listData.lists) ? listData.lists : [];
        setLists(loadedLists);

        const cardGroups = await Promise.all(
          loadedLists.map((list) => cardApi.getCards(list._id)),
        );
        if (cancelled) return;

        const loadedCards = cardGroups
          .flatMap((group) => group.cards)
          .filter((card): card is Card => Boolean(card?._id));
        cardsRef.current = loadedCards;
        setCards(loadedCards);
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Failed to load board",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadBoard();
    return () => {
      cancelled = true;
    };
  }, [boardId]);

  async function createList(name: string) {
    if (!boardId) throw new Error("Board not found");
    const data = await boardApi.createList(name, boardId);
    setLists((current) => [...current, data.list]);
  }

  async function updateList(listId: string, name: string) {
    const data = await boardApi.updateList(listId, name);
    setLists((current) =>
      current.map((list) => (list._id === listId ? data.list : list)),
    );
  }

  async function deleteList(listId: string) {
    await boardApi.deleteList(listId);
    setLists((current) => current.filter((list) => list._id !== listId));
    setCards((current) => current.filter((card) => card.list !== listId));
  }

  async function createCard(listId: string, title: string, description: string) {
    const data = await cardApi.createCard(title, description, listId);
    setCards((current) => [...current, data.card]);
  }

  async function updateCard(cardId: string, title: string, description: string) {
    const data = await cardApi.updateCard(cardId, title, description);
    setCards((current) =>
      current.map((card) => (card._id === cardId ? data.card : card)),
    );
  }

  async function deleteCard(cardId: string) {
    await cardApi.deleteCard(cardId);
    setCards((current) => {
      const deletedCard = current.find((card) => card._id === cardId);
      if (!deletedCard) return current;

      const remaining = current
        .filter((card) => card._id !== cardId)
        .map((card) =>
          card.list === deletedCard.list &&
          card.position > deletedCard.position
            ? { ...card, position: card.position - 1 }
            : card,
        );
      cardsRef.current = remaining;
      return remaining;
    });
  }

  async function moveCard(
    sourceListId: string,
    sourceIndex: number,
    targetListId: string,
    targetIndex: number,
  ) {
    const previousCards = cardsRef.current;
    const grouped = new Map<string, Card[]>();

    for (const list of lists) {
      grouped.set(
        list._id,
        previousCards
          .filter((card) => card.list === list._id)
          .sort((a, b) => a.position - b.position),
      );
    }

    const sourceCards = grouped.get(sourceListId);
    const targetCards = grouped.get(targetListId);
    if (!sourceCards || !targetCards) return;

    const sourceCard = sourceCards[sourceIndex];
    if (!sourceCard) return;

    sourceCards.splice(sourceIndex, 1);
    if (sourceListId === targetListId && sourceIndex < targetIndex) {
      targetIndex -= 1;
    }

    targetIndex = Math.max(0, Math.min(targetIndex, targetCards.length));
    targetCards.splice(targetIndex, 0, { ...sourceCard, list: targetListId });

    const updatedCards = lists.flatMap((list) =>
      (grouped.get(list._id) ?? []).map((card, position) => ({
        ...card,
        list: list._id,
        position,
      })),
    );

    cardsRef.current = updatedCards;
    setCards(updatedCards);
    setError("");

    if (!boardId) return;

    const requestId = ++reorderRequestId.current;
    const save = async () => {
      await cardApi.reorderCards(boardId, updatedCards);
    };
    const request = reorderQueue.current.then(save, save);
    reorderQueue.current = request.catch(() => undefined);

    try {
      await request;
    } catch (moveError) {
      if (requestId === reorderRequestId.current) {
        cardsRef.current = previousCards;
        setCards(previousCards);
        setError(
          moveError instanceof Error
            ? moveError.message
            : "Failed to save card order",
        );
      }
    }
  }

  return {
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
  };
}
