import React, { useState } from 'react';
import { Play } from 'lucide-react';
import CustomScrollbar from '../../components/CustomScrollbar';

export const guideItemDescriptions = {
  "3d-cam-views": {
    "title": "Front, Top, Right & Perspective Views",
    "description": "Switch seamlessly between top, front, side, and free perspective camera angles."
  },
  "3d-cam-projection": {
    "title": "Perspective vs. Orthographic",
    "description": "Toggle between natural perspective and architectural orthographic projections."
  },
  "3d-cam-reset": {
    "title": "Reset Camera & Center View",
    "description": "Instantly restore the camera orientation and center the 3D scene to default framing."
  },
  "3d-bg-transparent": {
    "title": "Transparent Background",
    "description": "Render 3D scenes with transparent backgrounds for seamless embedding on book pages."
  },
  "3d-bg-color-image": {
    "title": "Solid Color & Custom Image",
    "description": "Apply solid background colors or custom environment background images to your 3D viewport."
  },
  "3d-framing-aspect": {
    "title": "Aspect Ratio & Frame Presets",
    "description": "Choose standardized viewport aspect ratios and framing constraints for your flipbook."
  },
  "3d-framing-snapshot": {
    "title": "Capture High-Res Snapshot",
    "description": "Capture high-definition snapshots of your framed 3D models with one click."
  },
  "3d-viewport-shading": {
    "title": "Wireframe vs. Solid Shading",
    "description": "Toggle viewport display between wireframe, unlit, and full physically-based shading."
  },
  "3d-viewport-history": {
    "title": "Undo & Redo (Ctrl+Z / Ctrl+Y)",
    "description": "Step through 3D editor actions with complete undo and redo support."
  },
  "3d-gizmo-select": {
    "title": "Select Mode",
    "description": "Select mesh elements and groups within your 3D canvas effortlessly."
  },
  "3d-gizmo-move": {
    "title": "Move Gizmo (W)",
    "description": "Use the 3D translation gizmo to move objects precisely along X, Y, and Z axes."
  },
  "3d-gizmo-rotate": {
    "title": "Rotate Gizmo (R)",
    "description": "Rotate objects freely or with incremental snapping using the rotation gizmo."
  },
  "3d-gizmo-scale": {
    "title": "Scale Gizmo (S)",
    "description": "Scale 3D components uniformly or along individual axes."
  },
  "3d-nav-orbit": {
    "title": "Orbit Navigation",
    "description": "Click and drag to orbit smoothly around models in three-dimensional space."
  },
  "3d-nav-pan": {
    "title": "Hand / Pan Tool (H)",
    "description": "Pan the viewport across 2D screen space to inspect wide 3D compositions."
  },
  "3d-nav-zoom": {
    "title": "Zoom In, Out & Full View",
    "description": "Zoom smoothly into intricate model details or zoom out to full overview."
  },
  "3d-export-glb-gltf": {
    "title": "Export as GLB / GLTF",
    "description": "Export optimized GLB or GLTF packages compatible across web and mobile platforms."
  },
  "3d-export-usdz": {
    "title": "Export as USDZ (Apple AR)",
    "description": "Generate Apple USDZ files for augmented reality viewing on iOS devices."
  },
  "3d-save-asset-library": {
    "title": "Save to Flipbook 3D Library",
    "description": "Save finalized 3D models into your personal FlipiBook asset library."
  },
  "3d-hotspots-add": {
    "title": "Add 3D Pin onto Model Surface",
    "description": "Learn how to use and customize Add 3D Pin onto Model Surface to enhance your digital flipbook publications."
  },
  "3d-hotspots-edit": {
    "title": "Titles, Descriptions & Links",
    "description": "Configure hotspot titles, descriptions, hyperlinks, and interactive callouts."
  },
  "3d-hotspots-manage": {
    "title": "Position Reprojection & Delete",
    "description": "Reposition, re-anchor, and manage interactive pins on 3D meshes."
  },
  "3d-animation-playback": {
    "title": "Embedded Model Animation Playback",
    "description": "Play and preview skeletal animations and dynamic sequences embedded in models."
  },
  "3d-animation-controls": {
    "title": "Play, Pause & Track Inspection",
    "description": "Inspect animation tracks, loop cycles, and adjust animation playback speed."
  },
  "3d-env-hdr-presets": {
    "title": "Studio HDR Environment Presets",
    "description": "Choose from photo-realistic studio, outdoor, and indoor HDR lighting environments."
  },
  "3d-env-custom-upload": {
    "title": "Custom HDR / EXR Upload",
    "description": "Upload custom HDR and EXR environment maps for tailored scene illumination."
  },
  "3d-env-exposure-blur": {
    "title": "Exposure, Intensity & Background Blur",
    "description": "Fine-tune environment lighting exposure, intensity, and background depth blur."
  },
  "3d-lights-studio-setup": {
    "title": "Multi-Light Studio Setup",
    "description": "Configure professional three-point and studio lighting configurations."
  },
  "3d-lights-compass": {
    "title": "Light Direction Compass (N, S, E, W)",
    "description": "Rotate directional light angles easily using an intuitive directional compass."
  },
  "3d-lights-shadows": {
    "title": "Cast Shadows & Softness",
    "description": "Control shadow softness, penumbra blur, and contact shadow intensity."
  },
  "3d-floor-presets": {
    "title": "Floor Presets & Shadow Catchers",
    "description": "Add realistic floor planes and shadow catcher surfaces beneath your models."
  },
  "3d-floor-reflections": {
    "title": "Floor Reflections & Opacity",
    "description": "Adjust floor reflection glossiness, roughness, and mirror opacity."
  },
  "3d-material-select": {
    "title": "Select Mesh Part Material",
    "description": "Select individual mesh materials and assign distinct physical properties."
  },
  "3d-material-color": {
    "title": "Color Picker & Presets",
    "description": "Choose surface base colors and tint palettes using an integrated color picker."
  },
  "3d-material-surface": {
    "title": "Roughness, Metalness & Sheen",
    "description": "Configure realistic roughness, metallic reflections, and sheen characteristics."
  },
  "3d-material-opacity": {
    "title": "Transparency & Transmission",
    "description": "Adjust material transparency, alpha clipping, and physical transmission."
  },
  "3d-texture-upload": {
    "title": "Texture Map Upload",
    "description": "Upload high-resolution color, normal, roughness, and displacement texture maps."
  },
  "3d-texture-tiling": {
    "title": "Texture Tiling & UV Offset",
    "description": "Adjust UV texture repeat counts, offset positions, and rotation angles."
  },
  "3d-texture-unwrap": {
    "title": "UV Unwrapping",
    "description": "Inspect UV mapping layout and coordinate projections across model surfaces."
  },
  "3d-model-tree": {
    "title": "Model Tree & Mesh Outliner",
    "description": "Learn how to use and customize Model Tree & Mesh Outliner to enhance your digital flipbook publications."
  },
  "3d-model-parts": {
    "title": "Rename, Add & Delete Models",
    "description": "Learn how to use and customize Rename, Add & Delete Models to enhance your digital flipbook publications."
  },
  "3d-model-xray": {
    "title": "X-Ray & Part Visibility",
    "description": "Learn how to use and customize X-Ray & Part Visibility to enhance your digital flipbook publications."
  },
  "3d-transform-position": {
    "title": "Position (X, Y, Z Coordinates)",
    "description": "Learn how to use and customize Position (X, Y, Z Coordinates) to enhance your digital flipbook publications."
  },
  "3d-transform-rotation": {
    "title": "Rotation (Pitch, Yaw, Roll)",
    "description": "Learn how to use and customize Rotation (Pitch, Yaw, Roll) to enhance your digital flipbook publications."
  },
  "3d-transform-scale": {
    "title": "Uniform & Axis Scale",
    "description": "Learn how to use and customize Uniform & Axis Scale to enhance your digital flipbook publications."
  },
  "3d-transform-reset": {
    "title": "Reset Transform to Default",
    "description": "Learn how to use and customize Reset Transform to Default to enhance your digital flipbook publications."
  },
  "3d-view-autorotate": {
    "title": "Auto-Rotation (Speed & Axis)",
    "description": "Enable automated turntable rotation with customizable speed and axis options."
  },
  "3d-view-grid-axis": {
    "title": "Grid Lines & Coordinate Axes",
    "description": "Toggle floor grids, coordinate axes, and alignment guides in the 3D viewport."
  },
  "converter-3dmodel-overview": {
    "title": "3DModel Overview",
    "description": "Learn how to use and customize 3DModel Overview to enhance your digital flipbook publications."
  },
  "converter-3dmodel-formats": {
    "title": "Format Conversion (GLB, OBJ, FBX, USDZ)",
    "description": "Learn how to use and customize Format Conversion (GLB, OBJ, FBX, USDZ) to enhance your digital flipbook publications."
  },
  "converter-3dmodel-compression": {
    "title": "Compression & Optimization",
    "description": "Learn how to use and customize Compression & Optimization to enhance your digital flipbook publications."
  },
  "converter-3dmodel-preview": {
    "title": "3D Orbit Preview & Stats",
    "description": "Learn how to use and customize 3D Orbit Preview & Stats to enhance your digital flipbook publications."
  },
  "converter-image-overview": {
    "title": "Image Overview",
    "description": "Learn how to use and customize Image Overview to enhance your digital flipbook publications."
  },
  "converter-image-formats": {
    "title": "Format Selection (WEBP, PNG, JPG)",
    "description": "Learn how to use and customize Format Selection (WEBP, PNG, JPG) to enhance your digital flipbook publications."
  },
  "converter-image-compression": {
    "title": "Compression Levels",
    "description": "Learn how to use and customize Compression Levels to enhance your digital flipbook publications."
  },
  "converter-image-bg-removal": {
    "title": "AI Background Removal & Compare",
    "description": "Learn how to use and customize AI Background Removal & Compare to enhance your digital flipbook publications."
  },
  "converter-video-overview": {
    "title": "Video Overview",
    "description": "Learn how to use and customize Video Overview to enhance your digital flipbook publications."
  },
  "converter-video-formats": {
    "title": "Target Video Formats (MP4, WEBM)",
    "description": "Learn how to use and customize Target Video Formats (MP4, WEBM) to enhance your digital flipbook publications."
  },
  "converter-video-compression": {
    "title": "Resolution & Compression",
    "description": "Learn how to use and customize Resolution & Compression to enhance your digital flipbook publications."
  },
  "converter-video-preview": {
    "title": "Playback Preview & Download",
    "description": "Learn how to use and customize Playback Preview & Download to enhance your digital flipbook publications."
  },
  "explore-overview": {
    "title": "Explore Overview",
    "description": "Learn how to use and customize Explore Overview to enhance your digital flipbook publications."
  },
  "feature-overview": {
    "title": "Feature Overview",
    "description": "Learn how to use and customize Feature Overview to enhance your digital flipbook publications."
  },
  "forum-overview": {
    "title": "Forum Overview",
    "description": "Learn how to use and customize Forum Overview to enhance your digital flipbook publications."
  },
  "help-overview": {
    "title": "Help Overview",
    "description": "Learn how to use and customize Help Overview to enhance your digital flipbook publications."
  },
  "home-overview": {
    "title": "Create Flipbook",
    "description": "Create your own digital flipbook using IDC Product. You can upload an existing PDF to convert it into a flipbook or create a new book from scratch using custom page sizes, templates and design tools."
  },
  "pricing-overview": {
    "title": "Pricing Overview",
    "description": "Learn how to use and customize Pricing Overview to enhance your digital flipbook publications."
  },
  "analytics-overview": {
    "title": "Analytics Overview",
    "description": "Review reader statistics, visit durations, page impressions, and bounce rates."
  },
  "background": {
    "title": "Background",
    "description": "Learn how to use and customize Background to enhance your digital flipbook publications."
  },
  "themes": {
    "title": "Themes",
    "description": "Learn how to use and customize Themes to enhance your digital flipbook publications."
  },
  "animation": {
    "title": "Animation",
    "description": "Learn how to use and customize Animation to enhance your digital flipbook publications."
  },
  "book-appearance-overview": {
    "title": "Book Appearance Overview",
    "description": "Customize cover thickness, hardback binding, page curl physics, and page shadows."
  },
  "branding-overview": {
    "title": "Branding Overview",
    "description": "Add your organization logo, custom watermarks, and white-label viewer styling."
  },
  "layout-design": {
    "title": "Layout Design",
    "description": "Learn how to use and customize Layout Design to enhance your digital flipbook publications."
  },
  "layout-color-customization": {
    "title": "Layout Color Customization",
    "description": "Learn how to use and customize Layout Color Customization to enhance your digital flipbook publications."
  },
  "lead-form-overview": {
    "title": "Lead Form Overview",
    "description": "Collect reader leads, email signups, and customer feedback before granting viewing access."
  },
  "navigation": {
    "title": "Navigation",
    "description": "Learn how to use and customize Navigation to enhance your digital flipbook publications."
  },
  "viewing": {
    "title": "Viewing",
    "description": "Learn how to use and customize Viewing to enhance your digital flipbook publications."
  },
  "interaction-tools": {
    "title": "Interaction Tools",
    "description": "Learn how to use and customize Interaction Tools to enhance your digital flipbook publications."
  },
  "audio-controls": {
    "title": "Audio Controls",
    "description": "Learn how to use and customize Audio Controls to enhance your digital flipbook publications."
  },
  "share-export": {
    "title": "Share & Export",
    "description": "Learn how to use and customize Share & Export to enhance your digital flipbook publications."
  },
  "branding-profile": {
    "title": "Branding & Profile",
    "description": "Learn how to use and customize Branding & Profile to enhance your digital flipbook publications."
  },
  "public": {
    "title": "Public",
    "description": "Learn how to use and customize Public to enhance your digital flipbook publications."
  },
  "private": {
    "title": "Private",
    "description": "Learn how to use and customize Private to enhance your digital flipbook publications."
  },
  "password-protect": {
    "title": "Password Protect",
    "description": "Secure confidential catalogues and private documents with encrypted passwords."
  },
  "invite-only-access": {
    "title": "Invite Only Access",
    "description": "Grant publication viewing permissions exclusively to specific authorized email recipients."
  },
  "import-3d-model": {
    "title": "Import 3D Model",
    "description": "Learn how to use and customize Import 3D Model to enhance your digital flipbook publications."
  },
  "3d-studio-editor": {
    "title": "3D Studio Editor",
    "description": "Learn how to use and customize 3D Studio Editor to enhance your digital flipbook publications."
  },
  "sample-3d-models": {
    "title": "Sample 3D Models",
    "description": "Learn how to use and customize Sample 3D Models to enhance your digital flipbook publications."
  },
  "create-flipbook": {
    "title": "Create Flipbook",
    "description": "Create your own digital flipbook using IDC Product. You can upload an existing PDF to convert it into a flipbook or create a new book from scratch using custom page sizes, templates and design tools."
  },
  "start-from-scratch": {
    "title": "Start from Scratch",
    "description": "Learn how to use and customize Start from Scratch to enhance your digital flipbook publications."
  },
  "use-a-template": {
    "title": "Use a Template",
    "description": "Learn how to use and customize Use a Template to enhance your digital flipbook publications."
  },
  "favorites-overview": {
    "title": "Favorites Overview",
    "description": "Learn how to use and customize Favorites Overview to enhance your digital flipbook publications."
  },
  "your-folders-overview": {
    "title": "Your Folders Overview",
    "description": "Learn how to use and customize Your Folders Overview to enhance your digital flipbook publications."
  },
  "gallery-overview": {
    "title": "Gallery Overview",
    "description": "Learn how to use and customize Gallery Overview to enhance your digital flipbook publications."
  },
  "my-shelf-overview": {
    "title": "My Shelf Overview",
    "description": "Learn how to use and customize My Shelf Overview to enhance your digital flipbook publications."
  },
  "trash-overview": {
    "title": "Trash Overview",
    "description": "Learn how to use and customize Trash Overview to enhance your digital flipbook publications."
  },
  "anim-object-animation": {
    "title": "Object Animations",
    "description": "Animate elements as pages turn using entrance slides, scale zooms, and fade reveals."
  },
  "anim-text-effects": {
    "title": "Cascading Text Effects",
    "description": "Add dynamic typewriter, word wave, and cascading letter text animations."
  },
  "anim-triggers-timing": {
    "title": "Triggers, Timing & Easing",
    "description": "Configure animation trigger points, durations, delays, and easing curves."
  },
  "toolbar-history": {
    "title": "Undo & Redo History",
    "description": "Easily undo and redo design modifications with comprehensive history state tracking."
  },
  "toolbar-alignment": {
    "title": "Object Alignment & Distribution",
    "description": "Align and distribute elements evenly across pages with precision layout controls."
  },
  "toolbar-mask-flatten": {
    "title": "Masking & Flattening",
    "description": "Clip images inside custom mask shapes and flatten complex layers."
  },
  "toolbar-zoom-view": {
    "title": "Zoom & Viewport Navigation",
    "description": "Zoom in for pixel-perfect adjustments and navigate comfortably across spreads."
  },
  "toolbar-rulers-guides": {
    "title": "Rulers, Guides & Snapping",
    "description": "Toggle magnetic alignment rulers, grid overlays, and smart guide snapping."
  },
  "element-typography": {
    "title": "Typography & Titles",
    "description": "Add stylized titles, headlines, quotes, and multi-column paragraphs."
  },
  "element-buttons": {
    "title": "Interactive Buttons",
    "description": "Design custom call-to-action buttons with click hover states and linked actions."
  },
  "element-shapes": {
    "title": "Decorative Shapes",
    "description": "Insert geometric vectors, decorative lines, badges, and background dividers."
  },
  "element-image-framing": {
    "title": "Image Framing & Masks",
    "description": "Frame photography within geometric shapes, device mockups, and circular masks."
  },
  "element-embeds": {
    "title": "Web & Video Embeds",
    "description": "Embed interactive web widgets, YouTube videos, and streaming media directly on pages."
  },
  "element-qrcode": {
    "title": "Dynamic QR Codes",
    "description": "Generate dynamic vector QR codes that link readers directly to external landing pages."
  },
  "element-maps": {
    "title": "Interactive Maps",
    "description": "Embed interactive maps with customized location pins and zoom levels."
  },
  "element-tables": {
    "title": "Dynamic Tables",
    "description": "Insert structured data tables, price charts, and specifications easily."
  },
  "element-audio": {
    "title": "Audio Elements",
    "description": "Embed interactive audio players, music tracks, and voiceover clips on pages."
  },
  "element-slideshow": {
    "title": "Slideshow & Sliders",
    "description": "Add interactive image carousels and swipeable photo galleries inside pages."
  },
  "asset-templates": {
    "title": "Page Layout Templates",
    "description": "Browse and insert pre-built page layouts, spreads, and designer templates."
  },
  "asset-styles": {
    "title": "Global Color & Text Styles",
    "description": "Apply cohesive typography hierarchies and color swatches across your entire publication."
  },
  "asset-icons": {
    "title": "Icon Library & Search",
    "description": "Search thousands of vector icons to illustrate features, buttons, and callouts."
  },
  "interaction-select-tool": {
    "title": "Select Tool",
    "description": "Select, resize, rotate, and reposition elements on the page canvas."
  },
  "interaction-frame-tool": {
    "title": "Frame Tool",
    "description": "Create responsive framing containers for responsive image and text layouts."
  },
  "interaction-hotspot-tool": {
    "title": "Hotspot Tool",
    "description": "Place pulsing hotspot beacons that trigger popups and interactive modals."
  },
  "action-open-link": {
    "title": "Open Link",
    "description": "Direct readers to external websites, web stores, and client portfolios."
  },
  "action-whatsapp": {
    "title": "WhatsApp",
    "description": "Launch direct WhatsApp chat conversations with your sales team on click."
  },
  "action-email": {
    "title": "Email",
    "description": "Open reader mail clients pre-filled with inquiry subject lines and messages."
  },
  "action-call": {
    "title": "Call",
    "description": "Trigger phone call dialers for instantaneous mobile customer support."
  },
  "action-navigate-to": {
    "title": "Navigate to Page",
    "description": "Navigate readers directly to specific chapter pages, sections, or indices."
  },
  "action-3d-viewer": {
    "title": "3D Viewer",
    "description": "Launch an interactive full-screen 3D model inspection overlay upon click."
  },
  "action-popup": {
    "title": "Popup Modal",
    "description": "Learn how to use and customize Popup Modal to enhance your digital flipbook publications."
  },
  "action-slideshow": {
    "title": "Slideshow",
    "description": "Open a modal photo gallery or lightbox slideshow upon clicking an element."
  },
  "action-zoom": {
    "title": "Zoom",
    "description": "Allow readers to zoom into high-resolution technical diagrams and blueprints."
  },
  "action-download": {
    "title": "Download File",
    "description": "Provide downloadable PDF attachments, brochures, and supplementary resources."
  },
  "action-audio": {
    "title": "Audio Playback",
    "description": "Learn how to use and customize Audio Playback to enhance your digital flipbook publications."
  },
  "action-info-box": {
    "title": "Info Box",
    "description": "Display rich informational popups with product details and specifications."
  },
  "manage-pages": {
    "title": "Page Management (Add, Reorder, Delete)",
    "description": "Learn how to use and customize Page Management (Add, Reorder, Delete) to enhance your digital flipbook publications."
  },
  "page-background": {
    "title": "Page Background Styling",
    "description": "Learn how to use and customize Page Background Styling to enhance your digital flipbook publications."
  },
  "manage-layers": {
    "title": "Layer Hierarchy & Stacking",
    "description": "Learn how to use and customize Layer Hierarchy & Stacking to enhance your digital flipbook publications."
  },
  "layer-groups-locks": {
    "title": "Grouping, Locking & Visibility",
    "description": "Learn how to use and customize Grouping, Locking & Visibility to enhance your digital flipbook publications."
  },
  "prop-transform": {
    "title": "Transform (Position & Dimensions)",
    "description": "Set accurate X and Y positions, dimensions, rotation angles, and layer depth."
  },
  "prop-colors-stroke": {
    "title": "Colors, Gradients & Strokes",
    "description": "Customize fill colors, border strokes, dash patterns, and gradient stops."
  },
  "prop-corner-effects": {
    "title": "Corner Radius, Shadows & Effects",
    "description": "Apply rounded corner radii, drop shadows, inner glows, and visual filters."
  },
  "prop-3d-model": {
    "title": "3D Model Configuration & AR",
    "description": "Configure 3D model properties, orbit parameters, and mobile AR compatibility."
  },
  "tool-upload-local": {
    "title": "Upload Files via Local Directory",
    "description": "Learn how to use and customize Upload Files via Local Directory to enhance your digital flipbook publications."
  },
  "tool-upload-gallery": {
    "title": "Browse by Gallery",
    "description": "Learn how to use and customize Browse by Gallery to enhance your digital flipbook publications."
  },
  "tool-upload-url": {
    "title": "Import via URL",
    "description": "Learn how to use and customize Import via URL to enhance your digital flipbook publications."
  },
  "tool-select-standard": {
    "title": "Select Tool",
    "description": "Learn how to use and customize Select Tool to enhance your digital flipbook publications."
  },
  "tool-select-direct": {
    "title": "Direct Select Tool",
    "description": "Learn how to use and customize Direct Select Tool to enhance your digital flipbook publications."
  },
  "tool-pen": {
    "title": "Pen Tool",
    "description": "Learn how to use and customize Pen Tool to enhance your digital flipbook publications."
  },
  "tool-pencil": {
    "title": "Pencil Tool",
    "description": "Draw freehand vector sketches, signatures, and annotations directly on the page."
  },
  "tool-text-add": {
    "title": "Add Text & Headings",
    "description": "Place new text frames and heading boxes anywhere on the publication canvas."
  },
  "tool-text-formatting": {
    "title": "Formatting, Fonts & Alignment",
    "description": "Adjust font families, weights, font sizes, text alignments, and line heights."
  },
  "tool-text-styling": {
    "title": "Colors, Spacing & Background",
    "description": "Style text with custom colors, highlighted backgrounds, and drop shadows."
  },
  "tool-shape-rectangle": {
    "title": "Rectangle",
    "description": "Draw custom rectangles, bordered cards, and rectangular image containers."
  },
  "tool-shape-circle": {
    "title": "Circle",
    "description": "Insert circles, elliptical badges, and round photo framing elements."
  },
  "tool-shape-polygon": {
    "title": "Polygon",
    "description": "Add multi-sided polygons, hexagons, and custom geometric shapes."
  },
  "tool-shape-line": {
    "title": "Line",
    "description": "Draw decorative divider lines, arrows, and structural page rules."
  },
  "tool-shape-star": {
    "title": "Star",
    "description": "Insert decorative stars, promotional burst badges, and review rating icons."
  },
  "settings-account-overview": {
    "title": "Account Overview",
    "description": "Learn how to use and customize Account Overview to enhance your digital flipbook publications."
  },
  "settings-account-password": {
    "title": "Password & Security",
    "description": "Learn how to use and customize Password & Security to enhance your digital flipbook publications."
  },
  "settings-account-sessions": {
    "title": "Active Sessions",
    "description": "Learn how to use and customize Active Sessions to enhance your digital flipbook publications."
  },
  "settings-notifications-overview": {
    "title": "Notifications Overview",
    "description": "Manage your personal notification preferences and system alert settings."
  },
  "settings-notifications-preferences": {
    "title": "Email & Push Preferences",
    "description": "Choose how and when you receive email digests and browser push alerts."
  },
  "settings-billing-invoice": {
    "title": "Billing & Invoice",
    "description": "Learn how to use and customize Billing & Invoice to enhance your digital flipbook publications."
  },
  "settings-support": {
    "title": "Support",
    "description": "Reach out to FlipiBook customer support, read FAQ guides, and report issues."
  }
};

const DEFAULT_VIDEO_ID = 'EQ_dfVNY40U';

export default function GuideVideoTemplate({ selectedSubItem }) {
  const [isPlaying, setIsPlaying] = useState(false);

  const meta = guideItemDescriptions[selectedSubItem] || {
    title: 'Flipbook Guide',
    description: 'Create and customize interactive digital publications using IDC Product features and tools.'
  };

  return (
    <CustomScrollbar
      color="#d1d5db"
      hoverColor="#9ca3af"
      width="0.25vw"
      className="w-full h-full"
    >
      <div className="w-full min-h-full flex flex-col pt-[1.5vh] pb-[2.5vh]">
        {/* Title & Description Section */}
        <div className="pb-[2vh] mb-[3vh] px-[1.5vw] border-b border-gray-200">
          <h1 className="text-[1.3vw] font-semibold text-gray-900 tracking-tight leading-snug">
            {meta.title}
          </h1>
          <p className="text-[0.9vw] font-semibold text-gray-400 mt-[0.6vh]">
            {meta.description}
          </p>
        </div>

        {/* Video Container Centered */}
        <div className="w-full flex-1 px-[1.5vw] pb-[2vh] flex items-center justify-center">
          <div className="w-full max-w-[65vw] aspect-video rounded-[1.5vw] overflow-hidden shadow-xl border border-gray-100 bg-black relative group flex items-center justify-center">
            {!isPlaying ? (
              <div
                onClick={() => setIsPlaying(true)}
                className="w-full h-full relative cursor-pointer flex items-center justify-center select-none"
              >
                {/* YouTube Thumbnail Image */}
                <img
                  src={'https://img.youtube.com/vi/' + DEFAULT_VIDEO_ID + '/maxresdefault.jpg'}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://img.youtube.com/vi/' + DEFAULT_VIDEO_ID + '/hqdefault.jpg';
                  }}
                  alt="Video Thumbnail"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.01]"
                />

                {/* Dark overlay for contrast */}
                <div className="absolute inset-0 bg-black/25 group-hover:bg-black/35 transition-colors duration-200" />

                {/* YouTube style Red Play Button */}
                <div className="absolute z-10 w-[4.6vw] min-w-[3.8rem] h-[3.2vw] min-h-[2.6rem] bg-[#FF0000] hover:bg-[#cc0000] rounded-[0.8vw] flex items-center justify-center shadow-2xl transition-all duration-200 transform group-hover:scale-110 active:scale-95">
                  <Play className="w-[1.6vw] h-[1.6vw] text-white fill-white ml-[0.15vw]" />
                </div>
              </div>
            ) : (
              <iframe
                src={'https://www.youtube.com/embed/' + DEFAULT_VIDEO_ID + '?autoplay=1&rel=0&modestbranding=1'}
                title={meta.title + ' Tutorial'}
                className="w-full h-full rounded-[1.2vw] border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            )}
          </div>
        </div>
      </div>
    </CustomScrollbar>
  );
}
