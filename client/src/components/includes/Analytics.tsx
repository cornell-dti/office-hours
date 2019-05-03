import { useEffect } from 'react';
import * as ReactGA from 'react-ga';

// Adapted from https://github.com/react-ga/react-ga/issues/122

const sendPageChange = (pathname: string, search: string = '') => {
    const page = pathname + search;
    ReactGA.set({ page });
    ReactGA.pageview(page);
};

const Analytics = (props: {
    location: {
        pathname: string;
        search: string;
    };
}) => {
    useEffect(() => {
        sendPageChange(props.location.pathname, props.location.search);
        console.log('firing analytics');
    }, [props.location.pathname, props.location.search]);
    return null;
};

export default Analytics;
