import { SortableItem } from "./SortableItem";

export function SortableList({
  items,
  schema,
  setSchema,
  collapsed,
  setCollapsed,
}) {
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
