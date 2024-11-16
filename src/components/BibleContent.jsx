import { useContext, useRef } from "react";
import BibleInput from "./BibleInput";
import BibleVerse from "./BibleVerse";
import BibleContext from "../api/context/BibleContext";
import "./BibleContent.css";

const BibleContent = () => {
  const {
    books,
    selectedBook,
    selectedChapter,
    chapters,
    verses,
    selectedVersion,
    showSelect,
    setShowSelect,
    handleBookChange,
    handleChapterChange,
    handleVersionChange,
  } = useContext(BibleContext);

  const inputRefs = useRef([]);

  const versionBooks =
    selectedVersion === "NewKoreanRevisedVersion" ? books.ko : books.en;

  const handleEnterPress = (index) => {
    const nextIndex = index + 1;
    if (inputRefs.current[nextIndex]) {
      inputRefs.current[nextIndex].focus();
    }
  };

  const bookPlaceholder =
    selectedVersion === "NewKoreanRevisedVersion"
      ? "책을 선택해주세요"
      : "Select a Book";
  const chapterPlaceholder =
    selectedVersion === "NewKoreanRevisedVersion"
      ? "장을 선택해주세요"
      : "Select a Chapter";

  return (
    <div className="BibleContent">
      {showSelect ? (
        <div className="select-wrap">
          <select
            value={selectedVersion}
            onChange={(e) => {
              handleVersionChange(e.target.value);
              setShowSelect(true);
            }}
          >
            <option value="NewKoreanRevisedVersion">개역개정</option>
            <option value="KingJamesVersion">English(KJV)</option>
          </select>
          <select
            value={selectedBook || ""}
            onChange={(e) => handleBookChange(e.target.value)}
          >
            <option value="">{bookPlaceholder}</option>
            {versionBooks.map((book, index) => (
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
            <option value="">{chapterPlaceholder}</option>
            {chapters.map((chapter, index) => (
              <option key={index} value={chapter.chapter}>
                {selectedVersion === "NewKoreanRevisedVersion"
                  ? `제 ${chapter.chapter} 장`
                  : `Chapter ${chapter.chapter}`}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      {selectedBook && selectedChapter && verses.length > 0 ? (
        <div>
          <h2>{selectedBook}</h2>
          <h3>
            {selectedVersion === "NewKoreanRevisedVersion"
              ? `제 ${selectedChapter} 장`
              : `Chapter ${selectedChapter}`}
          </h3>
          {verses.map((verse, index) => (
            <div key={index} className="verse-container">
              <BibleVerse index={index} />
              <BibleInput
                ref={(el) => (inputRefs.current[index] = el)}
                index={index}
                onEnter={() => handleEnterPress(index)}
              />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default BibleContent;
