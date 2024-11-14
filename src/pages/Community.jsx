import "./Community.css";
import Header from "../components/Header";
import { useNavigate } from "react-router-dom";

const Community = () => {
  const nav = useNavigate();
  return (
    <div className="Community">
      <Header />
      <h1>게시판 페이지는 준비중입니다.</h1>
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

export default Community;
