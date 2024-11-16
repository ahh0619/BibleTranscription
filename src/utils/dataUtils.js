export const loadSavedData = (
  selectedBook,
  selectedChapter,
  userId,
  selectedVersion,
  setInputValues
) => {
  if (!selectedBook || selectedChapter === null) return;

  const savedData = JSON.parse(localStorage.getItem(userId) || "{}");
  const userData = savedData[userId];
  if (!userData) return setInputValues({});

  const currentReading = userData.readings[userData.readings.length - 1];
  const versionData = currentReading?.completedVersions?.[selectedVersion];
  if (!versionData) return setInputValues({});

  const bookData = versionData.find((b) => b.book === selectedBook);
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
