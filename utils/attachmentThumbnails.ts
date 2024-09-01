// @/constants/fileIcons.ts

import codeFile from '@/constants/attachmentThumnails/codeFile.png';
import txtFile from '@/constants/attachmentThumnails/txtFile.png';
import psdFile from '@/constants/attachmentThumnails/psdFile.png';
import xlsFile from '@/constants/attachmentThumnails/xlsFile.png';
import videoFile from '@/constants/attachmentThumnails/videoFile.png';
import imageFile from '@/constants/attachmentThumnails/imageFile.png';
import docFile from '@/constants/attachmentThumnails/docFile.png';
import pptFile from '@/constants/attachmentThumnails/pptFile.png';
import unknownDocFile from '@/constants/attachmentThumnails/unknownDocFile.png';
import unknownVideoFile from '@/constants/attachmentThumnails/unknownVideoFile.png';
import unknownMusicFile from '@/constants/attachmentThumnails/unknownMusicFile.png';
import unknownFile from '@/constants/attachmentThumnails/unknownFile.png';
import pdfFile from '@/constants/attachmentThumnails/pdfFile.png';

export const fileIconMap: Record<string, string> = {
  // Document files
  txt: txtFile.src,
  doc: docFile.src,
  docx: docFile.src,
  pdf: pdfFile.src,
  rtf: unknownDocFile.src,

  // Spreadsheet files
  xls: xlsFile.src,
  xlsx: xlsFile.src,
  csv: xlsFile.src,

  // Presentation files
  ppt: pptFile.src,
  pptx: pptFile.src,

  // Image files
  jpg: imageFile.src,
  jpeg: imageFile.src,
  png: imageFile.src,
  gif: imageFile.src,
  bmp: imageFile.src,
  svg: imageFile.src,
  psd: psdFile.src,

  // Video files
  mp4: videoFile.src,
  avi: videoFile.src,
  mov: videoFile.src,
  wmv: videoFile.src,
  mkv: videoFile.src,

  // Audio files
  mp3: unknownMusicFile.src,
  wav: unknownMusicFile.src,
  aac: unknownMusicFile.src,
  m4a: unknownMusicFile.src,

  // Code files
  js: codeFile.src,
  ts: codeFile.src,
  py: codeFile.src,
  java: codeFile.src,
  cpp: codeFile.src,
  html: codeFile.src,
  css: codeFile.src,
  json: codeFile.src,
  xml: codeFile.src,

  // Archive files
  zip: unknownFile.src,
  rar: unknownFile.src,
  '7z': unknownFile.src,
  tar: unknownFile.src,
  gz: unknownFile.src,
};

export function getFileIcon(filename: string): string {
  const extension = filename.split('.').pop()?.toLowerCase() || '';
  return fileIconMap[extension] || unknownFile.src;
}