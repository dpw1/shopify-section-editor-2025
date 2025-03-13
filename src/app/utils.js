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
