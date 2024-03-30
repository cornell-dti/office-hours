// can generalize zoomlink editor in sessioninformationheader and location editor in sessionquestion.tsx to the following logic..
// LocationEditor.tsx
import React, { useState } from 'react';

interface LocationEditorProps {
  location: string;
  isTa: boolean;
  onLocationChange: (newLocation: string) => void;
}

const LocationEditor = ({ location, isTa, onLocationChange }: LocationEditorProps) => {
  const [editMode, setEditMode] = useState(false);
  const [localLocation, setLocalLocation] = useState(location);

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalLocation(e.target.value);
  };

  const handleSave = () => {
    onLocationChange(localLocation);
    setEditMode(false);
  };

  const handleCancel = () => {
    setLocalLocation(location); // Reset to initial value
    setEditMode(false);
  };

  return (
    <div>
      {editMode ? (
        <div>
          <input type="text" value={localLocation} onChange={handleLocationChange} />
          <button onClick={handleSave}>Save</button>
          <button onClick={handleCancel}>Cancel</button>
        </div>
      ) : (
        <>
          <span>{location}</span>
          {isTa && <button onClick={() => setEditMode(true)}>Update Location</button>}
        </>
      )}
    </div>
  );
};

export default LocationEditor;
