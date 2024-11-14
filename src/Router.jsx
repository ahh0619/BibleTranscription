import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Mypage from "./pages/Mypage";
import Ranking from "./pages/Ranking";
import Community from "./pages/Community";
import BibleTranscription from "./pages/BibleTranscription";
import { BibleProvider } from "./context/BibleContext";

function AppRouter() {
  return (
    <Router>
      <BibleProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/mypage" element={<Mypage />} />
          <Route path="/ranking" element={<Ranking />} />
          <Route path="/community" element={<Community />} />
          <Route path="/bible-transcription" element={<BibleTranscription />} />
        </Routes>
      </BibleProvider>
    </Router>
  );
}

export default AppRouter;
