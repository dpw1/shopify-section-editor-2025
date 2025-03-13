"use client";

import { useState, useEffect } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { SketchPicker } from "react-color";
import {
  handlePasteCode,
  addSetting,
  removeSetting,
  updateSetting,
  toggleCollapse,
  handleCopyUpdatedCode,
} from "./utils";
import "./page.css";

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

function SortableItem({
  setting,
  index,
  schema,
  setSchema,
  collapsed,
  setCollapsed,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [newLabel, setNewLabel] = useState(setting.label || "");
  const [newId, setNewId] = useState(setting.id || "");
  const [newColor, setNewColor] = useState(setting.default || "#000000");
  const [newDefault, setNewDefault] = useState(setting.default || "");
  const [newInfo, setNewInfo] = useState(setting.info || "");

  const handleSortEnd = (fromIndex, toIndex) => {
    const updatedSettings = [...schema.settings]; // Create a copy of the settings array
    const [movedItem] = updatedSettings.splice(fromIndex, 1); // Remove the item from the original position
    updatedSettings.splice(toIndex, 0, movedItem); // Insert the item at the new position

    setSchema({ ...schema, settings: updatedSettings }); // Update the schema with the new order
  };

  const [{ isDragging }, drag] = useDrag({
    type: "SETTING",
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: "SETTING",
    hover: (item) => {
      if (item.index !== index) {
        handleSortEnd(item.index, index);
        item.index = index;
      }
    },
  });

  // Update local state when props change
  useEffect(() => {
    setNewLabel(setting.label || "");
    setNewId(setting.id || "");
    setNewColor(setting.default || "#000000");
    setNewDefault(setting.default || "");
    setNewInfo(setting.info || "");
  }, [setting]);

  const handleInputChange = (field, value) => {
    // Update the specific field of the setting in the schema
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

    // Remove options if type is changed to something that doesn't use options
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
    <div
      ref={(node) => drag(drop(node))} // Combine drag and drop refs
      style={{ opacity: isDragging ? 0.5 : 1 }}
      className="setting-container">
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
}

function SortableList({ items, schema, setSchema, collapsed, setCollapsed }) {
  return (
    <div className="editor-items">
      {items.map((setting, index) => (
        <SortableItem
          key={`item-${index}`}
          index={index}
          setting={setting}
          schema={schema}
          setSchema={setSchema}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
        />
      ))}
    </div>
  );
}

export default function Editor() {
  const [schema, setSchema] = useState({
    name: "Custom Section",
    settings: [],
  });

  const [shopifyCode, setShopifyCode] = useState("");
  const [error, setError] = useState("");
  const [collapsed, setCollapsed] = useState({});
  const [loading, setLoading] = useState(true);
  const [collapseAll, setCollapseAll] = useState(false);
  const [jsonOutput, setJsonOutput] = useState(""); // New state for the JSON output

  const handleSortEnd = (fromIndex, toIndex) => {
    const updatedSettings = [...schema.settings];
    const [movedItem] = updatedSettings.splice(fromIndex, 1); // Remove the item from the fromIndex
    updatedSettings.splice(toIndex, 0, movedItem); // Insert the item at the toIndex

    setSchema({ ...schema, settings: updatedSettings }); // Update the schema with the new order
  };

  useEffect(() => {
    const storedSchema = localStorage.getItem("schema");
    const storedShopifyCode = localStorage.getItem("shopifyCode");
    const storedCollapsed = localStorage.getItem("collapsed");

    if (storedSchema) {
      setSchema(JSON.parse(storedSchema));
    }
    if (storedShopifyCode) {
      setShopifyCode(storedShopifyCode);
    }
    if (storedCollapsed) {
      setCollapsed(JSON.parse(storedCollapsed));
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    localStorage.setItem("schema", JSON.stringify(schema));
    localStorage.setItem("shopifyCode", shopifyCode);
    localStorage.setItem("collapsed", JSON.stringify(collapsed));
  }, [schema, shopifyCode, collapsed]);

  // Real-time update for JSON output
  useEffect(() => {
    setJsonOutput(JSON.stringify(schema, null, 2)); // Update the JSON output whenever schema changes
  }, [schema]);

  const handleCollapseAllToggle = () => {
    const newCollapseState = !collapseAll;
    setCollapseAll(newCollapseState);
    const updatedCollapsed = {};
    schema.settings.forEach((_, index) => {
      updatedCollapsed[index] = newCollapseState;
    });
    setCollapsed(updatedCollapsed);
  };

  return (
    <div className="editor">
      <h1 className="header">Shopify Section Editor</h1>
      {loading ? (
        <div className="skeleton-loader">
          <div className="skeleton-header"></div>
          <div className="skeleton-content"></div>
          <div className="skeleton-footer"></div>
        </div>
      ) : (
        <>
          <textarea
            value={shopifyCode}
            onChange={(e) => setShopifyCode(e.target.value)}
            placeholder="Paste your Shopify section code here..."
            className="input-field"
          />
          <div className="editor-container">
            <div className="editor-settings">
              <div className="editor-buttons">
                <button
                  className="paste-code"
                  onClick={() =>
                    handlePasteCode(shopifyCode, setError, setSchema)
                  }>
                  Paste & Parse Code
                </button>
                <button onClick={handleCollapseAllToggle}>
                  {collapseAll ? "Uncollapse All" : "Collapse All"}
                </button>
                {error && <div className="error-message">{error}</div>}
                <button
                  className="add-setting"
                  onClick={() => addSetting(setSchema)}>
                  Add Setting
                </button>
              </div>
              <DndProvider backend={HTML5Backend}>
                <SortableList
                  items={schema.settings}
                  schema={schema}
                  setSchema={setSchema}
                  collapsed={collapsed}
                  setCollapsed={setCollapsed}
                />
              </DndProvider>
            </div>
            <div className="json-output">
              <pre>{jsonOutput}</pre>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
