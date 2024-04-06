// can generalize zoomlink editor in sessioninformationheader and location editor in sessionquestion.tsx to the following logic..
// LocationEditor.tsx
import React, { useState } from 'react';

interface LocationEditorProps {
    location: string;
    isTa: boolean;
    onLocationChange: (newLocation: string) => void;
    session: FireSession;
}

const LocationEditor = ({ location, isTa, onLocationChange, session }: LocationEditorProps) => {
    const [editMode, setEditMode] = useState(false);
    const [localLocation, setLocalLocation] = useState(location);

    const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLocalLocation(e.target.value);
    };

    const handleSave = () => {
        onLocationChange(localLocation);
        if ('building' in session) {
            const [building, room] = localLocation.split(' ');
            // Assuming session is managed in a way that this update reflects in the parent component's state
            const updatedSession = { ...session, building, room: room || '' };
            // TODO- set session building and room to new values in firestore
            // setSession(updatedSession); // Replace setSession with the appropriate setter function for updating the session state
        }
        setEditMode(false);
    };

    const handleCancel = () => {
        setLocalLocation(location); // Reset to initial value
        setEditMode(false);
    };

    return (
        <div>
            {editMode ? (
                <div className="saveEdit">
                    <input type="text" value={localLocation} onChange={handleLocationChange} />
                    <button type="button" onClick={handleSave}>Save</button>
                    <button type="button" onClick={handleCancel}>Cancel</button>
                </div>
            ) : (
                <>
                    <span style={{ paddingRight: '14px', }} >{location}</span>
                    {isTa && <button type="button" onClick={() => setEditMode(true)}>Update Location</button>}
                </>
            )}
        </div>
    );
};

export default LocationEditor;
