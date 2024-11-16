import { forwardRef, useContext } from "react";
import PropTypes from "prop-types";
import "./BibleInput.css";
import BibleContext from "../api/context/BibleContext";

const BibleInput = forwardRef(function BibleInput({ index, onEnter }, ref) {
  const { inputValues, handleInputChange } = useContext(BibleContext);
  const value = inputValues[index] || "";

  const handleChange = (e) => {
    handleInputChange(index, e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      onEnter();
      e.preventDefault();
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
