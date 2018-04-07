import React, { Component } from 'react';
var classNames = require('classnames');


class Loader extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false
        };
        this.setLoading = this.setLoading.bind(this);
    }

    componentDidMount() {
        window.addEventListener('loader', this.setLoading, false);
    }

    componentWillUnmount() {
        window.removeEventListener('loader', this.setLoading, false);
    }

    setLoading(evt) {
        this.setState({
            loading: evt.detail
        });
    }

    render() {
        let loaderStyles = classNames({
            'hidden': this.state.loading
        });

        return(
            <div>
                <div className={loaderStyles} />
                {this.props.children}
            </div>
        )
    }
}

export default Loader;