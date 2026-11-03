import CustomizedEditor from './CustomizedEditor';
import Sidebar from './sidebar/Sidebar';
import SidebarItem from './sidebar/SidebarItem';

// The 8 sidebar panels (1:1 with sidebar navigation)
import {
  BackgroundPanel,
  LayoutDesignPanel,
  LayoutSettingsPanel,
  BookAppearancePanel,
  LeadFormPanel,
  VisibilityPrivacyPanel,
  AnalyticsPanel,
  BrandingPanel,
} from './panels';

// Supporting components
import OtherSetup from './components/OtherSetup';

export {
  CustomizedEditor,
  Sidebar,
  SidebarItem,
  // The 8 sidebar panels
  BackgroundPanel,
  LayoutDesignPanel,
  LayoutSettingsPanel,
  BookAppearancePanel,
  LeadFormPanel,
  VisibilityPrivacyPanel,
  AnalyticsPanel,
  BrandingPanel,
  // Supporting components
  OtherSetup,
  OtherSetup as AdvancedSettings,
  // Backward compatibility aliases
  BrandingPanel as Branding,
  LayoutSettingsPanel as MenuBar,
  LeadFormPanel as LeadForm,
  VisibilityPrivacyPanel as Visibility,
  AnalyticsPanel as Statistic,
};

export default CustomizedEditor;
