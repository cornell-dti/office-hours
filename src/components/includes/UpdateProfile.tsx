import React, { useEffect } from 'react'
import { Button, Modal, Input } from 'semantic-ui-react'

interface Props {
    virtualLocation?: string;
    onUpdate: (virtualLocation: string) => void;
}

const UpdateProfile: React.FC<Props> = ({ virtualLocation, onUpdate }) => {
    const [open, setOpen] = React.useState(false);
    const [link, setLink] = React.useState('');

    useEffect(() => {
        if (typeof virtualLocation === 'string') {
            setLink(virtualLocation);
        }
    }, [virtualLocation]);

    return (
        <Modal
            onClose={() => setOpen(false)}
            onOpen={() => setOpen(true)}
            open={open}
            trigger={<Button className="VirtualLocationButton">Update Virtual Location</Button>}
        >
            <Modal.Header>Update Virtual Location</Modal.Header>
            <Modal.Content image>
                <div>
                    <Modal.Description>
                        <p>Please enter a new virtual location (e.g. Zoom Link, Google Meet)</p>
                    </Modal.Description>
                    <Input value={link} onChange={(e) => setLink(e.target.value)} />
                </div>
            </Modal.Content>
            <Modal.Actions>
                <Button onClick={() => setOpen(false)}>Cancel</Button>
                <Button
                    onClick={() => {
                        onUpdate(link);
                        setOpen(false)
                    }}
                    positive
                >
                    Update
                </Button>
            </Modal.Actions>
        </Modal>
    )
}

export default UpdateProfile;