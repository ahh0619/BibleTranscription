export const saveInputToLocalStorage = (
  verseNumber,
  value,
  userId,
  selectedBook,
  selectedChapter
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
      completedBooks: [],
    };
    userData.readings.push(currentReading);
  }

  let bookData = currentReading.completedBooks.find(
    (b) => b.book === selectedBook
  );
  if (!bookData) {
    bookData = { book: selectedBook, chapters: [] };
    currentReading.completedBooks.push(bookData);
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
