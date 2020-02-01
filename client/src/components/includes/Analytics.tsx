import * as React from 'react';
import * as ReactGA from 'react-ga';

// Adapted from https://github.com/react-ga/react-ga/issues/122

interface AnalyticsProps {
    location: {
        pathname: string;
        search: string;
    };
}

export class Analytics extends React.Component {
    props!: AnalyticsProps;

    constructor(props: AnalyticsProps) {
        super(props);
        // Initial page load - only fired once
        this.sendPageChange(props.location.pathname, props.location.search);
    }

    componentWillReceiveProps(nextProps: AnalyticsProps) {
        // When props change, check if the URL has changed or not
        if (this.props.location.pathname !== nextProps.location.pathname
            || this.props.location.search !== nextProps.location.search) {
            this.sendPageChange(nextProps.location.pathname, nextProps.location.search);
        }
    }

    sendPageChange(pathname: string, search: string = '') {
        const page = pathname + search;
        ReactGA.set({ page });
        ReactGA.pageview(page);
    }

    render() {
        return null;
    }
}
