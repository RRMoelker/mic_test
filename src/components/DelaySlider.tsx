import React, {FunctionComponent} from 'react';
import {Grid, makeStyles, Slider, Typography} from "@material-ui/core";

const useStyles = makeStyles({
    root: {
        width: 250,
    },
});

type Props = {
    minDelay: number,
    maxDelay: number,
    delay: number,
    setDelay: (value: number) => void,
    disabled: boolean,
};

const DelaySlider: FunctionComponent<Props> = (props) => {
    const classes = useStyles();
    const minValue = props.minDelay;
    const maxValue = props.maxDelay;

    const handleSliderChange = (event: any, newValue: number | number[]) => {
        props.setDelay(newValue as number);
    };

    return <div className={classes.root}>
        <Typography id="input-slider" gutterBottom>
            Delay
        </Typography>
        <Grid container spacing={2} alignItems="center">
            <Grid item xs>
                <Slider
                    value={typeof props.delay === 'number' ? props.delay : 0}
                    onChange={handleSliderChange}
                    getAriaValueText={(value) => `${value} seconds`}
                    valueLabelDisplay="off"
                    step={1}
                    marks
                    min={minValue}
                    max={maxValue}
                    disabled={props.disabled}
                />
            </Grid>
            <Grid item>
                {props.delay}s
            </Grid>
        </Grid>
    </div>
}

export default DelaySlider;