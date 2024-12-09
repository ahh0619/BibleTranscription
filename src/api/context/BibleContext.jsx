import { createContext, useState, useEffect } from "react";
import { disableRightClick, disableCopyPaste } from "../../utils/eventHandlers";
import { loadSavedData } from "../../utils/dataUtils";
import { saveInputToFirebase } from "../../utils/storageUtils";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";

const TOTAL_VERSES = 31173; // 전체 성경 절 수

const BibleContext = createContext();

export const BibleProvider = ({ children }) => {
  const [books, setBooks] = useState({ ko: [], en: [] }); // 책 데이터
  const [selectedBook, setSelectedBook] = useState(""); // 선택된 책
  const [selectedChapter, setSelectedChapter] = useState(null); // 선택된 장
  const [chapters, setChapters] = useState([]); // 현재 책의 장 목록
  const [verses, setVerses] = useState([]); // 현재 장의 절 목록
  const [inputValues, setInputValues] = useState({}); // 절 입력 값
  const [selectedVersion, setSelectedVersion] = useState(
    "NewKoreanRevisedVersion"
  ); // 선택된 성경 버전
  const [showSelect, setShowSelect] = useState(true); // 선택 창 표시 여부
  const [readingCount, setReadingCount] = useState({
    NewKoreanRevisedVersion: 0,
    KingJamesVersion: 0,
  }); // 버전별 독 수
  // 현재 읽기 카운트
  const [isReadingComplete, setIsReadingComplete] = useState(false); // 1독 완료 여부

  const userId = "admin"; // 테스트용 사용자 ID

  // 책 데이터 가져오기
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

  // 최대 readingCount 가져오기
  const initializeReadingCount = async () => {
    try {
      const docRef = doc(db, userId, "bible");
      const docSnapshot = await getDoc(docRef);

      if (docSnapshot.exists()) {
        const savedData = docSnapshot.data();
        if (savedData.readings && savedData.readings.length > 0) {
          const maxReadingCount = Math.max(
            ...savedData.readings.map((reading) => reading.readingCount)
          );
          setReadingCount((prev) => ({
            ...prev,
            [selectedVersion]: maxReadingCount,
          }));
          console.log("Updated readingCount:", readingCount);
        } else {
          setReadingCount((prev) => ({
            ...prev,
            [selectedVersion]: 0,
          }));
        }
      } else {
        setReadingCount((prev) => ({
          ...prev,
          [selectedVersion]: 0,
        }));
      }
    } catch (error) {
      console.error("Error initializing reading count:", error);
      setReadingCount((prev) => ({
        ...prev,
        [selectedVersion]: 0,
      }));
    }
  };

  // 1독 완료 여부 확인
  const checkReadingCompletion = async () => {
    try {
      const docRef = doc(db, userId, "bible");
      const docSnapshot = await getDoc(docRef);

      if (!docSnapshot.exists()) {
        setIsReadingComplete(false);
        return;
      }

      const savedData = docSnapshot.data();

      if (!savedData.readings || savedData.readings.length === 0) {
        setIsReadingComplete(false);
        return;
      }

      const currentReading = savedData.readings.find(
        (reading) => reading.readingCount === readingCount[selectedVersion]
      );

      if (!currentReading) {
        setIsReadingComplete(false);
        return;
      }

      const totalVersesCompleted = currentReading.versions.reduce(
        (total, version) =>
          total +
          version.completedBooks.reduce(
            (bookTotal, book) =>
              bookTotal +
              book.chapters.reduce(
                (chapterTotal, chapter) => chapterTotal + chapter.verses.length,
                0
              ),
            0
          ),
        0
      );

      if (totalVersesCompleted === TOTAL_VERSES) {
        setIsReadingComplete(true);

        setReadingCount((prevCounts) => ({
          ...prevCounts,
          [selectedVersion]: prevCounts[selectedVersion] + 1,
        }));

        setSelectedBook("");
        setSelectedChapter(null);
        setChapters([]);
        setVerses([]);
        setInputValues({});
      } else {
        setIsReadingComplete(false);
      }
    } catch (error) {
      console.error("Error checking reading completion:", error);
      setIsReadingComplete(false);
    }
  };

  // 데이터 저장 핸들러
  const handleSaveInput = (verseNumber, value) => {
    saveInputToFirebase(
      verseNumber,
      value,
      userId,
      selectedBook,
      selectedChapter,
      selectedVersion,
      readingCount
    );

    // 입력 후 1독 완료 여부 확인
    checkReadingCompletion();
  };

  // 저장된 데이터 로드
  const handleLoadSavedData = async () => {
    if (!selectedBook || selectedChapter === null) {
      return;
    }

    try {
      // `loadSavedData` 호출
      const loadedVerses = await loadSavedData(
        readingCount[selectedVersion],
        selectedVersion,
        userId,
        selectedBook,
        selectedChapter
      );

      if (!Array.isArray(loadedVerses)) {
        console.log("Loaded verses is not an array:", loadedVerses);
        setInputValues({});
        return;
      }

      const formattedValues = loadedVerses.reduce((acc, verse) => {
        acc[verse.verse] = verse.content;
        return acc;
      }, {});

      setInputValues(formattedValues || {});
    } catch (error) {
      console.error("Error handling loaded data:", error);
      setInputValues({});
    }
  };

  // 책 변경 핸들러
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

  // 장 변경 핸들러
  const handleChapterChange = (chapter, availableChapters = chapters) => {
    setSelectedChapter(chapter);

    const chapterData = availableChapters.find((ch) => ch.chapter === chapter);
    if (chapterData) {
      setVerses(chapterData.verses || []);
    } else {
      setVerses([]);
    }
  };

  // 버전 변경 핸들러
  const handleVersionChange = (newVersion) => {
    setSelectedVersion(newVersion);
    setSelectedBook("");
    setSelectedChapter(null);
    setChapters([]);
    setVerses([]);
  };

  // 절 입력 핸들러
  const handleInputChange = (verseNumber, value) => {
    setInputValues((prevValues) => ({
      ...prevValues,
      [verseNumber]: value,
    }));

    handleSaveInput(verseNumber, value);
  };

  // 초기 데이터 로드
  useEffect(() => {
    fetchBooks();
    initializeReadingCount(); // 최대 readingCount 초기화
    document.addEventListener("contextmenu", disableRightClick);
    document.addEventListener("keydown", disableCopyPaste);

    return () => {
      document.removeEventListener("contextmenu", disableRightClick);
      document.removeEventListener("keydown", disableCopyPaste);
    };
  }, []);

  // 데이터 변경 시 저장된 데이터 로드
  useEffect(() => {
    handleLoadSavedData();
  }, [selectedBook, selectedChapter, selectedVersion, readingCount]);

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
        readingCount,
        showSelect,
        isReadingComplete,
        setShowSelect,
        handleBookChange,
        handleChapterChange,
        handleVersionChange,
        handleInputChange,
        setReadingCount, // 필요 시 읽기 카운트 변경
      }}
    >
      {children}
    </BibleContext.Provider>
  );
};

export default BibleContext;
