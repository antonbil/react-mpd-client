/*CommonList*/
import React from "react";

class CommonList extends React.Component {
    constructor(props) {
        super(props);
        this.selection=-1;
        this.state = {
            items: []
        };
        this.listStyle = {
            border: '3px solid #ddd',
            'list-style-type': 'none',
            display: 'block',
            padding: '10px'
        };
        this.handleClick = this.handleClick.bind(this);
        this.contextMenu = this.contextMenu.bind(this);

    }
    handleClick(index) {
    };
    contextMenu (e) {
        e.preventDefault();
    };
}

export default CommonList ;