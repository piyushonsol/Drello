# Drello Developer Guide

This guide describes the physically restructured React and Express repository.
It documents the real folders, files, data flows, and the fixes implemented.

## 1. Original and final structure

### Original structure

```text
client/
  src/pages/Board.tsx (921 lines)
  src/pages/Dashboard.tsx
  src/pages/Login.tsx
  src/pages/Signup.tsx
  src/pages/Landing.tsx
  src/pages/*.css

server/
  routes/          route, authorization, and database logic mixed together
  models/          Mongoose schemas
  middleware/
  server.js
```

The original board state, API calls, drag-and-drop logic, edit forms, delete
actions, and rendering all lived in one file. The backend had no controller or
service boundary.

### Final structure

```text
Drello/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── app/
│   │   │   └── App.tsx
│   │   ├── assets/
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   │   ├── components/
│   │   │   │   │   ├── Login.tsx
│   │   │   │   │   └── Signup.tsx
│   │   │   │   └── services/authApi.ts
│   │   │   ├── boards/
│   │   │   │   ├── components/
│   │   │   │   │   ├── Board.tsx
│   │   │   │   │   └── Dashboard.tsx
│   │   │   │   ├── hooks/useBoard.ts
│   │   │   │   ├── services/boardApi.ts
│   │   │   │   └── types/board.ts
│   │   │   ├── cards/
│   │   │   │   ├── components/
│   │   │   │   │   ├── CardItem.tsx
│   │   │   │   │   └── SortableCard.tsx
│   │   │   │   ├── services/cardApi.ts
│   │   │   │   └── types/card.ts
│   │   │   ├── lists/
│   │   │   │   └── components/
│   │   │   │       ├── DroppableList.tsx
│   │   │   │       └── ListColumn.tsx
│   │   │   └── landing/components/Landing.tsx
│   │   ├── lib/api.ts
│   │   ├── styles/
│   │   ├── index.css
│   │   └── main.tsx
│   ├── package.json
│   ├── package-lock.json
│   └── vite.config.ts
├── backend/
│   ├── src/
│   │   ├── app.js
│   │   ├── server.js
│   │   ├── config/database.js
│   │   ├── middleware/authMiddleware.js
│   │   └── modules/
│   │       ├── auth/
│   │       │   ├── auth.model.js
│   │       │   ├── auth.routes.js
│   │       │   ├── auth.controller.js
│   │       │   └── auth.service.js
│   │       ├── boards/
│   │       │   ├── board.model.js
│   │       │   ├── board.routes.js
│   │       │   ├── board.controller.js
│   │       │   └── board.service.js
│   │       ├── lists/
│   │       │   ├── list.model.js
│   │       │   ├── list.routes.js
│   │       │   ├── list.controller.js
│   │       │   └── list.service.js
│   │       └── cards/
│   │           ├── card.model.js
│   │           ├── card.routes.js
│   │           ├── card.controller.js
│   │           └── card.service.js
│   ├── package.json
│   └── package-lock.json
├── Readme.md
└── READMEHELP.md
```

## 2. File move and creation report

### Moved and reorganized

- `client/` moved physically to `frontend/`.
- `server/` moved physically to `backend/`.
- `client/src/App.tsx` moved to `frontend/src/app/App.tsx`.
- `client/src/main.tsx` remains at `frontend/src/main.tsx` after the root rename.
- `client/src/pages/Landing.tsx` moved to
  `frontend/src/features/landing/components/Landing.tsx`.
- `Login.tsx` and `Signup.tsx` moved into the auth feature.
- `Dashboard.tsx` moved into the boards feature.
- `Board.tsx` was replaced and moved into the boards feature.
- `Board.css`, `Dashboard.css`, `Auth.css`, and `Landing.css` moved to
  `frontend/src/styles/`.
- `SortableCard.tsx` moved to the cards feature.
- `DroppableList.tsx` moved to the lists feature.
- `server/server.js` moved to `backend/src/server.js`.
- `server/middleware/authMiddleware.js` moved to
  `backend/src/middleware/authMiddleware.js`.
- `server/models/*.js` moved into matching module folders and became
  `auth.model.js`, `board.model.js`, `list.model.js`, and `card.model.js`.
- `server/routes/*.js` moved into matching module folders and became
  `*.routes.js`.

### Created

- Frontend API and feature services:
  `frontend/src/lib/api.ts`,
  `frontend/src/features/auth/services/authApi.ts`,
  `frontend/src/features/boards/services/boardApi.ts`,
  `frontend/src/features/cards/services/cardApi.ts`.
- Frontend types:
  `frontend/src/features/boards/types/board.ts` and
  `frontend/src/features/cards/types/card.ts`.
- `frontend/src/features/boards/hooks/useBoard.ts` centralizes board fetches,
  mutations, optimistic card moves, rollback, and serialized reorder requests.
- `frontend/src/features/cards/components/CardItem.tsx` owns card display/edit/
  delete interaction.
- `frontend/src/features/lists/components/ListColumn.tsx` owns list display/
  edit/delete and card creation.
- Backend app/config and module layers:
  `backend/src/app.js`, `backend/src/config/database.js`,
  and all `*.controller.js` and `*.service.js` files listed in the final tree.

### Deleted

- `client/src/pages/DraggableCard.tsx` was empty and had no responsibility.
- The original monolithic backend route files were replaced by route,
  controller, and service files.
- No UI component or API feature was intentionally removed.

## 3. Frontend responsibility changes

`lib/api.ts` centralizes the API base URL, authentication header, JSON
headers, response parsing, and HTTP errors. Feature services call this helper
instead of repeating raw `fetch` code.

`useBoard.ts` owns board-scoped state and mutations. React components no longer
construct API URLs or interpret database objects directly.

`Board.tsx` only coordinates route parameters, board rendering, drag-end events,
and action-level UI state. `ListColumn.tsx` owns list/card form state, while
`CardItem.tsx` owns card edit state.

This is feature-first and intentionally modest: it separates responsibilities
without introducing Redux, a dependency injection framework, or unnecessary
state abstractions.

## 4. Drag-and-drop fix

### Original root cause

The original `handleDragEnd` used the source's live `group` and `index` for the
destination. dnd-kit uses the source and target entities differently during a
cross-list operation, so that logic could move a card to the wrong list or
index. The handler also used `any`, logged debug state, read stale closure state,
and had no serialized persistence queue.

### Correct implementation

The current flow is:

1. dnd-kit sends `DragEndEvent`.
2. A canceled drag or a non-sortable/unknown target is ignored.
3. The source's `initialGroup` and `initialIndex` identify the original list
   and card position.
4. A sortable target provides the destination list and target index.
5. A list-container target provides the destination list and appends to it.
6. `useBoard.moveCard` removes the card from a position-based copy of the source
   list, inserts it at the destination, and renumbers every list.
7. React receives the complete optimistic arrangement immediately.
8. Reorder requests are chained so rapid moves are persisted in operation order.
9. A failed latest reorder restores the previous arrangement and shows the error.

Same-list moves adjust the insertion index after source removal. Cross-list
moves update `list` and `position` together. Empty and invalid targets are safe.

The backend `card/reorder` endpoint validates the board, destination lists,
card membership, duplicate IDs, and integer positions before `bulkWrite`.

## 5. Card deletion fix

The deletion crash came from UI edit/delete state surviving after the card left
React state, plus the original large component being responsible for every
card-level state transition. The new flow separates those concerns:

```text
CardItem delete button
  -> confirmation
  -> useBoard.deleteCard
  -> DELETE /api/cards/:id
  -> findOwnedCard verifies card/list/board ownership
  -> card is deleted
  -> remaining list cards are renumbered 0..n-1
  -> CardItem unmounts; React state no longer contains the card
```

Failed deletion API requests leave state unchanged and surface the server
or network error. Successful deletion removes only the matching card and
locally decrements the position of later cards in the same list.

No optional chaining is used to hide missing card references; state is
updated by a verified ID filter and the server performs explicit ownership
and existence checks.

## 6. Backend request flow

Every API route is an Express route module:

```text
auth.routes / board.routes / list.routes / card.routes
  -> authMiddleware (where protected)
  -> controller
  -> service
  -> Mongoose model
  -> MongoDB
```

Controllers handle HTTP status and JSON responses. Services own validation,
authorization chains, mutations, and database operations. Models only describe
MongoDB schemas.

Board deletion now removes associated lists and cards instead of orphaning
children. List deletion removes its cards.

## 7. Frontend data flow

### Board load

`Board.tsx` -> `useBoard(boardId)` -> `boardApi.getBoard` and
`boardApi.getLists` -> `cardApi.getCards` for each list -> React state ->
`ListColumn` -> `SortableCard` -> `CardItem`.

### Create/update/delete

The component validates user input, calls a feature service through `useBoard`,
and updates local state from the returned model. API failures set the board
error state and do not return an optimistic state for failed mutations.

### Move

`CardItem` is wrapped by `SortableCard`; dnd-kit updates source/target metadata;
`Board.handleDragEnd` resolves the target; `useBoard.moveCard` optimistically
updates state; `cardApi.reorderCards` sends the complete board arrangement.

## 8. Database interaction

- `User`: registration and login credentials.
- `Board`: name, description, owner.
- `List`: name, board.
- `Card`: title, description, list, position.

Ownership is checked along `User -> Board -> List -> Card`. Card moves only
accept list IDs from the owned board and card IDs belonging to that board.

## 9. Verification

Executed:

- `npm --prefix frontend run build` — passed; TypeScript and Vite production
  build completed.
- `npm --prefix frontend run lint` — passed.
- Every file under `backend/src` passed `node --check`.
- `git diff --check` — passed.
- `npm --prefix backend test` — not available; the package script is only a
  placeholder and exits with “no test specified.”

Not executed:

- Live MongoDB connection.
- Browser-based drag gestures.
- Browser-based card deletion and refresh persistence.
- Automated frontend test suite; none is configured.

Manual smoke tests should verify login, board/list/card CRUD, same-list reorder,
cross-list move, drop into an empty list, drag cancellation, card deletion,
page refresh persistence, and failed API behavior.
