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
  const [newLabel, setNewLabel] = useState(setting.label || "");
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
    setNewLabel(setting.label || "");
    setNewId(setting.id || "");
    setNewColor(setting.default || "#000000");
    setNewDefault(setting.default || "");
    setNewInfo(setting.info || "");
    setNewOptions(setting.options || [{ value: "", label: "" }]);
  }, [setting]);

  useEffect(() => {
    // Update the schema JSON in real-time
    // You can send this data to a server or update local storage or anything else
    const updatedSchema = { ...schema, settings: [...schema.settings] };
    console.log("Updated schema in real-time: ", updatedSchema);
    // You could save this to a local file or update an API endpoint here if needed
    // Example: saveToLocalStorage(updatedSchema);
  }, [schema.settings]); // Dependency array to trigger when schema.settings is updated

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
    if (setting.type === "select") {
      // Ensure the updated options are passed back to the parent schema
      handleInputChange("options", newOptions);
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

    if (newType === "color") {
      const updatedSetting = {
        type: "color",
        id: setting.id || `color-setting-${Date.now()}`,
        label: setting.label || "Color Setting",
        default: setting.default || "#000000",
      };
      setSchema((prevSchema) => ({
        ...prevSchema,
        settings: prevSchema.settings.map((item, idx) =>
          idx === index ? updatedSetting : item,
        ),
      }));
    } else if (newType === "paragraph" || newType === "header") {
      const updatedSetting = {
        type: newType,
        content: setting.content || "",
      };
      setSchema((prevSchema) => ({
        ...prevSchema,
        settings: prevSchema.settings.map((item, idx) =>
          idx === index ? updatedSetting : item,
        ),
      }));
    } else if (newType === "select") {
      const updatedSetting = {
        type: "select",
        id: setting.id || `select-setting-${Date.now()}`,
        label: setting.label || "Select Setting",
        options: setting.options || [{ value: "", label: "" }],
      };
      setSchema((prevSchema) => ({
        ...prevSchema,
        settings: prevSchema.settings.map((item, idx) =>
          idx === index ? updatedSetting : item,
        ),
      }));
    } else {
      const updatedSetting = {
        type: newType,
        id: setting.id || `setting-${Date.now()}`,
        label: setting.label || "Setting",
        default: setting.default || "",
      };
      setSchema((prevSchema) => ({
        ...prevSchema,
        settings: prevSchema.settings.map((item, idx) =>
          idx === index ? updatedSetting : item,
        ),
      }));
    }
  };

  const handleAddOption = () => {
    setNewOptions([...newOptions, { value: "", label: "" }]);
  };

  const handleRemoveOption = (idx) => {
    const updatedOptions = newOptions.filter((_, index) => index !== idx);
    setNewOptions(updatedOptions);

    // Update the schema to reflect the removal of the option
    setSchema((prevSchema) => ({
      ...prevSchema,
      settings: prevSchema.settings.map((item) => {
        if (item.id === setting.id) {
          // Update only the options for the setting being edited
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
    // Create a copy of the options array
    const updatedOptions = [...newOptions];

    // Update the correct option's field
    updatedOptions[idx] = {
      ...updatedOptions[idx],
      [field]: value, // Set either value or label depending on the field
    };

    // Update newOptions state
    setNewOptions(updatedOptions);

    // Also update schema.settings options directly

    setSchema((prevSchema) => {
      const updatedSettings = prevSchema.settings.map((item) => {
        if (item.id === setting.id) {
          return {
            ...item,
            options: updatedOptions, // Update the options for the setting with the matching ID
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

  return (
    <div
      ref={(node) => drag(drop(node))}
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
          onKeyPress={(e) => handleKeyPress(e, "id")} // Block spacebar for "id"
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
        {setting.type === "select" && (
          <>
            {newOptions.map((option, idx) => (
              <div key={idx} className="editor-option-inputs">
                <input
                  type="text"
                  value={option.value}
                  onChange={(e) =>
                    handleOptionChange(idx, "value", e.target.value)
                  } // Updates the value field
                  placeholder="Value"
                  className="input-field"
                  onKeyPress={(e) => handleKeyPress(e, "option-value")} // Block spacebar for "option-value"
                />
                <input
                  type="text"
                  value={option.label}
                  onChange={(e) =>
                    handleOptionChange(idx, "label", e.target.value)
                  } // Updates the label field
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
            ))}
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
