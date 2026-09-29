import { X } from "lucide-react";
import { useEffect, useState } from "react";

interface EditorPanelProps {
    selectedElement: {
        tagName: string;
        className: string;
        text: string;
        styles: {
            padding: string;
            margin: string;
            backgroundColor: string;
            color: string;
            fontSize: string;
        }
  };
  onUpdate: (updates:any) => void;
  onClose: () => void;
}

const EditorPanel = ({ selectedElement, onUpdate, onClose }: EditorPanelProps) => {

    const [values, setValues] = useState(selectedElement);
    
    useEffect(() => {
        setValues(selectedElement)
    }, [selectedElement])
    if (!selectedElement || !values) return null
    

    const handleChange = (field:string, value:string)=> {
        const newValues = { ...values, [field]: value };
        if (field in values.styles) {
            newValues.styles = { ...values.styles, [field]: value };
        }
        setValues(newValues);
        onUpdate({[field]: value});
    }

    const handleStyleChange = (styleName: string, value: string) => {
        const newValues = { 
            ...values, 
            styles: { ...values.styles, [styleName]: value } 
        };
        setValues(newValues);
        onUpdate({styles: {[styleName]:value}});
    }
    return (
      <div
        className="absolute top-4 right-4 w-80 bg-white text-gray-900 rounded-lg shadow-xl
        border border-gray-200 p-4 z-50 animate-fade-in fade-in"
      >
        {/* Header Part */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-gray-800">Edit Element</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-200 rounded-full cursor-pointer"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
        {/* Text Content */}
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Text Content
            </label>
            <textarea
              value={values.text || ""}
              onChange={(e) => handleChange("text", e.target.value)}
              className="w-full text-sm text-gray-800 p-2 border border-gray-400 rounded-md 
                        focus:ring-2 focus:ring-indigo-500 outline-none min-h-20"
            />
          </div>
          {/* ClassName */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              ClassName
            </label>
            <input
              type="text"
              value={values.className || ""}
              onChange={(e) => handleChange("className", e.target.value)}
              className="w-full text-sm text-gray-800 p-2 border border-gray-400 rounded-md 
                        focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          {/* Padding */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Padding
              </label>
              <input
                type="text"
                value={values.styles?.padding || ""}
                onChange={(e) => handleStyleChange("padding", e.target.value)}
                className="w-full text-sm text-gray-800 p-2 border border-gray-400 rounded-md 
                        focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            {/* Margin */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Margin
              </label>
              <input
                type="text"
                value={values.styles?.margin || ""}
                onChange={(e) => handleStyleChange("margin", e.target.value)}
                className="w-full text-sm text-gray-800 p-2 border border-gray-400 rounded-md 
                        focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>
          {/* FontSize */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                FontSize
              </label>
              <input
                type="text"
                value={values.styles?.fontSize || ""}
                onChange={(e) => handleStyleChange("fontSize", e.target.value)}
                className="w-full text-sm text-gray-800 p-2 border border-gray-400 rounded-md 
                        focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>
          {/* Background editor*/}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Background
              </label>
              <div
                className="flex items-center gap-2 border border-gray-400 
              rounded-md p-1"
              >
                <input
                  type="color"
                  value={
                    values.styles?.backgroundColor === "rgba(0,0,0,0,0)"
                      ? "#ffffff"
                      : values.styles?.backgroundColor || "#ffffff"
                  }
                  onChange={(e) =>
                    handleStyleChange("backgroundColor", e.target.value)
                  }
                  className="w-6 h-6 cursor-pointer"
                />
                <span className="text-xs text-gray-600 truncate">
                  {values.styles?.backgroundColor}
                </span>
              </div>
            </div>
            {/* Text Color */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Text Color
              </label>
              <div
                className="flex items-center gap-2 border border-gray-400 
              rounded-md p-1"
              >
                <input
                  type="color"
                  value={values.styles?.color || "#000000"}
                  onChange={(e) => handleStyleChange("color", e.target.value)}
                  className="w-6 h-6 cursor-pointer"
                />
                <span className="text-xs text-gray-600 truncate">
                  {values.styles?.color}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
}   

export default EditorPanel;