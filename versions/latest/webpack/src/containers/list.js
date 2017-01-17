import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { fetchSidebar } from '../actions/index';

class List extends Component {

    constructor(props){
        super(props);
        this.state = { list_items: [] };
    }

    componentDidMount(){
        this.props.fetchSidebar('toc.json');
        this.set
    }

    render() {
        return (
            <div>
                Testing
            </div>
        )
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({ fetchSidebar }, dispatch);
}

export default connect(null, mapDispatchToProps)(List);