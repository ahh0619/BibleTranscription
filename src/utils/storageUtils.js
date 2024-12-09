import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../api/firebase/firebase"; // Firebase 초기화 코드 import

export const saveInputToFirebase = async (
  verseNumber,
  value,
  userId,
  selectedBook,
  selectedChapter,
  language,
  readingCount
) => {
  try {
    // Firestore 문서 참조
    const docRef = doc(db, userId, "bible");
    const docSnapshot = await getDoc(docRef);

    // Firestore 데이터 확인 및 초기화
    let savedData = {};
    if (docSnapshot.exists()) {
      savedData = docSnapshot.data();
    }

    // 기본 데이터 구조 설정
    if (!savedData.readings) {
      savedData.readings = [];
    }

    // readingCount 찾기
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

    // Firestore에 데이터 저장
    await setDoc(docRef, savedData);
  } catch (error) {
    console.error("Error saving to Firestore:", error);
  }
};
