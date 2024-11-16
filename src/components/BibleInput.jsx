import { forwardRef, useContext } from "react";
import PropTypes from "prop-types";
import "./BibleInput.css";
import BibleContext from "../api/context/BibleContext";

const BibleInput = forwardRef(function BibleInput({ index, onEnter }, ref) {
  const { inputValues, handleInputChange, verses } = useContext(BibleContext);
  const value = inputValues[index] || "";
  const correctVerseText = verses[index]?.text || ""; // 현재 구절의 올바른 텍스트

  const handleChange = (e) => {
    handleInputChange(index, e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      if (value.trim() === correctVerseText.trim()) {
        onEnter();
      }
      e.preventDefault(); // 기본 Enter 동작 방지
    }
  };

  return (
    <div className="BibleInput">
      <input
        ref={ref}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyPress}
        spellCheck={false}
      />
    </div>
  );
});

BibleInput.propTypes = {
  index: PropTypes.number.isRequired,
  onEnter: PropTypes.func.isRequired,
};

export default BibleInput;
