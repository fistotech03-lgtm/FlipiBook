import React from 'react';
import MyFlipbookCreate, { myFlipbookCreateSections } from './MyFlipbookCreate';
import MyFlipbook3DModels, { myFlipbook3DModelsSections } from './MyFlipbook3DModels';
import MyFlipbookShelf, { myFlipbookShelfSections } from './MyFlipbookShelf';
import MyFlipbookGallery, { myFlipbookGallerySections } from './MyFlipbookGallery';
import MyFlipbookFavorites, { myFlipbookFavoritesSections } from './MyFlipbookFavorites';
import MyFlipbookTrash, { myFlipbookTrashSections } from './MyFlipbookTrash';
import MyFlipbookFolders, { myFlipbookFoldersSections } from './MyFlipbookFolders';

export const myFlipbookGuideSections = [
  ...myFlipbookCreateSections,
  ...myFlipbook3DModelsSections,
  ...myFlipbookShelfSections,
  ...myFlipbookGallerySections,
  ...myFlipbookFavoritesSections,
  ...myFlipbookTrashSections,
  ...myFlipbookFoldersSections
];

export default function MyFlipbookGuide({ selectedSubItem }) {
  if (myFlipbookCreateSections.some(s => s.items.some(i => i.id === selectedSubItem))) {
    return <MyFlipbookCreate selectedSubItem={selectedSubItem} />;
  }
  if (myFlipbook3DModelsSections.some(s => s.items.some(i => i.id === selectedSubItem))) {
    return <MyFlipbook3DModels selectedSubItem={selectedSubItem} />;
  }
  if (myFlipbookShelfSections.some(s => s.items.some(i => i.id === selectedSubItem))) {
    return <MyFlipbookShelf selectedSubItem={selectedSubItem} />;
  }
  if (myFlipbookGallerySections.some(s => s.items.some(i => i.id === selectedSubItem))) {
    return <MyFlipbookGallery selectedSubItem={selectedSubItem} />;
  }
  if (myFlipbookFavoritesSections.some(s => s.items.some(i => i.id === selectedSubItem))) {
    return <MyFlipbookFavorites selectedSubItem={selectedSubItem} />;
  }
  if (myFlipbookTrashSections.some(s => s.items.some(i => i.id === selectedSubItem))) {
    return <MyFlipbookTrash selectedSubItem={selectedSubItem} />;
  }
  if (myFlipbookFoldersSections.some(s => s.items.some(i => i.id === selectedSubItem))) {
    return <MyFlipbookFolders selectedSubItem={selectedSubItem} />;
  }
  return null;
}
