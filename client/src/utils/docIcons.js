import { FileText, FileSpreadsheet, Image as ImageIcon, File as FileIcon } from "lucide-react";

export function IconForDoc(type) {
  const map = { pdf: FileText, docx: FileText, pptx: FileSpreadsheet, fig: ImageIcon, xlsx: FileSpreadsheet };
  return map[type] || FileIcon;
}
export function colorForDoc(type) {
  const map = { pdf: "#6B3FA0", docx: "#7B5EA7", pptx: "#9B6FD1", fig: "#4B2E6B", xlsx: "#8A6BAE" };
  return map[type] || "#6B5773";
}