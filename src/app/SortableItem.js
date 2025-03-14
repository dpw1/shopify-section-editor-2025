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
  settingTypes,
  handleKeyPress,
  SCHEMA_TYPES,
} from "./utils";
import "./page.css";
import { SortableList } from "./SortableList";

export function SortableItem({
  setting,
  index,
  schema,
  setSchema,
  collapsed,
  setCollapsed,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [newId, setNewId] = useState(setting.id || "");
  const [newColor, setNewColor] = useState(setting.default || "#000000");
  const [newDefault, setNewDefault] = useState(setting.default || "");
  const [newInfo, setNewInfo] = useState(setting.info || "");
  const [newOptions, setNewOptions] = useState(
    setting.options || [{ value: "", label: "" }],
  );

  const handleSortEnd = (fromIndex, toIndex) => {
    const updatedSettings = [...schema.settings];
    const [movedItem] = updatedSettings.splice(fromIndex, 1);
    updatedSettings.splice(toIndex, 0, movedItem);

    setSchema({ ...schema, settings: updatedSettings });
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

  useEffect(() => {
    setNewId(setting.id || "");
    setNewColor(setting.default || "#000000");
    setNewDefault(setting.default || "");
    setNewInfo(setting.info || "");
    setNewOptions(setting.options || [{ value: "", label: "" }]);
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
    handleInputChange("id", newId);

    if (setting.type === "color") {
      handleInputChange("default", newColor);
    } else if (setting.type !== "checkbox") {
      handleInputChange("default", newDefault);
    }
    if (setting.type === "checkbox") {
      handleInputChange("info", newInfo);
    }
    if (setting.type === "select") {
      handleInputChange("options", newOptions);
    }

    // Check if 'id' is empty
    // if (!newId) {
    //   setIdError(true);
    // } else {
    //   setIdError(false);
    // }

    setIsEditing(false);

    // Remove 'info' from schema if it's empty
    const updatedSetting = { ...setting };

    if (newInfo.trim() === "") {
      delete updatedSetting.info; // Remove 'info' from the schema if it's empty
    }

    // Update schema with the modified setting
    const updatedSettings = [...schema.settings];
    updatedSettings[index] = updatedSetting;

    setSchema({ ...schema, settings: updatedSettings });
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleBlur();
    }
  };

  const handleTypeChange = (e) => {
    const newType = e.target.value;
    handleInputChange("type", newType);

    // Common properties for most types
    const commonSetting = {
      id: setting.id || `${newType}-setting-${Date.now()}`,
      label:
        setting.label ||
        `${newType.charAt(0).toUpperCase() + newType.slice(1)} Setting`,
      info: setting.info || "", // Assuming 'info' should be here as well
      default: newType === "checkbox" ? false : setting.default || "",
    };

    // Create a new setting object based on type
    let updatedSetting = {
      type: newType,
      ...commonSetting,
    };

    // Handle special cases for each type and reset/remove unnecessary properties
    if (newType === "paragraph" || newType === "header") {
      // Only keep 'type' and 'content' for paragraph and header
      updatedSetting.content = setting.content || "";
      delete updatedSetting.min;
      delete updatedSetting.max;
      delete updatedSetting.step;
      delete updatedSetting.options;
      Object.keys(commonSetting).forEach((key) => {
        delete updatedSetting[key]; // Delete each property of commonSetting
      });
    } else if (newType === "range") {
      // Add range specific properties and remove content
      updatedSetting.min = setting.min || 0;
      updatedSetting.max = setting.max || 100;
      updatedSetting.step = setting.step || 1;
      updatedSetting.unit = "px";
      delete updatedSetting.content;
      delete updatedSetting.options;
    } else if (newType === "select") {
      // Add select specific properties and remove content, min, max, step
      updatedSetting.options = setting.options || [{ value: "", label: "" }];
      delete updatedSetting.content;
      delete updatedSetting.min;
      delete updatedSetting.max;
      delete updatedSetting.step;
    } else if (newType === "checkbox") {
      // Checkbox default behavior and remove irrelevant properties
      updatedSetting.default =
        setting.default !== undefined ? setting.default : false;
      delete updatedSetting.content;
      delete updatedSetting.min;
      delete updatedSetting.max;
      delete updatedSetting.step;
      delete updatedSetting.options;
    } else {
      // For other types, remove unnecessary properties
      delete updatedSetting.content;
      delete updatedSetting.min;
      delete updatedSetting.max;
      delete updatedSetting.step;
      delete updatedSetting.options;
    }

    // Update the schema
    setSchema((prevSchema) => ({
      ...prevSchema,
      settings: prevSchema.settings.map((item, idx) =>
        idx === index ? updatedSetting : item,
      ),
    }));
  };

  const handleAddOption = () => {
    setNewOptions([...newOptions, { value: "", label: "" }]);
  };

  const handleRemoveOption = (idx) => {
    const updatedOptions = newOptions.filter((_, index) => index !== idx);
    setNewOptions(updatedOptions);

    setSchema((prevSchema) => ({
      ...prevSchema,
      settings: prevSchema.settings.map((item) => {
        if (item.id === setting.id) {
          return {
            ...item,
            options: updatedOptions,
          };
        }
        return item;
      }),
    }));
  };

  const handleOptionChange = (idx, field, value) => {
    const updatedOptions = [...newOptions];
    updatedOptions[idx] = {
      ...updatedOptions[idx],
      [field]: value,
    };

    setNewOptions(updatedOptions);

    setSchema((prevSchema) => {
      const updatedSettings = prevSchema.settings.map((item) => {
        if (item.id === setting.id) {
          return {
            ...item,
            options: updatedOptions,
          };
        }
        return item;
      });

      const res = {
        ...prevSchema,
        settings: updatedSettings,
      };

      return res;
    });
  };

  /* return */

  return (
    <div
      ref={(node) => drag(drop(node))}
      style={{ opacity: isDragging ? 0.5 : 1 }}
      className="setting-container">
      <div className="editor-buttons">
        <button
          className="editor-button editor-button--remove"
          onClick={() => removeSetting(index, setSchema)}>
          X
        </button>
      </div>
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
              value={setting.label}
              onChange={(e) => handleInputChange("label", e.target.value)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              autoFocus
              className="inline-input"
            />
          ) : (
            <span>{setting.label || "Untitled Setting"}</span>
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

        {SCHEMA_TYPES.find(
          (schema) => schema.type === setting.type,
        )?.options.map((option) => {
          const uniqueKey = `${option}-${setting.type}-${
            setting.id || Date.now()
          }`;

          if (
            option === "content" &&
            (setting.type === "paragraph" || setting.type === "header")
          ) {
            return (
              <input
                key={uniqueKey}
                type="text"
                value={setting.content}
                onChange={(e) => handleInputChange("content", e.target.value)}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                placeholder="Content"
                className="input-field"
              />
            );
          }

          if (option === "default" && setting.type === "color") {
            return (
              <div key={uniqueKey}>
                <SketchPicker
                  color={newColor}
                  onChangeComplete={(color) =>
                    handleInputChange("default", color.hex)
                  }
                  className="input-field"
                />
                <input
                  type="text"
                  value={newColor}
                  onChange={(e) => handleInputChange("default", e.target.value)}
                  onBlur={() => handleInputChange("default", newColor)}
                  className="input-field"
                  placeholder="HEX Color"
                />
              </div>
            );
          }

          if (option === "default" && setting.type === "checkbox") {
            return (
              <div key={uniqueKey} className="checkbox-container">
                <label>
                  <input
                    type="checkbox"
                    checked={Boolean(setting.default)}
                    onChange={(e) =>
                      handleInputChange("default", e.target.checked)
                    }
                  />
                  Default Checked
                </label>
              </div>
            );
          }

          if (
            (option === "options" && setting.type === "select") ||
            (option === "options" && setting.type === "radio")
          ) {
            return (
              <div key={uniqueKey}>
                {newOptions.map((option, idx) => {
                  const optionKey = `${uniqueKey}-${idx}`;
                  return (
                    <div key={optionKey} className="editor-option-inputs">
                      <input
                        type="text"
                        value={option.value}
                        onChange={(e) =>
                          handleOptionChange(idx, "value", e.target.value)
                        }
                        placeholder="Value"
                        className="input-field"
                      />
                      <input
                        type="text"
                        value={option.label}
                        onChange={(e) =>
                          handleOptionChange(idx, "label", e.target.value)
                        }
                        placeholder="Label"
                        className="input-field"
                      />
                      <button
                        type="button"
                        className="remove-option"
                        onClick={() => handleRemoveOption(idx)}>
                        Remove
                      </button>
                    </div>
                  );
                })}

                {/* Add option button */}
                <button
                  type="button"
                  className="add-option"
                  onClick={handleAddOption}>
                  Add Option
                </button>
              </div>
            );
          }

          if (option === "min" || option === "max" || option === "step") {
            return (
              <input
                key={uniqueKey}
                type="number"
                value={setting[option]}
                onChange={(e) =>
                  handleInputChange(option, parseInt(e.target.value))
                }
                className="input-field"
                placeholder={option.charAt(0).toUpperCase() + option.slice(1)}
              />
            );
          }

          if (
            option === "default" &&
            (setting.type === "select" || setting.type === "radio")
          ) {
            return (
              <select
                key={uniqueKey}
                value={setting.default || ""}
                onChange={(e) => handleInputChange("default", e.target.value)}
                className="input-field">
                {newOptions.map((option, idx) => (
                  <option key={`${uniqueKey}-${idx}`} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            );
          }

          if (option === "default") {
            return (
              <input
                key={uniqueKey}
                type={setting.type === "range" ? "number" : "text"}
                value={setting.default}
                onChange={(e) =>
                  handleInputChange(
                    "default",
                    setting.type === "range"
                      ? parseFloat(e.target.value)
                      : e.target.value,
                  )
                }
                className="input-field"
                placeholder="Default"
              />
            );
          }

          if (option === "unit") {
            return (
              <input
                key={uniqueKey}
                type="text"
                value={setting.unit}
                onChange={(e) => handleInputChange("unit", e.target.value)}
                className="input-field"
                placeholder="Unit"
                maxLength={3}
              />
            );
          }

          return (
            <input
              key={uniqueKey}
              type="text"
              value={setting[option]}
              onChange={(e) => handleInputChange(option, e.target.value)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              placeholder={option.charAt(0).toUpperCase() + option.slice(1)}
              className="input-field"
            />
          );
        })}
      </div>
    </div>
  );

  /* end */
}
