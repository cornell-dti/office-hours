import * as React from "react";

import {createContext, useCallback,useContext, useState} from "react";
import { Confirm } from "semantic-ui-react";

const ConfirmationContext = createContext({
    openConfirm: (() => {}) as (properties: ConfirmProperties) => void
});

interface ConfirmProperties {
    header?: string;
    content: string;
    callback: (confirmed: boolean) => void;
}

export const useConfirm = () => {
    const { openConfirm } = useContext(ConfirmationContext);
  
    const confirm = ({ header, content }: {
        header?: string;
        content: string;
    }) =>
        new Promise<void>((res, rej) => {
            openConfirm({ 
                callback(confirmed) {
                    if (confirmed) {
                        res();
                    } else {
                        rej(new Error("Did not confirm."));
                    }
                },
                header,
                content
            });
        });
  
    return { confirm };
};

const ConfirmationProvider: React.FunctionComponent = ({ children }) => {
    const [open, setOpen] = useState(false);
    const [header, setHeader] = useState<string | undefined>(undefined);
    const [[callback], setCallback] = useState<[(confirmed: boolean) => void]>([() => {}]);
    const [content, setContent] = useState<string | undefined>(undefined);

    const openConfirm = useCallback((properties: ConfirmProperties) => {
        setOpen(true);

        setCallback([properties.callback]);
        setHeader(properties.header);
        setContent(properties.content);
    }, []);

    const clear = useCallback(() => {
        setHeader(undefined);
        setContent(undefined);
    }, []);

    return (
        <ConfirmationContext.Provider value={{ openConfirm }}>
            <Confirm
                header={header}
                content={content}
                open={open}
                onCancel={
                    () => {
                        setOpen(false);

                        callback(false);

                        clear();
                    }
                }
                onConfirm={
                    () => {
                        setOpen(false);

                        callback(true);

                        clear();
                    }
                }
            />
            {children}
        </ConfirmationContext.Provider>
    );
};

export default ConfirmationProvider;
