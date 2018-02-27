/*VolumeSlider*/
import React , { Component } from 'react';
import Slider, { Range } from 'rc-slider';

class VolumeSlider extends Component {
    constructor(props, context) {
        super(props, context);
        let  volume=Math.round(mpd_client.getVolume()*100);
        this.state = {
            volume: volume
        }
    }

    handleOnChange  (value)  {
        value=Math.round(value);
        mpd_client.setVolume(value/100);
        this.setState({
            volume: value
        })
    }

    render() {
        let { volume } = this.state;
        return (
            <div>
                Volume:{volume}<br/>
                <Slider
                    value={volume}
                    orientation="horizontal"
                    onChange={ this.handleOnChange.bind(this)}
                /></div>
        )
    }
}

export default VolumeSlider;