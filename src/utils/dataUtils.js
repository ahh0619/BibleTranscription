export const loadSavedData = (
  readingCount,
  language,
  selectedBook,
  selectedChapter
) => {
  const savedData = JSON.parse(localStorage.getItem("data") || "{}");

  // userId 및 readings 확인
  if (!savedData.userId || !savedData.readings) {
    return [];
  }

  // readingCount 찾기
  const readingData = savedData.readings.find(
    (r) => r.readingCount === readingCount
  );
  if (!readingData) {
    return [];
  }

  // versions에서 해당 버전 찾기
  const versionData = readingData.versions.find((v) => v.version === language);
  if (!versionData) {
    return [];
  }

  // completedBooks에서 해당 책 찾기
  const bookData = versionData.completedBooks.find(
    (b) => b.book === selectedBook
  );
  if (!bookData) {
    return [];
  }

  // chapters에서 해당 장 찾기
  const chapterData = bookData.chapters.find(
    (ch) => ch.chapter === selectedChapter
  );

  return chapterData?.verses || [];
};
