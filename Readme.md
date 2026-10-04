# Drello

> **Built for plans. Designed for progress.**

Drello is a Trello-inspired productivity and project-management app built with the MERN stack. Its core idea is that **real plans change**, and the app should record how and why.

Most todo apps only track the final state of a task: completed, pending, or deleted. Drello is designed to track **how a plan changed and why**. For example, if you created a card called `Learn JavaScript` and later realize the course isn't helping, you can move it to a dismissed state and record the reason, instead of just deleting it.

> **Plans change. Drello remembers.**

---

## Project Status

**Under active development. Not production-ready.**

The backend foundation and core CRUD functionality are done. The frontend is being built next, followed by drag-and-drop and the custom modification-history system.

### Implemented

- React + TypeScript (Vite) frontend setup
- Node.js + Express backend
- MongoDB Atlas integration with Mongoose
- User registration and login (email or username)
- Password hashing with bcrypt
- JWT authentication and protected routes
- User-specific authorization (ownership checks)
- Board, List and Card CRUD
- Board → List → Card data hierarchy

### In progress

- Landing page, login and signup UI
- Dashboard and board interface
- Frontend/backend integration
- Drag-and-drop and card ordering
- Modification history and decision/reason tracking
- Deployment

---

## Core Concept

```text
Board
 ├── List
 │    ├── Card
 │    └── Card
 └── List
      └── Card
```

| Level     | Meaning                                | Examples                                           |
| --------- | -------------------------------------- | -------------------------------------------------- |
| **Board** | A larger project, goal or area of work | DSA Preparation, Personal Projects, Semester Goals |
| **List**  | A category or stage within a board     | To Do, In Progress, Completed, Dismissed           |
| **Card**  | An actionable task                     | Learn Binary Trees, Build Authentication System    |

The modification-history feature revolves around cards.

### The idea in practice

A normal app shows:

```text
Learn JavaScript
Status: Dismissed
```

Drello aims to show:

```text
Learn JavaScript

10 Sep  Created
12 Sep  Moved to In Progress
16 Sep  Description updated
21 Sep  Moved to Dismissed

Reason:
"The course felt like I was just rewatching material
without actually learning anything."
```

This history is what separates Drello from a basic Trello clone.

---

## Tech Stack

| Layer    | Technologies                              |
| -------- | ----------------------------------------- |
| Frontend | React, TypeScript, Vite, CSS              |
| Backend  | Node.js, Express.js, JavaScript, REST API |
| Database | MongoDB, MongoDB Atlas, Mongoose          |
| Auth     | JWT, bcrypt                               |
| Tools    | Git, GitHub, Postman, VS Code             |

---

## Architecture

```text
Drello
├── client/        React + TypeScript + Vite
├── server/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── .env
│   └── server.js
└── README.md
```

Data flow:

```text
React → REST API → Express → Mongoose → MongoDB
```

The frontend handles the UI and interaction. The backend handles authentication, authorization, business logic, database operations and API responses.

---

## Authentication

Drello uses **custom JWT authentication** (not NextAuth).

- **Register** with email, username and password. Passwords are hashed with `bcrypt`; plain-text passwords are never stored.
- **Login** with either email + password or username + password.
- On success, the backend issues a JWT containing the user's ID. Protected routes use this token to identify the user.

## Authorization

Authentication answers _who is the user?_ Authorization answers _is this user allowed to access this resource?_

The backend checks ownership on every request. For example, a board is fetched using both its ID and the authenticated user's ID:

```js
{
  _id: req.params.id,
  owner: req.userId
}
```

This stops a user from accessing another user's board just by knowing its ID. The ownership chain is `User → Board → List → Card`. Before creating a card, the backend verifies that the list exists, belongs to a board, and that the board belongs to the authenticated user. The same rule applies to read, update and delete.

---

## API Reference

### Auth

```text
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/protected     (used to verify JWT authentication)
```

### Boards

```text
POST   /api/boards
GET    /api/boards
GET    /api/boards/:id
PUT    /api/boards/:id
DELETE /api/boards/:id
```

The client only sends the board details:

```json
{
  "name": "DSA Preparation",
  "description": "My placement preparation"
}
```

The owner is **never supplied by the client**. It comes from the JWT: `JWT → authMiddleware → req.userId → Board.owner`.

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
```

---

## Database Models

```text
User:  email (unique), username (unique), password, createdAt, updatedAt
Board: name, description, owner → User, createdAt, updatedAt
List:  name, board → Board, createdAt, updatedAt
Card:  title, description, list → List, createdAt, updatedAt
```

The Card model will be extended with ordering and modification history.

---

## Planned: Drag and Drop

A card needs to know which list it is in and where it sits inside that list. The existing `list` field answers the first question; a future `position` field will answer the second.

```text
To Do:        Card A (0), Card B (1), Card C (2)

After moving Card B to In Progress:

To Do:        Card A (0), Card C (1)
In Progress:  Card D (0), Card B (1)
```

The frontend handles the drag interaction; the backend persists the new list and position.

---

## Planned: Modification History

The main Drello-specific feature. The history system is expected to track:

- Status changes and list changes
- Task modifications and important updates
- Decision/reason notes
- Number of changes and when they happened

The exact implementation is still being designed.

---

## Design Direction

Drello deliberately avoids the generic productivity-app look. The visual direction is inspired by editorial design, large typography, warm muted colors, minimal interfaces, strong visual hierarchy and product-focused layouts.

Landing page message: **BUILT FOR PLANS. DESIGNED FOR PROGRESS.**

The landing page is built around this idea: you add a task, give it a checkbox, feel productive, and three weeks later it's still there. Maybe the problem isn't that you didn't finish the plan. Maybe the plan was wrong.

---

## Roadmap

### Phase 1: Backend Foundation

- [x] Express server, MongoDB connection, Mongoose setup
- [x] User model, registration, login
- [x] Password hashing, JWT generation
- [x] Authentication middleware and protected routes

### Phase 2: Core Application Data

- [x] Board, List and Card models
- [x] Board, List and Card CRUD
- [x] Ownership validation and nested resource authorization

### Phase 3: Frontend

- [x] React + TypeScript and Vite setup
- [ ] Landing page
- [ ] Login and signup pages
- [ ] Dashboard
- [ ] Board page and Board/List/Card UI
- [ ] API integration
- [ ] Authentication state

### Phase 4: Kanban Functionality

- [ ] Drag and drop
- [ ] Card ordering
- [ ] Move cards between lists
- [ ] Position management
- [ ] Optimistic UI updates

### Phase 5: Drello History System

- [ ] Modification history model
- [ ] Status history and list movement history
- [ ] Decision/reason notes
- [ ] History timeline
- [ ] Change count
- [ ] Time-based activity information

### Phase 6: Production

- [ ] Production environment configuration
- [ ] Backend and frontend deployment
- [ ] Production MongoDB configuration
- [ ] API configuration
- [ ] Responsive design
- [ ] Improved error handling
- [ ] Security improvements
- [ ] Testing
- [ ] Final polish

---

## Running Locally

### Prerequisites

- Node.js
- npm
- Git
- A MongoDB database (the project currently uses MongoDB Atlas)

### Clone

```bash
git clone <your-repository-url>
cd Drello
```

### Backend

```bash
cd server
npm install
```

Create a `.env` file in `server/`:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

Start the server:

```bash
node server.js
```

The backend runs on `http://localhost:5000`.

### Frontend

In a second terminal:

```bash
cd client
npm install
npm run dev
```

Vite prints the local development URL in the terminal.

### Environment Variables

| Variable     | Description               |
| ------------ | ------------------------- |
| `MONGO_URI`  | MongoDB connection string |
| `JWT_SECRET` | Secret used to sign JWTs  |

Never commit `.env` files or database credentials to GitHub. Keep `.env` in `.gitignore`.

---

## Development Approach

Drello is built incrementally, with each feature implemented and tested as it is added:

```text
Design → Frontend → API → Backend → Database → Integration → Testing → Deployment
```

The project is intentionally built without a generated application or a complete pre-built template, so that every part of the app and how the pieces connect is understood.

---

## Current Limitations

Drello is **not yet production-ready**. Still incomplete:

- Frontend authentication, dashboard and complete board interface
- Drag and drop and card ordering
- Modification history and decision tracking
- Full frontend/backend integration
- Production deployment
- Automated testing and production-level error handling
- Final responsive design

The project is expected to change significantly as development continues.

---

## Future Ideas

These are ideas, not committed features:

- Detailed activity timelines
- Better decision tracking
- Productivity insights and analytics based on plan changes
- Search and filtering
- Keyboard shortcuts
- Board templates
- More advanced card metadata
- Collaboration features
- Real-time updates

---

## Project Goals

1. **Build something beyond a tutorial.** Not just a Trello clone, but an app built around _plan evolution_.
2. **Understand full-stack development.** Learn how React, REST API, Express and MongoDB work together, including authentication, authorization, database relationships, API design, frontend state, drag and drop, and deployment.
3. **Explore a different approach to productivity.** Most apps ask _"Did you complete the task?"_ Drello asks _"What happened to the plan?"_

---

## Contributing

Drello is currently a personal project under active development. The repository may be opened for contributions once the core application is complete.

## License

This is currently a personal learning and portfolio project. A formal open-source license will be added if and when it is released for public contribution.

---

**Drello**: Built for plans. Designed for progress.
_Because plans change._
