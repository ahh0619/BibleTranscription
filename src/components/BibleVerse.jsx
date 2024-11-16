import { useContext } from "react";
import BibleContext from "../api/context/BibleContext";
import "./BibleVerse.css";

const BibleVerse = ({ index }) => {
  const { verses, inputValues } = useContext(BibleContext);
  const verse = verses[index];
  const inputText = inputValues[index] || "";

  const displayText = (
    <>
      <span> {verse.verse} </span>
      {Array.from(verse.text).map((char, idx) => {
        const isMatching = inputText[idx] === char;
        const color =
          idx < inputText.length
            ? isMatching
              ? "#4a90e2"
              : "#e74c3c"
            : "#4f4a4a";
        return (
          <span key={idx} style={{ color }}>
            {char}
          </span>
        );
      })}
    </>
  );

  return <div className="BibleVerse">{displayText}</div>;
};

export default BibleVerse;
