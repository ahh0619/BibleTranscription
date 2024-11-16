export const saveInputToLocalStorage = (
  verseNumber,
  value,
  userId,
  selectedBook,
  selectedChapter,
  language,
  readingCount
) => {
  // 로컬스토리지에서 데이터를 가져옵니다.
  const savedData = JSON.parse(localStorage.getItem(userId) || "{}");

  // userId와 readings 초기화
  if (!savedData.userId) {
    savedData.userId = userId;
    savedData.readings = [];
  }

  // readingCount 초기화 및 찾기
  let readingData = savedData.readings.find(
    (r) => r.readingCount === readingCount
  );
  if (!readingData) {
    readingData = { readingCount, versions: [] };
    savedData.readings.push(readingData);
  }

  // versions 초기화 및 해당 버전 찾기
  let versionData = readingData.versions.find((v) => v.version === language);
  if (!versionData) {
    versionData = { version: language, completedBooks: [] };
    readingData.versions.push(versionData);
  }

  // completedBooks 초기화 및 해당 책 찾기
  let bookData = versionData.completedBooks.find(
    (b) => b.book === selectedBook
  );
  if (!bookData) {
    bookData = { book: selectedBook, chapters: [] };
    versionData.completedBooks.push(bookData);
  }

  // chapters 초기화 및 해당 장 찾기
  let chapterData = bookData.chapters.find(
    (ch) => ch.chapter === selectedChapter
  );
  if (!chapterData) {
    chapterData = { chapter: selectedChapter, verses: [] };
    bookData.chapters.push(chapterData);
  }

  // verses 업데이트 또는 추가
  const verseIndex = chapterData.verses.findIndex(
    (v) => v.verse === verseNumber
  );
  if (verseIndex === -1) {
    chapterData.verses.push({ verse: verseNumber, content: value });
  } else {
    chapterData.verses[verseIndex].content = value;
  }

  // 로컬스토리지에 저장
  localStorage.setItem(userId, JSON.stringify(savedData));
};
