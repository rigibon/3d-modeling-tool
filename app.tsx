import React, { useState, useEffect } from "react";
import { main } from "./entry";
import "./styles.css";
import Spinner from "react-bootstrap/Spinner";

export function App(props: any) {
    const searchParams = new URLSearchParams(document.location.search);
    const [loading, setLoading] = useState(true);

    var canvasRef: any;

    canvasRef = React.createRef();

    useEffect(() => {
        var modelName = searchParams.get("model");
        main(canvasRef.current, modelName);
    });

    return (
        <>
            {/* {loading === false ? ( */}
            <canvas
                id="c"
                width="1366"
                height="768"
                ref={canvasRef}
                tabIndex={0}
            ></canvas>
        </>
    );
}

export class Apps extends React.Component {
    canvasRef: any;

    constructor(props: any) {
        super(props);
        this.canvasRef = React.createRef();
    }

    componentDidMount() {
        // main(this.canvasRef.current);
    }

    render() {
        const [loading, setLoading] = useState(true);

        useEffect(() => {
            setTimeout(() => setLoading(false), 5000);
        }, []);

        return (
            <>
                {loading === false} ? (
                <canvas
                    id="c"
                    width="1366"
                    height="768"
                    ref={this.canvasRef}
                    tabIndex={0}
                ></canvas>
                ) : (
                <Spinner />)
            </>
        );
    }
}

export default App;
