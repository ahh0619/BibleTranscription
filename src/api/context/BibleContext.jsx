import { createContext, useState, useEffect } from "react";
import { disableRightClick, disableCopyPaste } from "../../utils/eventHandlers"; // import 추가

const BibleContext = createContext();

export const BibleProvider = ({ children }) => {
  const [books, setBooks] = useState({ ko: [], en: [] });
  const [selectedBook, setSelectedBook] = useState("");
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [verses, setVerses] = useState([]);
  const [inputValues, setInputValues] = useState({});
  const [selectedVersion, setSelectedVersion] = useState(
    "NewKoreanRevisedVersion"
  );
  const [showSelect, setShowSelect] = useState(true);

  const userId = "admin"; // 기본 userId 설정

  // 로컬스토리지에서 데이터를 로드
  const loadSavedData = () => {
    if (!selectedBook || selectedChapter === null) return;

    const savedData = JSON.parse(localStorage.getItem(userId) || "{}");
    const versionData = savedData[selectedVersion];
    if (!versionData) return setInputValues({});

    const bookData = versionData[selectedBook];
    if (!bookData) return setInputValues({});

    const chapterData = bookData[selectedChapter];
    if (chapterData) {
      setInputValues(chapterData);
    } else {
      setInputValues({});
    }
  };

  // 로컬스토리지에 데이터를 저장
  const saveInputToLocalStorage = (verseNumber, value) => {
    const savedData = JSON.parse(localStorage.getItem(userId) || "{}");

    if (!savedData[selectedVersion]) {
      savedData[selectedVersion] = {};
    }

    if (!savedData[selectedVersion][selectedBook]) {
      savedData[selectedVersion][selectedBook] = {};
    }

    if (!savedData[selectedVersion][selectedBook][selectedChapter]) {
      savedData[selectedVersion][selectedBook][selectedChapter] = {};
    }

    savedData[selectedVersion][selectedBook][selectedChapter][verseNumber] =
      value;

    const dataToSave = { userId, ...savedData };
    localStorage.setItem(userId, JSON.stringify(dataToSave));
  };

  useEffect(() => {
    // 책 데이터를 로드
    const loadBooks = async () => {
      try {
        const koBooks = await fetch(
          "/data/NewKoreanRevisedVersion/books.json"
        ).then((res) => res.json());
        const enBooks = await fetch("/data/KingJamesVersion/books.json").then(
          (res) => res.json()
        );
        setBooks({ ko: koBooks, en: enBooks });
      } catch (error) {
        console.error("Error loading books:", error);
      }
    };

    loadBooks();

    // 이벤트 리스너 추가
    document.addEventListener("contextmenu", disableRightClick);
    document.addEventListener("keydown", disableCopyPaste);

    // 컴포넌트가 언마운트될 때 이벤트 제거
    return () => {
      document.removeEventListener("contextmenu", disableRightClick);
      document.removeEventListener("keydown", disableCopyPaste);
    };
  }, []);

  useEffect(() => {
    loadSavedData();
  }, [selectedBook, selectedChapter, selectedVersion]);

  const handleBookChange = async (book) => {
    setSelectedBook(book);
    setSelectedChapter(null);
    setChapters([]);
    setVerses([]);

    if (book) {
      try {
        const versionPath =
          selectedVersion === "NewKoreanRevisedVersion"
            ? "NewKoreanRevisedVersion"
            : "KingJamesVersion";
        const response = await fetch(`/data/${versionPath}/${book}.json`);
        const data = await response.json();

        const processedChapters = data.chapters.map((ch) => ({
          ...ch,
          chapter: Number(ch.chapter),
        }));

        setChapters(processedChapters);

        const firstChapter = processedChapters[0]?.chapter || 1;
        handleChapterChange(firstChapter, processedChapters);
      } catch (error) {
        console.error("Error loading book chapters:", error);
      }
    }
  };

  const handleChapterChange = (chapter, availableChapters = chapters) => {
    setSelectedChapter(chapter);

    const chapterData = availableChapters.find((ch) => ch.chapter === chapter);
    if (chapterData) {
      setVerses(chapterData.verses || []);
    } else {
      setVerses([]);
    }
  };

  const handleVersionChange = (newVersion) => {
    setSelectedVersion(newVersion);
    setSelectedBook("");
    setSelectedChapter(null);
    setChapters([]);
    setVerses([]);
  };

  const handleInputChange = (verseNumber, value) => {
    setInputValues((prevValues) => ({
      ...prevValues,
      [verseNumber]: value,
    }));

    saveInputToLocalStorage(verseNumber, value);
  };

  return (
    <BibleContext.Provider
      value={{
        books,
        selectedBook,
        selectedChapter,
        chapters,
        verses,
        inputValues,
        selectedVersion,
        showSelect,
        setShowSelect,
        handleBookChange,
        handleChapterChange,
        handleVersionChange,
        handleInputChange,
      }}
    >
      {children}
    </BibleContext.Provider>
  );
};

export default BibleContext;
