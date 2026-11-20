# Drello Architecture Reference

This document is a machine-readable and developer-readable reference for the
current Drello codebase. It is intended to give another GPT enough context to
modify the project without guessing where UI state, API calls, drag-and-drop
behavior, or MongoDB persistence live.

## 1. Product and technology overview

Drello is a Trello-like planning application:

```text
User
└── Board
    └── List
        └── Card
```

The application uses:

- Frontend: React 19, TypeScript, Vite, React Router, dnd-kit React.
- Backend: Node.js, Express, CommonJS JavaScript.
- Database: MongoDB through Mongoose.
- Authentication: JWT in a browser `localStorage` token.
- Styling: feature/page CSS files; no CSS-in-JS system.
- State management: local React state plus the `useBoard` feature hook.
  Redux, Zustand, and Context-based global state are not used.

The frontend and backend are separate npm projects:

```text
frontend/  -> Vite development/build commands
backend/   -> Express server and MongoDB commands
```

## 2. Complete repository structure

```text
Drello/
├── Readme.md
├── READMEHELP.md
├── architecture.md
├── frontend/
│   ├── package.json
│   ├── package-lock.json
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── tsconfig.app.json
│   ├── tsconfig.node.json
│   ├── eslint.config.js
│   ├── public/
│   │   ├── favicon.svg
│   │   └── icons.svg
│   └── src/
│       ├── main.tsx
│       ├── App.css
│       ├── index.css
│       ├── app/
│       │   └── App.tsx
│       ├── assets/
│       │   ├── hero.png
│       │   ├── react.svg
│       │   └── vite.svg
│       ├── lib/
│       │   └── api.ts
│       ├── styles/
│       │   ├── Auth.css
│       │   ├── Board.css
│       │   ├── Dashboard.css
│       │   └── Landing.css
│       └── features/
│           ├── landing/
│           │   └── components/
│           │       └── Landing.tsx
│           ├── auth/
│           │   ├── components/
│           │   │   ├── Login.tsx
│           │   │   └── Signup.tsx
│           │   └── services/
│           │       └── authApi.ts
│           ├── boards/
│           │   ├── components/
│           │   │   ├── Board.tsx
│           │   │   └── Dashboard.tsx
│           │   ├── hooks/
│           │   │   └── useBoard.ts
│           │   ├── services/
│           │   │   └── boardApi.ts
│           │   └── types/
│           │       └── board.ts
│           ├── lists/
│           │   └── components/
│           │       ├── DroppableList.tsx
│           │       └── ListColumn.tsx
│           └── cards/
│               ├── components/
│               │   ├── CardItem.tsx
│               │   └── SortableCard.tsx
│               ├── services/
│               │   └── cardApi.ts
│               └── types/
│                   └── card.ts
└── backend/
    ├── package.json
    ├── package-lock.json
    ├── .env
    └── src/
        ├── app.js
        ├── server.js
        ├── config/
        │   └── database.js
        ├── middleware/
        │   └── authMiddleware.js
        └── modules/
            ├── auth/
            │   ├── auth.model.js
            │   ├── auth.routes.js
            │   ├── auth.controller.js
            │   └── auth.service.js
            ├── boards/
            │   ├── board.model.js
            │   ├── board.routes.js
            │   ├── board.controller.js
            │   └── board.service.js
            ├── lists/
            │   ├── list.model.js
            │   ├── list.routes.js
            │   ├── list.controller.js
            │   └── list.service.js
            └── cards/
                ├── card.model.js
                ├── card.routes.js
                ├── card.controller.js
                └── card.service.js
```

## 3. Frontend architecture

### Application entry and routing

`frontend/src/main.tsx` creates the React root, imports global CSS, and renders
`App` inside `StrictMode`.

`frontend/src/app/App.tsx` defines the routes:

| Route | Component | Responsibility |
|---|---|---|
| `/` | `Landing` | Public marketing page |
| `/login` | `Login` | Login form |
| `/signup` | `Signup` | Registration form |
| `/dashboard` | `Dashboard` | User board list and board creation |
| `/boards/:boardId` | `Board` | Board workspace |

There is currently no route guard. Protected screens rely on API responses and
the presence of the JWT in `localStorage`.

### Shared API client

`frontend/src/lib/api.ts` exports `apiRequest<T>()`.

Responsibilities:

1. Read `VITE_API_URL`, defaulting to `http://localhost:5000`.
2. Read `localStorage.token`.
3. Add `Authorization: Bearer <token>` when available.
4. Add JSON content headers when a request has a body.
5. Parse JSON responses.
6. Throw an `Error` containing the server `message` for non-2xx responses.

Feature API modules do not call `fetch` directly:

- `features/auth/services/authApi.ts`
- `features/boards/services/boardApi.ts`
- `features/cards/services/cardApi.ts`

### Feature boundaries

#### Auth

- `Login.tsx` calls `authApi.login`, stores the returned token, and navigates to
  `/dashboard`.
- `Signup.tsx` calls `authApi.signup` and navigates to `/login`.
- Auth form presentation remains in `styles/Auth.css`.

#### Boards

- `Dashboard.tsx` loads boards and creates boards through `boardApi`.
- `Board.tsx` is the route-level board coordinator.
- `useBoard.ts` owns board data, lists, cards, mutations, drag state, optimistic
  updates, rollback, and serialized persistence.
- `board.ts` contains `Board` and `BoardList` TypeScript types.

#### Lists

- `ListColumn.tsx` renders one list and owns list editing, list deletion
  confirmation, and card creation form state.
- `DroppableList.tsx` registers the list container with dnd-kit.

#### Cards

- `CardItem.tsx` renders a card and owns card editing/deletion interaction.
- `SortableCard.tsx` registers each card with dnd-kit.
- `cardApi.ts` owns card CRUD and reorder requests.
- `card.ts` defines the frontend card shape.

## 4. Backend architecture

### Process startup

`backend/src/server.js`:

1. Loads environment variables with `dotenv`.
2. Imports the Express app.
3. Connects to MongoDB through `config/database.js`.
4. Starts listening on `PORT`, defaulting to `5000`.
5. Exits with an error if startup/database connection fails.

`backend/src/app.js`:

1. Creates the Express app.
2. Enables CORS and JSON request parsing.
3. Exposes `GET /`.
4. Mounts module routers:

```text
/api/auth
/api/boards
/api/lists
/api/cards
```

### Module layering

Each backend domain follows:

```text
route -> auth middleware -> controller -> service -> model -> MongoDB
```

- Routes define HTTP verbs and paths.
- Controllers translate service results/errors into HTTP responses.
- Services contain validation, ownership checks, business rules, and database
  operations.
- Models define Mongoose schemas.

### Authentication

`authMiddleware.js`:

1. Reads `Authorization`.
2. Extracts the bearer token.
3. Verifies it with `JWT_SECRET`.
4. Stores the token subject in `req.userId`.
5. Returns `401` on missing/invalid tokens.

Auth services hash passwords with bcrypt and issue JWTs containing `userId`.

### Authorization model

Ownership is checked through the hierarchy:

```text
req.userId
  -> Board.owner
  -> List.board
  -> Card.list
```

Card and list operations first resolve the relevant parent records and then
verify that the parent board belongs to the authenticated user.

## 5. Data model

### User

File: `backend/src/modules/auth/auth.model.js`

```text
email: String, required, unique, lowercase, trimmed
username: String, required, unique, trimmed
password: String, required, bcrypt hash
createdAt, updatedAt
```

### Board

File: `backend/src/modules/boards/board.model.js`

```text
name: String, required
description: String, trimmed
owner: ObjectId -> User, required
createdAt, updatedAt
```

### List

File: `backend/src/modules/lists/list.model.js`

```text
name: String, required, trimmed
board: ObjectId -> Board, required
createdAt, updatedAt
```

### Card

File: `backend/src/modules/cards/card.model.js`

```text
title: String, required, trimmed
description: String, trimmed
list: ObjectId -> List, required
position: Number, required
createdAt, updatedAt
```

`position` is zero-based within a list. The frontend displays cards sorted by
position. The backend list query also sorts by `{ position: 1, _id: 1 }`.

## 6. Complete API contract

All endpoints below except registration/login are protected by JWT middleware.

### Auth

```text
POST /api/auth/register
Body: { username, email, password }
Response: { message }

POST /api/auth/login
Body: { username? or email?, password }
Response: { message, token }

GET /api/auth/protected
Response: { message, userId }
```

### Boards

```text
POST   /api/boards
GET    /api/boards
GET    /api/boards/:id
PUT    /api/boards/:id
DELETE /api/boards/:id
```

### Lists

```text
POST   /api/lists
GET    /api/lists/board/:boardId
GET    /api/lists/:id
PUT    /api/lists/:id
DELETE /api/lists/:id
```

### Cards

```text
POST   /api/cards
GET    /api/cards/list/:listId
GET    /api/cards/:id
PUT    /api/cards/:id
DELETE /api/cards/:id
PATCH  /api/cards/reorder
```

The reorder request shape is:

```json
{
  "boardId": "board-object-id",
  "cards": [
    {
      "cardId": "card-object-id",
      "listId": "list-object-id",
      "position": 0
    }
  ]
}
```

The frontend sends the complete card arrangement for the board, not only the
one moved card. This is necessary because one move changes the positions of
multiple cards.

## 7. Drag-and-drop architecture in detail

The project uses `@dnd-kit/react` and `@dnd-kit/react/sortable`.

### DnD component registration

#### Sortable cards

`features/cards/components/SortableCard.tsx` calls:

```tsx
useSortable({
  id: cardId,
  index,
  group: listId,
  type: "card",
  accept: "card",
});
```

Meaning of each field:

- `id`: the MongoDB card ID. It uniquely identifies the draggable.
- `index`: the card's current zero-based index inside its rendered list.
- `group`: the list ID. This is how dnd-kit identifies the card's list.
- `type`: card entities can participate in the card operation.
- `accept`: card entities accept card drops.

The component attaches the returned `ref` to a wrapper `<div>`. It changes
opacity while `isDragging` is true.

#### Droppable list containers

`features/lists/components/DroppableList.tsx` calls:

```tsx
useDroppable({
  id: `list:${listId}`,
  type: "list",
  accept: "card",
  collisionPriority: CollisionPriority.Low,
});
```

The `list:` prefix is intentional. It distinguishes an empty/list-container
target from a card target. A card target has the card MongoDB ID; a list target
has an ID such as `list:64f...`.

List containers have lower collision priority so a card target can win when
the pointer is over an existing card. The list target remains available for
empty lists and drops below the last card.

### DnD provider and event

`features/boards/components/Board.tsx` wraps the board in:

```tsx
<DragDropProvider onDragEnd={(event) => void handleDragEnd(event)}>
```

`handleDragEnd` receives the typed dnd-kit `DragEndEvent`:

```text
event.canceled
event.operation.source
event.operation.target
```

The handler exits early when:

- `event.canceled` is true.
- source or target is missing.
- source is not sortable.
- target is neither sortable nor a `list:<listId>` container.
- source or destination list IDs are empty.

### Source and target index rules

For the source, the handler uses:

```text
source.initialGroup
source.initialIndex
```

These are the original list and original index at drag start. They are used
because the live source group/index can change while the drag operation is
being previewed.

For a sortable card target, the handler uses:

```text
target.group
target.index
```

For a list-container target, the handler derives:

```text
targetListId = target.id.slice("list:".length)
targetIndex = number of current cards in targetListId
```

That means a drop on an empty list inserts at index `0`, and a drop on the
container appends after the current last card.

### Local move algorithm

`Board.handleDragEnd` delegates to `useBoard.moveCard`.

`moveCard(sourceListId, sourceIndex, targetListId, targetIndex)`:

1. Reads the latest card state from `cardsRef`.
2. Groups cards by every known list.
3. Sorts each group by `position`.
4. Gets the source and target arrays.
5. Validates that both arrays and the source card exist.
6. Removes the source card.
7. If moving down within the same list, decrements the destination index because
   removal shifted later items left.
8. Clamps the target index between `0` and `targetCards.length`.
9. Inserts a copy of the card with the new `list`.
10. Flattens every list and assigns contiguous positions from `0`.
11. Updates `cardsRef` and React state optimistically.

The original card object is not mutated. New card objects are created while
renumbering, which prevents accidental mutation of React state.

### DnD persistence and race prevention

After the optimistic update, `useBoard` sends:

```text
cardApi.reorderCards(boardId, updatedCards)
  -> PATCH /api/cards/reorder
```

The hook maintains:

- `cardsRef`: the latest card arrangement, avoiding stale closure state during
  rapid drag events.
- `reorderQueue`: a promise chain that serializes reorder requests.
- `reorderRequestId`: identifies the newest move for rollback decisions.

The queue ensures:

```text
move A request -> move B request -> move C request
```

instead of allowing network completion order to overwrite the user's latest
arrangement.

If the newest request fails, the hook restores that move's previous arrangement
and exposes the error through board error state. Older failures do not undo a
newer successful/current arrangement.

### Backend reorder validation

`backend/src/modules/cards/card.service.js` validates:

1. `boardId` is a valid MongoDB ObjectId.
2. `cards` is a non-empty array.
3. The board belongs to `req.userId`.
4. Every card ID and list ID is valid.
5. Every destination list belongs to the board.
6. Every position is a non-negative integer.
7. No card ID is duplicated in the request.
8. The submitted cards exactly match all cards currently belonging to the board.

Only after all validation passes does it use `Card.bulkWrite` to update each
card's `list` and `position`.

## 8. Card deletion architecture

The delete path is:

```text
CardItem
  -> window.confirm
  -> Board.handleDeleteCard
  -> useBoard.deleteCard
  -> cardApi.deleteCard
  -> DELETE /api/cards/:id
  -> card.routes
  -> card.controller.remove
  -> card.service.remove
  -> ownership verification
  -> Card.findByIdAndDelete
  -> remaining cards sorted and compacted
  -> response
  -> frontend removes only that card
```

The server compacts the remaining list to positions `0..n-1`. The frontend
also updates its local positions for later cards in the same list so the UI
does not need to wait for a refresh.

An API failure leaves the card in local state and displays the error. The
component does not retain a separate edit state for cards in the board page,
so deleting a card cannot leave a parent-level edit reference to an unmounted
card.

## 9. CRUD data flows

### Initial board load

```text
Board route parameter
  -> useBoard(boardId)
  -> GET /api/boards/:boardId
  -> GET /api/lists/board/:boardId
  -> GET /api/cards/list/:listId for every list
  -> board/list/card React state
  -> ListColumn/CardItem rendering
```

The hook uses a cancellation flag so an old board request cannot overwrite
state after the route changes or the component unmounts.

### Create card

```text
ListColumn form
  -> Board handler
  -> useBoard.createCard
  -> cardApi.createCard
  -> POST /api/cards
  -> server validates list and board ownership
  -> server assigns last position + 1
  -> returned card appended to state
```

### Edit card

```text
CardItem form
  -> Board handler
  -> useBoard.updateCard
  -> PUT /api/cards/:id
  -> server validates ownership and saves title/description
  -> returned card replaces matching state item
```

### Create/edit/delete list

The equivalent list flow goes through `boardApi`, `useBoard`, the list
controller/service, and the list model. Deleting a list deletes its cards and
removes the list and its cards from frontend state.

## 10. Error handling conventions

Frontend:

- `apiRequest` converts non-2xx responses to thrown `Error` objects.
- Feature handlers catch errors and display a user-facing error in board/auth
  state.
- Failed mutations do not remove or replace data optimistically, except drag
  movement, which has explicit rollback.

Backend:

- Controllers map known service errors with `statusCode` to the appropriate
  HTTP status.
- Unexpected errors return a generic operation-specific 500 message.
- Authentication failures return 401.
- Ownership failures use resource-not-found responses to avoid exposing
  another user's resources.

## 11. Environment and commands

### Frontend

```bash
cd frontend
npm install
npm run dev
npm run build
npm run lint
```

Optional API override:

```env
VITE_API_URL=http://localhost:5000
```

### Backend

Create `backend/.env`:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
```

Commands:

```bash
cd backend
npm install
npm start
npm run check
```

## 12. Safe modification rules for future GPT sessions

When modifying board behavior:

1. Keep `Board.tsx` as orchestration, not a new data layer.
2. Put board-scoped state and mutations in `useBoard.ts`.
3. Put HTTP calls in feature service modules.
4. Preserve `Card._id` as the sortable ID.
5. Preserve `group: listId` for sortable cards.
6. Preserve `list:<listId>` for empty/list-container targets.
7. Use `source.initialGroup` and `source.initialIndex` for the source.
8. Use the actual target group/index for the destination.
9. Renumber all affected cards after movement.
10. Send the complete board arrangement to `/api/cards/reorder`.
11. Keep reorder request serialization and rollback behavior.
12. Keep backend board ownership and complete-board validation.

When modifying deletion:

1. Delete through `cardApi` and `useBoard.deleteCard`.
2. Remove only the matching card ID from state.
3. Preserve position compaction.
4. Do not retain references to deleted card objects.
5. Preserve error behavior so failed deletion does not corrupt local state.

## 13. Verification status

The repository has been verified with:

- `npm --prefix frontend run build`
- `npm --prefix frontend run lint`
- `find backend/src -name '*.js' -print0 | xargs -0 -n1 node --check`
- `git diff --check`

There is no configured automated backend test suite. Live MongoDB integration,
browser drag gestures, and browser refresh persistence require a running
backend/database and should be manually smoke-tested before production use.
