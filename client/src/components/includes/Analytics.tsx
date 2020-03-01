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

    componentDidUpdate(prevProps: AnalyticsProps) {
        // When props change, check if the URL has changed or not
        if (this.props.location.pathname !== prevProps.location.pathname
            || this.props.location.search !== prevProps.location.search) {
            this.sendPageChange(this.props.location.pathname, this.props.location.search);
        }
    }

    sendPageChange(pathname: string, search = '') {
        const page = pathname + search;
        ReactGA.set({ page });
        ReactGA.pageview(page);
    }

    render() {
        return null;
    }
}
