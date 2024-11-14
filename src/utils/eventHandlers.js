import Swal from "sweetalert2";

export const disableRightClick = (event) => {
  event.preventDefault();
  Swal.fire({
    title: "알림",
    text: "마우스 우클릭은 금지되어 있습니다.",
    icon: "warning",
    confirmButtonText: "확인",
    confirmButtonColor: "#6c757d",
  });
};

export const disableCopyPaste = (event) => {
  if (
    (event.ctrlKey && event.key === "c") ||
    (event.ctrlKey && event.key === "v")
  ) {
    event.preventDefault();
    Swal.fire({
      title: "알림",
      text: "복사 및 붙여넣기가 제한되어 있습니다.",
      icon: "warning",
      confirmButtonText: "확인",
      confirmButtonColor: "#6c757d",
    });
  }
};
