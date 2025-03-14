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
import { SortableList } from "./SortableList";

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
              <div className="editor-controls">
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
