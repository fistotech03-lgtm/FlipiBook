import React, { useState, useRef, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { 
  Bell, 
  Send, 
  RotateCcw, 
  Monitor, 
  Mail, 
  BookOpen, 
  Share2, 
  MessageSquare, 
  Heart, 
  FileText, 
  KeyRound, 
  Info, 
  ArrowRight,
  CheckCircle2,
  Sliders,
  ShieldCheck,
  ChevronDown,
  ListFilter
} from 'lucide-react';

const defaultNotificationItems = [
  {
    id: 'flipbook-updates',
    title: 'Flipbook Updates',
    description: 'Get notified about your flipbook activities and changes.',
    icon: 'lucide:book-open',
    iconBg: 'bg-[#FFF2EE] text-[#EC5137]',
    inApp: true,
    email: true,
    essential: true,
  },
  {
    id: 'shares-collaborations',
    title: 'Shares & Collaborations',
    description: 'Notify me when my flipbook is shared or someone collaborates.',
    icon: 'lucide:share-2',
    iconBg: 'bg-[#FFF7ED] text-[#F97316]',
    inApp: true,
    email: true,
    essential: false,
  },
  {
    id: 'comments-feedback',
    title: 'Comments & Feedback',
    description: 'Get alerts for new comments and feedback.',
    icon: 'lucide:message-square',
    iconBg: 'bg-[#EFF6FF] text-[#3B82F6]',
    inApp: true,
    email: true,
    essential: false,
  },
  {
    id: 'likes-reactions',
    title: 'Likes & Reactions',
    description: 'Notify me about likes and reactions on my flipbooks.',
    icon: 'lucide:heart',
    iconBg: 'bg-[#FDF2F8] text-[#EC4899]',
    inApp: true,
    email: true,
    essential: false,
  },
  {
    id: 'lead-form-responses',
    title: 'Lead Form responses',
    description: 'Get Notified when someone submits a lead form from your flipbook.',
    icon: 'lucide:file-text',
    iconBg: 'bg-[#FFFBEB] text-[#F59E0B]',
    inApp: true,
    email: true,
    essential: false,
  },
  {
    id: 'access-requests',
    title: 'Access Requests',
    description: 'Requests to access your private or password-protected flipbooks.',
    icon: 'lucide:key-round',
    iconBg: 'bg-[#F5F3FF] text-[#8B5CF6]',
    inApp: true,
    email: true,
    essential: true,
  },
];

const frequencyOptions = [
  'Instantly',
  'Every 15 Minutes',
  'Every 30 Minutes',
  'Every 1 Hour',
  'Daily Summary',
  'Weekly Summary',
  'Do Not Send',
];

const contentOptions = [
  'Full Details',
  'Brief Summary',
  'Important Only',
  'Choose what to include',
];

const ToggleSwitch = ({ checked, onChange }) => {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-[1.35vw] w-[2.4vw] items-center rounded-full transition-colors duration-200 ease-in-out cursor-pointer focus:outline-none ${
        checked ? 'bg-[#EC5137]' : 'bg-gray-300'
      }`}
    >
      <span
        className={`inline-block h-[1.05vw] w-[1.05vw] transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
          checked ? 'translate-x-[1.18vw]' : 'translate-x-[0.16vw]'
        }`}
      />
    </button>
  );
};

const Notifications = () => {
  const [activeTab, setActiveTab] = useState('delivery'); // Default to delivery per user focus or 'manage'
  const [items, setItems] = useState(defaultNotificationItems);

  // Quick controls state
  const [quickControls, setQuickControls] = useState({
    turnOnAll: true,
    turnOffAll: false,
    turnOffMarketing: false,
    turnOnEssentialOnly: false,
  });

  // Delivery preferences state matching screenshot
  const [deliveryChannels, setDeliveryChannels] = useState({
    inApp: true,
    email: true,
  });

  const [emailFrequency, setEmailFrequency] = useState('Instantly');
  const [emailContent, setEmailContent] = useState('Full Details');

  const [isFrequencyOpen, setIsFrequencyOpen] = useState(false);
  const [isContentOpen, setIsContentOpen] = useState(false);

  const freqRef = useRef(null);
  const contentRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (freqRef.current && !freqRef.current.contains(e.target)) {
        setIsFrequencyOpen(false);
      }
      if (contentRef.current && !contentRef.current.contains(e.target)) {
        setIsContentOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Toggle single item in manage notifications
  const handleToggle = (id, type) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [type]: !item[type] } : item))
    );
    setQuickControls((prev) => ({
      ...prev,
      turnOnAll: false,
      turnOffAll: false,
      turnOnEssentialOnly: false,
    }));
  };

  // Handle Quick Controls
  const handleQuickControl = (key, value) => {
    if (key === 'turnOnAll') {
      setQuickControls({
        turnOnAll: value,
        turnOffAll: false,
        turnOffMarketing: false,
        turnOnEssentialOnly: false,
      });
      if (value) {
        setItems((prev) => prev.map((item) => ({ ...item, inApp: true, email: true })));
        setDeliveryChannels({ inApp: true, email: true });
        showToast('All notifications enabled');
      }
    } else if (key === 'turnOffAll') {
      setQuickControls({
        turnOnAll: false,
        turnOffAll: value,
        turnOffMarketing: false,
        turnOnEssentialOnly: false,
      });
      if (value) {
        setItems((prev) => prev.map((item) => ({ ...item, inApp: false, email: false })));
        setDeliveryChannels({ inApp: false, email: false });
        showToast('All notifications turned off');
      }
    } else if (key === 'turnOffMarketing') {
      setQuickControls((prev) => ({ ...prev, turnOffMarketing: value }));
      showToast(value ? 'Marketing emails paused' : 'Marketing emails resumed');
    } else if (key === 'turnOnEssentialOnly') {
      setQuickControls({
        turnOnAll: false,
        turnOffAll: false,
        turnOffMarketing: false,
        turnOnEssentialOnly: value,
      });
      if (value) {
        setItems((prev) =>
          prev.map((item) => ({
            ...item,
            inApp: item.essential,
            email: item.essential,
          }))
        );
        showToast('Essential notifications only enabled');
      }
    }
  };

  // Refresh to default
  const handleRefreshToDefault = () => {
    setItems(defaultNotificationItems);
    setQuickControls({
      turnOnAll: true,
      turnOffAll: false,
      turnOffMarketing: false,
      turnOnEssentialOnly: false,
    });
    setDeliveryChannels({
      inApp: true,
      email: true,
    });
    setEmailFrequency('Instantly');
    setEmailContent('Full Details');
    showToast('Reset to default notification settings');
  };

  return (
    <div className="w-full h-full flex flex-col bg-white rounded-[1.2vw] p-[1.8vw] overflow-y-auto custom-scrollbar relative">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-[1.5vw] right-[2vw] z-50 bg-gray-900 text-white text-[0.78vw] px-[1.2vw] py-[0.6vw] rounded-[0.5vw] shadow-lg flex items-center gap-[0.5vw] animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-[1vw] h-[1vw] text-green-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex items-start justify-between pb-[1.4vw] border-b border-gray-100">
        <div>
          <h1 className="text-[1.35vw] font-bold text-gray-900 tracking-tight leading-none">
            Notification Settings
          </h1>
          <p className="text-[0.78vw] text-gray-400 mt-[0.35vw]">
            Choose what you want to be notified about and how you want to receive them
          </p>
        </div>

        {/* Refresh to Default Button */}
        <button
          type="button"
          onClick={handleRefreshToDefault}
          className="flex items-center gap-[0.4vw] px-[0.9vw] py-[0.45vw] bg-[#FFF2EE] hover:bg-[#FEE5DF] border border-[#FDEEE9] rounded-[0.5vw] text-[0.78vw] font-medium text-[#EC5137] transition-colors cursor-pointer shadow-xs active:scale-95"
        >
          <span>Refresh to Default</span>
          <RotateCcw className="w-[0.85vw] h-[0.85vw] stroke-[2.2]" />
        </button>
      </div>

      {/* Tabs Row */}
      <div className="flex items-center gap-[0.7vw] mt-[1.2vw] mb-[1.5vw]">
        {/* Tab 1: Manage Notifications */}
        <button
          type="button"
          onClick={() => setActiveTab('manage')}
          className={`flex items-center gap-[0.45vw] px-[1.1vw] py-[0.45vw] rounded-full text-[0.78vw] font-medium transition-all cursor-pointer ${
            activeTab === 'manage'
              ? 'bg-[#FFF2EE] text-[#EC5137] border border-[#EC5137]/30 shadow-xs'
              : 'bg-white text-gray-500 border border-gray-200 hover:text-gray-800'
          }`}
        >
          <Bell className="w-[0.95vw] h-[0.95vw]" />
          <span>Manage Notifications</span>
        </button>

        {/* Tab 2: Delivery Preferences */}
        <button
          type="button"
          onClick={() => setActiveTab('delivery')}
          className={`flex items-center gap-[0.45vw] px-[1.1vw] py-[0.45vw] rounded-full text-[0.78vw] font-medium transition-all cursor-pointer ${
            activeTab === 'delivery'
              ? 'bg-[#FFF2EE] text-[#EC5137] border border-[#EC5137]/30 shadow-xs'
              : 'bg-white text-gray-500 border border-gray-200 hover:text-gray-800'
          }`}
        >
          <Send className="w-[0.9vw] h-[0.9vw]" />
          <span>Delivery Preferences</span>
        </button>
      </div>

      {/* Main Content Area */}
      {activeTab === 'manage' ? (
        <div className="grid grid-cols-12 gap-[1.5vw]">
          {/* Left Column (Items List) - 8 cols */}
          <div className="col-span-8 flex flex-col gap-[1.2vw]">
            {/* Header row for Manage Notifications & Column Toggles */}
            <div className="flex items-end justify-between px-[0.2vw]">
              <div>
                <h2 className="text-[1.05vw] font-bold text-gray-900 leading-tight">
                  Manage Notifications
                </h2>
                <p className="text-[0.75vw] text-gray-400 mt-[0.15vw]">
                  Choose what you want to be notified about and where.
                </p>
              </div>

              {/* Column header indicators for toggles */}
              <div className="flex items-center gap-[2.4vw] pr-[1.2vw]">
                <div className="flex items-center gap-[0.35vw] text-[0.76vw] font-medium text-gray-700">
                  <Monitor className="w-[0.9vw] h-[0.9vw] text-gray-500" />
                  <span>In app</span>
                </div>
                <div className="flex items-center gap-[0.35vw] text-[0.76vw] font-medium text-gray-700">
                  <Mail className="w-[0.9vw] h-[0.9vw] text-gray-500" />
                  <span>Email</span>
                </div>
              </div>
            </div>

            {/* Notification items list */}
            <div className="flex flex-col gap-[0.7vw]">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="w-full border border-gray-100 hover:border-gray-200 bg-white rounded-[0.85vw] p-[1.1vw] flex items-center justify-between transition-all shadow-xs"
                >
                  {/* Left: Icon + Text */}
                  <div className="flex items-center gap-[0.9vw]">
                    <div
                      className={`w-[2.4vw] h-[2.4vw] rounded-[0.55vw] flex items-center justify-center shrink-0 ${item.iconBg}`}
                    >
                      <Icon icon={item.icon} className="w-[1.15vw] h-[1.15vw]" />
                    </div>
                    <div>
                      <h3 className="text-[0.85vw] font-semibold text-gray-800 leading-tight">
                        {item.title}
                      </h3>
                      <p className="text-[0.72vw] text-gray-400 mt-[0.2vw]">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {/* Right: In app switch & Email switch */}
                  <div className="flex items-center gap-[2.8vw] pr-[0.8vw]">
                    <ToggleSwitch
                      checked={item.inApp}
                      onChange={() => handleToggle(item.id, 'inApp')}
                    />
                    <ToggleSwitch
                      checked={item.email}
                      onChange={() => handleToggle(item.id, 'email')}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Info Banner */}
            <div className="w-full border border-gray-100 bg-white rounded-[0.8vw] px-[1.2vw] py-[0.85vw] flex items-center justify-between shadow-xs mt-[0.3vw]">
              <div className="flex items-center gap-[0.5vw] text-gray-500 text-[0.75vw]">
                <Info className="w-[1vw] h-[1vw] text-gray-400 shrink-0" />
                <span>
                  You can manage how and when you receive notifications from Delivery Preferences
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('delivery')}
                className="flex items-center gap-[0.35vw] text-[#EC5137] bg-[#FFF2EE] hover:bg-[#FEE5DF] border border-[#FDEEE9] rounded-[0.5vw] px-[0.85vw] py-[0.4vw] text-[0.75vw] font-medium transition-colors cursor-pointer"
              >
                <span>Go to Delivery Preference</span>
                <ArrowRight className="w-[0.85vw] h-[0.85vw]" />
              </button>
            </div>
          </div>

          {/* Right Column (Quick Controls & Cards) - 4 cols */}
          <div className="col-span-4 flex flex-col gap-[1vw]">
            {/* 1. Quick Controls Card */}
            <div className="border border-gray-100 bg-white rounded-[0.9vw] p-[1.2vw] shadow-xs">
              <h3 className="text-[0.9vw] font-bold text-gray-900 leading-tight">
                Quick Controls
              </h3>
              <p className="text-[0.68vw] text-gray-400 mt-[0.15vw] mb-[1.1vw]">
                Enable or disable all notifications or manage them quickly
              </p>

              <div className="flex flex-col gap-[0.9vw]">
                {/* Control 1 */}
                <div className="flex items-center justify-between">
                  <div className="pr-[0.5vw]">
                    <h4 className="text-[0.78vw] font-medium text-gray-800 leading-tight">
                      Turn on all notifications
                    </h4>
                    <p className="text-[0.68vw] text-gray-400 mt-[0.15vw]">
                      Enable all in-app and email notifications.
                    </p>
                  </div>
                  <ToggleSwitch
                    checked={quickControls.turnOnAll}
                    onChange={(val) => handleQuickControl('turnOnAll', val)}
                  />
                </div>

                {/* Control 2 */}
                <div className="flex items-center justify-between">
                  <div className="pr-[0.5vw]">
                    <h4 className="text-[0.78vw] font-medium text-gray-800 leading-tight">
                      Turn off all notifications
                    </h4>
                    <p className="text-[0.68vw] text-gray-400 mt-[0.15vw]">
                      You will stop receiving all notifications.
                    </p>
                  </div>
                  <ToggleSwitch
                    checked={quickControls.turnOffAll}
                    onChange={(val) => handleQuickControl('turnOffAll', val)}
                  />
                </div>

                {/* Control 3 */}
                <div className="flex items-center justify-between">
                  <div className="pr-[0.5vw]">
                    <h4 className="text-[0.78vw] font-medium text-gray-800 leading-tight">
                      Turn off all marketing
                    </h4>
                    <p className="text-[0.68vw] text-gray-400 mt-[0.15vw]">
                      Stop receiving marketing emails and tips.
                    </p>
                  </div>
                  <ToggleSwitch
                    checked={quickControls.turnOffMarketing}
                    onChange={(val) => handleQuickControl('turnOffMarketing', val)}
                  />
                </div>

                {/* Control 4 */}
                <div className="flex items-center justify-between">
                  <div className="pr-[0.5vw]">
                    <h4 className="text-[0.78vw] font-medium text-gray-800 leading-tight">
                      Turn on essential only
                    </h4>
                    <p className="text-[0.68vw] text-gray-400 mt-[0.15vw]">
                      Receive only important notifications.
                    </p>
                  </div>
                  <ToggleSwitch
                    checked={quickControls.turnOnEssentialOnly}
                    onChange={(val) => handleQuickControl('turnOnEssentialOnly', val)}
                  />
                </div>
              </div>
            </div>

            {/* 2. About Notification Card */}
            <div className="border border-gray-100 bg-white rounded-[0.9vw] p-[1.2vw] shadow-xs">
              <h3 className="text-[0.9vw] font-bold text-gray-900 leading-tight mb-[1vw]">
                About Notification
              </h3>

              <div className="flex flex-col gap-[0.85vw]">
                {/* Item 1 */}
                <div className="flex items-center gap-[0.75vw]">
                  <div className="w-[2vw] h-[2vw] rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                    <Bell className="w-[1vw] h-[1vw]" />
                  </div>
                  <div>
                    <h4 className="text-[0.78vw] font-semibold text-gray-800 leading-tight">
                      In-App Notifications
                    </h4>
                    <p className="text-[0.68vw] text-gray-400 mt-[0.1vw]">
                      Instant alerts inside the application.
                    </p>
                  </div>
                </div>

                {/* Item 2 */}
                <div className="flex items-center gap-[0.75vw]">
                  <div className="w-[2vw] h-[2vw] rounded-full bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
                    <Mail className="w-[1vw] h-[1vw]" />
                  </div>
                  <div>
                    <h4 className="text-[0.78vw] font-semibold text-gray-800 leading-tight">
                      Email Notifications
                    </h4>
                    <p className="text-[0.68vw] text-gray-400 mt-[0.1vw]">
                      Receive updates directly in your inbox.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Important Note Card */}
            <div className="border border-blue-100 bg-[#F4F8FF] rounded-[0.9vw] p-[1.2vw] flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-[0.45vw] text-blue-700">
                  <Info className="w-[1.05vw] h-[1.05vw] stroke-[2.2]" />
                  <h4 className="text-[0.85vw] font-bold">Important Note</h4>
                </div>
                <p className="text-[0.72vw] text-blue-800/80 mt-[0.45vw] leading-relaxed">
                  Some critical notifications are always enabled and cannot be turned off.
                </p>
              </div>

              <div className="flex justify-end mt-[0.9vw]">
                <button
                  type="button"
                  onClick={() => showToast('Opening security & critical notification policies...')}
                  className="text-[0.75vw] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-[0.25vw] transition-colors cursor-pointer"
                >
                  <span>Learn More</span>
                  <ArrowRight className="w-[0.8vw] h-[0.8vw]" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Delivery Preferences Tab matching screenshot exactly */
        <div className="grid grid-cols-12 gap-[1.5vw] animate-in fade-in duration-150">
          {/* Left Column (Delivery Channels & Email Preferences) - 8 cols */}
          <div className="col-span-8 flex flex-col gap-[1.3vw]">
            {/* Header row */}
            <div>
              <h2 className="text-[1.05vw] font-bold text-gray-900 leading-tight">
                Delivery Preferences
              </h2>
              <p className="text-[0.75vw] text-gray-400 mt-[0.15vw]">
                Select your preferred delivery channels and customize your notification experience.
              </p>
            </div>

            {/* Card 1: Delivery Channels */}
            <div className="border border-gray-200/80 rounded-[0.8vw] bg-white overflow-hidden shadow-xs">
              <div className="p-[1.1vw] pb-[0.8vw]">
                <h3 className="text-[0.92vw] font-bold text-gray-900 leading-tight">
                  Delivery Channels
                </h3>
                <p className="text-[0.72vw] text-gray-400 mt-[0.15vw]">
                  Choose the channels through which you want to receive notifications.
                </p>
              </div>

              <div className="divide-y divide-gray-100 border-t border-gray-100">
                {/* Channel 1: In-App Notifications */}
                <div className="p-[1.1vw] flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-center gap-[0.9vw]">
                    <div className="w-[2.4vw] h-[2.4vw] rounded-[0.55vw] bg-[#FFF8ED] text-[#F59E0B] border border-[#FDE68A]/40 flex items-center justify-center shrink-0">
                      <Bell className="w-[1.2vw] h-[1.2vw]" />
                    </div>
                    <div>
                      <h4 className="text-[0.85vw] font-semibold text-gray-800 leading-tight">
                        In-App Notifications
                      </h4>
                      <p className="text-[0.72vw] text-gray-400 mt-[0.15vw]">
                        Instant notifications inside the Web Application.
                      </p>
                    </div>
                  </div>
                  <ToggleSwitch
                    checked={deliveryChannels.inApp}
                    onChange={(val) => {
                      setDeliveryChannels((prev) => ({ ...prev, inApp: val }));
                      showToast(val ? 'In-App notifications enabled' : 'In-App notifications disabled');
                    }}
                  />
                </div>

                {/* Channel 2: Email Notifications */}
                <div className="p-[1.1vw] flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-center gap-[0.9vw]">
                    <div className="w-[2.4vw] h-[2.4vw] rounded-[0.55vw] bg-[#EEF2FF] text-[#6366F1] border border-[#C7D2FE]/40 flex items-center justify-center shrink-0">
                      <Mail className="w-[1.2vw] h-[1.2vw]" />
                    </div>
                    <div>
                      <h4 className="text-[0.85vw] font-semibold text-gray-800 leading-tight">
                        Email Notifications
                      </h4>
                      <p className="text-[0.72vw] text-gray-400 mt-[0.15vw]">
                        Receive notifications via email.
                      </p>
                    </div>
                  </div>
                  <ToggleSwitch
                    checked={deliveryChannels.email}
                    onChange={(val) => {
                      setDeliveryChannels((prev) => ({ ...prev, email: val }));
                      showToast(val ? 'Email notifications enabled' : 'Email notifications disabled');
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Card 2: Email Preferences */}
            <div className="border border-gray-200/80 rounded-[0.8vw] bg-white overflow-hidden shadow-xs">
              <div className="p-[1.1vw] pb-[0.8vw]">
                <h3 className="text-[0.92vw] font-bold text-gray-900 leading-tight">
                  Email Preferences
                </h3>
                <p className="text-[0.72vw] text-gray-400 mt-[0.15vw]">
                  Manage your email notification frequency and content.
                </p>
              </div>

              <div className="divide-y divide-gray-100 border-t border-gray-100">
                {/* Row 1: Email Frequency */}
                <div className="p-[1.1vw] flex items-center justify-between hover:bg-gray-50/50 transition-colors relative">
                  <div className="flex items-center gap-[0.9vw]">
                    <div className="w-[2.4vw] h-[2.4vw] rounded-[0.55vw] bg-[#EEF2FF] text-[#6366F1] border border-[#C7D2FE]/40 flex items-center justify-center shrink-0">
                      <Icon icon="lucide:mail" className="w-[1.2vw] h-[1.2vw]" />
                    </div>
                    <div>
                      <h4 className="text-[0.85vw] font-semibold text-gray-800 leading-tight">
                        Email Frequency
                      </h4>
                      <p className="text-[0.72vw] text-gray-400 mt-[0.15vw]">
                        Choose how often you want to receive email notifications.
                      </p>
                    </div>
                  </div>

                  {/* Dropdown Container */}
                  <div className="relative" ref={freqRef}>
                    <button
                      type="button"
                      onClick={() => {
                        setIsFrequencyOpen(!isFrequencyOpen);
                        setIsContentOpen(false);
                      }}
                      className="border border-gray-200 hover:border-gray-300 rounded-[0.5vw] bg-white px-[0.9vw] py-[0.45vw] text-[0.78vw] font-medium text-gray-700 flex items-center justify-between gap-[1vw] min-w-[7.5vw] shadow-xs cursor-pointer transition-colors"
                    >
                      <span className="truncate">{emailFrequency}</span>
                      <ChevronDown className={`w-[0.9vw] h-[0.9vw] text-gray-500 transition-transform ${isFrequencyOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Floating Dropdown Menu */}
                    {isFrequencyOpen && (
                      <div className="absolute right-0 top-[calc(100%+0.35vw)] w-[9.5vw] bg-white border border-gray-100 rounded-[0.7vw] shadow-xl py-[0.4vw] z-50 animate-in fade-in zoom-in-95 duration-100 text-center">
                        {frequencyOptions.map((opt) => (
                          <div
                            key={opt}
                            onClick={() => {
                              setEmailFrequency(opt);
                              setIsFrequencyOpen(false);
                              showToast(`Email frequency set to ${opt}`);
                            }}
                            className={`px-[1.2vw] py-[0.45vw] text-[0.78vw] cursor-pointer transition-colors ${
                              emailFrequency === opt
                                ? 'bg-[#FFF2EE] text-[#EC5137] font-medium'
                                : 'text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            <span>{opt}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Row 2: Email Content */}
                <div className="p-[1.1vw] flex items-center justify-between hover:bg-gray-50/50 transition-colors relative">
                  <div className="flex items-center gap-[0.9vw]">
                    <div className="w-[2.4vw] h-[2.4vw] rounded-[0.55vw] bg-[#EEF2FF] text-[#6366F1] border border-[#C7D2FE]/40 flex items-center justify-center shrink-0">
                      <ListFilter className="w-[1.2vw] h-[1.2vw]" />
                    </div>
                    <div>
                      <h4 className="text-[0.85vw] font-semibold text-gray-800 leading-tight">
                        Email Content
                      </h4>
                      <p className="text-[0.72vw] text-gray-400 mt-[0.15vw]">
                        Choose the type of content included in email notifications.
                      </p>
                    </div>
                  </div>

                  {/* Dropdown Container */}
                  <div className="relative" ref={contentRef}>
                    <button
                      type="button"
                      onClick={() => {
                        setIsContentOpen(!isContentOpen);
                        setIsFrequencyOpen(false);
                      }}
                      className="border border-gray-200 hover:border-gray-300 rounded-[0.5vw] bg-white px-[0.9vw] py-[0.45vw] text-[0.78vw] font-medium text-gray-700 flex items-center justify-between gap-[1vw] min-w-[7.5vw] shadow-xs cursor-pointer transition-colors"
                    >
                      <span className="truncate">{emailContent}</span>
                      <ChevronDown className={`w-[0.9vw] h-[0.9vw] text-gray-500 transition-transform ${isContentOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Floating Dropdown Menu */}
                    {isContentOpen && (
                      <div className="absolute right-0 top-[calc(100%+0.35vw)] w-[11vw] bg-white border border-gray-100 rounded-[0.7vw] shadow-xl py-[0.4vw] z-50 animate-in fade-in zoom-in-95 duration-100 text-center">
                        {contentOptions.map((opt) => (
                          <div
                            key={opt}
                            onClick={() => {
                              setEmailContent(opt);
                              setIsContentOpen(false);
                              showToast(`Email content set to ${opt}`);
                            }}
                            className={`px-[1.2vw] py-[0.45vw] text-[0.78vw] cursor-pointer transition-colors ${
                              emailContent === opt
                                ? 'bg-[#FFF2EE] text-[#EC5137] font-medium'
                                : 'text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            <span>{opt}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (Delivery Summary & Info Cards) - 4 cols */}
          <div className="col-span-4 flex flex-col gap-[1vw]">
            {/* Card 1: Delivery Summary */}
            <div className="border border-gray-200/80 bg-white rounded-[0.9vw] p-[1.2vw] shadow-xs">
              <h3 className="text-[0.9vw] font-bold text-gray-900 leading-tight">
                Delivery Summary
              </h3>
              <p className="text-[0.68vw] text-gray-400 mt-[0.15vw] mb-[1.1vw]">
                Review your current notification delivery settings.
              </p>

              <div className="flex flex-col gap-[0.9vw]">
                {/* Summary Item 1: In-App */}
                <div className="flex items-start gap-[0.75vw]">
                  <div className="w-[2vw] h-[2vw] rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 mt-[0.1vw]">
                    <Bell className="w-[1vw] h-[1vw]" />
                  </div>
                  <div>
                    <h4 className="text-[0.78vw] font-semibold text-gray-800 leading-tight">
                      In-App Notifications
                    </h4>
                    <p className={`text-[0.68vw] font-medium mt-[0.1vw] ${deliveryChannels.inApp ? 'text-green-600' : 'text-gray-400'}`}>
                      {deliveryChannels.inApp ? 'Enabled' : 'Disabled'}
                    </p>
                  </div>
                </div>

                {/* Summary Item 2: Email */}
                <div className="flex items-start gap-[0.75vw]">
                  <div className="w-[2vw] h-[2vw] rounded-full bg-orange-50 text-orange-500 flex items-center justify-center shrink-0 mt-[0.1vw]">
                    <Mail className="w-[1vw] h-[1vw]" />
                  </div>
                  <div>
                    <h4 className="text-[0.78vw] font-semibold text-gray-800 leading-tight">
                      Email Notifications
                    </h4>
                    <p className="text-[0.68vw] text-gray-400 mt-[0.1vw]">
                      {emailFrequency} - {emailContent}
                    </p>
                    <p className={`text-[0.68vw] font-medium mt-[0.1vw] ${deliveryChannels.email ? 'text-green-600' : 'text-gray-400'}`}>
                      {deliveryChannels.email ? 'Enabled' : 'Disabled'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: About Delivery Preferences */}
            <div className="border border-gray-200/80 bg-white rounded-[0.9vw] p-[1.2vw] shadow-xs">
              <h3 className="text-[0.9vw] font-bold text-gray-900 leading-tight mb-[1vw]">
                About Delivery Preferences
              </h3>

              <div className="flex flex-col gap-[0.85vw]">
                {/* Item 1 */}
                <div className="flex items-start gap-[0.75vw]">
                  <div className="w-[2vw] h-[2vw] rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 mt-[0.1vw]">
                    <Bell className="w-[1vw] h-[1vw]" />
                  </div>
                  <div>
                    <h4 className="text-[0.78vw] font-semibold text-gray-800 leading-tight">
                      Stay Updated
                    </h4>
                    <p className="text-[0.68vw] text-gray-400 mt-[0.1vw]">
                      Get notified instantly through your preferred channels.
                    </p>
                  </div>
                </div>

                {/* Item 2 */}
                <div className="flex items-start gap-[0.75vw]">
                  <div className="w-[2vw] h-[2vw] rounded-full bg-orange-50 text-orange-500 flex items-center justify-center shrink-0 mt-[0.1vw]">
                    <Sliders className="w-[1vw] h-[1vw]" />
                  </div>
                  <div>
                    <h4 className="text-[0.78vw] font-semibold text-gray-800 leading-tight">
                      Flexible Options
                    </h4>
                    <p className="text-[0.68vw] text-gray-400 mt-[0.1vw]">
                      Choose how and when you want to receive notifications.
                    </p>
                  </div>
                </div>

                {/* Item 3 */}
                <div className="flex items-start gap-[0.75vw]">
                  <div className="w-[2vw] h-[2vw] rounded-full bg-green-50 text-green-600 flex items-center justify-center shrink-0 mt-[0.1vw]">
                    <ShieldCheck className="w-[1vw] h-[1vw]" />
                  </div>
                  <div>
                    <h4 className="text-[0.78vw] font-semibold text-gray-800 leading-tight">
                      You're in Control
                    </h4>
                    <p className="text-[0.68vw] text-gray-400 mt-[0.1vw]">
                      Manage your preferences anytime to suit your needs.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3: Need Help ? */}
            <div className="border border-blue-100 bg-[#F4F8FF] rounded-[0.9vw] p-[1.2vw] flex flex-col justify-between">
              <div>
                <h4 className="text-[0.85vw] font-bold text-blue-700">Need Help ?</h4>
                <p className="text-[0.72vw] text-blue-900/80 mt-[0.35vw] leading-relaxed">
                  Learn more about notifications and delivery preferences.
                </p>
              </div>

              <div className="flex justify-end mt-[0.9vw]">
                <button
                  type="button"
                  onClick={() => showToast('Opening Help Center...')}
                  className="text-[0.75vw] font-bold text-gray-900 hover:text-black flex items-center gap-[0.3vw] transition-colors cursor-pointer"
                >
                  <span>View Help Center</span>
                  <ArrowRight className="w-[0.8vw] h-[0.8vw]" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;
