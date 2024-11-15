import { createContext, useState, useEffect, useCallback } from "react";
import { fetchBooksData, loadSavedData } from "../utils/dataUtils";
import { disableRightClick, disableCopyPaste } from "../utils/eventHandlers";
import { saveInputToLocalStorage } from "../utils/storageUtils";

const BibleContext = createContext();

export const BibleProvider = ({ children }) => {
  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState("");
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [verses, setVerses] = useState([]);
  const [inputValues, setInputValues] = useState({});
  const [showSelect, setShowSelect] = useState(true);
  const userId = "admin";

  useEffect(() => {
    fetchBooksData(setBooks);

    document.addEventListener("contextmenu", disableRightClick);
    document.addEventListener("keydown", disableCopyPaste);

    return () => {
      document.removeEventListener("contextmenu", disableRightClick);
      document.removeEventListener("keydown", disableCopyPaste);
    };
  }, []);

  const loadSavedDataCallback = useCallback(() => {
    loadSavedData(selectedBook, selectedChapter, userId, setInputValues);
  }, [selectedBook, selectedChapter]);

  useEffect(() => {
    loadSavedDataCallback();
  }, [loadSavedDataCallback]);

  const handleBookChange = async (book) => {
    setSelectedBook(book);
    setInputValues({});
    setChapters([]);
    setVerses([]);

    if (book) {
      try {
        const response = await fetch(`/data/${book}.json`);
        const data = await response.json();
        setChapters(data.chapters);

        const firstChapter = data.chapters[0]?.chapter || 1;
        setSelectedChapter(firstChapter);

        const firstChapterData = data.chapters.find(
          (ch) => ch.chapter === firstChapter
        );
        if (firstChapterData) {
          setVerses(firstChapterData.verses);
        }
      } catch (error) {
        console.error("Error loading book chapters:", error);
      }
    }
  };

  const handleChapterChange = (chapter) => {
    setSelectedChapter(chapter);
    if (!chapter) {
      setVerses([]);
      return;
    }

    const chapterData = chapters.find((ch) => ch.chapter === chapter);
    if (chapterData) {
      setVerses(chapterData.verses);
    }
  };

  const handleInputChange = (verseNumber, value) => {
    setInputValues((prevValues) => ({
      ...prevValues,
      [verseNumber]: value,
    }));
    saveInputToLocalStorage(
      verseNumber,
      value,
      userId,
      selectedBook,
      selectedChapter
    );
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
        showSelect,
        setShowSelect,
        handleBookChange,
        handleChapterChange,
        handleInputChange,
      }}
    >
      {children}
    </BibleContext.Provider>
  );
};

export default BibleContext;
