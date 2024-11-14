import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import BibleContext from "../context/BibleContext";

const Home = () => {
  const nav = useNavigate();
  const { setShowSelect } = useContext(BibleContext);
  const [todaysVerse, setTodaysVerse] = useState(null);

  useEffect(() => {
    const storedVerse = localStorage.getItem("todaysVerse");
    const lastUpdated = localStorage.getItem("lastUpdated");

    const today = new Date().toISOString().split("T")[0];
    if (!storedVerse || lastUpdated !== today) {
      fetch("/data/books.json")
        .then((response) => response.json())
        .then((books) => {
          const randomBook = books[Math.floor(Math.random() * books.length)];

          return fetch(`/data/${randomBook}.json`)
            .then((response) => response.json())
            .then((bookData) => {
              const randomChapter =
                bookData.chapters[
                  Math.floor(Math.random() * bookData.chapters.length)
                ];
              const randomVerse =
                randomChapter.verses[
                  Math.floor(Math.random() * randomChapter.verses.length)
                ];

              const newVerse = {
                text: randomVerse.text,
                reference: `${bookData.book} ${randomChapter.chapter} : ${randomVerse.verse}`,
              };

              localStorage.setItem("todaysVerse", JSON.stringify(newVerse));
              localStorage.setItem("lastUpdated", today);

              setTodaysVerse(newVerse);
            });
        })
        .catch((error) => console.error("Error loading today's verse:", error));
    } else {
      setTodaysVerse(JSON.parse(storedVerse));
    }
  }, []);

  return (
    <div className="Home">
      <h1>따라쓰는 성경</h1>
      <div className="TheBible">
        <p>오늘의 말씀</p>
        <div className="TodayTheBible">
          {todaysVerse ? (
            <>
              <p>{todaysVerse.text}</p>
              <p>{todaysVerse.reference}</p>
            </>
          ) : (
            <p>로딩 중...</p>
          )}
        </div>
      </div>
      <button
        onClick={() => {
          setShowSelect(true);
          nav("/bible-transcription");
        }}
      >
        홈으로
      </button>
    </div>
  );
};

export default Home;
