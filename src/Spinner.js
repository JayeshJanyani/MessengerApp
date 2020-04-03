import React from 'react'
import { Loader, Dimmer } from 'semantic-ui-react'


function Spinner() {
    return (
        <div>
            <Dimmer active>
            <Loader size="huge" content={"Preparing chat"}/>
            </Dimmer>
        </div>
    )
}

export default Spinner
