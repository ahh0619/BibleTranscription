import { createContext, useState, useEffect } from "react";
import { disableRightClick, disableCopyPaste } from "../../utils/eventHandlers";
import { saveInputToLocalStorage } from "../../utils/storageUtils";
import { loadSavedData } from "../../utils/dataUtils";

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

  const userId = "admin";

  const fetchBooks = async () => {
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

  const handleLoadSavedData = () => {
    if (!selectedBook || selectedChapter === null) return;

    const loadedVerses = loadSavedData(
      1, // 기본적으로 1독
      selectedVersion,
      userId,
      selectedBook,
      selectedChapter
    );

    const formattedValues = loadedVerses.reduce((acc, verse) => {
      acc[verse.verse] = verse.content;
      return acc;
    }, {});

    setInputValues(formattedValues);
  };

  useEffect(() => {
    handleLoadSavedData();
  }, [selectedBook, selectedChapter, selectedVersion]);

  const handleSaveInput = (verseNumber, value) => {
    saveInputToLocalStorage(
      verseNumber,
      value,
      userId,
      selectedBook,
      selectedChapter,
      selectedVersion,
      1
    );
  };

  useEffect(() => {
    fetchBooks();

    document.addEventListener("contextmenu", disableRightClick);
    document.addEventListener("keydown", disableCopyPaste);

    return () => {
      document.removeEventListener("contextmenu", disableRightClick);
      document.removeEventListener("keydown", disableCopyPaste);
    };
  }, []);

  useEffect(() => {
    handleLoadSavedData();
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

    handleSaveInput(verseNumber, value);
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
