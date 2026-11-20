import { BrowserRouter, Routes, Route } from "react-router-dom";

import Landing from "../features/landing/components/Landing";
import Login from "../features/auth/components/Login";
import Signup from "../features/auth/components/Signup";
import Dashboard from "../features/boards/components/Dashboard";
import Board from "../features/boards/components/Board";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/boards/:boardId" element={<Board />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
