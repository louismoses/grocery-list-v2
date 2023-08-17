function toggleStrike(checkbox) {
  const todoItem = checkbox.nextElementSibling;
  if (checkbox.checked) {
    todoItem.classList.add("line-through");
  } else {
    todoItem.classList.remove("line-through");
  }
}
