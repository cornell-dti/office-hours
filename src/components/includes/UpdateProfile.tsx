import React, { useEffect } from 'react'
import { Button, Modal, Input } from 'semantic-ui-react'

interface Props {
    zoom: boolean;
    virtualLocation?: string;
    onUpdate: (virtualLocation: string) => void;
}

const UpdateProfile: React.FC<Props> = ({ virtualLocation, zoom, onUpdate }) => {
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
            trigger={<Button className="VirtualLocationButton">
                {zoom ? 'Update Your Zoom Link' : 'Update Your Virtual Location'}
            </Button>}
        >
            <Modal.Header>{zoom ? 'Please enter a new Zoom link' : 'Update Virtual Location'}</Modal.Header>
            <Modal.Content image>
                <Modal.Description>
                    <p>{zoom ? '' : 'Please enter a new virtual location ' +
                            '(e.g. Zoom Link, Google Meet). ' +
                            'This only updates your link, other TAs will need to set their own link.'}</p>
                </Modal.Description>
                <Input style={{'width': '100%'}} value={link} onChange={(e) => setLink(e.target.value)} />
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