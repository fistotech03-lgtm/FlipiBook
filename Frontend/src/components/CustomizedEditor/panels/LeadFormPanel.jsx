import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import { Icon } from '@iconify/react';
import { Plus, Trash2, Mail } from 'lucide-react';
import PremiumDropdown from '../components/PremiumDropdown';
import ColorPallet from '../../ColorPallet';

import Template1Icon from '../../../assets/quick template/Frame 1171276601 (1).svg';
import Template2Icon from '../../../assets/quick template/Frame 1171276601 (2).svg';
import Template3Icon from '../../../assets/quick template/Frame 1171276601 (3).svg';
import Template4Icon from '../../../assets/quick template/Frame 1171276601 (4).svg';
import Template5Icon from '../../../assets/quick template/Frame 1171276601 (5).svg';

const fontFamilies = [
  'Arial', 'Times New Roman', 'Courier New', 'Georgia', 'Verdana',
  'Helvetica', 'Poppins', 'Roboto', 'Open Sans', 'Lato', 'Montserrat',
  'Inter', 'Playfair Display', 'Oswald', 'Merriweather'
];

const Switch = ({ enabled, onChange }) => (
  <button
    type="button"
    onClick={(e) => {
      e.stopPropagation();
      onChange(!enabled);
    }}
    className={`relative block w-[1.8vw] h-[1vw] rounded-[1vw] transition-all duration-200 ease-in-out shadow-[inset_0_0.05vw_0.1vw_rgba(0,0,0,0.15)] outline-none shrink-0 cursor-pointer ${enabled ? 'bg-[#E05638]' : 'bg-[#D1D5DB]'}`}
  >
    <div
      className={`absolute top-[0.1vw] w-[0.8vw] h-[0.8vw] bg-white rounded-full transition-all duration-200 ease-in-out shadow-[0_0.05vw_0.15vw_rgba(0,0,0,0.25)] flex items-center justify-center ${enabled ? 'left-[0.9vw]' : 'left-[0.1vw]'}`}
    >
      {enabled && (
        <Icon icon="lucide:check" className="w-[0.55vw] h-[0.55vw] text-[#E05638] stroke-[3]" />
      )}
    </div>
  </button>
);

const CategoryGroupItem = ({
  catName,
  cIdx,
  fieldId,
  productsList,
  categoriesCount,
  onRenameCategory,
  onAddProduct,
  onDeleteCategory,
  onProductChange,
  onProductImageUpload,
  onRemoveProduct,
  uploadingProductImgId
}) => {
  const [localName, setLocalName] = useState(catName);

  // Sync if external category name changes (e.g. initial load or reset)
  useEffect(() => {
    setLocalName(catName);
  }, [catName]);

  const prodsInCat = productsList.filter(p => (p.category || 'Product category 1').trim() === catName.trim());

  return (
    <div className="bg-gray-50/80 rounded-[0.45vw] border border-gray-200/90 p-[0.45vw] space-y-[0.35vw]">
      {/* Category Header */}
      <div className="flex items-center justify-between gap-[0.3vw] pb-[0.2vw] border-b border-gray-200/70">
        <div className="flex items-center gap-[0.3vw] flex-1 min-w-0">
          <Icon icon="lucide:folder" className="w-[0.8vw] h-[0.8vw] text-indigo-500 shrink-0" />
          <input
            type="text"
            value={localName}
            onChange={(e) => {
              const val = e.target.value;
              setLocalName(val);
              onRenameCategory(fieldId, catName, val);
            }}
            placeholder="Category Name"
            className="flex-1 bg-transparent text-[0.68vw] font-semibold text-gray-800 outline-none border-b border-transparent hover:border-gray-300 focus:border-indigo-500 focus:bg-white px-[0.2vw] py-[0.1vw] rounded-[0.2vw]"
            title="Rename category"
          />
        </div>
        <div className="flex items-center gap-[0.2vw] shrink-0">
          <button
            type="button"
            onClick={() => onAddProduct(fieldId, catName)}
            className="flex items-center gap-[0.15vw] px-[0.35vw] py-[0.15vw] text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-[0.25vw] text-[0.6vw] font-medium transition-colors"
            title={`Add product under ${catName}`}
          >
            <Plus size="0.6vw" /> Add Product
          </button>
          {categoriesCount > 1 && (
            <button
              type="button"
              onClick={() => onDeleteCategory(fieldId, catName)}
              className="text-gray-400 hover:text-red-500 p-[0.15vw] rounded hover:bg-red-50 transition-colors"
              title="Delete entire category & products"
            >
              <Icon icon="lucide:trash-2" className="w-[0.75vw] h-[0.75vw]" />
            </button>
          )}
        </div>
      </div>

      {/* Products under this Category */}
      <div className="space-y-[0.3vw] pl-[0.2vw]">
        {prodsInCat.map((prod, pIdx) => (
          <div key={prod.id || pIdx} className="flex items-center gap-[0.35vw] p-[0.3vw] bg-white rounded-[0.35vw] border border-gray-200/80 shadow-2xs">
            {/* Product Image Upload Thumbnail */}
            <label className="w-[1.9vw] h-[1.9vw] rounded-[0.25vw] border border-dashed border-gray-300 hover:border-indigo-500 bg-gray-50 flex items-center justify-center cursor-pointer shrink-0 relative overflow-hidden group/img transition-colors" title="Upload Product Image">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    onProductImageUpload(fieldId, prod.id, e.target.files[0]);
                  }
                }}
              />
              {uploadingProductImgId === prod.id ? (
                <div className="flex flex-col items-center justify-center text-indigo-600">
                  <Icon icon="lucide:loader-2" className="w-[0.9vw] h-[0.9vw] animate-spin" />
                </div>
              ) : prod.image ? (
                <>
                  <img src={prod.image} alt={prod.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-white">
                    <Icon icon="lucide:camera" className="w-[0.8vw] h-[0.8vw]" />
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-400 group-hover/img:text-indigo-600">
                  <Icon icon="lucide:image-plus" className="w-[0.8vw] h-[0.8vw]" />
                </div>
              )}
            </label>

            {/* Product Name Input */}
            <div className="flex-1 min-w-0">
              <input
                type="text"
                value={prod.name || ''}
                onChange={(e) => onProductChange(fieldId, prod.id, 'name', e.target.value)}
                placeholder="Product Name"
                className="w-full border border-gray-200 rounded-[0.25vw] px-[0.4vw] py-[0.2vw] text-[0.66vw] text-gray-700 outline-none focus:border-indigo-500 bg-white h-[1.5vw]"
              />
            </div>

            {/* Remove Product */}
            {productsList.length > 1 && (
              <button
                type="button"
                onClick={() => onRemoveProduct(fieldId, prod.id)}
                className="text-gray-400 hover:text-red-500 p-[0.2vw] rounded hover:bg-red-50 transition-colors shrink-0"
                title="Remove Product"
              >
                <Icon icon="lucide:trash-2" className="w-[0.75vw] h-[0.75vw]" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const LeadForm = ({ onBack, settings, onUpdate, pages = [], folderName, bookName, v_id }) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
  const [uploadingProductImgId, setUploadingProductImgId] = useState(null);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(true);
  const [isCustomizeFieldsOpen, setIsCustomizeFieldsOpen] = useState(true);
  const [isColorOpen, setIsColorOpen] = useState(false);
  const [isEnquiryBtnOpen, setIsEnquiryBtnOpen] = useState(true);
  const [isEmailOpen, setIsEmailOpen] = useState(true);
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);

  const updateNested = (category, field, value) => {
    onUpdate({
      ...settings,
      [category]: {
        ...settings[category],
        [field]: value
      }
    });
  };

  const [activeDropdownId, setActiveDropdownId] = useState(null);
  const [activeDeleteMenuId, setActiveDeleteMenuId] = useState(null);
  const [isAddFieldPopupOpen, setIsAddFieldPopupOpen] = useState(false);
  const [activePopupTab, setActivePopupTab] = useState('templates');
  const [isEmailCustomModalOpen, setIsEmailCustomModalOpen] = useState(false);

  useEffect(() => {
    if (settings.enabled && (!settings.fields || settings.fields.length === 0)) {
      onUpdate({
        ...settings,
        fields: [
          { id: Date.now().toString(), type: 'name', label: 'Full Name', placeholder: 'Enter your Name', required: true },
          { id: (Date.now() + 1).toString(), type: 'email', label: 'Email Address', placeholder: 'Enter your Email', required: true },
          { id: (Date.now() + 2).toString(), type: 'phone', label: 'Phone Number', placeholder: 'Enter your Phone Number', required: true }
        ]
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!activeDropdownId) return;
      const activeContainer = document.getElementById(`dropdown-container-${activeDropdownId}`);
      if (activeContainer && !activeContainer.contains(event.target)) {
        setActiveDropdownId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeDropdownId]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!activeDeleteMenuId) return;
      const activeContainer = document.getElementById(`delete-menu-${activeDeleteMenuId}`);
      if (activeContainer && !activeContainer.contains(event.target)) {
        setActiveDeleteMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeDeleteMenuId]);

  const handleAddField = (type = 'empty') => {
    const newField = { id: Date.now().toString(), type };
    if (type === 'dropdown' || type === 'radio' || type === 'checkbox') {
      newField.label = type === 'radio' ? 'Select Option' : type === 'dropdown' ? 'Select Option' : type === 'checkbox' ? 'Interested Products' : '';
      newField.options = (type === 'dropdown' || type === 'radio') ? ['Option 1', 'Option 2'] : type === 'checkbox' ? ['Option 1', 'Option 2'] : ['Option 1', 'Option 2'];
    } else if (type === 'feedback') {
      newField.label = 'Feedback';
      newField.placeholder = 'Enter your Feedback';
    } else if (type === 'rating') {
      newField.label = 'Provide Ratings';
    } else if (type === 'products') {
      newField.label = 'Select Products';
      newField.showQuantity = true;
      newField.products = [
        { id: Date.now().toString() + '-p1', name: 'Product 1', category: 'Product category 1', image: '' },
        { id: Date.now().toString() + '-p2', name: 'Product 2', category: 'Product category 1', image: '' }
      ];
    }
    const newFields = [...(settings.fields || []), newField];
    onUpdate({ ...settings, fields: newFields });
    setIsAddFieldPopupOpen(false);
  };

  const handleProductChange = (fieldId, productId, key, value) => {
    const newFields = (settings.fields || []).map(f => {
      if (f.id === fieldId) {
        const newProducts = (f.products || []).map(p =>
          p.id === productId ? { ...p, [key]: value } : p
        );
        return { ...f, products: newProducts };
      }
      return f;
    });
    onUpdate({ ...settings, fields: newFields });
  };

  const handleAddProductItem = (fieldId, targetCategory = '') => {
    const newFields = (settings.fields || []).map(f => {
      if (f.id === fieldId) {
        const existingProducts = f.products || [];
        const nextNum = existingProducts.length + 1;
        const assignedCategory = targetCategory || (existingProducts[existingProducts.length - 1]?.category) || 'Product category 1';
        const newProd = {
          id: Date.now().toString() + '-' + Math.random().toString(36).substring(2, 6),
          name: `Product ${nextNum}`,
          category: assignedCategory,
          image: ''
        };
        return { ...f, products: [...existingProducts, newProd] };
      }
      return f;
    });
    onUpdate({ ...settings, fields: newFields });
  };

  const deleteProductImageFromSupabase = async (imageUrl) => {
    if (!imageUrl || typeof imageUrl !== 'string' || imageUrl.startsWith('data:')) return;
    try {
      await axios.post(`${backendUrl}/api/flipbook/delete-customized-asset`, { url: imageUrl });
    } catch (err) {
      console.warn('[LeadForm] Error deleting product image from Supabase:', err);
    }
  };

  const handleRemoveProductItem = (fieldId, productId) => {
    // Find image of the removed product to delete from Supabase
    const targetField = (settings.fields || []).find(f => f.id === fieldId);
    const targetProd = (targetField?.products || []).find(p => p.id === productId);
    if (targetProd?.image) {
      deleteProductImageFromSupabase(targetProd.image);
    }

    const newFields = (settings.fields || []).map(f => {
      if (f.id === fieldId) {
        return { ...f, products: (f.products || []).filter(p => p.id !== productId) };
      }
      return f;
    });
    onUpdate({ ...settings, fields: newFields });
  };

  const handleRenameCategory = (fieldId, oldCategoryName, newCategoryName) => {
    const newFields = (settings.fields || []).map(f => {
      if (f.id === fieldId) {
        const updatedProds = (f.products || []).map(p => {
          const currentCat = (p.category || 'Product category 1').trim();
          if (currentCat === oldCategoryName.trim()) {
            return { ...p, category: newCategoryName };
          }
          return p;
        });
        return { ...f, products: updatedProds };
      }
      return f;
    });
    onUpdate({ ...settings, fields: newFields });
  };

  const handleAddCategoryGroup = (fieldId) => {
    const newFields = (settings.fields || []).map(f => {
      if (f.id === fieldId) {
        const existing = f.products || [];
        // Find existing category names
        const existingCats = Array.from(new Set(existing.map(p => (p.category || '').trim()).filter(Boolean)));
        const nextCatNum = existingCats.length + 1;
        const newCatName = `Product category ${nextCatNum}`;
        const nextProdNum = existing.length + 1;
        const newProd = {
          id: Date.now().toString() + '-' + Math.random().toString(36).substring(2, 6),
          name: `Product ${nextProdNum}`,
          category: newCatName,
          image: ''
        };
        return { ...f, products: [...existing, newProd] };
      }
      return f;
    });
    onUpdate({ ...settings, fields: newFields });
  };

  const handleDeleteCategoryGroup = (fieldId, catName) => {
    // Clean up images for products in deleted category
    const targetField = (settings.fields || []).find(f => f.id === fieldId);
    if (targetField?.products) {
      targetField.products.forEach(p => {
        if ((p.category || 'Product category 1').trim() === catName.trim() && p.image) {
          deleteProductImageFromSupabase(p.image);
        }
      });
    }

    const newFields = (settings.fields || []).map(f => {
      if (f.id === fieldId) {
        const remainingProds = (f.products || []).filter(p => (p.category || 'Product category 1').trim() !== catName.trim());
        // If all products were in this category, keep at least 1 product in a default category
        if (remainingProds.length === 0) {
          remainingProds.push({
            id: Date.now().toString(),
            name: 'Product 1',
            category: 'Product category 1',
            image: ''
          });
        }
        return { ...f, products: remainingProds };
      }
      return f;
    });
    onUpdate({ ...settings, fields: newFields });
  };

  const handleProductImageUpload = async (fieldId, productId, file) => {
    if (!file) return;

    // Get current image to delete old one if replacing
    const currentField = (settings.fields || []).find(f => f.id === fieldId);
    const currentProd = (currentField?.products || []).find(p => p.id === productId);
    const oldImage = currentProd?.image;

    // Fast preview while uploading
    const reader = new FileReader();
    reader.onload = (e) => {
      handleProductChange(fieldId, productId, 'image', e.target.result);
    };
    reader.readAsDataURL(file);

    // Upload to Supabase Storage via backend
    setUploadingProductImgId(productId);
    try {
      let emailId = 'guest@fisto.tech';
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          emailId = user.emailId || user.email || emailId;
        } catch (e) {}
      }

      const formData = new FormData();
      formData.append('emailId', emailId);
      formData.append('folderName', folderName || 'My_Flipbooks');
      formData.append('flipbookName', bookName || 'Untitled Document');
      formData.append('v_id', v_id || '');
      formData.append('assetType', 'lead_product');
      formData.append('file', file);

      const res = await axios.post(`${backendUrl}/api/flipbook/upload-customized-asset`, formData);
      if (res.data?.url) {
        handleProductChange(fieldId, productId, 'image', res.data.url);
        // If replacing an existing Supabase image, delete the old one
        if (oldImage && !oldImage.startsWith('data:')) {
          deleteProductImageFromSupabase(oldImage);
        }
      }
    } catch (err) {
      console.error('[LeadForm] Failed to upload product image to Supabase:', err);
    } finally {
      setUploadingProductImgId(null);
    }
  };

  const handleTypeChange = (id, type) => {
    const defaultPlaceholders = {
      name: 'Enter your Name',
      email: 'Enter your Email',
      company: 'Enter your company name',
      phone: 'Enter your Phone Number',
      services: 'Select Service',
      enquiry: 'Enter your Enquiry'
    };
    const defaultLabels = {
      name: 'Full Name',
      email: 'Email Address',
      company: 'Company Name',
      phone: 'Phone Number',
      services: 'Services',
      enquiry: 'Enquiry'
    };
    const newFields = (settings.fields || []).map(f =>
      f.id === id ? {
        ...f,
        type,
        label: defaultLabels[type] || type,
        placeholder: defaultPlaceholders[type] || `Enter your ${type}`
      } : f
    );
    onUpdate({ ...settings, fields: newFields });
    setActiveDropdownId(null);
  };

  const handleRemoveField = (id) => {
    const newFields = (settings.fields || []).filter(f => f.id !== id);
    onUpdate({ ...settings, fields: newFields });
  };

  const handleFieldChange = (id, placeholder, label, extraUpdates = {}) => {
    const newFields = (settings.fields || []).map(f =>
      f.id === id ? { ...f, placeholder, ...(label !== undefined && { label }), ...extraUpdates } : f
    );
    onUpdate({ ...settings, fields: newFields });
  };

  const handleOptionChange = (fieldId, optionIndex, value) => {
    const newFields = (settings.fields || []).map(f => {
      if (f.id === fieldId) {
        const newOptions = [...(f.options || [])];
        newOptions[optionIndex] = value;
        return { ...f, options: newOptions };
      }
      return f;
    });
    onUpdate({ ...settings, fields: newFields });
  };

  const handleAddOption = (fieldId) => {
    const newFields = (settings.fields || []).map(f => {
      if (f.id === fieldId) {
        const nextIndex = (f.options || []).length + 1;
        return { ...f, options: [...(f.options || []), `Option ${nextIndex}`] };
      }
      return f;
    });
    onUpdate({ ...settings, fields: newFields });
  };

  const handleRemoveOption = (fieldId, optionIndex) => {
    const newFields = (settings.fields || []).map(f => {
      if (f.id === fieldId) {
        const newOptions = [...(f.options || [])];
        newOptions.splice(optionIndex, 1);
        return { ...f, options: newOptions };
      }
      return f;
    });
    onUpdate({ ...settings, fields: newFields });
  };

  const fieldOptions = [
    { type: 'name', label: 'Full Name', icon: 'lucide:user' },
    { type: 'email', label: 'Email Address', icon: 'logos:google-gmail' },
    { type: 'company', label: 'Company Name', icon: 'lucide:building-2' },
    { type: 'phone', label: 'Phone Number', icon: 'lucide:phone' },
    { type: 'services', label: 'Services', icon: 'lucide:settings' },
    { type: 'enquiry', label: 'Enquiry', icon: 'lucide:message-square' }
  ];



  const updateAppearance = (field, value) => {
    onUpdate({
      ...settings,
      appearance: {
        ...settings.appearance,
        [field]: value
      }
    });
  };

  const quickTemplates = [
    {
      id: 'basic-contact',
      name: 'Contact Form',
      icon: Template1Icon,
      config: {
        formTitle: 'Get in Touch',
        leadText: 'Share your details and we will contact you shortly',
        buttonText: 'SUBMIT',
        fields: [
          { id: Date.now().toString() + '-1', type: 'name', label: 'Full Name', placeholder: 'Enter your Name', required: true },
          { id: Date.now().toString() + '-2', type: 'email', label: 'Email Address', placeholder: 'Enter your Email', required: true },
          { id: Date.now().toString() + '-3', type: 'phone', label: 'Phone Number', placeholder: 'Enter your Phone Number', required: true }
        ]
      }
    },
    {
      id: 'business-inquiry',
      name: 'Business Inquiry',
      icon: Template2Icon,
      config: {
        formTitle: 'Request More Information',
        leadText: 'Tell us about your requirements and our team will reach out.',
        buttonText: 'Request Callback',
        fields: [
          { id: Date.now().toString() + '-1', type: 'name', label: 'Full Name', placeholder: 'Enter your Name', required: true },
          { id: Date.now().toString() + '-2', type: 'email', label: 'Email Address', placeholder: 'Enter your Email', required: true },
          { id: Date.now().toString() + '-3', type: 'company', label: 'Company Name', placeholder: 'Enter your company name' },
          { id: Date.now().toString() + '-4', type: 'phone', label: 'Phone Number', placeholder: 'Enter your Phone Number', required: true },
          {
            id: Date.now().toString() + '-5',
            type: 'dropdown',
            label: 'Interested Service',
            options: ['Web Development', 'Mobile App Development']
          }
        ]
      }
    },
    {
      id: 'product-inquiry',
      name: 'Product Inquiry',
      icon: Template3Icon,
      config: {
        formTitle: 'Interested in Our Products?',
        leadText: 'Let us know what you are interested in.',
        buttonText: 'Get Details',
        fields: [
          { id: Date.now().toString() + '-1', type: 'name', label: 'Full Name', placeholder: 'Enter your Name', required: true },
          { id: Date.now().toString() + '-2', type: 'email', label: 'Email Address', placeholder: 'Enter your Email', required: true },
          { id: Date.now().toString() + '-3', type: 'phone', label: 'Phone Number', placeholder: 'Enter your Phone Number', required: true },
          {
            id: Date.now().toString() + '-4',
            type: 'checkbox',
            label: 'Interested Products',
            options: ['500 ml Round', '1000 ml round']
          }
        ]
      }
    },
    {
      id: 'feedback-form',
      name: 'Feedback Form',
      icon: Template4Icon,
      config: {
        formTitle: 'Share Your Feedback',
        leadText: 'We value your feedback. Help us improve.',
        buttonText: 'Submit Feedback',
        fields: [
          { id: Date.now().toString() + '-1', type: 'name', label: 'Full Name', placeholder: 'Enter your Name', required: true },
          { id: Date.now().toString() + '-2', type: 'email', label: 'Email Address', placeholder: 'Enter your Email', required: true },
          { id: Date.now().toString() + '-3', type: 'rating', label: 'Provide Ratings' },
          { id: Date.now().toString() + '-4', type: 'feedback', label: 'Feedback', placeholder: 'Enter your Feedback' }
        ]
      }
    },
    {
      id: 'event-registration',
      name: 'Event Registration',
      icon: Template5Icon,
      config: {
        formTitle: 'Register Now',
        leadText: 'Secure your spot for the upcoming event.',
        buttonText: 'Register',
        fields: [
          { id: Date.now().toString() + '-1', type: 'name', label: 'Full Name', placeholder: 'Enter your Name', required: true },
          { id: Date.now().toString() + '-2', type: 'email', label: 'Email Address', placeholder: 'Enter your Email', required: true },
          { id: Date.now().toString() + '-3', type: 'phone', label: 'Phone Number', placeholder: 'Enter your Phone Number', required: true },
          {
            id: Date.now().toString() + '-4',
            type: 'dropdown',
            label: 'Number of Tickets',
            options: ['1', '2']
          }
        ]
      }
    }
  ];

  const handleSelectTemplate = (template) => {
    onUpdate({
      ...settings,
      enabled: true,
      selectedTemplateId: template.id,
      formTitle: template.config.formTitle,
      leadText: template.config.leadText,
      buttonText: template.config.buttonText,
      fields: template.config.fields
    });
    setIsAddFieldPopupOpen(false);
  };

  return (
    <div className="flex flex-col h-full bg-white relative overflow-visible">
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* Sub-header */}
      <div className="h-[8vh] flex items-center justify-between px-[1vw] border-b border-gray-100">
        <div className="flex items-center gap-[0.5vw]">
          <Icon icon="fluent:form-48-regular" className="w-[1vw] h-[1vw] text-gray-700 font-semibold" />
          <span className="text-[1vw] font-semibold text-gray-900">Lead & Enquiry Form</span>
        </div>
        <button onClick={onBack} className="text-gray-600 hover:text-gray-900">
          <Icon icon="ic:round-arrow-back" className="w-[1.25vw] h-[1.25vw]" />
        </button>
      </div>

      <div className="flex flex-col pt-[1vw] pb-[0.5vw] px-[1vw] space-y-[0.35vw]">
        <div className="flex items-center justify-between">
          <span className="text-[0.8vw] font-semibold text-gray-900 whitespace-nowrap">Turn ON/OFF the Lead Form</span>
          <Switch
            enabled={settings.enabled}
            onChange={(val) => {
              if (val && (!settings.fields || settings.fields.length === 0)) {
                onUpdate({
                  ...settings,
                  enabled: true,
                  selectedTemplateId: settings.selectedTemplateId || 'basic-contact',
                  formTitle: settings.formTitle || 'Get in Touch',
                  leadText: settings.leadText || 'Share your details and we will contact you shortly',
                  buttonText: settings.buttonText || 'SUBMIT',
                  fields: [
                    { id: Date.now().toString() + '-1', type: 'name', label: 'Full Name', placeholder: 'Enter your Name', required: true },
                    { id: Date.now().toString() + '-2', type: 'email', label: 'Email Address', placeholder: 'Enter your Gmail', required: true },
                    { id: Date.now().toString() + '-3', type: 'phone', label: 'Phone Number', placeholder: 'Enter your Phone Number', required: true }
                  ]
                });
              } else {
                onUpdate({ ...settings, enabled: val });
              }
            }}
          />
        </div>
        <p className="text-[0.62vw] text-gray-500 font-normal leading-relaxed">
          Turning this OFF will disable all lead form settings below, and turning it ON will enable them again<span className="text-red-500">*</span>
        </p>
      </div>

      <div
        className={`flex-1 ${settings.enabled ? 'overflow-y-auto' : 'overflow-hidden'} p-[1vw] space-y-[1vw] hide-scrollbar`}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <div className={`space-y-[1vw] transition-all duration-300 ${!settings.enabled ? 'opacity-50 pointer-events-none' : ''}`}>

          {/* Quick Template Section */}
          <div className="bg-white rounded-[0.8vw] border border-gray-200/90 shadow-[0_0.2vw_0.8vw_rgba(0,0,0,0.04)] p-[1vw] space-y-[0.8vw]">
            <div className="flex flex-col gap-[0.15vw]">
              <span className="text-[0.82vw] font-semibold text-gray-800">Quick Template</span>
              <span className="text-[0.65vw] text-gray-500 font-normal">Choose a ready-made template.</span>
            </div>

            <div className="grid grid-cols-3 gap-[0.6vw] w-full pt-[0.2vw]">
              {quickTemplates.map((template) => {
                const isSelected = settings.selectedTemplateId
                  ? settings.selectedTemplateId === template.id
                  : (settings.formTitle ? settings.formTitle === template.config.formTitle : template.id === 'basic-contact');

                return (
                  <div
                    key={template.id}
                    onClick={() => handleSelectTemplate(template)}
                    className={`flex flex-col items-center justify-between cursor-pointer group rounded-[0.6vw] p-[0.45vw] transition-all bg-white border ${
                      isSelected
                        ? 'border-[#E05638] shadow-[0_0.2vw_0.6vw_rgba(224,86,56,0.18)]'
                        : 'border-gray-200 shadow-[0_0.1vw_0.3vw_rgba(0,0,0,0.03)] hover:border-gray-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="w-full flex items-center justify-center rounded-[0.4vw] p-[0.2vw] mb-[0.4vw] transition-colors aspect-[1/1] overflow-hidden bg-white">
                      <img src={template.icon} alt={template.name} className="w-full h-full object-contain rounded-[0.3vw]" />
                    </div>
                    <span className="text-[0.62vw] font-medium text-center leading-tight transition-colors text-gray-800 group-hover:text-black mt-auto whitespace-pre-line px-[0.1vw]">
                      {template.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Customize Fields Accordion Card */}
          <div className="bg-white rounded-[0.8vw] border border-gray-200/90 shadow-[0_0.2vw_0.8vw_rgba(0,0,0,0.04)] overflow-hidden">
            {/* Accordion Header */}
            <button
              type="button"
              onClick={() => setIsCustomizeFieldsOpen(!isCustomizeFieldsOpen)}
              className="w-full flex items-center justify-between p-[0.9vw] bg-white hover:bg-gray-50/50 transition-colors"
            >
              <div className="flex flex-col text-left">
                <span className="text-[0.82vw] font-semibold text-gray-800 leading-tight">Customize Fields</span>
                <span className="text-[0.65vw] text-gray-500 font-normal mt-[0.1vw]">Add or edit form fields.</span>
              </div>
              <Icon
                icon="fluent:chevron-down-12-regular"
                className={`w-[0.9vw] h-[0.9vw] text-gray-400 transition-transform duration-200 ${isCustomizeFieldsOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {isCustomizeFieldsOpen && (
              <div className="p-[0.9vw] pt-[0.4vw] border-t border-gray-100 space-y-[0.9vw]">
                {/* Form Layout: 1 column vs 2 Column */}
                <div className="flex items-center justify-between pt-[0.3vw]">
                  <span className="text-[0.72vw] font-semibold text-gray-900">Form Layout (Desktop):</span>
                  <div className="flex items-center border border-gray-200 rounded-[0.4vw] p-[0.15vw] bg-white">
                    <button
                      type="button"
                      onClick={() => updateAppearance('layoutColumns', '1')}
                      className={`px-[0.7vw] py-[0.22vw] rounded-[0.3vw] text-[0.65vw] font-medium transition-all ${(settings.appearance?.layoutColumns || '1') === '1'
                          ? 'bg-[#E05638] text-white shadow-xs'
                          : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                      1 column
                    </button>
                    <button
                      type="button"
                      onClick={() => updateAppearance('layoutColumns', '2')}
                      className={`px-[0.7vw] py-[0.22vw] rounded-[0.3vw] text-[0.65vw] font-medium transition-all ${settings.appearance?.layoutColumns === '2'
                          ? 'bg-[#E05638] text-white shadow-xs'
                          : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                      2 Column
                    </button>
                  </div>
                </div>

                {/* Form Meta Inputs */}
                <div className="space-y-[0.8vw]">
                  <div className="flex flex-col gap-[0.3vw]">
                    <label className="text-[0.7vw] font-medium text-gray-900">Title :</label>
                    <input
                      type="text"
                      value={settings.formTitle !== undefined ? settings.formTitle : 'Get in Touch'}
                      onChange={(e) => onUpdate({ ...settings, formTitle: e.target.value })}
                      className="w-full border border-gray-200 rounded-[0.5vw] px-[0.6vw] py-[0.5vw] text-[0.7vw] text-gray-700 focus:outline-none focus:border-[#E05638] bg-white shadow-xs placeholder:text-gray-400"
                      placeholder="Get in Touch"
                    />
                  </div>

                  <div className="flex flex-col gap-[0.3vw]">
                    <label className="text-[0.7vw] font-medium text-gray-900">Description :</label>
                    <textarea
                      value={settings.leadText !== undefined ? settings.leadText : 'Share your details and we will contact you shortly.'}
                      onChange={(e) => onUpdate({ ...settings, leadText: e.target.value })}
                      className="w-full h-[3.8vw] border border-gray-200 rounded-[0.5vw] px-[0.6vw] py-[0.5vw] text-[0.7vw] text-gray-700 focus:outline-none focus:border-[#E05638] resize-none bg-white shadow-xs placeholder:text-gray-400"
                      placeholder="Share your details and we will contact you shortly."
                    />
                  </div>

                  <div className="flex flex-col gap-[0.3vw]">
                    <label className="text-[0.7vw] font-medium text-gray-900">Button Text :</label>
                    <input
                      type="text"
                      value={settings.buttonText !== undefined ? settings.buttonText : 'Request Callback'}
                      onChange={(e) => onUpdate({ ...settings, buttonText: e.target.value })}
                      className="w-full border border-gray-200 rounded-[0.5vw] px-[0.6vw] py-[0.5vw] text-[0.7vw] text-gray-700 focus:outline-none focus:border-[#E05638] bg-white shadow-xs placeholder:text-gray-400"
                      placeholder="Request Callback"
                    />
                  </div>


                </div>

                {/* Form Fields List */}
                <div className="space-y-[0.7vw] font-sans pt-[0.2vw]">
                  {settings.fields?.map((field) => {
                    const isRequired = field.required === true;

                    if (field.type === 'dropdown' || field.type === 'radio' || field.type === 'checkbox') {
                      return (
                        <div
                          key={field.id}
                          className="bg-white border border-gray-200/90 rounded-[0.6vw] overflow-visible shadow-[0_0.1vw_0.3vw_rgba(0,0,0,0.02)]"
                        >
                          {/* Card Header */}
                          <div className="flex items-center justify-between px-[0.75vw] py-[0.5vw] border-b border-gray-100">
                            <span className="text-[0.75vw] text-gray-800 font-semibold">
                              {field.type === 'radio' ? 'Radio Button' : field.type === 'checkbox' ? 'Check Box' : 'Drop Down'}
                            </span>
                            <div className="flex items-center gap-[0.6vw]">
                              <button
                                type="button"
                                onClick={() => handleFieldChange(field.id, field.placeholder, field.label, { required: !isRequired })}
                                className="flex items-center gap-[0.25vw] cursor-pointer select-none group"
                                title="Toggle Required"
                              >
                                <div className={`w-[0.85vw] h-[0.85vw] rounded-[0.2vw] flex items-center justify-center transition-colors ${isRequired ? 'bg-[#E05638] text-white' : 'border border-gray-300 bg-white'}`}>
                                  {isRequired && <Icon icon="lucide:check" className="w-[0.65vw] h-[0.65vw] stroke-[3]" />}
                                </div>
                                <span className="text-[0.68vw] font-medium text-gray-600">
                                  Required <span className="text-red-500">*</span>
                                </span>
                              </button>
                              <div className="relative" id={`delete-menu-${field.id}`}>
                                <button
                                  onClick={(e) => { e.stopPropagation(); setActiveDeleteMenuId(activeDeleteMenuId === field.id ? null : field.id); }}
                                  className="text-gray-500 hover:text-gray-800 transition-colors p-[0.15vw] rounded-full hover:bg-gray-100"
                                  title="More Options"
                                >
                                  <Icon icon="lucide:more-vertical" width="0.95vw" />
                                </button>
                                {activeDeleteMenuId === field.id && (
                                  <div className="absolute right-0 top-[100%] mt-[0.2vw] bg-white border border-gray-200 shadow-md rounded-[0.4vw] p-[0.2vw] z-[50] min-w-[7vw]">
                                    <button
                                      onClick={(e) => { e.stopPropagation(); handleRemoveField(field.id); setActiveDeleteMenuId(null); }}
                                      className="flex items-center gap-[0.4vw] w-full px-[0.5vw] py-[0.4vw] text-red-500 hover:bg-red-50 rounded-[0.3vw] text-[0.7vw] font-medium transition-colors"
                                    >
                                      <Icon icon="lucide:trash-2" width="0.8vw" />
                                      Delete Field
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Card Body */}
                          <div className="p-[0.75vw] space-y-[0.6vw]">
                            {/* Label Row */}
                            <div className="flex items-center gap-[0.5vw]">
                              <label className="text-[0.7vw] font-medium text-gray-700 w-[3vw] shrink-0">Label :</label>
                              <input
                                type="text"
                                value={field.label || ''}
                                onChange={(e) => handleFieldChange(field.id, field.placeholder, e.target.value)}
                                className="flex-1 border border-gray-200 rounded-[0.45vw] px-[0.55vw] py-[0.35vw] text-[0.7vw] text-gray-700 outline-none focus:border-[#E05638] bg-white w-full"
                                placeholder="Enter label"
                              />
                            </div>

                            {/* Options */}
                            <div className="flex items-start gap-[0.5vw]">
                              <label className="text-[0.7vw] font-medium text-gray-700 w-[3vw] pt-[0.35vw] shrink-0">Options :</label>
                              <div className="flex-1 space-y-[0.4vw]">
                                {(field.options || []).map((opt, oIdx) => (
                                  <div key={oIdx} className="flex items-center gap-[0.35vw]">
                                    <input
                                      type="text"
                                      value={opt}
                                      onChange={(e) => handleOptionChange(field.id, oIdx, e.target.value)}
                                      className="flex-1 border border-gray-200 rounded-[0.4vw] px-[0.5vw] py-[0.25vw] text-[0.68vw] text-gray-700 outline-none focus:border-[#E05638] bg-white"
                                      placeholder={`Option ${oIdx + 1}`}
                                    />
                                    {(field.options || []).length > 1 && (
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveOption(field.id, oIdx)}
                                        className="text-gray-400 hover:text-red-500 p-[0.15vw] transition-colors"
                                      >
                                        <Trash2 size="0.75vw" />
                                      </button>
                                    )}
                                  </div>
                                ))}
                                <button
                                  type="button"
                                  onClick={() => handleAddOption(field.id)}
                                  className="flex items-center gap-[0.2vw] text-[0.65vw] text-[#E05638] hover:text-[#c94529] font-medium pt-[0.1vw]"
                                >
                                  <Plus size="0.65vw" /> Add Option
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    } else if (field.type === 'products') {
                      return (
                        <div
                          key={field.id}
                          className="bg-white border border-gray-200/90 rounded-[0.6vw] overflow-visible shadow-[0_0.1vw_0.3vw_rgba(0,0,0,0.02)]"
                        >
                          {/* Card Header */}
                          <div className="flex items-center justify-between px-[0.75vw] py-[0.5vw] border-b border-gray-100">
                            <span className="text-[0.75vw] text-gray-800 font-semibold">Select Products</span>
                            <div className="flex items-center gap-[0.6vw]">
                              <button
                                type="button"
                                onClick={() => handleFieldChange(field.id, field.placeholder, field.label, { required: !isRequired })}
                                className="flex items-center gap-[0.25vw] cursor-pointer select-none group"
                                title="Toggle Required"
                              >
                                <div className={`w-[0.85vw] h-[0.85vw] rounded-[0.2vw] flex items-center justify-center transition-colors ${isRequired ? 'bg-[#E05638] text-white' : 'border border-gray-300 bg-white'}`}>
                                  {isRequired && <Icon icon="lucide:check" className="w-[0.65vw] h-[0.65vw] stroke-[3]" />}
                                </div>
                                <span className="text-[0.68vw] font-medium text-gray-600">
                                  Required <span className="text-red-500">*</span>
                                </span>
                              </button>
                              <div className="relative" id={`delete-menu-${field.id}`}>
                                <button
                                  onClick={(e) => { e.stopPropagation(); setActiveDeleteMenuId(activeDeleteMenuId === field.id ? null : field.id); }}
                                  className="text-gray-500 hover:text-gray-800 transition-colors p-[0.15vw] rounded-full hover:bg-gray-100"
                                  title="More Options"
                                >
                                  <Icon icon="lucide:more-vertical" width="0.95vw" />
                                </button>
                                {activeDeleteMenuId === field.id && (
                                  <div className="absolute right-0 top-[100%] mt-[0.2vw] bg-white border border-gray-200 shadow-md rounded-[0.4vw] p-[0.2vw] z-[50] min-w-[7vw]">
                                    <button
                                      onClick={(e) => { e.stopPropagation(); handleRemoveField(field.id); setActiveDeleteMenuId(null); }}
                                      className="flex items-center gap-[0.4vw] w-full px-[0.5vw] py-[0.4vw] text-red-500 hover:bg-red-50 rounded-[0.3vw] text-[0.7vw] font-medium transition-colors"
                                    >
                                      <Icon icon="lucide:trash-2" width="0.8vw" />
                                      Delete Field
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Card Body */}
                          <div className="p-[0.75vw] space-y-[0.6vw]">
                            {/* Label Row */}
                            <div className="flex items-center gap-[0.5vw]">
                              <label className="text-[0.7vw] font-medium text-gray-700 w-[3vw] shrink-0">Label :</label>
                              <input
                                type="text"
                                value={field.label || ''}
                                onChange={(e) => handleFieldChange(field.id, field.placeholder, e.target.value)}
                                className="flex-1 border border-gray-200 rounded-[0.45vw] px-[0.55vw] py-[0.35vw] text-[0.7vw] text-gray-700 outline-none focus:border-[#E05638] bg-white w-full"
                                placeholder="Select Products"
                              />
                            </div>

                            {/* Quantity Toggle Row */}
                            <div className="flex items-center justify-between py-[0.2vw] px-[0.3vw] bg-gray-50/70 rounded-[0.4vw] border border-gray-100">
                              <span className="text-[0.68vw] font-medium text-gray-700">Enable Quantity Selector</span>
                              <Switch
                                enabled={field.showQuantity !== false}
                                onChange={(val) => handleFieldChange(field.id, field.placeholder, field.label, { showQuantity: val })}
                              />
                            </div>

                            {/* Category-Grouped Products Section */}
                            <div className="space-y-[0.5vw]">
                              <div className="flex items-center justify-between">
                                <label className="text-[0.68vw] font-medium text-gray-700">Product Categories & Items :</label>
                                <button
                                  type="button"
                                  onClick={() => handleAddCategoryGroup(field.id)}
                                  className="flex items-center gap-[0.2vw] px-[0.45vw] py-[0.2vw] bg-orange-50 hover:bg-orange-100 text-[#E05638] rounded-[0.35vw] text-[0.62vw] font-medium transition-colors"
                                  title="Add a new category"
                                >
                                  <Plus size="0.65vw" /> Add Category
                                </button>
                              </div>

                              {(() => {
                                const productsList = field.products || [];
                                const categories = [];
                                productsList.forEach(p => {
                                  const cat = (p.category || 'Product category 1').trim();
                                  if (!categories.includes(cat)) {
                                    categories.push(cat);
                                  }
                                });
                                if (categories.length === 0) categories.push('Product category 1');

                                return categories.map((catName, cIdx) => (
                                  <CategoryGroupItem
                                    key={`cat-${cIdx}`}
                                    catName={catName}
                                    cIdx={cIdx}
                                    fieldId={field.id}
                                    productsList={productsList}
                                    categoriesCount={categories.length}
                                    onRenameCategory={handleRenameCategory}
                                    onAddProduct={handleAddProductItem}
                                    onDeleteCategory={handleDeleteCategoryGroup}
                                    onProductChange={handleProductChange}
                                    onProductImageUpload={handleProductImageUpload}
                                    onRemoveProduct={handleRemoveProductItem}
                                    uploadingProductImgId={uploadingProductImgId}
                                  />
                                ));
                              })()}
                            </div>
                          </div>
                        </div>
                      );
                    } else if (field.type === 'rating') {
                      return (
                        <div
                          key={field.id}
                          className="bg-white border border-gray-200/90 rounded-[0.6vw] overflow-visible shadow-[0_0.1vw_0.3vw_rgba(0,0,0,0.02)]"
                        >
                          {/* Card Header */}
                          <div className="flex items-center justify-between px-[0.75vw] py-[0.5vw] border-b border-gray-100">
                            <span className="text-[0.75vw] text-gray-800 font-semibold">Ratings</span>
                            <div className="flex items-center gap-[0.6vw]">
                              <button
                                type="button"
                                onClick={() => handleFieldChange(field.id, field.placeholder, field.label, { required: !isRequired })}
                                className="flex items-center gap-[0.25vw] cursor-pointer select-none group"
                                title="Toggle Required"
                              >
                                <div className={`w-[0.85vw] h-[0.85vw] rounded-[0.2vw] flex items-center justify-center transition-colors ${isRequired ? 'bg-[#E05638] text-white' : 'border border-gray-300 bg-white'}`}>
                                  {isRequired && <Icon icon="lucide:check" className="w-[0.65vw] h-[0.65vw] stroke-[3]" />}
                                </div>
                                <span className="text-[0.68vw] font-medium text-gray-600">
                                  Required <span className="text-red-500">*</span>
                                </span>
                              </button>
                              <div className="relative" id={`delete-menu-${field.id}`}>
                                <button
                                  onClick={(e) => { e.stopPropagation(); setActiveDeleteMenuId(activeDeleteMenuId === field.id ? null : field.id); }}
                                  className="text-gray-500 hover:text-gray-800 transition-colors p-[0.15vw] rounded-full hover:bg-gray-100"
                                  title="More Options"
                                >
                                  <Icon icon="lucide:more-vertical" width="0.95vw" />
                                </button>
                                {activeDeleteMenuId === field.id && (
                                  <div className="absolute right-0 top-[100%] mt-[0.2vw] bg-white border border-gray-200 shadow-md rounded-[0.4vw] p-[0.2vw] z-[50] min-w-[7vw]">
                                    <button
                                      onClick={(e) => { e.stopPropagation(); handleRemoveField(field.id); setActiveDeleteMenuId(null); }}
                                      className="flex items-center gap-[0.4vw] w-full px-[0.5vw] py-[0.4vw] text-red-500 hover:bg-red-50 rounded-[0.3vw] text-[0.7vw] font-medium transition-colors"
                                    >
                                      <Icon icon="lucide:trash-2" width="0.8vw" />
                                      Delete Field
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Card Body */}
                          <div className="p-[0.75vw] space-y-[0.6vw]">
                            {/* Label Row */}
                            <div className="flex items-center gap-[0.5vw]">
                              <label className="text-[0.7vw] font-medium text-gray-700 w-[3vw] shrink-0">Label :</label>
                              <input
                                type="text"
                                value={field.label || ''}
                                onChange={(e) => handleFieldChange(field.id, field.placeholder, e.target.value)}
                                className="flex-1 border border-gray-200 rounded-[0.45vw] px-[0.55vw] py-[0.35vw] text-[0.7vw] text-gray-700 outline-none focus:border-[#E05638] bg-white w-full"
                                placeholder="Provide Ratings"
                              />
                            </div>

                            {/* Input Row */}
                            <div className="flex items-center gap-[0.5vw]">
                              <label className="text-[0.7vw] font-medium text-gray-700 w-[3vw] shrink-0">Input :</label>
                              <div className="flex items-center gap-[0.3vw]">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Icon key={star} icon="lucide:star" className="w-[1.3vw] h-[1.3vw] text-yellow-400 stroke-[1.5]" />
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    } else if (field.type === 'feedback') {
                      return (
                        <div
                          key={field.id}
                          className="bg-white border border-gray-200/90 rounded-[0.6vw] overflow-visible shadow-[0_0.1vw_0.3vw_rgba(0,0,0,0.02)]"
                        >
                          {/* Card Header */}
                          <div className="flex items-center justify-between px-[0.75vw] py-[0.5vw] border-b border-gray-100">
                            <span className="text-[0.75vw] text-gray-800 font-semibold">Text Area</span>
                            <div className="flex items-center gap-[0.6vw]">
                              <button
                                type="button"
                                onClick={() => handleFieldChange(field.id, field.placeholder, field.label, { required: !isRequired })}
                                className="flex items-center gap-[0.25vw] cursor-pointer select-none group"
                                title="Toggle Required"
                              >
                                <div className={`w-[0.85vw] h-[0.85vw] rounded-[0.2vw] flex items-center justify-center transition-colors ${isRequired ? 'bg-[#E05638] text-white' : 'border border-gray-300 bg-white'}`}>
                                  {isRequired && <Icon icon="lucide:check" className="w-[0.65vw] h-[0.65vw] stroke-[3]" />}
                                </div>
                                <span className="text-[0.68vw] font-medium text-gray-600">
                                  Required <span className="text-red-500">*</span>
                                </span>
                              </button>
                              <div className="relative" id={`delete-menu-${field.id}`}>
                                <button
                                  onClick={(e) => { e.stopPropagation(); setActiveDeleteMenuId(activeDeleteMenuId === field.id ? null : field.id); }}
                                  className="text-gray-500 hover:text-gray-800 transition-colors p-[0.15vw] rounded-full hover:bg-gray-100"
                                  title="More Options"
                                >
                                  <Icon icon="lucide:more-vertical" width="0.95vw" />
                                </button>
                                {activeDeleteMenuId === field.id && (
                                  <div className="absolute right-0 top-[100%] mt-[0.2vw] bg-white border border-gray-200 shadow-md rounded-[0.4vw] p-[0.2vw] z-[50] min-w-[7vw]">
                                    <button
                                      onClick={(e) => { e.stopPropagation(); handleRemoveField(field.id); setActiveDeleteMenuId(null); }}
                                      className="flex items-center gap-[0.4vw] w-full px-[0.5vw] py-[0.4vw] text-red-500 hover:bg-red-50 rounded-[0.3vw] text-[0.7vw] font-medium transition-colors"
                                    >
                                      <Icon icon="lucide:trash-2" width="0.8vw" />
                                      Delete Field
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Card Body */}
                          <div className="p-[0.75vw] space-y-[0.6vw]">
                            {/* Label Row */}
                            <div className="flex items-center gap-[0.5vw]">
                              <label className="text-[0.7vw] font-medium text-gray-700 w-[3vw] shrink-0">Label :</label>
                              <input
                                type="text"
                                value={field.label || ''}
                                onChange={(e) => handleFieldChange(field.id, field.placeholder, e.target.value)}
                                className="flex-1 border border-gray-200 rounded-[0.45vw] px-[0.55vw] py-[0.35vw] text-[0.7vw] text-gray-700 outline-none focus:border-[#E05638] bg-white w-full"
                                placeholder="Enter label"
                              />
                            </div>

                            {/* Input Row */}
                            <div className="flex items-center gap-[0.5vw]">
                              <label className="text-[0.7vw] font-medium text-gray-700 w-[3vw] shrink-0">Input :</label>
                              <input
                                type="text"
                                value={field.placeholder || ''}
                                onChange={(e) => handleFieldChange(field.id, e.target.value, field.label)}
                                className="flex-1 border border-gray-200 rounded-[0.45vw] px-[0.55vw] py-[0.35vw] text-[0.7vw] text-gray-700 outline-none focus:border-[#E05638] bg-white w-full"
                                placeholder="Enter your Name"
                              />
                            </div>
                          </div>
                        </div>
                      );
                    }

                    // Default Input Box (Text, email, phone, company, etc.)
                    return (
                      <div
                        key={field.id}
                        className="bg-white border border-gray-200/90 rounded-[0.6vw] overflow-visible shadow-[0_0.1vw_0.3vw_rgba(0,0,0,0.02)]"
                      >
                        {/* Card Header */}
                        <div className="flex items-center justify-between px-[0.75vw] py-[0.5vw] border-b border-gray-100">
                          <span className="text-[0.75vw] text-gray-800 font-semibold">Input Box</span>
                          <div className="flex items-center gap-[0.6vw]">
                            <button
                              type="button"
                              onClick={() => handleFieldChange(field.id, field.placeholder, field.label, { required: !isRequired })}
                              className="flex items-center gap-[0.25vw] cursor-pointer select-none group"
                              title="Toggle Required"
                            >
                              <div className={`w-[0.85vw] h-[0.85vw] rounded-[0.2vw] flex items-center justify-center transition-colors ${isRequired ? 'bg-[#E05638] text-white' : 'border border-gray-300 bg-white'}`}>
                                {isRequired && <Icon icon="lucide:check" className="w-[0.65vw] h-[0.65vw] stroke-[3]" />}
                              </div>
                              <span className="text-[0.68vw] font-medium text-gray-600">
                                Required <span className="text-red-500">*</span>
                              </span>
                            </button>
                            <div className="relative" id={`delete-menu-${field.id}`}>
                              <button
                                onClick={(e) => { e.stopPropagation(); setActiveDeleteMenuId(activeDeleteMenuId === field.id ? null : field.id); }}
                                className="text-gray-500 hover:text-gray-800 transition-colors p-[0.15vw] rounded-full hover:bg-gray-100"
                                title="More Options"
                              >
                                <Icon icon="lucide:more-vertical" width="0.95vw" />
                              </button>
                              {activeDeleteMenuId === field.id && (
                                <div className="absolute right-0 top-[100%] mt-[0.2vw] bg-white border border-gray-200 shadow-md rounded-[0.4vw] p-[0.2vw] z-[50] min-w-[7vw]">
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleRemoveField(field.id); setActiveDeleteMenuId(null); }}
                                    className="flex items-center gap-[0.4vw] w-full px-[0.5vw] py-[0.4vw] text-red-500 hover:bg-red-50 rounded-[0.3vw] text-[0.7vw] font-medium transition-colors"
                                  >
                                    <Icon icon="lucide:trash-2" width="0.8vw" />
                                    Delete Field
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Card Body */}
                        <div className="p-[0.75vw] space-y-[0.6vw]">
                          {/* Label Row */}
                          <div className="flex items-center gap-[0.5vw] relative" id={`dropdown-container-${field.id}`}>
                            <label className="text-[0.7vw] font-medium text-gray-700 w-[3vw] shrink-0">Label :</label>
                            <div className="flex-1 flex items-center border border-gray-200 rounded-[0.45vw] focus-within:border-[#E05638] bg-white">
                              {/* Dropdown Trigger Box */}
                              <div
                                className="h-[1.9vw] px-[0.45vw] border-r border-gray-200 flex items-center justify-center cursor-pointer bg-gray-50/60 rounded-l-[0.45vw] hover:bg-gray-100 gap-[0.2vw]"
                                onClick={() => setActiveDropdownId(activeDropdownId === field.id ? null : field.id)}
                              >
                                {field.type === 'email' ? (
                                  <Icon icon="logos:google-gmail" width="0.85vw" />
                                ) : field.type === 'name' ? (
                                  <Icon icon="lucide:user" width="0.85vw" className="text-gray-900" />
                                ) : field.type === 'company' ? (
                                  <Icon icon="lucide:building-2" width="0.85vw" className="text-gray-900" />
                                ) : field.type === 'phone' ? (
                                  <Icon icon="lucide:phone" width="0.85vw" className="text-gray-700" />
                                ) : field.type === 'services' ? (
                                  <Icon icon="lucide:settings" width="0.85vw" className="text-gray-900" />
                                ) : field.type === 'enquiry' || field.type === 'feedback' ? (
                                  <Icon icon="lucide:message-square" width="0.85vw" className="text-gray-900" />
                                ) : (
                                  <Icon icon="lucide:user" width="0.85vw" className="text-gray-900" />
                                )}
                                <Icon icon="fluent:chevron-down-12-regular" width="0.65vw" className="text-gray-500" />
                              </div>

                              {/* Dropdown Content */}
                              {activeDropdownId === field.id && (
                                <div className="absolute top-[2.2vw] left-[3.5vw] z-50 bg-white rounded-[0.5vw] shadow-lg p-[0.4vw] w-[10.5vw] border border-gray-100 animate-in fade-in zoom-in-95 duration-100">
                                  <div className="space-y-[0.3vw]">
                                    {fieldOptions
                                      .filter(opt => !settings.fields.some(f => f.type === opt.type && f.id !== field.id))
                                      .map((opt) => (
                                        <div
                                          key={opt.type}
                                          className="flex items-center gap-[0.6vw] p-[0.4vw] hover:bg-gray-50 rounded-[0.3vw] cursor-pointer"
                                          onMouseDown={(e) => {
                                            e.stopPropagation();
                                            handleTypeChange(field.id, opt.type);
                                          }}
                                        >
                                          {opt.type === 'email' ? (
                                            <Icon icon="logos:google-gmail" width="0.85vw" />
                                          ) : (
                                            <Icon icon={opt.icon} width="0.85vw" className="text-gray-600" />
                                          )}
                                          <span className="text-[0.68vw] font-medium text-gray-700">{opt.label}</span>
                                        </div>
                                      ))}
                                  </div>
                                </div>
                              )}

                              {/* Label Input */}
                              <input
                                type="text"
                                value={field.label !== undefined ? field.label : (fieldOptions.find(o => o.type === field.type)?.label || field.type)}
                                onChange={(e) => handleFieldChange(field.id, field.placeholder, e.target.value)}
                                className="flex-1 px-[0.55vw] py-[0.35vw] text-[0.7vw] text-gray-700 outline-none bg-transparent h-[1.9vw] w-full normal-case"
                                placeholder="Full Name"
                                disabled={field.type === 'empty'}
                              />
                            </div>
                          </div>

                          {/* Input Placeholder Row */}
                          <div className="flex items-center gap-[0.5vw]">
                            <label className="text-[0.7vw] font-medium text-gray-700 w-[3vw] shrink-0">Input :</label>
                            <input
                              type="text"
                              value={field.placeholder || ''}
                              onChange={(e) => handleFieldChange(field.id, e.target.value, field.label)}
                              placeholder={field.type === 'empty' ? 'Select a type...' : (field.placeholder || `Enter your ${field.type === 'email' ? 'Email' : fieldOptions.find(o => o.type === field.type)?.label || field.type}`)}
                              className="flex-1 border border-gray-200 rounded-[0.45vw] px-[0.55vw] py-[0.35vw] text-[0.7vw] text-gray-700 outline-none focus:border-[#E05638] h-[1.9vw] bg-white w-full normal-case"
                              disabled={field.type === 'empty'}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Add Lead Field Button (Styled as Screenshot 2) */}
                  <button
                    type="button"
                    onClick={() => setIsAddFieldPopupOpen(true)}
                    className="w-full flex items-center justify-center gap-[0.35vw] py-[0.55vw] bg-[#FFF5F3] border border-[#E05638]/40 hover:border-[#E05638] rounded-[0.45vw] text-[#E05638] hover:bg-[#FFEBE7] transition-all shadow-[0_0.1vw_0.2vw_rgba(224,86,56,0.04)] mt-[0.6vw]"
                  >
                    <Plus size="0.85vw" className="stroke-[2.5]" />
                    <span className="text-[0.72vw] font-medium tracking-wide">Add Lead Field</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Form Appearance Accordion Card */}
          <div className="bg-white rounded-[0.8vw] border border-gray-200/90 shadow-[0_0.2vw_0.8vw_rgba(0,0,0,0.04)] overflow-hidden">
            {/* Accordion Header */}
            <button
              type="button"
              onClick={() => setIsColorOpen(!isColorOpen)}
              className="w-full flex items-center justify-between p-[0.9vw] bg-white hover:bg-gray-50/50 transition-colors"
            >
              <div className="flex flex-col text-left">
                <span className="text-[0.82vw] font-semibold text-gray-800 leading-tight">Form Appearance</span>
                <span className="text-[0.65vw] text-gray-500 font-normal mt-[0.1vw]">Customize colors for your form.</span>
              </div>
              <Icon
                icon="fluent:chevron-down-12-regular"
                className={`w-[0.9vw] h-[0.9vw] text-gray-400 transition-transform duration-200 ${isColorOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {isColorOpen && (
              <div className="p-[0.9vw] pt-[0.4vw] border-t border-gray-100 space-y-[0.8vw]">
                {/* Text Properties */}
                  <div className="space-y-[0.75vw] ">
                    <div className="flex items-center gap-[0.5vw]">
                      <h4 className="text-[0.75vw] font-semibold text-gray-900 whitespace-nowrap pb-[0.5vw]">Text Properties</h4>
                      <div className="h-[0.0925vw] bg-gray-200 flex-1" style={{ marginRight: '-1.1vw' }}> </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[0.7vw] font-semibold text-gray-900">Choose the Text Style:</span>
                      <PremiumDropdown
                        options={fontFamilies}
                        value={settings.appearance.fontStyle}
                        onChange={(val) => updateAppearance('fontStyle', val)}
                        width="8.5vw"
                        isFont={true}
                        buttonClassName="!border-gray-600 !rounded-[0.5vw]"
                        align="right"
                      />
                    </div>
                    <ColorPickerItem
                      label="Fill :"
                      color={settings.appearance.textFill}
                      opacity={settings.appearance.textFillOpacity ?? 100}
                      onChange={(val) => updateAppearance('textFill', val)}
                      onOpacityChange={(val) => updateAppearance('textFillOpacity', val)}
                    />
                    <ColorPickerItem
                      label="Stroke :"
                      color={settings.appearance.textStroke}
                      opacity={settings.appearance.textStrokeOpacity ?? 100}
                      onChange={(val) => updateAppearance('textStroke', val)}
                      onOpacityChange={(val) => updateAppearance('textStrokeOpacity', val)}
                    />
                  </div>

                  {/* Background Color */}
                  <div className="space-y-[0.75vw]">
                    <div className="flex items-center gap-[0.5vw]">
                      <h4 className="text-[0.75vw] font-semibold text-gray-900 whitespace-nowrap pb-[0.5vw]">Background Color</h4>
                      <div className="h-[0.0925vw] bg-gray-200 flex-1" style={{ marginRight: '-1vw' }}> </div>
                    </div>
                    <ColorPickerItem
                      label="Fill :"
                      color={settings.appearance.bgFill}
                      opacity={settings.appearance.bgFillOpacity ?? 100}
                      onChange={(val) => updateAppearance('bgFill', val)}
                      onOpacityChange={(val) => updateAppearance('bgStrokeOpacity', val)}
                    />
                    <ColorPickerItem
                      label="Stroke :"
                      color={settings.appearance.bgStroke}
                      opacity={settings.appearance.bgStrokeOpacity ?? 100}
                      onChange={(val) => updateAppearance('bgStroke', val)}
                      onOpacityChange={(val) => updateAppearance('bgStrokeOpacity', val)}
                    />
                  </div>

                  {/* Button */}
                  <div className="space-y-[0.75vw]">
                    <div className="flex items-center gap-[0.5vw]">
                      <h4 className="text-[0.75vw] font-semibold text-gray-900 whitespace-nowrap pb-[0.5vw]">Button</h4>
                      <div className="h-[0.0925vw] bg-gray-200 flex-1" style={{ marginRight: '-1vw' }}> </div>
                    </div>
                    <ColorPickerItem
                      label="Fill :"
                      color={settings.appearance.btnFill}
                      opacity={settings.appearance.btnFillOpacity ?? 100}
                      onChange={(val) => updateAppearance('btnFill', val)}
                      onOpacityChange={(val) => updateAppearance('btnFillOpacity', val)}
                    />
                    <ColorPickerItem
                      label="Stroke :"
                      color={settings.appearance.btnStroke}
                      opacity={settings.appearance.btnStrokeOpacity ?? 100}
                      onChange={(val) => updateAppearance('btnStroke', val)}
                      onOpacityChange={(val) => updateAppearance('btnStrokeOpacity', val)}
                    />
                    <ColorPickerItem
                      label="Text :"
                      color={settings.appearance.btnText}
                      opacity={settings.appearance.btnTextOpacity ?? 100}
                      onChange={(val) => updateAppearance('btnText', val)}
                      onOpacityChange={(val) => updateAppearance('btnTextOpacity', val)}
                    />
                  </div>

                  {/* Skip / Close Button Colors */}
                  {settings.appearance.allowSkip && (
                    <div className="space-y-[0.75vw]">
                      <div className="flex items-center gap-[0.5vw]">
                        <h4 className="text-[0.75vw] font-semibold text-gray-900 whitespace-nowrap pb-[0.5vw]">Skip / Cancel Button</h4>
                        <div className="h-[0.0925vw] bg-gray-200 flex-1" style={{ marginRight: '-1vw' }}> </div>
                      </div>
                      <ColorPickerItem
                        label="Color :"
                        color={settings.appearance.skipColor || '#3E4491'}
                        opacity={settings.appearance.skipOpacity ?? 100}
                        onChange={(val) => updateAppearance('skipColor', val)}
                        onOpacityChange={(val) => updateAppearance('skipOpacity', val)}
                      />
                      {settings.appearance.skipType === 'icon' && (
                        <>
                          <ColorPickerItem
                            label="Fill :"
                            color={settings.appearance.skipBgFill || 'transparent'}
                            opacity={settings.appearance.skipBgFillOpacity ?? 100}
                            onChange={(val) => updateAppearance('skipBgFill', val)}
                            onOpacityChange={(val) => updateAppearance('skipBgFillOpacity', val)}
                          />
                          <ColorPickerItem
                            label="Stroke :"
                            color={settings.appearance.skipBgStroke || 'transparent'}
                            opacity={settings.appearance.skipBgStrokeOpacity ?? 100}
                            onChange={(val) => updateAppearance('skipBgStroke', val)}
                            onOpacityChange={(val) => updateAppearance('skipBgStrokeOpacity', val)}
                          />
                        </>
                      )}
                    </div>
                  )}
              </div>
            )}
          </div>

          {/* Form Display Setting Accordion Card */}
          <div className="bg-white rounded-[0.8vw] border border-gray-200/90 shadow-[0_0.2vw_0.8vw_rgba(0,0,0,0.04)] overflow-hidden">
            {/* Accordion Header */}
            <button
              type="button"
              onClick={() => setIsEnquiryBtnOpen(!isEnquiryBtnOpen)}
              className="w-full flex items-center justify-between p-[0.9vw] bg-white hover:bg-gray-50/50 transition-colors"
            >
              <div className="flex flex-col text-left">
                <span className="text-[0.82vw] font-semibold text-gray-800 leading-tight">Form Display Setting</span>
                <span className="text-[0.65vw] text-gray-500 font-normal mt-[0.1vw]">Choose where to display the form.</span>
              </div>
              <Icon
                icon="fluent:chevron-down-12-regular"
                className={`w-[0.9vw] h-[0.9vw] text-gray-400 transition-transform duration-200 ${isEnquiryBtnOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {isEnquiryBtnOpen && (
              <div className="p-[0.9vw] pt-[0.4vw] border-t border-gray-100 space-y-[0.8vw]">
                {/* Add Enquiry Button in Layout */}
                <div className="flex items-center justify-between pt-[0.2vw]">
                  <div className="flex items-center gap-[0.5vw] flex-1 mr-[0.8vw]">
                    <span className="text-[0.72vw] font-semibold text-gray-900 whitespace-nowrap">Add Enquiry Button in Layout</span>
                    <div className="h-[1px] bg-gray-200 flex-1"></div>
                  </div>
                  <Switch
                    enabled={settings.enquiryButton?.enabled !== false}
                    onChange={(val) => updateNested('enquiryButton', 'enabled', val)}
                  />
                </div>

                {settings.enquiryButton?.enabled !== false && (
                  <div className="space-y-[0.8vw] pt-[0.2vw]">
                    {/* Button Icon & Add Text in button row */}
                    <div className="grid grid-cols-2 gap-[0.8vw] items-start">
                      {/* Button Icon selector */}
                      <div className="flex flex-col gap-[0.3vw] relative">
                        <span className="text-[0.7vw] font-medium text-gray-800">Button Icon</span>
                        <div
                          onClick={() => setIsIconPickerOpen(!isIconPickerOpen)}
                          className="w-full h-[4vw] border border-gray-200 hover:border-gray-300 rounded-[0.5vw] bg-white flex items-center justify-center cursor-pointer relative shadow-xs transition-colors group"
                        >
                          <Icon
                            icon={settings.enquiryButton?.icon && settings.enquiryButton?.icon !== 'none' ? settings.enquiryButton.icon : 'lucide:message-square'}
                            className="w-[1.6vw] h-[1.6vw] text-gray-700"
                          />
                          <div className="absolute top-[0.3vw] right-[0.4vw] text-gray-400 group-hover:text-gray-600 transition-colors" title="Change icon">
                            <Icon icon="lucide:arrow-left-right" className="w-[0.75vw] h-[0.75vw]" />
                          </div>
                        </div>

                        {/* Icon picker flyout */}
                        {isIconPickerOpen && (
                          <div className="absolute top-[5.2vw] left-0 z-50 bg-white rounded-[0.5vw] shadow-lg p-[0.5vw] w-[13vw] border border-gray-200 animate-in fade-in zoom-in-95 duration-100">
                            <div className="flex items-center justify-between pb-[0.3vw] mb-[0.3vw] border-b border-gray-100">
                              <span className="text-[0.65vw] font-semibold text-gray-700">Select Icon</span>
                              <button
                                type="button"
                                onClick={() => setIsIconPickerOpen(false)}
                                className="text-gray-400 hover:text-gray-600"
                              >
                                <Icon icon="lucide:x" className="w-[0.75vw] h-[0.75vw]" />
                              </button>
                            </div>
                            <div className="grid grid-cols-4 gap-[0.3vw]">
                              {[
                                { id: 'lucide:message-square', label: 'Message' },
                                { id: 'lucide:mail', label: 'Mail' },
                                { id: 'lucide:phone', label: 'Phone' },
                                { id: 'lucide:send', label: 'Send' },
                                { id: 'lucide:help-circle', label: 'Help' },
                                { id: 'lucide:user-check', label: 'Contact' },
                                { id: 'lucide:clipboard-list', label: 'Form' },
                                { id: 'lucide:info', label: 'Info' }
                              ].map(item => (
                                <button
                                  key={item.id}
                                  type="button"
                                  onClick={() => {
                                    updateNested('enquiryButton', 'icon', item.id);
                                    setIsIconPickerOpen(false);
                                  }}
                                  className={`flex flex-col items-center justify-center p-[0.35vw] rounded-[0.35vw] border transition-all ${(settings.enquiryButton?.icon || 'lucide:message-square') === item.id
                                      ? 'border-[#E05638] bg-orange-50 text-[#E05638]'
                                      : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                                    }`}
                                  title={item.label}
                                >
                                  <Icon icon={item.id} className="w-[1vw] h-[1vw]" />
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Add Text in button */}
                      <div className="flex flex-col gap-[0.3vw]">
                        <div className="flex items-center justify-between h-[1.3vw]">
                          <span className="text-[0.7vw] font-medium text-gray-800">Add Text in button</span>
                          <Switch
                            enabled={settings.enquiryButton?.showText !== false}
                            onChange={(val) => updateNested('enquiryButton', 'showText', val)}
                          />
                        </div>
                        <input
                          type="text"
                          value={settings.enquiryButton?.text !== undefined ? settings.enquiryButton.text : 'Enquiry Now'}
                          onChange={(e) => updateNested('enquiryButton', 'text', e.target.value)}
                          placeholder="Enquiry Now"
                          disabled={settings.enquiryButton?.showText === false}
                          className={`w-full border border-gray-200 rounded-[0.5vw] px-[0.6vw] py-[0.55vw] text-[0.7vw] text-gray-700 outline-none focus:border-[#E05638] bg-white shadow-xs placeholder:text-gray-400 ${settings.enquiryButton?.showText === false ? 'opacity-40 cursor-not-allowed bg-gray-50' : ''}`}
                        />
                      </div>
                    </div>

                    {/* Color Customizations */}
                    <div className="space-y-[0.5vw] pt-[0.2vw]">
                      <ColorPickerItem
                        label="Icon Color :"
                        color={settings.enquiryButton?.iconColor || '#FFFFFF'}
                        opacity={settings.enquiryButton?.iconOpacity ?? 100}
                        onChange={(val) => updateNested('enquiryButton', 'iconColor', val)}
                        onOpacityChange={(val) => updateNested('enquiryButton', 'iconOpacity', val)}
                      />
                      <ColorPickerItem
                        label="Text Color :"
                        color={settings.enquiryButton?.textColor || '#FFFFFF'}
                        opacity={settings.enquiryButton?.textOpacity ?? 100}
                        onChange={(val) => updateNested('enquiryButton', 'textColor', val)}
                        onOpacityChange={(val) => updateNested('enquiryButton', 'textOpacity', val)}
                      />
                      <ColorPickerItem
                        label="Button Color :"
                        color={settings.enquiryButton?.bgFill || '#E05638'}
                        opacity={settings.enquiryButton?.bgOpacity ?? 100}
                        onChange={(val) => updateNested('enquiryButton', 'bgFill', val)}
                        onOpacityChange={(val) => updateNested('enquiryButton', 'bgOpacity', val)}
                      />
                    </div>

                    {/* Where Should Button Appear */}
                    <div className="space-y-[0.4vw] pt-[0.3vw]">
                      <span className="text-[0.72vw] font-medium text-gray-700">Where Should Button Appear</span>
                      <div className="grid grid-cols-2 gap-[0.5vw]">
                        {[
                          { id: 'top-left', label: 'Top Left', icon: 'lucide:arrow-up-left' },
                          { id: 'top-right', label: 'Top Right', icon: 'lucide:arrow-up-right' },
                          { id: 'bottom-left', label: 'Bottom Left', icon: 'lucide:arrow-down-left' },
                          { id: 'bottom-right', label: 'Bottom Right', icon: 'lucide:arrow-down-right' }
                        ].map(pos => {
                          const currentPos = settings.enquiryButton?.position || 'bottom-right';
                          const isSelected = currentPos === pos.id;
                          return (
                            <button
                              key={pos.id}
                              type="button"
                              onClick={() => updateNested('enquiryButton', 'position', pos.id)}
                              className={`flex items-center justify-center gap-[0.3vw] py-[0.55vw] px-[0.6vw] border rounded-[0.5vw] text-[0.68vw] font-medium transition-all ${isSelected
                                  ? 'border-[#E05638] bg-orange-50 text-[#E05638] shadow-xs'
                                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:text-gray-800'
                                }`}
                            >
                              <Icon icon={pos.icon} className="w-[0.85vw] h-[0.85vw]" />
                              <span>{pos.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Lead form should Appears at */}
                <div className="space-y-[0.6vw] pt-[0.4vw] border-t border-gray-100">
                  <div className="flex items-center gap-[0.5vw]">
                    <span className="text-[0.72vw] font-semibold text-gray-900 whitespace-nowrap">Lead form should Appears at</span>
                    <div className="h-[1px] bg-gray-200 flex-1"></div>
                  </div>

                  <div className="space-y-[0.5vw] pl-[0.2vw]">
                    {[
                      { id: 'before', label: 'Before opening the flipbook' },
                      { id: 'after-pages', label: 'Show on selected page' },
                      { id: 'after-seconds', label: 'After X seconds' },
                      { id: 'end', label: 'At the end of the flipbook' }
                    ].map((opt) => {
                      const isSelected = settings.appearance.timing === opt.id;
                      return (
                        <div key={opt.id} className="space-y-[0.4vw]">
                          <label className="flex items-center gap-[0.6vw] cursor-pointer group w-fit select-none">
                            <div className="relative flex items-center justify-center">
                              <input
                                type="radio"
                                name="timing"
                                checked={isSelected}
                                onChange={() => updateAppearance('timing', opt.id)}
                                className="peer appearance-none w-[1vw] h-[1vw] border-[1.5px] border-gray-400 rounded-full checked:border-[#E05638] transition-all bg-transparent"
                              />
                              <div className="absolute w-[0.5vw] h-[0.5vw] bg-[#E05638] rounded-full scale-0 peer-checked:scale-100 transition-transform" />
                            </div>
                            <span className={`text-[0.72vw] transition-colors ${isSelected ? 'text-gray-900 font-medium' : 'text-gray-600 group-hover:text-gray-800'}`}>
                              {opt.label}
                            </span>
                          </label>

                          {opt.id === 'after-pages' && isSelected && (
                            <div className="ml-[1.6vw] mt-[0.2vw]">
                              <div className="relative inline-block w-[6.5vw]">
                                <select
                                  value={settings.appearance.afterPages || 1}
                                  onChange={(e) => updateAppearance('afterPages', parseInt(e.target.value))}
                                  className="w-full appearance-none bg-white border border-gray-200 shadow-xs rounded-[0.4vw] py-[0.35vw] pl-[0.6vw] pr-[1.8vw] text-[0.7vw] text-gray-800 font-medium focus:outline-none focus:border-[#E05638] cursor-pointer"
                                >
                                  {pages.length > 0 ? (
                                    pages.map((_, idx) => (
                                      <option key={idx} value={idx + 1}>Page {idx + 1}</option>
                                    ))
                                  ) : (
                                    [1, 2, 3, 4, 5].map(num => (
                                      <option key={num} value={num}>Page {num}</option>
                                    ))
                                  )}
                                </select>
                                <div className="absolute right-[0.5vw] top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                  <Icon icon="fluent:chevron-down-12-regular" className="w-[0.8vw] h-[0.8vw]" />
                                </div>
                              </div>
                            </div>
                          )}

                          {opt.id === 'after-seconds' && isSelected && (
                            <div className="ml-[1.6vw] mt-[0.2vw] flex items-center border border-gray-200 rounded-[0.4vw] px-[0.6vw] py-[0.3vw] bg-white w-fit gap-[0.5vw] shadow-xs">
                              <button
                                type="button"
                                onClick={() => updateAppearance('afterSeconds', Math.max(1, (settings.appearance.afterSeconds || 30) - 1))}
                                className="text-gray-600 hover:text-gray-900 transition-colors p-[0.1vw]"
                              >
                                <Icon icon="lucide:play" className="w-[0.7vw] h-[0.7vw] rotate-180 fill-current text-gray-600" />
                              </button>
                              <span className="text-[0.72vw] text-gray-800 font-semibold min-w-[1.2vw] text-center">
                                {settings.appearance.afterSeconds || 30}
                              </span>
                              <button
                                type="button"
                                onClick={() => updateAppearance('afterSeconds', (settings.appearance.afterSeconds || 30) + 1)}
                                className="text-gray-600 hover:text-gray-900 transition-colors p-[0.1vw]"
                              >
                                <Icon icon="lucide:play" className="w-[0.7vw] h-[0.7vw] fill-current text-gray-600" />
                              </button>
                              <span className="text-[0.7vw] text-gray-600 ml-[0.2vw]">Seconds</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Lead Form Mode */}
                <div className="space-y-[0.6vw] pt-[0.4vw] border-t border-gray-100">
                  <div className="flex items-center gap-[0.5vw]">
                    <span className="text-[0.72vw] font-semibold text-gray-900 whitespace-nowrap">Lead Form Mode</span>
                    <div className="h-[1px] bg-gray-200 flex-1"></div>
                  </div>

                  <div className="space-y-[0.5vw] pl-[0.2vw]">
                    {/* Mandatory */}
                    <label className="flex items-center gap-[0.6vw] cursor-pointer group w-fit select-none">
                      <div className="relative flex items-center justify-center">
                        <input
                          type="radio"
                          name="allowSkip"
                          checked={!settings.appearance.allowSkip}
                          onChange={() => updateAppearance('allowSkip', false)}
                          className="peer appearance-none w-[1vw] h-[1vw] border-[1.5px] border-gray-400 rounded-full checked:border-[#E05638] transition-all bg-transparent"
                        />
                        <div className="absolute w-[0.5vw] h-[0.5vw] bg-[#E05638] rounded-full scale-0 peer-checked:scale-100 transition-transform" />
                      </div>
                      <span className={`text-[0.72vw] transition-colors ${!settings.appearance.allowSkip ? 'text-gray-900 font-medium' : 'text-gray-600 group-hover:text-gray-800'}`}>
                        Mandatory (Require Submission)
                      </span>
                    </label>

                    {/* Optional */}
                    <div className="space-y-[0.4vw]">
                      <label className="flex items-center gap-[0.6vw] cursor-pointer group w-fit select-none">
                        <div className="relative flex items-center justify-center">
                          <input
                            type="radio"
                            name="allowSkip"
                            checked={Boolean(settings.appearance.allowSkip)}
                            onChange={() => updateAppearance('allowSkip', true)}
                            className="peer appearance-none w-[1vw] h-[1vw] border-[1.5px] border-gray-400 rounded-full checked:border-[#E05638] transition-all bg-transparent"
                          />
                          <div className="absolute w-[0.5vw] h-[0.5vw] bg-[#E05638] rounded-full scale-0 peer-checked:scale-100 transition-transform" />
                        </div>
                        <span className={`text-[0.72vw] transition-colors ${settings.appearance.allowSkip ? 'text-gray-900 font-medium' : 'text-gray-600 group-hover:text-gray-800'}`}>
                          Optional (Allow Skip)
                        </span>
                      </label>

                      {settings.appearance.allowSkip && (
                        <div className="ml-[1.6vw] space-y-[0.4vw] pt-[0.2vw]">
                          <span className="block text-[0.68vw] text-gray-500 font-normal">If Skipped</span>
                          <div className="relative inline-block w-full max-w-[14vw]">
                            <select
                              value={settings.appearance.skipBehavior || 'never'}
                              onChange={(e) => updateAppearance('skipBehavior', e.target.value)}
                              className="w-full appearance-none bg-white border border-gray-200 rounded-[0.5vw] py-[0.45vw] pl-[0.7vw] pr-[2vw] text-[0.7vw] text-gray-700 outline-none focus:border-[#E05638] cursor-pointer shadow-xs"
                            >
                              <option value="never">Never Show again</option>
                              <option value="1_day">Show again after 1 day</option>
                              <option value="next_visit">Show again on next visit</option>
                            </select>
                            <div className="absolute right-[0.6vw] top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                              <Icon icon="fluent:chevron-down-12-regular" className="w-[0.8vw] h-[0.8vw]" />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Email Configuration Accordion Card */}
          <div className="bg-white rounded-[0.8vw] border border-gray-200/90 shadow-[0_0.2vw_0.8vw_rgba(0,0,0,0.04)] overflow-hidden">
            {/* Accordion Header */}
            <button
              type="button"
              onClick={() => setIsEmailOpen(!isEmailOpen)}
              className="w-full flex items-center justify-between p-[0.9vw] bg-white hover:bg-gray-50/50 transition-colors"
            >
              <div className="flex flex-col text-left">
                <span className="text-[0.82vw] font-semibold text-gray-800 leading-tight">Email Configuration</span>
                <span className="text-[0.65vw] text-gray-500 font-normal mt-[0.1vw]">Set up confirmation email & manage recipients.</span>
              </div>
              <Icon
                icon="fluent:chevron-down-12-regular"
                className={`w-[0.9vw] h-[0.9vw] text-gray-400 transition-transform duration-200 ${isEmailOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {isEmailOpen && (
              <div className="p-[0.9vw] pt-[0.4vw] border-t border-gray-100 space-y-[0.8vw]">
                {/* Manage Recipients Header */}
                <div className="flex items-center gap-[0.5vw] pt-[0.2vw]">
                  <span className="text-[0.72vw] font-semibold text-gray-900 whitespace-nowrap">Manage Recipients</span>
                  <div className="h-[1px] bg-gray-200 flex-1"></div>
                </div>

                {/* Primary Recipient (To) */}
                <div className="flex flex-col gap-[0.3vw]">
                  <label className="text-[0.7vw] font-medium text-gray-800">Primary Recipient (To)</label>
                  <input
                    type="email"
                    value={settings.leadNotification?.primaryRecipient || ''}
                    onChange={(e) => updateNested('leadNotification', 'primaryRecipient', e.target.value)}
                    placeholder="admin@gmail.com"
                    className="w-full border border-gray-200 rounded-[0.5vw] px-[0.6vw] py-[0.55vw] text-[0.7vw] text-gray-700 outline-none focus:border-[#E05638] bg-white shadow-xs placeholder:text-gray-400"
                  />
                </div>

                {/* Additional Recipients */}
                <div className="space-y-[0.5vw]">
                  {(settings.leadNotification?.additionalRecipients || []).map((recipient, idx) => (
                    <div key={idx} className="flex flex-col gap-[0.3vw]">
                      <div className="flex items-center justify-between">
                        <label className="text-[0.7vw] font-medium text-gray-800">Recipient {idx + 1}</label>
                        <button
                          type="button"
                          onClick={() => {
                            const newRecipients = (settings.leadNotification?.additionalRecipients || []).filter((_, i) => i !== idx);
                            updateNested('leadNotification', 'additionalRecipients', newRecipients);
                          }}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                          title="Remove recipient"
                        >
                          <Icon icon="lucide:trash-2" className="w-[0.75vw] h-[0.75vw]" />
                        </button>
                      </div>
                      <input
                        type="email"
                        value={recipient}
                        onChange={(e) => {
                          const newRecipients = [...(settings.leadNotification?.additionalRecipients || [])];
                          newRecipients[idx] = e.target.value;
                          updateNested('leadNotification', 'additionalRecipients', newRecipients);
                        }}
                        placeholder="user@gmail.com"
                        className="w-full border border-gray-200 rounded-[0.5vw] px-[0.6vw] py-[0.55vw] text-[0.7vw] text-gray-700 outline-none focus:border-[#E05638] bg-white shadow-xs placeholder:text-gray-400"
                      />
                    </div>
                  ))}

                  {/* Add Another Recipient Button */}
                  {(!settings.leadNotification?.additionalRecipients || settings.leadNotification.additionalRecipients.length < 2) && (
                    <button
                      type="button"
                      onClick={() => {
                        const newRecipients = [...(settings.leadNotification?.additionalRecipients || []), ''];
                        updateNested('leadNotification', 'additionalRecipients', newRecipients);
                      }}
                      className="w-full flex items-center justify-center gap-[0.3vw] py-[0.55vw] border border-red-200/80 bg-red-50/30 hover:bg-red-50 rounded-[0.5vw] text-[#E05638] text-[0.72vw] font-medium transition-colors shadow-2xs"
                    >
                      <Plus size="0.75vw" className="stroke-[2.5]" />
                      <span>Add Another Recipient</span>
                    </button>
                  )}
                </div>

                {/* Customer Confirmation Email Header */}
                <div className="flex items-center gap-[0.5vw] pt-[0.4vw]">
                  <span className="text-[0.72vw] font-semibold text-gray-900 whitespace-nowrap">Customer Confirmation Email</span>
                  <div className="h-[1px] bg-gray-200 flex-1"></div>
                </div>

                {/* Subject Line */}
                <div className="flex flex-col gap-[0.3vw]">
                  <label className="text-[0.7vw] font-medium text-gray-800">Subject Line</label>
                  <input
                    type="text"
                    value={settings.leadNotification?.viewerSubject !== undefined ? settings.leadNotification.viewerSubject : 'Thank you for reaching out - {flipbookname}'}
                    onChange={(e) => updateNested('leadNotification', 'viewerSubject', e.target.value)}
                    placeholder="Thank you for reaching out - {flipbookname}"
                    className="w-full border border-gray-200 rounded-[0.5vw] px-[0.6vw] py-[0.55vw] text-[0.7vw] text-gray-700 outline-none focus:border-[#E05638] bg-white shadow-xs placeholder:text-gray-400"
                  />
                  <div className="flex items-center gap-[0.25vw] text-[0.6vw] text-red-500 pt-[0.1vw]">
                    <Icon icon="lucide:info" className="w-[0.75vw] h-[0.75vw] shrink-0" />
                    <span>Use &#123;flipbook&#125; Name to insert the book name.</span>
                  </div>
                </div>

                {/* Body Text */}
                <div className="flex flex-col gap-[0.3vw]">
                  <label className="text-[0.7vw] font-medium text-gray-800">Body Text</label>
                  <textarea
                    rows={4}
                    value={settings.leadNotification?.viewerMessage !== undefined ? settings.leadNotification.viewerMessage : 'Thank you for your interest in {flipbookname}. We have received your inquiry and our team will get in touch with you shortly.'}
                    onChange={(e) => updateNested('leadNotification', 'viewerMessage', e.target.value)}
                    placeholder="Thank you for your interest in {flipbookname}. We have received your inquiry and our team will get in touch with you shortly."
                    className="w-full border border-gray-200 rounded-[0.5vw] px-[0.6vw] py-[0.5vw] text-[0.7vw] text-gray-700 outline-none focus:border-[#E05638] bg-white shadow-xs resize-none placeholder:text-gray-400"
                  />
                </div>

                {/* Actions: Reset, Cancel, Save Changes */}
                <div className="flex items-center justify-between pt-[0.4vw]">
                  <button
                    type="button"
                    onClick={() => {
                      updateNested('leadNotification', 'viewerSubject', 'Thank you for reaching out - {flipbookname}');
                      updateNested('leadNotification', 'viewerMessage', 'Thank you for your interest in {flipbookname}. We have received your inquiry and our team will get in touch with you shortly.');
                      updateNested('leadNotification', 'primaryRecipient', '');
                      updateNested('leadNotification', 'additionalRecipients', []);
                    }}
                    className="flex items-center gap-[0.25vw] px-[0.6vw] py-[0.45vw] text-[0.68vw] text-gray-600 hover:text-gray-800 bg-white border border-gray-200 rounded-[0.4vw] hover:bg-gray-50 transition-colors shadow-2xs font-medium"
                  >
                    <span>Reset</span>
                    <Icon icon="lucide:rotate-ccw" className="w-[0.75vw] h-[0.75vw]" />
                  </button>

                  <div className="flex items-center gap-[0.4vw]">
                    <button
                      type="button"
                      onClick={() => setIsEmailOpen(false)}
                      className="px-[0.8vw] py-[0.45vw] text-[0.68vw] text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-[0.4vw] transition-colors shadow-2xs font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEmailOpen(false);
                      }}
                      className="px-[0.9vw] py-[0.45vw] text-[0.68vw] text-white bg-[#E05638] hover:bg-[#d04b2f] rounded-[0.4vw] transition-colors shadow-2xs font-semibold"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Add Field Popup */}
      {isAddFieldPopupOpen && (
        <>
          <div
            className="absolute top-0 left-full w-[100vw] h-[100vh] z-[100]"
            onClick={() => setIsAddFieldPopupOpen(false)}
          />
          <div className="absolute top-[40%] right-0 translate-x-1/2 -translate-y-1/2 z-[101] bg-white rounded-[1vw] w-[18vw] shadow-[0_1vw_3vw_rgba(0,0,0,0.15)] overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col transition-all border border-gray-100">
            {/* Header */}
            <div className="flex items-center justify-between px-[1.2vw] py-[0.8vw] border-b border-gray-100 bg-gray-50/50">
              <span className="text-[0.8vw] font-semibold text-gray-900">Add Field</span>
              <button
                onClick={() => setIsAddFieldPopupOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Icon icon="lucide:x" className="w-[1vw] h-[1vw]" />
              </button>
            </div>

            {/* Content: Custom Fields */}
            <div className="p-[1.2vw] flex flex-col bg-white w-full">
              <p className="text-[0.7vw] text-gray-500 mb-[1vw] font-normal">
                Click a field below to add it to your lead form.
              </p>

              <div className="grid grid-cols-2 gap-[0.7vw] w-full">
                <button onClick={() => handleAddField('empty')} className="flex items-center gap-[0.5vw] px-[0.75vw] py-[0.6vw] border border-gray-100 rounded-[0.4vw] shadow-[0_0.1vw_0.3vw_rgba(0,0,0,0.04)] hover:border-[#E05638] hover:bg-orange-50/40 transition-all group bg-white justify-center">
                  <Icon icon="lucide:type" className="w-[1vw] h-[1vw] text-gray-600 group-hover:text-[#E05638]" />
                  <span className="text-[0.7vw] font-medium text-gray-700 group-hover:text-[#E05638]">Input Box</span>
                </button>

                <button onClick={() => handleAddField('feedback')} className="flex items-center gap-[0.5vw] px-[0.75vw] py-[0.6vw] border border-gray-100 rounded-[0.4vw] shadow-[0_0.1vw_0.3vw_rgba(0,0,0,0.04)] hover:border-[#E05638] hover:bg-orange-50/40 transition-all group bg-white justify-center">
                  <Icon icon="lucide:text-cursor-input" className="w-[1vw] h-[1vw] text-gray-600 group-hover:text-[#E05638]" />
                  <span className="text-[0.7vw] font-medium text-gray-700 group-hover:text-[#E05638]">Text Area</span>
                </button>

                <button onClick={() => handleAddField('radio')} className="flex items-center gap-[0.5vw] px-[0.75vw] py-[0.6vw] border border-gray-100 rounded-[0.4vw] shadow-[0_0.1vw_0.3vw_rgba(0,0,0,0.04)] hover:border-[#E05638] hover:bg-orange-50/40 transition-all group bg-white justify-center">
                  <Icon icon="lucide:circle-dot" className="w-[1vw] h-[1vw] text-gray-600 group-hover:text-[#E05638]" />
                  <span className="text-[0.7vw] font-medium text-gray-700 group-hover:text-[#E05638]">Radio Button</span>
                </button>

                <button onClick={() => handleAddField('dropdown')} className="flex items-center gap-[0.5vw] px-[0.75vw] py-[0.6vw] border border-gray-100 rounded-[0.4vw] shadow-[0_0.1vw_0.3vw_rgba(0,0,0,0.04)] hover:border-[#E05638] hover:bg-orange-50/40 transition-all group bg-white justify-center">
                  <Icon icon="lucide:list-collapse" className="w-[1vw] h-[1vw] text-gray-600 group-hover:text-[#E05638]" />
                  <span className="text-[0.7vw] font-medium text-gray-700 group-hover:text-[#E05638]">Dropdown</span>
                </button>

                <button onClick={() => handleAddField('rating')} className="flex items-center gap-[0.5vw] px-[0.75vw] py-[0.6vw] border border-gray-100 rounded-[0.4vw] shadow-[0_0.1vw_0.3vw_rgba(0,0,0,0.04)] hover:border-[#E05638] hover:bg-orange-50/40 transition-all group bg-white justify-center">
                  <Icon icon="lucide:star" className="w-[1vw] h-[1vw] text-gray-600 group-hover:text-[#E05638]" />
                  <span className="text-[0.7vw] font-medium text-gray-700 group-hover:text-[#E05638]">Rating</span>
                </button>

                <button onClick={() => handleAddField('checkbox')} className="flex items-center gap-[0.5vw] px-[0.75vw] py-[0.6vw] border border-gray-100 rounded-[0.4vw] shadow-[0_0.1vw_0.3vw_rgba(0,0,0,0.04)] hover:border-[#E05638] hover:bg-orange-50/40 transition-all group bg-white justify-center">
                  <Icon icon="lucide:check-square" className="w-[1vw] h-[1vw] text-gray-600 group-hover:text-[#E05638]" />
                  <span className="text-[0.7vw] font-medium text-gray-700 group-hover:text-[#E05638]">Checkbox</span>
                </button>

                <button onClick={() => handleAddField('products')} className="flex items-center gap-[0.5vw] px-[0.75vw] py-[0.6vw] border border-gray-100 rounded-[0.4vw] shadow-[0_0.1vw_0.3vw_rgba(0,0,0,0.04)] hover:border-[#E05638] hover:bg-orange-50/40 transition-all group bg-white justify-center col-span-2">
                  <Icon icon="lucide:shopping-bag" className="w-[1vw] h-[1vw] text-gray-600 group-hover:text-[#E05638]" />
                  <span className="text-[0.7vw] font-medium text-gray-700 group-hover:text-[#E05638]">Products</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Customize Email Content Modal */}
      {isEmailCustomModalOpen && (
        <EmailCustomizationModal
          settings={settings.leadNotification || {}}
          onClose={() => setIsEmailCustomModalOpen(false)}
          onSave={(updatedNotification) => {
            onUpdate({
              ...settings,
              leadNotification: {
                ...(settings.leadNotification || {}),
                ...updatedNotification
              }
            });
            setIsEmailCustomModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Email Customization Modal Component
// ─────────────────────────────────────────────────────────────────────────────
const EmailCustomizationModal = ({ settings, onClose, onSave }) => {
  const [activeTab, setActiveTab] = useState('admin'); // 'admin' | 'viewer'

  const DEFAULT_SENDER_NAME = 'Flipibook Lead Form';
  const DEFAULT_ADMIN_SUBJECT = '[New Lead Captured] - {flipbookName}';
  const DEFAULT_ADMIN_MESSAGE = 'A viewer submitted their details on your flipbook. Below are the details captured:';
  const DEFAULT_VIEWER_SUBJECT = 'Thank you for reaching out - {flipbookName}';
  const DEFAULT_VIEWER_MESSAGE = 'Thank you for your interest. Our team has received your inquiry details and will review and get in touch with you shortly.';

  // Admin Notification Form States
  const [senderName, setSenderName] = useState(settings.senderName || DEFAULT_SENDER_NAME);
  const [subject, setSubject] = useState(settings.subject || DEFAULT_ADMIN_SUBJECT);
  const [message, setMessage] = useState(settings.message || DEFAULT_ADMIN_MESSAGE);

  // Viewer Confirmation Form States
  const [viewerSubject, setViewerSubject] = useState(settings.viewerSubject || DEFAULT_VIEWER_SUBJECT);
  const [viewerMessage, setViewerMessage] = useState(settings.viewerMessage || DEFAULT_VIEWER_MESSAGE);

  const handleResetToDefault = () => {
    if (activeTab === 'admin') {
      setSenderName(DEFAULT_SENDER_NAME);
      setSubject(DEFAULT_ADMIN_SUBJECT);
      setMessage(DEFAULT_ADMIN_MESSAGE);
    } else {
      setViewerSubject(DEFAULT_VIEWER_SUBJECT);
      setViewerMessage(DEFAULT_VIEWER_MESSAGE);
    }
  };

  const handleApply = () => {
    onSave({
      senderName: senderName.trim(),
      subject: subject.trim(),
      message: message.trim(),
      viewerSubject: viewerSubject.trim(),
      viewerMessage: viewerMessage.trim()
    });
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/45 backdrop-blur-[2px] p-[1vw] animate-in fade-in duration-200">
      <div 
        className="bg-white w-[90vw] max-w-[580px] rounded-[0.8vw] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-gray-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-[1.2vw] py-[0.85vw] border-b border-gray-100 bg-white">
          <div className="flex items-center gap-[0.6vw]">
            <div className="w-[2vw] h-[2vw] rounded-[0.45vw] bg-indigo-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <Mail className="w-[1.1vw] h-[1.1vw] stroke-[2]" />
            </div>
            <div>
              <h2 className="text-[0.9vw] font-bold text-gray-900 leading-tight">Customize Email Templates</h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-[1.6vw] h-[1.6vw] rounded-[0.35vw] flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <Icon icon="lucide:x" className="w-[1vw] h-[1vw]" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-gray-200 bg-gray-50/60 px-[1.2vw] pt-[0.4vw]">
          <button
            type="button"
            onClick={() => setActiveTab('admin')}
            className={`flex items-center gap-[0.4vw] px-[0.9vw] py-[0.55vw] text-[0.72vw] font-semibold border-b-2 transition-all ${
              activeTab === 'admin'
                ? 'border-indigo-600 text-indigo-700 bg-white rounded-t-[0.4vw]'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Icon icon="lucide:inbox" className="w-[0.85vw] h-[0.85vw]" />
            Lead Alert (Admin Email)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('viewer')}
            className={`flex items-center gap-[0.4vw] px-[0.9vw] py-[0.55vw] text-[0.72vw] font-semibold border-b-2 transition-all ${
              activeTab === 'viewer'
                ? 'border-indigo-600 text-indigo-700 bg-white rounded-t-[0.4vw]'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Icon icon="lucide:check-circle-2" className="w-[0.85vw] h-[0.85vw]" />
            Viewer Confirmation Email
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-[1.2vw] overflow-y-auto space-y-[0.85vw] flex-1">
          {activeTab === 'admin' ? (
            <div className="space-y-[0.8vw] animate-in fade-in duration-150">
              {/* Sender Name */}
              <div className="flex flex-col gap-[0.3vw]">
                <label className="text-[0.72vw] font-semibold text-gray-800">
                  Sender Display Name
                </label>
                <input
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="w-full border border-gray-200 rounded-[0.4vw] p-[0.6vw] text-[0.72vw] text-gray-800 focus:outline-none focus:border-indigo-500 bg-white shadow-xs"
                />
              </div>

              {/* Admin Subject */}
              <div className="flex flex-col gap-[0.3vw]">
                <label className="text-[0.72vw] font-semibold text-gray-800 flex items-center justify-between">
                  <span>Email Subject Line</span>
                  <span className="text-[0.58vw] font-normal text-gray-400">Use <code className="text-indigo-600 bg-gray-100 px-1 py-0.5 rounded font-mono">{`{flipbookName}`}</code> to insert book name</span>
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full border border-gray-200 rounded-[0.4vw] p-[0.6vw] text-[0.72vw] text-gray-800 focus:outline-none focus:border-indigo-500 bg-white shadow-xs"
                />
              </div>

              {/* Admin Message / Intro Note */}
              <div className="flex flex-col gap-[0.3vw]">
                <label className="text-[0.72vw] font-semibold text-gray-800">
                  Introductory Message / Note
                </label>
                <textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full border border-gray-200 rounded-[0.4vw] p-[0.6vw] text-[0.72vw] text-gray-800 focus:outline-none focus:border-indigo-500 bg-white shadow-xs resize-none"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-[0.8vw] animate-in fade-in duration-150">
              {/* Viewer Subject */}
              <div className="flex flex-col gap-[0.3vw]">
                <label className="text-[0.72vw] font-semibold text-gray-800 flex items-center justify-between">
                  <span>Confirmation Email Subject</span>
                  <span className="text-[0.58vw] font-normal text-gray-400">Use <code className="text-indigo-600 bg-gray-100 px-1 py-0.5 rounded font-mono">{`{flipbookName}`}</code> to insert book name</span>
                </label>
                <input
                  type="text"
                  value={viewerSubject}
                  onChange={(e) => setViewerSubject(e.target.value)}
                  className="w-full border border-gray-200 rounded-[0.4vw] p-[0.6vw] text-[0.72vw] text-gray-800 focus:outline-none focus:border-indigo-500 bg-white shadow-xs"
                />
              </div>

              {/* Viewer Confirmation Message */}
              <div className="flex flex-col gap-[0.3vw]">
                <label className="text-[0.72vw] font-semibold text-gray-800">
                  Confirmation Message Body
                </label>
                <textarea
                  rows={4}
                  value={viewerMessage}
                  onChange={(e) => setViewerMessage(e.target.value)}
                  className="w-full border border-gray-200 rounded-[0.4vw] p-[0.6vw] text-[0.72vw] text-gray-800 focus:outline-none focus:border-indigo-500 bg-white shadow-xs resize-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-[1.2vw] py-[0.75vw] border-t border-gray-100 bg-gray-50 flex items-center justify-between">
          <button
            type="button"
            onClick={handleResetToDefault}
            className="flex items-center gap-[0.3vw] text-[0.68vw] text-gray-500 hover:text-gray-800 font-medium px-[0.6vw] py-[0.4vw] rounded-[0.35vw] hover:bg-gray-200 transition-colors"
          >
            <Icon icon="lucide:rotate-ccw" className="w-[0.75vw] h-[0.75vw]" />
            Reset to Default
          </button>

          <div className="flex items-center gap-[0.6vw]">
            <button
              type="button"
              onClick={onClose}
              className="px-[0.9vw] py-[0.45vw] text-[0.7vw] font-medium text-gray-600 hover:text-gray-800 bg-white border border-gray-200 rounded-[0.4vw] hover:bg-gray-100 transition-colors shadow-xs"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="px-[1.1vw] py-[0.45vw] text-[0.7vw] font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-[0.4vw] transition-colors shadow-xs flex items-center gap-[0.3vw]"
            >
              <Icon icon="lucide:check" className="w-[0.8vw] h-[0.8vw]" />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

const ColorPickerItem = ({ label, color, opacity = 100, onChange, onOpacityChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [pickerPos, setPickerPos] = useState({ x: 0, y: 0 });
  const pickerRef = useRef(null);
  const swatchRef = useRef(null);

  // The click-outside logic is now handled internally by ColorPallet via onClose

  const handleOpen = () => {
    if (!isOpen && swatchRef.current) {
      const rect = swatchRef.current.getBoundingClientRect();
      const sidebarContainer = swatchRef.current.closest('.bg-white.relative.overflow-visible');
      const sidebarRightEdge = sidebarContainer ? sidebarContainer.getBoundingClientRect().right : rect.right;

      const pickerWidth = window.innerWidth * 0.15; // ColorPallet width is 15vw
      const pickerHeight = 350;
      const yPos = Math.min(rect.top, window.innerHeight - pickerHeight);
      // Position picker half inside and half outside on the right side of the sidebar
      setPickerPos({ x: sidebarRightEdge - (pickerWidth / 2), y: Math.max(0, yPos) });
    }
    setIsOpen(!isOpen);
  };

  const displayOpacity = opacity !== undefined && opacity !== null ? opacity : 100;

  const isColorSet = Boolean(color && color !== '#' && color !== 'transparent');

  return (
    <div className="flex items-center gap-[0.4vw] relative group/citem">
      <span className="w-[4.6vw] text-[0.7vw] pl-[0.2vw] font-semibold text-gray-700 shrink-0 whitespace-nowrap">{label}</span>
      <div className="flex-1 flex items-center gap-[0.4vw] min-w-0">
        <div
          ref={swatchRef}
          className="w-[1.8vw] h-[1.8vw] rounded-[0.4vw] border border-gray-900 cursor-pointer overflow-hidden relative shadow-sm color-picker-trigger shrink-0 hover:scale-105 transition-transform"
          style={{
            backgroundColor: !isColorSet
              ? 'white'
              : (color.startsWith('#') && color.length >= 7
                ? `rgba(${parseInt(color.slice(1, 3), 16)}, ${parseInt(color.slice(3, 5), 16)}, ${parseInt(color.slice(5, 7), 16)}, ${displayOpacity / 100})`
                : color)
          }}
          onClick={handleOpen}
          title={isColorSet ? "Click to change color" : "No color set. Click to pick color"}
        >
          {!isColorSet && (
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[0.1vw] bg-red-500 rotate-45"></div>
          )}
        </div>
        <div className="flex-1 flex items-center bg-white border border-gray-900 rounded-[0.4vw] px-[0.4vw] py-[0.2vw] h-[1.8vw] shadow-[0_2px_10px_rgba(0,0,0,0.02)] min-w-0 overflow-hidden relative group/box">
          <input
            type="text"
            value={color && color.length > 1 ? color.toUpperCase() : '#'}
            onChange={(e) => {
              const val = e.target.value.trim();
              if (val === '' || val === '#') {
                onChange('');
              } else {
                onChange(val.startsWith('#') ? val : `#${val}`);
              }
            }}
            placeholder="#"
            className="text-[0.68vw] font-medium text-gray-700 flex-1 truncate bg-transparent outline-none uppercase min-w-0"
          />

          {/* Quick remove color icon button */}
          {isColorSet && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange('');
              }}
              className="p-[0.1vw] rounded hover:bg-gray-100 text-gray-400 hover:text-red-500 transition-colors shrink-0 mr-[0.2vw]"
              title="Remove color / Clear"
            >
              <Icon icon="lucide:x" className="w-[0.7vw] h-[0.7vw]" />
            </button>
          )}

          <div className="w-[1px] h-[70%] bg-gray-200 mx-[0.2vw] shrink-0"></div>
          <div className="text-[0.68vw] font-semibold text-gray-800 shrink-0 text-right">{displayOpacity}%</div>
        </div>
      </div>
      {isOpen && createPortal(
        <div ref={pickerRef}>
          <ColorPallet
            color={color && color.startsWith('#') && color.length >= 7 ? color.substring(0, 7) : '#ffffff'}
            onChange={onChange}
            onClear={() => onChange('')}
            allowClear={true}
            opacity={displayOpacity}
            onOpacityChange={onOpacityChange}
            onClose={() => setIsOpen(false)}
            style={{ position: 'fixed', top: pickerPos.y, left: pickerPos.x, zIndex: 9999, transform: 'none' }}
          />
        </div>,
        document.body
      )}
    </div>
  );
};

export { LeadForm };
export default LeadForm;
