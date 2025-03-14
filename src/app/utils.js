// Utility functions for ShopifySectionEditor

export const settingTypes = [
  "checkbox",
  "color",
  "collection",
  "collection_list",
  "image_picker",
  "link_list",
  "number",
  "page",
  "paragraph",
  "product",
  "product_list",
  "radio",
  "range",
  "richtext",
  "select",
  "text",
  "textarea",
  "video_url",
  "font_picker",
  "blog",
  "url",
  "header",
].sort();

export const SCHEMA_TYPES = [
  {
    type: "header",
    options: ["content"],
  },
  {
    type: "paragraph",
    options: ["content"],
  },
  {
    type: "text",
    options: ["id", "label", "info", "placeholder", "default"],
  },
  {
    type: "color",
    options: ["id", "label", "info", "default"],
  },
  {
    type: "font_picker",
    options: ["id", "label", "info", "default"],
  },
  {
    type: "collection",
    options: ["id", "label", "info"],
  },
  {
    type: "product",
    options: ["id", "label", "info"],
  },
  {
    type: "product_list",
    options: ["id", "label", "info"],
  },
  {
    type: "collection_list",
    options: ["id", "label", "info"],
  },
  {
    type: "blog",
    options: ["id", "label", "info"],
  },
  {
    type: "page",
    options: ["id", "label", "info"],
  },
  {
    type: "link_list",
    options: ["id", "label", "info"],
  },
  {
    type: "url",
    options: ["id", "label", "info"],
  },
  {
    type: "video_url",
    options: ["id", "label", "accept", "placeholder", "info", "default"],
  },
  {
    type: "richtext",
    options: ["id", "label", "info", "default"],
  },
  {
    type: "checkbox",
    options: ["id", "label", "info", "default"],
  },
  {
    type: "range",
    options: ["id", "label", "min", "max", "step", "unit", "info", "default"],
  },
  {
    type: "textarea",
    options: ["id", "label", "info", "placeholder", "default"],
  },
  {
    type: "number",
    options: ["id", "label", "info", "placeholder", "default"],
  },
  {
    type: "select",
    options: ["id", "label", "info", "options", "default"],
  },
  {
    type: "radio",
    options: ["id", "label", "info", "options", "default"],
  },
  {
    type: "image_picker",
    options: ["id", "label", "info"],
  },
];

export const handlePasteCode = (shopifyCode, setError, setSchema) => {
  setError("");

  const schemaRegex = /{%\s*schema\s*%}([\s\S]*?){%\s*endschema\s*%}/;
  const match = shopifyCode.match(schemaRegex);

  if (match) {
    const schemaContent = match[1];
    try {
      const parsedSchema = JSON.parse(schemaContent);
      setSchema(parsedSchema);
    } catch (err) {
      setError("Error parsing schema content.");
    }
  } else {
    setError("No {% schema %} found in the pasted code.");
  }
};

export const addSetting = (setSchema) => {
  setSchema((prev) => ({
    ...prev,
    settings: [
      ...prev.settings,
      { id: "", type: "text", label: "", default: "", info: "" },
    ],
  }));
};

export const removeSetting = (index, setSchema) => {
  setSchema((prev) => ({
    ...prev,
    settings: prev.settings.filter((_, idx) => idx !== index),
  }));
};

export const updateSetting = (index, field, value, setSchema) => {
  setSchema((prev) => {
    const newSettings = [...prev.settings];
    newSettings[index] = { ...newSettings[index], [field]: value };
    return { ...prev, settings: newSettings };
  });
};

export const toggleCollapse = (index, collapsed, setCollapsed) => {
  setCollapsed((prev) => ({
    ...prev,
    [index]: !prev[index],
  }));
};

export const handleDragStart = (e, index) => {
  e.dataTransfer.setData("text/plain", index);
};

export const handleKeyPress = (e, elementType) => {
  // Check if the pressed key is the spacebar
  if (e.key === " ") {
    // Block spacebar for 'id' and 'options > value' fields
    if (elementType === "id" || elementType === "option-value") {
      e.preventDefault();
    }
  }
};

export const handleDrop = (e, targetIndex, settings, setSchema) => {
  const draggedIndex = e.dataTransfer.getData("text/plain");
  if (draggedIndex === "") return;

  const newSettings = [...settings];
  const [draggedItem] = newSettings.splice(draggedIndex, 1);
  newSettings.splice(targetIndex, 0, draggedItem);

  setSchema((prev) => ({ ...prev, settings: newSettings }));
};

export const handleCopyUpdatedCode = (schema, shopifyCode) => {
  const updatedSchema = `{% schema %}\n${JSON.stringify(
    schema,
    null,
    2,
  )}\n{% endschema %}`;
  const updatedCode = shopifyCode.replace(
    /{%\s*schema\s*%}([\s\S]*?){%\s*endschema\s*%}/,
    updatedSchema,
  );

  navigator.clipboard.writeText(updatedCode).then(() => {
    alert("Updated Shopify section code copied to clipboard!");
  });
};
