import { doc, getDoc } from "firebase/firestore";
import { db } from "../api/firebase/firebase"; // Firebase 초기화 코드 import

export const loadSavedData = async (
  readingCount,
  language,
  userId,
  selectedBook,
  selectedChapter
) => {
  try {
    const docRef = doc(db, userId, "bible");
    const docSnapshot = await getDoc(docRef);

    if (!docSnapshot.exists()) {
      return [];
    }

    const savedData = docSnapshot.data();

    if (!savedData.readings) {
      return [];
    }

    const readingData = savedData.readings.find(
      (r) => r.readingCount === Number(readingCount)
    );

    if (!readingData) {
      return [];
    }

    const versionData = readingData.versions.find(
      (v) => v.version.toLowerCase() === language.toLowerCase()
    );

    if (!versionData) {
      return [];
    }

    const bookData = versionData.completedBooks.find(
      (b) => b.book === selectedBook
    );

    if (!bookData) {
      return [];
    }

    const chapterData = bookData.chapters.find(
      (ch) => ch.chapter === Number(selectedChapter)
    );

    return chapterData?.verses || [];
  } catch (error) {
    console.error("Error loading data from Firestore:", error);
    return [];
  }
};
