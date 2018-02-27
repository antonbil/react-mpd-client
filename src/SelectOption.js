import React from "react";

class SelectOption extends React.Component {
    constructor(props) {
        super(props);
        this.options=[];
        this.state = {value: '',options:this.options};

        this.handleSubmit = this.handleSubmit.bind(this);
        this.submitMessage="Select";
    }

    getSelectedOption(event){
        event.preventDefault();
        for (let i=0;i<this.options.length;i++){
            if (this.options[i].value)
                return this.options[i];
        }

    }

    handleSubmit(event) {
        event.preventDefault();
    }

    render() {
        return (
            <form onSubmit={this.handleSubmit}>
                { this.options.map((option, index) => (
                    <div className="checkbox" key={index}>
                        <label>
                            <input type="checkbox"
                                   name={`${name}[${index}]`}
                                   value={option.name}
                                   checked={option.value}
                                   onChange={event => {
                                       let current=0;
                                       for (let i=0;i<this.options.length;i++){
                                           if (this.options[i].name===option.name)
                                               current=i;
                                       }
                                       for (let i=0;i<this.options.length;i++)
                                           this.options[i].value=false;
                                       let prevState=this.state;

                                       this.options[current].value=event.target.checked;
                                       prevState.options=this.options;
                                       this.setState(prevState);
                                       return false;
                                   }}/>
                            {option.name}
                        </label>
                    </div>))
                }
                <input type="submit" value={this.submitMessage} />
            </form>
        );
    }
}

export default SelectOption;