export const fetchBooksData = async (setBooks) => {
  try {
    const response = await fetch("/data/books.json");
    const data = await response.json();
    setBooks(data);
  } catch (error) {
    console.error("Error loading books:", error);
  }
};

export const loadSavedData = (
  selectedBook,
  selectedChapter,
  userId,
  setInputValues
) => {
  if (!selectedBook || selectedChapter === null) return;

  const savedData = JSON.parse(localStorage.getItem(userId) || "{}");
  const userData = savedData[userId];
  if (!userData) return setInputValues({});

  const currentReading = userData.readings[userData.readings.length - 1];
  const bookData = currentReading?.completedBooks.find(
    (b) => b.book === selectedBook
  );
  if (!bookData) return setInputValues({});

  const chapterData = bookData.chapters.find(
    (ch) => ch.chapter === selectedChapter
  );
  if (chapterData) {
    const formattedValues = chapterData.verses.reduce((acc, verse) => {
      acc[verse.verse] = verse.content;
      return acc;
    }, {});
    setInputValues(formattedValues);
  } else {
    setInputValues({});
  }
};
