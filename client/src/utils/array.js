// Re-insert an item at its original index — used to restore something a
// user just deleted when they click "Undo" on the toast.
export function insertAt(arr, index, item) {
  const copy = arr.slice();
  const at = Math.max(0, Math.min(index, copy.length));
  copy.splice(at, 0, item);
  return copy;
}