export const saveInputToLocalStorage = (
  verseNumber,
  value,
  userId,
  selectedBook,
  selectedChapter,
  selectedVersion
) => {
  const savedData = JSON.parse(localStorage.getItem(userId) || "{}");

  if (!savedData[userId]) {
    savedData[userId] = { userId, readings: [] };
  }

  const userData = savedData[userId];
  let currentReading = userData.readings[userData.readings.length - 1];

  if (!currentReading) {
    currentReading = {
      readingCount: userData.readings.length + 1,
      completedVersions: {},
    };
    userData.readings.push(currentReading);
  }

  if (!currentReading.completedVersions[selectedVersion]) {
    currentReading.completedVersions[selectedVersion] = [];
  }

  let versionData = currentReading.completedVersions[selectedVersion];

  let bookData = versionData.find((b) => b.book === selectedBook);
  if (!bookData) {
    bookData = { book: selectedBook, chapters: [] };
    versionData.push(bookData);
  }

  let chapterData = bookData.chapters.find(
    (ch) => ch.chapter === selectedChapter
  );
  if (!chapterData) {
    chapterData = { chapter: selectedChapter, verses: [] };
    bookData.chapters.push(chapterData);
  }

  const verseIndex = chapterData.verses.findIndex(
    (v) => v.verse === verseNumber
  );
  if (verseIndex === -1) {
    chapterData.verses.push({ verse: verseNumber, content: value });
  } else {
    chapterData.verses[verseIndex].content = value;
  }

  localStorage.setItem(userId, JSON.stringify(savedData));
};
