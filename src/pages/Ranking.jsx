import "./Ranking.css";
import Header from "../components/Header";
import { useNavigate } from "react-router-dom";

const Ranking = () => {
  const nav = useNavigate();
  return (
    <div className="Ranking">
      <Header />
      <h1>랭킹 페이지는 준비중입니다.</h1>
      <button
        onClick={() => {
          nav(-1);
        }}
      >
        뒤로 가기
      </button>
    </div>
  );
};

export default Ranking;
