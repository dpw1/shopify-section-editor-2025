"use client";

import { useState, useEffect } from "react";
import { useDrag, useDrop } from "react-dnd";
import { SketchPicker } from "react-color";

// Define the settingTypes here
const settingTypes = [
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

const SortableItem = ({
  setting,
  index,
  schema,
  setSchema,
  collapsed,
  setCollapsed,
  handleSortEnd,
}) => {
  const [, drag] = useDrag(() => ({
    type: "ITEM",
    item: { index },
  }));
  const [, drop] = useDrop(() => ({
    accept: "ITEM",
    hover: (item) => {
      if (item.index !== index) {
        handleSortEnd(item.index, index);
        item.index = index;
      }
    },
  }));

  const [isEditing, setIsEditing] = useState(false);
  const [newLabel, setNewLabel] = useState(setting.label || "");
  const [newId, setNewId] = useState(setting.id || "");
  const [newColor, setNewColor] = useState(setting.default || "#000000");
  const [newDefault, setNewDefault] = useState(setting.default || "");
  const [newInfo, setNewInfo] = useState(setting.info || "");

  useEffect(() => {
    setNewLabel(setting.label || "");
    setNewId(setting.id || "");
    setNewColor(setting.default || "#000000");
    setNewDefault(setting.default || "");
    setNewInfo(setting.info || "");
  }, [setting]);

  const handleInputChange = (field, value) => {
    const updatedSettings = [...schema.settings];
    updatedSettings[index] = { ...updatedSettings[index], [field]: value };
    setSchema({ ...schema, settings: updatedSettings });
  };

  const handleLabelClick = (e) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleBlur = () => {
    handleInputChange("label", newLabel);
    handleInputChange("id", newId);
    if (setting.type === "color") {
      handleInputChange("default", newColor);
    } else if (setting.type !== "checkbox") {
      handleInputChange("default", newDefault);
    }
    if (setting.type === "checkbox") {
      handleInputChange("info", newInfo);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleBlur();
    }
  };

  const handleTypeChange = (e) => {
    const newType = e.target.value;
    handleInputChange("type", newType);
    if (newType !== "select" && newType !== "radio" && setting.options) {
      const updatedSetting = { ...setting };
      delete updatedSetting.options;
      setSchema((prevSchema) => ({
        ...prevSchema,
        settings: prevSchema.settings.map((item, idx) =>
          idx === index ? { ...item, type: newType, options: undefined } : item,
        ),
      }));
    } else {
      setSchema((prevSchema) => ({
        ...prevSchema,
        settings: prevSchema.settings.map((item, idx) =>
          idx === index ? { ...item, type: newType } : item,
        ),
      }));
    }
  };

  return (
    <div ref={(node) => drag(drop(node))} className="setting-container">
      <button
        className="remove-setting"
        onClick={() => removeSetting(index, setSchema)}>
        X
      </button>
      <div
        className="collapsible-header"
        onClick={() => toggleCollapse(index, collapsed, setCollapsed)}>
        <h3
          className="editor-item-title"
          onClick={handleLabelClick}
          style={{ cursor: "pointer" }}>
          {isEditing ? (
            <input
              type="text"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              autoFocus
              className="inline-input"
            />
          ) : (
            <span>{newLabel || "Untitled Setting"}</span>
          )}
        </h3>
        <span className="editor-item-collapse">
          {collapsed[index] ? "Expand" : "Collapse"}
        </span>
      </div>
      <div
        className={`collapsible-content ${
          collapsed[index] ? "collapsed" : ""
        }`}>
        <select
          value={setting.type || ""}
          onChange={handleTypeChange}
          className="input-field">
          {settingTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        <input
          type="text"
          defaultValue={newId}
          onChange={(e) => handleInputChange("id", e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder="ID"
          className="input-field"
          onKeyPress={(e) => e.key === " " && e.preventDefault()}
        />
        <input
          type="text"
          defaultValue={newLabel}
          onChange={(e) => handleInputChange("label", e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder="Label"
          className="input-field"
        />
        {setting.type === "color" && (
          <>
            <SketchPicker
              color={newColor}
              onChangeComplete={(color) =>
                handleInputChange("default", color.hex)
              }
              className="input-field"
            />
            <input
              type="text"
              defaultValue={newColor}
              onChange={(e) => handleInputChange("default", e.target.value)}
              onBlur={() => handleInputChange("default", newColor)}
              className="input-field"
              placeholder="HEX Color"
            />
          </>
        )}
        {setting.type !== "checkbox" && setting.type !== "color" && (
          <textarea
            value={newDefault}
            onChange={(e) => handleInputChange("default", e.target.value)}
            onBlur={() => handleInputChange("default", newDefault)}
            placeholder="Default Value"
            className="input-field"
          />
        )}
        {setting.type === "checkbox" && (
          <>
            <input
              type="checkbox"
              checked={setting.default === true}
              onChange={(e) => handleInputChange("default", e.target.checked)}
              className="checkbox"
            />
            <textarea
              value={newInfo}
              onChange={(e) => handleInputChange("info", e.target.value)}
              onBlur={() => handleInputChange("info", newInfo)}
              placeholder="Info"
              className="input-field"
            />
          </>
        )}
      </div>
    </div>
  );
};

export default SortableItem;
