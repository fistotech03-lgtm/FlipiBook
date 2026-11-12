import bookShelf1 from '../../../assets/Bookshelf/Book_shelf1.webp';
import listFrame from '../../../assets/Bookshelf/list_frame.svg';

import cover1 from '../../../assets/Explore/c-bg1.png';
import cover2 from '../../../assets/Explore/c-bg2.png';
import cover3 from '../../../assets/Explore/c-bg3.png';
import cover4 from '../../../assets/Explore/c-bg4.png';
import cover5 from '../../../assets/Explore/c-bg5.png';

import blueshade from '../../../assets/Bookshelf/blueshelf/blueshade.svg';
import bluesheet from '../../../assets/Bookshelf/blueshelf/bluesheet.webp';
import blueshelfwood from '../../../assets/Bookshelf/blueshelf/blueshelfwood.webp';
import bluedecor from '../../../assets/Bookshelf/blueshelf/bluedecor.webp';
import blueRopeShelfImg from '../../../assets/Bookshelf/blue_frame/blue-ropeshelf.png';
import blueFrameSheet from '../../../assets/Bookshelf/blue_frame/bluesheet.png';

import windowShelfImg from '../../../assets/Bookshelf/window_shelf/windowshelf.png';
import windowShelfSheet from '../../../assets/Bookshelf/window_shelf/bluesheet.png';
import orangeShelfImg from '../../../assets/Bookshelf/orange_shelf/orange_shelf.png';
import orangeSheet from '../../../assets/Bookshelf/orange_shelf/orangesheet.png';
import goldenShelfImg from '../../../assets/Bookshelf/golden_shelf/goldenshelf.png';
import goldenShelfSheet from '../../../assets/Bookshelf/golden_shelf/sheet.png';
import greenshade from '../../../assets/Bookshelf/greenshelf/greenshade.png';
import greensheet from '../../../assets/Bookshelf/greenshelf/Green_sheet.png';
import lightShelfImg from '../../../assets/Bookshelf/light_shelf/light-sheld.svg';
import lightShelfSheet from '../../../assets/Bookshelf/light_shelf/lightsheet.png';
import plantLightShelfImg from '../../../assets/Bookshelf/plant-light/plantlight-shelf.svg';
import plantLightShadowSheet from '../../../assets/Bookshelf/plant-light/shadowsheet.png';
import greenLightShelfImg from '../../../assets/Bookshelf/greenlight/greenlight.svg';
import greenLightSheet from '../../../assets/Bookshelf/greenlight/sheet.png';

// Wall Theme Assets
import walltheme1 from '../../../assets/Bookshelf/Wall_themes/walltheme_1.webp';
import walltheme2 from '../../../assets/Bookshelf/Wall_themes/walltheme_2.webp';
import walltheme3 from '../../../assets/Bookshelf/Wall_themes/walltheme_3.webp';
import walltheme4 from '../../../assets/Bookshelf/Wall_themes/walltheme_4.webp';
import walltheme5 from '../../../assets/Bookshelf/Wall_themes/walltheme_5.webp';
import walltheme6 from '../../../assets/Bookshelf/Wall_themes/walltheme_6.webp';
import walltheme7 from '../../../assets/Bookshelf/Wall_themes/walltheme_7.webp';
import walltheme8 from '../../../assets/Bookshelf/Wall_themes/walltheme_8.webp';

// Light Theme Assets
import lightTheme1 from '../../../assets/Bookshelf/Light_theme/Light_theme1.svg';
import lightTheme2 from '../../../assets/Bookshelf/Light_theme/Light_theme2.svg';
import lightTheme3 from '../../../assets/Bookshelf/Light_theme/Light_theme3.svg';

export const resolveUploadsPath = (path) => path || '';

export const wallThemeList = [
  { id: 'theme1', img: walltheme1 },
  { id: 'theme2', img: walltheme2 },
  { id: 'theme3', img: walltheme3 },
  { id: 'theme4', img: walltheme4 },
  { id: 'theme5', img: walltheme5 },
  { id: 'theme6', img: walltheme6 },
  { id: 'theme7', img: walltheme7 },
  { id: 'theme8', img: walltheme8 },
];

export const lightThemeList = [
  { id: 'light1', img: lightTheme1, glowColor: 'rgba(245, 158, 11, 0.28)' },
  { id: 'light2', img: lightTheme2, glowColor: 'rgba(255, 255, 255, 0.25)' },
  { id: 'light3', img: lightTheme3, glowColor: 'rgba(186, 230, 253, 0.40)' },
];

export const covers = [cover1, cover2, cover3, cover4, cover5];

export const shelfOptions = [
  { id: 'customize4', name: 'Blue Shelf', img: blueshade },
  { id: 'customize_green', name: 'Green Shelf', img: greenshade },
  { id: 'customize_greenlight', name: 'Green-Light Shelf', img: greenLightShelfImg },
  { id: 'customize_orange', name: 'Orange Shelf', img: orangeShelfImg },
  { id: 'customize_golden', name: 'Golden Shelf', img: goldenShelfImg },
];

export const allShelfStyles = [
  { id: 'customize4', img: blueshade, title: 'Pumps Shelf', bookCount: 8 },
  { id: 'customize_green', img: greenshade, title: 'Green Shelf', bookCount: 8 },
  { id: 'customize_light', img: lightShelfImg, title: 'Light Shelf', bookCount: 8 },
  { id: 'customize_plantlight', img: plantLightShelfImg, title: 'Plant-Light Shelf', bookCount: 8 },
  { id: 'customize_greenlight', img: greenLightShelfImg, title: 'Green-Light Shelf', bookCount: 8 },
  { id: 'customize_bluerope', img: blueRopeShelfImg, title: 'Blue Rope Shelf', bookCount: 4 },
  { id: 'customize_windowshelf', img: windowShelfImg, title: 'Window Shelf', bookCount: 2 },
  { id: 'customize_orange', img: orangeShelfImg, title: 'Orange Shelf', bookCount: 2 },
  { id: 'customize_golden', img: goldenShelfImg, title: 'Golden Shelf', bookCount: 4 },
];

export {
  bookShelf1,
  listFrame,
  blueshade,
  bluesheet,
  blueshelfwood,
  bluedecor,
  blueRopeShelfImg,
  blueFrameSheet,
  windowShelfImg,
  windowShelfSheet,
  orangeShelfImg,
  orangeSheet,
  goldenShelfImg,
  goldenShelfSheet,
  greenshade,
  greensheet,
  lightShelfImg,
  lightShelfSheet,
  plantLightShelfImg,
  plantLightShadowSheet,
  greenLightShelfImg,
  greenLightSheet,
};

