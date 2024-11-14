import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import BibleContext from "../context/BibleContext";
import Swal from "sweetalert2";
import "./Header.css";

const Header = () => {
  const { setShowSelect } = useContext(BibleContext);
  const navigate = useNavigate();

  const showTodaysVerse = () => {
    const storedVerse = localStorage.getItem("todaysVerse");
    const todaysVerse = storedVerse
      ? JSON.parse(storedVerse)
      : { text: "오늘의 말씀을 준비 중입니다.", reference: "" };

    Swal.fire({
      title: "오늘의 말씀",
      html: `
        <p style="font-size: 18px; font-weight: 500; color: #333;">${todaysVerse.text}</p>
        <p style="font-size: 16px; color: #888;">${todaysVerse.reference}</p>
      `,
      imageUrl: "/images/woodcross.png",
      imageWidth: 100,
      imageHeight: 100,
      imageAlt: "성경 아이콘",
      confirmButtonText: "확인",
      confirmButtonColor: "#6c757d",
      background: "#f8f9fa",
      customClass: {
        popup: "swal-popup-custom",
        title: "swal-title-custom",
        confirmButton: "swal-confirm-button-custom",
      },
    });
  };

  return (
    <div className="Header">
      <h1>따라쓰는 성경</h1>
      <div className="NavButtons">
        <button onClick={showTodaysVerse}>오늘의 말씀</button>
        <button
          onClick={() => {
            setShowSelect(true);
            navigate("/bible-transcription");
          }}
        >
          성경쓰기
        </button>
        <button onClick={() => navigate("/ranking")}>랭킹</button>
        <button onClick={() => navigate("/community")}>게시판</button>
      </div>
    </div>
  );
};

export default Header;
