# dsa_sheet

A full-stack DSA (Data Structures & Algorithms) mastery and revision tracker built with the **MERN** stack (MongoDB, Express, React 19 + Vite, Node.js, and Tailwind CSS).

---

## Key Features

- **Hierarchical Categorization & Topic Grouping**: Group tags into parent categories like *Data Structures* (Array, Stack, Queue, Tree, Graph) and *Algorithms* (Two Pointers, Sliding Window, DP), or standalone custom lists (*Top 100 Liked*, *Must Revise*, *Blind 75*).
- **Multi-Approach Solutions**: Store multiple solutions per problem (e.g. *Brute Force*, *Optimal - Monotonic Stack*, *Space-Optimized*), along with time/space complexities, language type, and notes.
- **Multi-Platform Problem Links**: Attach links to LeetCode, GeeksforGeeks, Codeforces, YouTube tutorials, and custom platforms.
- **Personal Mastery & Revision Lifecycle**: Track problems by lifecycle status:
  - `Todo`
  - `Attempted`
  - `Understood`
  - `Solved`
  - `Must Revise`
  - `Mastered`
- **Analytics & Stats**: Live summary counters for total solved, bookmarked, difficulty split (Easy, Medium, Hard), and topics.
- **Developer First UI**: Dark and light mode, fast search filter, code copy buttons, and expandable code previews.

---

## Project Structure

```text
dsa_sheet/
├── backend/
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── Problem.js
│   │   ├── Tag.js
│   │   └── User.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── problems.js
│   │   └── tags.js
│   ├── db.js
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AuthModal.jsx
│   │   │   ├── NewTagModal.jsx
│   │   │   ├── ProblemCard.jsx
│   │   │   ├── ProblemModal.jsx
│   │   │   └── SidebarFilter.jsx
│   │   ├── api.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
└── README.md
```

---

## Getting Started

### 1. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:
```env
PORT=5001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.kym3i.mongodb.net/dsa_sheet?retryWrites=true&w=majority
JWT_SECRET=dsa_sheet_super_secret_jwt_key_2026

ADMIN_NAME=Aditya Ojha
ADMIN_EMAIL=ojhaaditya913@gmail.com
ADMIN_PASSWORD=Kaditya@67
```

Start the backend server:
```bash
npm run dev
# or
node server.js
```

### 2. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file in `frontend/`:
```env
VITE_API_BASE_URL=http://localhost:5001
```

Start the frontend development server:
```bash
npm run dev
```
Open [http://localhost:5174](http://localhost:5174) (or [http://localhost:5173](http://localhost:5173)).

