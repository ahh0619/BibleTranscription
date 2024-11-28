import { createContext, useState, useEffect } from "react";
import { disableRightClick, disableCopyPaste } from "../../utils/eventHandlers";
import { loadSavedData } from "../../utils/dataUtils";
import { saveInputToLocalStorage } from "../../utils/storageUtils";

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
  const initializeReadingCount = () => {
    const savedData = JSON.parse(localStorage.getItem(userId) || "{}");
    if (savedData.readings && savedData.readings.length > 0) {
      // 가장 높은 readingCount 가져오기
      const maxReadingCount = Math.max(
        ...savedData.readings.map((reading) => reading.readingCount)
      );
      setReadingCount(maxReadingCount); // 가장 높은 readingCount로 설정
    } else {
      setReadingCount(0); // 데이터가 없으면 0으로 초기화
    }
  };

  // 1독 완료 여부 확인
  const checkReadingCompletion = () => {
    const savedData = JSON.parse(localStorage.getItem(userId) || "{}");

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

    // 저장된 모든 절의 개수 확인
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

    // 1독 완료 여부 확인
    if (totalVersesCompleted === TOTAL_VERSES) {
      setIsReadingComplete(true);

      // 현재 버전의 독 수 증가
      setReadingCount((prevCounts) => ({
        ...prevCounts,
        [selectedVersion]: prevCounts[selectedVersion] + 1,
      }));

      // 초기화 상태로 설정
      setSelectedBook("");
      setSelectedChapter(null);
      setChapters([]);
      setVerses([]);
      setInputValues({});
    } else {
      setIsReadingComplete(false);
    }
  };

  // 데이터 저장 핸들러
  const handleSaveInput = (verseNumber, value) => {
    saveInputToLocalStorage(
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
  const handleLoadSavedData = () => {
    if (!selectedBook || selectedChapter === null) return;

    const loadedVerses = loadSavedData(
      readingCount,
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
