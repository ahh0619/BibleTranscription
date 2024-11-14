import { useContext, useRef } from "react";
import BibleContext from "../context/BibleContext";
import BibleVerse from "./BibleVerse";
import BibleInput from "./BibleInput";
import "./BibleContent.css";

const BibleContent = () => {
  const {
    verses,
    selectedBook,
    selectedChapter,
    books,
    chapters,
    handleBookChange,
    handleChapterChange,
    showSelect,
  } = useContext(BibleContext);
  const inputRefs = useRef([]);

  const handleEnterPress = (index) => {
    const verseText = verses[index]?.text;
    const inputValue = inputRefs.current[index]?.value || "";
    if (inputValue === verseText) {
      const nextIndex = index + 1;
      if (inputRefs.current[nextIndex]) {
        inputRefs.current[nextIndex].focus();
      }
    }
  };

  // 책 변경 시 1장 구절로 자동 설정
  const handleBookChangeWithFirstChapter = (book) => {
    handleBookChange(book);

    // 첫 번째 장과 그 구절로 설정
    const firstChapter = chapters[0]?.chapter || 1;
    handleChapterChange(firstChapter);
  };

  return (
    <div className="BibleContent">
      {showSelect && (
        <div className="SelectWrap">
          <select
            value={selectedBook}
            onChange={(e) => handleBookChangeWithFirstChapter(e.target.value)}
          >
            <option value="">책을 선택해주세요</option>
            {books.map((book, index) => (
              <option key={index} value={book}>
                {book}
              </option>
            ))}
          </select>
          <select
            value={selectedChapter || ""}
            onChange={(e) => handleChapterChange(Number(e.target.value))}
            disabled={!selectedBook}
          >
            <option value="">장을 선택해주세요</option>
            {chapters.map((chapter, index) => (
              <option key={index} value={chapter.chapter}>
                제 {chapter.chapter} 장
              </option>
            ))}
          </select>
        </div>
      )}

      {/* 책과 장이 선택된 경우에만 제목과 구절 표시 */}
      {selectedBook && selectedChapter && verses.length > 0 ? (
        <>
          <h2>{selectedBook}</h2>
          <h3>제 {selectedChapter} 장</h3>
          {verses.map((verse, index) => (
            <div key={index} className="VerseContainer">
              <BibleVerse index={index} />
              <BibleInput
                ref={(el) => (inputRefs.current[index] = el)}
                index={index}
                onEnter={() => handleEnterPress(index)}
              />
            </div>
          ))}
        </>
      ) : null}
    </div>
  );
};

export default BibleContent;
